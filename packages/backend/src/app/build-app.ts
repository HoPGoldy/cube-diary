import fastify from "fastify";
import { logger } from "@/lib/logger";
import { registerService } from "./register-service";
import { registerPlugin } from "./register-plugin";

export const buildApp = async () => {
  const server = fastify({
    loggerInstance: logger,
  });

  await registerPlugin(server);
  await registerService(server);

  return server;
};
