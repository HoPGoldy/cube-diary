export interface ArticleStorage {
    id: number
    title: string
    content: string
    createUserId: number
    createTime: number
    updateTime: number
    /**
     * 祖先文章路径，用于快速查询
     * 以#分隔，如：#1#2#3#
     */
    parentPath: string
    /**
     * 文章相关的标签 id
     * 以#分隔，如：#1#2#3#
     **/
    tagIds?: string
    /**
     * 是否在正文下面列出子笔记
     */
    listSubarticle?: boolean
    /**
     * 该笔记的颜色
     */
    color?: string
}

/**
 * 用户收藏文章关联表
 */
export interface ArticleFavoriteStorage {
    id: number
    articleId: number
    userId: number
}

/**
 * 文章之间的关联表
 */
export interface ArticleRelatedStorage {
    id: number
    fromArticleId: number
    toArticleId: number
    userId: number
}

export interface AddArticleReqData {
    title: string
    content: string
    parentId: number
}

export interface SearchArticleReqData {
    keyword?: string
    tagIds?: number[]
    page?: number
}

/** 文章查询详情 */
export interface SearchArticleDetail {
    id:  number
    title: string
    updateTime: number
    tagIds: number[]
    content: string
}

export interface SearchArticleResp {
    total: number
    rows: SearchArticleDetail[]
}

export type UpdateArticleReqData = Partial<ArticleContent> & {
    id: number
}

export interface DeleteArticleMutation {
    id: number
    force: boolean
}

export interface ArticleMenuItem {
    id: number
    title: string
    color?: string
}

export enum TabTypes {
    Sub = 'sub',
    Related = 'related',
    Favorite = 'favorite',
}

export interface ArticleContent {
    id: number
    favorite: boolean
    title: string
    content: string
    createTime: number
    updateTime: number
    parentArticleId?: number
    tagIds?: number[]
    listSubarticle?: boolean
    color?: string
}

/** 获取文章下属节点的接口响应数据 */
export interface ArticleLinkResp {
    /**
     * 父节点 id
     * 因为下属文章列表有个返回父级文章的按钮，所以需要返回父级文章 id
     */
    parentArticleIds?: number[]
    parentArticleTitle?: string
    /** 子文章列表 */
    childrenArticles: ArticleMenuItem[]
}

/** 详细的下属文章列表元素 */
export interface ArticleSubLinkDetail {
    content: string
    tagIds: number[]
    title: string
    id: number
    color?: string | undefined
}

export interface ArticleRelatedResp {
    relatedArticles: ArticleMenuItem[]
}

/** 文章树的节点 */
export interface ArticleTreeNode {
    /** 节点值（文章 id） */
    value: number
    /** 文章名称 */
    title: string
    /** 颜色 */
    color?: string
    /** 子节点列表 */
    children?: ArticleTreeNode[]
}

export interface ArticleDeleteResp {
    deletedArticleIds: number[]
    parentArticleId?: number
}

/** 设置文章关联接口数据 */
export interface SetArticleRelatedReqData {
    /** 解除关联还是建立关联 */
    link: boolean
    /** 发起关联的文章 id */
    fromArticleId: number
    /** 被关联的文章 id */
    toArticleId: number
}