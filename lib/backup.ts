import dayjs from 'dayjs'
import { copy, ensureDir, pathExists, remove } from 'fs-extra'
import { readdir } from 'fs/promises'
import { scheduleJob, Job } from 'node-schedule'
import path from 'path'
import { getAppConfig } from './appConfig'
import { STORAGE_PATH } from './constants'
import { getBackupCollection, saveLoki } from './loki'

let backupSchedule: Job

/**
 * 启动备份定时任务
 */
export const callBackupSchedule = async () => {
    if (backupSchedule) return
    const config = await getAppConfig()

    console.log('启动备份')
    backupSchedule = scheduleJob('10 * * * * *', () => {
        if (!config) return

        config.user.map(async user => {
            const backupPath = path.resolve(STORAGE_PATH, `./backup/${user.username}`)
            await ensureDir(backupPath)

            await runBackup(user.username, backupPath, '定时备份')
            await clearOldBackup(user.username, backupPath)
            saveLoki('backup')
        })
    })
}

/**
 * 执行具体用户的备份工作
 */
export const runBackup = async function (username: string, backupPath: string, backupTitle: string) {
    const dbPath = path.resolve(STORAGE_PATH, `${username}.json`)
    const dbExist = await pathExists(dbPath)
    if (!dbExist) return

    // 执行备份
    const backupName = dayjs().valueOf()
    const distPath = path.resolve(backupPath, `${backupName}.json`)
    await copy(dbPath, distPath)

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
const clearOldBackup = async function (username: string, backupPath: string) {
    const backupItems = await readdir(backupPath)
    if (backupItems.length <= 10) return

    // 获取最旧的备份日期
    const unixDates = backupItems.map(item => Number(path.parse(item).name))
    const minDate = Math.min(...unixDates)

    // 删除日期最早的备份
    const removeBackupPath = path.resolve(backupPath, `${minDate}.json`)
    await remove(removeBackupPath)
    console.log('删除陈旧备份', removeBackupPath)

    // 删除数据库信息
    const backupCollection = await getBackupCollection(username)
    backupCollection.findAndRemove({ date: minDate })
}