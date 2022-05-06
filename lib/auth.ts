import { nanoid } from 'nanoid'
import { SignJWT, jwtVerify, JWTPayload } from 'jose'
import { NextApiRequest, NextApiResponse } from 'next'
import { errors } from 'jose'
import { JWT_SECRET_PATH, USER_TOKEN_KEY } from './constants'
import { ensureFile } from 'fs-extra'
import { readFile, writeFile } from 'fs/promises'
import nookies from 'nookies'

let jwtSecretCache: string

/**
 * 获取 jwt 密钥
 * 会在 .storage 下创建密钥
 */
export const getJwtSecretKey = async function () {
    // 使用缓存
    if (jwtSecretCache) return jwtSecretCache

    // 读一下本地密钥
    await ensureFile(JWT_SECRET_PATH)
    const secret = await readFile(JWT_SECRET_PATH)
    if (secret.toString().length > 0) return jwtSecretCache = secret.toString()

    // 没有密钥，新建一个
    const newJwtSecret = nanoid()
    await writeFile(JWT_SECRET_PATH, newJwtSecret)
    return jwtSecretCache = newJwtSecret
}


export type MyJWTPayload = JWTPayload & {
    username: string
}

/**
 * 判断指定请求是否登陆过
 */
export const runAuth = async function (req: NextApiRequest, res: NextApiResponse): Promise<MyJWTPayload | false | {}> {
    if (req.url === '/api/login' && req.method === 'POST') return {}

    const token = nookies.get({ req })[USER_TOKEN_KEY]
    if (!token) {
        res.status(401).json({ success: false, message: '用户未登录' })
        return false
    }

    const authSuccess = await verifyAuth(token)
    if (!authSuccess) {
        res.status(401).json({ success: false, message: '登录超时' })
        return false
    }

    return authSuccess
}

/**
 * Verifies the user's JWT token and returns the payload if
 * it's valid or a response if it's not.
 */
export const verifyAuth = async function (token: string | string[] | undefined | null): Promise<false | MyJWTPayload> {
    if (!token) {
        return false
    }

    const userToken = Array.isArray(token) ? token.join('') : token

    try {
        const key = new TextEncoder().encode(await getJwtSecretKey())
        const verified = await jwtVerify(userToken, key)
        return verified.payload as MyJWTPayload
    } catch (err) {
        if (err instanceof errors.JWTExpired) console.log(`token 过期： ${token}`)
        else console.error(err)
        return false
    }
}

/**
 * Adds the user token cookie to a response.
 */
export const startSession = async function (username: string) {
    const token = await new SignJWT({ username })
        .setProtectedHeader({ alg: 'HS256' })
        .setJti(nanoid())
        .setIssuedAt()
        .setExpirationTime('1d')
        .sign(new TextEncoder().encode(await getJwtSecretKey()))

    return token
}
