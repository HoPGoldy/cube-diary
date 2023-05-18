import Router from 'koa-router'
import { AppKoaContext } from '@/types/global'
import { response } from '@/server/utils'
import { TagService } from './service'
import { validate } from '@/server/utils'
import Joi from 'joi'
import { getJwtPayload } from '@/server/lib/auth'
import { DiaryExportReqData, DiaryUpdateReqData, JsonImportForm, SearchDiaryReqData } from '@/types/diary'

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

    const importDiaryShema = Joi.object<JsonImportForm>({
        existOperation: Joi.string(),
        dateKey: Joi.string(),
        contentKey: Joi.string(),
        colorKey: Joi.string(),
        dateFormatter: Joi.string(),
    })

    // 导入笔记
    router.post('/importDiary', async ctx => {
        const query = validate(ctx, importDiaryShema)
        if (!query) return

        const payload = getJwtPayload(ctx)
        if (!payload) return

        const originFiles = ctx.request.files?.file || []
        const file = Array.isArray(originFiles) ? originFiles[0] : originFiles
        try {
            const resp = await service.importDiary(file.filepath, query, payload.userId)
            response(ctx, resp)
        } catch (e) {
            console.error(e)
            response(ctx, { code: 500, msg: '导入失败，请检查数据结构是否正确' })
        }
    })

    const exportDiaryShema = Joi.object<DiaryExportReqData>({
        range: Joi.string(),
        startDate: Joi.string().allow(null),
        endDate: Joi.string().allow(null),
        dateKey: Joi.string(),
        contentKey: Joi.string(),
        colorKey: Joi.string(),
        dateFormatter: Joi.string(),
    })

    // 导出笔记
    router.post('/exportDiary', async ctx => {
        const query = validate(ctx, exportDiaryShema)
        if (!query) return

        const payload = getJwtPayload(ctx)
        if (!payload) return

        const data = await service.exportDiary(query, payload.userId)
        ctx.set('Content-disposition', 'attachment; filename=data.txt')
        ctx.set('Content-type', 'text/json')
        ctx.body = data
    })

    return router
}