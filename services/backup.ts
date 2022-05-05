import { get, post, useFetch } from "lib/request"
import { useEffect, useState } from "react"
import { Notify } from "react-vant"
import { RespData } from "types/global"
import { useRef } from 'react'
import { BackupResData } from "@pages/api/backup"
import { Diary } from "types/diary"

/**
 * 查询现存备份
 */
export const useBackupList = function () {
    return useFetch<RespData<BackupResData>>(`/api/backup`)
}

/**
 * 回滚到指定备份
 * 回在回滚前以当前状态创建新的回滚备份
 */
export const rollbackTo = async function (rollbackDate: number) {
    return await post(`/api/backup`, { rollbackDate })
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