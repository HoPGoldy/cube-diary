import { Context, Next, HttpError } from 'koa'
import jwt from 'jsonwebtoken'
import jwtKoa from 'koa-jwt'
import { nanoid } from 'nanoid'
import { response } from '../utils'
import { AppKoaContext, MyJwtPayload } from '@/types/global'
import { createAccessor } from './fileAccessor'

/**
 * 获取 jwt 密钥
 */
export const jwtSecretFile = createAccessor({ fileName: 'jwtSecret' })

/**
 * 鉴权失败时完善响应提示信息
 */
export const middlewareJwtCatcher = async (ctx: Context, next: Next) => {
    try {
        await next()
    } catch (err) {
        if (err instanceof HttpError && err.status === 401) {
            response(ctx, { code: 401, msg: '登录已失效，请重新登录' })
        } else {
            throw err
        }
    }
}

/**
 * 通过 ctx 获取用户登录的 jwt 载荷
 * 
 * @param ctx 要获取信息的上下文
 * @param block 获取不到时是否添加响应
 */
export const getJwtPayload = (ctx: AppKoaContext, block = true) => {
    const userPayload = ctx.state?.user
    if (!userPayload?.userId && block) {
        response(ctx, { code: 400, msg: '未知用户，请重新登录' })
        return
    }

    return userPayload as MyJwtPayload
}

export const verifyToken = async (token: string) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, async (_, callback) => {
            const secret = await jwtSecretFile.read()
            callback(null, secret)
        }, (err, decoded) => {
            if (err) return reject(err)
            resolve(decoded)
        })
    })
}

/**
 * JWT 鉴权中间件
 */
export const middlewareJwt = jwtKoa({
    secret: jwtSecretFile.read,
    getToken: ctx => {
        if (ctx.header.authorization) return ctx.header.authorization.replace('Bearer ', '')
        return ctx.cookies.get('cube-diary-token') || null
    },
})

/**
 * 生成新的 jwt token
 */
export const createToken = async (payload: Record<string, any> = {}) => {
    const secret = await jwtSecretFile.read()
    return jwt.sign(payload, secret, { expiresIn: '30d' })
}

/**
 * 一次性令牌管理器
 * @param timeout 令牌过期时间
 */
export const createOTP = (timeout: number = 1000 * 60) => {
    const challengeCodes: Record<string | number, string | undefined> = {}

    /**
     * 弹出暂存的挑战码
     * 弹出后需要调用 create 才能使用新的挑战码
     */
    const pop = (key: string | number = 'default') => {
        const code = challengeCodes[key]
        delete challengeCodes[key]
        return code
    }

    /**
     * 生成新的挑战码
     * 会在指定时间后清空
     */
    const create = (key: string | number = 'default', value?: string) => {
        const newCode = value || nanoid()
        challengeCodes[key] = newCode

        setTimeout(() => {
            delete challengeCodes[key]
        }, timeout)

        return newCode
    }

    return { pop, create }
}

export type CreateOtpFunc = typeof createOTP