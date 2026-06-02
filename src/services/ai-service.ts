import type { GenerativeModel } from '@google/generative-ai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { requestUrl } from 'obsidian';
import type { SummaryLanguage } from '../models/settings';
import { Logger } from './logger';

export interface AIService {
    generateSummary(content: string, language?: SummaryLanguage): Promise<string>;
    generateTags(content: string, language?: SummaryLanguage): Promise<string[]>;
    generateWeeklyDigest(contents: string[], language?: SummaryLanguage): Promise<string>;
    initialize(apiKey: string, modelName?: string): Promise<void>;
}

export const GEMINI_MODELS = {
    'Gemini 1.5 Flash': 'gemini-1.5-flash',
    'Gemini 1.5 Flash-8B': 'gemini-1.5-flash-8b',
    'Gemini 1.5 Pro': 'gemini-1.5-pro',
    'Gemini 1.0 Pro': 'gemini-1.0-pro',
    'Text Embedding': 'text-embedding-004',
    'AQA': 'aqa',
    'Custom model': 'custom'
} as const;

export const OPENAI_MODELS = {
    'GPT-4o': 'gpt-4o',
    'GPT-4o (2024-11-20)': 'gpt-4o-2024-11-20',
    'GPT-4o Mini': 'gpt-4o-mini',
    'GPT-4o Mini (2024-07-18)': 'gpt-4o-mini-2024-07-18',
    'GPT-4o Realtime': 'gpt-4o-realtime-preview',
    'GPT-4o Realtime (2024-10-01)': 'gpt-4o-realtime-preview-2024-10-01',
    'ChatGPT-4o Latest': 'chatgpt-4o-latest',
    'Custom model': 'custom'
} as const;

export const OLLAMA_MODELS = {
    'Llama 2': 'llama2',
    'Mistral': 'mistral',
    'Mixtral': 'mixtral',
    'CodeLlama': 'codellama',
    'Phi': 'phi',
    'Neural Chat': 'neural-chat',
    'Custom model': 'custom'
} as const;

export const MODEL_DESCRIPTIONS = {
    'gemini-1.5-flash': 'Audio, image, video, and text',
    'gemini-1.5-flash-8b': 'Audio, image, video, and text',
    'gemini-1.5-pro': 'Audio, image, video, and text',
    'gemini-1.0-pro': 'Text (deprecated on 2025-02-15)',
    'text-embedding-004': 'Text',
    'aqa': 'Text',
    'custom': 'Custom model',
    'gpt-4o': 'Standard GPT-4o model with strong reasoning',
    'gpt-4o-2024-11-20': 'Stable November snapshot',
    'gpt-4o-mini': 'Lightweight and cost-effective',
    'gpt-4o-mini-2024-07-18': 'Stable mini model snapshot',
    'gpt-4o-realtime-preview': 'Realtime preview with latest features',
    'gpt-4o-realtime-preview-2024-10-01': 'Stable realtime snapshot',
    'chatgpt-4o-latest': 'Continuously updated ChatGPT model',
    'llama2': 'General-purpose open model',
    'mistral': 'High-performance open model',
    'mixtral': 'Mixture-of-experts model',
    'codellama': 'Code-focused generation model',
    'phi': 'Lightweight model',
    'neural-chat': 'Dialogue-optimized model'
} as const;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const SUMMARY_LANGUAGE_LABELS: Record<SummaryLanguage, string> = {
    'en-US': 'English (US)',
    'zh-CN': '简体中文',
    'tr-TR': 'Türkçe',
    'ja-JP': '日本語'
};

function createSummaryPrompt(content: string, language: SummaryLanguage = 'en-US'): string {
    const prompts: Record<SummaryLanguage, string> = {
        'en-US': `Summarize the key points of the following content in ${SUMMARY_LANGUAGE_LABELS[language]}:\n\n${content}`,
        'zh-CN': `请使用${SUMMARY_LANGUAGE_LABELS[language]}总结以下内容的要点：\n\n${content}`,
        'tr-TR': `Lutfen asagidaki icerigin ana noktalarini ${SUMMARY_LANGUAGE_LABELS[language]} dilinde ozetle:\n\n${content}`,
        'ja-JP': `次の内容の要点を${SUMMARY_LANGUAGE_LABELS[language]}で要約してください:\n\n${content}`
    };
    return prompts[language];
}

function createTagsPrompt(content: string, language: SummaryLanguage = 'en-US'): string {
    const prompts: Record<SummaryLanguage, string> = {
        'en-US': `Generate 3-5 relevant tags for the following content (without #):\n\n${content}`,
        'zh-CN': `请为以下内容生成 3-5 个相关标签（不要带 #）：\n\n${content}`,
        'tr-TR': `Asagidaki icerik icin 3-5 ilgili etiket uret ( # olmadan ):\n\n${content}`,
        'ja-JP': `次の内容に関連するタグを 3-5 個生成してください（# なし）:\n\n${content}`
    };
    return prompts[language];
}

function createWeeklyDigestPrompt(contents: string[], language: SummaryLanguage = 'en-US'): string {
    const combinedContent = contents.join('\n---\n');
    const prompts: Record<SummaryLanguage, string> = {
        'en-US': `Create a weekly report from the following content. Focus on:
1. Main work items and outcomes
2. Important updates and progress
3. Problems and solutions
4. Next week plan and outlook

Content:
${combinedContent}`,
        'zh-CN': `请根据以下内容生成一份周报，重点包括：
1. 主要工作内容和成果
2. 重要事项和进展
3. 问题和解决方案
4. 下周计划和展望

内容：
${combinedContent}`,
        'tr-TR': `Asagidaki icerikten haftalik rapor olustur. Sunlara odaklan:
1. Ana isler ve ciktilar
2. Onemli gelismeler ve ilerleme
3. Sorunlar ve cozumler
4. Gelecek hafta plani ve gorunum

Icerik:
${combinedContent}`,
        'ja-JP': `次の内容から週報を作成してください。次の点に注目してください:
1. 主な作業内容と成果
2. 重要事項と進捗
3. 課題と解決策
4. 来週の計画と見通し

内容:
${combinedContent}`
    };
    return prompts[language];
}

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = MAX_RETRIES,
    initialDelay: number = RETRY_DELAY
): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (error instanceof Error && error.message.includes('429')) {
                const delay = initialDelay * (2 ** i);
                await sleep(delay);
                continue;
            }
            if (i === maxRetries - 1) {
                throw error;
            }
            const delay = initialDelay * (2 ** i);
            await sleep(delay);
        }
    }
    throw new Error('Retry limit reached');
}

class GeminiService implements AIService {
    private model: GenerativeModel;
    private logger: Logger;

    constructor(apiKey: string, modelName?: string) {
        const genAI = new GoogleGenerativeAI(apiKey);
        this.model = genAI.getGenerativeModel({ model: modelName || GEMINI_MODELS['Gemini 1.5 Flash'] });
        this.logger = new Logger('GeminiService');
    }

    initialize(apiKey?: string, modelName?: string): Promise<void> {
        this.logger.debug('Gemini service initialized with model:', this.model);
        return Promise.resolve();
    }

    private handleRateLimit(error: Error, retryCount: number): number {
        const delay = Math.min(1000 * (2 ** retryCount), 30000);
        this.logger.warn(`Rate limited, retrying in ${delay}ms...`);
        return delay;
    }

    private handleError(error: Error, retryCount: number): number {
        const delay = Math.min(1000 * (2 ** retryCount), 30000);
        this.logger.error(`Operation failed, retrying in ${delay}ms...`, error);
        return delay;
    }

    async generateSummary(content: string, language: SummaryLanguage = 'en-US'): Promise<string> {
        const prompt = createSummaryPrompt(content, language);
        return retryWithBackoff(async () => {
            const result = await this.model.generateContent(prompt);
            const response = result.response;
            return response.text().trim();
        });
    }

    async generateTags(content: string, language: SummaryLanguage = 'en-US'): Promise<string[]> {
        const prompt = createTagsPrompt(content, language);
        return retryWithBackoff(async () => {
            const result = await this.model.generateContent(prompt);
            const response = result.response;
            return response.text().split(/[,，\s]+/).filter(Boolean);
        });
    }

    async generateWeeklyDigest(contents: string[], language: SummaryLanguage = 'en-US'): Promise<string> {
        const prompt = createWeeklyDigestPrompt(contents, language);

        return retryWithBackoff(async () => {
            const result = await this.model.generateContent(prompt);
            const response = result.response;
            return response.text().trim();
        });
    }
}

export class OpenAIService implements AIService {
    private client: OpenAI;
    private model: string;
    private encryptionKey: Uint8Array;
    private logger: Logger;

    private generateIV(): Uint8Array {
        return crypto.getRandomValues(new Uint8Array(12));
    }

    private async generateKey(): Promise<CryptoKey> {
        return crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256
            },
            true,
            ['encrypt', 'decrypt']
        );
    }

    private async encryptApiKey(apiKey: string): Promise<string> {
        const iv = this.generateIV();
        const key = await this.generateKey();
        const encodedText = new TextEncoder().encode(apiKey);

        const encryptedData = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv
            },
            key,
            encodedText
        );

        const encryptedArray = new Uint8Array(encryptedData);
        return `${this.arrayBufferToBase64(iv)}:${this.arrayBufferToBase64(encryptedArray)}:${this.arrayBufferToBase64(await crypto.subtle.exportKey('raw', key))}`;
    }

    private async decryptApiKey(encryptedKey: string): Promise<string> {
        const [ivStr, encryptedStr, keyStr] = encryptedKey.split(':');
        const iv = this.base64ToArrayBuffer(ivStr);
        const encryptedData = this.base64ToArrayBuffer(encryptedStr);
        const keyData = this.base64ToArrayBuffer(keyStr);

        const key = await crypto.subtle.importKey(
            'raw',
            keyData,
            'AES-GCM',
            true,
            ['decrypt']
        );

        const decryptedData = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            encryptedData
        );

        return new TextDecoder().decode(decryptedData);
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    private base64ToArrayBuffer(base64: string): Uint8Array {
        const binaryString = window.atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    constructor() {
        this.encryptionKey = crypto.getRandomValues(new Uint8Array(32));
        this.logger = new Logger('OpenAIService');
    }

    async initialize(apiKey?: string, modelName?: string, openaiBaseUrl?: string): Promise<void> {
        try {
            if (!apiKey) {
                throw new Error('API key is required');
            }

            if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
                throw new Error('Invalid API key format');
            }

            const encryptedKey = await this.encryptApiKey(apiKey);

            this.client = new OpenAI({
                apiKey: await this.decryptApiKey(encryptedKey),
                baseURL: openaiBaseUrl,
                dangerouslyAllowBrowser: true
            });

            try {
                await this.client.models.list();
            } catch {
                throw new Error('API key validation failed');
            }

            this.model = modelName || OPENAI_MODELS['GPT-4o'];
            this.logger.debug('OpenAI service initialized with model:', this.model);
        } catch (error) {
            this.logger.error('OpenAI service initialization failed:', error);
            throw error;
        }
    }

    async generateSummary(content: string, language: SummaryLanguage = 'en-US'): Promise<string> {
        const prompt = createSummaryPrompt(content, language);
        return retryWithBackoff(async () => {
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 500
            });
            return response.choices[0]?.message?.content?.trim() || '';
        });
    }

    async generateTags(content: string, language: SummaryLanguage = 'en-US'): Promise<string[]> {
        const prompt = createTagsPrompt(content, language);
        return retryWithBackoff(async () => {
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 100
            });
            const text = response.choices[0]?.message?.content || '';
            return text.split(/[,，\s]+/).filter(Boolean);
        });
    }

    async generateWeeklyDigest(contents: string[], language: SummaryLanguage = 'en-US'): Promise<string> {
        const prompt = createWeeklyDigestPrompt(contents, language);

        return retryWithBackoff(async () => {
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 1000
            });
            return response.choices[0]?.message?.content?.trim() || '';
        });
    }
}

class OllamaService implements AIService {
    private baseUrl: string;
    private model: string;
    private logger: Logger;

    constructor(baseUrl = 'http://localhost:11434', modelName?: string) {
        this.baseUrl = baseUrl;
        this.model = modelName || OLLAMA_MODELS['Llama 2'];
        this.logger = new Logger('OllamaService');
    }

    initialize(apiKey?: string, modelName?: string): Promise<void> {
        this.logger.debug('Ollama service initialized with model:', this.model);
        return Promise.resolve();
    }

    private handleRateLimit(error: Error, retryCount: number): number {
        const delay = Math.min(1000 * (2 ** retryCount), 30000);
        this.logger.warn(`Rate limited, retrying in ${delay}ms...`);
        return delay;
    }

    private handleError(error: Error, retryCount: number): number {
        const delay = Math.min(1000 * (2 ** retryCount), 30000);
        this.logger.error(`Operation failed, retrying in ${delay}ms...`, error);
        return delay;
    }

    private async generateCompletion(prompt: string): Promise<string> {
        try {
            const response = await requestUrl({
                url: `${this.baseUrl}/api/generate`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        top_p: 0.9,
                        max_tokens: 1000,
                    }
                })
            });

            if (response.status !== 200) {
                throw new Error(`Ollama API error: ${response.status}`);
            }

            const data = response.json;
            return data.response;
        } catch (error) {
            this.logger.error('Ollama API error:', error);
            throw error;
        }
    }

    async generateSummary(content: string, language: SummaryLanguage = 'en-US'): Promise<string> {
        const prompt = createSummaryPrompt(content, language);
        return retryWithBackoff(async () => {
            const response = await this.generateCompletion(prompt);
            return response.trim();
        });
    }

    async generateTags(content: string, language: SummaryLanguage = 'en-US'): Promise<string[]> {
        const prompt = createTagsPrompt(content, language);
        return retryWithBackoff(async () => {
            const response = await this.generateCompletion(prompt);
            return response.split(/[,，\s]+/).filter(Boolean);
        });
    }

    async generateWeeklyDigest(contents: string[], language: SummaryLanguage = 'en-US'): Promise<string> {
        const prompt = createWeeklyDigestPrompt(contents, language);

        return retryWithBackoff(async () => {
            const response = await this.generateCompletion(prompt);
            return response.trim();
        });
    }
}

export function createAIService(type: string, apiKey: string, modelName?: string, openaiBaseUrl?: string): AIService {
    const serviceType = type.toLowerCase();

    switch (serviceType) {
        case 'gemini': {
            const service = new GeminiService(apiKey, modelName);
            void service.initialize(apiKey, modelName);
            return service;
        }
        case 'openai': {
            const service = new OpenAIService();
            void service.initialize(apiKey, modelName, openaiBaseUrl);
            return service;
        }
        case 'ollama': {
            const service = new OllamaService(apiKey || 'http://localhost:11434', modelName);
            void service.initialize(apiKey, modelName);
            return service;
        }
        default: {
            const service = createDummyAIService();
            void service.initialize('', '');
            return service;
        }
    }
}

export function createDummyAIService(): AIService {
    const logger = new Logger('DummyAIService');
    return {
        generateSummary(): Promise<string> {
            logger.debug('Using dummy AI service');
            return Promise.resolve('');
        },
        generateTags(): Promise<string[]> {
            logger.debug('Using dummy AI service');
            return Promise.resolve([]);
        },
        generateWeeklyDigest(): Promise<string> {
            logger.debug('Using dummy AI service');
            return Promise.resolve('');
        },
        initialize(): Promise<void> {
            logger.debug('Initializing dummy AI service');
            return Promise.resolve();
        }
    };
}
