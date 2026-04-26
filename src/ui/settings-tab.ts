import { App, PluginSettingTab, Setting } from 'obsidian';
import type { AIModelType } from '../models/settings';
import type MemosSyncPlugin from '../../main';
import { GEMINI_MODELS, OPENAI_MODELS, OLLAMA_MODELS, MODEL_DESCRIPTIONS } from '../services/ai-service';

export class MemosSyncSettingTab extends PluginSettingTab {
    plugin: MemosSyncPlugin;

    constructor(app: App, plugin: MemosSyncPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('Memos URL')
            .setDesc('Memos server base URL')
            .addText(text => text
                .setPlaceholder('https://demo.usememos.com/')
                .setValue(this.plugin.settings.memosApiUrl)
                .onChange(async (value) => {
                    this.plugin.settings.memosApiUrl = value.trim();
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Access token')
            .setDesc('Your memos API access token')
            .addText(text => text
                .setPlaceholder('Enter access token')
                .setValue(this.plugin.settings.memosAccessToken)
                .onChange(async (value) => {
                    this.plugin.settings.memosAccessToken = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Sync directory')
            .setDesc('Folder in Obsidian where memos content will be stored')
            .addText(text => text
                .setPlaceholder('Memos')
                .setValue(this.plugin.settings.syncDirectory)
                .onChange(async (value) => {
                    this.plugin.settings.syncDirectory = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Sync mode')
            .setDesc('Choose manual or automatic sync')
            .addDropdown(dropdown => dropdown
                .addOption('manual', 'Manual')
                .addOption('auto', 'Automatic')
                .setValue(this.plugin.settings.syncFrequency)
                .onChange(async (value: 'manual' | 'auto') => {
                    this.plugin.settings.syncFrequency = value;
                    await this.plugin.saveSettings();
                    // 重新渲染以显示/隐藏自动同步间隔设置
                    this.display();
                }));

        if (this.plugin.settings.syncFrequency === 'auto') {
            new Setting(containerEl)
                .setName('Sync interval')
                .setDesc('Interval between automatic syncs (minutes)')
                .addText(text => text
                    .setPlaceholder('30')
                    .setValue(String(this.plugin.settings.autoSyncInterval))
                    .onChange(async (value) => {
                        const interval = Number.parseInt(value, 10);
                        if (Number.isFinite(interval) && interval > 0) {
                            this.plugin.settings.autoSyncInterval = interval;
                            await this.plugin.saveSettings();
                        }
                    }));
        }

        new Setting(containerEl)
            .setName('Sync limit')
            .setDesc('Maximum number of memos to fetch per sync.')
            .addText(text => text
                .setPlaceholder('1000')
                .setValue(String(this.plugin.settings.syncLimit))
                .onChange(async (value) => {
                    const limit = Number.parseInt(value, 10);
                    if (Number.isFinite(limit) && limit > 0) {
                        this.plugin.settings.syncLimit = limit;
                        await this.plugin.saveSettings();
                    }
                }));

        new Setting(containerEl)
            .setName('Sync after date')
            .setDesc('Only sync memos created on or after this date (yyyy-mm-dd). Leave empty to sync all.')
            .addText(text => text
                .setPlaceholder('2024-01-01')
                .setValue(this.plugin.settings.syncAfter)
                .onChange(async (value) => {
                    this.plugin.settings.syncAfter = value.trim();
                    await this.plugin.saveSettings();
                }));

        // AI features
        new Setting(containerEl)
            .setName('Enable AI features')
            .setDesc('Toggle AI-enhanced processing')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.ai.enabled)
                .onChange(async (value) => {
                    this.plugin.settings.ai.enabled = value;
                    await this.plugin.saveSettings();
                    // 重新渲染以显示/隐藏相关设置
                    this.display();
                }));

        if (this.plugin.settings.ai.enabled) {
            // AI 模型选择
            new Setting(containerEl)
                .setName('AI model')
                .setDesc('Select the AI model provider')
                .addDropdown(dropdown => dropdown
                    .addOption('openai', 'OpenAI')
                    .addOption('gemini', 'Google Gemini')
                    .addOption('claude', 'Anthropic Claude')
                    .addOption('ollama', 'Ollama')
                    .setValue(this.plugin.settings.ai.modelType)
                    .onChange(async (value: AIModelType) => {
                        this.plugin.settings.ai.modelType = value;
                        await this.plugin.saveSettings();
                        // 重新渲染以显示/隐藏相关设置
                        this.display();
                    }));

            // 只有在选择非 Ollama 模型时显示 API 密钥设置
            if (this.plugin.settings.ai.modelType !== 'ollama') {
                new Setting(containerEl)
                    .setName('API key')
                    .setDesc('Your AI service API key')
                    .addText(text => text
                        .setPlaceholder('Enter API key')
                        .setValue(this.plugin.settings.ai.apiKey)
                        .onChange(async (value) => {
                            this.plugin.settings.ai.apiKey = value;
                            await this.plugin.saveSettings();
                        }));
            }

            // 显示特定模型的选项
            this.displayModelOptions(containerEl);

            // AI 功能选项
            new Setting(containerEl)
                .setName('Weekly digest')
                .setDesc('Automatically generate a weekly summary')
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.ai.weeklyDigest)
                    .onChange(async (value) => {
                        this.plugin.settings.ai.weeklyDigest = value;
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName('Auto tags')
                .setDesc('Automatically generate tags based on content')
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.ai.autoTags)
                    .onChange(async (value) => {
                        this.plugin.settings.ai.autoTags = value;
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName('Intelligent summary')
                .setDesc('Automatically generate content summaries')
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.ai.intelligentSummary)
                    .onChange(async (value) => {
                        this.plugin.settings.ai.intelligentSummary = value;
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName('Summary language')
                .setDesc('Select the language for generated summaries')
                .addDropdown(dropdown => dropdown
                    .addOption('zh', 'Chinese')
                    .addOption('en', 'English')
                    .addOption('ja', 'Japanese')
                    .addOption('ko', 'Korean')
                    .setValue(this.plugin.settings.ai.summaryLanguage)
                    .onChange(async (value: 'zh' | 'en' | 'ja' | 'ko') => {
                        this.plugin.settings.ai.summaryLanguage = value;
                        await this.plugin.saveSettings();
                    }));
        }
    }

    private displayModelOptions(containerEl: HTMLElement) {
        const modelType = this.plugin.settings.ai.modelType;

        if (modelType === 'gemini') {
            new Setting(containerEl)
                .setName('Gemini model')
                .setDesc('Select the Gemini model to use')
                .addDropdown(dropdown => {
                    // 添加所有模型选项
                    for (const [displayName, modelId] of Object.entries(GEMINI_MODELS)) {
                        dropdown.addOption(modelId, `${displayName} - ${MODEL_DESCRIPTIONS[modelId]}`);
                    }

                    // 设置当前值或默认值
                    const currentModel = this.plugin.settings.ai.modelName || GEMINI_MODELS['Gemini 1.5 Flash'];
                    dropdown.setValue(currentModel);

                    dropdown.onChange(async (value) => {
                        this.plugin.settings.ai.modelName = value;
                        await this.plugin.saveSettings();
                        // 重新渲染以显示/隐藏自定义模型输入框
                        this.display();
                    });
                });

            // If custom model is selected, show input
            if (this.plugin.settings.ai.modelName === 'custom') {
                new Setting(containerEl)
                    .setName('Custom model name')
                    .setDesc('Enter the name of the custom model')
                    .addText(text => text
                        .setPlaceholder('E.g. Gemini-pro-latest')
                        .setValue(this.plugin.settings.ai.customModelName)
                        .onChange(async (value) => {
                            this.plugin.settings.ai.customModelName = value;
                            await this.plugin.saveSettings();
                        }));
            }
        } else if (modelType === 'openai') {
            new Setting(containerEl)
                .setName('OpenAI model')
                .setDesc('Select the OpenAI model to use')
                .addDropdown(dropdown => {
                    // 添加所有模型选项
                    for (const [displayName, modelId] of Object.entries(OPENAI_MODELS)) {
                        dropdown.addOption(modelId, `${displayName} - ${MODEL_DESCRIPTIONS[modelId]}`);
                    }

                    // 设置当前值或默认值
                    const currentModel = this.plugin.settings.ai.modelName || OPENAI_MODELS['GPT-4o'];
                    dropdown.setValue(currentModel);

                    dropdown.onChange(async (value) => {
                        this.plugin.settings.ai.modelName = value;
                        await this.plugin.saveSettings();
                        // 重新渲染以显示/隐藏自定义模型输入框
                        this.display();
                    });
                });

            // If custom model is selected, show input
            if (this.plugin.settings.ai.modelName === 'custom') {
                new Setting(containerEl)
                    .setName('Custom model name')
                    .setDesc('Enter the name of the custom model')
                    .addText(text => text
                        .setPlaceholder('E.g. GPT-4-1106-preview')
                        .setValue(this.plugin.settings.ai.customModelName)
                        .onChange(async (value) => {
                            this.plugin.settings.ai.customModelName = value;
                            await this.plugin.saveSettings();
                        }));

				new Setting(containerEl)
					.setName('OpenAI API base URL')
					.setDesc('Base URL for custom API services')
					.addText(text => text
					.setPlaceholder('HTTPS://api.OpenAI.com/v1')
						.setValue(this.plugin.settings.ai.openaiBaseUrl || 'https://api.openai.com/v1')
						.onChange(async (value) => {
							this.plugin.settings.ai.openaiBaseUrl = value;
							await this.plugin.saveSettings();
						}));
            }

        } else if (modelType === 'claude') {
            new Setting(containerEl)
                .setName('Claude model')
                .setDesc('Select the Claude model to use')
                .addDropdown(dropdown => {
                    dropdown.addOption('claude-3-opus-20240229', 'Claude 3 opus')
                        .addOption('claude-3-sonnet-20240229', 'Claude 3 sonnet')
                        .addOption('claude-3-haiku-20240307', 'Claude 3 haiku')
                        .addOption('custom', 'Custom model');

                    const currentModel = this.plugin.settings.ai.modelName || 'claude-3-opus-20240229';
                    dropdown.setValue(currentModel);

                    dropdown.onChange(async (value) => {
                        this.plugin.settings.ai.modelName = value;
                        await this.plugin.saveSettings();
                        this.display();
                    });
                });

            if (this.plugin.settings.ai.modelName === 'custom') {
                new Setting(containerEl)
                    .setName('Custom model name')
                    .setDesc('Enter the name of the custom model')
                    .addText(text => text
                        .setPlaceholder('E.g. Claude-3-opus-next')
                        .setValue(this.plugin.settings.ai.customModelName)
                        .onChange(async (value) => {
                            this.plugin.settings.ai.customModelName = value;
                            await this.plugin.saveSettings();
                        }));
            }
        } else if (modelType === 'ollama') {
            // Ollama base URL
            new Setting(containerEl)
                .setName('Ollama base URL')
                .setDesc('Base URL for the ollama service (default: http://localhost:11434)')
                .addText(text => text
                    .setPlaceholder('HTTP://localhost:11434')
                    .setValue(this.plugin.settings.ai.ollamaBaseUrl)
                    .onChange(async (value) => {
                        this.plugin.settings.ai.ollamaBaseUrl = value;
                        await this.plugin.saveSettings();
                    }));

            // Ollama model selection
            new Setting(containerEl)
                .setName('Ollama model')
                .setDesc('Select the ollama model to use')
                .addDropdown(dropdown => {
                    // 添加所有模型选项
                    for (const [displayName, modelId] of Object.entries(OLLAMA_MODELS)) {
                        if (typeof modelId === 'string') {
                            dropdown.addOption(modelId, `${displayName} - ${MODEL_DESCRIPTIONS[modelId] || modelId}`);
                        }
                    }

                    // 设置当前值或默认值
                    const defaultModel = OLLAMA_MODELS['Llama 2'] as string;
                    const currentModel = this.plugin.settings.ai.modelName || defaultModel;
                    dropdown.setValue(currentModel);

                    dropdown.onChange(async (value) => {
                        this.plugin.settings.ai.modelName = value;
                        await this.plugin.saveSettings();
                        this.display();
                    });
                });

            // If custom model is selected, show input
            if (this.plugin.settings.ai.modelName === 'custom') {
                new Setting(containerEl)
                    .setName('Custom model name')
                    .setDesc('Enter the name of the custom model')
                    .addText(text => text
                        .setPlaceholder('E.g. Llama2:13b')
                        .setValue(this.plugin.settings.ai.customModelName)
                        .onChange(async (value) => {
                            this.plugin.settings.ai.customModelName = value;
                            await this.plugin.saveSettings();
                        }));
            }
        }
    }
}
