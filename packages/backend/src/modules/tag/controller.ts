import {
  SchemaTagListBody,
  SchemaTagAddBody,
  SchemaTagUpdateBody,
  SchemaTagRemoveBody,
  SchemaTagBatchSetColorBody,
  SchemaTagBatchRemoveBody,
  SchemaTagItem,
  SchemaTagList,
} from "@/types/tag";
import { TagService } from "./service";
import { AppInstance } from "@/types";

interface RegisterOptions {
  server: AppInstance;
  tagService: TagService;
}

export async function registerTagController(options: RegisterOptions) {
  const { server, tagService } = options;

  // 获取标签详情
  server.get<{ Params: { id: string } }>(
    "/tag/:id",
    {
      schema: {
        description: "获取标签详情",
        response: {
          200: SchemaTagItem,
        },
      },
    },
    async (request) => {
      return await tagService.getTagById(request.params.id);
    },
  );

  // 获取标签列表
  server.post(
    "/tag/list",
    {
      schema: {
        description: "获取所有标签",
        body: SchemaTagListBody,
        response: {
          200: SchemaTagList,
        },
      },
    },
    async () => {
      return await tagService.getTagList();
    },
  );

  // 新增标签
  server.post(
    "/tag/add",
    {
      schema: {
        description: "创建标签",
        body: SchemaTagAddBody,
      },
    },
    async (request) => {
      const result = await tagService.createTag(
        request.body.title,
        request.body.color,
      );

      return result.id;
    },
  );

  // 更新标签
  server.post(
    "/tag/update",
    {
      schema: {
        description: "更新标签",
        body: SchemaTagUpdateBody,
      },
    },
    async (request) => {
      const { id, ...updateData } = request.body;
      return await tagService.updateTag(id, updateData);
    },
  );

  // 删除标签
  server.post(
    "/tag/remove",
    {
      schema: {
        description: "删除标签",
        body: SchemaTagRemoveBody,
      },
    },
    async (request) => {
      await tagService.deleteTag(request.body.id.toString());
      return { success: true };
    },
  );

  // 批量设置标签颜色
  server.post(
    "/tag/batch/setColor",
    {
      schema: {
        description: "批量设置标签颜色",
        body: SchemaTagBatchSetColorBody,
      },
    },
    async (request) => {
      await tagService.batchSetTagColor(
        request.body.tagIds,
        request.body.color,
      );
      return { success: true };
    },
  );

  // 批量删除标签
  server.post(
    "/tag/batch/remove",
    {
      schema: {
        description: "批量删除标签",
        body: SchemaTagBatchRemoveBody,
      },
    },
    async (request) => {
      await tagService.batchDeleteTags(request.body.ids);
      return { success: true };
    },
  );
}
