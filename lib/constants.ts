import path from "path"
import { AppConfig } from "types/appConfig"

/**
 * 页面主按钮的默认配色
 */
export const DEFAULT_BUTTON_COLOR = [
    'linear-gradient(45deg, #0081ff, #1cbbb4)',
    'linear-gradient(45deg, #ec008c, #6739b6)',
    'linear-gradient(45deg, #9000ff, #5e00ff)',
    'linear-gradient(45deg, #39b54a, #8dc63f)',
    'linear-gradient(45deg, #ff9700, #ed1c24)',
    'linear-gradient(45deg, #f43f3b, #ec008c)'
]

/**
 * 默认的用户配置
 */
export const DEFAULT_CONFIG: AppConfig = {
    user: [],
    appTitle: '日记本',
    appSubtitle: '记录你的生活',
    mainButtonColors: DEFAULT_BUTTON_COLOR,
    passwordLength: 6,
    loginPreDay: 30,
    backupScheduler: '0 4 * * *',
    maxBackup: 10
}

/**
 * 星期数字到汉字的映射
 */
export const WEEK_TO_CHINESE: Record<number, string> = {
    0: '周日',
    1: '周一',
    2: '周二',
    3: '周三',
    4: '周四',
    5: '周五',
    6: '周六'
}

/**
 * 用户鉴权 token 在请求 header 里的字段名
 */
export const USER_TOKEN_KEY = 'user-token'

/**
 * 存储主目录
 */
export const STORAGE_PATH = './.storage'

/**
 * jwt 密钥存放目录
 */
export const JWT_SECRET_PATH = path.resolve(STORAGE_PATH, 'jwtSecret')