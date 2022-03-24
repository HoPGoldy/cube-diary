// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import type { NextApiRequest, NextApiResponse } from 'next'
import { RespData } from 'types/global'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<RespData>
) {
    if (req.method === 'POST') {
        await login()
    }
    else {
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}

const login = async function () {

}