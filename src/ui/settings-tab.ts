import { App, PluginSettingTab, Setting } from 'obsidian';
import type { AIModelType, SummaryLanguage, UiLanguage } from '../models/settings';
import type MemosSyncPlugin from '../../main';
import { GEMINI_MODELS, OPENAI_MODELS, OLLAMA_MODELS, MODEL_DESCRIPTIONS } from '../services/ai-service';
import { t } from '../i18n';

export class MemosSyncSettingTab extends PluginSettingTab {
    plugin: MemosSyncPlugin;

    constructor(app: App, plugin: MemosSyncPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        const uiLanguage = this.plugin.settings.uiLanguage;
        const tr = (key: Parameters<typeof t>[1], vars?: Parameters<typeof t>[2]) => t(uiLanguage, key, vars);

        new Setting(containerEl)
            .setName(tr('settings.uiLanguage.name'))
            .setDesc(tr('settings.uiLanguage.desc'))
            .addDropdown(dropdown => dropdown
                .addOption('en-US', tr('language.en-US'))
                .addOption('zh-CN', tr('language.zh-CN'))
                .addOption('tr-TR', tr('language.tr-TR'))
                .addOption('ja-JP', tr('language.ja-JP'))
                .setValue(this.plugin.settings.uiLanguage)
                .onChange(async (value: UiLanguage) => {
                    this.plugin.settings.uiLanguage = value;
                    await this.plugin.saveSettings();
                    this.display();
                }));

        new Setting(containerEl)
            .setName(tr('settings.memosUrl.name'))
            .setDesc(tr('settings.memosUrl.desc'))
            .addText(text => text
                .setPlaceholder('https://demo.usememos.com/')
                .setValue(this.plugin.settings.memosApiUrl)
                .onChange(async (value) => {
                    this.plugin.settings.memosApiUrl = value.trim();
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(tr('settings.accessToken.name'))
            .setDesc(tr('settings.accessToken.desc'))
            .addText(text => text
                .setPlaceholder(tr('settings.placeholder.enterAccessToken'))
                .setValue(this.plugin.settings.memosAccessToken)
                .onChange(async (value) => {
                    this.plugin.settings.memosAccessToken = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(tr('settings.syncDirectory.name'))
            .setDesc(tr('settings.syncDirectory.desc'))
            .addText(text => text
                .setPlaceholder('Memos')
                .setValue(this.plugin.settings.syncDirectory)
                .onChange(async (value) => {
                    this.plugin.settings.syncDirectory = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(tr('settings.syncMode.name'))
            .setDesc(tr('settings.syncMode.desc'))
            .addDropdown(dropdown => dropdown
                .addOption('manual', tr('settings.syncMode.manual'))
                .addOption('auto', tr('settings.syncMode.auto'))
                .setValue(this.plugin.settings.syncFrequency)
                .onChange(async (value: 'manual' | 'auto') => {
                    this.plugin.settings.syncFrequency = value;
                    await this.plugin.saveSettings();
                    this.display();
                }));

        if (this.plugin.settings.syncFrequency === 'auto') {
            new Setting(containerEl)
                .setName(tr('settings.syncInterval.name'))
                .setDesc(tr('settings.syncInterval.desc'))
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
            .setName(tr('settings.syncLimit.name'))
            .setDesc(tr('settings.syncLimit.desc'))
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
            .setName(tr('settings.syncAfter.name'))
            .setDesc(tr('settings.syncAfter.desc'))
            .addText(text => text
                .setPlaceholder('2024-01-01')
                .setValue(this.plugin.settings.syncAfter)
                .onChange(async (value) => {
                    this.plugin.settings.syncAfter = value.trim();
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName(tr('settings.aiEnabled.name'))
            .setDesc(tr('settings.aiEnabled.desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.ai.enabled)
                .onChange(async (value) => {
                    this.plugin.settings.ai.enabled = value;
                    await this.plugin.saveSettings();
                    this.display();
                }));

        if (this.plugin.settings.ai.enabled) {
            new Setting(containerEl)
                .setName(tr('settings.aiModel.name'))
                .setDesc(tr('settings.aiModel.desc'))
                .addDropdown(dropdown => dropdown
                    .addOption('openai', 'OpenAI')
                    .addOption('gemini', 'Google Gemini')
                    .addOption('claude', 'Anthropic Claude')
                    .addOption('ollama', 'Ollama')
                    .setValue(this.plugin.settings.ai.modelType)
                    .onChange(async (value: AIModelType) => {
                        this.plugin.settings.ai.modelType = value;
                        await this.plugin.saveSettings();
                        this.display();
                    }));

            if (this.plugin.settings.ai.modelType !== 'ollama') {
                new Setting(containerEl)
                    .setName(tr('settings.apiKey.name'))
                    .setDesc(tr('settings.apiKey.desc'))
                    .addText(text => text
                        .setPlaceholder(tr('settings.placeholder.enterApiKey'))
                        .setValue(this.plugin.settings.ai.apiKey)
                        .onChange(async (value) => {
                            this.plugin.settings.ai.apiKey = value;
                            await this.plugin.saveSettings();
                        }));
            }

            this.displayModelOptions(containerEl, tr);

            new Setting(containerEl)
                .setName(tr('settings.weeklyDigest.name'))
                .setDesc(tr('settings.weeklyDigest.desc'))
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.ai.weeklyDigest)
                    .onChange(async (value) => {
                        this.plugin.settings.ai.weeklyDigest = value;
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName(tr('settings.autoTags.name'))
                .setDesc(tr('settings.autoTags.desc'))
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.ai.autoTags)
                    .onChange(async (value) => {
                        this.plugin.settings.ai.autoTags = value;
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName(tr('settings.intelligentSummary.name'))
                .setDesc(tr('settings.intelligentSummary.desc'))
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.ai.intelligentSummary)
                    .onChange(async (value) => {
                        this.plugin.settings.ai.intelligentSummary = value;
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName(tr('settings.summaryLanguage.name'))
                .setDesc(tr('settings.summaryLanguage.desc'))
                .addDropdown(dropdown => dropdown
                    .addOption('en-US', tr('language.en-US'))
                    .addOption('zh-CN', tr('language.zh-CN'))
                    .addOption('tr-TR', tr('language.tr-TR'))
                    .addOption('ja-JP', tr('language.ja-JP'))
                    .setValue(this.plugin.settings.ai.summaryLanguage)
                    .onChange(async (value: SummaryLanguage) => {
                        this.plugin.settings.ai.summaryLanguage = value;
                        await this.plugin.saveSettings();
                    }));
        }
    }

    private displayModelOptions(
        containerEl: HTMLElement,
        tr: (key: Parameters<typeof t>[1], vars?: Parameters<typeof t>[2]) => string
    ) {
        const modelType = this.plugin.settings.ai.modelType;

        if (modelType === 'gemini') {
            new Setting(containerEl)
                .setName(tr('settings.geminiModel.name'))
                .setDesc(tr('settings.geminiModel.desc'))
                .addDropdown(dropdown => {
                    for (const [displayName, modelId] of Object.entries(GEMINI_MODELS)) {
                        dropdown.addOption(modelId, `${displayName} - ${MODEL_DESCRIPTIONS[modelId]}`);
                    }

                    const currentModel = this.plugin.settings.ai.modelName || GEMINI_MODELS['Gemini 1.5 Flash'];
                    dropdown.setValue(currentModel);

                    dropdown.onChange(async (value) => {
                        this.plugin.settings.ai.modelName = value;
                        await this.plugin.saveSettings();
                        this.display();
                    });
                });

            if (this.plugin.settings.ai.modelName === 'custom') {
                new Setting(containerEl)
                    .setName(tr('settings.customModel.name'))
                    .setDesc(tr('settings.customModel.desc'))
                    .addText(text => text
                        .setPlaceholder('E.g. gemini-pro-latest')
                        .setValue(this.plugin.settings.ai.customModelName)
                        .onChange(async (value) => {
                            this.plugin.settings.ai.customModelName = value;
                            await this.plugin.saveSettings();
                        }));
            }
        } else if (modelType === 'openai') {
            new Setting(containerEl)
                .setName(tr('settings.openaiModel.name'))
                .setDesc(tr('settings.openaiModel.desc'))
                .addDropdown(dropdown => {
                    for (const [displayName, modelId] of Object.entries(OPENAI_MODELS)) {
                        dropdown.addOption(modelId, `${displayName} - ${MODEL_DESCRIPTIONS[modelId]}`);
                    }

                    const currentModel = this.plugin.settings.ai.modelName || OPENAI_MODELS['GPT-4o'];
                    dropdown.setValue(currentModel);

                    dropdown.onChange(async (value) => {
                        this.plugin.settings.ai.modelName = value;
                        await this.plugin.saveSettings();
                        this.display();
                    });
                });

            if (this.plugin.settings.ai.modelName === 'custom') {
                new Setting(containerEl)
                    .setName(tr('settings.customModel.name'))
                    .setDesc(tr('settings.customModel.desc'))
                    .addText(text => text
                        .setPlaceholder('E.g. gpt-4.1-mini')
                        .setValue(this.plugin.settings.ai.customModelName)
                        .onChange(async (value) => {
                            this.plugin.settings.ai.customModelName = value;
                            await this.plugin.saveSettings();
                        }));

                new Setting(containerEl)
                    .setName(tr('settings.openaiBaseUrl.name'))
                    .setDesc(tr('settings.openaiBaseUrl.desc'))
                    .addText(text => text
                        .setPlaceholder('https://api.openai.com/v1')
                        .setValue(this.plugin.settings.ai.openaiBaseUrl || 'https://api.openai.com/v1')
                        .onChange(async (value) => {
                            this.plugin.settings.ai.openaiBaseUrl = value;
                            await this.plugin.saveSettings();
                        }));
            }
        } else if (modelType === 'claude') {
            new Setting(containerEl)
                .setName(tr('settings.claudeModel.name'))
                .setDesc(tr('settings.claudeModel.desc'))
                .addDropdown(dropdown => {
                    dropdown.addOption('claude-3-opus-20240229', 'Claude 3 Opus')
                        .addOption('claude-3-sonnet-20240229', 'Claude 3 Sonnet')
                        .addOption('claude-3-haiku-20240307', 'Claude 3 Haiku')
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
                    .setName(tr('settings.customModel.name'))
                    .setDesc(tr('settings.customModel.desc'))
                    .addText(text => text
                        .setPlaceholder('E.g. claude-3-7-sonnet-latest')
                        .setValue(this.plugin.settings.ai.customModelName)
                        .onChange(async (value) => {
                            this.plugin.settings.ai.customModelName = value;
                            await this.plugin.saveSettings();
                        }));
            }
        } else if (modelType === 'ollama') {
            new Setting(containerEl)
                .setName(tr('settings.ollamaBaseUrl.name'))
                .setDesc(tr('settings.ollamaBaseUrl.desc'))
                .addText(text => text
                    .setPlaceholder('http://localhost:11434')
                    .setValue(this.plugin.settings.ai.ollamaBaseUrl)
                    .onChange(async (value) => {
                        this.plugin.settings.ai.ollamaBaseUrl = value;
                        await this.plugin.saveSettings();
                    }));

            new Setting(containerEl)
                .setName(tr('settings.ollamaModel.name'))
                .setDesc(tr('settings.ollamaModel.desc'))
                .addDropdown(dropdown => {
                    for (const [displayName, modelId] of Object.entries(OLLAMA_MODELS)) {
                        if (typeof modelId === 'string') {
                            dropdown.addOption(modelId, `${displayName} - ${MODEL_DESCRIPTIONS[modelId] || modelId}`);
                        }
                    }

                    const defaultModel = OLLAMA_MODELS['Llama 2'] as string;
                    const currentModel = this.plugin.settings.ai.modelName || defaultModel;
                    dropdown.setValue(currentModel);

                    dropdown.onChange(async (value) => {
                        this.plugin.settings.ai.modelName = value;
                        await this.plugin.saveSettings();
                        this.display();
                    });
                });

            if (this.plugin.settings.ai.modelName === 'custom') {
                new Setting(containerEl)
                    .setName(tr('settings.customModel.name'))
                    .setDesc(tr('settings.customModel.desc'))
                    .addText(text => text
                        .setPlaceholder('E.g. llama3.1:8b')
                        .setValue(this.plugin.settings.ai.customModelName)
                        .onChange(async (value) => {
                            this.plugin.settings.ai.customModelName = value;
                            await this.plugin.saveSettings();
                        }));
            }
        }
    }
}
