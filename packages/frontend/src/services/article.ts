import { queryClient, requestPost } from "./base";
import { useMutation, useQuery } from "@tanstack/react-query";
import isNil from "lodash/isNil";
import type {
  SchemaArticleItemType,
  SchemaArticleAddBodyType,
  SchemaArticleUpdateBodyType,
  SchemaArticleGetLinkResponseType,
  SchemaArticleRemoveBodyType,
  SchemaArticleSearchBodyType,
  SchemaArticleMenuType,
  SchemaArticleTreeNodeType,
  SchemaArticleStatisticResponseType,
  SchemaArticleSearchResponseType,
} from "@shared-types/article";

export type ArticleItem = Omit<SchemaArticleItemType, "tagIds"> & {
  tagIds: string[];
};

/** 查询文章正文 */
export const useQueryArticleContent = (id?: string) => {
  const result = useQuery({
    queryKey: ["articleContent", id],
    enabled: !!id,
    queryFn: async () => {
      const resp = await requestPost("article/getContent", {
        id,
      });
      const data = resp.data;
      return {
        ...resp,
        data: {
          ...data,
          tagIds: data.tagIds ? data.tagIds.split(",").filter(Boolean) : [],
        } as ArticleItem,
      };
    },
  });

  return { ...result, articleDetail: result.data?.data };
};

export type ArticleUpdateData = Omit<SchemaArticleUpdateBodyType, "tagIds"> & {
  tagIds?: string[];
};

/** 更新文章详情 hook */
export const useUpdateArticle = () => {
  return useMutation({
    mutationFn: (data: ArticleUpdateData) => {
      // 转换 tagIds 从 number[] 到 string
      const convertedData: SchemaArticleUpdateBodyType = {
        ...data,
        tagIds:
          data.tagIds && data.tagIds.length > 0
            ? data.tagIds.join(",")
            : undefined,
      };
      return requestPost("article/update", convertedData);
    },
    onSuccess: (resp, data) => {
      if (data.title) {
        queryClient.invalidateQueries({ queryKey: ["articleLink", data.id] });
        queryClient.invalidateQueries({ queryKey: ["menu"] });
      }
      if (!isNil(data.color)) {
        queryClient.invalidateQueries({ queryKey: ["menu"] });
        queryClient.invalidateQueries({ queryKey: ["favorite"] });
      }
    },
  });
};

/** 自动保存接口 */
export const autoSaveContent = async (id: string, content: string) => {
  return requestPost("article/update", { id, content });
};

/** 查询本文的下属文章 */
export const useQueryArticleLink = (
  id: string | undefined,
  enabled: boolean = true,
) => {
  const result = useQuery({
    queryKey: ["articleLink", id],
    queryFn: () => {
      return requestPost<SchemaArticleGetLinkResponseType>("article/getLink", {
        id,
      });
    },
    enabled: !!id && enabled,
  });

  return {
    ...result,
    childrenArticles: result.data?.data?.childrenArticles,
    parentArticleIds: result.data?.data?.parentArticleIds || [],
    parentArticleTitle: result.data?.data?.parentArticleTitle || "",
  };
};

/** 新增文章 */
export const useAddArticle = () => {
  return useMutation({
    mutationFn: (data: SchemaArticleAddBodyType) => {
      return requestPost("article/add", data);
    },
    onSuccess: (resp, data) => {
      queryClient.invalidateQueries({
        queryKey: ["articleLink", data.parentId],
      });
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
};

/** 删除文章 */
export const useDeleteArticle = () => {
  return useMutation({
    mutationFn: (data: SchemaArticleRemoveBodyType) => {
      return requestPost("article/remove", data);
    },
  });
};

/** 搜索文章列表 */
export const useQueryArticleList = (data: SchemaArticleSearchBodyType) => {
  const enableSearch = () => {
    if (data.keyword) return true;
    if (data.tagIds && data.tagIds.length > 0) return true;
    if (data.colors && data.colors.length > 0) return true;
    return false;
  };

  const result = useQuery({
    queryKey: ["articleList", data],
    queryFn: async () => {
      return requestPost<SchemaArticleSearchResponseType>(
        "article/search",
        data,
      );
    },
    enabled: enableSearch(),
  });

  return {
    ...result,
    articleList: result.data?.data?.items || [],
    total: result.data?.data?.total || 0,
  };
};

/** 查询文章树 */
export const useQueryArticleTree = (id?: string) => {
  const result = useQuery({
    queryKey: ["menu", id],
    queryFn: () => {
      return requestPost<SchemaArticleTreeNodeType[]>("article/getTree", {
        id,
      });
    },
    refetchOnWindowFocus: false,
    enabled: !isNil(id),
  });

  return { ...result, articleTree: result.data?.data || [] };
};

/** 查询收藏列表 */
export const useQueryArticleFavorite = (enabled: boolean) => {
  const result = useQuery({
    queryKey: ["favorite"],
    queryFn: () => {
      return requestPost<SchemaArticleMenuType[]>("article/getFavorite", {});
    },
    refetchOnWindowFocus: false,
    enabled,
  });

  return { ...result, articleFavorite: result.data?.data || [] };
};

/** 统计文章 */
export const useQueryArticleCount = () => {
  return useQuery({
    queryKey: ["userStatistic"],
    queryFn: () => {
      return requestPost<SchemaArticleStatisticResponseType>(
        "article/statistic",
        {},
      );
    },
  });
};
