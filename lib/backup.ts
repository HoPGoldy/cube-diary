import dayjs from 'dayjs'
import { ensureDir, pathExists, readFile, remove, writeFile } from 'fs-extra'
import { scheduleJob, Job } from 'node-schedule'
import path from 'path'
import { getAppConfig } from './appConfig'
import { STORAGE_PATH } from './constants'
import { getBackupCollection, getLoki, saveLoki } from './loki'

let backupSchedule: Job

/**
 * 启动备份定时任务
 */
export const callBackupSchedule = async () => {
    if (backupSchedule) return
    const config = await getAppConfig()
    if (!config) return
    const { user, backupScheduler, maxBackup } = config

    // console.log('启动备份')
    backupSchedule = scheduleJob(backupScheduler, async () => {
        for (const { username } of user) {
            await createBackup(username, '定时备份')
            await clearOldBackup(username, maxBackup)
        }
        saveLoki('backup')
        // console.log('保存备份数据')
    })
}

const getBackupPath = function (username: string) {
    return path.resolve(STORAGE_PATH, `./backup/${username}`)
}

/**
 * 给指定用户创建备份
 */
export const createBackup = async function (username: string, backupTitle: string) {
    const backupPath = getBackupPath(username)
    await ensureDir(backupPath)

    const dbPath = path.resolve(STORAGE_PATH, `${username}.json`)
    const dbExist = await pathExists(dbPath)
    if (!dbExist) return

    // 执行备份
    const backupName = dayjs().valueOf()

    const backupFilePath = path.resolve(backupPath, backupName.toString())
    const userStorage = await getLoki(username)
    writeFile(backupFilePath, userStorage.serialize())

    // 添加数据库信息
    const backupCollection = await getBackupCollection(username)
    backupCollection.insert({
        title: backupTitle,
        date: backupName
    })
}

/**
 * 清除某个用户的陈旧备份
 */
const clearOldBackup = async function (username: string, maxBackup: number) {
    const backupCollection = await getBackupCollection(username)
    if (backupCollection.count() <= maxBackup) return

    const oldsetBackupDate = backupCollection.min('date')

    // 删除备份文件
    const removeBackupPath = path.resolve(getBackupPath(username), oldsetBackupDate.toString())
    await remove(removeBackupPath)
    // console.log('删除陈旧备份', removeBackupPath)

    // 删除数据库信息
    backupCollection.findAndRemove({ date: oldsetBackupDate })
}

/**
 * 获取指定用户的备份信息
 */
export const getBackupInfo = async function (username: string) {
    const backupCollection = await getBackupCollection(username)
    const backupItems = backupCollection.chain().simplesort('date', { desc: true }).data()
    return backupItems
}

/**
 * 检查用户是否存在指定备份
 */
export const hasBackupFile = async function (username: string, backupDate: string) {
    const backupPath = getBackupPath(username)
    const dbPath = path.resolve(backupPath, backupDate)
    return await pathExists(dbPath)
}

/**
 * 将用户数据回滚至指定备份
 */
export const rollback = async function (username: string, backupDate: string) {
    const backupPath = getBackupPath(username)
    const dbPath = path.resolve(backupPath, backupDate)
    const backupContent = await readFile(dbPath)
    if (!backupContent) return false

    // 恢复备份
    const userStorage = await getLoki(username)
    userStorage.loadJSON(backupContent.toString())
    saveLoki(username)

    // 把恢复时间更新到备份信息
    const backupCollection = await getBackupCollection(username)
    const backupItem = backupCollection.findOne({ date: Number(backupDate) })
    if (backupItem) {
        backupItem.rollbackDate = dayjs().valueOf()
        backupCollection.update(backupItem)
    }
    saveLoki('backup')

    return true
}