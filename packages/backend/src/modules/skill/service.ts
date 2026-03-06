import type { AppInstance } from "@/types";
import JSZip from "jszip";

interface CacheEntry {
  zip: Buffer;
  expiresAt: number;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function renderSkillMd(baseUrl: string): string {
  return `# Cube Diary Skill

Cube Diary is a personal knowledge management tool supporting diary entries, articles, attachments, and tags.

## Base URL

\`${baseUrl}\`

## Authentication

All API requests require a Bearer JWT. To obtain a JWT, exchange your Access Token:

\`\`\`http
POST ${baseUrl}/api/access-tokens/exchange
Content-Type: application/json

{ "token": "<YOUR_ACCESS_TOKEN>" }
\`\`\`

Response: \`{ "accessToken": "<JWT>" }\`

Use the token in subsequent requests:

\`\`\`
Authorization: Bearer <JWT>
\`\`\`

> The JWT is valid for 2 days. Re-exchange when it expires.

## Common Operations

### Create a Diary Entry

\`\`\`http
POST ${baseUrl}/api/diary
Authorization: Bearer <JWT>
Content-Type: application/json

{ "content": "Today was productive.", "dateStr": "2025-03-01" }
\`\`\`

### Get Diary Entry by Date

\`\`\`http
GET ${baseUrl}/api/diary/by-date?dateStr=2025-03-01
Authorization: Bearer <JWT>
\`\`\`

### List Diary Entries

\`\`\`http
GET ${baseUrl}/api/diary?page=1&pageSize=20
Authorization: Bearer <JWT>
\`\`\`

### Update a Diary Entry

\`\`\`http
PUT ${baseUrl}/api/diary/:id
Authorization: Bearer <JWT>
Content-Type: application/json

{ "content": "Updated content." }
\`\`\`

### Upload an Attachment

\`\`\`http
POST ${baseUrl}/api/attachments
Authorization: Bearer <JWT>
Content-Type: multipart/form-data

file=@/path/to/file
\`\`\`

### Get Attachment Info

\`\`\`http
GET ${baseUrl}/api/attachments/:id
Authorization: Bearer <JWT>
\`\`\`

## Full API Reference

See the complete OpenAPI specification in \`./assets/openapi.json\`.
`;
}

export class SkillService {
  private cache = new Map<string, CacheEntry>();

  async getSkillZip(baseUrl: string, server: AppInstance): Promise<Buffer> {
    const now = Date.now();
    const cached = this.cache.get(baseUrl);
    if (cached && cached.expiresAt > now) {
      return cached.zip;
    }

    const zip = await this.buildZip(baseUrl, server);
    this.cache.set(baseUrl, { zip, expiresAt: now + CACHE_TTL_MS });
    return zip;
  }

  private async buildZip(
    baseUrl: string,
    server: AppInstance,
  ): Promise<Buffer> {
    const openapiJson = JSON.stringify((server as any).swagger(), null, 2);
    const skillMd = renderSkillMd(baseUrl);

    const z = new JSZip();
    z.folder("assets")!.file("openapi.json", openapiJson);
    z.file("SKILL.md", skillMd);

    return z.generateAsync({ type: "nodebuffer" });
  }
}
