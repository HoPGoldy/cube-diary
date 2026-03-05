import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { DiaryService } from "@/modules/diary/service";

export function registerDiaryTools(
  server: McpServer,
  diaryService: DiaryService,
) {
  server.tool(
    "diary_get_month",
    "Get all diary entries for a given month (YYYYMM). Returns a list of entries with dateStr, content, and color.",
    { month: z.string().describe("Month in YYYYMM format, e.g. 202503") },
    async ({ month }) => {
      const entries = await diaryService.getMonthList(month);
      return {
        content: [{ type: "text", text: JSON.stringify(entries, null, 2) }],
      };
    },
  );

  server.tool(
    "diary_get_detail",
    "Get the diary entry for a specific date (YYYYMMDD). Returns content and color.",
    { dateStr: z.string().describe("Date in YYYYMMDD format, e.g. 20250306") },
    async ({ dateStr }) => {
      const detail = await diaryService.getDetail(dateStr);
      return {
        content: [{ type: "text", text: JSON.stringify(detail, null, 2) }],
      };
    },
  );

  server.tool(
    "diary_update",
    "Create or update the diary entry for a specific date. Provide dateStr (YYYYMMDD), date (UTC millisecond timestamp), content, and optional color.",
    {
      dateStr: z.string().describe("Date in YYYYMMDD format, e.g. 20250306"),
      date: z.number().describe("UTC millisecond timestamp of the date"),
      content: z.string().optional().describe("Diary content in markdown"),
      color: z
        .string()
        .nullable()
        .optional()
        .describe("Color label, e.g. #ff0000"),
    },
    async (params) => {
      await diaryService.updateDetail(params as any);
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true }) }],
      };
    },
  );

  server.tool(
    "diary_search",
    "Full-text search across diary entries. Returns a paginated list of matching entries.",
    {
      keyword: z.string().optional().describe("Search keyword"),
      page: z.number().optional().describe("Page number, default 1"),
      pageSize: z.number().optional().describe("Page size, default 20"),
    },
    async ({ keyword, page, pageSize }) => {
      const result = await diaryService.searchDiary({
        keyword,
        page,
        pageSize,
        colors: [],
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );
}
