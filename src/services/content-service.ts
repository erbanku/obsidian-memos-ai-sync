import type { AIService } from './ai-service';
import type { MemoItem } from '../models/settings';
import type { Vault } from 'obsidian';

export class ContentService {
    constructor(
        private aiService: AIService,
        private aiEnabled: boolean,
        private enableSummary: boolean,
        private enableTags: boolean,
        private summaryLanguage: string,
        private vault: Vault,
        private syncDirectory: string
    ) {}

    private isContentSuitableForAI(content: string): boolean {
        const cleanContent = content
            .replace(/\[([^\]]*)\]\([^)]*\)/g, '')
            .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
            .replace(/```[\s\S]*?```/g, '')
            .trim();

        return cleanContent.length >= 10;
    }

    async processMemoContent(memo: MemoItem): Promise<string> {
        const { content } = memo;
        const title = this.extractTitle(content);
        const mainContent = title ? content.slice(title.length).trim() : content;
        let processedContent = title ? `# ${title}\n\n` : '';

        if (this.aiEnabled && this.isContentSuitableForAI(content)) {
            if (this.enableSummary) {
                const summary = await this.aiService.generateSummary(content, this.summaryLanguage);
                if (summary?.trim()) {
                    processedContent += `> [!abstract]+ 内容摘要\n> ${summary.replace(/\n/g, '\n> ')}\n\n`;
                }
            }

            if (this.enableTags) {
                const tags = await this.aiService.generateTags(content);
                if (tags?.length > 0) {
                    processedContent += `> [!info]- 相关标签\n> ${tags.map(tag => `#${tag}`).join(' ')}\n\n`;
                }
            }
        }

        processedContent += mainContent;
        return processedContent.trim();
    }

    private extractTitle(content: string): string | null {
        const lines = content.split('\n');
        const firstLine = lines[0].trim();

        // 如果第一行是标题格式（# 开头），提取标题文本
        if (firstLine.startsWith('# ')) {
            return firstLine.slice(2).trim();
        }

        return null;
    }

    private async weeklyDigestExists(year: string, week: string): Promise<boolean> {
        const weeklyDigestPath = this.getWeeklyDigestPath(year, week);
        return await this.vault.adapter.exists(weeklyDigestPath);
    }

    private getWeeklyDigestPath(year: string, week: string): string {
        const weeklyDigestDir = `${this.syncDirectory}/${year}/weekly`;
        const fileName = `第${week}周总结.md`;
        return `${weeklyDigestDir}/${fileName}`;
    }

    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        if (!(await this.vault.adapter.exists(dirPath))) {
            await this.vault.adapter.mkdir(dirPath);
        }
    }

    async generateWeeklyDigest(memos: MemoItem[]): Promise<void> {
        if (!this.aiEnabled) {
            return;
        }

        const suitableMemos = memos.filter(memo => this.isContentSuitableForAI(memo.content));
        if (suitableMemos.length === 0) {
            return;
        }

        const weekGroups = this.groupMemosByWeek(suitableMemos);

        for (const [weekKey, weekMemos] of Object.entries(weekGroups)) {
            const [year, week] = weekKey.split('-W');

            if (await this.weeklyDigestExists(year, week)) {
                continue;
            }

            const weeklyDigestDir = `${this.syncDirectory}/${year}/weekly`;
            await this.ensureDirectoryExists(weeklyDigestDir);

            const contents = weekMemos.map(memo => memo.content);
            const digest = await this.aiService.generateWeeklyDigest(contents);

            if (digest?.trim()) {
                const weeklyContent = this.formatWeeklyDigest(digest, year, week, weekMemos.length);
                const weeklyDigestPath = this.getWeeklyDigestPath(year, week);

                try {
                    await this.vault.create(weeklyDigestPath, weeklyContent);
                } catch (error) {
                    console.error(`生成第 ${week} 周总结失败:`, error);
                }
            }
        }
    }

    private formatWeeklyDigest(digest: string, year: string, week: string, memoCount: number): string {
        const weekRange = this.getWeekDateRange(Number.parseInt(year, 10), Number.parseInt(week, 10));
        return `# 📅 第 ${week} 周回顾 (${weekRange})

## 🌟 本周亮点

${digest}

## 📊 统计数据

- 📝 记录数量：${memoCount} 条
- 📅 时间范围：${weekRange}

## 💪 下周展望

> [!quote] 激励语录
> 每一个当下都是未来的起点，让我们继续前行，创造更多精彩！

---
*生成时间：${new Date().toLocaleString('zh-CN', { hour12: false })}*

`;
    }

    private getWeekDateRange(year: number, week: number): string {
        const firstDayOfYear = new Date(year, 0, 1);
        const daysToFirstMonday = (8 - firstDayOfYear.getDay()) % 7;
        const firstMonday = new Date(year, 0, 1 + daysToFirstMonday);

        const weekStart = new Date(firstMonday);
        weekStart.setDate(firstMonday.getDate() + (week - 1) * 7);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const formatDate = (date: Date): string => {
            return `${date.getMonth() + 1}月${date.getDate()}日`;
        };

        return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
    }

    private groupMemosByWeek(memos: MemoItem[]): { [key: string]: MemoItem[] } {
        const groups: { [key: string]: MemoItem[] } = {};

        for (const memo of memos) {
            const date = new Date(memo.createdTs * 1000);
            const year = date.getFullYear();
            const week = this.getWeekNumber(date);
            const key = `${year}-W${week.toString().padStart(2, '0')}`;

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(memo);
        }

        return groups;
    }

    private getWeekNumber(date: Date): number {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    }
}
