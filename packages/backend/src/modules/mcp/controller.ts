import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { AppInstance } from "@/types";
import type { AccessTokenService } from "@/modules/access-token/service";
import type { AppConfigService } from "@/modules/app-config/service";
import type { DiaryService } from "@/modules/diary/service";
import type { AttachmentService } from "@/modules/attachment/service";
import { createMcpServer } from "./server";

interface RegisterOptions {
  server: AppInstance;
  accessTokenService: AccessTokenService;
  appConfigService: AppConfigService;
  diaryService: DiaryService;
  attachmentService: AttachmentService;
}

export const registerMcpController = async (options: RegisterOptions) => {
  const {
    server,
    accessTokenService,
    appConfigService,
    diaryService,
    attachmentService,
  } = options;

  const mcpServer = createMcpServer({ diaryService, attachmentService });

  const handleMcpRequest = async (request: any, reply: any) => {
    // 1. 验证 Access Token
    const authHeader = request.headers["authorization"] as string | undefined;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      reply.code(401).send({ error: "Unauthorized: missing access token" });
      return;
    }

    const tokenRecord = await accessTokenService.verify(token);
    if (!tokenRecord) {
      reply.code(401).send({ error: "Unauthorized: invalid access token" });
      return;
    }

    // 2. 检查 MCP 开关
    const mcpEnabled = await appConfigService.getMcpEnabled();
    if (!mcpEnabled) {
      reply.code(503).send({ error: "MCP service is disabled" });
      return;
    }

    // 3. 转发到 MCP transport（无状态模式）
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    await mcpServer.connect(transport);

    // Fastify 已解析 body，通过 parsedBody 传入避免重复读取 stream
    await transport.handleRequest(request.raw, reply.raw, request.body);
  };

  // POST /mcp — 主要的 JSON-RPC 通道
  server.post(
    "/mcp",
    {
      config: { disableAuth: true },
      schema: {
        description: "MCP Streamable HTTP endpoint",
        tags: ["mcp"],
      },
    },
    handleMcpRequest,
  );

  // GET /mcp — SSE 通知通道
  server.get(
    "/mcp",
    {
      config: { disableAuth: true },
      schema: {
        description: "MCP SSE notification channel",
        tags: ["mcp"],
      },
    },
    handleMcpRequest,
  );

  // DELETE /mcp — 关闭 session（stateless 模式下为空操作，但需要 200 响应）
  server.delete(
    "/mcp",
    {
      config: { disableAuth: true },
      schema: {
        description: "MCP session close",
        tags: ["mcp"],
      },
    },
    async (_request, reply) => {
      reply.code(200).send({});
    },
  );
};
