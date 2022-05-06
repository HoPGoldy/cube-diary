/**
 * 接口返回 json 的标准格式
 */
export interface RespData<Data = Record<string, any>> {
    /**
     * 接口执行是否成功
     */
    success: boolean
    /**
     * 接口执行信息，当执行不成功时该值为报错信息
     */
    message?: string
    /**
     * 接口执行结果
     */
    data?: Data
}
