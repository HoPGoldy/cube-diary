# Access Token 权限范围 (Scopes) - 任务清单

> **状态**: 未开始
> **设计文档**: [design.md](./design.md)
> **开始日期**: 2026-03-09

---

## 🎛️ 执行模式 (AI Agent 必读)

| 模式                | 触发词                            | 行为                         |
| ------------------- | --------------------------------- | ---------------------------- |
| **单步模式** (默认) | "开始执行"、"start"               | 执行一个任务，等待确认，重复 |
| **批量模式**        | "全部执行"、"一口气执行"、"batch" | 连续执行所有任务，最后汇报   |
| **阶段模式**        | "执行第一阶段"、"execute setup"   | 执行一个阶段的任务，然后等待 |

---

## 概览

| Phase          | Tasks | Completed | Progress |
| -------------- | ----- | --------- | -------- |
| Setup          | 2     | 0         | 0%       |
| Implementation | 4     | 0         | 0%       |
| Integration    | 2     | 0         | 0%       |
| **Total**      | **8** | **0**     | **0%**   |

## Task Breakdown

### Phase 1: Setup

- [x] **T-001**: Prisma schema 添加 scopes 字段并运行迁移
  - **Complexity**: Low
  - **Files**: `packages/backend/prisma/schema.prisma`
  - **Dependencies**: None
  - **Notes**: `scopes String @default("[]")`，运行 `npx prisma migrate dev --name add-access-token-scopes`

- [x] **T-002**: 新建 scope 常量与类型定义文件
  - **Complexity**: Low
  - **Files**: `packages/backend/src/modules/access-token/scopes.ts`
  - **Dependencies**: None
  - **Notes**: 定义 `ACCESS_TOKEN_SCOPES` 数组、`AccessTokenScope` 类型、`DEFAULT_SCOPES`

### Phase 2: Core Implementation

- [x] **T-010**: 更新 TypeBox schema，增加 scopes 相关字段
  - **Complexity**: Low
  - **Files**: `packages/backend/src/types/access-token.ts`
  - **Dependencies**: T-002
  - **Notes**: Create/Response/ListItem 加 scopes，新增 SchemaAccessTokenUpdate

- [x] **T-011**: 更新 AccessTokenService，create/update/findAll/verify 支持 scopes
  - **Complexity**: Medium
  - **Files**: `packages/backend/src/modules/access-token/service.ts`
  - **Dependencies**: T-001, T-010
  - **Notes**: 缓存结构改为 `Map<hash, {id, scopes}>`，新增 `update()` 方法，`create()` 增加 scopes 参数

- [x] **T-012**: 更新 AccessToken controller，create 接收 scopes，新增 update 路由
  - **Complexity**: Low
  - **Files**: `packages/backend/src/modules/access-token/controller.ts`
  - **Dependencies**: T-010, T-011
  - **Notes**: `POST /access-tokens` body 加 scopes，新增 `POST /access-tokens/update`

- [x] **T-013**: 更新 Auth hook，扩展类型声明并添加 scope 校验逻辑
  - **Complexity**: Medium
  - **Files**: `packages/backend/src/modules/auth/controller.ts`
  - **Dependencies**: T-011
  - **Notes**: FastifyContextConfig 加 `requiredScopes`，user 加 `scopes`，preHandler 增加 scope 检查

- [x] **T-014**: Diary controller 每个路由声明 requiredScopes
  - **Complexity**: Low
  - **Files**: `packages/backend/src/modules/diary/controller.ts`
  - **Dependencies**: T-013
  - **Notes**: 7 个路由分别配置 `config.requiredScopes`

### Phase 3: Integration

- [x] **T-020**: 确认编译无报错，TypeScript 检查通过
  - **Complexity**: Low
  - **Files**: N/A
  - **Dependencies**: T-015
  - **Notes**: 运行 `pnpm lint` 检查

- [x] **T-021**: Git commit
  - **Complexity**: Low
  - **Files**: N/A
  - **Dependencies**: T-020
  - **Notes**: `feat: add scopes to access token`
