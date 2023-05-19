import { queryClient, requestGet, requestPost } from './base'
import { useMutation, useQuery } from 'react-query'
import { Diary, DiaryExportReqData, DiaryQueryResp, DiaryUpdateReqData, JsonImportResult, SearchDiaryReqData, SearchDiaryResp } from '@/types/diary'
import { AppResponse } from '@/types/global'

const updateDiaryCache = (updateData: DiaryUpdateReqData) => {
    const oldData = queryClient.getQueryData<AppResponse<Diary>>(['diaryDetail', updateData.date])
    if (!oldData) return

    const newData = {
        ...oldData,
        data: { ...oldData.data, ...updateData }
    }
    queryClient.setQueryData(['diaryDetail', updateData.date], newData)
}

/** 查询日记列表 */
export const useQueryDiaryList = (month?: string) => {
    return useQuery(['month', month], async () => {
        return requestGet<DiaryQueryResp>(`diary/getMonthList/${month}`)
    }, {
        refetchOnWindowFocus: false,
        enabled: !!month
    })
}

/** 查询日记详情 */
export const useQueryDiaryDetail = (date: number) => {
    return useQuery(['diaryDetail', date], async () => {
        return requestGet<Diary>(`diary/getDetail/${date}`)
    }, {
        refetchOnWindowFocus: false
    })
}

/** 更新日记 */
export const useUpdateDiary = () => {
    return useMutation((data: DiaryUpdateReqData) => {
        return requestPost('diary/update', data)
    }, {
        onMutate: (data) => {
            queryClient.invalidateQueries('month')
            updateDiaryCache(data)
        }
    })
}

/** 自动保存接口 */
export const autoSaveContent = async (date: number, content: string) => {
    updateDiaryCache({ date, content })
    return requestPost('diary/update', { date, content })
}

/** 搜索日记列表 */
export const useSearchDiary= (data: SearchDiaryReqData) => {
    return useQuery(['searchDiary', data], async () => {
        return requestPost<SearchDiaryResp>('diary/search', data)
    }, {
        refetchOnWindowFocus: false,
        enabled: data.keyword !== '' || !!(data.colors && data.colors.length > 0)
    })
}

/** 导入日记 */
export const useImportDiary = () => {
    return useMutation((data: FormData) => {
        return requestPost<JsonImportResult>('diary/importDiary', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries('month')
            queryClient.invalidateQueries('userStatistic')
        }
    })
}

/** 导出日记 */
export const useExportDiary = () => {
    return useMutation((data: DiaryExportReqData) => {
        return requestPost<JsonImportResult>('diary/exportDiary', data)
    })
}