import { PrismaClient } from "@db/client";
import { ErrorNotFound } from "@/types/error";
import { buildArticleTree } from "./utils";
import { appendIdToPath, getParentIdByPath, pathToArray } from "@/utils/tree";
import { ArticleWhereInput } from "@db/models";
import { SchemaArticleGetLinkResponseType } from "@/types/article";

interface ServiceOptions {
  prisma: PrismaClient;
}

export class ArticleService {
  constructor(private options: ServiceOptions) {}

  async createArticle(title: string, content: string, parentId?: string) {
    let parentPath = "";

    if (parentId) {
      const parent = await this.options.prisma.article.findUnique({
        where: { id: parentId },
      });
      if (!parent) throw new ErrorNotFound("Parent article not found");
      parentPath = appendIdToPath(parent.parentPath, parentId);
    }

    return await this.options.prisma.article.create({
      data: { title, content, parentPath },
    });
  }

  async updateArticle(
    id: string,
    data: {
      title?: string;
      content?: string;
      tagIds?: string;
      favorite?: boolean;
    },
  ) {
    const article = await this.options.prisma.article.findUnique({
      where: { id },
    });
    if (!article) throw new ErrorNotFound("Article not found");

    return await this.options.prisma.article.update({ where: { id }, data });
  }

  async deleteArticle(id: string, force: boolean = false) {
    const article = await this.options.prisma.article.findUnique({
      where: { id },
    });
    if (!article) return;

    const children = await this.options.prisma.article.findMany({
      where: { parentPath: { contains: `${article.parentPath}${id}#` } },
    });

    if (children.length > 0 && !force) {
      throw new Error("Cannot delete article with children");
    }

    if (force && children.length > 0) {
      await this.options.prisma.article.deleteMany({
        where: { id: { in: children.map((c) => c.id) } },
      });
    }

    await this.options.prisma.article.delete({ where: { id } });
  }

  async searchArticles(
    keyword: string,
    page: number = 1,
    pageSize: number = 20,
    colors?: string[],
    tagIds?: string[],
  ) {
    const skip = (page - 1) * pageSize;
    const whereClause: ArticleWhereInput = {
      AND: [
        keyword
          ? {
              OR: [
                { title: { contains: keyword } },
                { content: { contains: keyword } },
              ],
            }
          : {},
        colors && colors.length > 0 ? { color: { in: colors } } : {},
        tagIds && tagIds.length > 0
          ? {
              OR: tagIds.map((id) => ({ tagIds: { contains: id } })),
            }
          : {},
      ],
    };

    const [rows, total] = await this.options.prisma.$transaction([
      this.options.prisma.article.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: { updatedAt: "desc" },
      }),
      this.options.prisma.article.count({
        where: whereClause,
      }),
    ]);

    const items = rows.map((item) => {
      let content = "";
      // 截取正文中关键字前后的内容
      if (keyword) {
        const matched = item.content.match(new RegExp(keyword, "i"));
        if (matched && matched.index) {
          content = item.content.slice(
            Math.max(matched.index - 30, 0),
            matched.index + 30,
          );
        }
      }
      if (!content) content = item.content.slice(0, 30);

      const tagIdsArr = item.tagIds ? pathToArray(item.tagIds) : [];

      return {
        id: item.id,
        title: item.title,
        tagIds: tagIdsArr,
        content,
      };
    });

    return { items, total };
  }

  async getArticleTree() {
    const articles = await this.options.prisma.article.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, title: true, parentPath: true, color: true },
    });
    return buildArticleTree(articles);
  }

  async setFavorite(id: string, favorite: boolean) {
    const article = await this.options.prisma.article.findUnique({
      where: { id },
    });
    if (!article) throw new ErrorNotFound("Article not found");

    return await this.options.prisma.article.update({
      where: { id },
      data: { favorite },
    });
  }

  async getArticleDetail(id: string) {
    const article = await this.options.prisma.article.findUnique({
      where: { id },
    });
    if (!article) throw new ErrorNotFound("Article not found");
    return article;
  }

  async getChildren(id: string) {
    const article = await this.options.prisma.article.findUnique({
      where: { id },
    });
    if (!article) throw new ErrorNotFound("Article not found");

    const parentId = getParentIdByPath(article.parentPath);
    const prefix = `${article.parentPath || ""}${id}#`;

    const matchedArticles = await this.options.prisma.article.findMany({
      where: parentId
        ? { OR: [{ parentPath: prefix }, { id: parentId }] }
        : { parentPath: prefix },
      orderBy: { createdAt: "asc" },
      select: { id: true, title: true, parentPath: true, color: true },
    });

    const data: SchemaArticleGetLinkResponseType = {
      parentArticleIds: null,
      parentArticleTitle: null,
      childrenArticles: [],
    };

    matchedArticles.forEach((item) => {
      if (parentId && item.id === parentId) {
        data.parentArticleIds = [...pathToArray(item.parentPath), item.id];
        data.parentArticleTitle = item.title;
        return;
      }
      data.childrenArticles.push(item);
    });

    return data;
  }

  async getFavoriteArticles() {
    return await this.options.prisma.article.findMany({
      where: { favorite: true },
      select: { id: true, title: true, color: true, parentPath: true },
      orderBy: { updatedAt: "desc" },
    });
  }

  async statisticArticles() {
    const countResult = await this.options.prisma.article.aggregate({
      _count: { id: true },
    });

    const sumResult = await this.options.prisma.$queryRaw<
      { totalLength: number | null }[]
    >`SELECT SUM(LENGTH(content)) AS totalLength FROM "Article"`;

    return {
      articleCount: countResult._count.id,
      articleLength: Number(sumResult[0]?.totalLength) || 0,
    };
  }
}
