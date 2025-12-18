import { queryClient, requestPost } from "./base";
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  SchemaTagBatchSetColorBodyType,
  SchemaTagBatchRemoveBodyType,
  SchemaTagUpdateBodyType,
  SchemaTagAddBodyType,
  SchemaTagItemType,
} from "@shared-types/tag";

/** 查询完整标签列表 */
export const useQueryTagList = () => {
  const result = useQuery({
    queryKey: ["tagList"],
    queryFn: () => {
      return requestPost<SchemaTagItemType[]>("tag/list", {});
    },
  });

  return { ...result, tagList: result.data?.data || [] };
};

/** 新增标签 */
export const useAddTag = () => {
  return useMutation({
    mutationFn: (data: SchemaTagAddBodyType) => {
      return requestPost<string>("tag/add", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tagList"] });
    },
  });
};

/** 更新标签 */
export const useUpdateTag = () => {
  return useMutation({
    mutationFn: (data: SchemaTagUpdateBodyType) => {
      return requestPost("tag/update", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tagList"] });
    },
  });
};

/** 删除标签 */
export const useDeleteTag = () => {
  return useMutation({
    mutationFn: (id: string) => {
      return requestPost("tag/remove", { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tagList"] });
    },
  });
};

/** 批量设置标签的颜色 */
export const useBatchSetTagColor = () => {
  return useMutation({
    mutationFn: (data: SchemaTagBatchSetColorBodyType) => {
      return requestPost("tag/batch/setColor", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tagList"] });
    },
  });
};

/** 批量删除标签 */
export const useBatchDeleteTag = () => {
  return useMutation({
    mutationFn: (data: SchemaTagBatchRemoveBodyType) => {
      return requestPost("tag/batch/remove", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tagList"] });
    },
  });
};
