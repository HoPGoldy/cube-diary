// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiResponse } from 'next'
import { RespData } from 'types/global'
import { createHandler } from 'lib/utils/createHandler'
import { getAccessoryCollection, getDiaryCollection, getUserProfile, saveLoki, updateUserProfile } from 'lib/loki'
import dayjs from 'dayjs'
import { callBackupSchedule } from 'lib/backup'
import { DiaryDetail, DiaryStorage } from 'types/diary'
import { AccessoryDetail } from 'types/accessory'
import { getAccessoryUrl } from '../file/upload'

export default createHandler({
    /**
     * 获取日记详情
     */
    GET: async (req, res: NextApiResponse<RespData<DiaryDetail>>, auth) => {
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

        // 把附件信息插入进来
        const accessorys: AccessoryDetail[] = []
        if (diary.accessoryIds) {
            const accessoryCollection = await getAccessoryCollection(auth.username)
            diary.accessoryIds.forEach(id => {
                const accessory = accessoryCollection.get(Number(id))
                if (accessory) accessorys.push({
                    name: accessory.name,
                    url: getAccessoryUrl(accessory.$loki),
                    id: accessory.$loki,
                })
            })
        }

        const data: DiaryDetail = {
            date: diary.date,
            content: diary.content,
            accessorys
        }

        res.status(200).json({ success: true, data })
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
            const newDiaryItem: DiaryStorage = { date: diaryDate.valueOf(), content: reqBody.content }

            // 有附件的话就一块存起来
            if ('accessoryIds' in reqBody) {
                newDiaryItem.accessoryIds = reqBody.accessoryIds
            }

            collection.insert(newDiaryItem)
        }
        // 找到了就更新
        else {
            changeNumber = reqBody.content.length - diary.content.length
            diary.content = reqBody.content

            // 有附件的话就一块存起来
            if ('accessoryIds' in reqBody) {
                diary.accessoryIds = reqBody.accessoryIds
            }
            // 没有就删掉
            else delete diary.accessoryIds

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
