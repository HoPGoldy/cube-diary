import { readFile } from 'fs/promises'
import { DiaryConfig } from 'types/global'
import md5 from 'crypto-js/md5'
import { DEFAULT_BUTTON_COLOR } from './constants'

let configCache: DiaryConfig

/**
 * 默认的用户配置
 */
const defaultConfig: DiaryConfig = {
    user: [],
    appTitle: '日记本',
    appSubtitle: '记录你的生活',
    writeDiaryButtonColors: DEFAULT_BUTTON_COLOR,
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
 * 获取用户配置
 */
export const getDiaryConfig = async function (): Promise<DiaryConfig | undefined> {
    if (configCache) return configCache
    const newConfig = await loadConfig()
    if (!newConfig) return undefined

    return configCache = newConfig
}