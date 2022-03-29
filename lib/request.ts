import useSWR, { SWRResponse } from 'swr'
import qs from 'qs'
import { RespData } from 'types/global'
import { USER_TOKEN_KEY } from './auth'
import Router from 'next/router'

const fetcher: typeof fetch = (input, requestInit = {}) => {
    const init = {
        ...requestInit,
        headers: {
            [USER_TOKEN_KEY]: localStorage.getItem(USER_TOKEN_KEY) || ''
        }
    }

    return fetch(input, init)
        .then(res => {
            if (res.status === 401) {
                Router.replace('/login')
                return res
            }

            return res.json()
        })
}

export const useFetch = function <D = any, E = string>(url: string, query = {}) {
    const key = url + qs.stringify(query, { addQueryPrefix: true })
    return useSWR(key, fetcher) as unknown as SWRResponse<D, E>
}

export const get = async function <T>(url: string, query = {}): Promise<RespData<T>> {
    const requestUrl = url + qs.stringify(query, { addQueryPrefix: true })
    const config: RequestInit = { method: 'GET' }

    return fetcher(requestUrl, config) as unknown as Promise<RespData<T>>
}

export const post = async function <T>(url: string, body = {}): Promise<RespData<T>> {
    const config: RequestInit = {
        method: 'POST',
        body: JSON.stringify(body)
    }

    return fetcher(url, config) as unknown as Promise<RespData<T>>
}