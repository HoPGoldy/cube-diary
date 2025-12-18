import { useQueryTagList } from "@/services/tag";
import { useMemo } from "react";
import type { SchemaTagItemType } from "@shared-types/tag";

/**
 * 创建标签 id 到名称的映射，方便通过 id 获取标签信息
 */
export const useTagDict = () => {
  const { data: tagListResp } = useQueryTagList();
  const tagList = tagListResp?.data;

  return useMemo(() => {
    const data =
      tagList?.map((item) => [item.id, item] as [string, SchemaTagItemType]) ||
      [];
    return new Map<string | number, SchemaTagItemType>(data);
  }, [tagList]);
};
