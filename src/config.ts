/**
 * 接口返回的状态码
 */
export const STATUS_CODE = {
    SUCCESS: 200,
    NOT_REGISTER: 40101,
    ALREADY_REGISTER: 40102,
    /**
     * 用户被封禁
     */
    BAN: 40103,
    /**
     * 因为关联了其他资源所以无法删除
     */
    CANT_DELETE: 40601,
    /**
     * 未提供防重放攻击 header
     */
    REPLAY_ATTACK: 40602,
}

/**
 * 统一的日期格式化
 */
export const DATE_FORMATTER = 'YYYY-MM-DD HH:mm:ss'

/**
 * 无需登录即可访问的接口
 */
export const AUTH_EXCLUDE = [
    '/api/global', '/api/user/login', '/api/user/register', '/api/user/createAdmin'
]

/**
 * 不进行防重放攻击检查的接口
 */
export const REPLAY_ATTACK_EXCLUDE = [
    '/api/user/getInfo', '/api/file/get', ...AUTH_EXCLUDE
]

/**
 * 默认（默认分组）的标签分组 ID
 */
export const DEFAULT_TAG_GROUP = -1

/**
 * 固定分页条数
 */
export const PAGE_SIZE = 15

/**
 * 数据库表名
 */
export const TABLE_NAME = {
    /** 用户表 */
    USER: 'users',
    /** 日记表 */
    DIARY: 'diaries',
    /** 附件表 */
    FILE: 'files',
    /** 用户邀请表 */
    USER_INVITE: 'userInvites'
} as const