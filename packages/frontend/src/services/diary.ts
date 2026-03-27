import { queryClient, requestPost } from "./base";
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  SchemaDiaryGetMonthListResponseType,
  SchemaDiaryGetDetailResponseType,
  SchemaDiaryUpdateBodyType,
  SchemaDiarySearchBodyType,
  SchemaDiarySearchResponseType,
  SchemaDiaryImportBodyType,
  SchemaDiaryImportResponseType,
  SchemaDiaryExportBodyType,
  SchemaDiaryStatisticResponseType,
} from "@shared-types/diary";

export type DiaryItem = SchemaDiaryGetMonthListResponseType[number];
export type DiaryDetail = SchemaDiaryGetDetailResponseType;

/** 更新本地日记缓存 */
const updateDiaryCache = (updateData: SchemaDiaryUpdateBodyType) => {
  const oldData = queryClient.getQueryData<{ data: DiaryDetail }>([
    "diaryDetail",
    updateData.dateStr,
  ]);
  if (!oldData) return;

  const newData = {
    ...oldData,
    data: { ...oldData.data, ...updateData },
  };
  queryClient.setQueryData(["diaryDetail", updateData.dateStr], newData);
};

/** 查询月份日记列表 */
export const useQueryDiaryList = (month?: string) => {
  return useQuery({
    queryKey: ["month", month],
    queryFn: async () => {
      return requestPost<SchemaDiaryGetMonthListResponseType>(
        "diary/get-month-list",
        { month },
      );
    },
    refetchOnWindowFocus: false,
    enabled: !!month,
  });
};

/** 查询日记详情 */
export const useQueryDiaryDetail = (dateStr: string) => {
  return useQuery({
    queryKey: ["diaryDetail", dateStr],
    queryFn: async () => {
      return requestPost<DiaryDetail>("diary/get-detail", { dateStr });
    },
    refetchOnWindowFocus: false,
  });
};

/** 更新日记 */
export const useUpdateDiary = () => {
  return useMutation({
    mutationFn: (data: SchemaDiaryUpdateBodyType) => {
      return requestPost("diary/update", data);
    },
    onMutate: (data) => {
      queryClient.invalidateQueries({ queryKey: ["month"] });
      updateDiaryCache(data);
    },
  });
};

/** 自动保存接口 */
export const autoSaveContent = async (
  dateStr: string,
  date: number,
  content: string,
) => {
  updateDiaryCache({ dateStr, date, content });
  return requestPost("diary/update", { dateStr, date, content });
};

/** 搜索日记列表 */
export const useSearchDiary = (data: SchemaDiarySearchBodyType) => {
  return useQuery({
    queryKey: ["searchDiary", data],
    queryFn: async () => {
      return requestPost<SchemaDiarySearchResponseType>("diary/search", data);
    },
    refetchOnWindowFocus: false,
    enabled: data.keyword !== "" || !!(data.colors && data.colors.length > 0),
  });
};

/** 导入日记 */
export const useImportDiary = () => {
  return useMutation({
    mutationFn: (data: { file: File; config: SchemaDiaryImportBodyType }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("config", JSON.stringify(data.config));

      return requestPost<SchemaDiaryImportResponseType>(
        "diary/import",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["month"] });
      queryClient.invalidateQueries({ queryKey: ["userStatistic"] });
    },
  });
};

/** 导出日记 */
export const useExportDiary = () => {
  return useMutation({
    mutationFn: (data: SchemaDiaryExportBodyType) => {
      return requestPost("diary/export", data);
    },
  });
};

/** 查询日记统计数据（总数 & 总字数） */
export const useQueryDiaryCount = () => {
  return useQuery({
    queryKey: ["diaryStatistic"],
    queryFn: () => {
      return requestPost<SchemaDiaryStatisticResponseType>(
        "diary/statistic",
        {},
      );
    },
  });
};
