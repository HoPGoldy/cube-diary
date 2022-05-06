import { readFile } from 'fs/promises'
import md5 from 'crypto-js/md5'
import { DEFAULT_CONFIG } from './constants'
import { AppConfig } from 'types/appConfig'

let configCache: AppConfig

/**
 * 载入最新的应用配置
 */
export const loadConfig = async function (): Promise<AppConfig | undefined> {
    try {
        const userConfig = await readFile('./.config.json')
        const totalConfig: AppConfig = {
            ...DEFAULT_CONFIG,
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