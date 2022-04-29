import { JsonExportForm } from "@pages/api/export/json"
import { post } from "lib/request"

/**
 * 导出为 json 格式
 * @param form 导出配置项
 */
export const exportAsJson = async function (config: JsonExportForm) {
    return await post<Array<Record<string, string | number>>>('/api/export/json', config)
}
