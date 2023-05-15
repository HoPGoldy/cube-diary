import { STATUS_CODE } from '@/config'
import { AppKoaContext } from '@/types/global'
import { getReplayAttackData, validateReplayAttackData } from '@/utils/crypto'
import { Next } from 'koa'
import { response } from '../utils'
import { createAccessor } from './fileAccessor'

/**
 * 获取防重放密钥
 */
export const secretFile = createAccessor({ fileName: 'replayAttackSecret' })

interface Props {
    excludePath: string[]
}

/**
 * 创建检查中间件 - 防重放攻击
 */
export const createCheckReplayAttack = (props: Props) => {
    const nonceCache = new Map<string, number>()

    const addNonceToCache = (nonce: string) => {
        nonceCache.set(nonce, Date.now())
    }

    const isNonceTimeout = (createTime: number, nowTime: number) => {
        return nowTime - createTime > 60 * 1000
    }

    // 每十分钟清理一次 nonce 缓存
    setInterval(() => {
        const now = Date.now()
        nonceCache.forEach((time, nonce) => {
            if (isNonceTimeout(time, now)) nonceCache.delete(nonce)
        })
    }, 10 * 60 * 1000)

    const checkReplayAttack = async (ctx: AppKoaContext, next: Next) => {
        const isAccessPath = !!props.excludePath.find(path => ctx.url.endsWith(path) || ctx.url.startsWith(path))
        // 允许 excludePath 接口正常访问
        if (isAccessPath) return await next()

        try {
            const replayAttackData = getReplayAttackData(ctx)
            if (!replayAttackData) {
                throw new Error(`伪造请求攻击，请求路径：${ctx.path}。已被拦截，原因为未提供防重放攻击 header。`)
            }

            const replayAttackSecret = await secretFile.read()
            const existNonceDate = nonceCache.get(replayAttackData.nonce)
            // 如果有重复的随机码
            if (existNonceDate && !isNonceTimeout(existNonceDate, Date.now())) {
                throw new Error(`伪造请求攻击，请求路径：${ctx.path}。已被拦截，原因为重复的 nonce。`)
            }

            const isValidate = validateReplayAttackData(replayAttackData, replayAttackSecret)
            if (!isValidate) {
                throw new Error(`伪造请求攻击，请求路径：${ctx.path}。已被拦截，原因为请求签名异常。`)
            }

            addNonceToCache(replayAttackData.nonce)
            await next()
        }
        catch (e) {
            console.error(e)
            response(ctx, { code: STATUS_CODE.REPLAY_ATTACK, msg: '请求异常，请稍后再试' })
        }
    }

    return checkReplayAttack
}
