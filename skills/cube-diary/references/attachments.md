# 附件

将 `<service>` 替换为已配置的服务名。传入文件时使用绝对路径。

## 上传

```bash
oac <service> post-api-attachments-upload \
  --body '{"file":"/absolute/path/to/file.png"}'
```

上传成功后记录返回的附件 `id`，不要猜测或编造 ID。

## 嵌入日记

使用以下格式插入日记内容：

```markdown
![文件名](:api-attachment:<附件ID>)
```

然后按照 [`write-diary.md`](write-diary.md) 的写入保护流程更新日记。

## 查询附件信息

```bash
oac <service> post-api-attachments-info \
  --body '{"id":"<附件ID>"}'
```

## 下载

1. 请求临时访问地址：

   ```bash
   oac <service> get-api-attachments-request-file-id \
     --params '{"fileId":"<附件ID>"}'
   ```

2. 从返回 URL 中取得 `i`、`t` 和 `s` 参数。
3. 下载到用户指定的位置：

   ```bash
   oac <service> get-api-attachments-download \
     --query '{"i":"<i>","t":"<t>","s":"<s>","type":"original"}' \
     --output /absolute/path/to/output-file
   ```

省略 `type: original` 时，图片可能返回缩略图。
