import lokijs from 'lokijs'
import { ensureDir } from 'fs-extra'
import { UserProfile } from 'types/storage'
import { Diary } from '@pages/api/month/[queryMonth]'
import { STORAGE_PATH } from './constants'

let lokiInstance: lokijs

/**
 * 获取全局 loki 存储实例
 */
export const getLoki = async function (): Promise<lokijs> {
    if (lokiInstance) return lokiInstance

    await ensureDir(STORAGE_PATH)

    return new Promise(resolve => {
        lokiInstance = new lokijs(STORAGE_PATH + '/db.json', {
            autoload: true,
            autoloadCallback: () => resolve(lokiInstance)
        })
    })
}

/**
 * 保存数据到本地
 */
export const saveLoki = async function (): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!lokiInstance) return resolve()

        lokiInstance.saveDatabase(err => {
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
    const loki = await getLoki()
    const collectionName = 'diary-' + username
    let collection = loki.getCollection<Diary>(collectionName)
    if (collection) return collection

    collection = loki.addCollection<Diary>(collectionName, { unique: ['date'] })
    return collection
}

/**
 * 获取所有用户的配置集合
 */
export const getProfileCollection = async function () {
    const loki = await getLoki()
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
    saveLoki()
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

    saveLoki()
}