# Probe Environment Variables Module Design

## 概述

本文档描述「探针环境变量」模块的设计方案。该模块提供全局的 key-value 配置存储，用于注入到 CODE 模式的探针任务中，使用户可以集中管理敏感信息（如 API 密钥、Token 等）而无需在每个探针代码中硬编码。

## 需求背景

### 问题

- CODE 模式的探针可能需要访问敏感信息（API Key、Token、密码等）
- 目前这些信息只能硬编码在代码中，存在安全风险
- 多个探针共用相同的配置时，需要逐个修改

### 目标

- 提供全局的环境变量存储
- 在 CODE 模式探针执行时自动注入这些变量
- 支持敏感信息的安全存储（值不明文返回）

## 数据模型

### Prisma Schema

```prisma
model ProbeEnv {
  id        String   @id @default(uuid())
  key       String   @unique
  value     String
  isSecret  Boolean  @default(false)  // 是否为敏感信息
  desc      String?                    // 变量描述
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("probe_env")
}
```

### 字段说明

| 字段       | 类型    | 说明                                    |
| ---------- | ------- | --------------------------------------- |
| `id`       | String  | UUID 主键                               |
| `key`      | String  | 变量名（唯一）                          |
| `value`    | String  | 变量值                                  |
| `isSecret` | Boolean | 是否为敏感信息，true 时前端不显示实际值 |
| `desc`     | String? | 变量描述，方便用户理解用途              |

## 模块结构

```
packages/backend/src/modules/probe-env/
├── service.ts      # 业务逻辑
├── controller.ts   # API 路由
└── schema.ts       # TypeBox Schema 定义
```

## Service 设计

### `ProbeEnvService`

```typescript
interface ServiceOptions {
  prisma: PrismaClient;
}

export class ProbeEnvService {
  constructor(private options: ServiceOptions) {}

  // 获取所有环境变量（用于前端展示）
  // isSecret=true 的变量，value 返回 "******"
  async getAll(): Promise<ProbeEnv[]>;

  // 获取所有环境变量的实际值（用于注入到探针）
  // 返回 Record<string, string> 格式
  async getAllForInjection(): Promise<Record<string, string>>;

  // 创建环境变量
  async create(data: {
    key: string;
    value: string;
    isSecret?: boolean;
    desc?: string;
  }): Promise<ProbeEnv>;

  // 更新环境变量
  // 如果 value 为 undefined 且 isSecret=true，保持原值不变
  async update(
    id: string,
    data: { key?: string; value?: string; isSecret?: boolean; desc?: string },
  ): Promise<ProbeEnv>;

  // 删除环境变量
  async delete(id: string): Promise<void>;

  // 从探针执行结果中更新环境变量（只更新已存在的 key）
  async updateFromProbe(updates: Record<string, string>): Promise<{
    updated: string[]; // 成功更新的 key
    skipped: string[]; // 跳过的 key（不存在）
    errors: string[]; // 错误信息
  }>;
}
```

### 缓存策略

使用 `NodeCache` 缓存环境变量，避免每次探针执行都查询数据库：

```typescript
private cache = new NodeCache<string>({ stdTTL: 300, checkperiod: 60 });

async getAllForInjection(): Promise<Record<string, string>> {
  const cached = this.cache.get("probeEnvVars");
  if (cached) return JSON.parse(cached);

  const envs = await this.options.prisma.probeEnv.findMany();
  const result = Object.fromEntries(envs.map(e => [e.key, e.value]));

  this.cache.set("probeEnvVars", JSON.stringify(result));
  return result;
}
```

## API 设计

### 接口列表

| Method | Path                    | 说明             | 权限  |
| ------ | ----------------------- | ---------------- | ----- |
| GET    | `/api/probe-env/list`   | 获取所有环境变量 | Admin |
| POST   | `/api/probe-env/add`    | 创建环境变量     | Admin |
| POST   | `/api/probe-env/update` | 更新环境变量     | Admin |
| POST   | `/api/probe-env/delete` | 删除环境变量     | Admin |

### Schema 定义

```typescript
// 列表响应 - isSecret 为 true 时 value 显示为 ******
export const SchemaProbeEnvItem = Type.Object({
  id: Type.String(),
  key: Type.String(),
  value: Type.String(), // 敏感变量显示为 ******
  isSecret: Type.Boolean(),
  desc: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String(),
  updatedAt: Type.String(),
});

// 创建请求
export const SchemaProbeEnvCreate = Type.Object({
  key: Type.String({ minLength: 1, maxLength: 100 }),
  value: Type.String({ maxLength: 10000 }),
  isSecret: Type.Optional(Type.Boolean()),
  desc: Type.Optional(Type.String({ maxLength: 500 })),
});

// 更新请求
export const SchemaProbeEnvUpdate = Type.Object({
  id: Type.String(),
  key: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  value: Type.Optional(Type.String({ maxLength: 10000 })),
  isSecret: Type.Optional(Type.Boolean()),
  desc: Type.Optional(Type.String({ maxLength: 500 })),
});

// 删除请求
export const SchemaProbeEnvDelete = Type.Object({
  id: Type.String(),
});
```

## 探针注入设计

### 修改 `IntervalProbeService`

在执行 CODE 模式探针时，注入环境变量：

```typescript
// interval-service.ts

interface ServiceOptions {
  prisma: PrismaClient;
  resultService: ResultService;
  codeExecutorService: CodeExecutorService;
  notificationService?: NotificationService;
  probeEnvService: ProbeEnvService;  // 新增
}

private executeCodeProbe = async (
  endPointId: string,
  codeContent: string | null,
) => {
  // ... 省略前面的代码 ...

  // 获取环境变量
  const env = await this.options.probeEnvService.getAllForInjection();

  const result = await this.options.codeExecutorService.execute({
    code: codeContent,
    timeout: 30000,
    context: {
      env,  // 注入环境变量
    },
  });

  // ... 省略后面的代码 ...
};
```

### 探针代码中使用

用户在 CODE 模式探针中可以这样使用环境变量：

```javascript
// 示例：使用环境变量中的 API Key
const apiKey = env.API_KEY;
const baseUrl = env.SERVICE_BASE_URL;

const response = await http.get(`${baseUrl}/health`, {
  headers: {
    Authorization: `Bearer ${apiKey}`,
  },
});

return {
  result: {
    success: response.status === 200,
    message: `Status: ${response.status}`,
    responseTime: response.data.latency,
  },
};
```

### 探针执行后更新环境变量

探针可以在执行完成后更新已存在的环境变量：

```javascript
// 同时返回探针结果和环境变量更新
return {
  // 探针结果
  result: {
    success: true,
    message: "Token refreshed",
    status: 200,
  },
  // 环境变量更新（可选，只能更新已存在的 key）
  env: {
    ACCESS_TOKEN: newToken,
    TOKEN_EXPIRES_AT: expiresAt.toString(),
  },
};
```

**约束条件：**

- 只能更新已存在的环境变量，不能创建新的
- 值必须是字符串类型
- 单个值最大长度 10,000 字符

## 前端页面设计

### 页面路径

`/probe-env` - 探针环境变量管理页面

### 功能

1. **列表展示**
   - 显示所有环境变量
   - `isSecret=true` 的变量值显示为 `******`
   - 支持搜索过滤

2. **新增/编辑弹窗**
   - Key 输入框（必填，支持大写字母、数字、下划线）
   - Value 输入框/文本域（必填）
   - 敏感信息开关
   - 描述输入框（选填）

3. **操作**
   - 新增、编辑、删除
   - 敏感变量编辑时，value 为空表示保持原值

### 侧边栏菜单

在管理员菜单中添加「环境变量」入口

## 安全考虑

1. **敏感信息保护**
   - `isSecret=true` 的变量，API 返回时 value 显示为 `******`
   - 仅在探针实际执行时才读取真实值

2. **权限控制**
   - 所有接口仅限 Admin 角色访问

3. **Key 命名规范**
   - 建议使用大写字母 + 下划线，如 `API_KEY`、`DB_PASSWORD`
   - 前端可添加正则校验：`/^[A-Z][A-Z0-9_]*$/`

4. **值长度限制**
   - 最大 10000 字符，防止滥用

## 实现步骤

1. **数据库变更**
   - [ ] 添加 `ProbeEnv` 模型到 Prisma Schema
   - [ ] 执行 `prisma migrate dev`

2. **后端模块**
   - [ ] 创建 `probe-env` 模块目录
   - [ ] 实现 `ProbeEnvService`
   - [ ] 实现 Controller 和 Schema
   - [ ] 在 `register-service.ts` 中注册服务

3. **探针注入**
   - [ ] 修改 `IntervalProbeService` 注入环境变量
   - [ ] 更新 `code-executor` 的 EXAMPLES.md 文档

4. **前端页面**
   - [ ] 创建 `probe-env` 页面
   - [ ] 添加 API service hook
   - [ ] 添加路由和菜单

5. **文档更新**
   - [ ] 更新 AGENTS.md

## 附录：与 AppConfig 的区别

| 对比项   | AppConfig                        | ProbeEnv            |
| -------- | -------------------------------- | ------------------- |
| 用途     | 系统配置（WebAuthn、注册开关等） | 探针运行时变量      |
| Schema   | 固定字段                         | 动态 key-value      |
| 使用场景 | 系统启动/运行配置                | CODE 探针执行时注入 |
| 敏感信息 | 不涉及                           | 支持标记为敏感      |
