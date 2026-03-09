import { PrismaClient } from "@db/client";
import { createHash, randomBytes } from "crypto";
import { ACCESS_TOKEN_SCOPES, type AccessTokenScope } from "./scopes";
import { ErrorBadRequest } from "@/types/error";

export const ACCESS_TOKEN_PREFIX = "csk-";

interface ServiceOptions {
  prisma: PrismaClient;
}

interface CacheEntry {
  id: string;
  scopes: string[];
}

export class AccessTokenService {
  /** tokenHash → { id, scopes } 的内存缓存 */
  private cache = new Map<string, CacheEntry>();
  private cacheLoaded = false;

  constructor(private options: ServiceOptions) {}

  private hash(plain: string): string {
    return createHash("sha256").update(plain).digest("hex");
  }

  private parseScopes(raw: string): string[] {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private validateScopes(scopes: string[]) {
    const invalid = scopes.filter(
      (s) => !(ACCESS_TOKEN_SCOPES as readonly string[]).includes(s),
    );
    if (invalid.length > 0) {
      throw new ErrorBadRequest(`Invalid scopes: ${invalid.join(", ")}`);
    }
  }

  /** 首次使用时加载全部 tokenHash 到内存 */
  private async ensureCache() {
    if (this.cacheLoaded) return;
    const records = await this.options.prisma.accessToken.findMany({
      select: { id: true, tokenHash: true, scopes: true },
    });
    for (const r of records) {
      this.cache.set(r.tokenHash, {
        id: r.id,
        scopes: this.parseScopes(r.scopes),
      });
    }
    this.cacheLoaded = true;
  }

  async create(name: string, scopes: AccessTokenScope[]) {
    this.validateScopes(scopes);

    const raw = randomBytes(32).toString("hex");
    const plain = ACCESS_TOKEN_PREFIX + raw;
    const tokenPrefix = raw.slice(0, 8);
    const tokenHash = this.hash(raw);

    const record = await this.options.prisma.accessToken.create({
      data: { name, tokenHash, tokenPrefix, scopes: JSON.stringify(scopes) },
    });

    this.cache.set(tokenHash, {
      id: record.id,
      scopes,
    });

    return {
      id: record.id,
      name: record.name,
      tokenPrefix: record.tokenPrefix,
      token: plain,
      scopes,
      createdAt: record.createdAt.toISOString(),
    };
  }

  async update(id: string, name: string, scopes: AccessTokenScope[]) {
    this.validateScopes(scopes);

    const record = await this.options.prisma.accessToken.update({
      where: { id },
      data: { name, scopes: JSON.stringify(scopes) },
    });

    // 更新缓存
    const entry = [...this.cache.entries()].find(([, v]) => v.id === id);
    if (entry) {
      this.cache.set(entry[0], { id, scopes });
    }

    return {
      id: record.id,
      name: record.name,
      scopes,
    };
  }

  async findAll() {
    const records = await this.options.prisma.accessToken.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        tokenPrefix: true,
        scopes: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });

    return records.map((r) => ({
      id: r.id,
      name: r.name,
      tokenPrefix: r.tokenPrefix,
      scopes: this.parseScopes(r.scopes),
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
   * @returns { id, scopes }，验证失败返回 null
   */
  async verify(plain: string): Promise<CacheEntry | null> {
    await this.ensureCache();
    const tokenHash = this.hash(plain);

    const cached = this.cache.get(tokenHash);
    if (!cached) return null;

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

    return cached;
  }
}
