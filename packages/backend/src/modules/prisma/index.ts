import { PrismaClient } from "@db/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PATH_DATABASE } from "@/config/path";

export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaBetterSqlite3({
      url: `file:${PATH_DATABASE}`,
    });

    super({ adapter });
  }

  async seed() {
    // 数据库初始化预留接口
  }
}
