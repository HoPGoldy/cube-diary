// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiResponse } from 'next'
import { RespData } from 'types/global'
import { createHandler } from 'lib/utils/createHandler'
import { getDiaryCollection, getUserProfile, saveLoki, updateUserProfile } from 'lib/loki'
import dayjs from 'dayjs'
import { Diary } from '../month/[queryMonth]'
import { Form } from 'multiparty'
import { parseBody, pickFields } from 'lib/utils/parseBody'
import { readFile } from 'fs/promises'
import { createReadStream, ensureDir } from 'fs-extra'
import { STORAGE_PATH } from 'lib/constants'

/**
 * json 导入配置项
 */
export interface JsonExportForm {
    /**
     * 开始时间 YYYY-MM-DD
     */
    beginDate: string
    /**
     * 结束时间 YYYY-MM-DD
     */
    endDate: string
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

/**
 * 导入结果
 */
export interface JsonExportResult {
    /**
     * 新增了多少条日记
     */
    insertCount: number
    /**
     * 新增了多少字
     */
    insertNumber: number
    /**
     * 更新了多少条日记
     */
    existCount: number
}

export default createHandler({
    /**
     * 保存日记
     */
    POST: async (req, res: NextApiResponse<RespData>, auth) => {
        const body = JSON.parse(req.body)
        res.status(200).json({ success: true })
    }
})
