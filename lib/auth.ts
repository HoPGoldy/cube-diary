// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { SignJWT, jwtVerify, JWTPayload } from 'jose'

export const jwtSecretKey = `123321`

export const USER_TOKEN_KEY = 'user-token'

export enum VerifyResult {
    Error = 1,
    NotLogin,
    Success
}

/**
 * Verifies the user's JWT token and returns the payload if
 * it's valid or a response if it's not.
 */
export const verifyAuth = async function (token: string | string[] | undefined | null): Promise<false | JWTPayload> {
    if (!token) {
        return false
    }

    const userToken = Array.isArray(token) ? token.join('') : token

    try {
        const key = new TextEncoder().encode(jwtSecretKey)
        const verified = await jwtVerify(userToken, key)
        return verified.payload
    } catch (err) {
        console.error(err)
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
        .setExpirationTime('2h')
        .sign(new TextEncoder().encode(jwtSecretKey))

    return token
}
