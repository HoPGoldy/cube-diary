import { queryClient, requestGet, requestPost } from './base'
import { useMutation, useQuery } from 'react-query'
import { Diary, DiaryQueryResp } from '@/types/diary'

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

/** 新增日记 */
export const useAddDiary = () => {
    return useMutation((data: Diary) => {
        return requestPost('diary/add', data)
    }, {
        onMutate: (data) => {
            queryClient.invalidateQueries('month')
            queryClient.invalidateQueries(['diaryDetail', data.date])
        }
    })
}

/** 更新日记 */
export const useUpdateDiary = () => {
    return useMutation((data: Diary) => {
        return requestPost('diary/update', data)
    }, {
        onMutate: (data) => {
            queryClient.invalidateQueries('month')
            queryClient.invalidateQueries(['diaryDetail', data.date])
        }
    })
}