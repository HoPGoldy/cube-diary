import dayjs from 'dayjs'
import { copy, ensureDir, pathExists } from 'fs-extra'
import { scheduleJob, Job } from 'node-schedule'
import path from 'path'
import { getAppConfig } from './appConfig'
import { STORAGE_PATH } from './constants'

let backupSchedule: Job

export const startBackupSchedule = () => {
    if (backupSchedule) return

    backupSchedule = scheduleJob('0 * * * * *', () => {
        runBackup()
    })
}

startBackupSchedule()

const runBackup = async function () {
    const config = await getAppConfig()
    if (!config) return

    config.user.map(async user => {
        const backupPath = path.resolve(STORAGE_PATH, `./backup/${user.username}/`)
        await ensureDir(backupPath)

        const dbPath = path.resolve(STORAGE_PATH, `${user.username}.json`)
        const dbExist = await pathExists(dbPath)
        if (!dbExist) return

        const distPath = path.resolve(backupPath, `${dayjs().format('YYYY-MM-DD')}.json`)
        await copy(dbPath, distPath)
    })
}

const clearOldBackup = async function () {

}