import type { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { ENV_BACKEND_PORT } from "@/config/env";

export const registerSwagger = async (server: FastifyInstance) => {
  // 所有环境都注册 swagger plugin，以便 server.swagger() 可生成 OpenAPI JSON
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

  // 所有环境都注册 Swagger UI，以便 /docs/json 在生产环境也可访问
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
