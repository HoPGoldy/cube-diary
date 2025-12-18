## 创建数据库迁移并同步数据库

1、修改 prisma/schema.prisma 文件。

2、执行命令，创建数据库迁移

```
pnpm prisma migrate dev --name <迁移名称>
```

该命令会：

- 检查当前 schema 和数据库的差异。
- 在 prisma/migrations 目录下生成 SQL 迁移文件。
- 自动执行该迁移文件，同步数据库。

3、更新 Prisma Client

```
pnpm prisma generate
```

该命令会：

- 根据 schema.prisma 文件生成 Prisma Client
- 更新类型定义

## 重置数据库并重新应用所有迁移

```
pnpm prisma migrate reset
```

该命令会：

- 删除数据库所有表和数据
- 重新应用所有迁移文件
- 重新执行种子脚本

## 生产环境应用迁移

```
pnpm prisma migrate deploy
```

该命令会：

- 只执行尚未应用的迁移
- 不修改迁移文件，也不生成新的迁移

## 手动创建迁移文件

如果遇到一些特殊场景，比如创建必填字段且没有默认值时，prisma 将无法自动创建迁移文件。这时可以：

```
pnpm prisma migrate dev --create-only --name <迁移名称>
```

然后手动编辑生成的迁移 SQL 文件，例如找到 `INSERT INTO` 语句，在新增的必填字段中添加默认值。

完成后再执行 `pnpm prisma migrate dev` 应用迁移。
