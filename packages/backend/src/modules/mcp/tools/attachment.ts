import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { AttachmentService } from "@/modules/attachment/service";

// 与前端 markdown-editor constants.ts 保持一致
const FILE_PREFIX = ":api-attachment:";

// MCP 上传使用的固定 userId（单用户系统）
const MCP_USER_ID = "mcp";

export function registerAttachmentTools(
  server: McpServer,
  attachmentService: AttachmentService,
) {
  server.tool(
    "attachment_upload",
    "Upload a file encoded in base64 and get a markdown string ready to insert into diary content. For images, returns `![filename](:api-attachment:ID)`. For other files, returns `[filename](:api-attachment:ID)`.",
    {
      filename: z.string().describe("Original filename, e.g. photo.jpg"),
      mimeType: z.string().describe("MIME type, e.g. image/jpeg"),
      base64: z.string().describe("Base64-encoded file content"),
    },
    async ({ filename, mimeType, base64 }) => {
      const buffer = Buffer.from(base64, "base64");

      // 限制 10MB
      if (buffer.length > 10 * 1024 * 1024) {
        return {
          content: [
            { type: "text", text: "Error: file size exceeds 10MB limit" },
          ],
          isError: true,
        };
      }

      const result = await attachmentService.uploadFile(
        MCP_USER_ID,
        buffer,
        filename,
        mimeType,
      );

      const isImage = /^image\/(gif|jpe?g|a?png|bmp)/i.test(mimeType);
      const link = `[${filename}](${FILE_PREFIX}${result.id})`;
      const markdownString = isImage ? `!${link}` : link;

      return {
        content: [{ type: "text", text: markdownString }],
      };
    },
  );

  server.tool(
    "attachment_get_info",
    "Get metadata of a file by its ID. Returns filename, MIME type, size, and creation date.",
    {
      id: z.string().describe("File ID (UUID)"),
    },
    async ({ id }) => {
      const file = await attachmentService.getFileInfo(id);

      if (!file) {
        return {
          content: [{ type: "text", text: "Error: file not found" }],
          isError: true,
        };
      }

      const info = {
        id: file.id,
        filename: file.filename,
        type: file.type,
        size: file.size,
        createdAt:
          file.createdAt instanceof Date
            ? file.createdAt.toISOString()
            : String(file.createdAt),
      };

      return {
        content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      };
    },
  );
}
