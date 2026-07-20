import { Type } from "typebox";
import type { AppInstance } from "@/types";
import type { AccessTokenService } from "./service";
import {
  DEFAULT_ACCESS_TOKEN_SCOPES,
  SchemaAccessTokenCreate,
  SchemaAccessTokenCreateResponse,
  SchemaAccessTokenList,
  type SchemaAccessTokenCreateResponseType,
  type SchemaAccessTokenListType,
  type AccessTokenScope,
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
      config: {
        requireAdmin: true,
      },
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
      return accessTokenService.create(
        name,
        (scopes as AccessTokenScope[] | undefined) ??
          DEFAULT_ACCESS_TOKEN_SCOPES,
      ) as Promise<SchemaAccessTokenCreateResponseType>;
    },
  );

  server.get(
    "/access-tokens",
    {
      config: {
        requireAdmin: true,
      },
      schema: {
        description: "列出所有访问令牌",
        tags: ["access-token"],
        response: {
          200: SchemaAccessTokenList,
        },
      },
    },
    async () => {
      return accessTokenService.findAll() as Promise<SchemaAccessTokenListType>;
    },
  );

  server.delete(
    "/access-tokens/:id",
    {
      config: {
        requireAdmin: true,
      },
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
      const { id } = request.params as { id: string };
      await accessTokenService.delete(id);
      return { success: true };
    },
  );
};
