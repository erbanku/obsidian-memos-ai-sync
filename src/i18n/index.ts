import type { UiLanguage } from '../models/settings';

type TranslationKey =
    | 'language.en-US'
    | 'language.zh-CN'
    | 'language.tr-TR'
    | 'language.ja-JP'
    | 'settings.uiLanguage.name'
    | 'settings.uiLanguage.desc'
    | 'settings.memosUrl.name'
    | 'settings.memosUrl.desc'
    | 'settings.accessToken.name'
    | 'settings.accessToken.desc'
    | 'settings.syncDirectory.name'
    | 'settings.syncDirectory.desc'
    | 'settings.syncMode.name'
    | 'settings.syncMode.desc'
    | 'settings.syncMode.manual'
    | 'settings.syncMode.auto'
    | 'settings.syncInterval.name'
    | 'settings.syncInterval.desc'
    | 'settings.syncLimit.name'
    | 'settings.syncLimit.desc'
    | 'settings.syncAfter.name'
    | 'settings.syncAfter.desc'
    | 'settings.aiEnabled.name'
    | 'settings.aiEnabled.desc'
    | 'settings.aiModel.name'
    | 'settings.aiModel.desc'
    | 'settings.apiKey.name'
    | 'settings.apiKey.desc'
    | 'settings.weeklyDigest.name'
    | 'settings.weeklyDigest.desc'
    | 'settings.autoTags.name'
    | 'settings.autoTags.desc'
    | 'settings.intelligentSummary.name'
    | 'settings.intelligentSummary.desc'
    | 'settings.summaryLanguage.name'
    | 'settings.summaryLanguage.desc'
    | 'settings.geminiModel.name'
    | 'settings.geminiModel.desc'
    | 'settings.openaiModel.name'
    | 'settings.openaiModel.desc'
    | 'settings.claudeModel.name'
    | 'settings.claudeModel.desc'
    | 'settings.ollamaBaseUrl.name'
    | 'settings.ollamaBaseUrl.desc'
    | 'settings.ollamaModel.name'
    | 'settings.ollamaModel.desc'
    | 'settings.customModel.name'
    | 'settings.customModel.desc'
    | 'settings.openaiBaseUrl.name'
    | 'settings.openaiBaseUrl.desc'
    | 'settings.placeholder.enterAccessToken'
    | 'settings.placeholder.enterApiKey'
    | 'status.syncing'
    | 'status.syncFailed'
    | 'status.syncComplete'
    | 'status.warning'
    | 'status.idle'
    | 'notice.syncingMemos'
    | 'notice.syncFailed'
    | 'main.aiKeyRequired'
    | 'main.aiInitFailed'
    | 'main.missingMemosUrl'
    | 'main.missingAccessToken'
    | 'main.generatingWeeklyDigest'
    | 'main.syncCompleted'
    | 'file.attachments'
    | 'file.memoProperties'
    | 'file.created'
    | 'file.updated'
    | 'file.type'
    | 'file.tags'
    | 'file.visibility'
    | 'file.pinned'
    | 'content.summaryHeading'
    | 'content.tagsHeading'
    | 'content.weeklyFileName'
    | 'content.weeklyTitle'
    | 'content.highlights'
    | 'content.stats'
    | 'content.memoCount'
    | 'content.timeRange'
    | 'content.nextWeekOutlook'
    | 'content.quoteTitle'
    | 'content.quoteText'
    | 'content.generatedAt';

type TranslationSet = Record<TranslationKey, string>;

const translations: Record<UiLanguage, TranslationSet> = {
    'en-US': {
        'language.en-US': 'English (US)',
        'language.zh-CN': 'Chinese (Simplified)',
        'language.tr-TR': 'Turkish',
        'language.ja-JP': 'Japanese',
        'settings.uiLanguage.name': 'UI language',
        'settings.uiLanguage.desc': 'Select the display language for plugin UI text',
        'settings.memosUrl.name': 'Memos URL',
        'settings.memosUrl.desc': 'Memos server base URL',
        'settings.accessToken.name': 'Access token',
        'settings.accessToken.desc': 'Your memos API access token',
        'settings.syncDirectory.name': 'Sync directory',
        'settings.syncDirectory.desc': 'Folder in Obsidian where memos content will be stored',
        'settings.syncMode.name': 'Sync mode',
        'settings.syncMode.desc': 'Choose manual or automatic sync',
        'settings.syncMode.manual': 'Manual',
        'settings.syncMode.auto': 'Automatic',
        'settings.syncInterval.name': 'Sync interval',
        'settings.syncInterval.desc': 'Interval between automatic syncs (minutes)',
        'settings.syncLimit.name': 'Sync limit',
        'settings.syncLimit.desc': 'Maximum number of memos to fetch per sync.',
        'settings.syncAfter.name': 'Sync after date',
        'settings.syncAfter.desc': 'Only sync memos created on or after this date (yyyy-mm-dd). Leave empty to sync all.',
        'settings.aiEnabled.name': 'Enable AI features',
        'settings.aiEnabled.desc': 'Toggle AI-enhanced processing',
        'settings.aiModel.name': 'AI model',
        'settings.aiModel.desc': 'Select the AI model provider',
        'settings.apiKey.name': 'API key',
        'settings.apiKey.desc': 'Your AI service API key',
        'settings.weeklyDigest.name': 'Weekly digest',
        'settings.weeklyDigest.desc': 'Automatically generate a weekly summary',
        'settings.autoTags.name': 'Auto tags',
        'settings.autoTags.desc': 'Automatically generate tags based on content',
        'settings.intelligentSummary.name': 'Intelligent summary',
        'settings.intelligentSummary.desc': 'Automatically generate content summaries',
        'settings.summaryLanguage.name': 'Summary language',
        'settings.summaryLanguage.desc': 'Select the language for generated summaries',
        'settings.geminiModel.name': 'Gemini model',
        'settings.geminiModel.desc': 'Select the Gemini model to use',
        'settings.openaiModel.name': 'OpenAI model',
        'settings.openaiModel.desc': 'Select the OpenAI model to use',
        'settings.claudeModel.name': 'Claude model',
        'settings.claudeModel.desc': 'Select the Claude model to use',
        'settings.ollamaBaseUrl.name': 'Ollama base URL',
        'settings.ollamaBaseUrl.desc': 'Base URL for the Ollama service (default: http://localhost:11434)',
        'settings.ollamaModel.name': 'Ollama model',
        'settings.ollamaModel.desc': 'Select the Ollama model to use',
        'settings.customModel.name': 'Custom model name',
        'settings.customModel.desc': 'Enter the name of the custom model',
        'settings.openaiBaseUrl.name': 'OpenAI API base URL',
        'settings.openaiBaseUrl.desc': 'Base URL for custom API services',
        'settings.placeholder.enterAccessToken': 'Enter access token',
        'settings.placeholder.enterApiKey': 'Enter API key',
        'status.syncing': 'Syncing',
        'status.syncFailed': 'Sync failed',
        'status.syncComplete': 'Sync complete',
        'status.warning': 'Warning',
        'status.idle': 'Idle',
        'notice.syncingMemos': 'Syncing memos',
        'notice.syncFailed': 'Sync failed: {error}',
        'main.aiKeyRequired': 'AI service requires an API key. Configure it in settings.',
        'main.aiInitFailed': 'Failed to initialize AI service. Check your configuration.',
        'main.missingMemosUrl': 'Memos API URL is not configured',
        'main.missingAccessToken': 'Access token is not configured',
        'main.generatingWeeklyDigest': 'Generating weekly digest...',
        'main.syncCompleted': 'Sync complete, synced {count} memos',
        'file.attachments': 'Attachments',
        'file.memoProperties': 'Memo Properties',
        'file.created': 'Created',
        'file.updated': 'Updated',
        'file.type': 'Type',
        'file.tags': 'Tags',
        'file.visibility': 'Visibility',
        'file.pinned': 'Pinned',
        'content.summaryHeading': 'Summary',
        'content.tagsHeading': 'Tags',
        'content.weeklyFileName': 'Week {week} Digest.md',
        'content.weeklyTitle': 'Week {week} Review ({range})',
        'content.highlights': 'Weekly Highlights',
        'content.stats': 'Statistics',
        'content.memoCount': 'Memos: {count}',
        'content.timeRange': 'Range: {range}',
        'content.nextWeekOutlook': 'Next Week Outlook',
        'content.quoteTitle': 'Quote',
        'content.quoteText': 'Every present moment is the starting point of the future.',
        'content.generatedAt': 'Generated at: {time}'
    },
    'zh-CN': {
        'language.en-US': '英语（美国）',
        'language.zh-CN': '简体中文',
        'language.tr-TR': '土耳其语',
        'language.ja-JP': '日语',
        'settings.uiLanguage.name': '界面语言',
        'settings.uiLanguage.desc': '选择插件界面的显示语言',
        'settings.memosUrl.name': 'Memos 地址',
        'settings.memosUrl.desc': 'Memos 服务基础地址',
        'settings.accessToken.name': '访问令牌',
        'settings.accessToken.desc': '你的 Memos API 访问令牌',
        'settings.syncDirectory.name': '同步目录',
        'settings.syncDirectory.desc': '在 Obsidian 中存放 Memo 内容的文件夹',
        'settings.syncMode.name': '同步模式',
        'settings.syncMode.desc': '选择手动或自动同步',
        'settings.syncMode.manual': '手动',
        'settings.syncMode.auto': '自动',
        'settings.syncInterval.name': '同步间隔',
        'settings.syncInterval.desc': '自动同步的时间间隔（分钟）',
        'settings.syncLimit.name': '同步数量上限',
        'settings.syncLimit.desc': '每次同步最多拉取的 Memo 数量。',
        'settings.syncAfter.name': '起始同步日期',
        'settings.syncAfter.desc': '仅同步该日期及之后创建的 Memo（yyyy-mm-dd）。留空则同步全部。',
        'settings.aiEnabled.name': '启用 AI 功能',
        'settings.aiEnabled.desc': '启用 AI 增强处理',
        'settings.aiModel.name': 'AI 模型',
        'settings.aiModel.desc': '选择 AI 模型提供方',
        'settings.apiKey.name': 'API 密钥',
        'settings.apiKey.desc': '你的 AI 服务 API 密钥',
        'settings.weeklyDigest.name': '每周总结',
        'settings.weeklyDigest.desc': '自动生成每周总结',
        'settings.autoTags.name': '自动标签',
        'settings.autoTags.desc': '根据内容自动生成标签',
        'settings.intelligentSummary.name': '智能摘要',
        'settings.intelligentSummary.desc': '自动生成内容摘要',
        'settings.summaryLanguage.name': '摘要语言',
        'settings.summaryLanguage.desc': '选择 AI 生成摘要的语言',
        'settings.geminiModel.name': 'Gemini 模型',
        'settings.geminiModel.desc': '选择要使用的 Gemini 模型',
        'settings.openaiModel.name': 'OpenAI 模型',
        'settings.openaiModel.desc': '选择要使用的 OpenAI 模型',
        'settings.claudeModel.name': 'Claude 模型',
        'settings.claudeModel.desc': '选择要使用的 Claude 模型',
        'settings.ollamaBaseUrl.name': 'Ollama 服务地址',
        'settings.ollamaBaseUrl.desc': 'Ollama 服务基础地址（默认: http://localhost:11434）',
        'settings.ollamaModel.name': 'Ollama 模型',
        'settings.ollamaModel.desc': '选择要使用的 Ollama 模型',
        'settings.customModel.name': '自定义模型名称',
        'settings.customModel.desc': '输入自定义模型名称',
        'settings.openaiBaseUrl.name': 'OpenAI API 基础地址',
        'settings.openaiBaseUrl.desc': '自定义 API 服务地址',
        'settings.placeholder.enterAccessToken': '输入访问令牌',
        'settings.placeholder.enterApiKey': '输入 API 密钥',
        'status.syncing': '同步中',
        'status.syncFailed': '同步失败',
        'status.syncComplete': '同步完成',
        'status.warning': '警告',
        'status.idle': '空闲',
        'notice.syncingMemos': '正在同步 Memo',
        'notice.syncFailed': '同步失败：{error}',
        'main.aiKeyRequired': 'AI 服务需要 API 密钥，请在设置中配置。',
        'main.aiInitFailed': 'AI 服务初始化失败，请检查配置。',
        'main.missingMemosUrl': '未配置 Memos API URL',
        'main.missingAccessToken': '未配置访问令牌',
        'main.generatingWeeklyDigest': '正在生成每周总结...',
        'main.syncCompleted': '同步完成，共同步 {count} 条记录',
        'file.attachments': '附件',
        'file.memoProperties': 'Memo 属性',
        'file.created': '创建时间',
        'file.updated': '更新时间',
        'file.type': '类型',
        'file.tags': '标签',
        'file.visibility': '可见性',
        'file.pinned': '置顶',
        'content.summaryHeading': '内容摘要',
        'content.tagsHeading': '相关标签',
        'content.weeklyFileName': '第{week}周总结.md',
        'content.weeklyTitle': '第 {week} 周回顾（{range}）',
        'content.highlights': '本周亮点',
        'content.stats': '统计数据',
        'content.memoCount': '记录数量：{count} 条',
        'content.timeRange': '时间范围：{range}',
        'content.nextWeekOutlook': '下周展望',
        'content.quoteTitle': '激励语录',
        'content.quoteText': '每一个当下都是未来的起点，让我们继续前行。',
        'content.generatedAt': '生成时间：{time}'
    },
    'tr-TR': {
        'language.en-US': 'İngilizce (ABD)',
        'language.zh-CN': 'Çince (Basitleştirilmiş)',
        'language.tr-TR': 'Türkçe',
        'language.ja-JP': 'Japonca',
        'settings.uiLanguage.name': 'Arayüz dili',
        'settings.uiLanguage.desc': 'Eklenti arayüz metin dili',
        'settings.memosUrl.name': 'Memos URL',
        'settings.memosUrl.desc': 'Memos sunucu temel URL adresi',
        'settings.accessToken.name': 'Erişim belirteci',
        'settings.accessToken.desc': 'Memos API erişim belirteciniz',
        'settings.syncDirectory.name': 'Senkronizasyon klasörü',
        'settings.syncDirectory.desc': 'Memos içeriğinin Obsidian içinde kaydedileceği klasör',
        'settings.syncMode.name': 'Senkronizasyon modu',
        'settings.syncMode.desc': 'Manuel veya otomatik senkronizasyon seçin',
        'settings.syncMode.manual': 'Manuel',
        'settings.syncMode.auto': 'Otomatik',
        'settings.syncInterval.name': 'Senkronizasyon aralığı',
        'settings.syncInterval.desc': 'Otomatik senkronizasyon aralığı (dakika)',
        'settings.syncLimit.name': 'Senkronizasyon limiti',
        'settings.syncLimit.desc': 'Her senkronizasyonda çekilecek en fazla memo sayısı.',
        'settings.syncAfter.name': 'Bu tarihten sonra senkronize et',
        'settings.syncAfter.desc': 'Sadece bu tarihte veya sonrasında oluşturulan memoları senkronize et (yyyy-mm-dd).',
        'settings.aiEnabled.name': 'AI özelliklerini etkinleştir',
        'settings.aiEnabled.desc': 'AI destekli işlemeyi aç/kapat',
        'settings.aiModel.name': 'AI modeli',
        'settings.aiModel.desc': 'AI model sağlayıcısını seçin',
        'settings.apiKey.name': 'API anahtarı',
        'settings.apiKey.desc': 'AI servis API anahtarınız',
        'settings.weeklyDigest.name': 'Haftalık özet',
        'settings.weeklyDigest.desc': 'Haftalık özeti otomatik oluştur',
        'settings.autoTags.name': 'Otomatik etiketler',
        'settings.autoTags.desc': 'İçeriğe göre otomatik etiket üret',
        'settings.intelligentSummary.name': 'Akıllı özet',
        'settings.intelligentSummary.desc': 'İçerik özetlerini otomatik oluştur',
        'settings.summaryLanguage.name': 'Özet dili',
        'settings.summaryLanguage.desc': 'Üretilen özetlerin dilini seçin',
        'settings.geminiModel.name': 'Gemini modeli',
        'settings.geminiModel.desc': 'Kullanılacak Gemini modelini seçin',
        'settings.openaiModel.name': 'OpenAI modeli',
        'settings.openaiModel.desc': 'Kullanılacak OpenAI modelini seçin',
        'settings.claudeModel.name': 'Claude modeli',
        'settings.claudeModel.desc': 'Kullanılacak Claude modelini seçin',
        'settings.ollamaBaseUrl.name': 'Ollama temel URL',
        'settings.ollamaBaseUrl.desc': 'Ollama servis temel URL adresi (varsayılan: http://localhost:11434)',
        'settings.ollamaModel.name': 'Ollama modeli',
        'settings.ollamaModel.desc': 'Kullanılacak Ollama modelini seçin',
        'settings.customModel.name': 'Özel model adı',
        'settings.customModel.desc': 'Özel model adını girin',
        'settings.openaiBaseUrl.name': 'OpenAI API temel URL',
        'settings.openaiBaseUrl.desc': 'Özel API servisleri için temel URL',
        'settings.placeholder.enterAccessToken': 'Erişim belirtecini girin',
        'settings.placeholder.enterApiKey': 'API anahtarını girin',
        'status.syncing': 'Senkronize ediliyor',
        'status.syncFailed': 'Senkronizasyon başarısız',
        'status.syncComplete': 'Senkronizasyon tamamlandı',
        'status.warning': 'Uyarı',
        'status.idle': 'Boşta',
        'notice.syncingMemos': 'Memolar senkronize ediliyor',
        'notice.syncFailed': 'Senkronizasyon başarısız: {error}',
        'main.aiKeyRequired': 'AI servisi API anahtarı gerektirir. Ayarlardan yapılandırın.',
        'main.aiInitFailed': 'AI servisi başlatılamadı. Yapılandırmayı kontrol edin.',
        'main.missingMemosUrl': 'Memos API URL yapılandırılmamış',
        'main.missingAccessToken': 'Erişim belirteci yapılandırılmamış',
        'main.generatingWeeklyDigest': 'Haftalık özet oluşturuluyor...',
        'main.syncCompleted': 'Senkronizasyon tamamlandı, {count} memo senkronize edildi',
        'file.attachments': 'Ekler',
        'file.memoProperties': 'Memo Özellikleri',
        'file.created': 'Oluşturulma',
        'file.updated': 'Güncelleme',
        'file.type': 'Tür',
        'file.tags': 'Etiketler',
        'file.visibility': 'Görünürlük',
        'file.pinned': 'Sabitlenmiş',
        'content.summaryHeading': 'Özet',
        'content.tagsHeading': 'Etiketler',
        'content.weeklyFileName': 'Hafta-{week}-Ozeti.md',
        'content.weeklyTitle': '{week}. Hafta Değerlendirmesi ({range})',
        'content.highlights': 'Haftanın Öne Çıkanları',
        'content.stats': 'İstatistikler',
        'content.memoCount': 'Memo sayısı: {count}',
        'content.timeRange': 'Aralık: {range}',
        'content.nextWeekOutlook': 'Gelecek Hafta Görünümü',
        'content.quoteTitle': 'Alıntı',
        'content.quoteText': 'Her an, geleceğin başlangıç noktasıdır.',
        'content.generatedAt': 'Oluşturulma zamanı: {time}'
    },
    'ja-JP': {
        'language.en-US': '英語（米国）',
        'language.zh-CN': '中国語（簡体字）',
        'language.tr-TR': 'トルコ語',
        'language.ja-JP': '日本語',
        'settings.uiLanguage.name': 'UI 言語',
        'settings.uiLanguage.desc': 'プラグイン UI テキストの表示言語を選択',
        'settings.memosUrl.name': 'Memos URL',
        'settings.memosUrl.desc': 'Memos サーバーのベース URL',
        'settings.accessToken.name': 'アクセストークン',
        'settings.accessToken.desc': 'Memos API のアクセストークン',
        'settings.syncDirectory.name': '同期ディレクトリ',
        'settings.syncDirectory.desc': 'Obsidian 内でメモ内容を保存するフォルダ',
        'settings.syncMode.name': '同期モード',
        'settings.syncMode.desc': '手動または自動同期を選択',
        'settings.syncMode.manual': '手動',
        'settings.syncMode.auto': '自動',
        'settings.syncInterval.name': '同期間隔',
        'settings.syncInterval.desc': '自動同期の間隔（分）',
        'settings.syncLimit.name': '同期上限',
        'settings.syncLimit.desc': '1 回の同期で取得するメモの最大数。',
        'settings.syncAfter.name': '同期開始日',
        'settings.syncAfter.desc': 'この日付以降に作成されたメモのみ同期（yyyy-mm-dd）。空欄で全件。',
        'settings.aiEnabled.name': 'AI 機能を有効化',
        'settings.aiEnabled.desc': 'AI 強化処理を切り替え',
        'settings.aiModel.name': 'AI モデル',
        'settings.aiModel.desc': 'AI モデル提供元を選択',
        'settings.apiKey.name': 'API キー',
        'settings.apiKey.desc': 'AI サービス API キー',
        'settings.weeklyDigest.name': '週次ダイジェスト',
        'settings.weeklyDigest.desc': '週次サマリーを自動生成',
        'settings.autoTags.name': '自動タグ',
        'settings.autoTags.desc': '内容に基づいてタグを自動生成',
        'settings.intelligentSummary.name': 'インテリジェント要約',
        'settings.intelligentSummary.desc': '内容要約を自動生成',
        'settings.summaryLanguage.name': '要約言語',
        'settings.summaryLanguage.desc': '生成される要約の言語を選択',
        'settings.geminiModel.name': 'Gemini モデル',
        'settings.geminiModel.desc': '使用する Gemini モデルを選択',
        'settings.openaiModel.name': 'OpenAI モデル',
        'settings.openaiModel.desc': '使用する OpenAI モデルを選択',
        'settings.claudeModel.name': 'Claude モデル',
        'settings.claudeModel.desc': '使用する Claude モデルを選択',
        'settings.ollamaBaseUrl.name': 'Ollama ベース URL',
        'settings.ollamaBaseUrl.desc': 'Ollama サービスのベース URL（既定: http://localhost:11434）',
        'settings.ollamaModel.name': 'Ollama モデル',
        'settings.ollamaModel.desc': '使用する Ollama モデルを選択',
        'settings.customModel.name': 'カスタムモデル名',
        'settings.customModel.desc': 'カスタムモデル名を入力',
        'settings.openaiBaseUrl.name': 'OpenAI API ベース URL',
        'settings.openaiBaseUrl.desc': 'カスタム API サービス用ベース URL',
        'settings.placeholder.enterAccessToken': 'アクセストークンを入力',
        'settings.placeholder.enterApiKey': 'API キーを入力',
        'status.syncing': '同期中',
        'status.syncFailed': '同期失敗',
        'status.syncComplete': '同期完了',
        'status.warning': '警告',
        'status.idle': '待機中',
        'notice.syncingMemos': 'メモを同期中',
        'notice.syncFailed': '同期失敗: {error}',
        'main.aiKeyRequired': 'AI サービスには API キーが必要です。設定で構成してください。',
        'main.aiInitFailed': 'AI サービスの初期化に失敗しました。設定を確認してください。',
        'main.missingMemosUrl': 'Memos API URL が未設定です',
        'main.missingAccessToken': 'アクセストークンが未設定です',
        'main.generatingWeeklyDigest': '週次ダイジェストを生成中...',
        'main.syncCompleted': '同期完了、{count} 件のメモを同期しました',
        'file.attachments': '添付ファイル',
        'file.memoProperties': 'メモのプロパティ',
        'file.created': '作成日時',
        'file.updated': '更新日時',
        'file.type': 'タイプ',
        'file.tags': 'タグ',
        'file.visibility': '公開範囲',
        'file.pinned': 'ピン留め',
        'content.summaryHeading': '要約',
        'content.tagsHeading': 'タグ',
        'content.weeklyFileName': '第{week}週ダイジェスト.md',
        'content.weeklyTitle': '第 {week} 週レビュー（{range}）',
        'content.highlights': '今週のハイライト',
        'content.stats': '統計',
        'content.memoCount': 'メモ件数: {count}',
        'content.timeRange': '期間: {range}',
        'content.nextWeekOutlook': '来週の見通し',
        'content.quoteTitle': '引用',
        'content.quoteText': '今この瞬間は、未来の出発点です。',
        'content.generatedAt': '生成時刻: {time}'
    }
};

export function t(language: UiLanguage, key: TranslationKey, vars?: Record<string, string | number>): string {
    const template = translations[language][key] ?? translations['en-US'][key] ?? key;
    if (!vars) {
        return template;
    }

    return template.replace(/\{(\w+)\}/g, (_, token: string) => {
        const value = vars[token];
        return value === undefined ? `{${token}}` : String(value);
    });
}

export function formatLocaleDateTime(language: UiLanguage, date: Date): string {
    return new Intl.DateTimeFormat(language, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(date);
}

export function formatMonthDay(language: UiLanguage, date: Date): string {
    return new Intl.DateTimeFormat(language, {
        month: 'numeric',
        day: 'numeric'
    }).format(date);
}
