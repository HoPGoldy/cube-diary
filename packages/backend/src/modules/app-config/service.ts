import NodeCache from "@cacheable/node-cache";
import { PrismaClient } from "@db/client";
import { SchemaAppConfigType } from "@/types/app-config";

interface ServiceOptions {
  prisma: PrismaClient;
}

export class AppConfigService {
  constructor(private options: ServiceOptions) {}

  private cache = new NodeCache<string>({ stdTTL: 300, checkperiod: 60 });

  async findByKey(key: string) {
    return this.options.prisma.appConfig.findUnique({
      where: { key },
    });
  }

  async getAll(): Promise<SchemaAppConfigType> {
    const cachedConfigs = this.cache.get("allConfigs");
    if (cachedConfigs) {
      return JSON.parse(cachedConfigs);
    }

    const configList = await this.options.prisma.appConfig.findMany({
      orderBy: {
        key: "asc",
      },
    });

    const configs = {};
    configList.forEach((config) => {
      configs[config.key] = config.value;
    });

    this.cache.set("allConfigs", JSON.stringify(configs));
    return configs as SchemaAppConfigType;
  }

  async setConfigValues(configs: Record<string, string>) {
    if (!Object.keys(configs).length) {
      return;
    }

    const result = await this.options.prisma.$transaction(
      Object.entries(configs).map(([key, value]) =>
        this.options.prisma.appConfig.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        }),
      ),
    );

    this.cache.del("allConfigs");
    return result;
  }
}
