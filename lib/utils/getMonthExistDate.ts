import dayjs from "dayjs"

/**
 * 获取指定月份已经过去了多少天
 * 
 * @param monthStr 要查询的月份，值应如 202203
 * @returns 一个数组，值为日期的毫秒时间戳
 */
export const getMonthExistDate = (monthStr: string) => {
    const monthStart = dayjs(monthStr, 'YYYYMM').startOf('M').valueOf()
    const monthEnd = dayjs(monthStr, 'YYYYMM').endOf('M')
    const now =  dayjs()

    const existDay = monthEnd.isBefore(now) ? monthEnd.date() : now.date()

    const allDates = Array.from({ length: existDay }).map((_, index) => {
        return monthStart + index * 86400000
    })

    return allDates
}