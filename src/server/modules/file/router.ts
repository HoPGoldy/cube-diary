import Router from 'koa-router'
import { AppKoaContext } from '@/types/global'
import { response, validate } from '@/server/utils'
import { FileService } from './service'
import { UploadedFile } from '@/types/file'
import { getJwtPayload } from '@/server/lib/auth'
import { readFile } from 'fs-extra'
import Joi from 'joi'

interface Props {
    service: FileService
}

export const createFileRouter = (props: Props) => {
    const { service } = props
    const router = new Router<any, AppKoaContext>({ prefix: '/file' })

    const fileGetSchema = Joi.object<{ hash: string }>({
        hash: Joi.string().required(),
    })

    router.get('/get', async ctx => {
        const payload = getJwtPayload(ctx)
        if (!payload) return

        const queryData = validate(ctx, fileGetSchema)
        if (!queryData) return

        const data = await service.readFile(queryData.hash, payload.userId)
        if (!data) {
            ctx.status = 404
            return
        }

        const { filename, type, size } = data.fileInfo
        ctx.set('Content-disposition', `attachment; filename=${encodeURIComponent(filename)}`)
        ctx.set('Content-Type', type)
        ctx.set('Content-Length', size.toString())
        // 缓存一个月
        ctx.set('Cache-Control', 'max-age=2592000')
        ctx.body = await readFile(data.filePath)
    })

    router.post('/upload', async ctx => {
        const payload = getJwtPayload(ctx)
        if (!payload) return

        const originFiles = ctx.request.files?.file || []
        const files = Array.isArray(originFiles) ? Array.from(originFiles) : [originFiles]

        const uploadedFiles: Omit<UploadedFile, 'md5'>[] = files.map(f => ({
            filename: f.originalFilename || f.newFilename,
            type: f.mimetype || 'unknown',
            tempPath: f.filepath,
            size: f.size,
        }))

        const data = await service.uploadFile(uploadedFiles, payload.userId)
        response(ctx, { code: 200, data })
    })

    return router
}