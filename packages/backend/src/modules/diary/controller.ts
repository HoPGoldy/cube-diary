import {
  SchemaDiaryGetMonthListBody,
  SchemaDiaryGetMonthListResponse,
  SchemaDiaryGetDetailBody,
  SchemaDiaryGetDetailResponse,
  SchemaDiaryUpdateBody,
  SchemaDiaryUpdateResponse,
  SchemaDiarySearchBody,
  SchemaDiarySearchResponse,
  SchemaDiaryImportMultipartBody,
  SchemaDiaryImportResponse,
  SchemaDiaryExportBody,
  SchemaDiaryExportResponse,
  SchemaDiaryStatisticBody,
  SchemaDiaryStatisticResponse,
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
    "/diary/get-month-list",
    {
      config: { requiredScopes: ["diary:read"] },
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
      return await diaryService.getMonthList(request.body.month);
    },
  );

  // 获取日记详情
  server.post(
    "/diary/get-detail",
    {
      config: { requiredScopes: ["diary:read"] },
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
      return await diaryService.getDetail(request.body.dateStr);
    },
  );

  // 更新日记
  server.post(
    "/diary/update",
    {
      config: { requiredScopes: ["diary:write"] },
      schema: {
        description: "更新或创建日记",
        tags: ["diary"],
        body: SchemaDiaryUpdateBody,
        response: {
          200: SchemaDiaryUpdateResponse,
        },
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
      config: { requiredScopes: ["diary:read"] },
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
      config: { requiredScopes: ["diary:import"] },
      schema: {
        description: "导入日记",
        tags: ["diary"],
        consumes: ["multipart/form-data"],
        body: SchemaDiaryImportMultipartBody,
        response: {
          200: SchemaDiaryImportResponse,
        },
      },
      validatorCompiler: () => () => true,
    },
    async (request) => {
      const body = request.body as any;

      const fileField = body?.file;
      if (!fileField) {
        throw new Error("未找到上传的文件");
      }

      const configField = body?.config;
      if (!configField?.value) {
        throw new Error("未找到导入配置");
      }

      const fileBuffer = await fileField.toBuffer();
      const config = JSON.parse(configField.value);

      const result = await diaryService.importDiaryFromBuffer(
        fileBuffer,
        config,
      );
      return result;
    },
  );

  // 导出日记
  server.post(
    "/diary/export",
    {
      config: { requiredScopes: ["diary:export"] },
      schema: {
        description: "导出日记为 JSON 文件",
        tags: ["diary"],
        body: SchemaDiaryExportBody,
        response: {
          200: SchemaDiaryExportResponse,
        },
      },
    },
    async (request) => {
      return await diaryService.exportDiary(request.body);
    },
  );

  // 统计日记
  server.post(
    "/diary/statistic",
    {
      config: { requiredScopes: ["diary:read"] },
      schema: {
        description: "统计日记数量和总字数",
        tags: ["diary"],
        body: SchemaDiaryStatisticBody,
        response: {
          200: SchemaDiaryStatisticResponse,
        },
      },
    },
    async () => {
      return await diaryService.statisticDiaries();
    },
  );
}
