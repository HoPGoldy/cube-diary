import useSWR, { SWRResponse } from 'swr'
import qs from 'qs'
import { RespData } from 'types/global'
import Router from 'next/router'

/**
 * 基础请求器
 *
 * @param input 请求 url
 * @param requestInit 请求初始化配置
 */
const fetcher: typeof fetch = (input, requestInit = {}) => {
    const init = { ...requestInit }

    return fetch(input, init)
        .then(res => {
            if (res.status === 401) {
                Router.replace('/login')
                return res
            }

            return res.json()
        })
}

/**
 * 使用 useSWR 请求数据
 *
 * @param url 请求路由
 * @param query 请求的参数，会拼接到 url 后面
 */
export const useFetch = function <D = any, E = string>(url: string, query = {}) {
    const key = url + qs.stringify(query, { addQueryPrefix: true })
    return useSWR(key, fetcher) as unknown as SWRResponse<D, E>
}

/**
 * 使用 GET 发起请求
 *
 * @param url 请求路由
 * @param query 请求的参数，会拼接到 url 后面
 */
export const get = async function <T>(url: string, query = {}): Promise<RespData<T>> {
    const requestUrl = url + qs.stringify(query, { addQueryPrefix: true })
    const config: RequestInit = { method: 'GET' }

    return fetcher(requestUrl, config) as unknown as Promise<RespData<T>>
}

/**
 * 使用 POST 发起请求
 *
 * @param url 请求路由
 * @param body 请求参数，会放在 body 里
 */
export const post = async function <T>(url: string, body = {}): Promise<RespData<T>> {
    const config: RequestInit = {
        method: 'POST',
        body: JSON.stringify(body)
    }

    return fetcher(url, config) as unknown as Promise<RespData<T>>
}

/**
 * 使用 POST 上传文件到后端
 *
 * @param url 请求路由
 * @param body 请求参数，会放在 body 里，body 格式为 multipart/form-data
 */
export const upload = async function <T>(url: string, body: Record<string, File | string> = {}): Promise<RespData<T>> {
    const formData = new FormData()

    for (const key in body) {
        formData.append(key, body[key] as Blob)
    }

    const config: RequestInit = {
        method: 'POST',
        body: formData
    }

    return fetcher(url, config) as unknown as Promise<RespData<T>>
}