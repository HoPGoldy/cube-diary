# 导入与导出

将 `<service>` 替换为已配置的服务名。文件路径使用绝对路径。

## 导出全部日记

```bash
oac <service> post-api-diary-export --body '{
  "range": "all",
  "dateKey": "dateStr",
  "dateFormatter": "YYYYMMDD",
  "contentKey": "content",
  "colorKey": "color"
}' --output /absolute/path/to/diary-export.json
```

部分导出时使用 `"range":"part"`，并提供 UTC 毫秒时间戳形式的 `startDate` 和 `endDate`。

## 导入前确认

1. 确认导入文件的绝对路径和 JSON 格式。
2. 确认已存在日期的处理方式：
   - `skip`：跳过，风险最低。
   - `merge`：合并内容，可能产生重复内容。
   - `cover`：覆盖已有内容，可能丢失数据。
3. 使用 `merge` 或 `cover` 前，先按照上面的导出命令备份全部日记。
4. 用户没有明确选择时，不得自行使用 `merge` 或 `cover`。

## 导入

下面以 `skip` 为例；`config` 必须作为 JSON 字符串传入：

```bash
oac <service> post-api-diary-import --body '{
  "file": "/absolute/path/to/diary-import.json",
  "config": "{\"existOperation\":\"skip\",\"dateKey\":\"dateStr\",\"dateFormatter\":\"YYYYMMDD\",\"contentKey\":\"content\",\"colorKey\":\"color\"}"
}'
```

完成后向用户报告新增和更新数量。不要把导入文件中的私人内容完整输出到回复中。
