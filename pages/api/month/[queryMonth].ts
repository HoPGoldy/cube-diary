import type { NextApiRequest, NextApiResponse } from 'next'
import { RespData } from 'types/global'
import { createHandler } from 'lib/utils/createHandler'
import keyBy from 'lodash/keyBy'
import { getMonthExistDate } from 'lib/utils/getMonthExistDate'
import dayjs from 'dayjs'
import { getDiaryCollection } from 'lib/loki'
import { Diary, UndoneDiary } from 'types/diary'

export interface DiaryMonthResData {
    entries: Array<Diary | UndoneDiary>
}

export default createHandler({
    /**
     * 获取日记列表
     */
    GET: async (req: NextApiRequest, res: NextApiResponse<RespData<DiaryMonthResData>>, auth) => {
        if (!req.query.queryMonth || typeof req.query.queryMonth === 'object') {
            res.status(200).json({ success: false, message: '未指定日记月份' })
            return
        }

        const diaryDate = dayjs(req.query.queryMonth, 'YYYYMM')
        const queryRange = [diaryDate.startOf('M').valueOf() - 1, diaryDate.endOf('M').valueOf()]
        const collection = await getDiaryCollection(auth.username)
        const originDiarys = collection.find({ date: { '$between': queryRange } })

        // 没找到就返回空
        if (!originDiarys) {
            res.status(200).json({
                success: true,
                data: { entries: [] }
            })
            return
        }

        const originDiaryEnums = keyBy(originDiarys, diary => diary.date)
        const existDateList = getMonthExistDate(req.query.queryMonth as string)

        const entries: Array<Diary | UndoneDiary> = existDateList.map(date => {
            if (date.toString() in originDiaryEnums) return originDiaryEnums[date]
            return { date, undone: true }
        })

        res.status(200).json({
            success: true,
            data: { entries }
        })
    }
})
