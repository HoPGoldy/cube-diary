import { AppKoaContext, AppResponse } from '@/types/global';
import Joi from 'joi';
import { Context, Next } from 'koa';
import fs from 'fs';
import path from 'path';

const initialResponse: AppResponse = {
  code: 200,
  msg: '',
  data: null,
};

export const response = (ctx: Context, { code, msg, data }: AppResponse = initialResponse) => {
  ctx.body = {
    code,
    msg,
    data,
  };
};

export const errorWapper = async (ctx: AppKoaContext, next: Next) => {
  try {
    await next();
  } catch (e) {
    console.error(e);
    response(ctx, { code: 500, msg: '服务异常' });
  }
};

/**
 * 验证请求参数
 * GET 请求校验 query，POST 请求校验 body
 *
 * @param ctx koa上下文
 * @param schema joi验证对象
 *
 * @returns 验证通过则返回验证后的值，否则返回 undefined
 */
export const validate = <T>(ctx: Context, schema: Joi.ObjectSchema<T>) => {
  const { error, value } = schema.validate(
    ctx.method === 'GET' ? ctx.request.query : ctx.request.body,
  );
  if (!value || error) {
    response(ctx, { code: 400, msg: '参数异常' });
    console.log('参数异常', error);
    return;
  }
  return value;
};

/**
 * 获得请求发送方的 ip
 * @link https://juejin.cn/post/6844904056784175112
 * @param   {Context}  ctx
 * @return  {string}
 */
export function getIp(ctx: AppKoaContext) {
  const xRealIp = ctx.get('X-Real-Ip');
  const { ip } = ctx;
  const { remoteAddress } = ctx.req.connection;
  return xRealIp || ip || remoteAddress;
}

/**
 * 获取请求访问的接口路由
 * 会把 params 里的值还原成对应的键名
 */
export function getRequestRoute(ctx: AppKoaContext) {
  const { url, params } = ctx;
  const pureUrl = url.split('?')[0];
  if (!params) return pureUrl;

  const route = Object.entries(params).reduce((prevUrl, param) => {
    const [key, value] = param;
    return prevUrl.replace(('/' + value) as string, `/:${key}`);
  }, pureUrl);

  return route;
}

export const getPackageVersion = (): string => {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '', '../../package.json'), 'utf8'))
    .version;
};
