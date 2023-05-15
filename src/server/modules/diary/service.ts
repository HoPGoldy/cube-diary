import { DatabaseAccessor } from '@/server/lib/sqlite'
import dayjs from 'dayjs'
import { keyBy } from 'lodash'
import { Diary, DiaryQueryResp } from '@/types/diary'

interface Props {
    db: DatabaseAccessor
}

export const createDiaryService = (props: Props) => {
    const { db } = props

    /**
     * 获取指定月份已经过去了多少天
     * 
     * @param monthStr 要查询的月份，值应如 202203
     * @returns 一个数组，值为日期的毫秒时间戳
     */
    const getMonthExistDate = (monthStr: string) => {
        const monthStart = dayjs(monthStr, 'YYYYMM').startOf('M').valueOf()
        const monthEnd = dayjs(monthStr, 'YYYYMM').endOf('M')
        const now =  dayjs()

        const existDay = monthEnd.isBefore(now) ? monthEnd.date() : now.date()

        const allDates = Array.from({ length: existDay }).map((_, index) => {
            return monthStart + index * 86400000
        })

        return allDates
    }

    const getMonthList = async (month: string, userId: number) => {
        const diaryDate = dayjs(month, 'YYYYMM')
        const queryRange: [number, number] = [diaryDate.startOf('M').valueOf() - 1, diaryDate.endOf('M').valueOf()]

        const originDiarys = await db.diary()
            .select('date', 'content', 'color')
            .where('createUserId', userId)
            .andWhereBetween('date', queryRange)

        const originDiaryEnums = keyBy(originDiarys, diary => diary.date)
        const existDateList = getMonthExistDate(month)

        const data: DiaryQueryResp = existDateList.map(date => {
            if (date.toString() in originDiaryEnums) return originDiaryEnums[date]
            return { date, undone: true }
        })

        return { code: 200, data }
    }

    const getDetail = async (date: number, userId: number) => {
        const detail = await db.diary()
            .select('date', 'content', 'color')
            .where('createUserId', userId)
            .andWhere('date', date)
            .first()

        return { code: 200, data: detail }
    }

    const addDetail = async (detail: Diary, userId: number) => {
        await db.diary().insert({ ...detail, createUserId: userId })
        return { code: 200 }
    }

    const updateDetail = async (detail: Diary, userId: number) => {
        await db.diary().update(detail).where('date', detail.date).andWhere('createUserId', userId)
        return { code: 200 }
    }

    return {
        getMonthList, getDetail, addDetail, updateDetail
    }
}

export type TagService = ReturnType<typeof createDiaryService>