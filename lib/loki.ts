import lokijs from 'lokijs'
import { ensureDir } from 'fs-extra'
import { ConfigCollection } from 'types/storage'
import { Diary } from '@pages/api/month/[queryMonth]'

let lokiInstance: lokijs

/**
 * 获取全局 loki 存储实例
 */
export const getLoki = async function (): Promise<lokijs> {
    if (lokiInstance) return lokiInstance

    await ensureDir('./.storage')

    return new Promise(resolve => {
        lokiInstance = new lokijs('./.storage/db.json', {
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
export const getUserCollection = async function (username: string) {
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
export const getConfigCollection = async function () {
    const loki = await getLoki()
    let collection = loki.getCollection<ConfigCollection>('config')
    if (collection) return collection

    collection = loki.addCollection<ConfigCollection>('config', { unique: ['username'] })
    return collection
}