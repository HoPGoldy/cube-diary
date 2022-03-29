import { DiaryMonthResData } from "@pages/api/month/[queryMonth]"
import { post, useFetch } from "lib/request"
import { RespData } from "types/global"

export const useDiaryList = function (month: string | string[] | undefined) {
    return useFetch<RespData<DiaryMonthResData>>(`/api/month/${month}`)
}

export const updateDiary = async function (date: string, content: string) {
    return await post(`/api/day/${date}`, { content })
}
