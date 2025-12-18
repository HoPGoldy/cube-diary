import {
  SchemaDiaryGetMonthListBody,
  SchemaDiaryGetMonthListResponse,
  SchemaDiaryGetDetailBody,
  SchemaDiaryGetDetailResponse,
  SchemaDiaryUpdateBody,
  SchemaDiarySearchBody,
  SchemaDiarySearchResponse,
  SchemaDiaryImportBody,
  SchemaDiaryImportResponse,
  SchemaDiaryExportBody,
} from "@/types/diary";
import { DiaryService } from "./service";
import { AppInstance } from "@/types";

interface RegisterOptions {
  server: AppInstance;
  diaryService: DiaryService;
}

export async function registerDiaryController(options: RegisterOptions) {
  const { server, diaryService } = options;

  // 获取月份日记列表
  server.post(
    "/diary/getMonthList",
    {
      schema: {
        description: "获取指定月份的日记列表",
        tags: ["diary"],
        body: SchemaDiaryGetMonthListBody,
        response: {
          200: SchemaDiaryGetMonthListResponse,
        },
      },
    },
    async (request) => {
      // JWT 认证已在 preHandler 中完成
      return await diaryService.getMonthList(request.body.month);
    },
  );

  // 获取日记详情
  server.post(
    "/diary/getDetail",
    {
      schema: {
        description: "获取指定日期的日记详情",
        tags: ["diary"],
        body: SchemaDiaryGetDetailBody,
        response: {
          200: SchemaDiaryGetDetailResponse,
        },
      },
    },
    async (request) => {
      return await diaryService.getDetail(request.body.date);
    },
  );

  // 更新日记
  server.post(
    "/diary/update",
    {
      schema: {
        description: "更新或创建日记",
        tags: ["diary"],
        body: SchemaDiaryUpdateBody,
      },
    },
    async (request) => {
      await diaryService.updateDetail(request.body);
      return { success: true };
    },
  );

  // 搜索日记
  server.post(
    "/diary/search",
    {
      schema: {
        description: "搜索日记",
        tags: ["diary"],
        body: SchemaDiarySearchBody,
        response: {
          200: SchemaDiarySearchResponse,
        },
      },
    },
    async (request) => {
      return await diaryService.searchDiary(request.body);
    },
  );

  // 导入日记（需要处理文件上传）
  server.post(
    "/diary/import",
    {
      schema: {
        description: "导入日记",
        tags: ["diary"],
        body: SchemaDiaryImportBody,
        response: {
          200: SchemaDiaryImportResponse,
        },
      },
    },
    async (request) => {
      // 注意：文件上传需要前端配合处理，这里假设文件已上传到临时位置
      // 实际使用时需要配合文件上传中间件或 attachment 模块
      const { filePath, ...config } = request.body as any;

      if (!filePath) {
        throw new Error("未找到上传的文件路径");
      }

      const result = await diaryService.importDiary(filePath, config);
      return result;
    },
  );

  // 导出日记
  server.post(
    "/diary/export",
    {
      schema: {
        description: "导出日记为 JSON 文件",
        tags: ["diary"],
        body: SchemaDiaryExportBody,
      },
    },
    async (request, reply) => {
      const jsonString = await diaryService.exportDiary(request.body);

      reply.header("Content-Type", "application/json; charset=utf-8");
      reply.header(
        "Content-Disposition",
        `attachment; filename="diary-export-${Date.now()}.json"`,
      );
      return jsonString;
    },
  );
}
