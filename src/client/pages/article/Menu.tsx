import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store'
import { Breadcrumb, Button, Col, Row } from 'antd'
import { HomeOutlined, LinkOutlined } from '@ant-design/icons'
import { MobileDrawer } from '@/client/components/MobileDrawer'
import { TreeMenu } from '@/client/components/TreeMenu/mobile'
import { EMPTY_CLASSNAME, tabOptions, useMenu } from '@/client/layouts/Sidebar/useMenu'
import { ArticleMenuItem, ArticleTreeNode, TabTypes } from '@/types/article'
import { setCurrentMenu } from '@/client/store/menu'
import { SplitLine } from '@/client/components/Cell'
import { useQueryArticleTree } from '@/client/services/article'
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb'

interface Props {
    currentArticleId: number
}

/**
 * 面包屑导航
 */
export const useBreadcrumb = () => {
    /** 根节点 id */
    const rootArticleId = useAppSelector(s => s.user.userInfo?.rootArticleId)
    /** 当前查看的文章祖先节点 */
    const parentArticleIds = useAppSelector(s => s.menu.parentArticleIds)
    /** 当前文章 id */
    const currentArticleId = useAppSelector(s => s.menu.currentArticleId)
    // 获取左下角菜单树
    const { data: articleTree } = useQueryArticleTree(rootArticleId)

    /** 当前面包屑配置项 */
    const breadcrumbConfig = useMemo(() => {
        if (!articleTree  || !currentArticleId) return []

        const pathNodes: ArticleTreeNode[] = []
        const idPath = [...(parentArticleIds || []), currentArticleId]

        idPath.reduce((prev, cur) => {
            const item = prev.find(i => i.value === cur)
            if (!item) return []
            pathNodes.push(item)
            return item.children || []
        }, articleTree?.data ? [articleTree.data] : [])

        const config: BreadcrumbItemType[] = pathNodes.map(i => ({
            title: (
                <Link to={`/article/${i.value}`}>
                    <div className="truncate w-fit max-w-[8rem]" title={i.title}>
                        {i.title}
                    </div>
                </Link>
            ),
        }))

        return config
    }, [parentArticleIds, articleTree, currentArticleId])

    /** 渲染桌面端面包屑 */
    const renderBreadcrumb = () => {
        return (
            <Breadcrumb
                items={breadcrumbConfig}
                className="overflow-y-hidden overflow-x-auto noscrollbar"
                separator=">"
            />
        )
    }

    return { renderBreadcrumb }
}

/**
 * 笔记导航功能
 * 只有移动端会用到这个功能，桌面端这个功能由 Sidebar 组件负责
 */
export const useMobileMenu = (props: Props) => {
    const { currentArticleId } = props
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const menu = useMenu()
    /** 是否展开导航抽屉 */
    const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false)
    /** 当前 treeMenu 所处的层级 */
    const [treeMenuPath, setTreeMenuPath] = useState<number[]>([])
    /** 是否展开笔记管理选择抽屉 */
    const [isLinkDrawerOpen, setIsLinkDrawerOpen] = useState(false)
    /** 笔记管理选择 treeMenu 所处的层级 */
    const [linkTreeMenuPath, setLinkTreeMenuPath] = useState<number[]>([])
    /** 面包屑功能 */
    const { renderBreadcrumb } = useBreadcrumb()

    useEffect(() => {
        const totalPath = [...(menu.parentArticleIds || []), currentArticleId]
        setTreeMenuPath(totalPath.slice(1))
    }, [menu.parentArticleIds, currentArticleId])

    const onCloseDrawer = () => {
        setIsMenuDrawerOpen(false)
        setTreeMenuPath(menu.parentArticleIds || [])
    }

    // const onBackHomePage = () => {
    //     navigate(`/article/${menu.currentRootArticleId}`)
    //     setIsMenuDrawerOpen(false)
    // }

    /** 渲染下属文章列表 */
    const renderSubMenu = () => {
        if (!isMenuDrawerOpen) return null
        if (menu.linkLoading) return <div className="my-8">加载中...</div>

        return (<>
            <div className='mb-2'>
                {renderBreadcrumb()}
            </div>
            <TreeMenu
                value={treeMenuPath}
                onChange={setTreeMenuPath}
                onClickNode={node => {
                    navigate(`/article/${node.value}`)
                    setIsMenuDrawerOpen(false)
                }}
                treeData={menu?.articleTree?.data?.children || []}
            />
        </>)
    }

    const renderMenuItem = (item: ArticleMenuItem, index: number, list: ArticleMenuItem[]) => {
        return (
            <div key={item.id}>
                <div
                    className='mb-2 px-2 flex items-center h-[32px] text-base text-blackW dark:text-neutral-200'
                    onClick={() => {
                        navigate(`/article/${item.id}`)
                        setIsMenuDrawerOpen(false)
                    }}
                >
                    <span
                        className="flex-shrink-0 w-2 h-[60%] bg-gray-300 dark:bg-neutral-700 mr-2 rounded"
                        style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate">{item.title}</span>
                </div>
                {index < list.length - 1 ? <SplitLine /> : null}
            </div>
        )
    }

    /** 渲染相关文章列表 */
    const renderRelatedMenu = () => {
        if (menu.relatedLinkLoading) return <div className="my-8">加载中...</div>
        const currentMenu = menu.articleRelatedLink?.data?.relatedArticles || []

        return (<>
            {currentMenu.length <= 0
                ? <div className={EMPTY_CLASSNAME}>暂无相关笔记</div>
                : currentMenu.map((i, index) => renderMenuItem(i, index, currentMenu))
            }
            <Button
                block
                size="large"
                icon={<LinkOutlined />}
                onClick={() => setIsLinkDrawerOpen(true)}
            >关联其他笔记</Button>
        </>)
    }

    /** 渲染收藏文章列表 */
    const renderFavoriteMenu = () => {
        if (menu.favoriteLoading) return <div className="my-8">加载中...</div>
        const currentMenu = menu.articleFavorite?.data || []
        // console.log('🚀 ~ 收藏文章列表', currentMenu)

        return (<>
            {currentMenu.length === 0
                ? (<div className={EMPTY_CLASSNAME}>暂无收藏</div>)
                : currentMenu.map((i, index) => renderMenuItem(i, index, currentMenu))
            }
        </>)
    }

    const renderCurrentMenu = () => {
        switch (menu.currentTab) {
        case TabTypes.Sub:
            return renderSubMenu()
        case TabTypes.Related:
            return renderRelatedMenu()
        case TabTypes.Favorite:
            return renderFavoriteMenu()
        default:
            return null
        }
    }

    const onLinkSelectDrawerClose = () => {
        setIsLinkDrawerOpen(false)
    }

    const renderLinkSelectDrawer = () => {
        return (
            <MobileDrawer
                title='关联笔记选择'
                open={isLinkDrawerOpen}
                onClose={onLinkSelectDrawerClose}
                height="80%"
            >
                <TreeMenu
                    treeData={menu?.articleTree?.data?.children || []}
                    value={linkTreeMenuPath}
                    onChange={setLinkTreeMenuPath}
                    selectedIds={menu.selectedRelatedArticleIds}
                    onClickNode={menu.onUpdateRelatedList}
                />
            </MobileDrawer>
        )
    }

    const renderMenuDrawer = () => {
        return (
            <MobileDrawer
                title='笔记导航'
                open={isMenuDrawerOpen}
                onClose={onCloseDrawer}
                footer={(
                    <Row gutter={8}>
                        {/* <Col flex="0">
                            <Button
                                size="large"
                                icon={<HomeOutlined />}
                                onClick={onBackHomePage}
                            />
                        </Col> */}
                        <Col flex="1">
                            <Button
                                block
                                size="large"
                                onClick={onCloseDrawer}
                            >关闭</Button>
                        </Col>
                    </Row>
                )}
                height="80%"
            >
                <div className="flex flex-col flex-nowrap h-full">
                    <div className="flex-grow overflow-y-auto">
                        {renderCurrentMenu()}
                    </div>
                    <div className="flex-shrink-0">
                        <Row gutter={[8, 8]}>
                            {tabOptions.map(tab => {
                                return (
                                    <Col span={8} key={tab.value}>
                                        <Button
                                            size="large"
                                            block
                                            type={menu.currentTab === tab.value ? 'primary' : 'default'}
                                            onClick={() =>  dispatch(setCurrentMenu(tab.value))}
                                            icon={tab.icon}
                                        >
                                            {tab.label}
                                        </Button>
                                    </Col>
                                )
                            })}
                        </Row>
                    </div>
                </div>
                {renderLinkSelectDrawer()}
            </MobileDrawer>
        )
    }

    return { menu, renderMenuDrawer, setIsMenuDrawerOpen }
}
