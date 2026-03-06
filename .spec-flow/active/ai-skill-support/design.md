# Design: AI Skill 支持

## 总体架构

```
AccessToken (DB)
     │
     ▼
POST /api/access-tokens/exchange
     │  验证 token hash
     │  返回短期 JWT (source: "access-token", exp: 2d)
     ▼
受保护 API（diary / attachment / ...）
     │
     └──── GET /api/skill.zip (公开，无鉴权)
                │
                ├── SkillService.generateZip(baseUrl)
                │         ├── server.swagger() → openapi.json
                │         └── renderSkillMd(baseUrl) → SKILL.md
                │
                └── 内存缓存 (TTL 1h, key = baseUrl)
```

---

## 1. Exchange 端点

### `POST /api/access-tokens/exchange`

- **鉴权**: `disableAuth: true`（公开端点，通过 access token 鉴权）
- **Body schema**（typebox）:
  ```ts
  Type.Object({ token: Type.String() });
  ```
- **Response schema**:
  ```ts
  Type.Object({ accessToken: Type.String() });
  ```
- **逻辑**:
  1. 调用 `AccessTokenService.verify(body.token)` → 返回 AccessToken 记录或 null
  2. 若 null → `reply.code(401).send({ message: "Invalid access token" })`
  3. 若有效 → 调用 `fastify.jwt.sign({ id: "access-token-user", source: "access-token" }, { expiresIn: "2d" })`
  4. 返回 `{ accessToken: token }`

> 注：`id` 字段值为固定字符串，不代表真实用户，主要用于日志标识；下游接口可通过 `source` 字段判断来源类型。

---

## 2. Swagger 改造

### 当前状态

```ts
// lib/swagger/index.ts (当前)
export async function registerSwagger(fastify) {
  if (ENV_IS_PROD) return;  // ← 阻止生产注册
  await fastify.register(swagger, { ... });
  await fastify.register(swaggerUi, { ... });
}
```

### 改造后

```ts
export async function registerSwagger(fastify) {
  // 所有环境都注册 swagger plugin（用于 server.swagger() 生成 JSON）
  await fastify.register(swagger, {
    openapi: { ... }
  });

  // 仅 dev 注册 Swagger UI
  if (!ENV_IS_PROD) {
    await fastify.register(swaggerUi, { routePrefix: "/docs", ... });
  }
}
```

这样在生产环境 `fastify.swagger()` 可正常调用，但 `/docs` 路由不挂载。

---

## 3. SkillService

**文件**: `packages/backend/src/modules/skill/service.ts`

```ts
interface CacheEntry {
  zip: Buffer;
  expiresAt: number;
}

export class SkillService {
  private cache = new Map<string, CacheEntry>();

  async getSkillZip(
    baseUrl: string,
    fastify: FastifyInstance,
  ): Promise<Buffer> {
    const now = Date.now();
    const cached = this.cache.get(baseUrl);
    if (cached && cached.expiresAt > now) return cached.zip;

    const zip = await this.buildZip(baseUrl, fastify);
    this.cache.set(baseUrl, { zip, expiresAt: now + 60 * 60 * 1000 });
    return zip;
  }

  private async buildZip(
    baseUrl: string,
    fastify: FastifyInstance,
  ): Promise<Buffer> {
    const openapi = JSON.stringify(fastify.swagger(), null, 2);
    const skillMd = renderSkillMd(baseUrl);

    const JSZip = (await import("jszip")).default;
    const z = new JSZip();
    z.folder("assets")!.file("openapi.json", openapi);
    z.file("SKILL.md", skillMd);
    return z.generateAsync({ type: "nodebuffer" });
  }
}
```

---

## 4. SKILL.md 模板

baseUrl 示例：`https://your-diary.example.com`

````markdown
# Cube Diary Skill

Cube Diary is a personal knowledge management tool supporting diary entries, articles, attachments, and tags.

## Base URL

{baseUrl}

## Authentication

All API requests require a Bearer JWT. To obtain a JWT, exchange your Access Token:

```http
POST {baseUrl}/api/access-tokens/exchange
Content-Type: application/json

{ "token": "<YOUR_ACCESS_TOKEN>" }
```

Response: `{ "accessToken": "<JWT>" }`

Use it in subsequent requests:

```
Authorization: Bearer <JWT>
```

## Common Operations

### Create a Diary Entry

```http
POST {baseUrl}/api/diary
Authorization: Bearer <JWT>
Content-Type: application/json

{ "content": "Today was productive.", "dateStr": "2025-03-01" }
```

### List Diary Entries

```http
GET {baseUrl}/api/diary?page=1&pageSize=20
Authorization: Bearer <JWT>
```

### Upload an Attachment

```http
POST {baseUrl}/api/attachments
Authorization: Bearer <JWT>
Content-Type: multipart/form-data

file=@/path/to/file
```

## Full API Reference

See the full OpenAPI specification in `./assets/openapi.json`.
````

---

## 5. SkillController

**文件**: `packages/backend/src/modules/skill/controller.ts`

```ts
fastify.get(
  "/skill.zip",
  {
    config: { disableAuth: true },
    schema: { hide: true }, // 不暴露在 swagger 文档里
  },
  async (request, reply) => {
    const protocol = request.headers["x-forwarded-proto"] ?? request.protocol;
    const host = request.headers["x-forwarded-host"] ?? request.hostname;
    const baseUrl = `${protocol}://${host}`;

    const zip = await skillService.getSkillZip(baseUrl, fastify);

    reply
      .header("Content-Type", "application/zip")
      .header("Content-Disposition", "attachment; filename=skill.zip")
      .send(zip);
  },
);
```

---

## 6. 前端 AI Skill 设置页

**文件**: `packages/frontend/src/pages/ai-skill-settings/index.tsx`（替换 `mcp-settings/`）

### 内容

- **标题**: AI Skill 设置
- **说明文案**（Alert 组件）: 复制下方提示句，直接发送给你的 AI 助手即可安装此 skill。
- **一键复制提示句**:
  ```
  请下载并安装以下 skill 来帮我管理日记数据：{skillZipUrl}
  ```
  使用 `Typography.Text copyable` 展示完整句子，`value` 为纯文本（不含 markdown 格式），方便直接粘贴发给 AI。

---

## 7. 文件变更清单

### 新增

| 文件                                    | 说明                            |
| --------------------------------------- | ------------------------------- |
| `src/modules/skill/service.ts`          | SkillService（zip 生成 + 缓存） |
| `src/modules/skill/controller.ts`       | `GET /api/skill.zip` 路由       |
| `src/pages/ai-skill-settings/index.tsx` | 前端 AI Skill 设置 Modal        |

### 修改

| 文件                                          | 说明                                   |
| --------------------------------------------- | -------------------------------------- |
| `src/lib/swagger/index.ts`                    | 全环境注册 swagger plugin              |
| `src/modules/access-token/controller.ts`      | 新增 `/exchange` 端点                  |
| `src/app/register-service.ts`                 | 注册 SkillService/Controller，删除 MCP |
| `src/modules/app-config/service.ts`           | 删除 `getMcpEnabled()`                 |
| `src/pages/user-setting/use-setting-menu.tsx` | MCP → AI Skill                         |
| `src/pages/user-setting/index.tsx`            | 渲染 AI Skill Modal                    |
| `packages/e2e/tests/access-token.spec.ts`     | 更新测试（MCP → exchange 端点）        |

### 删除

| 文件                                  | 说明                 |
| ------------------------------------- | -------------------- |
| `src/modules/mcp/controller.ts`       | MCP HTTP controller  |
| `src/modules/mcp/server.ts`           | MCP server 实例      |
| `src/modules/mcp/tools/diary.ts`      | MCP diary tools      |
| `src/modules/mcp/tools/attachment.ts` | MCP attachment tools |
| `src/pages/mcp-settings/index.tsx`    | 前端 MCP 设置页      |

### 卸载依赖

- `@modelcontextprotocol/sdk`
- `zod`
