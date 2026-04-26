// Memos v0.21 API types

export type RowStatus = 'NORMAL' | 'ARCHIVED' | 'DELETED';
export type Visibility = 'PRIVATE' | 'PROTECTED' | 'PUBLIC';
export type AIModelType = 'openai' | 'gemini' | 'claude' | 'ollama';

// v0.21 resource (attachment)
export interface MemoResource {
    id: number;
    filename: string;
    type: string;
    size: number;
    publicId?: string;
    externalLink?: string;
}

// v0.21 memo object returned by GET /api/v1/memo
export interface MemoItem {
    id: number;
    rowStatus: RowStatus;
    creatorId: number;
    createdTs: number;   // Unix timestamp in seconds
    updatedTs: number;   // Unix timestamp in seconds
    content: string;
    visibility: Visibility;
    pinned: boolean;
    resourceList: MemoResource[];
}

// AI settings (unchanged)
export interface AISettings {
    enabled: boolean;
    modelType: AIModelType;
    apiKey: string;
    modelName: string;
    customModelName: string;
    openaiBaseUrl: string;
    ollamaBaseUrl: string;
    weeklyDigest: boolean;
    autoTags: boolean;
    intelligentSummary: boolean;
    summaryLanguage: 'zh' | 'en' | 'ja' | 'ko';
}

// Plugin settings
export interface MemosPluginSettings {
    // Base URL of the Memos instance, e.g. https://demo.usememos.com/
    memosApiUrl: string;
    memosAccessToken: string;
    syncDirectory: string;
    syncFrequency: 'manual' | 'auto';
    autoSyncInterval: number;
    syncLimit: number;
    // Only sync memos created at or after this date (YYYY-MM-DD). Empty = no filter.
    syncAfter: string;
    ai: AISettings;
}

export const DEFAULT_SETTINGS: MemosPluginSettings = {
    memosApiUrl: '',
    memosAccessToken: '',
    syncDirectory: 'memos',
    syncFrequency: 'manual',
    autoSyncInterval: 30,
    syncLimit: 1000,
    syncAfter: '',
    ai: {
        enabled: false,
        modelType: 'openai',
        apiKey: '',
        modelName: 'gpt-4o',
        customModelName: '',
        openaiBaseUrl: 'https://api.openai.com/v1',
        ollamaBaseUrl: 'http://localhost:11434',
        weeklyDigest: true,
        autoTags: true,
        intelligentSummary: true,
        summaryLanguage: 'zh'
    }
};
