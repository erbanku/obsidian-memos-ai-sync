import { Plugin } from 'obsidian';
import type { MemosPluginSettings, UiLanguage } from 'src/models/settings';
import { DEFAULT_SETTINGS } from 'src/models/settings';
import { MemosSyncSettingTab } from 'src/ui/settings-tab';
import { MemosService } from 'src/services/memos-service';
import { FileService } from 'src/services/file-service';
import { ContentService } from 'src/services/content-service';
import { StatusService } from 'src/services/status-service';
import type { AIService } from 'src/services/ai-service';
import { createAIService, createDummyAIService } from 'src/services/ai-service';
import { t } from 'src/i18n';

export default class MemosSyncPlugin extends Plugin {
    settings: MemosPluginSettings;
    private memosService: MemosService;
    private fileService: FileService;
    private contentService: ContentService;
    private statusService: StatusService;

    async onload() {
        await this.loadSettings();

        const statusBarItem = this.addStatusBarItem();
        this.statusService = new StatusService(statusBarItem, this.settings.uiLanguage);

        this.initializeServices();

        this.addSettingTab(new MemosSyncSettingTab(this.app, this));

        this.addRibbonIcon('sync', 'Sync memos', async () => {
            await this.syncMemos();
        });

        if (this.settings.syncFrequency === 'auto') {
            this.initializeAutoSync();
        }
    }

    private initializeServices() {
        this.memosService = new MemosService(
            this.settings.memosApiUrl,
            this.settings.memosAccessToken,
            this.settings.syncLimit,
            this.settings.syncAfter
        );

        let aiService: AIService | null = null;
        if (this.settings.ai.enabled) {
            try {
                const modelName = this.settings.ai.modelName === 'custom'
                    ? this.settings.ai.customModelName
                    : this.settings.ai.modelName;

                const apiKey = this.settings.ai.modelType === 'ollama'
                    ? this.settings.ai.ollamaBaseUrl
                    : this.settings.ai.apiKey;

                if (this.settings.ai.modelType !== 'ollama' && !apiKey) {
                    aiService = createDummyAIService();
                    this.statusService.setWarning(t(this.settings.uiLanguage, 'main.aiKeyRequired'));
                } else {
                    aiService = createAIService(
                        this.settings.ai.modelType,
                        apiKey,
                        modelName,
                        this.settings.ai.openaiBaseUrl,
                    );
                }
            } catch (error) {
                console.error('Failed to initialize AI service:', error);
                this.statusService.setWarning(t(this.settings.uiLanguage, 'main.aiInitFailed'));
                aiService = createDummyAIService();
            }
        }

        this.contentService = new ContentService(
            aiService || createDummyAIService(),
            this.settings.ai.enabled && aiService !== null,
            this.settings.ai.intelligentSummary,
            this.settings.ai.autoTags,
            this.settings.ai.summaryLanguage,
            this.settings.uiLanguage,
            this.app.vault,
            this.settings.syncDirectory
        );

        this.fileService = new FileService(
            this.app.vault,
            this.settings.syncDirectory,
            this.memosService,
            this.settings.uiLanguage
        );
    }

    async syncMemos() {
        try {
            if (!this.settings.memosApiUrl) {
                throw new Error(t(this.settings.uiLanguage, 'main.missingMemosUrl'));
            }
            if (!this.settings.memosAccessToken) {
                throw new Error(t(this.settings.uiLanguage, 'main.missingAccessToken'));
            }

            this.statusService.startSync(0);
            const memos = await this.memosService.fetchAllMemos();
            this.statusService.startSync(memos.length);

            let syncCount = 0;
            for (const memo of memos) {
                const processedContent = await this.contentService.processMemoContent(memo);
                const processedMemo = { ...memo, content: processedContent };
                await this.fileService.saveMemoToFile(processedMemo);
                syncCount++;
                this.statusService.updateProgress(syncCount);
            }

            if (this.settings.ai.enabled && this.settings.ai.weeklyDigest) {
                this.statusService.updateProgress(syncCount, t(this.settings.uiLanguage, 'main.generatingWeeklyDigest'));
                await this.contentService.generateWeeklyDigest(memos);
            }

            this.statusService.setSuccess(t(this.settings.uiLanguage, 'main.syncCompleted', { count: syncCount }));
        } catch (error) {
            console.error('Sync failed:', error);
            this.statusService.setError(error instanceof Error ? error.message : String(error));
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        this.settings.uiLanguage = this.normalizeUiLanguage(this.settings.uiLanguage);
        this.settings.ai.summaryLanguage = this.normalizeSummaryLanguage(this.settings.ai.summaryLanguage);
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.initializeServices();
    }

    private initializeAutoSync() {
        const interval = this.settings.autoSyncInterval * 60 * 1000;
        setInterval(() => { void this.syncMemos(); }, interval);
    }

    private normalizeSummaryLanguage(language: unknown): MemosPluginSettings['ai']['summaryLanguage'] {
        const normalized = this.normalizeUiLanguage(language);
        return normalized;
    }

    private normalizeUiLanguage(language: unknown): UiLanguage {
        if (typeof language !== 'string') {
            return 'en-US';
        }

        const legacyMap: Record<string, UiLanguage> = {
            zh: 'zh-CN',
            en: 'en-US',
            tr: 'tr-TR',
            ja: 'ja-JP',
            ko: 'en-US'
        };
        if (legacyMap[language]) {
            return legacyMap[language];
        }

        if (language === 'en-US' || language === 'zh-CN' || language === 'tr-TR' || language === 'ja-JP') {
            return language;
        }

        return 'en-US';
    }
}
