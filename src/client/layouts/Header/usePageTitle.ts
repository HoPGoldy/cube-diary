import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'

const pageTitle: Record<string, string> = {
    '/exportDiary': '导出笔记',
    '/importDiary': '导入笔记',
    '/search': '搜索笔记',
    '/userInvite': '用户管理',
    '/about': '关于'
}

export const usePageTitle = () => {
    const { pathname } = useLocation()
    const params = useParams()

    const title = useMemo(() => {
        if (pathname in pageTitle) return pageTitle[pathname]
        if (pathname.startsWith('/month')) {
            return dayjs(params.month).format('日记列表 - YYYY 年 MM 月')
        }
        if (pathname.startsWith('/diary')) {
            return dayjs(params.month).format('日记编辑')
        }

        return ''
    }, [pathname])

    return title
}