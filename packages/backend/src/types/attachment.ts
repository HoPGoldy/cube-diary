import { Type } from "typebox";

export const SchemaAttachmentInfo = Type.Object({
  id: Type.String(),
  filename: Type.String(),
  size: Type.Number(),
  hash: Type.String(),
  type: Type.String(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
});

export type SchemaAttachmentInfoType = Type.Static<typeof SchemaAttachmentInfo>;

export const SchemaDownloadQuery = Type.Object({
  i: Type.String({ description: "文件 ID" }),
  t: Type.String({ description: "时间戳" }),
  s: Type.String({ description: "签名" }),
  type: Type.Optional(
    Type.Union([Type.Literal("thumb"), Type.Literal("original")]),
  ),
});

export type SchemaDownloadQueryType = Type.Static<typeof SchemaDownloadQuery>;

export const SchemaAccessTokenResponse = Type.Object({
  url: Type.String({ description: "下载 URL" }),
});

export type SchemaAccessTokenResponseType = Type.Static<
  typeof SchemaAccessTokenResponse
>;
