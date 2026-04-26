# Memos AI Sync+

A fork of [leoleelxh/obsidian-memos-ai-sync](https://github.com/leoleelxh/obsidian-memos-ai-sync) by [erbanku](https://github.com/erbanku), updated to support **Memos v0.21 and earlier** API.

## What changed

The original plugin targets the newer Memos gRPC-gateway API (`/api/v1/memos` with page tokens). This fork reverts to the **classic v0.21 REST API**:

- `GET /api/v1/memo?rowStatus=NORMAL&limit=N&offset=N` — returns a plain JSON array
- Resource URLs follow the `{base}o/r/{id}/{filename}` pattern
- Attachments (`resourceList`) are downloaded and embedded in the vault

## Credits

Original plugin by [leoleelxh](https://github.com/leoleelxh):
> [leoleelxh/obsidian-memos-ai-sync](https://github.com/leoleelxh/obsidian-memos-ai-sync) — obsidian-memos-sync-plugin, sync Memos content to Obsidian with AI enhancement.

## Installation

1. Download `main.js` and `manifest.json` from this repo.
2. Copy them into your vault's `.obsidian/plugins/memos-ai-sync-plus/` folder (create it if needed).
3. Enable the plugin in Obsidian Settings > Community Plugins.

## Configuration

| Setting | Description |
|---|---|
| Memos URL | Base URL of your Memos instance, e.g. `https://demo.usememos.com/` |
| Access token | Personal access token from Memos Settings |
| Sync directory | Vault folder where notes are saved (default: `memos`) |
| Sync mode | Manual or auto (with configurable interval) |
| Sync limit | Maximum number of memos to fetch per sync |
| Sync after date | Only sync memos created on or after `YYYY-MM-DD` |
| Download attachments | Download images and files into the vault |
| AI features | Optional AI summary, tags, and weekly digest |

## Supported Memos versions

**v0.21 and earlier.** For Memos v0.22+ (which changed to a new API), use the original plugin or another fork.
