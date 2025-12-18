import { Type } from "typebox";
import type { AttachmentService } from "./service";
import type { AppInstance } from "@/types";
import {
  SchemaAccessTokenResponse,
  SchemaAttachmentInfo,
  SchemaDownloadQuery,
} from "@/types/attachment";
import { createReadStream } from "fs";
import { ErrorFileNotFound, ErrorNoFile, ErrorWrongSignature } from "./error";
import { transformDate } from "@/utils/vo";

interface RegisterOptions {
  server: AppInstance;
  attachmentService: AttachmentService;
}

export const registerController = (options: RegisterOptions) => {
  const { server, attachmentService } = options;

  server.post(
    "/attachments/upload",
    {
      schema: {
        description: "上传文件",
        tags: ["attachment"],
        consumes: ["multipart/form-data"],
        response: {
          200: SchemaAttachmentInfo,
        },
      },
    },
    async (request) => {
      const data = await request.file();

      if (!data) {
        throw new ErrorNoFile();
      }

      const fileBuffer = await data.toBuffer();
      const originalFilename = data.filename;
      const mimeType = data.mimetype;

      const result = await attachmentService.uploadFile(
        request.user.id,
        fileBuffer,
        originalFilename,
        mimeType,
      );

      return transformDate(result);
    },
  );

  server.get(
    "/attachments/request/:fileId",
    {
      schema: {
        description: "请求文件访问令牌",
        tags: ["attachment"],
        params: Type.Object({
          fileId: Type.String(),
        }),
        response: {
          200: SchemaAccessTokenResponse,
        },
      },
    },
    async (request) => {
      const { fileId } = request.params;
      const info = await attachmentService.createAccessToken(fileId);
      return {
        url: `/api/attachments/download?i=${info.id}&t=${info.date}&s=${info.signature}`,
      };
    },
  );

  server.get(
    "/attachments/download",
    {
      config: {
        disableAuth: true,
      },
      schema: {
        description: "下载文件",
        tags: ["attachment"],
        querystring: SchemaDownloadQuery,
      },
    },
    async (request, reply) => {
      const { i: id, t: date, s: signature, type } = request.query;

      const verifySignature = attachmentService.generateFileAccessSignature(
        id,
        date,
      );
      if (verifySignature !== signature) {
        throw new ErrorWrongSignature();
      }

      const file = await attachmentService.getFileInfo(id);
      if (!file) {
        throw new ErrorFileNotFound();
      }

      reply.header("Content-Type", file.type);
      reply.header(
        "Content-Disposition",
        `attachment; filename=${encodeURIComponent(file.filename)}`,
      );
      reply.header("Cache-Control", "max-age=2592000"); // 缓存一个月

      if (file.thumbPath && file.thumbSize && type !== "original") {
        reply.header("Content-Length", file.thumbSize.toString());
        const fileStream = createReadStream(file.thumbPath);
        return reply.send(fileStream);
      }

      reply.header("Content-Length", file.size.toString());
      const fileStream = createReadStream(file.path);
      return reply.send(fileStream);
    },
  );

  server.post(
    "/attachments/info",
    {
      schema: {
        description: "获取文件信息",
        tags: ["attachment"],
        body: Type.Object({
          id: Type.String(),
        }),
        response: {
          200: SchemaAttachmentInfo,
        },
      },
    },
    async (request) => {
      const { id } = request.body;
      const file = await attachmentService.getFileInfo(id);
      if (!file) {
        throw new ErrorFileNotFound();
      }
      return transformDate(file);
    },
  );
};
