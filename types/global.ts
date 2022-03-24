export interface RespData<Data = Record<string, any>> {
    success: boolean
    message?: string
    data: Data
}