import Router from 'koa-router'
import { AppKoaContext } from '@/types/global'
import { response } from '@/server/utils'
import { TagService } from './service'
import { validate } from '@/server/utils'
import Joi from 'joi'
import { DeleteTagReqData, SetTagColorReqData, SetTagGroupReqData, TagGroupStorage, TagStorage, TagUpdateReqData } from '@/types/tag'
import { getJwtPayload } from '@/server/lib/auth'

interface Props {
    service: TagService
}

export const createTagRouter = (props: Props) => {
    const { service } = props
    const router = new Router<any, AppKoaContext>({ prefix: '/tag' })

    const addSchema = Joi.object<TagStorage>({
        title: Joi.string().required(),
        color: Joi.string().required(),
        groupId: Joi.number().allow(null),
    })

    // 添加标签
    router.post('/add', async ctx => {
        const body = validate(ctx, addSchema)
        if (!body) return

        const payload = getJwtPayload(ctx)
        if (!payload) return

        const tagInfo: TagStorage = { ...body, createUserId: payload.userId }
        const resp = await service.addTag(tagInfo)
        response(ctx, resp)
    })

    const updateSchema = Joi.object<TagUpdateReqData>({
        id: Joi.number().required(),
        title: Joi.string().allow(null),
        color: Joi.string().allow(null),
        groupId: Joi.number().allow(null),
    })

    // 更新标签
    router.post('/update', async ctx => {
        const body = validate(ctx, updateSchema)
        if (!body) return

        const resp = await service.updateTag(body)
        response(ctx, resp)
    })

    // 删除标签
    router.post('/:id/remove', async ctx => {
        const { id } = ctx.params
        const payload = getJwtPayload(ctx)
        if (!payload) return

        const resp = await service.removeTag(+id, payload.userId)
        response(ctx, resp)
    })

    // 查询标签列表（不分页）
    router.get('/list', async ctx => {
        const payload = getJwtPayload(ctx)
        if (!payload) return
        const resp = await service.getTagList(payload.userId)
        response(ctx, resp)
    })

    // 查询标签分组列表（不分页）
    router.get('/group/list', async ctx => {
        const payload = getJwtPayload(ctx)
        if (!payload) return
        const resp = await service.getGroupList(payload.userId)
        response(ctx, resp)
    })

    const addGroupSchema = Joi.object<{ title: string }>({
        title: Joi.string().required(),
    })

    // 添加分组
    router.post('/group/add', async ctx => {
        const body = validate(ctx, addGroupSchema)
        if (!body) return
        const payload = getJwtPayload(ctx)
        if (!payload) return

        const data: Omit<TagGroupStorage, 'id'> = {
            ...body,
            createUserId: payload.userId,
        }

        const resp = await service.addGroup(data)
        response(ctx, resp)
    })

    // 删除分组
    router.post('/group/:id/:method/removeGroup', async ctx => {
        const { id, method } = ctx.params
        const payload = getJwtPayload(ctx)
        if (!payload) return

        const resp = await service.removeGroup(+id, method, payload.userId)
        response(ctx, resp)
    })

    const updateGroupSchema = Joi.object<Omit<TagGroupStorage, 'createUserId'>>({
        id: Joi.number().required(),
        title: Joi.string().allow(null),
    })

    // 更新标签分组
    router.post('/group/update', async ctx => {
        const body = validate(ctx, updateGroupSchema)
        if (!body) return
        const payload = getJwtPayload(ctx)
        if (!payload) return

        const data: TagGroupStorage = { ...body, createUserId: payload.userId }

        const resp = await service.updateGroup(data)
        response(ctx, resp)
    })

    const batchSetColorSchema = Joi.object<SetTagColorReqData>({
        color: Joi.string().required(),
        ids: Joi.array().items(Joi.number()).required(),
    })

    // 批量设置标签颜色
    router.post('/batch/setColor', async ctx => {
        const body = validate(ctx, batchSetColorSchema)
        if (!body) return
        const payload = getJwtPayload(ctx)
        if (!payload) return

        const resp = await service.batchSetColor(body.ids, body.color, payload.userId)
        response(ctx, resp)
    })

    const batchSetGroupSchema = Joi.object<SetTagGroupReqData>({
        groupId: Joi.number().required(),
        ids: Joi.array().items(Joi.number()).required(),
    })

    // 批量设置标签分组
    router.post('/batch/setGroup', async ctx => {
        const body = validate(ctx, batchSetGroupSchema)
        if (!body) return
        const payload = getJwtPayload(ctx)
        if (!payload) return

        const resp = await service.batchSetGroup(body.ids, body.groupId, payload.userId)
        response(ctx, resp)
    })

    const batchRemoveSchema = Joi.object<DeleteTagReqData>({
        ids: Joi.array().items(Joi.number()).required(),
    })

    // 批量删除标签
    router.post('/batch/remove', async ctx => {
        const body = validate(ctx, batchRemoveSchema)
        if (!body) return
        const payload = getJwtPayload(ctx)
        if (!payload) return

        const resp = await service.batchRemoveTag(body.ids, payload.userId)
        response(ctx, resp)
    })

    return router
}