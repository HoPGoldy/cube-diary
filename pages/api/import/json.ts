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
    username: string,
    res: NextApiResponse<RespData<JsonImportResult>>
) => {
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
            if (fields.existOperation === 'cover') {
                result.insertNumber += (newDiary.content.length - existDiary.content.length)
                existDiary.content = newDiary.content
            }
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

    res.status(200).json({ success: true, data: result })

    saveLoki(username)

    const userProfile = await getUserProfile(username)
    if (!userProfile) {
        console.error(`${username} 用户配置项保存失败`)
        return
    }
    updateUserProfile({ ...userProfile, totalCount: userProfile.totalCount + result.insertNumber })

}

export default createHandler({
    /**
     * 保存日记
     */
    POST: async (req, res: NextApiResponse<RespData<JsonImportResult>>, auth) => {
        try {
            const [fields, files] = await parseBody<JsonImportForm>(req)

            const jsonFile = await readFile(files[0]?.path)
            const jsonContent = JSON.parse(jsonFile.toString())

            const standardDiarys = formatDiary(fields, jsonContent, res)
            if (!standardDiarys) return

            await updateDiary(fields, standardDiarys, auth.username, res)
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