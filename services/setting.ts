import { post } from "lib/request"

/**
 * 刷新字数统计
 * 因为用户的字数是缓存起来的，这里提供一个接口来刷新字数统计
 */
export const refreshCount = async function () {
    return await post<number>('/api/refreshCount')
}
