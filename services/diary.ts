import { Diary, DiaryMonthResData } from "@pages/api/month/[queryMonth]"
import { get, post, useFetch } from "lib/request"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Notify } from "react-vant"
import { RespData } from "types/global"
import { useRef } from 'react'

/**
 * 查询日记列表
 *
 * @param month 要查询的月份字符串，例如 202203
 */
export const useDiaryList = function (month: string | string[] | undefined) {
    return useFetch<RespData<DiaryMonthResData>>(`/api/month/${month}`)
}

/**
 * 更新日记
 *
 * @param date 要更新的日期，例如 2022-03-14
 * @param content 要更新的日记数据
 */
export const updateDiary = async function (date: string, content: string) {
    return await post(`/api/day/${date}`, { content })
}

/**
 * 查询日记详情
 *
 * @param queryDate 要查询的日记日期，例如 2022-03-14
 */
export const useDiaryDetail = function (queryDate: string | string[] | undefined) {
    const [content, setContent] = useState<string>('')
    const [contentLoading, setContentLoading] = useState(true)
    const contentRef = useRef(content)

    useEffect(() => {
        contentRef.current = content
    }, [content])

    useEffect(() => {
        const fetchUserInfo = async function () {
            setContentLoading(true)
            const resp = await get<Diary>(`/api/day/${queryDate}`)
            if (!resp.success) {
                Notify.show({ type: 'danger', message: resp.message })
                return
            }

            setContent(resp.data?.content || '')
            setContentLoading(false)
        }

        fetchUserInfo()
    }, [queryDate])

    return { content, contentLoading, contentRef, setContent }
}