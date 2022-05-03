// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiResponse } from 'next'
import { RespData } from 'types/global'
import { createHandler } from 'lib/utils/createHandler'
import { getAccessoryCollection, getDiaryCollection, getUserProfile, saveLoki, updateUserProfile } from 'lib/loki'
import dayjs from 'dayjs'
import { Diary } from '../month/[queryMonth]'
import { parseBody } from 'lib/utils/parseBody'
import { readFile } from 'fs/promises'
import { createBackup } from 'lib/backup'
import { ensureDir, move } from 'fs-extra'
import { STORAGE_PATH } from 'lib/constants'
import path from 'path'
import { AccessoryDetail } from 'types/storage'
import md5 from 'crypto-js/md5'

/**
 * json 导入配置项
 */
export interface JsonImportForm {
    /**
     * 导入配置项，覆盖还是合并
     * 合并的意思就是同一天新的日记追加到旧日记下面
     */
    existOperation: 'cover' | 'merge'
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
export interface JsonImportResult {
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

const formatDiary = (fields: JsonImportForm, jsonContent: any, res: NextApiResponse<RespData<JsonImportResult>>) => {
    const standardDiarys: Diary[] = []

    for (const index in jsonContent) {
        const diary = jsonContent[index]

        if (!(fields.dateKey in diary)) {
            res.status(200).json({ success: false, message: `第 ${index} 条日记找不到名字为 ${fields.dateKey} 的键值对` })
            return
        }

        if (!(fields.contentKey in diary)) {
            res.status(200).json({ success: false, message: `第 ${index} 条日记找不到名字为 ${fields.contentKey} 的键值对` })
            return
        }

        standardDiarys.push({
            date: dayjs(diary[fields.dateKey], fields.dateFormatter).valueOf(),
            content: diary[fields.contentKey]
        })
    }

    return standardDiarys
}

/**
 * 将日记插入数据库
 */
const updateDiary = async (
    fields: JsonImportForm,
    standardDiarys: Diary[],
    username: string
): Promise<JsonImportResult> => {
    const userCollection = await getDiaryCollection(username)

    const result: JsonImportResult = {
        insertCount: 0,
        existCount: 0,
        insertNumber: 0
    }

    // 遍历所有格式化好的日记，开始执行插入数据库
    for (const newDiary of standardDiarys) {
        const existDiary = userCollection.findOne({ date: newDiary.date })

        // 如果有的话就根据用户指定的规则写入内容
        if (existDiary) {
            // 覆盖
            if (fields.existOperation === 'cover') {
                result.insertNumber += (newDiary.content.length - existDiary.content.length)
                existDiary.content = newDiary.content
            }
            // 合并
            else {
                result.insertNumber += newDiary.content.length
                existDiary.content += newDiary.content
            }
            userCollection.update(existDiary)
            result.existCount += 1
            continue
        }

        userCollection.insert(newDiary)
        result.insertNumber += newDiary.content.length
        result.insertCount += 1
    }

    return result
}

/**
 * 把导入的内容字数统计一下保存起来
 */
const updateDiaryNumber = async (username: string, importResult: JsonImportResult) => {
    const userProfile = await getUserProfile(username)
    if (!userProfile) {
        console.error(`${username} 用户配置项保存失败`)
        return
    }

    updateUserProfile({
        ...userProfile,
        totalCount: userProfile.totalCount + importResult.insertNumber
    })
}

export default createHandler({
    /**
     * 保存图片
     */
    POST: async (req, res: NextApiResponse<RespData>, auth) => {
        try {
            const [fields, files] = await parseBody<JsonImportForm>(req)
            // console.log('fields, files', fields, files)

            const storagePapth = path.resolve(STORAGE_PATH, 'file', auth.username)
            await ensureDir(storagePapth)

            const saveResult: AccessoryDetail[] = []
            const accessoryCollection = await getAccessoryCollection(auth.username)

            for (const fileName in files) {
                const file = files[fileName]
                const fileMd5 = md5((await readFile(file.path)).toString()).toString()
                console.log('fileMd5', fileMd5)
                const fileDetail = accessoryCollection.findOne({ md5: fileMd5 })
                // 已经有相同文件了，直接使用原始内容
                if (fileDetail) {
                    saveResult.push(fileDetail)
                    continue
                }
                console.log('fileDetail', fileDetail)
                await move(file.path, path.resolve(storagePapth, fileName))
            }

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