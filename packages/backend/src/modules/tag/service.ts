import { PrismaClient } from "@db/client";
import { ErrorNotFound } from "@/types/error";

interface ServiceOptions {
  prisma: PrismaClient;
}

export class TagService {
  constructor(private options: ServiceOptions) {}

  async createTag(title: string, color?: string) {
    return await this.options.prisma.tag.create({
      data: { title, color },
    });
  }

  async updateTag(id: string, data: { title?: string; color?: string }) {
    const tag = await this.options.prisma.tag.findUnique({
      where: { id },
    });
    if (!tag) throw new ErrorNotFound("Tag not found");

    return await this.options.prisma.tag.update({
      where: { id },
      data: { title: data.title, color: data.color },
    });
  }

  async deleteTag(id: string) {
    const tag = await this.options.prisma.tag.findUnique({
      where: { id },
    });
    if (!tag) throw new ErrorNotFound("Tag not found");

    await this.options.prisma.tag.delete({ where: { id } });
  }

  async getTagList() {
    return await this.options.prisma.tag.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, title: true, color: true },
    });
  }

  async getTagById(id: string) {
    const tag = await this.options.prisma.tag.findUnique({
      where: { id },
    });
    if (!tag) throw new ErrorNotFound("Tag not found");
    return tag;
  }

  async batchSetTagColor(tagIds: string[], color: string) {
    await this.options.prisma.tag.updateMany({
      where: { id: { in: tagIds } },
      data: { color },
    });
  }

  async batchDeleteTags(ids: string[]) {
    await this.options.prisma.tag.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
