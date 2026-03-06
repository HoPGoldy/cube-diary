# Requirements: AI Skill 支持

## 功能需求

### Access Token 兑换 JWT

**FR-001** 系统应提供 `POST /api/access-tokens/exchange` 端点，接受 `{ token: string }` body，验证通过后返回一个短期 JWT。

**FR-002** 兑换出的 JWT payload 应包含 `source: "access-token"` 字段，以便与登录 JWT 区分。

**FR-003** 兑换出的 JWT 有效期为 2 天。

**FR-004** access token 验证失败时，`/exchange` 接口返回 `401 Unauthorized`。

**FR-005** 兑换成功同时更新 access token 的 `lastUsedAt`。

### AI Skill 端点

**FR-006** 系统应提供公开的 `GET /api/skill.zip` 端点（`disableAuth: true`），返回 zip 文件。

**FR-007** zip 包内应遵循 agent skill 规范，包含以下文件：

- `SKILL.md`：含服务描述、认证流程（如何用 access token 换 JWT）、5–8 个常用操作示例，通过相对路径 `./assets/openapi.json` 引用完整 API 规范
- `assets/openapi.json`：完整的 OpenAPI 3.0 规范，从运行中的服务动态生成

**FR-008** `SKILL.md` 中的 base URL 应从当前请求的 `origin`（`protocol + host`）动态注入，确保无论用户如何部署都准确。

**FR-009** zip 包应在内存中缓存，缓存有效期为 1 小时；超时后下次请求时重新生成。

**FR-010** OpenAPI Swagger 插件在所有环境（含生产）下均应注册以生成 OpenAPI JSON；但 Swagger UI（`/docs`）仅在开发环境注册。

### 删除 MCP 模块

**FR-011** 删除以下文件：

- `packages/backend/src/modules/mcp/controller.ts`
- `packages/backend/src/modules/mcp/server.ts`
- `packages/backend/src/modules/mcp/tools/diary.ts`
- `packages/backend/src/modules/mcp/tools/attachment.ts`

**FR-012** 从 `register-service.ts` 中移除 MCP 模块的注册逻辑。

**FR-013** 卸载 `@modelcontextprotocol/sdk` 和 `zod` 依赖。

### 前端

**FR-014** 前端设置页改为"AI Skill 设置"，展示 skill.zip 的完整 URL（含 `basePath`）供用户复制。

**FR-015** 设置页提供一个可一键复制的完整提示句，用户复制后可直接发给 AI 助手，格式为：

> "请下载并安装以下 skill 来帮我管理日记数据：`{skillZipUrl}`"

**FR-016** MCP 开关相关 UI 全部移除（`mcp.enabled` 的 app-config 读写）。

## 非功能需求

**NFR-001** skill.zip 端点响应时间应在 500ms 以内（缓存命中时 < 50ms）。

**NFR-002** 兑换出的 JWT 生成逻辑复用现有 `signJwtToken` 工具函数。

## 验收标准

**AC-001** 使用有效 access token 调用 `/exchange`，验证返回 JWT 可正常请求受保护接口。

**AC-002** 使用无效 access token 调用 `/exchange`，验证返回 401。

**AC-003** `GET /skill.zip` 返回 200，Content-Type 为 `application/zip`，解压后含 `SKILL.md` 和 `openapi.json`。

**AC-004** `SKILL.md` 中的 base URL 与请求 host 一致。

**AC-005** 连续两次请求 `/skill.zip`，第二次使用缓存（响应时间明显短于第一次）。

**AC-006** 生产环境下 `/api-json`（或等效端点）可访问 OpenAPI JSON，`/docs` 不可访问。
