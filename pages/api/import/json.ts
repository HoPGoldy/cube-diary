// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiResponse } from 'next'
import { RespData } from 'types/global'
import { createHandler } from 'lib/utils/createHandler'
import { getDiaryCollection, getUserProfile, saveLoki, updateUserProfile } from 'lib/loki'
import dayjs from 'dayjs'
import { Diary } from '../month/[queryMonth]'
import { Form } from 'multiparty'

export default createHandler({
    /**
     * 保存日记
     */
    POST: async (req, res: NextApiResponse<RespData>, auth) => {
        console.log('res', req.body)
        const form = new Form()

        form.parse(req, (err, fields, files) => {
            console.log('fields, files', err, fields, files)
            res.status(200).json({ success: true })
        })
        
        
    }
})

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4mb'
        }
    }
}