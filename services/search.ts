import { Diary } from "@pages/api/month/[queryMonth]"
import { get } from "lib/request"
import { useEffect, useState } from "react"
import { Notify } from "react-vant"
import { DiarySearchQuery, DiarySearchResData } from "@pages/api/search"

/**
 * 搜索日记
 */
export const useDiarySearch = function (keywords: string, desc: boolean) {
    // 日记列表
    const [diaryList, setDiaryList] = useState<Diary[]>([])
    // 日记列表加载状态
    const [diaryLoading, setDiaryLoading] = useState(false)
    // 是否加载结束
    const [diaryLoadFinish, setDiaryLoadFinish] = useState(false)
    // 查询条件
    const [searchQuery, setSearchQuery] = useState<DiarySearchQuery>(() => ({
        keywords,
        desc,
        pageIndex: 1,
        pageSize: 5
    }))

    useEffect(() => {
        setDiaryList([])
        setDiaryLoadFinish(false)
        setSearchQuery({ keywords, desc, pageIndex: 1, pageSize: 5 })
    }, [keywords, desc])

    const onLoadMore = async () => {
        setSearchQuery(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))
    }

    // 条件变更时重新搜素
    useEffect(() => {
        if (searchQuery.keywords === '' || diaryLoading) return;

        const searchDiary = async function () {
            setDiaryLoading(true)
            const resp = await get<DiarySearchResData>(`/api/search`, searchQuery)
            setDiaryLoading(false)

            if (!resp.success) {
                Notify.show({ type: 'danger', message: resp.message })
                return
            }

            // 没内容了，说明都加载完了
            if (resp.data?.entries && resp.data.entries.length <= 0) {
                setDiaryLoadFinish(true)
            }

            setDiaryList(prev => [...prev, ...resp.data?.entries || []])
        }

        searchDiary()
    }, [searchQuery])

    return { diaryList, diaryLoading, diaryLoadFinish, onLoadMore }
}
