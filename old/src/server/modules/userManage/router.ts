import Router from 'koa-router';
import { AppKoaContext } from '@/types/global';
import { response, validate } from '@/server/utils';
import { UserInviteService } from './service';
import { getJwtPayload } from '@/server/lib/auth';
import { Next } from 'koa';
import Joi from 'joi';
import { BanUserReqData } from '@/types/userInvite';

interface Props {
  service: UserInviteService;
}

export const createUserManageRouter = (props: Props) => {
  const { service } = props;
  const router = new Router<any, AppKoaContext>({ prefix: '/userInvite' });

  const isAdmin = (ctx: AppKoaContext, next: Next) => {
    const payload = getJwtPayload(ctx);
    if (!payload) return;

    if (!payload.isAdmin) {
      response(ctx, { code: 400, msg: '非法操作' });
      return;
    }

    return next();
  };

  router.use(isAdmin);

  router.post('/addInvite', async (ctx) => {
    const resp = await service.addInvite();
    response(ctx, resp);
  });

  router.get('/getInviteList', async (ctx) => {
    const resp = await service.getInviteList();
    response(ctx, resp);
  });

  router.post('/delete/:id', async (ctx) => {
    const { id } = ctx.params;

    const resp = await service.deleteInvite(Number(id));
    response(ctx, resp);
  });

  const banUserSchema = Joi.object<BanUserReqData>({
    userId: Joi.number().required(),
    isBanned: Joi.boolean().required(),
  });

  router.post('/banUser', async (ctx) => {
    const body = validate(ctx, banUserSchema);
    if (!body) return;

    const resp = await service.banUser(body);
    response(ctx, resp);
  });

  return router;
};
