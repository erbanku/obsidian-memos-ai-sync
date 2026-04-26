import type { MemoItem, MemoResource } from '../models/settings';
import { Logger } from './logger';
import { requestUrl } from 'obsidian';

export class MemosService {
    private logger: Logger;

    constructor(
        private apiUrl: string,
        private accessToken: string,
        private syncLimit: number,
        private syncAfter: string = ''
    ) {
        this.logger = new Logger('MemosService');
    }

    /**
     * Return the base URL with a trailing slash.
     * Accepts either a bare host URL (https://demo.usememos.com/) or one
     * that already has /api/v1 appended (both forms are normalised here).
     */
    private base(): string {
        const url = this.apiUrl.replace(/\/api\/v1\/?$/, '');
        return url.endsWith('/') ? url : `${url}/`;
    }

    private headers(): Record<string, string> {
        return {
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'application/json',
        };
    }

    /**
     * Fetch all NORMAL memos using the Memos v0.21 REST API.
     *
     * Endpoint: GET /api/v1/memo?rowStatus=NORMAL&limit=<n>&offset=<n>
     * Response: plain JSON array of Memo objects (no pagination envelope).
     */
    async fetchAllMemos(): Promise<MemoItem[]> {
        this.logger.debug('Fetching memos from:', this.base());
        const pageSize = 100;
        const all: MemoItem[] = [];
        let offset = 0;

        while (all.length < this.syncLimit) {
            const remaining = this.syncLimit - all.length;
            const limit = Math.min(pageSize, remaining);
            const url = `${this.base()}api/v1/memo?rowStatus=NORMAL&limit=${limit}&offset=${offset}`;
            this.logger.debug('GET', url);

            const response = await requestUrl({ url, headers: this.headers() });

            if (response.status !== 200) {
                throw new Error(`Memos API error ${response.status}: ${response.text}`);
            }

            const batch: MemoItem[] = response.json;

            if (!Array.isArray(batch) || batch.length === 0) {
                break;
            }

            all.push(...batch);
            offset += batch.length;

            if (batch.length < limit) {
                break; // server returned fewer items — no more pages
            }
        }

        // Optional date filter
        const afterTs = this.syncAfter
            ? Math.floor(new Date(this.syncAfter).getTime() / 1000)
            : 0;

        const filtered = afterTs
            ? all.filter(m => m.createdTs >= afterTs)
            : all;

        this.logger.debug(`Fetched ${filtered.length} memos`);
        return filtered.sort((a, b) => b.createdTs - a.createdTs);
    }

    /**
     * Public URL of a v0.21 resource attachment.
     * Pattern: {base}o/r/{id}/{publicId || filename}
     */
    resourceUrl(resource: MemoResource): string {
        if (resource.externalLink) return resource.externalLink;
        const fileId = resource.publicId ?? resource.filename;
        return `${this.base()}o/r/${resource.id}/${encodeURIComponent(fileId)}`;
    }

    /**
     * Download a resource attachment as binary data.
     */
    async downloadResource(resource: MemoResource): Promise<ArrayBuffer | null> {
        const url = this.resourceUrl(resource);
        this.logger.debug('Downloading resource:', url);
        try {
            const response = await requestUrl({
                url,
                headers: { Authorization: `Bearer ${this.accessToken}` },
            });

            if (response.status !== 200) {
                this.logger.warn(`Resource download failed (${response.status}): ${url}`);
                return null;
            }

            if (response.arrayBuffer) {
                return response.arrayBuffer;
            }
            this.logger.warn('No arrayBuffer in response for:', url);
            return null;
        } catch (error) {
            this.logger.error('Resource download error:', error);
            return null;
        }
    }

    /**
     * Validate connection by fetching one memo. Returns true on success.
     */
    async testConnection(): Promise<boolean> {
        try {
            const response = await requestUrl({
                url: `${this.base()}api/v1/memo?rowStatus=NORMAL&limit=1`,
                headers: this.headers(),
            });
            return response.status === 200;
        } catch {
            return false;
        }
    }
}
