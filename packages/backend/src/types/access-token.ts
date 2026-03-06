import { Type } from "typebox";

// 创建 token 请求体
export const SchemaAccessTokenCreate = Type.Object({
  name: Type.String({ description: "访问令牌备注名称" }),
});
export type SchemaAccessTokenCreateType = Type.Static<
  typeof SchemaAccessTokenCreate
>;

// 创建 token 响应（仅此一次包含明文 token）
export const SchemaAccessTokenCreateResponse = Type.Object({
  id: Type.String(),
  name: Type.String(),
  tokenPrefix: Type.String({ description: "明文前8位，仅用于展示" }),
  token: Type.String({ description: "完整明文 token，仅返回一次" }),
  createdAt: Type.String(),
});
export type SchemaAccessTokenCreateResponseType = Type.Static<
  typeof SchemaAccessTokenCreateResponse
>;

// token 列表项（不含 hash 和明文）
export const SchemaAccessTokenListItem = Type.Object({
  id: Type.String(),
  name: Type.String(),
  tokenPrefix: Type.String(),
  createdAt: Type.String(),
  lastUsedAt: Type.Union([Type.String(), Type.Null()]),
});
export type SchemaAccessTokenListItemType = Type.Static<
  typeof SchemaAccessTokenListItem
>;

// 兑换 JWT 请求体
export const SchemaAccessTokenExchange = Type.Object({
  token: Type.String({ description: "Access Token 明文" }),
});
export type SchemaAccessTokenExchangeType = Type.Static<
  typeof SchemaAccessTokenExchange
>;

// 兑换 JWT 响应
export const SchemaAccessTokenExchangeResponse = Type.Object({
  accessToken: Type.String({ description: "短期 JWT（有效期 2 天）" }),
});
export type SchemaAccessTokenExchangeResponseType = Type.Static<
  typeof SchemaAccessTokenExchangeResponse
>;

// 列表响应
export const SchemaAccessTokenList = Type.Array(SchemaAccessTokenListItem);
export type SchemaAccessTokenListType = Type.Static<
  typeof SchemaAccessTokenList
>;
