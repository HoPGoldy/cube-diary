export interface TagStorage {
    id: number
    title: string
    color: string
    groupId?: number
    createUserId: number
}

export interface TagListItem {
    id: number
    title: string
    color: string
    groupId?: number
}

export type TagUpdateReqData = Partial<TagListItem>

export interface TagGroupStorage {
    id: number
    createUserId: number
    title: string
}

export interface TagGroupListItem {
    id: number
    title: string
}

/** 批量设置标签颜色 */
export interface SetTagColorReqData {
    ids: number[]
    color: string
}

/** 批量设置标签分组 */
export interface SetTagGroupReqData {
    ids: number[]
    groupId: number
}

/** 批量删除标签 */
export interface DeleteTagReqData {
    ids: number[]
}

/** 请求 - 添加标签 */
export type AddTagReqData = Omit<TagStorage, 'createUserId' | 'id'>