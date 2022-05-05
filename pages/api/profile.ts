import type { NextApiRequest, NextApiResponse } from 'next'
import { RespData } from 'types/global'
import { createHandler } from 'lib/utils/createHandler'
import { BackupDetail, UserProfile } from 'types/storage'
import { getDiaryCollection, getUserProfile, saveLoki, updateUserProfile } from 'lib/loki'

/**
 * 备份返回结果
 */
export interface BackupResData {
    entries: Array<BackupDetail>
}

export interface ProfileUpdateReqBody {
    darkTheme: boolean
}

export default createHandler({
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
    POST: async (req: NextApiRequest, res: NextApiResponse<RespData>, auth) => {
        const reqBody = JSON.parse(req.body) as ProfileUpdateReqBody

        const userProfile = await getUserProfile(auth.username)
        userProfile.darkTheme = reqBody.darkTheme ? true : false
        await updateUserProfile(userProfile)

        res.status(200).json({ success: true })
        saveLoki(auth.username)
    },
})
