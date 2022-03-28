import dayjs from "dayjs"

export const getMonthExistDate = () => {
    const monthStart = dayjs().startOf('M').valueOf()
    const existDay = dayjs().date()

    const allDates = Array.from({ length: existDay }).map((_, index) => {
        return monthStart + index * 86400000
    })

    return allDates
}