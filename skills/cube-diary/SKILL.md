---
name: cube-diary
description: "Interact with the cube-diary API to read, write, search, and manage diary entries and attachments. Trigger: 'diary', 'write diary', 'read diary', 'journal', 'cube-diary', '日记', '写日记', '读日记', '查日记'."
---

# cube-diary API Skill

This skill enables AI agents to interact with a cube-diary server instance via its REST API.

## When to Use

Use this skill when the user wants to:

- Read, create, update, or search diary entries
- Upload or download file attachments
- Export or import diary data
- Get diary statistics

## Setup

Before first use, ask the user for:

1. **Server base URL** (e.g. `https://example.com` or `http://localhost:3499`)
2. **Access Token** (format: `csk-<hex string>`)

Save these to `.env.local` in the current workspace:

```
CUBE_DIARY_BASE_URL=https://example.com
CUBE_DIARY_TOKEN=csk-xxxxxxxxxxxxxxxx
```

If `.env.local` already exists and contains these values, skip the setup step.

## Authentication

All API requests (except file download) require the `Authorization` header:

```
Authorization: Bearer csk-xxxxxxxxxxxxxxxx
```

The token prefix is always `csk-`. Tokens have scopes that control access:

| Scope          | Permits                                          |
| -------------- | ------------------------------------------------ |
| `diary:read`   | Read diary entries (list, detail, search, stats) |
| `diary:write`  | Create and update diary entries                  |
| `diary:export` | Export diary data                                |
| `diary:import` | Import diary data                                |

If a request returns **403 Forbidden**, the token lacks the required scope.

## API Reference

Base path: `{CUBE_DIARY_BASE_URL}/api`

### Get Month List

`POST /api/diary/get-month-list`

```json
{ "month": "202603" }
```

Returns an array of diary entries for the given month (format: `YYYYMM`). Each entry contains `dateStr`, `content`, and `color`.

### Get Diary Detail

`POST /api/diary/get-detail`

```json
{ "dateStr": "20260309" }
```

Returns `{ content, color }` for the specified date (format: `YYYYMMDD`).

### Create / Update Diary

`POST /api/diary/update`

```json
{
  "dateStr": "20260309",
  "date": 1773100800000,
  "content": "Today's diary content...",
  "color": null
}
```

- `dateStr`: Local date string, format `YYYYMMDD` (primary key)
- `date`: UTC timestamp in milliseconds (used for sorting/range queries)
- `content`: Diary text content
- `color`: Optional color tag (string or null)

### Search Diaries

`POST /api/diary/search`

```json
{
  "keyword": "search term",
  "colors": [],
  "desc": true,
  "page": 1,
  "pageSize": 20
}
```

All fields are optional. Returns `{ total, rows }`.

### Get Statistics

`POST /api/diary/statistic`

```json
{}
```

Returns `{ diaryCount, diaryLength }`.

### Upload Attachment

`POST /api/attachments/upload`

Content-Type: `multipart/form-data`, field name: `file`. Max size: 512MB. Returns file metadata including `id`.

### Get Attachment Download URL

`GET /api/attachments/request/{fileId}`

Returns `{ url }` — a signed download URL that can be accessed without authentication.

### Export Diaries

`POST /api/diary/export`

```json
{
  "range": "all",
  "dateKey": "dateStr",
  "dateFormatter": "YYYYMMDD",
  "contentKey": "content",
  "colorKey": "color"
}
```

Use `"range": "part"` with `startDate` / `endDate` (UTC ms) to export a subset.

### Import Diaries

`POST /api/diary/import`

Multipart form-data with:

- `file`: JSON file to import
- `config`: JSON string with `{ existOperation, dateKey, dateFormatter, contentKey, colorKey }`

`existOperation`: `"cover"` | `"merge"` | `"skip"`

## Troubleshooting

If an API call fails or the schema seems outdated, download the latest OpenAPI spec (development environment only):

```
GET {CUBE_DIARY_BASE_URL}/docs/json
```

This returns the full OpenAPI 3.0 JSON definition with all current endpoints and schemas. The Swagger UI is also available at `{CUBE_DIARY_BASE_URL}/docs` in development mode.

## Example: Write Today's Diary

```bash
curl -X POST "${CUBE_DIARY_BASE_URL}/api/diary/update" \
  -H "Authorization: Bearer ${CUBE_DIARY_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "dateStr": "20260309",
    "date": 1773100800000,
    "content": "Example diary entry.",
    "color": null
  }'
```
