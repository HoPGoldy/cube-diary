# Tasks: MCP 支持

## 进度总览

- 阶段一：数据库 & 基础设施（T-001 ~ T-003）
- 阶段二：Access Token 模块（T-004 ~ T-007）
- 阶段三：MCP 模块（T-008 ~ T-013）
- 阶段四：前端（T-014 ~ T-018）

---

## 阶段一：数据库 & 基础设施

### T-001 — 新增 AccessToken 数据库模型

- **状态**: ✅ Done
- **复杂度**: Low
- **影响文件**: `packages/backend/prisma/schema.prisma`
- **依赖**: 无
- **内容**: 在 schema.prisma 中新增 `AccessToken` 模型，字段包括 id、name、tokenHash、tokenPrefix、createdAt、lastUsedAt

### T-002 — 运行数据库迁移

- **状态**: ✅ Done
- **复杂度**: Low
- **影响文件**: `packages/backend/prisma/migrations/`
- **依赖**: T-001
- **内容**: 在 backend 目录运行 `npx prisma migrate dev --name add-access-token`，更新 prisma client

### T-003 — 安装 MCP SDK 依赖

- **状态**: ✅ Done
- **复杂度**: Low
- **影响文件**: `packages/backend/package.json`
- **依赖**: 无
- **内容**: 在 backend 安装 `@modelcontextprotocol/sdk`

---

## 阶段二：Access Token 模块（后端）

### T-004 — 定义 Access Token 类型

- **状态**: ✅ Done
- **复杂度**: Low
- **影响文件**: `packages/backend/src/types/access-token.ts`
- **依赖**: T-001
- **内容**: 用 typebox 定义 `SchemaAccessTokenCreate`（body）、`SchemaAccessTokenCreateResponse`（含明文 token）、`SchemaAccessTokenListItem`

### T-005 — 实现 AccessTokenService

- **状态**: ✅ Done
- **复杂度**: Medium
- **影响文件**: `packages/backend/src/modules/access-token/service.ts`
- **依赖**: T-002, T-004
- **内容**: 实现 `create(name)`、`findAll()`、`delete(id)`、`verify(plainToken)` 四个方法

### T-006 — 实现 AccessToken Controller

- **状态**: ✅ Done
- **复杂度**: Low
- **影响文件**: `packages/backend/src/modules/access-token/controller.ts`
- **依赖**: T-005
- **内容**: 注册 `POST /access-tokens`、`GET /access-tokens`、`DELETE /access-tokens/:id` 三个路由

### T-007 — 注册 AccessToken 模块到 App

- **状态**: ✅ Done
- **复杂度**: Low
- **影响文件**: `packages/backend/src/app/register-service.ts`（或 register-plugin.ts）
- **依赖**: T-006
- **内容**: 在应用启动时实例化 `AccessTokenService`，注册 `AccessToken` controller

---

## 阶段三：MCP 模块（后端）

### T-008 — 实现 MCP Tool：diary 相关（4个）

- **状态**: ✅ Done
- **复杂度**: Medium
- **影响文件**: `packages/backend/src/modules/mcp/tools/diary.ts`
- **依赖**: T-003
- **内容**: 定义并注册 `diary_get_month`、`diary_get_detail`、`diary_update`、`diary_search`，直接调用 `DiaryService`

### T-009 — 实现 MCP Tool：attachment 相关（2个）

- **状态**: ✅ Done
- **复杂度**: Medium
- **影响文件**: `packages/backend/src/modules/mcp/tools/attachment.ts`
- **依赖**: T-003
- **内容**: 定义并注册 `attachment_upload`（base64 解码后调 `AttachmentService.uploadFile`，返回 markdown 字符串）、`attachment_get_info`（调 `AttachmentService.getFileInfo`）

### T-010 — 实现 MCP Server 主体

- **状态**: ✅ Done
- **复杂度**: Medium
- **影响文件**: `packages/backend/src/modules/mcp/server.ts`
- **依赖**: T-008, T-009
- **内容**: 初始化 `@modelcontextprotocol/sdk` 的 `McpServer`，注册所有 tool，导出 server 实例

### T-011 — 实现 MCP Controller（鉴权 + 开关）

- **状态**: ✅ Done
- **复杂度**: Medium
- **影响文件**: `packages/backend/src/modules/mcp/controller.ts`
- **依赖**: T-010, T-005
- **内容**: 注册 `POST /mcp` 路由；preHandler 中：(1) 验证 access token（调 `verify()`），失败返回 401；(2) 检查 `mcp.enabled`，false 返回 503；handler 转发请求给 McpServer

### T-012 — 在 AppConfigService 中补充 mcp.enabled 默认值处理

- **状态**: ✅ Done
- **复杂度**: Low
- **影响文件**: `packages/backend/src/modules/app-config/service.ts`
- **依赖**: 无
- **内容**: 新增 `getMcpEnabled()` 方法，读取 `mcp.enabled`，key 不存在时默认返回 `false`

### T-013 — 注册 MCP 模块到 App

- **状态**: ✅ Done
- **复杂度**: Low
- **影响文件**: `packages/backend/src/app/register-service.ts`（或 register-plugin.ts）
- **依赖**: T-011, T-012
- **内容**: 注册 MCP controller，传入所需 service 实例

---

## 阶段四：前端

### T-014 — 前端 Access Token 服务层

- **状态**: ✅ Done
- **复杂度**: Low
- **影响文件**: `packages/frontend/src/services/access-token.ts`
- **依赖**: T-007
- **内容**: 用 react-query / mutation 封装三个接口：创建、列表、删除

### T-015 — Access Token 管理页

- **状态**: ✅ Done
- **复杂度**: Medium
- **影响文件**: `packages/frontend/src/pages/access-token/index.tsx`
- **依赖**: T-014
- **内容**: Token 列表 Table + 新建弹窗（展示明文 + 一次性警告 + 复制按钮）+ 删除确认

### T-016 — 前端 MCP 设置服务层

- **状态**: ✅ Done
- **复杂度**: Low
- **影响文件**: 复用 `packages/frontend/src/services/app-config.ts`
- **依赖**: T-012
- **内容**: 确认 app-config 服务层支持读写 `mcp.enabled`，不够则补充

### T-017 — MCP 设置页

- **状态**: ✅ Done
- **复杂度**: Medium
- **影响文件**: `packages/frontend/src/pages/mcp-settings/index.tsx`
- **依赖**: T-013, T-016
- **内容**: MCP 开关 + endpoint 展示 + Access Token 使用说明 tip + 跳转 Token 管理页入口

### T-018 — 注册新页面到路由

- **状态**: ✅ Done
- **复杂度**: Low
- **影响文件**: `packages/frontend/src/route.tsx`
- **依赖**: T-015, T-017
- **内容**: 将 Token 管理页和 MCP 设置页注册到路由
