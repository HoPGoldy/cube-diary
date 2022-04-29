// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { startSession } from 'lib/auth'
import { getAppConfig } from 'lib/appConfig'
import type { NextApiResponse } from 'next'
import { RespData } from 'types/global'
import { createHandler } from 'lib/utils/createHandler'
import { UserProfile } from 'types/storage'
import { getDiaryCollection, getUserProfile } from 'lib/loki'
import { requireLogin } from 'lib/loginLimit'

export interface LoginReqBody {
    code: string
}

export interface LoginResData {
    token: string
}

export default createHandler({
    POST: async (req, res: NextApiResponse<RespData<LoginResData & UserProfile>>) => {
        // 请求本次是否允许登录
        const canLogin = await requireLogin()
        if (!canLogin) {
            res.status(200).json({ success: false, message: '已达到每日最大登录次数，请明日再试' })
            return
        }

        const { code } = JSON.parse(req.body) as LoginReqBody
        // 检查是否和现有密码匹配
        const config = await getAppConfig()
        const matchedUser = config?.user.find(user => user.passwordMd5 === code)

        if (!matchedUser) {
            res.status(200).json({ success: false, message: '密码错误' })
            return
        }

        // 启动 session
        const token = await startSession(matchedUser.username)
        const userProfile = await getUserProfile(matchedUser.username)
        const userDiarys = await getDiaryCollection(matchedUser.username)

        if (!userProfile) {
            return res.status(200).json({
                success: false,
                message: '无法获取用户配置信息'
            })
        }

        res.status(200).json({
            success: true,
            data: {
                token,
                ...userProfile,
                totalDiary: userDiarys.data.length
            }
        })
    }
})
