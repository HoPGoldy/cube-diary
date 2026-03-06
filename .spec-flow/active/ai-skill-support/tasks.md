# Tasks: AI Skill 支持

## Phase 1: 清理 MCP 模块

### T-001: 删除 MCP 模块文件

- 删除 `packages/backend/src/modules/mcp/` 整个目录
- 卸载 `@modelcontextprotocol/sdk` 和 `zod`
- **验收**: 目录不存在，`package.json` 中无相关依赖

### T-002: 清理 MCP 相关引用

- `src/app/register-service.ts`：删除 McpController 的 import 和注册
- `src/modules/app-config/service.ts`：删除 `getMcpEnabled()` 方法
- **验收**: `tsc --noEmit` 无报错

---

## Phase 2: Swagger 改造

### T-003: 全环境注册 Swagger 插件

- 修改 `packages/backend/src/lib/swagger/index.ts`
- 移除 `if (ENV_IS_PROD) return;` 保护
- 拆分：swagger plugin 全环境注册，swagger UI 仅 dev 注册
- **验收**: 生产环境下 `fastify.swagger()` 不抛异常；dev 下 `/docs` 仍可访问

---

## Phase 3: Exchange 端点

### T-004: 新增 exchange 端点

- 在 `packages/backend/src/modules/access-token/controller.ts` 中新增：
  ```
  POST /api/access-tokens/exchange
  ```
- 请求 body: `{ token: string }`
- 逻辑: `AccessTokenService.verify(token)` → 失败返回 401，成功签发 JWT（`source: "access-token"`, `expiresIn: "2d"`）
- 响应: `{ accessToken: string }`
- 更新 typebox schema
- **验收**: 有效 token 返回 200 + JWT；无效 token 返回 401

---

## Phase 4: AI Skill 端点

### T-005: 安装 jszip 依赖

- 在 `packages/backend/` 运行 `pnpm add jszip`
- **验收**: `package.json` 中存在 `jszip`

### T-006: 实现 SkillService

- 创建 `packages/backend/src/modules/skill/service.ts`
- 实现 `getSkillZip(baseUrl, fastify)` 方法，含 1 小时内存缓存
- 实现 `renderSkillMd(baseUrl)` 模板函数（参照 design.md 中的 SKILL.md 模板）
- 调用 `fastify.swagger()` 获取 OpenAPI JSON
- 使用 `jszip` 打包为 Buffer
- **验收**: 单元调用返回包含两个文件的 zip Buffer

### T-007: 实现 SkillController

- 创建 `packages/backend/src/modules/skill/controller.ts`
- 注册路由 `GET /skill.zip`，`disableAuth: true`
- 从请求头获取真实 `protocol` 和 `host`（支持反向代理）
- 调用 `SkillService.getSkillZip()` 并返回 zip
- **验收**: 请求返回 `Content-Type: application/zip`，zip 含 `SKILL.md` 和 `openapi.json`

### T-008: 注册 Skill 模块

- 在 `packages/backend/src/app/register-service.ts` 中注册 SkillService 和 SkillController
- **验收**: 服务启动无报错，`GET /api/skill.zip` 可访问

---

## Phase 5: 前端更新

### T-009: 创建 AI Skill 设置页

- 创建 `packages/frontend/src/pages/ai-skill-settings/index.tsx`
- 展示说明文案（Alert）
- 展示 skill.zip URL（`Typography.Text copyable`）
- 删除 `packages/frontend/src/pages/mcp-settings/index.tsx`
- **验收**: 设置页可渲染，URL 正确，复制按钮可用

### T-010: 更新用户设置菜单

- `use-setting-menu.tsx`: 将"MCP 设置"改为"AI Skill 设置"，更新 icon
- `user-setting/index.tsx`: 渲染 AI Skill 设置 Modal，移除 MCP Modal
- **验收**: 设置菜单显示"AI Skill 设置"，点击打开正确 Modal

---

## Phase 6: 测试更新

### T-011: 更新 E2E 测试

- 修改 `packages/e2e/tests/access-token.spec.ts`
- 将调用 `/api/mcp` 的测试用例改为调用 `/api/access-tokens/exchange`
- 验证 exchange 返回 JWT，JWT 可访问受保护接口
- **验收**: `npx playwright test --list` 全部显示，无编译错误

---

## 任务依赖关系

```
T-001 → T-002 → T-003
T-003 → T-006 → T-007 → T-008

T-004（独立，可与 T-005+ 并行）

T-003 → T-009 → T-010

T-008 + T-004 → T-011
```

## 估时

| 任务                   | 估时      |
| ---------------------- | --------- |
| T-001 清理 MCP 文件    | 10 min    |
| T-002 清理 MCP 引用    | 10 min    |
| T-003 Swagger 改造     | 15 min    |
| T-004 Exchange 端点    | 20 min    |
| T-005 安装 jszip       | 5 min     |
| T-006 SkillService     | 30 min    |
| T-007 SkillController  | 15 min    |
| T-008 注册模块         | 5 min     |
| T-009 前端 AI Skill 页 | 20 min    |
| T-010 更新菜单         | 10 min    |
| T-011 更新 E2E         | 15 min    |
| **合计**               | **~2.5h** |
