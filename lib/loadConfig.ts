import { readFile } from 'fs/promises'
import { DiaryConfig } from 'types/global'

let configCache: DiaryConfig

/**
 * 默认的用户配置
 */
const defaultConfig: DiaryConfig = {
    user: [],
    passwordLength: 6
}

/**
 * 载入最新的用户配置
 */
export const loadConfig = async function (): Promise<DiaryConfig | undefined> {
    try {
        const userConfig = await readFile('./.config.json')
        const totalConfig: DiaryConfig = {
            ...defaultConfig,
            ...JSON.parse(userConfig.toString()),
        }

        return totalConfig
    }
    catch (e) {
        console.error('e', e)
        return undefined
    }
}

/**
 * 获取用户配置
 */
export const getDiaryConfig = async function (): Promise<DiaryConfig | undefined> {
    if (configCache) return configCache
    const newConfig = await loadConfig()
    if (!newConfig) return undefined

    return configCache = newConfig
}