import {
    ArticleContent, ArticleStorage, ArticleDeleteResp, SearchArticleReqData, UpdateArticleReqData,
    ArticleTreeNode, ArticleLinkResp, ArticleRelatedResp, SetArticleRelatedReqData, SearchArticleDetail, SearchArticleResp, ArticleSubLinkDetail
} from '@/types/article'
import { DatabaseAccessor } from '@/server/lib/sqlite'
import { appendIdToPath, arrayToPath, getParentIdByPath, pathToArray } from '@/utils/parentPath'
import { PAGE_SIZE, TABLE_NAME } from '@/config'

interface Props {
    db: DatabaseAccessor
}

export const createArticleService = (props: Props) => {
    const { db } = props

    /**
     * 把数据库中的数据格式化成前端需要的格式
     */
    const formatArticle = (article: ArticleStorage & { favoriteId?: number }): ArticleContent => {
        const { parentPath, tagIds, favoriteId, ...rest } = article

        const fontendArticle = {
            ...rest,
            parentArticleId: getParentIdByPath(parentPath),
            listSubarticle: !!article.listSubarticle,
            favorite: !!favoriteId,
            tagIds: tagIds ? pathToArray(tagIds) : []
        }

        return fontendArticle
    }

    const addArticle = async (title: string, content: string, userId: number, parentId?: number) => {
        let parentArticle: ArticleStorage | undefined
        if (parentId) {
            const detail = await db.article().select().where('id', parentId).first()
            parentArticle = detail
            if (!parentArticle) return { code: 400, msg: '父条目不存在' }
        }

        const newArticle: Omit<ArticleStorage, 'id'> = {
            title,
            content,
            createUserId: userId,
            createTime: Date.now(),
            updateTime: Date.now(),
            parentPath: (parentArticle && parentId) ? appendIdToPath(parentArticle.parentPath, parentId) : '',
            tagIds: '',
        }

        const [id] = await db.article().insert(newArticle)
        return { code: 200, data: id }
    }

    const setFavorite = async (favorite: boolean, articleId: number, userId: number) => {
        const article = await db.article().select().where('id', articleId).first()
        if (!article) return { code: 400, msg: '文章不存在' }

        if (favorite) {
            await db.favoriteArticle().insert({ articleId, userId })
        }
        else {
            await db.favoriteArticle().delete().where({ articleId, userId })
        }

        return { code: 200 }
    }

    /**
     * 删除文章
     */
    const removeArticle = async (id: number, force: boolean) => {
        const removedArticle = await db.article().select().where('id', id).first()
        if (!removedArticle) return { code: 200 }

        const childrenArticles = await db.article().select().whereLike('parentPath', `%#${id}#%`)

        const deleteIds = [id]
        if (childrenArticles.length > 0) {
            if (!force) return { code: 400, msg: '包含子条目，无法删除' }
            deleteIds.push(...childrenArticles.map(item => item.id))
        }

        // 删除文章本体
        await db.article().delete().whereIn('id', deleteIds)
        // 删除文章关联
        await db.articleRelation().delete().whereIn('fromArticleId', deleteIds).orWhereIn('toArticleId', deleteIds)
        // 删除文章收藏
        await db.favoriteArticle().delete().whereIn('articleId', deleteIds)

        // 返回父级文章 id，删除后会跳转至这个文章
        const parentId = getParentIdByPath(removedArticle.parentPath)
        const data: ArticleDeleteResp = {
            parentArticleId: parentId,
            deletedArticleIds: deleteIds,
        }

        return { code: 200, data }
    }

    const updateArticle = async (detail: UpdateArticleReqData) => {
        const { id, tagIds, parentArticleId, ...restDetail } = detail
        const oldArticle = await db.article().select().where({ id }).first()
        if (!oldArticle) return { code: 400, msg: '文章不存在' }

        const newArticle: Partial<ArticleStorage> = {
            ...oldArticle,
            ...restDetail,
            updateTime: Date.now(),
        }

        if (parentArticleId) {
            // 找到新父节点的祖先路径
            const newParentArticle = await db.article().select().where('id', parentArticleId).first()
            if (!newParentArticle) {
                return { code: 400, msg: '新父节点不存在' }
            }

            newArticle.parentPath = appendIdToPath(newParentArticle.parentPath, parentArticleId)

            // 把自己子笔记的路径也换掉
            await db.article()
                .update('parentPath', db.knex.raw('REPLACE(parentPath, ?, ?)', [oldArticle.parentPath, newArticle.parentPath]))
                .whereLike('parentPath', `%#${id}#%`)
        }

        if (tagIds) {
            newArticle.tagIds = arrayToPath(tagIds)
        }

        await db.article().update(newArticle).where({ id })
        const data = { parentArticleId: getParentIdByPath(newArticle.parentPath) }

        return { code: 200, data }
    }

    const getArticleList = async (reqData: SearchArticleReqData, userId: number) => {
        const { page = 1, tagIds, keyword } = reqData
        const query = db.article().select().where('createUserId', userId)

        if (keyword) {
            query.whereLike('title', `%${keyword}%`)
                .orWhereLike('content', `%${keyword}%`)
        }

        if (tagIds) {
            tagIds.forEach(tagId => {
                query.andWhereLike('tagIds', `%#${tagId}#%`)
            })
        }

        const { count: total } = await query.clone().count('id as count').first() as any

        const result = await query
            .orderBy('updateTime', 'desc')
            .limit(PAGE_SIZE)
            .offset((page - 1) * PAGE_SIZE)

        const rows: SearchArticleDetail[] = result.map(item =>  {
            let content = ''
            // 截取正文中关键字前后的内容
            if (keyword) {
                const matched = item.content.match(new RegExp(keyword, 'i'))
                if (matched && matched.index) {
                    content = item.content.slice(Math.max(matched.index - 30, 0), matched.index + 30)
                }
            }
            if (!content) content = item.content.slice(0, 30)

            const tagIds = item.tagIds ? pathToArray(item.tagIds) : []

            return {
                id: item.id,
                title: item.title,
                updateTime: item.updateTime,
                tagIds,
                content,
            }
        })

        const data: SearchArticleResp = { total, rows }

        return { code: 200, data }
    }

    const getArticleContent = async (id: number, userId: number) => {
        const article = await db.article()
            .select('articles.*')
            .select('favorites.id as favoriteId')
            .leftJoin(db.knex.raw(`${TABLE_NAME.FAVORITE} ON articles.id = favorites.articleId AND favorites.userId = ?`, [userId]))
            .where('articles.id', id)
            .first()

        if (!article) return { code: 400, msg: '文章不存在' }

        return { code: 200, data: formatArticle(article) }
    }

    // 获取子代的文章列表（也会包含父级文章）
    const getChildren = async (id: number) => {
        const article = await db.article().select().where('id', id).first()
        if (!article) return { code: 400, msg: '文章不存在' }

        const query = db.article().select('id', 'title', 'parentPath', 'color').whereLike('parentPath', `%#${id}#`)
        // 如果有父级文章，就把父级文章也查出来
        const parentId = getParentIdByPath(article.parentPath)
        if (parentId) query.orWhere('id', parentId)

        const data: ArticleLinkResp = {
            parentArticleIds: undefined,
            parentArticleTitle: undefined,
            childrenArticles: [],
        }

        const matchedArticles = await query
        // 因为父级是跟子级一起查出来的，所以这里要筛一下
        data.childrenArticles = matchedArticles.filter(item => {
            if (item.id !== parentId) return true
            data.parentArticleIds = [...pathToArray(item.parentPath), item.id]
            data.parentArticleTitle = item.title
            return false
        })

        return { code: 200, data }
    }

    // 获取详细的子代文章列表
    const getChildrenDetailList = async (id: number) => {
        const article = await db.article().select().where('id', id).first()
        if (!article) return { code: 400, msg: '文章不存在' }

        const rawData = await db.article().select('id', 'title', 'content', 'color', 'tagIds').whereLike('parentPath', `%#${id}#`)
        const data: ArticleSubLinkDetail[] = rawData.map(item => {
            return {
                ...item,
                content: item.content.slice(0, 40),
                tagIds: pathToArray(item.tagIds),
            }
        })
        return { code: 200, data }
    }

    // 获取相关的文章列表
    const getRelatives = async (id: string, userId: number) => {
        const articles = await db.articleRelation()
            .select('articles.id', 'articles.title', 'articles.color')
            .leftJoin(db.knex.raw(`${TABLE_NAME.ARTICLE} ON articleRelations.toArticleId = articles.id`))
            .where('articleRelations.fromArticleId', id)
            .andWhere('articleRelations.userId', userId)

        const relatedArticles = articles.filter(item => item.id)
        const data: ArticleRelatedResp = { relatedArticles }
        return { code: 200, data }
    }

    /**
     * 关联文章 / 解除关联
     **/
    const setArticleRelate = async (data: SetArticleRelatedReqData, userId: number) => {
        const { fromArticleId, toArticleId, link } = data

        if (link) {
            await db.articleRelation()
                .insert({ fromArticleId, toArticleId, userId })
        }
        else {
            await db.articleRelation()
                .delete()
                .where({ fromArticleId, toArticleId, userId })
        }

        return { code: 200 }
    }

    const arrayToTree = (rootId: number, data: Pick<ArticleStorage, 'id' | 'title' | 'color' | 'parentPath'>[]) => {
        if (!data || data.length <= 0) return []
        const cache = new Map<string, ArticleTreeNode>()

        data.forEach(item => {
            const selfPath = appendIdToPath(item.parentPath, item.id)
            const existSelf = cache.get(appendIdToPath(item.parentPath, item.id))

            const newItem: ArticleTreeNode = {
                title: item.title,
                value: item.id,
                color: item.color,
                // 如果已经存在自己节点了，就说明自己子节点比自己先出现
                // 所以要把自己的子节点合并进来
                children: existSelf?.children
            }

            cache.set(selfPath, newItem)

            const parent = cache.get(item.parentPath)

            if (parent) {
                if (!parent.children) parent.children = []
                parent.children.push(newItem)
            }
            // 没找到父节点，先添加个占位的父节点，后面等真正的父节点出现后再合并
            else if (item.parentPath) {
                cache.set(item.parentPath, { title: '待定', value: -1, children: [newItem] })
            }
        })

        return cache.get(`#${rootId}#`)
    }

    /**
     * 查询文章树
     * @param rootId 根节点的id
     */
    const getArticleTree = async (rootId: number) => {
        const subArticle = await db.article()
            .select('title', 'id', 'parentPath', 'color')
            .where('id', rootId)
            .orWhereLike('parentPath', `%#${rootId}#%`)

        return { code: 200, data: arrayToTree(rootId, subArticle) }
    }

    const getFavoriteArticles = async (userId: number) => {
        const data = await db.favoriteArticle()
            .select('articles.id', 'articles.title', 'articles.color')
            .leftJoin(db.knex.raw(`${TABLE_NAME.ARTICLE} ON favorites.articleId = articles.id`))
            .where('favorites.userId', userId)

        return { code: 200, data }
    }

    return {
        addArticle, getArticleContent, updateArticle, getChildren, getChildrenDetailList, getRelatives, getArticleTree, removeArticle,
        getFavoriteArticles, getArticleList, setFavorite, setArticleRelate
    }
}

export type ArticleService = ReturnType<typeof createArticleService>