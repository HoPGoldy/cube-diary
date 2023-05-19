import { DatabaseAccessor } from '@/server/lib/sqlite'
import dayjs from 'dayjs'
import { keyBy } from 'lodash'
import { DiaryExportReqData, DiaryQueryResp, DiaryUpdateReqData, JsonImportForm, JsonImportResult, SearchDiaryReqData, SearchDiaryResp } from '@/types/diary'
import { PAGE_SIZE } from '@/config'
import { readFile } from 'fs/promises'

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
        const oldDiary = await db.diary().select('content', 'color').where('date', detail.date).andWhere('createUserId', userId).first()
        if (!oldDiary) {
            await db.diary().insert({ ...detail, createUserId: userId })
            return { code: 200 }
        }

        await db.diary().update({ ...oldDiary, ...detail }).where('date', detail.date).andWhere('createUserId', userId)
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

    const importDiary = async (filePath: string, config: JsonImportForm, userId: number) => {
        const jsonFile = await readFile(filePath)
        const jsonContent = JSON.parse(jsonFile.toString())

        // 检查是否有重复的日记
        const needImportDiarys: number[] = []
        for (const diary of jsonContent) {
            const date = diary[config.dateKey]
            if (!date) {
                return { code: 400, msg: '导入的日记中没有日期字段' }
            }

            needImportDiarys.push(dayjs(date, config.dateFormatter).valueOf())
        }

        const existDiarys = await db.diary()
            .select('date', 'content')
            .whereIn('date', needImportDiarys)
            .andWhere('createUserId', userId)
        const existDiaryMap = new Map(existDiarys.map(d => [d.date, d]))

        const insertDiarys = []
        const updateDiarys = []

        for (const diary of jsonContent) {
            const date = dayjs(diary[config.dateKey]).valueOf()
            const content = diary[config.contentKey]
            const color = diary[config.colorKey]

            // 新增
            const existDiary = existDiaryMap.get(date)
            if (!existDiary) {
                insertDiarys.push({ date, content, color, createUserId: userId })
                continue
            }

            // 编辑
            const newData = { ...existDiary, content, color }
            if (config.existOperation === 'cover') newData.content = content
            else if (config.existOperation === 'merge') newData.content = `${existDiary.content}\n${content}`
            else if (config.existOperation === 'skip') continue
            updateDiarys.push(newData)
        }

        // 批量插入
        for (const diary of insertDiarys) {
            await db.diary().insert(diary)
        }

        // 批量更新
        for (const diary of updateDiarys) {
            await db.diary().where('date', diary.date).andWhere('createUserId', userId).update(diary)
        }

        const result: JsonImportResult = {
            insertCount: insertDiarys.length,
            updateCount: updateDiarys.length,
            insertNumber: insertDiarys.map(d => d.content.length).reduce((a, b) => a + b, 0),
        }

        return { code: 200, data: result }
    }

    const exportDiary = async (config: DiaryExportReqData, userId: number) => {
        const sqlOpt = db.diary().select('date', 'content', 'color').where('createUserId', userId)

        if (config.range === 'part') {
            const dateRange: [number, number] = [dayjs(config.startDate).valueOf(), dayjs(config.endDate).valueOf()]
            sqlOpt.andWhereBetween('date', dateRange)
        }

        const diarys = await sqlOpt

        const data = diarys.map(diary => ({
            [config.dateKey]: config.dateFormatter ? dayjs(diary.date).format(config.dateFormatter) : diary.date,
            [config.contentKey]: diary.content,
            [config.colorKey]: diary.color,
        }))

        return JSON.stringify(data)
    }

    return {
        getMonthList, getDetail, updateDetail, serachDiary, importDiary, exportDiary
    }
}

export type TagService = ReturnType<typeof createDiaryService>