import type { AppInstance } from "@/types";
import type { SkillService } from "./service";

interface RegisterOptions {
  server: AppInstance;
  skillService: SkillService;
}

export const registerSkillController = (options: RegisterOptions) => {
  const { server, skillService } = options;

  server.get(
    "/skill.zip",
    {
      config: { disableAuth: true },
      schema: {
        description: "下载 AI Skill 包（含 SKILL.md 和 assets/openapi.json）",
        tags: ["skill"],
        hide: true,
      },
    },
    async (request, reply) => {
      const protocol =
        (request.headers["x-forwarded-proto"] as string) ?? request.protocol;
      const host =
        (request.headers["x-forwarded-host"] as string) ?? request.hostname;
      const baseUrl = `${protocol}://${host}`;

      const zip = await skillService.getSkillZip(baseUrl, server);

      reply
        .header("Content-Type", "application/zip")
        .header("Content-Disposition", "attachment; filename=skill.zip");
      return reply.send(zip);
    },
  );
};
