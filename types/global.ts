export interface RespData<Data = Record<string, any>> {
    success: boolean
    message?: string
    data?: Data
}

export interface DiaryConfig {
    user: UserConfig[]
    passwordLength: number
}

export interface UserConfig {
    username: string
    password: string
    passwordMd5?: string
}