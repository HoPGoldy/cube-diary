import type { NextApiRequest, NextApiResponse } from 'next'
import { RespData } from 'types/global'
import { createHandler } from 'lib/utils/createHandler'
import { keyBy } from 'lodash'
import { getMonthExistDate } from 'lib/utils/getMonthExistDate'
import dayjs from 'dayjs'
import { getUserCollection } from 'lib/loki'

export interface DiaryMonthQuery {
    queryMonth: string
}

export interface DiaryMonthResData {
    entries: Array<Diary | UndoneDiary>
}

/**
 * 日记对象
 */
export interface Diary {
    /**
     * 日记的日期
     * 毫秒 UNIX 时间戳，须为每天的开始时间
     */
    date: number
    /**
     * 日记的内容
     */
    content: string
}

/**
 * 未完成的日记
 * 会显示成一个按钮让用户填写
 */
 export interface UndoneDiary {
     /**
      * 未完成的日期毫秒时间戳
      */
    date: number
    /**
     * 未完成标识
     */
    undone: true
}

export default createHandler({
    GET: async (req: NextApiRequest, res: NextApiResponse<RespData<DiaryMonthResData>>, auth) => {
        if (!req.query.queryMonth || typeof req.query.queryMonth === 'object') {
            res.status(200).json({ success: false, message: '未指定日记月份' })
            return
        }

        const diaryDate = dayjs(req.query.queryMonth, 'YYYYMM')
        const queryRange = [diaryDate.startOf('M').valueOf() - 1, diaryDate.endOf('M').valueOf()]
        const collection = await getUserCollection(auth.username)
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

