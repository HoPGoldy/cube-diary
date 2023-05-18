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

/** json 导入配置项 */
export interface JsonImportForm {
    /**
     * 导入配置项，覆盖还是合并
     * 合并的意思就是同一天新的日记追加到旧日记下面
     */
    existOperation: 'cover' | 'merge' | 'skip'
    /** 日期字段名 */
    dateKey: string
    /** 日期字段解析 */
    dateFormatter: string
    /** 日记内容名 */
    contentKey: string
    /** 颜色字段名 */
    colorKey: string
}

/** 导入结果 */
export interface JsonImportResult {
    /** 新增了多少条日记 */
    insertCount: number
    /** 新增了多少字 */
    insertNumber: number
    /** 更新了多少条日记 */
    updateCount: number
}

/** 日记导出配置项 */
export interface DiaryExportReqData {
    /** 导出范围 */
    range: 'all' | 'part'
    /** 开始时间 */
    startDate?: number
    /** 结束时间 */
    endDate?: number
    /** 日期字段名 */
    dateKey: string
    /** 日期字段格式化 */
    dateFormatter: string
    /** 内容字段名 */
    contentKey: string
    /** 颜色字段名 */
    colorKey: string
}