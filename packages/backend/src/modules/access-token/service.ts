import { PrismaClient } from "@db/client";
import { createHash, randomBytes } from "crypto";

export const ACCESS_TOKEN_PREFIX = "csk-";

interface ServiceOptions {
  prisma: PrismaClient;
}

export class AccessTokenService {
  /** tokenHash → record id 的内存缓存 */
  private cache = new Map<string, string>();
  private cacheLoaded = false;

  constructor(private options: ServiceOptions) {}

  private hash(plain: string): string {
    return createHash("sha256").update(plain).digest("hex");
  }

  /** 首次使用时加载全部 tokenHash 到内存 */
  private async ensureCache() {
    if (this.cacheLoaded) return;
    const records = await this.options.prisma.accessToken.findMany({
      select: { id: true, tokenHash: true },
    });
    for (const r of records) {
      this.cache.set(r.tokenHash, r.id);
    }
    this.cacheLoaded = true;
  }

  async create(name: string) {
    const raw = randomBytes(32).toString("hex");
    const plain = ACCESS_TOKEN_PREFIX + raw;
    const tokenPrefix = raw.slice(0, 8);
    const tokenHash = this.hash(raw);

    const record = await this.options.prisma.accessToken.create({
      data: { name, tokenHash, tokenPrefix },
    });

    this.cache.set(tokenHash, record.id);

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
    const record = await this.options.prisma.accessToken.delete({
      where: { id },
    });
    this.cache.delete(record.tokenHash);
  }

  /**
   * 验证明文 token（不含 csk- 前缀），验证通过则更新 lastUsedAt
   * @returns 记录对象，验证失败返回 null
   */
  async verify(plain: string) {
    await this.ensureCache();
    const tokenHash = this.hash(plain);

    if (!this.cache.has(tokenHash)) return null;

    const record = await this.options.prisma.accessToken.findUnique({
      where: { tokenHash },
    });

    if (!record) {
      this.cache.delete(tokenHash);
      return null;
    }

    await this.options.prisma.accessToken.update({
      where: { id: record.id },
      data: { lastUsedAt: new Date() },
    });

    return record;
  }
}
