import { AppKoaContext } from '@/types/global'
import dayjs from 'dayjs'
import { Next } from 'koa'
import { getIp, response } from '../utils'

export interface LoginRecordDetail {
    /**
     * 要显示的错误登录信息
     * 不一定是所有的，一般都是今天的错误信息
     */
    records: string[]
    /**
     * 是否被锁定
     */
    disable: boolean
    /**
     * 是否无限期锁定
     */
    dead: boolean
}

interface LoginLockOptions {
    excludePath?: string[]
}

/**
 * 创建登录重试管理器
 * 每个 ip 同一天内最多失败三次
 */
export const createLoginLock = (props: LoginLockOptions) => {
    /**
     * 指定 ip 的失败登录日期记录
     */
    const loginFailRecords: Map<string, number[]> = new Map()

    /**
     * 增加登录失败记录
     */
    const recordLoginFail = (ip: string) => {
        if (!loginFailRecords.has(ip)) {
            loginFailRecords.set(ip, [])
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const records = loginFailRecords.get(ip)!
        records.push(new Date().valueOf())

        // 把一天前的记录清除掉
        const todayFail = records.filter(date => {
            return dayjs(date).isSame(dayjs(), 'day')
        })
        loginFailRecords.set(ip, todayFail)

        return getLockDetail(ip)
    }

    /**
     * 请求登录失败记录
     */
    const clearRecord = (ip: string) => {
        loginFailRecords.delete(ip)
    }

    /**
     * 获取指定 ip 登录失败情况
     */
    const getLockDetail = (ip: string): number[] => {
        return loginFailRecords.get(ip) || []
    }

    /**
     * 登录锁定中间件
     * 用于在锁定时拦截所有中间件
     */
    const checkLoginDisable = async (ctx: AppKoaContext, next: Next) => {
        const isAccessPath = !!props.excludePath?.find(path => ctx.url.endsWith(path))
        // 允许 excludePath 接口正常访问
        if (isAccessPath) return await next()

        const ip = getIp(ctx) || 'anonymous'
        try {
            if (getLockDetail(ip).length >= 3) throw new Error('登录失败次数过多')
            await next()
        }
        catch (e)  {
            console.error(e)
            response(ctx, { code: 403, msg: '登录失败次数过多，请一天后再试' })
        }
    }

    return { recordLoginFail, checkLoginDisable, getLockDetail, clearRecord }
}

export type LoginLocker = ReturnType<typeof createLoginLock>
