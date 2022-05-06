// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiResponse } from 'next'
import { RespData } from 'types/global'
import { createHandler } from 'lib/utils/createHandler'
import { getAccessoryCollection, saveLoki } from 'lib/loki'
import { parseBody, File } from 'lib/utils/parseBody'
import { readFile } from 'fs/promises'
import { ensureDir, move, pathExists } from 'fs-extra'
import { STORAGE_PATH } from 'lib/constants'
import path from 'path'
import { AccessoryStorage, AccessoryUploadResult } from 'types/accessory'
import md5 from 'crypto-js/md5'

export const getAccessoryUrl = (accessoryId: string | number) => {
    return `/api/file/${accessoryId}`
}

/**
 * 将文件保存到本地并注册到 loki
 * 
 * @param file 文件对象
 * @param storagePath 保存路径
 * @param collection 附件数据集
 */
const saveAccessory = async (file: File, storagePath: string, collection: Collection<AccessoryStorage>): Promise<AccessoryUploadResult> => {
    const fileName = file.originalFilename
    const fileMd5 = md5(fileName + (await readFile(file.path)).toString()).toString()
    const fileDetail = collection.findOne({ md5: fileMd5 })

    // 已经有相同文件了，直接使用原始内容
    if (fileDetail) {
        return {
            name: fileDetail.name,
            id: fileDetail.$loki,
            url: getAccessoryUrl(fileDetail.$loki),
            success: true
        }
    }

    const filePath = path.resolve(storagePath, `${fileMd5}.${fileName}`)
    const hasFile = await pathExists(filePath)
    if (!hasFile) {
        move(file.path, filePath)
    }

    const newAccessory = collection.insertOne({
        md5: fileMd5,
        name: fileName,
        type: file.headers['content-type']
    })
    if (!newAccessory) {
        return { name: fileName, success: false }
    }
    return {
        name: fileName,
        id: newAccessory.$loki,
        url: getAccessoryUrl(newAccessory.$loki),
        success: true
    }
}

export default createHandler({
    /**
     * 保存图片
     */
    POST: async (req, res: NextApiResponse<RespData<AccessoryUploadResult[]>>, auth) => {
        try {
            const [fields, files] = await parseBody(req)

            const storagePath = path.resolve(STORAGE_PATH, 'file', auth.username)
            await ensureDir(storagePath)

            const saveResult: AccessoryUploadResult[] = []
            const accessoryCollection = await getAccessoryCollection(auth.username)

            for (const fileName in files) {
                const file = files[fileName]
                saveResult.push(await saveAccessory(file, storagePath, accessoryCollection))
            }

            res.status(200).json({ success: true, data: saveResult })
            saveLoki(auth.username)
        }
        catch (e) {
            console.error(e)
            res.status(200).json({ success: false, message: '啊偶，文件上传失败了' })
        }
    }
})

export const config = {
    api: {
        // 要关闭 next 自带的 body 解析，不然 multiparty 就会出问题
        bodyParser: false
    }
}