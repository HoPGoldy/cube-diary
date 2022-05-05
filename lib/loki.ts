import lokijs from 'lokijs'
import { ensureDir } from 'fs-extra'
import { BackupDetail, UserProfileStorage } from 'types/storage'
import { STORAGE_PATH } from './constants'
import { AccessoryStorage } from 'types/accessory'
import { DiaryStorage } from 'types/diary'

/**
 * loki 实例缓存
 * 每个用户都会有一个实例
 * 备份数据管理单独一个实例
 */
const lokiInstances: Record<string, lokijs> = {}

/**
 * 获取全局 loki 存储实例
 */
export const getLoki = async function (dbName: string): Promise<lokijs> {
    if (lokiInstances[dbName]) return lokiInstances[dbName]

    await ensureDir(STORAGE_PATH)

    return new Promise(resolve => {
        const newLoki = new lokijs(STORAGE_PATH + `/${dbName}.json`, {
            autoload: true,
            autoloadCallback: () => {
                lokiInstances[dbName] = newLoki
                resolve(newLoki)
            }
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
    let collection = loki.getCollection<DiaryStorage>(collectionName)
    if (collection) return collection

    collection = loki.addCollection<DiaryStorage>(collectionName, { unique: ['date'] })
    return collection
}

/**
 * 获取指定用户的附件集合
 *
 * @param username 要获取附件的用户名
 */
export const getAccessoryCollection = async function (username: string) {
    const loki = await getLoki(username)
    const collectionName = 'accessory'
    let collection = loki.getCollection<AccessoryStorage>(collectionName)
    if (collection) return collection

    collection = loki.addCollection<AccessoryStorage>(collectionName, { unique: ['md5'] })
    return collection
}

/**
 * 获取默认配置项
 */
const getDefaultProfile = function (username: string): UserProfileStorage {
    return { username, totalCount: 0, darkTheme: false }
}

/**
 * 获取指定用户的配置项
 */
export const getUserProfile = async function (username: string): Promise<UserProfileStorage> {
    const loki = await getLoki(username)
    const collectionName = 'profile'
    let collection = loki.getCollection<UserProfileStorage>(collectionName)
    if (!collection) collection = loki.addCollection<UserProfileStorage>(collectionName, { unique: ['username'] })

    const config = collection.findOne({ username })
    if (config) return config

    const newConfig = getDefaultProfile(username)
    collection.insert(newConfig)
    return newConfig
}

/**
 * 更新指定用户的配置项
 * 要更新的用户名包含在配置项里
 */
export const updateUserProfile = async function (newConfig: UserProfileStorage) {
    const loki = await getLoki(newConfig.username)
    const collectionName = 'profile'
    let collection = loki.getCollection<UserProfileStorage>(collectionName)
    if (!collection) collection = loki.addCollection<UserProfileStorage>(collectionName, { unique: ['username'] })

    const userConfig = collection.findOne({ username: newConfig.username })

    if (!userConfig) collection.insert(newConfig)
    else collection.update({ ...userConfig, ...newConfig })

    saveLoki(newConfig.username)
}

/**
 * 获取指定用户的备份数据集合
 */
export const getBackupCollection = async function (username: string) {
    const loki = await getLoki('backup')
    let collection = loki.getCollection<BackupDetail>(username)
    if (collection) return collection

    return loki.addCollection<BackupDetail>(username, { unique: ['date'] })
}