export interface DiaryStorage {
    /**
     * 日记的日期
     * 毫秒 UNIX 时间戳，值为每天的开始时间
     */
    date: number
    /**
     * 日记的内容
     */
    content: string
    /**
     * 创建人 id
     */
    createUserId: number
    /**
     * 更新时间
     */
    color?: string
}

export interface Diary {
    date: number
    content: string
    color?: string
}

export interface UndoneDiary {
    /**
     * 未完成的日期毫秒时间戳
     */
   date: number
   /**
    * 未完成标识
    */
   undone: true
}

export type DiaryQueryResp = Array<Diary | UndoneDiary>

export type DiaryUpdateReqData = Partial<Diary> & {
    date: number
}

/** 日记搜索接口请求参数 */
export interface SearchDiaryReqData {
    keyword?: string
    colors?: string[]
    desc?: boolean
    page?: number
}

/** 日记搜索结果 */
export interface SearchDiaryResp {
    total: number
    rows: Diary[]
}