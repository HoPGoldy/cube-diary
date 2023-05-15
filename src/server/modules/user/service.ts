import { AppTheme, UserStorage, LoginSuccessResp, RegisterReqData } from '@/types/user'
import { AppResponse } from '@/types/global'
import { STATUS_CODE } from '@/config'
import { sha } from '@/utils/crypto'
import { LoginLocker } from '@/server/lib/LoginLocker'
import { nanoid } from 'nanoid'
import { ArticleService } from '../article/service'
import { DatabaseAccessor } from '@/server/lib/sqlite'
import { UserInviteService } from '../userManage/service'
import { FIRST_NOTE_CONTENT, FIRST_NOTE_TITLE } from './firstNote'

interface Props {
    loginLocker: LoginLocker
    createToken: (payload: Record<string, any>) => Promise<string>
    getReplayAttackSecret: () => Promise<string>
    db: DatabaseAccessor
    addArticle: ArticleService['addArticle']
    finishUserInvite: UserInviteService['userRegister']
}

export const createUserService = (props: Props) => {
    const {
        loginLocker, createToken,
        finishUserInvite,
        getReplayAttackSecret,
        addArticle,
        db,
    } = props

    const loginFail = (ip: string, msg = '账号或密码错误') => {
        const lockInfo = loginLocker.recordLoginFail(ip)
        const retryNumber = 3 - lockInfo.length
        const message = retryNumber > 0 ? `将在 ${retryNumber} 次后锁定登录` : '账号已被锁定'
        return { code: 401, msg: `${msg}，${message}` }
    }

    /**
     * 直接获取用户信息
     */
    const getUserInfo = async (userId: number, ip: string): Promise<AppResponse> => {
        const userStorage = await db.user().select().where({ id: userId }).first()
        if (!userStorage) return loginFail(ip, '用户不存在')

        const { username, theme, initTime, isAdmin, rootArticleId } = userStorage

        // 用户每次重新进入页面都会刷新 token
        const token = await createToken({ userId, isAdmin })
        const replayAttackSecret = await getReplayAttackSecret()

        const data: LoginSuccessResp = {
            token,
            theme,
            initTime,
            isAdmin,
            username,
            rootArticleId,
            replayAttackSecret,
        }

        loginLocker.clearRecord(ip)

        return { code: 200, data }
    }

    /**
     * 登录
     */
    const login = async (username: string, password: string, ip: string): Promise<AppResponse> => {
        const userStorage = await db.user().select().where({ username }).first()
        if (!userStorage) return loginFail(ip)

        const { passwordHash, passwordSalt, isBanned } = userStorage
        if (passwordHash !== sha(passwordSalt + password)) return loginFail(ip)

        if (isBanned) {
            return { code: STATUS_CODE.BAN, msg: '您已被封禁' }
        }

        return getUserInfo(userStorage.id, ip)
    }

    /**
     * 注册
     */
    const register = async (data: RegisterReqData & { isAdmin?: boolean }): Promise<AppResponse> => {
        const { username, passwordHash, inviteCode, isAdmin = false } = data

        if (!isAdmin) {
            const inviteResp = await finishUserInvite(username, inviteCode)
            if (inviteResp.code !== STATUS_CODE.SUCCESS) return inviteResp
        }

        const userStorage = await db.user().select('id').where({ username }).first()
        if (userStorage) {
            return { code: STATUS_CODE.ALREADY_REGISTER, msg: '已经注册' }
        }

        const passwordSalt = nanoid()
        const initStorage: Omit<UserStorage, 'id'> = {
            username,
            passwordHash: sha(passwordSalt + passwordHash),
            passwordSalt,
            initTime: Date.now(),
            rootArticleId: -1,
            theme: AppTheme.Light,
            isAdmin,
        }

        // 获取新用户的 id
        const [id] = await db.user().insert(initStorage)

        // 给这个用户创建一个根节点文章
        const createResp = await addArticle(FIRST_NOTE_TITLE, FIRST_NOTE_CONTENT, id)
        if (!createResp.data) return createResp

        // 把根节点文章 id 存到用户表
        await db.user().update({ rootArticleId: createResp.data }).where({ id })
        return { code: 200 }
    }

    /**
     * 创建管理员
     */
    const createAdmin = async (username: string, passwordHash: string): Promise<AppResponse> => {
        const [{ ['count(*)']: userCount }] = await db.user().count()
        if (+userCount > 0) {
            return { code: 400, msg: '管理员已存在' }
        }

        return await register({
            username,
            passwordHash,
            isAdmin: true,
            inviteCode: '',
        })
    }

    /**
     * 修改密码 - 更新密码
     */
    const changePassword = async (
        userId: number,
        oldPasswordHash: string,
        newPasswordHash: string
    ): Promise<AppResponse> => {
        const userStorage = await db.user().select().where('id', userId).first()
        if (!userStorage) {
            return { code: 400, msg: '用户不存在' }
        }

        const { passwordHash, passwordSalt } = userStorage
        if (sha(passwordSalt + oldPasswordHash) !== passwordHash) {
            return { code: 400, msg: '旧密码错误' }
        }

        const newPasswordSalt = nanoid()
        const newStorage: Partial<UserStorage> = {
            passwordHash: sha(newPasswordSalt + newPasswordHash),
            passwordSalt: newPasswordSalt
        }

        await db.user().update(newStorage).where('id', userId)
        return { code: 200 }
    }

    /**
     * 设置应用主题色
     */
    const setTheme = async (userId: number, theme: AppTheme) => {
        const userStorage = await db.user().select().where('id', userId).first()
        if (!userStorage) {
            return { code: 400, msg: '用户不存在' }
        }

        await db.user().update('theme', theme).where('id', userId)
        return { code: 200 }
    }

    /**
     * 文章统计
     */
    const getArticleCount = async (userId: number) => {
        const [countResult] = await db.article().count().where('createUserId', userId)
        const [lengthResult] = await db.article().sum(db.knex.raw('LENGTH(content)')).where('createUserId', userId) as any

        const data = {
            articleCount: countResult['count(*)'],
            articleLength: lengthResult['sum(LENGTH(content))'],
        }
        return { code: 200, data }
    }

    return { getUserInfo, login, register, createAdmin, changePassword, setTheme, getArticleCount }
}

export type UserService = ReturnType<typeof createUserService>