import dayjs from "dayjs"

/**
 * 生成日记编辑的跳转链接
 * @param datetime 要跳转到的日期 UNIX 时间戳
 */
export const getDiaryWriteUrl = (datetime?: number) => {
    const queryDate = typeof datetime === 'number' ? dayjs(datetime) : dayjs()
    return `/diary/write/${queryDate.format('YYYY-MM-DD')}`
}