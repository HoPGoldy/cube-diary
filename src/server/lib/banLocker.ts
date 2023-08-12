import { AppKoaContext } from '@/types/global';
import { Next } from 'koa';
import { DatabaseAccessor } from './sqlite';
import { getJwtPayload } from './auth';
import { response } from '../utils';
import { STATUS_CODE } from '@/config';

interface Props {
  db: DatabaseAccessor;
}

/**
 * 创建用户封禁管理器
 */
export const createBanLock = (props: Props) => {
  /**
   * 缓存
   * 键：用户 id，值：用户是否被封禁
   */
  const banCache: Map<number, boolean> = new Map();

  /**
   * 检查指定用户是否被封禁
   * 包含缓存
   */
  const checkUserBan = async (userId: number) => {
    if (banCache.has(userId)) {
      return banCache.get(userId);
    }

    const result = await props.db.user().select('isBanned').where('id', userId).first();
    if (!result) {
      console.error('用户不存在', userId, '跳过封禁检查');
      return false;
    }

    banCache.set(userId, !!result.isBanned);
    return result.isBanned;
  };

  /**
   * 删除指定用户的缓存
   */
  const clearBanCache = (userId: number) => {
    banCache.delete(userId);
  };

  /**
   * 封禁中间件
   * 用于在用户被封禁后拦截
   */
  const checkBanDisable = async (ctx: AppKoaContext, next: Next) => {
    const payload = getJwtPayload(ctx, false);
    if (!payload) return await next();

    const isBanned = await checkUserBan(payload.userId);
    if (isBanned) {
      response(ctx, { code: STATUS_CODE.BAN, msg: '用户已被封禁' });
      return;
    }

    return await next();
  };

  return { clearBanCache, checkBanDisable };
};

export type BanLocker = ReturnType<typeof createBanLock>;
