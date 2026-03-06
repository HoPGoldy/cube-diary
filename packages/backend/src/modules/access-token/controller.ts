import { Type } from "typebox";
import type { AppInstance } from "@/types";
import type { AccessTokenService } from "./service";
import { ErrorUnauthorized } from "@/types/error";
import {
  SchemaAccessTokenCreate,
  SchemaAccessTokenCreateResponse,
  SchemaAccessTokenList,
  SchemaAccessTokenExchange,
  SchemaAccessTokenExchangeResponse,
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

  server.post(
    "/access-tokens/exchange",
    {
      config: { disableAuth: true },
      schema: {
        description: "使用 Access Token 兑换短期 JWT（有效期 2 天）",
        tags: ["access-token"],
        body: SchemaAccessTokenExchange,
        response: {
          200: SchemaAccessTokenExchangeResponse,
        },
        security: [],
      },
    },
    async (request) => {
      const { token } = request.body;
      const accessToken = await accessTokenService.verify(token);
      if (!accessToken) {
        throw new ErrorUnauthorized("Invalid access token");
      }
      const jwt = server.jwt.sign(
        {
          id: "access-token-user",
          username: "",
          role: "user",
          source: "access-token",
        },
        { expiresIn: "2d" },
      );
      return { accessToken: jwt };
    },
  );
};
