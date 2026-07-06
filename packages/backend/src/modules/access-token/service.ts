import { PrismaClient } from "@db/client";
import { createHash, randomBytes } from "crypto";
import {
  ACCESS_TOKEN_SCOPES,
  DEFAULT_ACCESS_TOKEN_SCOPES,
  type AccessTokenScope,
} from "@/types/access-token";
import { ErrorBadRequest } from "@/types/error";

export const ACCESS_TOKEN_PREFIX = "csk-";

interface ServiceOptions {
  prisma: PrismaClient;
}

interface CacheEntry {
  id: string;
  scopes: AccessTokenScope[];
}

export class AccessTokenService {
  /**
   * tokenHash → { id, scopes } 的内存缓存。
   *
   * 这里保留缓存是有意为之，不是过度优化：
   * 1. access token 会暴露在公网接口上，天然会面对伪造 token 的探测请求；
   * 2. 对于明显不存在的 token，优先在内存中失败，可以避免每次都打到数据库；
   * 3. 单人项目的 token 数量通常很少，全量缓存成本低，但能显著降低恶意撞库时的 DB 压力。
   *
   * 命中缓存后仍然会查库并更新 lastUsedAt，这是为了保证：
   * 1. 删除后的 token 能及时失效；
   * 2. lastUsedAt 仍然准确可追踪。
   */
  private cache = new Map<string, CacheEntry>();
  private cacheLoaded = false;

  constructor(private options: ServiceOptions) {}

  private hash(plain: string): string {
    return createHash("sha256").update(plain).digest("hex");
  }

  private parseScopes(raw: string): AccessTokenScope[] {
    try {
      return JSON.parse(raw) as AccessTokenScope[];
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

  /**
   * 首次使用时加载全部 tokenHash 到内存。
   * 单人项目 token 数量有限，这种实现比引入 Redis / 限流中间件更简单，维护成本更低。
   */
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

  async create(
    name: string,
    scopes: AccessTokenScope[] = DEFAULT_ACCESS_TOKEN_SCOPES,
  ) {
    const finalScopes =
      scopes.length > 0 ? scopes : DEFAULT_ACCESS_TOKEN_SCOPES;
    this.validateScopes(finalScopes);

    const raw = randomBytes(32).toString("hex");
    const plain = ACCESS_TOKEN_PREFIX + raw;
    const tokenPrefix = raw.slice(0, 8);
    const tokenHash = this.hash(raw);

    const record = await this.options.prisma.accessToken.create({
      data: {
        name,
        tokenHash,
        tokenPrefix,
        scopes: JSON.stringify(finalScopes),
      },
    });

    this.cache.set(tokenHash, {
      id: record.id,
      scopes: finalScopes,
    });

    return {
      id: record.id,
      name: record.name,
      tokenPrefix: record.tokenPrefix,
      token: plain,
      scopes: finalScopes,
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
