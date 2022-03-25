import { LoginResData } from "@pages/api/user"
import md5 from "crypto-js/md5"
import { post } from "lib/request"

export const login = async function (password: string) {
    return await post<LoginResData>('/api/user', {
        code: md5(password).toString().toUpperCase()
    })
}