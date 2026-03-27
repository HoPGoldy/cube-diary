import { Type } from "typebox";

// 获取月份日记列表
export const SchemaDiaryGetMonthListBody = Type.Object({
  month: Type.String({ description: "月份，格式: YYYYMM" }),
});
export type SchemaDiaryGetMonthListBodyType = Type.Static<
  typeof SchemaDiaryGetMonthListBody
>;

export const SchemaDiaryGetMonthListResponse = Type.Array(
  Type.Object({
    dateStr: Type.String({ description: "日期字符串，格式: YYYYMMDD" }),
    content: Type.String({ description: "日记内容" }),
    color: Type.Union([Type.String(), Type.Null()], {
      description: "颜色标签",
    }),
  }),
);
export type SchemaDiaryGetMonthListResponseType = Type.Static<
  typeof SchemaDiaryGetMonthListResponse
>;

// 获取日记详情
export const SchemaDiaryGetDetailBody = Type.Object({
  dateStr: Type.String({ description: "日期字符串，格式: YYYYMMDD" }),
});
export type SchemaDiaryGetDetailBodyType = Type.Static<
  typeof SchemaDiaryGetDetailBody
>;

export const SchemaDiaryGetDetailResponse = Type.Object({
  content: Type.String({ description: "日记内容" }),
  color: Type.Union([Type.String(), Type.Null()], {
    description: "颜色标签",
  }),
});
export type SchemaDiaryGetDetailResponseType = Type.Static<
  typeof SchemaDiaryGetDetailResponse
>;

// 更新/创建日记
export const SchemaDiaryUpdateBody = Type.Object({
  dateStr: Type.String({ description: "日期字符串，格式: YYYYMMDD" }),
  content: Type.Optional(Type.String({ description: "日记内容" })),
  color: Type.Optional(
    Type.Union([Type.String(), Type.Null()], { description: "颜色标签" }),
  ),
});
export type SchemaDiaryUpdateBodyType = Type.Static<
  typeof SchemaDiaryUpdateBody
>;

// 搜索日记
export const SchemaDiarySearchBody = Type.Object({
  keyword: Type.Optional(Type.String({ description: "搜索关键词" })),
  colors: Type.Optional(Type.Array(Type.String(), { description: "颜色过滤" })),
  desc: Type.Optional(
    Type.Boolean({ description: "是否降序排列", default: true }),
  ),
  page: Type.Optional(Type.Number({ description: "页码", default: 1 })),
  pageSize: Type.Optional(
    Type.Number({ description: "每页数量", default: 20 }),
  ),
});
export type SchemaDiarySearchBodyType = Type.Static<
  typeof SchemaDiarySearchBody
>;

export const SchemaDiarySearchItem = Type.Object({
  dateStr: Type.String({ description: "日期字符串，格式: YYYYMMDD" }),
  date: Type.Number({ description: "日期毫秒时间戳 (UTC 0)" }),
  content: Type.String({ description: "日记内容" }),
  color: Type.Union([Type.String(), Type.Null()], {
    description: "颜色标签",
  }),
});
export type SchemaDiarySearchItemType = Type.Static<
  typeof SchemaDiarySearchItem
>;

export const SchemaDiarySearchResponse = Type.Object({
  total: Type.Number({ description: "总数" }),
  rows: Type.Array(SchemaDiarySearchItem),
});
export type SchemaDiarySearchResponseType = Type.Static<
  typeof SchemaDiarySearchResponse
>;

// 导入日记配置
export const SchemaDiaryImportBody = Type.Object({
  existOperation: Type.Union(
    [Type.Literal("cover"), Type.Literal("merge"), Type.Literal("skip")],
    { description: "已存在日记的处理方式：覆盖/合并/跳过" },
  ),
  dateKey: Type.String({ description: "日期字段名" }),
  dateFormatter: Type.String({ description: "日期格式" }),
  contentKey: Type.String({ description: "内容字段名" }),
  colorKey: Type.String({ description: "颜色字段名" }),
});
export type SchemaDiaryImportBodyType = Type.Static<
  typeof SchemaDiaryImportBody
>;

export const SchemaDiaryImportResponse = Type.Object({
  insertCount: Type.Number({ description: "新增日记数量" }),
  updateCount: Type.Number({ description: "更新日记数量" }),
  insertNumber: Type.Number({ description: "新增字数" }),
});
export type SchemaDiaryImportResponseType = Type.Static<
  typeof SchemaDiaryImportResponse
>;

// 统计日记
export const SchemaDiaryStatisticBody = Type.Object({});
export type SchemaDiaryStatisticBodyType = Type.Static<
  typeof SchemaDiaryStatisticBody
>;

export const SchemaDiaryStatisticResponse = Type.Object({
  diaryCount: Type.Number({ description: "日记总数" }),
  diaryLength: Type.Number({ description: "日记总字数" }),
});
export type SchemaDiaryStatisticResponseType = Type.Static<
  typeof SchemaDiaryStatisticResponse
>;

// 导出日记配置
export const SchemaDiaryExportBody = Type.Object({
  range: Type.Union([Type.Literal("all"), Type.Literal("part")], {
    description: "导出范围：全部/部分",
  }),
  startDate: Type.Optional(
    Type.Number({ description: "开始日期毫秒时间戳 (UTC 0)" }),
  ),
  endDate: Type.Optional(
    Type.Number({ description: "结束日期毫秒时间戳 (UTC 0)" }),
  ),
  dateKey: Type.String({ description: "导出JSON中的日期字段名" }),
  dateFormatter: Type.String({ description: "日期格式化字符串" }),
  contentKey: Type.String({ description: "导出JSON中的内容字段名" }),
  colorKey: Type.String({ description: "导出JSON中的颜色字段名" }),
});
export type SchemaDiaryExportBodyType = Type.Static<
  typeof SchemaDiaryExportBody
>;
