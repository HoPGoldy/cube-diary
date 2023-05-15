import Router from 'koa-router'
import { AppKoaContext } from '@/types/global'
import { response } from '@/server/utils'
import { ArticleService } from './service'
import { validate } from '@/server/utils'
import Joi from 'joi'
import { AddArticleReqData, DeleteArticleMutation, SearchArticleReqData, SetArticleRelatedReqData, UpdateArticleReqData } from '@/types/article'
import { getJwtPayload } from '@/server/lib/auth'

interface Props {
    service: ArticleService
}

export const createArticleRouter = (props: Props) => {
    const { service } = props
    const router = new Router<any, AppKoaContext>({ prefix: '/article' })

    const addArticleSchema = Joi.object<AddArticleReqData>({
        title: Joi.string().required(),
        content: Joi.string().allow('').required(),
        parentId: Joi.number().required(),
    })

    // 添加文章
    router.post('/add', async ctx => {
        const body = validate(ctx, addArticleSchema)
        if (!body) return
        const { title, content, parentId } = body

        const payload = getJwtPayload(ctx)
        if (!payload) return

        const resp = await service.addArticle(title, content, payload.userId, parentId)
        response(ctx, resp)
    })

    const removeArticleSchema = Joi.object<DeleteArticleMutation>({
        id: Joi.number().required(),
        force: Joi.boolean().required(),
    })

    // 删除文章
    router.post('/remove', async ctx => {
        const body = validate(ctx, removeArticleSchema)
        if (!body) return

        const resp = await service.removeArticle(body.id, body.force)
        response(ctx, resp)
    })

    const updateArticleSchema = Joi.object<UpdateArticleReqData>({
        id: Joi.number(),
        title: Joi.string().allow(null),
        content: Joi.string().allow('', null),
        parentArticleId: Joi.number().allow(null),
        tagIds: Joi.array().items(Joi.number()).allow(null),
        listSubarticle: Joi.boolean().allow(null),
        color: Joi.string().allow('', null),
    })

    // 更新文章
    router.post('/update', async ctx => {
        const body = validate(ctx, updateArticleSchema)
        if (!body) return

        const resp = await service.updateArticle(body)
        response(ctx, resp)
    })

    // 查询文章详情
    // 包含内容、标题等正文详情
    router.get('/:id/getContent', async ctx => {
        const { id } = ctx.params
        
        const payload = getJwtPayload(ctx)
        if (!payload) return

        const resp = await service.getArticleContent(+id, payload.userId)
        response(ctx, resp)
    })

    const queryArticleSchema = Joi.object<SearchArticleReqData>({
        keyword: Joi.string().allow(null).empty(''),
        tagIds: Joi.array().items(Joi.number()).allow(null),
        page: Joi.number().allow(null),
    })

    // 获取文章列表
    router.post('/getList', async ctx => {
        const body = validate(ctx, queryArticleSchema)
        if (!body) return

        const payload = getJwtPayload(ctx)
        if (!payload) return

        const resp = await service.getArticleList(body, payload.userId)
        response(ctx, resp)
    })

    // 获取文章子级、父级文章信息
    router.get('/:id/getLink', async ctx => {
        const { id } = ctx.params
        const resp = await service.getChildren(+id)
        response(ctx, resp)
    })

    // 获取详细的子级文章列表
    router.get('/:id/getChildrenDetailList', async ctx => {
        const { id } = ctx.params
        const resp = await service.getChildrenDetailList(+id)
        response(ctx, resp)
    })

    // 获取相关文章信息
    router.get('/:id/getRelated', async ctx => {
        const { id } = ctx.params
        const payload = getJwtPayload(ctx)
        if (!payload) return

        const resp = await service.getRelatives(id, payload.userId)
        response(ctx, resp)
    })

    // 批量设置文章的父文章
    router.get('/setParentId', async ctx => {
        response(ctx)
    })

    // 查询文章树
    router.get('/:rootArticleId/tree', async ctx => {
        const { rootArticleId } = ctx.params

        const resp = await service.getArticleTree(+rootArticleId)
        response(ctx, resp)
    })

    // 获取所有收藏的文章
    router.get('/favorite', async ctx => {
        const payload = getJwtPayload(ctx)
        if (!payload) return

        const resp = await service.getFavoriteArticles(payload.userId)
        response(ctx, resp)
    })

    const setFavoriteSchame = Joi.object<{ id: number, favorite: boolean }>({
        id: Joi.number().required(),
        favorite: Joi.boolean().required(),
    })

    // 设置文章收藏状态
    router.post('/setFavorite', async ctx => {
        const body = validate(ctx, setFavoriteSchame)
        if (!body) return

        const payload = getJwtPayload(ctx)
        if (!payload) return

        const resp = await service.setFavorite(body.favorite, body.id, payload.userId)
        response(ctx, resp)
    })

    const setRelatedSchame = Joi.object<SetArticleRelatedReqData>({
        link: Joi.boolean().required(),
        fromArticleId: Joi.number().required(),
        toArticleId: Joi.number().required(),
    })

    // 设置文章关联关系
    router.post('/setRelated', async ctx => {
        const body = validate(ctx, setRelatedSchame)
        if (!body) return

        const payload = getJwtPayload(ctx)
        if (!payload) return

        const resp = await service.setArticleRelate(body, payload.userId)
        response(ctx, resp)
    })

    return router
}