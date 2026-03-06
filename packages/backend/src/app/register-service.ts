import { PrismaService } from "@/modules/prisma";
import { registerController as registerAuthController } from "@/modules/auth/controller";
import { registerController as registerAppConfigController } from "@/modules/app-config/controller";
import { registerController as registerAttachmentController } from "@/modules/attachment/controller";
import { registerDiaryController } from "@/modules/diary/controller";
import { AppConfigService } from "@/modules/app-config/service";
import { DiaryService } from "@/modules/diary/service";
import { registerUnifyResponse } from "@/lib/unify-response";
import type { AppInstance } from "@/types";
import { AttachmentService } from "@/modules/attachment/service";
import { AccessTokenService } from "@/modules/access-token/service";
import { registerAccessTokenController } from "@/modules/access-token/controller";
import { SkillService } from "@/modules/skill/service";
import { registerSkillController } from "@/modules/skill/controller";
import { registerRemoveAdditionalProperties } from "@/lib/security";

/**
 * 组装后端服务的主要业务功能
 * 这里手动进行了依赖注入，先创建 service，然后传递给 controller 使用
 */
export const registerService = async (instance: AppInstance) => {
  const prisma = new PrismaService();

  await prisma.seed();

  const appConfigService = new AppConfigService({
    prisma,
  });

  const attachmentService = new AttachmentService({
    prisma,
  });

  const diaryService = new DiaryService({
    prisma,
  });

  const accessTokenService = new AccessTokenService({
    prisma,
  });

  const skillService = new SkillService();

  const appControllerPlugin = async (server: AppInstance) => {
    registerRemoveAdditionalProperties(server);
    registerUnifyResponse(server);

    registerAttachmentController({
      attachmentService,
      server,
    });

    registerAuthController({
      server,
    });

    registerAppConfigController({
      appConfigService,
      server,
    });

    await registerDiaryController({
      server,
      diaryService,
    });

    registerAccessTokenController({
      server,
      accessTokenService,
    });

    registerSkillController({
      server,
      skillService,
    });
  };

  await instance.register(appControllerPlugin, {
    prefix: "/api",
  });
};
