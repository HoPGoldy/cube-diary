/**
 * 附件信息
 * 数据库中的存储结构
 */
export interface AccessoryStorage {
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
    type?: string
}

/**
 * 附件信息
 * 后端返回给前端的数据结构
 */
export interface AccessoryDetail {
    /**
     * 附件名
     */
    name: string
    /**
     * 访问到该附件的网络 url
     */
    url?: string
    /**
     * 该附件在数据库中的存储 id
     */
    id?: number
}

/**
 * 附件导入响应
 */
export type AccessoryUploadResult = AccessoryDetail & {
    /**
     * 是否导入成功
     */
    success?: boolean
}