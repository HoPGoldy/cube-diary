import { getStoragePath } from '../lib/fileAccessor';
import { createDb } from '../lib/sqlite';
import { getAppConfig } from '../lib/fileAccessor';
import { createFileService } from '@/server/modules/file/service';
import { createGlobalService } from '../modules/global/service';
import { createLoginLock } from '../lib/LoginLocker';
import { createBanLock } from '../lib/banLocker';
import { createUserService } from '@/server/modules/user/service';
import { createUserManageService } from '@/server/modules/userManage/service';

import { createToken } from '@/server/lib/auth';
import { secretFile } from '@/server/lib/replayAttackDefense';
import { createDiaryService } from '../modules/diary/service';

/**
 * 构建应用
 *
 * 会实例化各个模块的 service
 * 并将不同模块的 service 组装到一起
 */
export const buildApp = async () => {
  const db = createDb({ dbPath: getStoragePath('cube-diary.db') });

  const diaryService = createDiaryService({ db });

  const fileService = createFileService({
    getSaveDir: getStoragePath,
    db,
  });

  const globalService = createGlobalService({
    getConfig: getAppConfig,
    db,
  });

  const loginLocker = createLoginLock({
    excludePath: ['/global', '/user/createAdmin'],
  });

  const banLocker = createBanLock({ db });

  const userInviteService = createUserManageService({
    db,
    // 封禁中间件那边有缓存，所以这边状态更新后需要刷掉缓存
    onUserBanned: (data) => banLocker.clearBanCache(data.userId),
  });

  const userService = createUserService({
    loginLocker,
    createToken: createToken,
    getReplayAttackSecret: secretFile.read,
    db,
    finishUserInvite: userInviteService.userRegister,
  });

  return {
    globalService,
    userService,
    diaryService,
    fileService,
    userInviteService,
    banLocker,
    loginLocker,
  };
};
