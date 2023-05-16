import Router from 'koa-router'
import { AppKoaContext } from '@/types/global'
import { response } from '@/server/utils'
import { TagService } from './service'
import { validate } from '@/server/utils'
import Joi from 'joi'
import { getJwtPayload } from '@/server/lib/auth'
import { DiaryUpdateReqData, SearchDiaryReqData } from '@/types/diary'

interface Props {
    service: TagService
}

export const createDiaryRouter = (props: Props) => {
    const { service } = props
    const router = new Router<any, AppKoaContext>({ prefix: '/diary' })

    // 查询日记列表
    router.get('/getMonthList/:month', async ctx => {
        const { month } = ctx.params
        const payload = getJwtPayload(ctx)
        if (!payload) return

        const resp = await service.getMonthList(month, payload.userId)
        response(ctx, resp)
    })

    // 查询日记详情
    router.get('/getDetail/:date', async ctx => {
        const { date } = ctx.params
        const payload = getJwtPayload(ctx)
        if (!payload) return

        const resp = await service.getDetail(+date, payload.userId)
        response(ctx, resp)
    })

    const addDiaryShema = Joi.object<DiaryUpdateReqData>({
        date: Joi.number().required(),
        content: Joi.string().allow(''),
        color: Joi.string().allow(null),
    })

    // 更新日记
    router.post('/update', async ctx => {
        const body = validate(ctx, addDiaryShema)
        if (!body) return

        const payload = getJwtPayload(ctx)
        if (!payload) return

        const resp = await service.updateDetail(body, payload.userId)
        response(ctx, resp)
    })

    const searchDiaryShema = Joi.object<SearchDiaryReqData>({
        keyword: Joi.string().allow(''),
        colors: Joi.array().items(Joi.string()).allow(null),
        desc: Joi.boolean().allow(null),
        page: Joi.number().allow(null),
    })

    // 查询日记
    router.post('/search', async ctx => {
        const query = validate(ctx, searchDiaryShema)
        if (!query) return

        const payload = getJwtPayload(ctx)
        if (!payload) return

        const resp = await service.serachDiary(query, payload.userId)
        response(ctx, resp)
    })

    return router
}