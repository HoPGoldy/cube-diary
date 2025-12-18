import { PrismaClient } from "@db/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PATH_DATABASE } from "@/config/path";
import { HOME_CONTENT, HOME_TITLE } from "./constants";

export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaBetterSqlite3({
      url: `file:${PATH_DATABASE}`,
    });

    super({ adapter });
  }

  async seed() {
    // 初始化根文章
    await this.$transaction(async (tx) => {
      // 查询 ROOT_ARTICLE_ID 配置
      const rootArticleConfig = await tx.appConfig.findUnique({
        where: { key: "ROOT_ARTICLE_ID" },
      });

      // 如果配置不存在或文章不存在，则创建新文章
      if (!rootArticleConfig) {
        const article = await tx.article.create({
          data: {
            title: HOME_TITLE,
            content: HOME_CONTENT,
          },
        });

        // 创建配置记录
        await tx.appConfig.create({
          data: {
            key: "ROOT_ARTICLE_ID",
            value: article.id,
          },
        });

        console.log("Created root article:", article.id);
      } else {
        // 检查文章是否存在
        const article = await tx.article.findUnique({
          where: { id: rootArticleConfig.value },
        });

        if (!article) {
          // 文章不存在，创建新文章并更新配置
          const newArticle = await tx.article.create({
            data: {
              title: HOME_TITLE,
              content: HOME_CONTENT,
            },
          });

          await tx.appConfig.update({
            where: { key: "ROOT_ARTICLE_ID" },
            data: { value: newArticle.id },
          });

          console.log("Recreated root article:", newArticle.id);
        } else {
          console.log("Root article already exists:", article.id);
        }
      }
    });
  }
}
