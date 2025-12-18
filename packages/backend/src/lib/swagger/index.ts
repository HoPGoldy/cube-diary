import type { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { ENV_BACKEND_PORT, ENV_IS_PROD } from "@/config/env";

export const registerSwagger = async (server: FastifyInstance) => {
  if (ENV_IS_PROD) return;

  await server.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Backend API",
        description: "Backend API documentation",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      servers: [
        {
          url: `http://localhost:${ENV_BACKEND_PORT}`,
          description: "Development server",
        },
      ],
    },
  });

  await server.register(async (instance) => {
    instance.addHook("onRoute", (routeOptions) => {
      routeOptions.config = {
        ...routeOptions.config,
        disableAuth: true,
      };
    });

    await instance.register(fastifySwaggerUi, {
      routePrefix: "/docs",
      uiConfig: {
        docExpansion: "full",
      },
    });
  });
};
