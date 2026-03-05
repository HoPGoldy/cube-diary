import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DiaryService } from "@/modules/diary/service";
import type { AttachmentService } from "@/modules/attachment/service";
import { registerDiaryTools } from "./tools/diary";
import { registerAttachmentTools } from "./tools/attachment";

interface CreateMcpServerOptions {
  diaryService: DiaryService;
  attachmentService: AttachmentService;
}

export function createMcpServer(options: CreateMcpServerOptions): McpServer {
  const { diaryService, attachmentService } = options;

  const server = new McpServer({
    name: "cube-diary",
    version: "1.0.0",
  });

  registerDiaryTools(server, diaryService);
  registerAttachmentTools(server, attachmentService);

  return server;
}
