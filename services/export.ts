import { JsonExportForm } from "@pages/api/export/json"
import { LoginResData } from "@pages/api/user"
import { post } from "lib/request"
import { UserProfile } from "types/storage"

/**
 * 用户登陆
 * @param password 用户输入的密码明文
 */
export const exportAsJson = async function (config: JsonExportForm) {
    return await post<Array<Record<string, string | number>>>('/api/export/json', config)
}
