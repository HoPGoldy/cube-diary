import { DiaryMonthResData } from "@pages/api/month/[queryMonth]"
import { useFetch } from "lib/request"
import { RespData } from "types/global"

export const useDiaryList = function (month: string) {
    return useFetch<RespData<DiaryMonthResData>>(`/api/month/${month}`)
}