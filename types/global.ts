import { NextApiRequest } from "next"

/**
 * 接口返回 json 的标准格式
 */
export interface RespData<Data = Record<string, any>> {
    /**
     * 接口执行是否成功
     */
    success: boolean
    /**
     * 接口执行信息，当执行不成功时该值为报错信息
     */
    message?: string
    /**
     * 接口执行结果
     */
    data?: Data
}

/**
 * 日记全局配置
 * 适用于 .config.json
 */
export interface AppConfig {
    /**
     * 用户配置
     * 该数组中的用户才可以登陆
     */
    user: UserConfig[]
    /**
     * 密码长度
     * **注意！**该字段更改后需要同步修改所有的 user.passowrd 来确保密码长度一致
     */
    passwordLength: number
    /**
     * 应用中确认按钮的颜色
     * 将在数组中随机挑选
     */
    writeDiaryButtonColors: string[]
    /**
     * 登陆页面的应用标题
     */
    appTitle: string
    /**
     * 登陆页面的应用副标题
     */
    appSubtitle?: string
    /**
     * 每日最多登录次数
     * 防止爆破密码，默认为 30
     */
    loginPreDay?: number
    /**
     * 备份调度器
     * 默认为 0 0 4 * * *
     * 即每日凌晨四点整进行备份
     */
    backupScheduler: string
    /**
     * 最大备份个数
     * 默认为 10 个，备份数量超过该值后最旧的备份将被删除
     */
    maxBackup: number
}

/**
 * 前端可以获取的配置项
 */
export type FontendConfig = Omit<AppConfig, 'user' | 'writeDiaryButtonColors'> & {
    /**
     * 前端使用的按钮颜色
     */
    buttonColor: string
}

/**
 * 用户配置项
 */
export interface UserConfig {
    /**
     * 用户名，所有信息均和该字段绑定
     */
    username: string
    /**
     * 登陆该用户需要的密码
     */
    password: string
    /**
     * 不需要填写，用于校验是否登陆成功
     */
    passwordMd5?: string
}
