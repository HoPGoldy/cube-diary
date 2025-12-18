# 通知模块设计方案

## 概述

通知模块用于在探测失败/恢复时，通过 Webhook 方式发送告警通知到钉钉、飞书、企业微信等平台。

## 核心理念

1. **Host 为中心** - 通知配置绑定到 Host（Service），关注站点整体可用性
2. **统一 Webhook** - 所有渠道本质都是 HTTP POST，通过模板适配不同平台格式
3. **防抖动** - 支持配置连续失败 N 次后才通知，避免网络抖动导致误报
4. **恢复必通知** - 故障恢复时强制发送通知，无需配置
5. **简单优先** - 不追求复杂的规则配置，保持设计简洁

---

## 数据模型

### NotificationChannel（通知渠道）

存储 Webhook 配置，如钉钉群、飞书群等。

```prisma
model NotificationChannel {
  id           String    @id @default(uuid())
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  name         String    // 渠道名称，如 "运维钉钉群"
  webhookUrl   String    // Webhook 地址
  headers      Json?     // 自定义请求头（如 Authorization）
  bodyTemplate String    // 请求体模板（支持变量替换）
  enabled      Boolean   @default(true)

  services     Service[]
}
```

### Service（Host）通知配置

通知配置直接绑定到 Service 上：

```prisma
model Service {
  // 原有字段...

  // 通知配置
  notifyEnabled        Boolean @default(false)  // 是否启用通知
  notifyFailureCount   Int     @default(3)      // 连续失败N次触发
  notifyCooldownMin    Int     @default(30)     // 冷却时间(分钟)
  notifyChannelIds     Json    @default("[]")   // 通知渠道ID数组 ["id1", "id2"]
}
```

### NotificationLog（通知记录）

记录通知发送历史，用于排查和审计。

```prisma
model NotificationLog {
  id          String   @id @default(uuid())
  createdAt   DateTime @default(now())
  hostId   String   // Host ID
  endpointId  String   // 触发通知的端点
  eventType   String   // FAILURE
  title       String
  content     String
  channelId   String   // 发送到的渠道
  success     Boolean
  errorMsg    String?

  @@index([hostId])
  @@index([endpointId])
  @@index([createdAt])
}
```

---

## 内存状态

以下状态存储在内存中，无需持久化：

```typescript
// NotificationService 内部
private hostStatus: Map<string, {
  failedEndpoints: Map<string, number>;  // endpointId -> 连续失败次数
  currentStatus: 'UP' | 'DOWN';          // Host 当前状态
  lastNotifiedAt: Date | null;           // 上次通知时间（用于冷却）
}> = new Map();
```

**为什么不存数据库？**

- 读写频繁（每次探测都更新）
- 临时状态，无需持久化
- 进程重启后重新计算即可

---

## 通知触发流程

```
探测执行 (IntervalProbeService)
    ↓
保存结果 (ProbeResult)
    ↓
通知服务处理 (NotificationService.processProbeResult)
    ↓
更新端点连续失败次数
    ↓
检查是否达到 Host 的 notifyFailureCount 阈值
    ↓ 是
Host 状态是 UP？
    ↓ 是
设置 Host 状态为 DOWN，检查冷却时间
    ↓ 不在冷却期
发送通知到所有 notifyChannelIds
    ↓
记录日志 (NotificationLog)
```

### 状态变化时序示例

```
Host: api.example.com (notifyFailureCount: 3)
├── /health
└── /api/status

时间轴 →

/health 探测:    ✓   ✓   ✗   ✗   ✗   ✓   ✓
连续失败:        0   0   1   2   3   0   0
Host 状态:      UP  UP  UP  UP  DOWN UP  UP
                              ↑       ↑
                           通知故障  通知恢复
                      ("/health 连续失败 3 次")
```

### Host 恢复逻辑

当 Host 下所有失败的端点都恢复正常（连续失败次数降为 0）时：

1. Host 状态从 DOWN 变为 UP
2. **强制发送恢复通知**（无需配置，只要之前发过故障通知就会发恢复通知）

---

## Host 状态判断规则

### DOWN 条件

Host 下**任意一个** EndPoint 连续失败次数 >= `notifyFailureCount` 时，Host 状态变为 DOWN。

```
Host: api.example.com (notifyFailureCount: 3)
├── /health      连续失败 3 次 ✗✗✗ → 达到阈值！
├── /api/status  连续失败 2 次 ✗✗
└── /ping        连续失败 2 次 ✗✗

结果：Host 状态变为 DOWN，发送故障通知
      （因为 /health 达到了 3 次阈值）
```

### UP 条件

Host 下**所有**曾经失败的 EndPoint 都恢复正常（连续失败次数 = 0）时，Host 状态变为 UP。

```
Host: api.example.com (当前状态: DOWN)
├── /health      连续失败 0 次 ✓ 已恢复
├── /api/status  连续失败 0 次 ✓ 已恢复
└── /ping        连续失败 0 次 ✓ 已恢复

结果：Host 状态变为 UP，发送恢复通知
```

### 未达到阈值的情况

```
Host: api.example.com (notifyFailureCount: 3)
├── /health      连续失败 2 次 ✗✗
├── /api/status  连续失败 2 次 ✗✗
└── /ping        连续失败 2 次 ✗✗

结果：Host 状态仍为 UP，不发送通知
      （没有任何一个 EndPoint 达到 3 次连续失败）
```

---

## 请求体模板

使用 `{{变量}}` 语法，支持以下变量：

| 变量                              | 说明          | 示例                    |
| --------------------------------- | ------------- | ----------------------- |
| `{{eventType}}`                   | 事件类型      | `FAILURE` / `RECOVERY`  |
| `{{title}}`                       | 通知标题      | `故障 - 健康检查`       |
| `{{endpoint.name}}`               | 端点名称      | `健康检查`              |
| `{{endpoint.url}}`                | 端点 URL      | `/api/health`           |
| `{{service.name}}`                | 服务名称      | `生产环境 API`          |
| `{{details.status}}`              | HTTP 状态码   | `500`                   |
| `{{details.responseTime}}`        | 响应时间 (ms) | `1234`                  |
| `{{details.message}}`             | 错误信息      | `Internal Server Error` |
| `{{details.consecutiveFailures}}` | 连续失败次数  | `3`                     |
| `{{timestamp}}`                   | 触发时间      | `2025-12-01T10:00:00Z`  |

### 钉钉模板示例

```json
{
  "msgtype": "markdown",
  "markdown": {
    "title": "{{title}}",
    "text": "### {{title}}\n\n**端点**: {{endpoint.name}}\n\n**服务**: {{service.name}}\n\n**状态**: {{details.status}}\n\n**响应时间**: {{details.responseTime}}ms\n\n**时间**: {{timestamp}}\n\n{{#details.message}}**详情**: {{details.message}}{{/details.message}}"
  }
}
```

### 飞书模板示例

```json
{
  "msg_type": "text",
  "content": {
    "text": "{{title}}\n端点: {{endpoint.name}}\n服务: {{service.name}}\n状态: {{details.status}}\n响应时间: {{details.responseTime}}ms\n时间: {{timestamp}}"
  }
}
```

### 企业微信模板示例

```json
{
  "msgtype": "markdown",
  "markdown": {
    "content": "### {{title}}\n> **端点**: {{endpoint.name}}\n> **服务**: {{service.name}}\n> **状态**: {{details.status}}\n> **响应时间**: {{details.responseTime}}ms\n> **时间**: {{timestamp}}"
  }
}
```

### 通用 Webhook 模板

```json
{
  "event": "{{eventType}}",
  "title": "{{title}}",
  "endpoint": {
    "id": "{{endpoint.id}}",
    "name": "{{endpoint.name}}",
    "url": "{{endpoint.url}}"
  },
  "service": {
    "id": "{{service.id}}",
    "name": "{{service.name}}"
  },
  "details": {
    "status": "{{details.status}}",
    "responseTime": "{{details.responseTime}}",
    "message": "{{details.message}}"
  },
  "timestamp": "{{timestamp}}"
}
```

---

## 配置示例

### 示例 1：单渠道通知

```yaml
Service: 生产环境 API
notifyEnabled: true
notifyFailureCount: 3
notifyCooldownMin: 30
notifyChannelIds: ["钉钉运维群ID"]
```

### 示例 2：多渠道通知

同时发送到钉钉和飞书：

```yaml
Service: 核心支付服务
notifyEnabled: true
notifyFailureCount: 2
notifyCooldownMin: 15
notifyChannelIds: ["钉钉运维群ID", "飞书告警群ID"]
```

### 示例 3：不同团队关注不同服务

通过创建多个 Service 指向同一站点，实现不同团队收到不同通知：

```yaml
# 运维团队关注
Service: api.example.com (运维)
notifyChannelIds: ["运维钉钉群"]

# 开发团队关注
Service: api.example.com (开发)
notifyChannelIds: ["开发飞书群"]
```

---

## 模块结构

```
packages/backend/src/modules/notification/
├── service.ts              # 通知服务主逻辑
├── controller.ts           # API 接口（渠道 CRUD）
├── schema.ts               # TypeBox 类型定义
├── template.ts             # 模板渲染工具
└── __tests__/
    └── service.test.ts
```

---

## API 接口设计

### 通知渠道

| 方法 | 路径                           | 说明         |
| ---- | ------------------------------ | ------------ |
| POST | `/notification/channel/create` | 创建渠道     |
| POST | `/notification/channel/update` | 更新渠道     |
| POST | `/notification/channel/delete` | 删除渠道     |
| POST | `/notification/channel/list`   | 渠道列表     |
| POST | `/notification/channel/test`   | 发送测试通知 |

### 通知记录

| 方法 | 路径                     | 说明         |
| ---- | ------------------------ | ------------ |
| POST | `/notification/log/list` | 通知记录列表 |

---

## 前端页面

1. **通知渠道管理** - 配置 Webhook URL、请求头、消息模板
2. **Service 编辑页** - 配置通知开关、失败阈值、冷却时间、关联渠道
3. **通知记录** - 查看历史通知，排查问题
4. **测试通知** - 验证渠道配置是否正确

---

## 与现有系统集成

在 `IntervalProbeService` 中集成：

```typescript
// interval-service.ts
const result = await this.saveProbeResult(...);

// 异步处理通知，不阻塞探测
this.notificationService.processProbeResult(result).catch(err => {
  console.error('[Notification] Failed to process:', err);
});
```

---

## 设计决策

### 为什么配置放在 Host 而不是 EndPoint？

1. **符合心智模型** - 用户关心的是"站点是否活着"，而不是单个接口
2. **配置简洁** - 一个 Host 配置一次，下面所有 EndPoint 共用
3. **避免通知轰炸** - 多个 EndPoint 同时挂，只发一条 Host 告警

### 为什么恢复通知是强制的？

1. **闭环完整** - 故障→恢复 是一个完整的事件周期，恢复通知让团队知道问题已解决
2. **减少焦虑** - 收到故障通知后，不用反复查看是否恢复
3. **无需配置** - 简化用户决策，发过故障通知就一定会发恢复通知

### 为什么不支持每个 EndPoint 单独配置？

1. **保持简单** - 复杂配置带来的维护成本高于收益
2. **变通方案** - 如需单独配置，可创建多个 Host 指向同一站点

---

## 进程重启影响

重启后内存状态清空：

- 连续失败计数从 0 开始
- Host 状态默认 UP

**影响**：如果端点仍在故障，需要重新累计失败次数才会触发通知。

**可接受原因**：

- 重启不频繁
- 最多延迟几次探测（如 3 次 × 10 秒 = 30 秒）
- 无数据丢失风险
