import React, { FC, useState } from 'react'
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SearchOutlined,
    UserOutlined
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { Button, Popover } from 'antd'
import s from './styles.module.css'
import { DesktopSetting } from '@/client/pages/setting'
import { useAppSelector } from '@/client/store'
import { usePageTitle } from './usePageTitle'

interface Props {
    onClickCollasedIcon: () => void
    collapsed: boolean
}

const Header: FC<Props> = (props) => {
    const { onClickCollasedIcon, collapsed } = props
    /** 是否打开用户管理菜单 */
    const [userMenuVisible, setUserMenuVisible] = useState(false)
    /** 用户名 */
    const username = useAppSelector(s => s.user.userInfo?.username)
    const title = usePageTitle()
    /** 侧边栏展开按钮 */
    const CollasedIcon = collapsed ? MenuUnfoldOutlined : MenuFoldOutlined

    return (
        <header className={s.headerBox}>
            <div className='flex flex-nowrap flex-grow overflow-hidden'>
                <CollasedIcon onClick={onClickCollasedIcon} className="text-xl mr-4" />
                <div className="text-lg cursor-default">{title}</div>
            </div>
            <div className='flex flex-nowrap flex-shrink-0 ml-2'>
                <Link to="/search">
                    <Button icon={<SearchOutlined />} className="w-60">
                        搜索
                    </Button>
                </Link>
                <Popover
                    placement="bottomRight"
                    // trigger="click"
                    content={<DesktopSetting onClick={() => setUserMenuVisible(false)} />}
                    open={userMenuVisible}
                    onOpenChange={setUserMenuVisible}
                    arrow
                >
                    <div className="flex flex-nowrap justify-center items-center ml-2 flex-shrink-0">
                        <UserOutlined className="cursor-pointer text-xl mr-2" />
                        <span className="cursor-pointer flex-shrink-0 max-w-[300px] truncate">{username}</span>
                    </div>
                </Popover>
            </div>
        </header>
    )
}

export default Header