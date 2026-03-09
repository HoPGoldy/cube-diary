# Access Token 权限范围 (Scopes) - Proposal

> **Status**: Approved
> **Created**: 2026-03-09
> **Last Updated**: 2026-03-09

## Background

cube-diary 的 Access Token 模块已实现基础功能（创建、列表、删除、验证），用于 MCP 接入鉴权。但目前 token 拥有所有 API 的访问权限，无法进行细粒度控制。用户需要能够在创建和编辑 token 时，指定该 token 的权限范围。

## Goals

- [x] Goal 1: 为 AccessToken 新增 scopes 字段，支持细粒度权限控制
- [x] Goal 2: 前端创建/编辑 token 时，可通过多选列表配置权限
- [x] Goal 3: 后端 API 路由根据 token scopes 进行权限校验

## Non-Goals

- 不做日记删除 scope（当前无删除日记功能）
- 不做向后兼容（模块尚未上线）
- 不做动态权限管理（scope 列表为预定义常量）
- 不涉及前端改动（scope 仅用于控制 API 调用权限）

## Scope

### In Scope

- Prisma 模型加 `scopes` 字段
- 后端 scope 常量定义与校验逻辑
- AccessToken 创建/编辑 API 支持 scopes
- Auth hook 中基于 scope 的路由权限校验

### Out of Scope

- MCP 路由实现（后续独立功能）
- 前端 UI 改动（scope 仅用于 API 层控制）
- 日记删除功能

## Proposed Solution

在 `AccessToken` 模型上新增 `scopes` 字段（JSON 字符串存 string 数组），后端维护预定义 scope 枚举。Auth preHandler 中对 access-token 来源的请求，检查 `request.user.scopes` 是否满足路由声明的 `requiredScopes`。创建/编辑 Token 的 API 接受 scopes 参数。

## Alternatives Considered

| Alternative      | Pros           | Cons                             | Why Rejected |
| ---------------- | -------------- | -------------------------------- | ------------ |
| 关联表存储 scope | 标准化、可扩展 | 复杂度高，scope 是有限预定义集合 | 过度设计     |
| 位掩码 (bitmask) | 存储紧凑       | 可读性差、不利于调试和扩展       | 不够直观     |

## Risks and Mitigations

| Risk                   | Likelihood | Impact | Mitigation                                   |
| ---------------------- | ---------- | ------ | -------------------------------------------- |
| scope 列表后续需要扩展 | Medium     | Low    | JSON 数组天然支持扩展，加新 scope 只需改常量 |

## Dependencies

- 无外部依赖

## Open Questions

无
