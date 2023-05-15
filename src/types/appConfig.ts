/**
 * 后端发给前端的应用配置
 */
export interface AppConfigResp {
    /**
     * 主按钮颜色
     */
    buttonColor: string
    /**
     * 项目主题色
     */
    primaryColor: string
    /**
     * 应用名
     */
    appName: string
    /**
     * 登录页副标题
     */
    loginSubtitle: string
    /**
     * 是否已完成初始化
     */
    needInit?: boolean
}

export interface ColorConfig {
    /** 主题色 */
    primaryColor: string
    /** 主按钮背景色 */
    buttonColor: string
}

export interface AppConfig {
    DEFAULT_COLOR: Array<string | ColorConfig>
    APP_NAME: string
    LOGIN_SUBTITLE: string
}

export interface UserDataInfoResp {
    articleCount: number
}
