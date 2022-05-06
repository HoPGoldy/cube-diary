import type { NextApiRequest, NextApiResponse } from 'next'
import { RespData } from 'types/global'
import { createHandler } from 'lib/utils/createHandler'
import { getDiaryCollection } from 'lib/loki'
import { Diary } from 'types/diary'

/**
 * 日记搜索筛选项
 */
export interface DiarySearchQuery {
    keywords: string
    pageIndex: number
    pageSize: number
    /**
     * 是否日期降序排序
     */
    desc?: boolean | 'true' | 'false'
}

/**
 * 日记搜索返回结果
 */
export interface DiarySearchResData {
    entries: Array<Diary>
}

export default createHandler({
    /**
     * 搜索日记
     */
    GET: async (req: NextApiRequest, res: NextApiResponse<RespData<DiarySearchResData>>, auth) => {
        const { keywords, pageIndex = 1, pageSize = 10, desc } = req.query as unknown as DiarySearchQuery
        if (!req.query.keywords) {
            res.status(200).json({ success: false, message: '未指定关键字' })
            return
        }

        const collection = await getDiaryCollection(auth.username)
        const targetDiarys = collection
            .chain()
            .find({ content: { '$contains': keywords } })
            .simplesort('date', { desc: desc === 'true' })
            .offset((pageIndex - 1) * pageSize)
            .limit(pageSize)
            .data({ removeMeta: true })

        res.status(200).json({
            success: true,
            data: { entries: targetDiarys || [] }
        })
    }
})
