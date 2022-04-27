import { readFile } from 'fs/promises'
import { AppConfig } from 'types/global'
import md5 from 'crypto-js/md5'
import { DEFAULT_BUTTON_COLOR } from './constants'

let configCache: AppConfig

/**
 * 默认的用户配置
 */
const defaultConfig: AppConfig = {
    user: [],
    appTitle: '日记本',
    appSubtitle: '记录你的生活',
    writeDiaryButtonColors: DEFAULT_BUTTON_COLOR,
    passwordLength: 6,
    loginPreDay: 30,
    backupScheduler: '0 4 * * *',
    maxBackup: 10
}

/**
 * 载入最新的应用配置
 */
export const loadConfig = async function (): Promise<AppConfig | undefined> {
    try {
        const userConfig = await readFile('./.config.json')
        const totalConfig: AppConfig = {
            ...defaultConfig,
            ...JSON.parse(userConfig.toString()),
        }

        if (totalConfig.user.length <= 0) throw new Error('请指定至少一个用户')

        // 把密码 md5 缓存起来供后期校验使用
        totalConfig.user = totalConfig.user.map(user => ({
            ...user,
            passwordMd5: md5(user.password).toString().toUpperCase()
        }))

        return totalConfig
    }
    catch (e) {
        console.error('e', e)
        return undefined
    }
}

/**
 * 获取应用配置
 */
export const getAppConfig = async function (): Promise<AppConfig | undefined> {
    if (configCache) return configCache
    const newConfig = await loadConfig()
    if (!newConfig) return undefined

    return configCache = newConfig
}