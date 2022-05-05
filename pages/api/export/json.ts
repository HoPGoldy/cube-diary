// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiResponse } from 'next'
import { RespData } from 'types/global'
import { createHandler } from 'lib/utils/createHandler'
import { getDiaryCollection } from 'lib/loki'
import dayjs from 'dayjs'
import { Diary } from 'types/diary'

/**
 * json 导出配置项
 */
export interface JsonExportForm {
    /**
     * 开始时间 YYYY-MM-DD
     */
    beginDate?: string
    /**
     * 结束时间 YYYY-MM-DD
     */
    endDate?: string
    /**
     * 日期字段名
     */
    dateKey: string
    /**
     * 日记内容名
     */
    contentKey: string
    /**
     * 日期字段解析
     */
    dateFormatter: string
}

export default createHandler({
    /**
     * 保存日记
     */
    POST: async (req, res: NextApiResponse<RespData<Record<string, string | number>[]>>, auth) => {
        const body = JSON.parse(req.body) as JsonExportForm
        const diaryCollection = await getDiaryCollection(auth.username)

        let exportDiarys: Diary[] = []
        // 如果指定了时间范围
        if (body.beginDate && body.endDate) {
            exportDiarys = diaryCollection.find({
                date: {
                    '$between': [
                        dayjs(body.beginDate).valueOf(),
                        dayjs(body.endDate).valueOf(),
                    ]
                }
            })
        }
        // 否则导出全部的日记
        else {
            exportDiarys = diaryCollection.data
        }

        const data = exportDiarys.map(diary => ({
            [body.dateKey]: body.dateFormatter ? dayjs(diary.date).format(body.dateFormatter) : diary.date,
            [body.contentKey]: diary.content
        }))

        res.status(200).json({ success: true, data })
    }
})
