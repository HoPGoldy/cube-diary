import lokijs from 'lokijs'
import { ensureDir } from 'fs-extra'
import { UserProfile } from 'types/storage'
import { Diary } from '@pages/api/month/[queryMonth]'
import { STORAGE_PATH } from './constants'

/**
 * loki 实例缓存
 * 每个用户都会有一个实例
 * 系统设置单独一个实例
 */
const lokiInstances: Record<string, lokijs> = {}

/**
 * 获取全局 loki 存储实例
 */
export const getLoki = async function (dbName: string): Promise<lokijs> {
    if (lokiInstances[dbName]) return lokiInstances[dbName]

    await ensureDir(STORAGE_PATH)

    return new Promise(resolve => {
        lokiInstances[dbName] = new lokijs(STORAGE_PATH + `/${dbName}.json`, {
            autoload: true,
            autoloadCallback: () => resolve(lokiInstances[dbName])
        })
    })
}

/**
 * 保存数据到本地
 */
export const saveLoki = async function (dbName: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!lokiInstances[dbName]) return resolve()

        lokiInstances[dbName].saveDatabase(err => {
            if (err) reject(err)
            resolve()
        })
    })
}

/**
 * 获取指定用户的日记集合
 *
 * @param username 要获取日记的用户名
 */
export const getDiaryCollection = async function (username: string) {
    const loki = await getLoki(username)
    const collectionName = 'diary'
    let collection = loki.getCollection<Diary>(collectionName)
    if (collection) return collection

    collection = loki.addCollection<Diary>(collectionName, { unique: ['date'] })
    return collection
}

/**
 * 获取所有用户的配置集合
 */
export const getProfileCollection = async function () {
    const loki = await getLoki('system')
    let collection = loki.getCollection<UserProfile>('config')
    if (collection) return collection

    collection = loki.addCollection<UserProfile>('config', { unique: ['username'] })
    return collection
}

export const getDefaultProfile = async function (username: string): Promise<UserProfile> {
    const userExistDiarys = await getDiaryCollection(username)

    return {
        username,
        totalCount: userExistDiarys.data.reduce((pre, cur) => pre + cur.content.length, 0)
    }
}

/**
 * 获取指定用户的配置项
 */
export const getUserProfile = async function (username: string): Promise<UserProfile | undefined> {
    const collection = await getProfileCollection()
    const config = collection.findOne({ username })
    if (config) return config

    const newConfig = collection.insert(await getDefaultProfile(username))
    saveLoki(username)
    return newConfig
}

/**
 * 更新指定用户的配置项
 * 要更新的用户名包含在配置项里
 */
export const updateUserProfile = async function (newConfig: UserProfile) {
    const collection = await getProfileCollection()
    const userConfig = collection.findOne({ username: newConfig.username })

    if (!userConfig) collection.insert(newConfig)
    else collection.update({ ...userConfig, ...newConfig })

    saveLoki('system')
}