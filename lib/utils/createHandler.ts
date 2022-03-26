import { JWTPayload } from "jose";
import { runAuth } from "lib/auth";
import { NextApiRequest, NextApiResponse } from "next";

type RequestHandler = (req: NextApiRequest, res: NextApiResponse, userAuth?: JWTPayload) => unknown

interface RequestMethodMap {
    GET?: RequestHandler
    POST?: RequestHandler
    PUT?: RequestHandler
    DELETE?: RequestHandler
}

/**
 * 创建 api 端点
 * 整合了拒绝 not allow 方法的功能
 */
export const createHandler = function (config: RequestMethodMap) {
    const allowMethods = Object.keys(config)

    return async (req: NextApiRequest, res: NextApiResponse) => {
        const userAuth = await runAuth(req, res)
        if (!userAuth) return

        const requestMethod = req.method || 'GET'

        if (!allowMethods.includes(requestMethod)) {
            res.setHeader('Allow', allowMethods)
            res.status(405).end(`Method ${req.method} Not Allowed`)
            return
        }

        const handler = config[requestMethod as (keyof typeof config)]
        if (handler) return await handler(req, res, userAuth)
    }
}