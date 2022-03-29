// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { startSession, USER_TOKEN_KEY, verifyAuth } from 'lib/auth'
import { getDiaryConfig } from 'lib/loadConfig'
import type { NextApiRequest, NextApiResponse } from 'next'
import { RespData } from 'types/global'
import { createHandler } from 'lib/utils/createHandler'
import { keyBy } from 'lodash'
import { getMonthExistDate } from 'lib/utils/getMonthExistDate'

export interface DiaryDetailQuery {
    date: string
}

export interface DiaryDetailResData {
    content: string
}

export default createHandler({
    POST: async (req, res: NextApiResponse<RespData>) => {
        res.status(200).json({ success: true })
    }
})
