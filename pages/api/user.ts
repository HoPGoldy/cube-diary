// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { startSession, USER_TOKEN_KEY, verifyAuth } from 'lib/auth'
import { getDiaryConfig } from 'lib/loadConfig'
import type { NextApiRequest, NextApiResponse } from 'next'
import { RespData } from 'types/global'
import { createHandler } from 'lib/utils/createHandler'

export interface LoginReqBody {
    code: string
}

export interface LoginResData {
    token: string
    username: string
}

export default createHandler({
    POST: async (req, res: NextApiResponse<RespData<LoginResData>>) => {
        const { code } = JSON.parse(req.body) as LoginReqBody
        // 检查是否和现有密码匹配
        const config = await getDiaryConfig()
        const matchedUser = config?.user.find(user => user.passwordMd5 === code)

        if (!matchedUser) {
            res.status(200).json({ success: false, message: '密码错误' })
            return
        }

        // 启动 session
        const token = await startSession(matchedUser.username)
        res.status(200).json({
            success: true,
            data: {
                token,
                username: matchedUser.username
            }
        })
    },
    GET: async (req, res) => {
        const resp = await verifyAuth(req.headers[USER_TOKEN_KEY])
        console.log('resp', resp)
        res.status(200).json({
            success: true,
            data: {}
        })
    }
})
