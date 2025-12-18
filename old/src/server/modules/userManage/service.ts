import { nanoid } from 'nanoid';
import { DatabaseAccessor } from '@/server/lib/sqlite';
import { BanUserReqData, UserInviteStorage } from '@/types/userInvite';
import { TABLE_NAME } from '@/config';

interface Props {
  db: DatabaseAccessor;
  /** 回调 - 用户被封禁 */
  onUserBanned?: (data: BanUserReqData) => void;
}

export const createUserManageService = (props: Props) => {
  const { db } = props;

  /**
   * 新增用户邀请
   */
  const addInvite = async () => {
    const initStorage: Omit<UserInviteStorage, 'id'> = {
      inviteCode: nanoid(8),
      createTime: Date.now(),
    };

    const [id] = await db.userInvite().insert(initStorage);
    const data: UserInviteStorage = {
      ...initStorage,
      id,
    };

    return { code: 200, data };
  };

  /**
   * 删除用户邀请
   */
  const deleteInvite = async (id: number) => {
    await db.userInvite().delete().where('id', id);
    return { code: 200 };
  };

  /**
   * 查看邀请列表
   */
  const getInviteList = async () => {
    const data = await db
      .userInvite()
      .select()
      .select('userInvites.*')
      .select('users.isBanned as isBanned')
      .select('users.id as userId')
      .leftJoin(db.knex.raw(`${TABLE_NAME.USER} ON users.username = userInvites.username`));

    return { code: 200, data };
  };

  /**
   * 用户执行注册
   */
  const userRegister = async (username: string, inviteCode: string) => {
    const inviteStorage = await db.userInvite().select().where({ inviteCode }).first();
    if (!inviteStorage) return { code: 400, msg: '邀请码错误' };

    await db
      .userInvite()
      .update({
        useTime: Date.now(),
        username,
      })
      .where('inviteCode', inviteCode);
    return { code: 200 };
  };

  /**
   * 封禁 / 解封用户
   */
  const banUser = async (data: BanUserReqData) => {
    await db.user().update('isBanned', data.isBanned).where('id', data.userId);
    props.onUserBanned?.(data);
    return { code: 200 };
  };

  return { addInvite, deleteInvite, getInviteList, userRegister, banUser };
};

export type UserInviteService = ReturnType<typeof createUserManageService>;
