import { Context } from 'koa';

/**
 * 后端接口返回的数据格式
 */
export type AppResponse<T = any> = {
  code?: number;
  msg?: string;
  data?: T;
};

export interface MyJwtPayload {
  userId: number;
  isAdmin: boolean;
  lat: number;
  exp: number;
}

export type AppKoaContext = Context & {
  request: { body: Record<string, unknown> };
  /**
   * 用于存储 jwt 解析后的数据
   */
  state?: { user: MyJwtPayload };
};
