# Requirements: MCP 支持

## 功能需求

### Access Token 模块

**FR-001** 系统应支持创建 Access Token，创建时生成随机明文 token，仅在响应中返回一次明文，后续只存储 SHA-256 hash 和前 8 位前缀。

**FR-002** 系统应支持为 Access Token 指定一个备注名称（name），便于用户识别。

**FR-003** 系统应支持列出所有 Access Token，返回 id、name、tokenPrefix、createdAt、lastUsedAt，不返回 hash 值。

**FR-004** 系统应支持通过 id 删除指定 Access Token，删除后该 token 立即失效。

**FR-005** Access Token 不设过期时间，用户通过删除操作手动吊销。

### MCP 管理模块

**FR-006** 系统应支持通过 `mcp.enabled` 配置项控制 MCP 服务的开启与关闭，该配置复用现有 `app-config` 模块。

**FR-007** 当 `mcp.enabled` 为 `false` 时，所有 `/mcp` 路由请求应返回 HTTP 503。

**FR-008** `/mcp` 路由应独立进行 Access Token 鉴权：从 `Authorization: Bearer <token>` 中取出 token，计算 hash 后与数据库比对，验证通过同时更新 `lastUsedAt`。

**FR-009** `/mcp` 路由不走 JWT 鉴权，普通 REST API 路由不走 Access Token 鉴权，两套鉴权完全隔离。

### MCP Tools

**FR-010** MCP server 应暴露以下工具，工具描述使用英文：

| Tool                  | 描述                                                                                      |
| --------------------- | ----------------------------------------------------------------------------------------- |
| `diary_get_month`     | Get all diary entries for a given month (YYYYMM)                                          |
| `diary_get_detail`    | Get the diary entry for a specific date (YYYYMMDD)                                        |
| `diary_update`        | Create or update the diary entry for a specific date                                      |
| `diary_search`        | Full-text search across diary entries                                                     |
| `attachment_upload`   | Upload a file (base64 + filename + mimeType) and return a markdown string ready to insert |
| `attachment_get_info` | Get metadata of a file by ID (filename, type, size)                                       |

**FR-011** `attachment_upload` 工具上传成功后，返回格式为 `![filename](:api-attachment:FILE_ID)`（图片）或 `[filename](:api-attachment:FILE_ID)`（非图片）的 markdown 字符串。

### 前端

**FR-012** 前端应提供 Access Token 管理页，支持：新建 token（展示一次明文，提示用户复制）、查看 token 列表（prefix + name + 时间）、删除 token。

**FR-013** 前端应提供 MCP 设置页，包含：MCP 开启/关闭开关、MCP endpoint 地址展示、Access Token 的使用说明（提示 token 仅用于 MCP 接入）。

## 非功能需求

**NFR-001** MCP server 使用 Streamable HTTP 协议（非 SSE），符合 MCP 最新规范。

**NFR-002** Access Token 明文仅在创建响应中出现一次，数据库不存储明文。

**NFR-003** MCP `/mcp` 路由的 access token 验证每次请求均查库，以支持即时吊销。

**NFR-004** attachment_upload 工具应限制单文件大小不超过 10MB。

## 验收标准

**AC-001** 创建 token 后，使用返回的明文 token 调用 `/mcp`，验证可正常通过鉴权。

**AC-002** 删除 token 后，使用原 token 调用 `/mcp`，验证返回 `401 Unauthorized`。

**AC-003** 将 `mcp.enabled` 设为 false 后，调用 `/mcp`，验证返回 `503 Service Unavailable`。

**AC-004** 通过 MCP Inspector 或 Claude Desktop 接入，验证 6 个 tool 可正常调用。

**AC-005** 使用 `attachment_upload` 上传图片后，将返回的 markdown 字符串插入日记，日记渲染器能正常显示图片。
