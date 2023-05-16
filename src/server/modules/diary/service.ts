import { DatabaseAccessor } from '@/server/lib/sqlite'
import dayjs from 'dayjs'
import { keyBy } from 'lodash'
import { DiaryQueryResp, DiaryUpdateReqData, SearchDiaryReqData, SearchDiaryResp } from '@/types/diary'
import { PAGE_SIZE } from '@/config'

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

        return { code: 200, data: detail || { content: '', color: '' } }
    }

    const updateDetail = async (detail: DiaryUpdateReqData, userId: number) => {
        const oldArticle = await db.diary().select('content', 'color').where('date', detail.date).andWhere('createUserId', userId).first()
        if (!oldArticle) {
            await db.diary().insert({ ...detail, createUserId: userId })
            return { code: 200 }
        }

        await db.diary().update({ ...oldArticle, ...detail }).where('date', detail.date).andWhere('createUserId', userId)
        return { code: 200 }
    }

    const serachDiary = async (reqData: SearchDiaryReqData, userId: number) => {
        const { page = 1, colors = [], keyword, desc = true } = reqData
        const query = db.diary().select().where('createUserId', userId)

        if (colors.length > 0) {
            query.whereIn('color', colors)
        }

        if (keyword) {
            query.andWhereLike('content', `%${keyword}%`)
        }

        const { count: total } = await query.clone().count('id as count').first() as any

        const result = await query
            .orderBy('date', desc ? 'desc' : 'asc')
            .limit(PAGE_SIZE)
            .offset((page - 1) * PAGE_SIZE)

        const data: SearchDiaryResp = { total, rows: result }

        return { code: 200, data }
    }

    return {
        getMonthList, getDetail, updateDetail, serachDiary
    }
}

export type TagService = ReturnType<typeof createDiaryService>