# 新模块创建指南

本文档旨在指导开发者如何在本项目中创建一个新的模块。

## 1. 创建后端数据库表

1. 在 `prisma/schema.prisma` 文件中定义新的数据模型。
2. 运行 `npx prisma migrate dev --name <migration-name>` 命令生成数据库迁移。
3. 运行 `npx prisma generate` 命令更新 Prisma 客户端。

## 2. 创建前后端接口 schema

1. 在 `packages/backend/src/types/` 目录下创建一个新的 TypeScript 文件。
2. 使用 `typebox` 定义模块所需的数据结构和接口 schema，并导出为 ts type。

## 3. 后端模块开发

1. 在 `packages/backend/src/modules/` 目录下创建一个新的模块文件夹。
2. 在该文件夹中创建 `controller.ts` 和 `service.ts` 文件。
3. 在 `service.ts` 中实现模块的业务逻辑。
4. 在 `controller.ts` 中定义路由和请求处理逻辑，调用 `service.ts` 中的方法和 `@/types/<new-module>.ts` 中的 `schema`。

## 4. 前端接口层实现

1. 在 `packages/frontend/src/services/` 目录下创建一个新的服务文件。
2. 使用 `axios` 或其他 HTTP 客户端库实现与后端模块的接口调用。
3. 定义请求和响应的数据类型，确保与后端接口 schema 保持一致。

## 5. 前端页面开发

1. 在 `packages/frontend/src/pages/` 目录下创建一个新的页面文件夹。
2. 在该文件夹中创建页面组件，使用 React 和相关 UI 库实现页面功能。
3. 调用前端服务层的方法获取数据并渲染页面。
4. 注册到 `@/route.tsx` 中以便路由访问。
