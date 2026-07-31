---
name: cube-diary
description: 用户要求读取、写入、搜索或管理 cube-diary 日记及附件时使用。
---

# cube-diary

## 一、使用这个 Skill 需要了解的知识

- 通过 `oac` 调用 cube-diary，不手写 HTTP 请求。
- 文档中的 `<service>` 表示已经配置好的服务名，通常是 `cube-diary`。
- 日期使用用户本地日期：月份为 `YYYYMM`，日期为 `YYYYMMDD`。用户未指定日期时，先根据系统本地时间确定目标日期。
- 写入前必须读取目标日期已有内容；已有内容且用户没有明确要求覆盖时，询问是追加还是替换。
- 导入可能批量修改数据；执行前必须确认处理方式，使用 `cover` 或 `merge` 前先导出备份。
- Access Token 是敏感信息，不在回复、日志或示例中展示真实值。
- OpenAPI 更新后命令名或参数可能变化；命令失败时读取 [`troubleshoot.md`](troubleshoot.md)。

## 二、任务目录

1. 当用户要求读取最近或指定日期的日记、搜索日记或查看统计时，阅读 [`references/read-and-search.md`](references/read-and-search.md)。
2. 当用户要求创建、更新、追加或替换日记时，阅读 [`references/write-diary.md`](references/write-diary.md)。
3. 当用户要求上传、嵌入、查询或下载附件时，阅读 [`references/attachments.md`](references/attachments.md)。
4. 当用户要求导入或导出日记时，阅读 [`references/import-export.md`](references/import-export.md)。
5. 当命令、配置、认证或 Schema 出现问题时，阅读 [`troubleshoot.md`](troubleshoot.md)。
