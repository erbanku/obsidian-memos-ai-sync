import { TFile } from 'obsidian';
import type { Vault } from 'obsidian';
import type { MemoItem, MemoResource } from '../models/settings';
import type { MemosService } from './memos-service';
import { Logger } from './logger';

export class FileService {
    private logger: Logger;

    constructor(
        private vault: Vault,
        private syncDirectory: string,
        private memosService: MemosService
    ) {
        this.logger = new Logger('FileService');
    }

    private formatDateTime(ts: number, format: 'filename' | 'display' = 'display'): string {
        const d = new Date(ts * 1000);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        if (format === 'filename') {
            return `${year}-${month}-${day} ${hours}-${minutes}`;
        }
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    private sanitizeFileName(fileName: string): string {
        let sanitized = fileName.replace(/^[\\/:*?"<>|#\s]+/, '');

        sanitized = sanitized
            .replace(/\s+/g, ' ')
            .replace(/[\\/:*?"<>|#]/g, '')
            .trim();

        return sanitized || 'untitled';
    }

    private getRelativePath(fromPath: string, toPath: string): string {
        const fromParts = fromPath.split('/');
        const toParts = toPath.split('/');
        fromParts.pop();

        let i = 0;
        while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
            i++;
        }

        const goBack = fromParts.length - i;
        return [...Array(goBack).fill('..'), ...toParts.slice(i)].join('/');
    }

    private isImageFile(filename: string): boolean {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
        const ext = filename.toLowerCase().split('.').pop();
        return ext ? imageExtensions.includes(`.${ext}`) : false;
    }

    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        if (!(await this.vault.adapter.exists(dirPath))) {
            await this.vault.adapter.mkdir(dirPath);
        }
    }

    private getContentPreview(content: string): string {
        let preview = content
            .replace(/^>\s*\[!.*?\].*$/gm, '')
            .replace(/^>\s.*$/gm, '')
            .replace(/^\s*#\s+/gm, '')
            .replace(/[_*~`]|_{2,}|\*{2,}|~{2,}/g, '')
            .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
            .replace(/!\[([^\]]*)\]\([^)]*\)/g, '')
            .replace(/\n+/g, ' ')
            .trim();

        if (!preview) return 'Untitled';
        if (preview.length > 50) preview = `${preview.slice(0, 50)}...`;
        return preview;
    }

    private async getMemoFiles(): Promise<string[]> {
        const files: string[] = [];
        const processDirectory = async (dirPath: string) => {
            const items = await this.vault.adapter.list(dirPath);
            for (const file of items.files) {
                if (file.endsWith('.md')) files.push(file);
            }
            for (const dir of items.folders) {
                await processDirectory(dir);
            }
        };
        await processDirectory(this.syncDirectory);
        return files;
    }

    async isMemoExists(memoId: number): Promise<boolean> {
        try {
            const files = await this.getMemoFiles();
            for (const file of files) {
                const content = await this.vault.adapter.read(file);
                if (content.includes(`memo_id: ${memoId}`)) return true;
            }
            return false;
        } catch (error) {
            this.logger.error('Error checking memo existence:', error instanceof Error ? error.message : String(error));
            return false;
        }
    }

    async saveMemoToFile(memo: MemoItem): Promise<void> {
        try {
            if (await this.isMemoExists(memo.id)) {
                this.logger.debug(`Memo ${memo.id} already exists, skipping`);
                return;
            }

            const date = new Date(memo.createdTs * 1000);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');

            const yearDir = `${this.syncDirectory}/${year}`;
            const monthDir = `${yearDir}/${month}`;

            await this.ensureDirectoryExists(this.syncDirectory);
            await this.ensureDirectoryExists(yearDir);
            await this.ensureDirectoryExists(monthDir);

            const contentPreview = memo.content
                ? this.getContentPreview(memo.content)
                : String(memo.id);

            const timeStr = this.formatDateTime(memo.createdTs, 'filename');
            const fileName = this.sanitizeFileName(`${contentPreview} (${timeStr}).md`);
            const filePath = `${monthDir}/${fileName}`;

            // Normalise inline tag syntax #tag# -> #tag
            let content = (memo.content || '').replace(/#([^#\s]+)#/g, '#$1');

            let documentContent = content;

            if (memo.resourceList?.length > 0) {
                const images = memo.resourceList.filter(r => this.isImageFile(r.filename));
                const otherFiles = memo.resourceList.filter(r => !this.isImageFile(r.filename));

                if (images.length > 0) {
                    documentContent += '\n\n';
                    for (const image of images) {
                        const resourceData = await this.memosService.downloadResource(image);
                        if (resourceData) {
                            const resourceDir = `${monthDir}/resources`;
                            await this.ensureDirectoryExists(resourceDir);
                            const localFilename = `${image.id}_${this.sanitizeFileName(image.filename)}`;
                            const localPath = `${resourceDir}/${localFilename}`;
                            await this.vault.adapter.writeBinary(localPath, resourceData);
                            const relativePath = this.getRelativePath(filePath, localPath);
                            documentContent += `![${image.filename}](${relativePath})\n`;
                        } else {
                            documentContent += `![${image.filename}](${this.memosService.resourceUrl(image)})\n`;
                        }
                    }
                }

                if (otherFiles.length > 0) {
                    documentContent += '\n\n### Attachments\n';
                    for (const file of otherFiles) {
                        const resourceData = await this.memosService.downloadResource(file);
                        if (resourceData) {
                            const resourceDir = `${monthDir}/resources`;
                            await this.ensureDirectoryExists(resourceDir);
                            const localFilename = `${file.id}_${this.sanitizeFileName(file.filename)}`;
                            const localPath = `${resourceDir}/${localFilename}`;
                            await this.vault.adapter.writeBinary(localPath, resourceData);
                            const relativePath = this.getRelativePath(filePath, localPath);
                            documentContent += `- [${file.filename}](${relativePath})\n`;
                        } else {
                            documentContent += `- [${file.filename}](${this.memosService.resourceUrl(file)})\n`;
                        }
                    }
                }
            }

            const tags = (memo.content || '').match(/#([^#\s]+)(?:#|\s|$)/g) || [];
            const cleanTags = tags.map(tag => tag.replace(/^#|#$/g, '').trim());

            documentContent += '\n\n---\n';
            documentContent += '> [!note]- Memo Properties\n';
            documentContent += `> - Created: ${this.formatDateTime(memo.createdTs)}\n`;
            documentContent += `> - Updated: ${this.formatDateTime(memo.updatedTs)}\n`;
            documentContent += '> - Type: memo\n';
            if (cleanTags.length > 0) {
                documentContent += `> - Tags: [${cleanTags.join(', ')}]\n`;
            }
            documentContent += `> - memo_id: ${memo.id}\n`;
            documentContent += `> - Visibility: ${memo.visibility.toLowerCase()}\n`;
            if (memo.pinned) documentContent += '> - Pinned: true\n';

            const exists = await this.vault.adapter.exists(filePath);
            if (exists) {
                const abstractFile = this.vault.getAbstractFileByPath(filePath);
                if (abstractFile instanceof TFile) {
                    await this.vault.modify(abstractFile, documentContent);
                }
            } else {
                await this.vault.create(filePath, documentContent);
            }
        } catch (error) {
            this.logger.error('Error saving memo:', error instanceof Error ? error.message : String(error));
            throw new Error(`Failed to save memo ${memo.id}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

