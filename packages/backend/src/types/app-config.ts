import { Type } from "typebox";

export const SchemaAppConfig = Type.Record(Type.String(), Type.String());
export type SchemaAppConfigType = Type.Static<typeof SchemaAppConfig>;

export const SchemaAppVersionResponse = Type.Object({
  version: Type.String(),
  name: Type.String(),
  repository: Type.Union([Type.String(), Type.Null()]),
});
export type SchemaAppVersionResponseType = Type.Static<
  typeof SchemaAppVersionResponse
>;
