import React, { ComponentType, lazy, Suspense } from 'react'
import { createHashRouter, Outlet } from 'react-router-dom'
import Loading from './layouts/Loading'
import { LoginAuth } from './layouts/LoginAuth'
import { AppContainer } from './layouts/AppContainer'
import Search from './pages/search'
import Article from './pages/article/Article'
import Entry from './pages/JumpToDefaultDataEntry'
import { AppConfigProvider } from './layouts/AppConfigProvider'

const lazyLoad = (compLoader: () => Promise<{ default: ComponentType<any> }>) => {
    const Comp = lazy(compLoader)
    return (
        <Suspense fallback={<Loading />}>
            <Comp />
        </Suspense>
    )
}

export const routes = createHashRouter([
    {
        path: '/',
        children: [
            {
                path: '/',
                children: [
                    { index: true, element: <Entry /> },
                    // 日记列表
                    { path: '/month/:month', element: lazyLoad(() => import('./pages/monthList')) },
                    // 日记详情编辑
                    { path: '/diary/:date', element: lazyLoad(() => import('./pages/diaryEdit')) },
                    // 日记搜索
                    { path: '/search', element: <Search /> },
                    // 笔记详情
                    { path: '/article/:articleId', element: <Article /> },
                    // 笔记管理
                    { path: '/articleManage', element: lazyLoad(() => import('./pages/articleManager')) },
                    // 标签管理
                    { path: '/tags', element: lazyLoad(() => import('./pages/tagManager/TagManager')) },
                    // 修改密码
                    { path: '/changePassword', element: lazyLoad(() => import('./pages/changePassword/mobile')) },
                    // 邀请管理
                    { path: 'userInvite', element: lazyLoad(() => import('./pages/userInvite')) },
                    // 关于应用
                    { path: '/about', element: lazyLoad(() => import('./pages/About')) },
                ],
                element: (
                    <LoginAuth>
                        <AppContainer />
                    </LoginAuth>
                )
            },
            // 登录
            { path: '/login', element: lazyLoad(() => import('./pages/Login')) },
            // 注册
            { path: '/register/:inviteCode', element: lazyLoad(() => import('./pages/register')) },
            // 初始化管理员
            { path: '/init', element: lazyLoad(() => import('./pages/createAdmin')) },
        ],
        element: (
            <AppConfigProvider>
                <Outlet />
            </AppConfigProvider>
        )
    }
])
