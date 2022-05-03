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
    /**
     * 是否启用黑夜模式
     */
    darkTheme: boolean
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
    /**
     * 该备份被执行恢复的时间
     * 为空代表没有恢复过
     */
    rollbackDate?: number
}

/**
 * 附件信息详情
 */
export interface AccessoryDetail {
    /**
     * 文件的 md5 校验码
     */
    md5: string
    /**
     * 文件名，用于查找到文件实际存放位置
     */
    name: string
    /**
     * 文件类型
     */
    type: string
}