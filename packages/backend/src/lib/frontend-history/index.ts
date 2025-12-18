import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyStatic from "@fastify/static";
import { PATH_FRONTEND_FILE } from "@/config/path";
import { createErrorResponse } from "../unify-response";
import { ErrorNotFound } from "@/types/error";
import { ENV_FRONTEND_BASE_URL, ENV_IS_PROD } from "@/config/env";
import fs from "fs/promises";

/**
 * 注册前端静态资源和 History 模式路由
 */
export const registerFrontendHistory = async (server: FastifyInstance) => {
  // 开发环境下不启用该功能，由前端开发服务器处理
  if (!ENV_IS_PROD) return;

  // 对 index.html 的文本进行替换，把 {FRONTEND_BASE_URL} 替换为实际的前端基础路径
  const initialIndexHtml = await fs.readFile(
    PATH_FRONTEND_FILE + "/index.html",
    "utf-8",
  );

  const replacedIndexHtml = initialIndexHtml.replace(
    /\{FRONTEND_BASE_URL\}/g,
    ENV_FRONTEND_BASE_URL,
  );

  await fs.writeFile(
    PATH_FRONTEND_FILE + "/index.html",
    replacedIndexHtml,
    "utf-8",
  );

  // 注册静态文件服务
  await server.register(fastifyStatic, {
    preCompressed: true,
    root: PATH_FRONTEND_FILE,
    prefix: "/",
  });

  // 添加 hook 处理 SPA 路由
  server.setNotFoundHandler(
    async (request: FastifyRequest, reply: FastifyReply) => {
      const path = request.url.split("?")[0];
      console.log("path", path);

      // 只处理 GET 请求且不是 API 和静态文件路由
      if (
        request.method !== "GET" ||
        path.startsWith("/api/") ||
        path.startsWith("/assets/")
      ) {
        reply.code(404).send(createErrorResponse(new ErrorNotFound()));
        return;
      }

      // 检查文件扩展名，有扩展名的请求直接返回 404
      if (path.includes(".")) {
        reply.code(404).send(createErrorResponse(new ErrorNotFound()));
        return;
      }

      // 返回前端入口文件
      return reply.sendFile("index.html");
    },
  );
};
