# 读取、搜索与统计

将 `<service>` 替换为已配置的服务名，通常是 `cube-diary`。

## 读取指定月份

```bash
oac <service> post-api-diary-get-month-list \
  --body '{"month":"<YYYYMM>"}'
```

返回该月日记数组，每项包含 `dateStr`、`content` 和 `color`。

## 读取指定日期

```bash
oac <service> post-api-diary-get-detail \
  --body '{"dateStr":"<YYYYMMDD>"}'
```

## 读取最近日记

1. 用当前月份调用月列表。
2. 按 `dateStr` 倒序选择最近日期。
3. 如需完整内容，再调用详情命令。
4. 当前月份没有结果时，继续查询上一个月。

## 搜索

```bash
oac <service> post-api-diary-search --body '{
  "keyword": "<关键词>",
  "desc": true,
  "page": 1,
  "pageSize": 20
}'
```

返回 `{ total, rows }`。当 `total` 大于已读取数量时继续翻页；只在用户需要完整汇总时读取全部页面。

## 统计

```bash
oac <service> post-api-diary-statistic --body '{}'
```

返回 `diaryCount` 和 `diaryLength`。
