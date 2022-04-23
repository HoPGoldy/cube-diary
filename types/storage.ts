/**
 * 用户配置项及个人信息
 */
export interface UserProfile {
    /**
     * 用户名
     */
    username: string
    /**
     * 该用户已经写了多少字
     */
    totalCount: number
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