import { Type } from "typebox";

// 登录请求体
export const SchemaAuthLoginBody = Type.Object({
  password: Type.String(),
});
export type SchemaAuthLoginBodyType = Type.Static<typeof SchemaAuthLoginBody>;

// 登录响应体
export const SchemaAuthLoginResponse = Type.Object({
  token: Type.String({ description: "JWT 令牌" }),
});
export type SchemaAuthLoginResponseType = Type.Static<
  typeof SchemaAuthLoginResponse
>;

// 续期响应体
export const SchemaAuthRenewResponse = Type.Object({
  token: Type.String({ description: "新的 JWT 令牌" }),
});
export type SchemaAuthRenewResponseType = Type.Static<
  typeof SchemaAuthRenewResponse
>;

// 续期失败响应体
export const SchemaAuthRenewErrorResponse = Type.Object({
  error: Type.String({ description: "错误信息" }),
});
export type SchemaAuthRenewErrorResponseType = Type.Static<
  typeof SchemaAuthRenewErrorResponse
>;
