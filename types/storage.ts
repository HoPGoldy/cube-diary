/**
 * 用户配置项及个人信息
 */
export interface UserProfileStorage {
    /**
     * 用户名
     */
    username: string
    /**
     * 该用户已经写了多少字
     */
    totalCount: number
}

export type UserProfile = UserProfileStorage & {
    /**
     * 该用户已经写了多少日记
     */
    totalDiary?: number
}

/**
 * 每日登录记录
 */
export interface LoginLimit {
    /**
     * 对应的登录日期
     */
    date: number
    /**
     * 当日登录次数
     */
    count: number
}

/**
 * 备份信息详情
 */
export interface BackupDetail {
    /**
     * 备份名称
     */
    title: string
    /**
     * 备份日期 unix 毫秒时间戳
     */
    date: number
}