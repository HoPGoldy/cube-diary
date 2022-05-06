import type { NextApiRequest, NextApiResponse } from 'next'
import { RespData } from 'types/global'
import { createHandler } from 'lib/utils/createHandler'
import { UserProfile } from 'types/user'
import { getDiaryCollection, getUserProfile, saveLoki, updateUserProfile } from 'lib/loki'

export interface ProfileUpdateReqBody {
    darkTheme: boolean
}

export default createHandler({
    /**
     * 获取当前登陆用户配置项
     */
    GET: async (req, res: NextApiResponse<RespData<UserProfile>>, auth) => {
        const userProfile = await getUserProfile(auth.username)
        const userDiarys = await getDiaryCollection(auth.username)

        if (!userProfile) {
            return res.status(200).json({
                success: false,
                message: '无法获取用户配置信息'
            })
        }

        res.status(200).json({
            success: true,
            data: { ...userProfile, totalDiary: userDiarys.data.length }
        })
    },
    /**
     * 更新当前登陆用户配置项
     */
    POST: async (req: NextApiRequest, res: NextApiResponse<RespData>, auth) => {
        const reqBody = JSON.parse(req.body) as ProfileUpdateReqBody

        const userProfile = await getUserProfile(auth.username)
        userProfile.darkTheme = reqBody.darkTheme ? true : false
        await updateUserProfile(userProfile)

        res.status(200).json({ success: true })
        saveLoki(auth.username)
    },
})
