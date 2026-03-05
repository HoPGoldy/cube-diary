# Proposal: MCP 支持

## 背景

Cube Diary 是一个个人日记和笔记管理系统。目前只能通过 Web 界面操作，无法被 AI 助手（如 Claude Desktop）直接访问。通过接入 MCP（Model Context Protocol），AI 可以直接读写日记、上传附件，实现真正的对话式日记管理。

## 目标

- [ ] 新增 Access Token 模块，支持创建和删除用于 MCP 接入的访问令牌
- [ ] 新增 MCP 管理模块，支持通过开关控制 MCP 服务是否可用
- [ ] 实现 MCP Server（Streamable HTTP），暴露日记和附件相关工具
- [ ] 前端提供 Token 管理页和 MCP 设置页

## 非目标

- 不为普通 REST API 添加 Access Token 鉴权（避免 DDoS 风险）
- 不为 Access Token 设置过期时间
- 不暴露附件列表工具（保持 MCP 工具集精简）
- 不支持多用户 Token 隔离（单用户系统）

## 范围边界

**In Scope**

- Access Token CRUD（新建返回明文一次，后续只存 hash）
- `app-config` 新增 `mcp.enabled` 开关
- `/mcp` 路由（Streamable HTTP），独立做 access token 验证
- 6 个 MCP Tools：diary × 4 + attachment × 2

**Out of Scope**

- 普通接口的 access token 鉴权
- MCP Resources / Prompts（只做 Tools）
- OAuth / 第三方 MCP 认证

## 风险

| 风险                          | 缓解措施                                                  |
| ----------------------------- | --------------------------------------------------------- |
| Token 泄漏导致数据被读写      | 前端提示 token 仅展示一次，建议用户及时复制；支持随时删除 |
| MCP server 被滥用             | `mcp.enabled` 开关可随时关闭；access token 独立于 JWT     |
| base64 上传大文件导致内存压力 | attachment_upload 工具限制文件大小                        |

## 待确认问题

- 无（已在 PRE-IMPLEMENTATION 对话中全部确认）
