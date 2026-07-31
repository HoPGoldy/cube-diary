# Troubleshoot

## `oac` 命令不存在

1. 检查：

   ```bash
   command -v oac
   ```

2. 未找到时，先向用户说明缺少 `openapi-agent-cli` 并征得安装确认。
3. 用户确认后安装：

   ```bash
   npm add -g openapi-agent-cli
   ```

4. 验证：

   ```bash
   oac --version
   ```

不要在正常任务流程中重复执行安装。

## 找不到 cube-diary 服务命令

1. 运行 `oac --help`，检查 Commands 中是否有 `cube-diary` 或用户配置的其他服务名。
2. 如果服务存在，使用实际名称替换文档中的 `<service>`。
3. 如果服务不存在，向用户确认 API Base URL。OpenAPI 地址通常是 `<base-url>/docs/json`。
4. Access Token 是敏感信息；不要要求用户把完整 Token 发到聊天中，也不要在日志或回复中回显。优先请用户在自己的终端完成配置：

   ```bash
   oac config add cube-diary \
     --url <base-url> \
     --openapi <base-url>/docs/json \
     --headers '{"Authorization":"Bearer <access-token>"}' \
     --ignore '["/api/config/**","/api/access-tokens/**","/api/auth/**"]'
   ```

## 401 Unauthorized

Token 无效或已过期。请用户在自己的终端更新配置，避免在聊天和工具日志中暴露 Token：

```bash
oac config set <service> \
  --headers '{"Authorization":"Bearer <access-token>"}'
```

## 403 Forbidden

当前 Token 缺少操作所需权限：

- 读取、搜索、统计：`diary:read`
- 创建或更新：`diary:write`
- 导出：`diary:export`
- 导入：`diary:import`

请用户改用具备对应权限的 Token。

## Unknown command 或 Schema mismatch

刷新 OpenAPI Schema，再查看当前命令：

```bash
oac config refresh <service>
oac <service> --help
```

具体参数不确定时运行：

```bash
oac <service> <command> --help
```

## 上传或导入提示缺少文件

1. 确认 `--body` 中包含 `file`。
2. 使用存在的绝对路径。
3. 导入时确认 `config` 是经过 JSON 转义的字符串，而不是嵌套对象。
4. 上传文件不能超过 512 MB。

## 写入结果不符合预期

1. 确认日期是用户本地日期，并使用 `YYYYMMDD`。
2. 重新读取目标日期详情。
3. 检查写入时传递的是最终完整内容，而不是只传了待追加片段。
4. 恢复数据前先向用户确认；有备份时优先从备份恢复。
