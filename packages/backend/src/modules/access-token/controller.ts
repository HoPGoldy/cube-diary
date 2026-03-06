import { Type } from "typebox";
import type { AppInstance } from "@/types";
import type { AccessTokenService } from "./service";
import {
  SchemaAccessTokenCreate,
  SchemaAccessTokenCreateResponse,
  SchemaAccessTokenList,
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
      const { name } = request.body;
      return accessTokenService.create(name);
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
