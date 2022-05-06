// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiResponse } from 'next'
import { RespData } from 'types/global'
import { createHandler } from 'lib/utils/createHandler'
import { getAccessoryCollection } from 'lib/loki'
import { readFile } from 'fs/promises'
import { STORAGE_PATH } from 'lib/constants'
import path from 'path'

export default createHandler({
    /**
     * 通过附件 id 读取附件
     */
    GET: async (req, res: NextApiResponse<RespData>, auth) => {
        const accessoryCollection = await getAccessoryCollection(auth.username)
        const accessory = accessoryCollection.get(Number(req.query.accessoryId))

        if (!accessory) {
            res.status(404).json({ success: false, message: '附件不存在' })
            return
        }

        res.setHeader('Etag', accessory.md5).setHeader('Content-Type', accessory.type || 'image/jpg')
        // 有些原图可能会比较大，这里 md5 一致就继续使用缓存
        if(req.headers['if-none-match'] === accessory.md5){
            res.status(304).end()
            return 
        }

        const filePath = path.resolve(STORAGE_PATH, 'file', auth.username, `${accessory.md5}.${accessory.name}`)
        const file = await readFile(filePath)
        res.status(200).end(file)
    }
})
