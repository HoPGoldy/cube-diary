import dayjs from "dayjs"

export const getDiaryWriteUrl = (datetime?: number) => {
    const queryDate = typeof datetime === 'number' ? dayjs(datetime) : dayjs()
    return `/diary/write/${queryDate.format('YYYY-MM-DD')}`
}