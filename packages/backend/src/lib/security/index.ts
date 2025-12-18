import { AppInstance } from "@/types";

/**
 * 当路由中定义了 schema，但没有显式指定 additionalProperties 时，默认设置为 false
 * 用来防止多余参数的传入
 */
export const registerRemoveAdditionalProperties = (server: AppInstance) => {
  server.addHook("onRoute", (routeOptions) => {
    const schema = routeOptions.schema;
    if (!schema) {
      return;
    }

    const bodySchema = schema.body as Record<string, any> | undefined;
    if (
      bodySchema?.type === "object" &&
      bodySchema.additionalProperties === undefined
    ) {
      bodySchema.additionalProperties = false;
    }
  });
};
