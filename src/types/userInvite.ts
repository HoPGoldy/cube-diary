/** 用户邀请表存储 */
export interface UserInviteStorage {
    id: number
    /** 邀请码 */
    inviteCode: string
    /** 创建时间 */
    createTime: number
    /**
     * 被邀请人用户名
     * 为空表示还未被使用
     */
    username?: string
    /** 注册时间 */
    useTime?: number
}

/** 用户邀请前端详情 */
export interface UserInviteFrontendDetail extends UserInviteStorage {
    /** 用户是否被封禁 */
    isBanned?: boolean
    /** 用户 id */
    userId?: number
}


/** 删除邀请请求参数 */
export interface DeleteInviteReqData {
    /** 邀请码 id */
    id: number
}

/** 用户封禁请求参数 */
export interface BanUserReqData {
    /** 用户 id */
    userId: number
    /** 是否封禁 */
    isBanned: boolean
}