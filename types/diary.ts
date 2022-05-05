import { AccessoryDetail } from "./accessory"

export interface DiaryStorage {
    /**
     * 日记的日期
     * 毫秒 UNIX 时间戳，须为每天的开始时间
     */
    date: number
    /**
     * 日记的内容
     */
    content: string
    /**
     * 附件对应的 loki id
     */
    accessoryIds?: number[]

}

/**
 * 日记对象
 * 在日记列表中获取的数据结构
 */
export interface Diary {
    /**
     * 日记的日期
     * 毫秒 UNIX 时间戳，须为每天的开始时间
     */
    date: number
    /**
     * 日记的内容
     */
    content: string
}

/**
 * 日记详情
 * 在日记编辑页获取的日记数据结构
 */
export type DiaryDetail = Diary & {
    /**
     * 该日记的附件
     */
    accessorys: AccessoryDetail[]
}

/**
 * 未完成的日记
 * 会显示成一个按钮让用户填写
 */
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