import Router from 'koa-router'
import { AppKoaContext } from '@/types/global'
import { getIp, response } from '@/server/utils'
import { UserService } from './service'
import { validate } from '@/server/utils'
import Joi from 'joi'
import { ChangePasswordReqData, LoginReqData, RegisterReqData, SetThemeReqData } from '@/types/user'
import { getJwtPayload } from '@/server/lib/auth'

interface Props {
    service: UserService
}

export const createUserRouter = (props: Props) => {
    const { service } = props
    const router = new Router<any, AppKoaContext>({ prefix: '/user' })

    const loginSchema = Joi.object<LoginReqData>({
        username: Joi.string().required(),
        password: Joi.string().required()
    })

    router.post('/login', async ctx => {
        const body = validate(ctx, loginSchema)
        if (!body) return
        const { username, password } = body

        const resp = await service.login(username, password, getIp(ctx) || 'anonymous')
        response(ctx, resp)
    })

    router.get('/getInfo', async ctx => {
        const payload = getJwtPayload(ctx)
        if (!payload) return

        const resp = await service.getUserInfo(payload.userId, getIp(ctx) || 'anonymous')
        response(ctx, resp)
    })

    const registerSchema = Joi.object<RegisterReqData>({
        username: Joi.string().required(),
        passwordHash: Joi.string().required(),
        inviteCode: Joi.string().required()
    })

    router.post('/register', async ctx => {
        const body = validate(ctx, registerSchema)
        if (!body) return

        const resp = await service.register(body)
        response(ctx, resp)
    })

    router.post('/createAdmin', async ctx => {
        const body = validate(ctx, loginSchema)
        if (!body) return
        const { username, password } = body

        const resp = await service.createAdmin(username, password)
        response(ctx, resp)
    })

    const changePwdSchema = Joi.object<ChangePasswordReqData>({
        newP: Joi.string().required(),
        oldP: Joi.string().required()
    })

    router.post('/changePwd', async ctx => {
        const body = validate(ctx, changePwdSchema)
        if (!body) return
        const { newP, oldP } = body

        const payload = getJwtPayload(ctx)
        if (!payload) return

        const resp = await service.changePassword(payload.userId, oldP, newP)
        response(ctx, resp)
    })

    const setThemeSchema = Joi.object<SetThemeReqData>({
        theme: Joi.any().valid('light', 'dark').required()
    })

    router.post('/setTheme', async ctx => {
        const body = validate(ctx, setThemeSchema)
        if (!body) return
        const { theme } = body

        const payload = getJwtPayload(ctx)
        if (!payload) return

        const resp = await service.setTheme(payload.userId, theme)
        response(ctx, resp)
    })

    // 统计文章
    router.get('/statistic', async ctx => {
        const payload = getJwtPayload(ctx)
        if (!payload) return

        const resp = await service.getArticleCount(payload.userId)
        response(ctx, resp)
    })

    return router
}