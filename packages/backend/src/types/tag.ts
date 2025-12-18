import { Type } from "typebox";

export const SchemaTagItem = Type.Object({
  id: Type.String(),
  title: Type.String(),
  color: Type.Union([Type.String(), Type.Null()]),
});
export type SchemaTagItemType = Type.Static<typeof SchemaTagItem>;

export const SchemaTagList = Type.Array(SchemaTagItem);
export type SchemaTagListType = Type.Static<typeof SchemaTagList>;

export const SchemaTagListBody = Type.Object({});
export type SchemaTagListBodyType = Type.Static<typeof SchemaTagListBody>;

export const SchemaTagAddBody = Type.Object({
  title: Type.String({ minLength: 1 }),
  color: Type.Optional(Type.String()),
});
export type SchemaTagAddBodyType = Type.Static<typeof SchemaTagAddBody>;

export const SchemaTagUpdateBody = Type.Object({
  id: Type.String(),
  title: Type.Optional(Type.String()),
  color: Type.Optional(Type.String()),
});
export type SchemaTagUpdateBodyType = Type.Static<typeof SchemaTagUpdateBody>;

export const SchemaTagRemoveBody = Type.Object({
  id: Type.String(),
});
export type SchemaTagRemoveBodyType = Type.Static<typeof SchemaTagRemoveBody>;

export const SchemaTagBatchSetColorBody = Type.Object({
  tagIds: Type.Array(Type.String()),
  color: Type.String(),
});
export type SchemaTagBatchSetColorBodyType = Type.Static<
  typeof SchemaTagBatchSetColorBody
>;

export const SchemaTagBatchRemoveBody = Type.Object({
  ids: Type.Array(Type.String()),
});
export type SchemaTagBatchRemoveBodyType = Type.Static<
  typeof SchemaTagBatchRemoveBody
>;
