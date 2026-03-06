---
name: dev-guidelines
description: "Project development guidelines and code conventions. AI agents MUST read this skill before writing any code. Trigger: any code generation, feature development, bug fix, refactoring, module creation, or code review task. Covers: monorepo structure, backend/frontend patterns, naming conventions, TypeBox schemas, DI pattern, error handling, testing, and commit rules."
---

# Dev Guidelines — cube-\* 项目开发规范

本项目是 pnpm monorepo，结构为 `packages/backend` + `packages/frontend` + `packages/e2e`。

## 项目结构

```
packages/
├── backend/
│   ├── prisma/schema.prisma          # 数据模型
│   ├── src/
│   │   ├── index.ts                  # 入口
│   │   ├── app/
│   │   │   ├── build-app.ts          # Fastify 实例构建
│   │   │   ├── register-plugin.ts    # 插件注册 (JWT, multipart, swagger)
│   │   │   └── register-service.ts   # 手动依赖注入 & 路由注册
│   │   ├── config/env.ts             # 环境变量
│   │   ├── lib/                      # 通用库 (unify-response, security)
│   │   ├── modules/                  # 业务模块
│   │   │   └── <module>/
│   │   │       ├── controller.ts     # 路由定义
│   │   │       ├── service.ts        # 业务逻辑
│   │   │       ├── error.ts          # 模块专属错误 (可选)
│   │   │       └── __tests__/        # 单元测试 (可选)
│   │   └── types/                    # TypeBox schema 定义
│   └── storage/                      # SQLite 数据库文件
├── frontend/
│   ├── src/
│   │   ├── route.tsx                 # React Router 路由定义
│   │   ├── layouts/                  # 布局组件
│   │   ├── pages/                    # 页面组件
│   │   ├── services/                 # API 调用层 (TanStack Query)
│   │   ├── store/                    # Jotai 状态管理
│   │   ├── types/                    # 前端类型定义
│   │   └── utils/                    # 工具函数
│   └── vite.config.ts
└── e2e/                              # Playwright E2E 测试
```

## 技术栈速查

| 层       | 技术                                         |
| -------- | -------------------------------------------- |
| 后端框架 | Fastify 5 + TypeBox 验证                     |
| 数据库   | SQLite + Prisma ORM (better-sqlite3 adapter) |
| 认证     | @fastify/jwt                                 |
| 前端框架 | React 18 + TypeScript + Vite                 |
| UI 库    | Ant Design 5                                 |
| 状态管理 | Jotai                                        |
| 数据请求 | TanStack React Query + Axios                 |
| 路由     | React Router DOM v7                          |
| CSS      | Tailwind CSS + Less                          |
| 代码规范 | ESLint + Prettier + husky + lint-staged      |
| 提交规范 | commitlint (conventional commits)            |

## 路径别名

- 后端：`@/*` → `src/*`，`@db/*` → `prisma/client/*`
- 前端：`@/*` → `src/*`，`@shared-types/*` → 后端类型

## 文件命名

- 文件和文件夹统一使用 **kebab-case**（烤肉串命名），如 `app-config/`、`register-service.ts`、`access-token.ts`

## 后端开发规范

### 依赖注入

手动 DI，在 `register-service.ts` 中组装：

```typescript
// 1. 创建 service 实例，传入依赖
const diaryService = new DiaryService({ prisma });

// 2. 在 controller plugin 中注册路由
const appControllerPlugin = async (server: AppInstance) => {
  registerDiaryController({ server, diaryService });
};

// 3. 注册到 /api 前缀下
await instance.register(appControllerPlugin, { prefix: "/api" });
```

### Controller 模式

```typescript
// modules/<name>/controller.ts
interface RegisterOptions {
  server: AppInstance;
  someService: SomeService;
}

export async function registerSomeController(options: RegisterOptions) {
  const { server, someService } = options;

  server.post(
    "/some/action",
    {
      schema: {
        description: "描述",
        tags: ["some"],
        body: SchemaSomeActionBody,
        response: { 200: SchemaSomeActionResponse },
      },
    },
    async (request) => {
      return await someService.doAction(request.body);
    },
  );
}
```

**要点：**

- 路由统一用 `server.post()`
- schema 用 TypeBox 定义，放在 `src/types/` 下
- controller 只做路由绑定，业务逻辑放 service

### Service 模式

```typescript
// modules/<name>/service.ts
interface ServiceDeps {
  prisma: PrismaService;
}

export class SomeService {
  private prisma: PrismaService;

  constructor(deps: ServiceDeps) {
    this.prisma = deps.prisma;
  }

  async doAction(data: SchemaSomeActionBodyType) {
    return this.prisma.someModel.findMany({ ... });
  }
}
```

### TypeBox Schema 定义

```typescript
// types/<name>.ts
import { Type } from "typebox";

// 请求体
export const SchemaSomeActionBody = Type.Object({
  id: Type.String(),
  name: Type.Optional(Type.String()),
});
export type SchemaSomeActionBodyType = Type.Static<typeof SchemaSomeActionBody>;

// 响应体
export const SchemaSomeActionResponse = Type.Object({
  items: Type.Array(Type.Object({ id: Type.String(), name: Type.String() })),
  total: Type.Number(),
});
export type SchemaSomeActionResponseType = Type.Static<
  typeof SchemaSomeActionResponse
>;
```

**命名约定：** `Schema<Module><Action><Body|Response>` + 对应 `Type` 后缀的类型

### 错误处理

```typescript
// types/error.ts 提供基础错误类
// ErrorBadRequest (400), ErrorNotFound (404), ErrorUnauthorized (401), ErrorForbidden (403)

// 模块专属错误在 modules/<name>/error.ts 中扩展
import { ErrorBadRequest } from "@/types/error";

export class ErrorSomeSpecific extends ErrorBadRequest {
  code = 40010; // 唯一错误码
  message = "具体错误描述";
}
```

抛出即可，`unify-response` 插件会统一捕获并格式化响应。

### Prisma 数据库

- Schema 文件：`prisma/schema.prisma`
- 新增模型后运行：`npx prisma migrate dev --name <name>`
- 生成客户端：`npx prisma generate`
- 导入用 `@db/*`：如 `import { Prisma } from "@db/internal/prismaNamespace"`

## 前端开发规范

### API 服务层

使用 TanStack React Query 封装，一个 hook 对应一个接口：

```typescript
// services/<name>.ts
import { requestPost, queryClient } from "./base";
import { useQuery, useMutation } from "@tanstack/react-query";

// 查询 hook
export const useQuerySomeList = (params: ParamsType) => {
  return useQuery({
    queryKey: ["someList", params],
    queryFn: () => requestPost<ResponseType>("some/list", params),
    refetchOnWindowFocus: false,
  });
};

// 变更 hook
export const useUpdateSome = () => {
  return useMutation({
    mutationFn: (data: BodyType) => requestPost("some/update", data),
    onMutate: () => {
      queryClient.invalidateQueries({ queryKey: ["someList"] });
    },
  });
};
```

**要点：**

- 查询用 `useQuery`，写操作用 `useMutation`
- `queryKey` 要唯一且有意义
- 变更后用 `invalidateQueries` 刷新相关缓存
- HTTP 请求统一用 `requestPost` / `requestGet`（`services/base.ts` 封装）

### 页面组件

```
pages/<name>/
├── index.tsx          # 主页面组件
├── components/        # 页面私有子组件 (可选)
└── constants.ts       # 页面常量 (可选)
```

- 新页面在 `route.tsx` 中注册
- 使用 Ant Design 组件
- 布局组件在 `layouts/` 下

### 前端类型

- 接口类型从 `@shared-types/<module>` 导入（复用后端 TypeBox 定义）
- 前端专有类型放 `src/types/`

## 新模块开发流程

1. **Prisma 模型** → `prisma/schema.prisma` 定义模型 → 运行迁移
2. **TypeBox Schema** → `src/types/<module>.ts` 定义请求/响应 schema
3. **Service** → `src/modules/<module>/service.ts` 实现业务逻辑
4. **Controller** → `src/modules/<module>/controller.ts` 注册路由
5. **注册 DI** → `register-service.ts` 中创建 service 实例并注册 controller
6. **前端服务** → `frontend/src/services/<module>.ts` 封装 API hook
7. **前端页面** → `frontend/src/pages/<module>/` 实现页面组件
8. **注册路由** → `frontend/src/route.tsx` 添加页面路由

## Git 提交规范

- 格式：`<type>: <简短描述>`
- type：`feat` / `fix` / `refactor` / `docs` / `chore` / `test` / `style`
- 示例：`feat: add diary export feature`
