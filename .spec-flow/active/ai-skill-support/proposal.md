# Proposal: AI Skill 支持

## 背景

上一版本基于 MCP 协议为 AI 助手提供日记访问能力，但 MCP 依赖专用客户端协议栈，部署和调试成本较高。本方案改用更轻量的"AI Skill"方式：AI 客户端下载一个 skill 包（含接口文档和使用说明），通过标准 HTTP REST 直接操作日记服务，无需任何协议适配层。

## 目标

- [ ] 新增 Access Token 兑换 JWT 的端点，AI 可通过 token 获得短期访问权
- [ ] 提供公开的 `GET /api/skill.zip` 端点，按需生成含 SKILL.md + openapi.json 的 zip 包（带缓存）
- [ ] 前端设置页改为"AI Skill 设置"，展示 skill.zip URL 和使用说明
- [ ] 删除 MCP 相关代码（controller、server、tools）

## 非目标

- 不再实现 MCP 协议
- 不为 skill 包添加鉴权（内容本身不敏感）
- 不在构建时静态生成 skill 包（运行时按需生成）

## 范围边界

**In Scope**

- `POST /api/access-tokens/exchange` — 用 access token 换短期 JWT（1–2天、payload 含 `source: "access-token"`）
- `GET /api/skill.zip` — 公开端点，运行时生成 zip，内存缓存 1 小时
- OpenAPI JSON 暴露：Swagger 插件在所有环境注册（但 UI 仅在开发环境）
- 前端 AI Skill 设置页，展示可复制的 skill.zip URL

**Out of Scope**

- MCP 协议支持
- skill 包版本管理
- 多语言 SKILL.md

## 风险

| 风险                          | 缓解措施                                              |
| ----------------------------- | ----------------------------------------------------- |
| OpenAPI JSON 包含敏感路由信息 | 仅暴露接口描述，不含实际数据；服务本身有 JWT 鉴权保护 |
| skill.zip 生成失败            | 捕获错误返回 500，不影响其他功能                      |
| 内存缓存在长期运行中占用过多  | zip 包体积小（<100KB），单份缓存无风险                |

## 待确认问题

- 无
