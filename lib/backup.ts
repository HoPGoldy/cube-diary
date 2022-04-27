import dayjs from 'dayjs'
import { copy, ensureDir, pathExists, readFile, remove, writeFile } from 'fs-extra'
import { readdir } from 'fs/promises'
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

    console.log('启动备份')
    backupSchedule = scheduleJob(backupScheduler, () => {
        user.map(async user => {
            await createBackup(user.username, '定时备份')
            await clearOldBackup(user.username, maxBackup)
            saveLoki('backup')
        })
    })
}

const getBackupPath = function (username: string) {
    return path.resolve(STORAGE_PATH, `./backup/${username}`)
}

/**
 * 执行具体用户的备份工作
 */
export const createBackup = async function (username: string, backupTitle: string) {
    const backupPath = getBackupPath(username)
    await ensureDir(backupPath)

    const dbPath = path.resolve(STORAGE_PATH, `${username}.json`)
    const dbExist = await pathExists(dbPath)
    if (!dbExist) return

    // 执行备份
    const backupName = dayjs().valueOf()

    const testDistPath = path.resolve(backupPath, backupName.toString())
    const userStorage = await getLoki(username)
    writeFile(testDistPath, userStorage.serializeDestructured())

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
    const backupPath = getBackupPath(username)
    await ensureDir(backupPath)

    const backupItems = await readdir(backupPath)
    if (backupItems.length <= maxBackup) return

    // 获取最旧的备份日期
    const unixDates = backupItems.map(item => Number(path.parse(item).name))
    const minDate = Math.min(...unixDates)

    // 删除日期最早的备份
    const removeBackupPath = path.resolve(backupPath, minDate.toString())
    await remove(removeBackupPath)
    console.log('删除陈旧备份', removeBackupPath)

    // 删除数据库信息
    const backupCollection = await getBackupCollection(username)
    backupCollection.findAndRemove({ date: minDate })
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

    const userStorage = await getLoki(username)
    userStorage.deserializeDestructured(backupContent.toString())
    saveLoki(username)

    const backupCollection = await getBackupCollection(username)
    backupCollection.findAndRemove({ date: +backupDate })
    saveLoki('backup')

    return true
}