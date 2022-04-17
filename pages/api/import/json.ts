// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiResponse } from 'next'
import { RespData } from 'types/global'
import { createHandler } from 'lib/utils/createHandler'
import { getDiaryCollection, getUserProfile, saveLoki, updateUserProfile } from 'lib/loki'
import dayjs from 'dayjs'
import { Diary } from '../month/[queryMonth]'
import { Form } from 'multiparty'
import { parseBody } from 'lib/utils/parseBody'

export default createHandler({
    /**
     * 保存日记
     */
    POST: async (req, res: NextApiResponse<RespData>, auth) => {
        try {
            const [fields, files] = await parseBody(req)
            res.status(200).json({ success: true })
        }
        catch (e) {
            console.error(e)
            res.status(200).json({ success: false, message: '啊偶，文件解析失败了' })
        }
    }
})

export const config = {
    api: {
        // 要关闭 next 自带的 body 解析，不然 multiparty 就会出问题
        bodyParser: false
    }
}