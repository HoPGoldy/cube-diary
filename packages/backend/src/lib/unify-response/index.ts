import { ENV_IS_DEV } from "@/config/env";
import { ErrorHttp } from "@/types/error";
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@db/internal/prismaNamespace";
import type { FastifyInstance } from "fastify";

const PrismaErrorFeedback: Record<string, { status: number; msg: string }> = {
  P2001: {
    status: 400,
    msg: "访问的资源不存在",
  },
  P2002: {
    status: 400,
    msg: "该资源已存在，请勿重复创建",
  },
  DEFAULT: {
    status: 500,
    msg: "数据库错误",
  },
};

interface ErrorResponse {
  success: false;
  code: number | string;
  message: string;
  _stack?: string;
}

export const createErrorResponse = (error: Error): ErrorResponse => {
  return {
    success: false,
    code: (error as any).code || (error as any).statusCode || 500,
    message: error.message,
    _stack: ENV_IS_DEV ? error.stack : undefined,
  };
};

/**
 * 将后端服务的响应处理为统一格式
 * 错误处理也在这里统一捕获
 */
export const registerUnifyResponse = (server: FastifyInstance) => {
  server.setErrorHandler((error, request, reply) => {
    console.error(error);

    if (error instanceof PrismaClientKnownRequestError) {
      const feedback =
        PrismaErrorFeedback[error.code] || PrismaErrorFeedback.DEFAULT;
      let httpStatus = feedback.status;
      if (httpStatus !== 400 && httpStatus !== 500) {
        httpStatus = 500;
      }

      const resp: ErrorResponse = {
        success: false,
        message: feedback.msg,
        code: error.code,
        _stack: ENV_IS_DEV ? error.stack : undefined,
      };

      reply.status(httpStatus).send(resp);
    } else if (error instanceof PrismaClientValidationError) {
      const resp: ErrorResponse = {
        success: false,
        message: "数据验证失败，请检查输入内容是否正确",
        code: error.code,
        _stack: ENV_IS_DEV ? error.stack : undefined,
      };

      reply.status(500).send(resp);
    } else if (error instanceof ErrorHttp) {
      reply.status(error.statusCode);
      reply.send(createErrorResponse(error));
    } else {
      reply.status(500);
      reply.send(createErrorResponse(error));
    }
  });

  /**
   * 不能使用 setSerializerCompiler，因为没有设置 response schema 时不会被调用
   * 不能使用 preSerialization 和 setReplySerializer，因为基础类型不会走序列化，也就不会走这两个钩子
   * 只能用 onSend，在这里重新走一遍序列化，统一包装响应结果
   */
  server.addHook("onSend", async (request, reply, payload) => {
    if (
      reply.statusCode >= 200 &&
      reply.statusCode < 300 &&
      typeof payload === "string"
    ) {
      let data = payload;
      try {
        data = JSON.parse(payload);
      } catch (e) {
        // json 解析失败，可能是原始类型，包裹一下直接返回
      }

      return JSON.stringify({
        success: true,
        code: 200,
        data: data,
      });
    }
  });
};
