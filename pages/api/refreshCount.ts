import type { NextApiRequest, NextApiResponse } from 'next'
import { RespData } from 'types/global'
import { createHandler } from 'lib/utils/createHandler'
import { getDiaryCollection, getUserProfile, updateUserProfile } from 'lib/loki'

export default createHandler({
    POST: async (req: NextApiRequest, res: NextApiResponse<RespData<number>>, auth) => {
        const collection = await getDiaryCollection(auth.username)
        const totalCount = collection.data.reduce((pre, cur) => pre + cur.content.length, 0)

        const userProfile = await getUserProfile(auth.username);
        updateUserProfile({ ...userProfile, totalCount });

        res.status(200).json({
            success: true,
            data: totalCount
        })
    }
})
