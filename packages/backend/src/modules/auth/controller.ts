import bcrypt from "bcryptjs";
import { UserRole } from "@db/client";
import { signJwtToken } from "./utils";
import { AppInstance } from "@/types";
import {
  SchemaAuthLoginBody,
  SchemaAuthLoginResponse,
  SchemaAuthRenewResponse,
  SchemaAuthRenewErrorResponse,
} from "@/types/auth";
import { ErrorUnauthorized, ErrorForbidden } from "@/types/error";
import { ErrorAuthFailed, ErrorBanned } from "./error";
import { hashPassword, shaWithSalt } from "@/lib/crypto";
import { ENV_BACKEND_LOGIN_PASSWORD } from "@/config/env";
import type { AccessTokenService } from "@/modules/access-token/service";
import { ACCESS_TOKEN_PREFIX } from "@/modules/access-token/service";

declare module "fastify" {
  interface FastifyContextConfig {
    /**
     * 是否禁用用户登录访问（允许公开访问呢）
     * @default false
     */
    disableAuth?: boolean;
    /**
     * 是否为管理员权限才能访问
     * @default false
     */
    requireAdmin?: boolean;
    /**
     * 该路由所需的 access token scope 列表
     */
    requiredScopes?: string[];
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      id: string;
      username: string;
      role: string;
      source?: string;
      scopes?: string[];
    };
    user: {
      id: string;
      username: string;
      role: string;
      source?: string;
      scopes?: string[];
    };
  }
}

interface RegisterOptions {
  server: AppInstance;
  accessTokenService: AccessTokenService;
}

export const registerController = (options: RegisterOptions) => {
  const { server, accessTokenService } = options;

  // 根据配置给路由添加 swagger 安全定义
  server.addHook("onRoute", (routeOptions) => {
    const { disableAuth } = routeOptions.config || {};

    if (!disableAuth && routeOptions.schema) {
      routeOptions.schema.security = routeOptions.schema.security || [];
      (routeOptions.schema.security as any[]).push({ bearerAuth: [] });
    }
  });

  server.addHook("preHandler", async (request) => {
    const { disableAuth, requireAdmin, requiredScopes } =
      request.routeOptions.config;
    if (!disableAuth) {
      const authHeader = request.headers.authorization;
      const bearerToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

      if (bearerToken?.startsWith(ACCESS_TOKEN_PREFIX)) {
        // csk- 前缀 → Access Token 路径（内存缓存 + DB）
        const plain = bearerToken.slice(ACCESS_TOKEN_PREFIX.length);
        const record = await accessTokenService.verify(plain);
        if (!record) throw new ErrorUnauthorized();
        request.user = {
          id: "access-token-user",
          username: "",
          role: "user",
          source: "access-token",
          scopes: record.scopes,
        };
      } else {
        // 其他 → JWT 路径（纯 crypto，无 DB）
        try {
          await request.jwtVerify();
        } catch {
          throw new ErrorUnauthorized();
        }
      }

      if (requireAdmin && request.user.role !== UserRole.ADMIN) {
        throw new ErrorBanned();
      }

      // scope 校验：仅对 access-token 来源生效
      if (
        requiredScopes &&
        request.user.source === "access-token" &&
        request.user.scopes
      ) {
        const hasAll = requiredScopes.every((s) =>
          request.user.scopes!.includes(s),
        );
        if (!hasAll) {
          throw new ErrorForbidden("Insufficient scope");
        }
      }
    }
  });

  server.post(
    "/auth/login",
    {
      config: {
        disableAuth: true,
      },
      schema: {
        description: "用户登录",
        tags: ["auth"],
        body: SchemaAuthLoginBody,
        response: {
          200: SchemaAuthLoginResponse,
        },
      },
    },
    async (request) => {
      const { password } = request.body;

      // 验证密码
      const isPasswordValid = await bcrypt.compare(
        password,
        hashPassword(shaWithSalt(ENV_BACKEND_LOGIN_PASSWORD, "admin")),
      );
      if (!isPasswordValid) {
        throw new ErrorAuthFailed();
      }

      // 生成 JWT 令牌
      const token = signJwtToken(server, {
        id: "admin",
        username: "admin",
        role: UserRole.ADMIN,
      });

      return {
        token,
      };
    },
  );

  server.post(
    "/auth/renew",
    {
      schema: {
        description: "续期 JWT 令牌",
        tags: ["auth"],
        response: {
          200: SchemaAuthRenewResponse,
          401: SchemaAuthRenewErrorResponse,
        },
      },
    },
    async (request) => {
      // 已经在 preHandler 中验证了 JWT，这里直接生成新的令牌
      const user = request.user;
      const newToken = signJwtToken(server, user);

      return {
        token: newToken,
      };
    },
  );
};
