import { USER_TOKEN_KEY, verifyAuth, VerifyResult } from 'lib/auth'
import { NextResponse, NextMiddleware } from 'next/server'

export const middleware: NextMiddleware = async function (req, event) {
    if (req.page.name === '/api/user' && req.method === 'POST') return NextResponse.next()

    const authSuccess = await verifyAuth(req.headers.get(USER_TOKEN_KEY));
    if (!authSuccess) {
        return NextResponse.next()
    }

    return NextResponse.next()
}
