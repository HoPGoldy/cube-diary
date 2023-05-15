import serve from 'koa-static'

/**
 * koa 中间件 - 托管前端静态资源
 */
export const fontentServe = (root: string) => {
    return serve(root, {
        setHeaders: (res, path) => {
            // 首页不缓存
            if (path.endsWith('index.html')) {
                res.setHeader('Cache-Control', 'no-cache, no-store')
            }
            // 非首页的其他静态资源就换成
            else {
                res.setHeader('Cache-Control', 'public, max-age=31536000')
            }
        }
    })
}