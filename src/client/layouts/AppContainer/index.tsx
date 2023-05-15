import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../Sidebar'
import { useIsMobile } from '../Responsive'
import Header from '../Header'

const SIDE_WIDTH = '240px'

export const AppContainer: React.FC = () => {
    const isMobile = useIsMobile()
    /** 是否展开侧边栏 */
    const [collapsed, setCollapsed] = useState(false)

    if (isMobile) {
        return (
            <main className="h-full w-screen">
                <Outlet />
            </main>
        )
    }

    return (
        <div className="h-full flex">
            <aside
                className="overflow-hidden transition-w flex-shrink-0"
                style={{ width: collapsed ? 0 : SIDE_WIDTH }}
            >
                <Sidebar />
            </aside>
            <div
                className="flex-grow overflow-hidden transition-w"
                // 要给定确切的宽度，不然里边的面包屑没法正常进行宽度适应
                style={{ width: collapsed ? '100vw' : `calc(100vw - ${SIDE_WIDTH})` }}
            >
                <Header
                    onClickCollasedIcon={() => setCollapsed(!collapsed)}
                    collapsed={collapsed}
                />

                {/* 后面减去的 1px 是标题栏底部边框的高度 */}
                <main
                    className="flex-1 overflow-y-auto"
                    style={{ height: 'calc(100% - 3rem - 1px)' }}
                >
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
