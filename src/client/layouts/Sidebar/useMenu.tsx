import { useAddArticle, useQueryArticleFavorite, useQueryArticleLink, useQueryArticleRelated, useQueryArticleTree, useSetArticleRelated } from '@/client/services/article'
import { useAppDispatch, useAppSelector } from '@/client/store'
import { setParentArticle, setRelatedArticleIds } from '@/client/store/menu'
import { ArticleTreeNode, TabTypes } from '@/types/article'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UnorderedListOutlined, ShareAltOutlined, HeartOutlined } from '@ant-design/icons'

export const tabOptions = [
    { label: '下属', sidebarLabel: '下属笔记', value: TabTypes.Sub, icon: <UnorderedListOutlined /> },
    { label: '相关', sidebarLabel: '相关笔记',value: TabTypes.Related, icon: <ShareAltOutlined /> },
    { label: '收藏', sidebarLabel: '我的收藏',value: TabTypes.Favorite, icon: <HeartOutlined /> },
]

/** 空列表占位符样式 */
export const EMPTY_CLASSNAME = 'text-gray-500 py-4 cursor-default text-center'

export const useMenu = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const currentTab = useAppSelector(s => s.menu.currentTab)
    const currentRootArticleId = useAppSelector(s => s.user.userInfo?.rootArticleId)
    const currentArticleId = useAppSelector(s => s.menu.currentArticleId)
    const parentArticleIds = useAppSelector(s => s.menu.parentArticleIds)
    const parentArticleTitle = useAppSelector(s => s.menu.parentArticleTitle)
    const selectedRelatedArticleIds = useAppSelector(s => s.menu.selectedRelatedArticleIds)
    // 获取左下角菜单树
    const { data: articleTree } = useQueryArticleTree(currentRootArticleId)
    // 获取当前文章的子级、父级文章
    const { data: articleLink, isLoading: linkLoading } = useQueryArticleLink(
        currentArticleId,
        !!(currentArticleId && currentTab === TabTypes.Sub)
    )
    // 获取当前文章的相关文章
    const { data: articleRelatedLink, isLoading: relatedLinkLoading } = useQueryArticleRelated(
        currentArticleId,
        !!(currentArticleId && currentTab === TabTypes.Related)
    )
    // 获取收藏文章
    const { data: articleFavorite, isLoading: favoriteLoading } = useQueryArticleFavorite(
        currentTab === TabTypes.Favorite
    )
    // 新增文章
    const { mutateAsync: addArticle } = useAddArticle()
    // 更新选中的相关文章
    const { mutateAsync: setArticleRelated } = useSetArticleRelated()

    const createArticle = async () => {
        if (!currentArticleId) {
            console.error('当前文章不存在，无法创建子文章')
            return
        }

        const title = `新笔记-${new Date().toLocaleString()}`
        const resp = await addArticle({
            title,
            content: '',
            parentId: currentArticleId,
        })
        if (!resp.data) return

        navigate(`/article/${resp.data}?mode=edit&focus=title`)
    }

    // 选择了新的文章，把该文章的父级信息更新到 store
    useEffect(() => {
        if (!articleLink || !articleLink.data) return
        dispatch(setParentArticle(articleLink.data))
    }, [articleLink])

    // 查看了相关条目，更新信息，让设置相关条目时可以高亮已关联文章
    useEffect(() => {
        if (!articleRelatedLink || !articleRelatedLink.data) return
        dispatch(setRelatedArticleIds(articleRelatedLink.data.relatedArticles.map(item => item.id)))
    }, [articleRelatedLink])

    // 把选择的相关文章更新到后端
    const onUpdateRelatedArticleIds = (newIds: number[]) => {
        dispatch(setRelatedArticleIds(newIds))
    }

    // 把选择的相关文章更新到相关列表
    const onUpdateRelatedList = (newItem: ArticleTreeNode) => {
        const currentLinks = articleRelatedLink?.data?.relatedArticles || []
        // 如果已经关联了，就移除
        const hasLink = currentLinks.find(item => item.id === newItem.value)

        if (!currentArticleId) {
            console.error('当前文章不存在，无法更新相关文章')
            return
        }

        setArticleRelated({
            link: !hasLink,
            fromArticleId: currentArticleId,
            toArticleId: newItem.value
        })
    }

    return {
        currentTab,
        currentRootArticleId,
        parentArticleIds,
        parentArticleTitle,
        selectedRelatedArticleIds,
        articleTree,
        articleLink, linkLoading,
        articleRelatedLink, relatedLinkLoading,
        articleFavorite, favoriteLoading,
        createArticle,
        onUpdateRelatedArticleIds,
        onUpdateRelatedList,
    }
}