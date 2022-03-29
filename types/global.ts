export interface RespData<Data = Record<string, any>> {
    success: boolean
    message?: string
    data?: Data
}

export interface DiaryConfig {
    user: UserConfig[]
    passwordLength: number
    writeDiaryButtonColors: string[]
    appTitle: string
    appSubtitle?: string
}

export type FontendConfig = Omit<DiaryConfig, 'user' | 'writeDiaryButtonColors'> & {
    buttonColor: string
}

export interface UserConfig {
    username: string
    password: string
    passwordMd5?: string
}