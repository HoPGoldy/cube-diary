import { queryClient, requestGet, requestPost } from './base'
import { AppResponse } from '@/types/global'
import {
    AddArticleReqData, ArticleContent, ArticleDeleteResp, ArticleLinkResp,
    ArticleMenuItem,
    ArticleRelatedResp,
    ArticleSubLinkDetail,
    ArticleTreeNode, DeleteArticleMutation,
    SearchArticleReqData,
    SearchArticleResp,
    SetArticleRelatedReqData,
    UpdateArticleReqData
} from '@/types/article'
import { useMutation, useQuery } from 'react-query'
import isNil from 'lodash/isNil'

/** 查询文章正文 */
export const useQueryArticleContent = (id: number) => {
    return useQuery(['articleContent', id], () => {
        return requestGet<ArticleContent>(`article/${id}/getContent`)
    }, {
        refetchOnWindowFocus: false
    })
}

const updateArticleCache = (id: number, updateData: Partial<ArticleContent>) => {
    const oldData = queryClient.getQueryData<AppResponse<ArticleContent>>(['articleContent', id])
    if (!oldData) return

    const newData = {
        ...oldData,
        data: { ...oldData.data, ...updateData }
    }
    queryClient.setQueryData(['articleContent', id], newData)
}

/** 更新文章详情 hook */
export const useUpdateArticle = () => {
    return useMutation((data: UpdateArticleReqData) => {
        return requestPost('article/update', data)
    }, {
        onMutate: async (data) => {
            // 把修改乐观更新到缓存
            updateArticleCache(data.id, data)
        },
        onSuccess: (resp, data) => {
            if (data.title || data.parentArticleId) {
                queryClient.invalidateQueries(['articleLink', data.id])
                queryClient.invalidateQueries('articleDetailSubLink')
                queryClient.invalidateQueries('menu')
            }
            if (!isNil(data.color)) {
                queryClient.invalidateQueries('menu')
                queryClient.invalidateQueries('favorite')
                queryClient.invalidateQueries('articleRelated')
            }
            // 是否收藏不通过这个接口更新，所以不需要更新收藏列表
            // if (data.favorite) {
            //     queryClient.invalidateQueries('favorite')
            // }
        }
    })
}

/** 自动保存接口 */
export const autoSaveContent = async (id: number, content: string) => {
    updateArticleCache(id, { content })
    return requestPost('article/update', { id, content })
}

/** 查询本文的下属文章 */
export const useQueryArticleLink = (id: number | undefined, enabled: boolean) => {
    return useQuery(['articleLink', id], () => {
        return requestGet<ArticleLinkResp>(`article/${id}/getLink`)
    }, { enabled })
}

/** 查询本文的详细下属文章列表 */
export const useQueryArticleSublink = (id: number | undefined, enabled: boolean) => {
    return useQuery(['articleDetailSubLink', id], () => {
        return requestGet<ArticleSubLinkDetail[]>(`article/${id}/getChildrenDetailList`)
    }, { enabled })
}

/** 查询本文的相关文章 */
export const useQueryArticleRelated = (id: number | undefined, enabled: boolean) => {
    return useQuery(['articleRelated', id], () => {
        return requestGet<ArticleRelatedResp>(`article/${id}/getRelated`)
    }, { enabled })
}

/** 新增文章 */
export const useAddArticle = () => {
    return useMutation((data: AddArticleReqData) => {
        return requestPost('article/add', data)
    }, {
        onSuccess: (resp, data) => {
            queryClient.invalidateQueries(['articleLink', data.parentId])
            queryClient.invalidateQueries('articleDetailSubLink')
            queryClient.invalidateQueries('menu')
        }
    })
}

/** 删除文章 */
export const useDeleteArticle = () => {
    return useMutation((data: DeleteArticleMutation) => {
        return requestPost<ArticleDeleteResp>('article/remove', data)
    }, {
        onSuccess: (resp) => {
            queryClient.invalidateQueries(['articleLink', resp?.data?.parentArticleId])
            queryClient.invalidateQueries('articleDetailSubLink')
            queryClient.invalidateQueries('menu')
            queryClient.invalidateQueries('favorite')
        }
    })
}

/** 搜索文章列表 */
export const useQueryArticleList = (data: SearchArticleReqData) => {
    return useQuery(['articleList', data], async () => {
        return requestPost<SearchArticleResp>('article/getList', data)
    }, {
        refetchOnWindowFocus: false,
        enabled: data.keyword !== '' || (data.tagIds && data.tagIds.length > 0)
    })
}

/** 查询文章树 */
export const useQueryArticleTree = (id?: number) => {
    return useQuery('menu', () => {
        return requestGet<ArticleTreeNode>(`article/${id}/tree`)
    }, {
        refetchOnWindowFocus: false,
        enabled: !isNil(id)
    })
}

/** 查询收藏列表 */
export const useQueryArticleFavorite = (enabled: boolean) => {
    return useQuery('favorite', () => {
        return requestGet<ArticleMenuItem[]>('article/favorite')
    }, {
        refetchOnWindowFocus: false,
        enabled
    })
}

/** 收藏文章 */
export const useFavoriteArticle = () => {
    return useMutation((data: { id: number, favorite: boolean }) => {
        return requestPost('article/setFavorite', data)
    }, {
        onMutate: async (data) => {
        // 把修改乐观更新到缓存
            updateArticleCache(data.id, { favorite: data.favorite })
        },
        onSuccess: () => {
            queryClient.invalidateQueries('favorite')
        }
    })
}

/** 关联文章 */
export const useSetArticleRelated = () => {
    return useMutation((data: SetArticleRelatedReqData) => {
        return requestPost('article/setRelated', data)
    }, {
        onSuccess: (resp, data) => {
            queryClient.invalidateQueries(['articleRelated', data.fromArticleId])
        }
    })
}
