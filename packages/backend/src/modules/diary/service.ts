import { PrismaClient } from "@db/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { readFile } from "fs/promises";
import {
  SchemaDiarySearchBodyType,
  SchemaDiaryUpdateBodyType,
  SchemaDiaryImportBodyType,
  SchemaDiaryExportBodyType,
} from "@/types/diary";

// 启用 dayjs UTC 插件
dayjs.extend(utc);

interface ServiceOptions {
  prisma: PrismaClient;
}

export class DiaryService {
  private readonly DEFAULT_PAGE_SIZE = 20;

  constructor(private options: ServiceOptions) {}

  /**
   * 将日期转换为 UTC 0 时区的开始时间戳
   */
  private toUTCTimestamp(date: number): number {
    return dayjs(date).utc().startOf("day").valueOf();
  }

  async getMonthList(month: string) {
    const diaryDate = dayjs(month, "YYYYMM").utc();
    const startDate = diaryDate.startOf("M").subtract(3, "d").valueOf();
    const endDate = diaryDate.endOf("M").add(3, "day").valueOf();

    const diaries = await this.options.prisma.diary.findMany({
      where: {
        date: {
          gte: BigInt(startDate),
          lte: BigInt(endDate),
        },
      },
      select: {
        date: true,
        content: true,
        color: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    return diaries.map((d) => ({
      date: Number(d.date),
      content: d.content,
      color: d.color,
    }));
  }

  async getDetail(date: number) {
    const utcDate = this.toUTCTimestamp(date);

    const diary = await this.options.prisma.diary.findUnique({
      where: {
        date: BigInt(utcDate),
      },
      select: {
        content: true,
        color: true,
      },
    });

    return diary || { content: "", color: null };
  }

  async updateDetail(data: SchemaDiaryUpdateBodyType) {
    const { date, content, color } = data;
    const utcDate = this.toUTCTimestamp(date);

    await this.options.prisma.diary.upsert({
      where: {
        date: BigInt(utcDate),
      },
      create: {
        date: BigInt(utcDate),
        content: content || "",
        color: color,
      },
      update: {
        content: content !== undefined ? content : undefined,
        color: color !== undefined ? color : undefined,
      },
    });
  }

  async searchDiary(params: SchemaDiarySearchBodyType) {
    const {
      page = 1,
      pageSize = this.DEFAULT_PAGE_SIZE,
      colors = [],
      keyword,
      desc = true,
    } = params;

    const where: any = {};

    if (colors.length > 0) {
      where.color = { in: colors };
    }

    if (keyword) {
      where.content = { contains: keyword };
    }

    const [total, rows] = await Promise.all([
      this.options.prisma.diary.count({ where }),
      this.options.prisma.diary.findMany({
        where,
        select: {
          date: true,
          content: true,
          color: true,
        },
        orderBy: {
          date: desc ? "desc" : "asc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      total,
      rows: rows.map((r) => ({
        date: Number(r.date),
        content: r.content,
        color: r.color,
      })),
    };
  }

  async importDiary(filePath: string, config: SchemaDiaryImportBodyType) {
    const jsonFile = await readFile(filePath);
    const jsonContent = JSON.parse(jsonFile.toString());

    if (!Array.isArray(jsonContent)) {
      throw new Error("导入的文件格式不正确，需要是 JSON 数组");
    }

    // 提取需要导入的日记日期（转换为 UTC 0）
    const needImportDates: number[] = [];
    for (const diary of jsonContent) {
      const date = diary[config.dateKey];
      if (!date) {
        throw new Error("导入的日记中没有日期字段");
      }
      const utcDate = this.toUTCTimestamp(
        dayjs(date, config.dateFormatter).valueOf(),
      );
      needImportDates.push(utcDate);
    }

    // 查询已存在的日记
    const existDiaries = await this.options.prisma.diary.findMany({
      where: {
        date: {
          in: needImportDates.map((d) => BigInt(d)),
        },
      },
    });

    const existDiaryMap = new Map(existDiaries.map((d) => [Number(d.date), d]));

    let insertCount = 0;
    let updateCount = 0;
    let insertNumber = 0;

    // 处理导入逻辑
    for (const diary of jsonContent) {
      const date = this.toUTCTimestamp(
        dayjs(diary[config.dateKey], config.dateFormatter).valueOf(),
      );
      const content = diary[config.contentKey] || "";
      const color = diary[config.colorKey] || null;

      const existDiary = existDiaryMap.get(date);

      if (!existDiary) {
        // 新增
        await this.options.prisma.diary.create({
          data: {
            date: BigInt(date),
            content,
            color,
          },
        });
        insertCount++;
        insertNumber += content.length;
      } else {
        // 处理已存在的日记
        if (config.existOperation === "skip") {
          continue;
        }

        let newContent = content;
        if (config.existOperation === "merge") {
          newContent = `${existDiary.content}\n${content}`;
        }

        await this.options.prisma.diary.update({
          where: {
            date: BigInt(date),
          },
          data: {
            content: newContent,
            color,
          },
        });
        updateCount++;
      }
    }

    return {
      insertCount,
      updateCount,
      insertNumber,
    };
  }

  async exportDiary(config: SchemaDiaryExportBodyType) {
    const where: any = {};

    if (config.range === "part") {
      const startDate = this.toUTCTimestamp(config.startDate!);
      const endDate = this.toUTCTimestamp(config.endDate!);

      where.date = {
        gte: BigInt(startDate),
        lte: BigInt(endDate),
      };
    }

    const diaries = await this.options.prisma.diary.findMany({
      where,
      select: {
        date: true,
        content: true,
        color: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    const data = diaries.map((diary) => ({
      [config.dateKey]: config.dateFormatter
        ? dayjs(Number(diary.date)).utc().format(config.dateFormatter)
        : Number(diary.date),
      [config.contentKey]: diary.content,
      [config.colorKey]: diary.color,
    }));

    return JSON.stringify(data, null, 2);
  }
}
