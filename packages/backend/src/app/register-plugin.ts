import { registerSwagger } from "@/lib/swagger";
import { registerFrontendHistory } from "@/lib/frontend-history";
import multipart from "@fastify/multipart";
import fastifyJwt from "@fastify/jwt";
import { ENV_JWT_SECRET } from "@/config/env";
import { AppInstance } from "@/types";

/**
 * 集成诸如 Swagger、jwt 等插件
 */
export const registerPlugin = async (server: AppInstance) => {
  await server.register(multipart, {
    limits: {
      fileSize: 512 * 1024 * 1024,
    },
  });

  await server.register(fastifyJwt, {
    secret: ENV_JWT_SECRET,
  });

  await registerSwagger(server);

  await registerFrontendHistory(server);

  return server;
};
