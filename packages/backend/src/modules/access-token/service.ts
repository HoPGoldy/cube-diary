import { PrismaClient } from "@db/client";
import { createHash, randomBytes } from "crypto";

interface ServiceOptions {
  prisma: PrismaClient;
}

export class AccessTokenService {
  constructor(private options: ServiceOptions) {}

  private hash(plain: string): string {
    return createHash("sha256").update(plain).digest("hex");
  }

  async create(name: string) {
    const plain = randomBytes(32).toString("hex");
    const tokenPrefix = plain.slice(0, 8);
    const tokenHash = this.hash(plain);

    const record = await this.options.prisma.accessToken.create({
      data: { name, tokenHash, tokenPrefix },
    });

    return {
      id: record.id,
      name: record.name,
      tokenPrefix: record.tokenPrefix,
      token: plain,
      createdAt: record.createdAt.toISOString(),
    };
  }

  async findAll() {
    const records = await this.options.prisma.accessToken.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        tokenPrefix: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });

    return records.map((r) => ({
      id: r.id,
      name: r.name,
      tokenPrefix: r.tokenPrefix,
      createdAt: r.createdAt.toISOString(),
      lastUsedAt: r.lastUsedAt ? r.lastUsedAt.toISOString() : null,
    }));
  }

  async delete(id: string) {
    await this.options.prisma.accessToken.delete({ where: { id } });
  }

  /**
   * 验证明文 token，验证通过则更新 lastUsedAt
   * @returns 记录对象，验证失败返回 null
   */
  async verify(plain: string) {
    const tokenHash = this.hash(plain);
    const record = await this.options.prisma.accessToken.findUnique({
      where: { tokenHash },
    });

    if (!record) return null;

    await this.options.prisma.accessToken.update({
      where: { id: record.id },
      data: { lastUsedAt: new Date() },
    });

    return record;
  }
}
