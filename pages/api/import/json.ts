// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiResponse } from 'next'
import { RespData } from 'types/global'
import { createHandler } from 'lib/utils/createHandler'
import { getDiaryCollection, getUserProfile, saveLoki, updateUserProfile } from 'lib/loki'
import dayjs from 'dayjs'
import { parseBody } from 'lib/utils/parseBody'
import { readFile } from 'fs/promises'
import { createBackup } from 'lib/backup'
import { Diary } from 'types/diary'

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

/**
 * 按照提供的配置项将日记格式化成本应用需要的格式
 * 
 * @param fields 导入配置项
 * @param jsonContent 提供的 json 内容
 * @param res 响应实例
 */
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
     * 导入日记列表
     */
    POST: async (req, res: NextApiResponse<RespData<JsonImportResult>>, auth) => {
        try {
            const [fields, files] = await parseBody<JsonImportForm>(req)

            const jsonFile = await readFile(files.file?.path)
            const jsonContent = JSON.parse(jsonFile.toString())

            const standardDiarys = formatDiary(fields, jsonContent, res)
            if (!standardDiarys) return

            // 先备份一下
            await createBackup(auth.username, '导入备份')

            // 导入完了更新下总字数
            const importResult = await updateDiary(fields, standardDiarys, auth.username)
            res.status(200).json({ success: true, data: importResult })

            await updateDiaryNumber(auth.username, importResult)
            saveLoki(auth.username)
            saveLoki('backup')
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