import { Type } from "typebox";

/**
 * 基础分页查询参数
 */
export const SchemaCommonListFilter = Type.Object({
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  size: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 100 })),
  keyword: Type.Optional(Type.String({ description: "搜索关键词" })),
});

export type SchemaCommonListFilterType = Type.Static<
  typeof SchemaCommonListFilter
>;

/**
 * 基础分页响应
 */
export const createCommonListSchema = <
  T extends ReturnType<typeof Type.Object>,
>(
  itemSchema: T,
) => {
  return Type.Object({
    items: Type.Array(itemSchema),
    total: Type.Number(),
  });
};

export const createCommonListVo = <T>(items: T[], total: number) => {
  return {
    items,
    total,
  };
};
