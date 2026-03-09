import { Type } from "typebox";
import type { AppInstance } from "@/types";
import type { AccessTokenService } from "./service";
import {
  SchemaAccessTokenCreate,
  SchemaAccessTokenCreateResponse,
  SchemaAccessTokenList,
  SchemaAccessTokenUpdate,
} from "@/types/access-token";

interface RegisterOptions {
  server: AppInstance;
  accessTokenService: AccessTokenService;
}

export const registerAccessTokenController = (options: RegisterOptions) => {
  const { server, accessTokenService } = options;

  server.post(
    "/access-tokens",
    {
      schema: {
        description: "创建访问令牌（明文仅返回一次）",
        tags: ["access-token"],
        body: SchemaAccessTokenCreate,
        response: {
          200: SchemaAccessTokenCreateResponse,
        },
      },
    },
    async (request) => {
      const { name, scopes } = request.body;
      return accessTokenService.create(name, scopes);
    },
  );

  server.post(
    "/access-tokens/update",
    {
      schema: {
        description: "更新访问令牌（名称和权限）",
        tags: ["access-token"],
        body: SchemaAccessTokenUpdate,
        response: {
          200: Type.Object({
            id: Type.String(),
            name: Type.String(),
            scopes: Type.Array(Type.String()),
          }),
        },
      },
    },
    async (request) => {
      const { id, name, scopes } = request.body;
      return accessTokenService.update(id, name, scopes);
    },
  );

  server.get(
    "/access-tokens",
    {
      schema: {
        description: "列出所有访问令牌",
        tags: ["access-token"],
        response: {
          200: SchemaAccessTokenList,
        },
      },
    },
    async () => {
      return accessTokenService.findAll();
    },
  );

  server.delete(
    "/access-tokens/:id",
    {
      schema: {
        description: "删除访问令牌",
        tags: ["access-token"],
        params: Type.Object({
          id: Type.String(),
        }),
        response: {
          200: Type.Object({ success: Type.Boolean() }),
        },
      },
    },
    async (request) => {
      const { id } = request.params;
      await accessTokenService.delete(id);
      return { success: true };
    },
  );
};
