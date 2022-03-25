import useSWR from 'swr'
import qs from 'qs'
import { RespData } from 'types/global'
import { USER_TOKEN_KEY } from './auth'

const fetcher: typeof fetch = (input, requestInit = {}) => {
    const init = {
        ...requestInit,
        headers: {
            [USER_TOKEN_KEY]: localStorage.getItem(USER_TOKEN_KEY) || ''
        }
    }
    
    return fetch(input, init).then(res => res.json())
}

export const useFetch = function (url: string, query = {}) {
    const key = url + qs.stringify(query, { addQueryPrefix: true })
    return useSWR(key, fetcher)
}

export const post = async function <T>(url: string, body = {}): Promise<RespData<T>> {
    const config: RequestInit = {
        method: 'POST',
        body: JSON.stringify(body)
    }

    return fetcher(url, config) as unknown as Promise<RespData<T>>
}