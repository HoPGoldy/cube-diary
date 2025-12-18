/**
 * 数据库升级工具
 * 会检查 package.json 里的 version 和 storage/dbVersion 文件里的版本号是否一致
 * 不一致就会按照下面的方法依次升级至最高版本
 */

import { createAccessor } from '@/server/lib/fileAccessor';
import { getPackageVersion } from '@/server/utils';
import knex, { Knex } from 'knex';

type DbPatcher = (db: Knex) => Promise<void>;

/**
 * 数据库升级补丁
 * 最上面的版本最早
 */
const DB_PATCH_LIST: Array<{ version: string; patcher: DbPatcher }> = [
  // {
  //     version: '1.1.0',
  //     patcher: async (db) => {
  //         db.schema.hasTable('users').then(exists => {
  //             if (!exists) return
  //             return db.schema.alterTable('users', t => {
  //                 t.string('first_name')
  //                 t.string('last_name')
  //             })
  //         })
  //     }
  // }
];

/**
 * 比较两个版本号大小
 * v1 大于 v2 时返回 1，反之返回 -1，相等返回 0
 */
const compareVersion = (v1: string, v2: string) => {
  if (v1 == v2) {
    return 0;
  }

  const vs1 = v1.split('.').map((a) => parseInt(a));
  const vs2 = v2.split('.').map((a) => parseInt(a));

  const length = Math.min(vs1.length, vs2.length);
  for (let i = 0; i < length; i++) {
    if (vs1[i] > vs2[i]) {
      return 1;
    } else if (vs1[i] < vs2[i]) {
      return -1;
    }
  }

  if (length == vs1.length) {
    return -1;
  } else {
    return 1;
  }
};

export const upgradeDatabase = async (dbFilePath: string) => {
  const packageVersion = getPackageVersion();
  const dbVersionFile = createAccessor({
    fileName: 'dbVersion',
    getInitData: async () => packageVersion,
  });
  const currentVersion = await dbVersionFile.read();

  if (!currentVersion || currentVersion === packageVersion) return;
  let hasUpdate = false;
  console.log('版本更新，正在检查数据库版本...');

  const sqliteDb = knex({
    client: 'sqlite3',
    connection: { filename: dbFilePath },
    useNullAsDefault: true,
  });

  // 检查所有 patch
  for (const patch of DB_PATCH_LIST) {
    // 当前版本号大于 patch 的版本号，说明这个 patch 已经执行过了，跳过
    if (compareVersion(currentVersion, patch.version) > 0) continue;
    // patch 的版本号大于 package.json 里的版本号，说明要升级到的版本不需要执行这个 patch，后续的也不需要执行了，跳出循环
    if (compareVersion(patch.version, packageVersion) > 0) break;

    // 执行 patch
    try {
      await patch.patcher(sqliteDb);
      await dbVersionFile.write(patch.version);
      hasUpdate = true;
    } catch (err) {
      console.error('数据库升级失败！', err);
      console.error('升级失败的版本号：', patch.version);
      return;
    }
  }

  await dbVersionFile.write(packageVersion);
  console.log(hasUpdate ? '数据库升级成功！' : '数据库无需升级！');
};
