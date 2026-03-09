# Access Token 权限范围 (Scopes) - Requirements

> **Status**: Approved
> **Proposal**: [proposal.md](./proposal.md)
> **Last Updated**: 2026-03-09

## Overview

为 Access Token 添加 scopes 权限字段，实现基于 scope 的细粒度 API 访问控制。

## Functional Requirements

### Ubiquitous Requirements

- **FR-001**: 系统应维护一组预定义的 scope 常量：`diary:read`、`diary:write`、`diary:export`、`diary:import`。
- **FR-002**: 系统应将 scopes 以 JSON 字符串数组格式存储在 AccessToken 记录中。
- **FR-003**: 空 scopes（`[]`）表示该 token 无任何权限。

### Event-Driven Requirements

- **FR-010**: 当用户创建 Access Token 时，系统应接受 `scopes` 参数（string 数组），并将其存入数据库。
- **FR-011**: 当用户编辑 Access Token 时，系统应允许修改 `name` 和 `scopes` 字段。
- **FR-012**: 当 access-token 来源的请求访问受保护路由时，系统应校验 token 的 scopes 是否包含该路由声明的 `requiredScopes`。
- **FR-013**: 当 scope 校验失败时，系统应返回 403 Forbidden 错误。
- **FR-014**: 当请求来源为 JWT（网页登录用户）时，系统应跳过 scope 校验。

### Unwanted Behavior Requirements

- **FR-030**: 如果创建/编辑 token 时传入了不在预定义列表中的 scope，系统应拒绝请求并返回 400 错误。

## Non-Functional Requirements

### Performance

- **NFR-001**: scope 校验应在内存中完成（scopes 随 token 缓存），不额外查询数据库。

### Security

- **NFR-010**: Access Token 的 scope 遵循最小权限原则，默认为空（无权限）。

## Constraints

- **C-001**: 使用 SQLite，scopes 存储为 JSON 字符串（无原生数组类型）。
- **C-002**: 预定义 scope 列表为常量，不支持运行时动态增删。

## Assumptions

- **A-001**: 模块尚未上线，无需兼容已有 token 数据。
- **A-002**: 日记删除功能不存在，暂不需要 `diary:delete` scope。
- **A-003**: 本次不涉及前端改动，scope 仅用于 API 层权限控制。

## Acceptance Criteria

### Core Functionality

- [ ] **AC-001**: 创建 token 时可指定 scopes，返回的 token 信息包含 scopes。
- [ ] **AC-002**: token 列表接口返回每个 token 的 scopes。
- [ ] **AC-003**: 编辑 token 可修改 name 和 scopes。
- [ ] **AC-004**: 使用无 `diary:read` scope 的 token 访问 `/diary/getMonthList`，返回 403。
- [ ] **AC-005**: 使用有 `diary:read` scope 的 token 访问 `/diary/getMonthList`，正常返回。
- [ ] **AC-006**: JWT 登录用户访问任意路由不受 scope 限制。
- [ ] **AC-007**: 创建 token 时传入非法 scope，返回 400。
