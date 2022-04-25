// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiResponse } from 'next'
import { RespData } from 'types/global'
import { createHandler } from 'lib/utils/createHandler'
import { getDiaryCollection, getUserProfile, saveLoki, updateUserProfile } from 'lib/loki'
import dayjs from 'dayjs'
import { Diary } from '../month/[queryMonth]'
import { callBackupSchedule } from 'lib/backup'

export default createHandler({
    /**
     * 获取日记详情
     */
    GET: async (req, res: NextApiResponse<RespData<Diary>>, auth) => {
        if (!req.query.queryDay || typeof req.query.queryDay === 'object') {
            res.status(200).json({ success: false, message: '未指定日记日期' })
            return
        }

        const diaryDate = dayjs(req.query.queryDay, 'YYYY-MM-DD')
        const collection = await getDiaryCollection(auth.username)
        const diary = collection.findOne({ date: diaryDate.valueOf() })

        // 没找到就返回空
        if (!diary) {
            res.status(200).json({ success: true })
            return
        }

        res.status(200).json({ success: true, data: diary })
    },
    /**
     * 保存日记
     */
    POST: async (req, res: NextApiResponse<RespData>, auth) => {
        if (!req.query.queryDay || typeof req.query.queryDay === 'object') {
            res.status(200).json({ success: false, message: '未指定日记日期' })
            return
        }

        const reqBody = JSON.parse(req.body)
        if (!('content' in reqBody)) {
            res.status(200).json({ success: false, message: '请填写日记内容' })
            return
        }
        const diaryDate = dayjs(req.query.queryDay, 'YYYY-MM-DD')

        const collection = await getDiaryCollection(auth.username)
        const diary = collection.findOne({ date: diaryDate.valueOf() })
        // 更新的总字数
        let changeNumber = reqBody.content.length

        // 没找到就新增
        if (!diary) {
            collection.insert({ date: diaryDate.valueOf(), content: reqBody.content })
        }
        // 找到了就更新
        else {
            changeNumber = reqBody.content.length - diary.content.length
            diary.content = reqBody.content
            collection.update(diary)
        }

        saveLoki(auth.username)
        res.status(200).json({ success: true })

        // 更新总字数缓存
        const userProfile = await getUserProfile(auth.username)
        if (!userProfile) {
            console.error(`${auth.username} 用户配置项保存失败`)
            return
        }
        updateUserProfile({
            ...userProfile,
            totalCount: userProfile.totalCount + changeNumber
        })

        // 有内容保存后唤起备份进程
        callBackupSchedule()
    }
})
