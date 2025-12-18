import {
  SchemaArticleGetContentBody,
  SchemaArticleGetLinkBody,
  SchemaArticleGetTreeBody,
  SchemaArticleGetFavoriteBody,
  SchemaArticleAddBody,
  SchemaArticleUpdateBody,
  SchemaArticleRemoveBody,
  SchemaArticleSearchBody,
  SchemaArticleSetFavoriteBody,
  SchemaArticleItem,
  SchemaArticleGetLinkResponse,
  SchemaArticleFavoriteList,
  SchemaArticleStatisticResponse,
  SchemaArticleSearchResponse,
} from "@/types/article";
import { ArticleService } from "./service";
import { AppInstance } from "@/types";
import { transformDate } from "@/utils/vo";

interface RegisterOptions {
  server: AppInstance;
  articleService: ArticleService;
}

export async function registerArticleController(options: RegisterOptions) {
  const { server, articleService } = options;

  server.post(
    "/article/getContent",
    {
      schema: {
        description: "获取文章内容",
        body: SchemaArticleGetContentBody,
        response: {
          200: SchemaArticleItem,
        },
      },
    },
    async (request) => {
      const result = await articleService.getArticleDetail(request.body.id);
      return transformDate(result);
    },
  );

  // 获取文章下属链接信息
  server.post(
    "/article/getLink",
    {
      schema: {
        description: "获取文章下属链接",
        body: SchemaArticleGetLinkBody,
        response: {
          200: SchemaArticleGetLinkResponse,
        },
      },
    },
    async (request) => {
      return await articleService.getChildren(request.body.id);
    },
  );

  // 获取文章树
  server.post(
    "/article/getTree",
    {
      schema: {
        description: "获取文章树形结构",
        body: SchemaArticleGetTreeBody,
      },
    },
    async () => {
      return articleService.getArticleTree();
    },
  );

  // 获取收藏列表
  server.post(
    "/article/getFavorite",
    {
      schema: {
        description: "获取收藏的文章列表",
        body: SchemaArticleGetFavoriteBody,
        response: {
          200: SchemaArticleFavoriteList,
        },
      },
    },
    async () => {
      return await articleService.getFavoriteArticles();
    },
  );

  // 新增文章
  server.post(
    "/article/add",
    {
      schema: {
        description: "新增文章",
        body: SchemaArticleAddBody,
      },
    },
    async (request) => {
      const body = request.body;
      const result = await articleService.createArticle(
        body.title,
        body.content || "",
        body.parentId,
      );
      return { id: result.id };
    },
  );

  // 更新文章
  server.post(
    "/article/update",
    {
      schema: {
        description: "更新文章",
        body: SchemaArticleUpdateBody,
      },
    },
    async (request) => {
      const { id, ...updateData } = request.body;
      await articleService.updateArticle(id, updateData);
      return { success: true };
    },
  );

  // 删除文章
  server.post(
    "/article/remove",
    {
      schema: {
        description: "删除文章",
        body: SchemaArticleRemoveBody,
      },
    },
    async (request) => {
      const body = request.body;
      await articleService.deleteArticle(body.id, body.force);
      return { success: true };
    },
  );

  // 搜索/获取文章列表
  server.post(
    "/article/search",
    {
      schema: {
        description: "获取文章列表",
        body: SchemaArticleSearchBody,
        response: {
          200: SchemaArticleSearchResponse,
        },
      },
    },
    async (request) => {
      const body = request.body;
      const { keyword = "", page = 1, pageSize = 20, colors, tagIds } = body;
      return await articleService.searchArticles(
        keyword,
        page,
        pageSize,
        colors,
        tagIds,
      );
    },
  );

  // 设置收藏
  server.post(
    "/article/setFavorite",
    {
      schema: {
        description: "设置文章收藏状态",
        body: SchemaArticleSetFavoriteBody,
      },
    },
    async (request) => {
      const body = request.body;
      return await articleService.setFavorite(body.id, body.favorite);
    },
  );

  server.post(
    "/article/statistic",
    {
      schema: {
        description: "统计文章数量",
        response: {
          200: SchemaArticleStatisticResponse,
        },
      },
    },
    async () => {
      return await articleService.statisticArticles();
    },
  );
}
