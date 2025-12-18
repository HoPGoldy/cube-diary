import { type FastifyInstance } from "fastify";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type pino from "pino";
import type { IncomingMessage, Server, ServerResponse } from "http";

export type AppInstance = FastifyInstance<
  Server<typeof IncomingMessage, typeof ServerResponse>,
  IncomingMessage,
  ServerResponse<IncomingMessage>,
  pino.Logger<never, boolean>,
  TypeBoxTypeProvider
>;
