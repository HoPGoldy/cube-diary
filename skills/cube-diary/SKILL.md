---
name: cube-diary
description: "Interact with the cube-diary API to read, write, search, and manage diary entries and attachments via the `oac` CLI. Trigger: 'diary', 'write diary', 'read diary', 'journal', 'cube-diary', '日记', '写日记', '读日记', '查日记'."
---

# cube-diary Skill (via oac CLI)

This skill enables AI agents to interact with a cube-diary server using the `oac` (openapi-agent-cli) command-line tool. `oac` wraps the full REST API into simple CLI commands — no manual HTTP requests or curl needed.

## When to Use

Use this skill when the user wants to:

- Read, create, update, or search diary entries
- Upload or download file attachments
- Export or import diary data
- Get diary statistics

## Prerequisites

The `oac` CLI must be installed globally (`pnpm add -g openapi-agent-cli` or equivalent).

## Setup

### Check existing config

```bash
oac config list
```

If a service named `cube-diary` (or similar) already appears, skip to [Authentication](#authentication).

### Add a new service

Ask the user for:

1. **API base URL** (e.g. `https://example.com`)
2. **Access Token** (format: `csk-<hex string>`)

Service name defaults to `cube-diary`. OpenAPI spec URL is auto-derived as `{baseURL}/docs/json`.

```bash
oac config add cube-diary \
  --url https://example.com \
  --openapi https://example.com/docs/json \
  --headers '{"Authorization":"Bearer csk-xxxxxxxxxxxxxxxx"}' \
  --ignore '["/api/config/**", "/api/access-tokens/**", "/api/auth/**"]'
```

After adding, `oac` automatically fetches and caches the OpenAPI spec. The new service becomes a sub-command (e.g. `oac cube-diary ...`).

### Update config

```bash
# Change the token
oac config set cube-diary --headers '{"Authorization":"Bearer csk-NEW_TOKEN"}'

# Change the base URL
oac config set cube-diary --url https://new-host.com

# Re-fetch OpenAPI spec after server API changes
oac config refresh cube-diary
```

## Authentication

Authentication is handled automatically by `oac` via the `--headers` configured during setup. Tokens have scopes:

| Scope          | Permits                                          |
| -------------- | ------------------------------------------------ |
| `diary:read`   | Read diary entries (list, detail, search, stats) |
| `diary:write`  | Create and update diary entries                  |
| `diary:export` | Export diary data                                |
| `diary:import` | Import diary data                                |

If a command returns **403 Forbidden**, the token lacks the required scope.

## Command Reference

> Replace `<service>` below with the actual service name from `oac config list` (e.g. `local-diary`).
>
> All commands accept `--body <json>`, `--params <json>`, `--query <json>`, `--header <json>`, `--output <file>`, `--timeout <ms>`.
>
> Run `oac <service> <command> --help` to see the full schema for any command.

### Get Month List

```bash
oac <service> post-api-diary-get-month-list --body '{"month":"202603"}'
```

Returns an array of diary entries for the given month (format: `YYYYMM`). Each entry contains `dateStr`, `content`, and `color`.

### Get Diary Detail

```bash
oac <service> post-api-diary-get-detail --body '{"dateStr":"20260309"}'
```

Returns `{ content, color }` for the specified date (format: `YYYYMMDD`).

### Create / Update Diary

```bash
oac <service> post-api-diary-update --body '{
  "dateStr": "20260309",
  "date": 1773100800000,
  "content": "Today'\''s diary content...",
  "color": null
}'
```

Fields:

- `dateStr` (required): Local date string, format `YYYYMMDD` (primary key)
- `date` (required): UTC timestamp in milliseconds — use **local date at 00:00 converted to UTC ms** (for sorting/range queries)
- `content`: Diary text content
- `color`: Optional color tag (string or null)

**Date calculation help:**

`dateStr` is the user's local date in `YYYYMMDD` format. `date` is the UTC millisecond timestamp of that local date at midnight. For example, if the user's timezone is `Asia/Shanghai` (UTC+8):

```
dateStr = "20260309"
local midnight = 2026-03-09T00:00:00+08:00
date = 1773064800000  (= Date.UTC equivalent)
```

Use `date -j -f "%Y%m%d" "20260309" "+%s"` on macOS (or `node -e`) to compute the timestamp, then multiply by 1000.

### Search Diaries

```bash
oac <service> post-api-diary-search --body '{
  "keyword": "search term",
  "desc": true,
  "page": 1,
  "pageSize": 20
}'
```

All fields are optional. Returns `{ total, rows }` where each row contains `dateStr`, `content`, `color`.

### Get Statistics

```bash
oac <service> post-api-diary-statistic --body '{}'
```

Returns `{ diaryCount, diaryLength }`.

### Upload Attachment

```bash
oac <service> post-api-attachments-upload
```

File upload via multipart/form-data. Max size: 512MB. Returns file metadata including `id`.

### Get Attachment Download URL

```bash
oac <service> get-api-attachments-request-file-id --params '{"fileId":"<id>"}'
```

Returns `{ url }` — a signed download URL accessible without authentication.

### Export Diaries

```bash
oac <service> post-api-diary-export --body '{
  "range": "all",
  "dateKey": "dateStr",
  "dateFormatter": "YYYYMMDD",
  "contentKey": "content",
  "colorKey": "color"
}' --output diary-export.json
```

Use `"range": "part"` with `startDate` / `endDate` (UTC ms) to export a subset. Use `--output` to save the result to a file.

### Import Diaries

```bash
oac <service> post-api-diary-import
```

Multipart form-data with `file` (JSON) and `config` JSON string:

```json
{
  "existOperation": "cover",
  "dateKey": "dateStr",
  "dateFormatter": "YYYYMMDD",
  "contentKey": "content",
  "colorKey": "color"
}
```

`existOperation`: `"cover"` | `"merge"` | `"skip"`

## Common Workflows

### Write today's diary

```bash
# 1. Check if today already has content
oac <service> post-api-diary-get-detail --body '{"dateStr":"20260327"}'

# 2. Write or update (compute date timestamp for today)
oac <service> post-api-diary-update --body '{
  "dateStr": "20260327",
  "date": 1774656000000,
  "content": "Today I learned about oac...",
  "color": null
}'
```

If the diary already exists and user didn't say to overwrite, ask whether to **append** to existing content or **replace** it.

### Read recent diary entries

```bash
# 1. Get this month's diary list
oac <service> post-api-diary-get-month-list --body '{"month":"202603"}'

# 2. Pick the latest dateStr from the result, then get detail
oac <service> post-api-diary-get-detail --body '{"dateStr":"20260327"}'
```

### Search and summarize

```bash
# 1. Search with keyword
oac <service> post-api-diary-search --body '{"keyword":"运动","desc":true,"page":1,"pageSize":50}'

# 2. If total > pageSize, paginate to get all results
# 3. Summarize the content for the user
```

## Troubleshooting

| Symptom           | Action                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ |
| Command not found | Run `oac config list` to verify service name                                                                       |
| 401 Unauthorized  | Token invalid/expired — update with `oac config set <service> --headers '{"Authorization":"Bearer csk-NEW"}'`      |
| 403 Forbidden     | Token lacks required scope — ask user for a token with correct permissions                                         |
| Schema mismatch   | Run `oac config refresh <service>` to re-fetch the OpenAPI spec                                                    |
| Unknown command   | The API may have changed — run `oac config refresh <service>`, then `oac <service> --help` to see updated commands |
