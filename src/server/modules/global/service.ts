import { DatabaseAccessor } from '@/server/lib/sqlite'
import { AppConfig, AppConfigResp, ColorConfig } from '@/types/appConfig'

interface Props {
    getConfig: () => AppConfig
    db: DatabaseAccessor
}

const getColors = (color: string | ColorConfig): ColorConfig => {
    if (typeof color === 'string') return { buttonColor: color, primaryColor: color }
    return color
}

export const createGlobalService = (props: Props) => {
    const { getConfig, db } = props

    /**
     * 获取当前应用全局配置
     */
    const getAppConfig = async (): Promise<AppConfigResp> => {
        const { DEFAULT_COLOR, APP_NAME, LOGIN_SUBTITLE } = getConfig()
        const randIndex = Math.floor(Math.random() * (DEFAULT_COLOR.length))
        const colors = getColors(DEFAULT_COLOR[randIndex])

        const { ['count(*)']: userCount } = await db.user().count().first() || {}
        const needInit = +userCount <= 0

        const data: AppConfigResp = { appName: APP_NAME, loginSubtitle: LOGIN_SUBTITLE, ...colors }
        if (needInit) data.needInit = true
        return data
    }

    return { getAppConfig }
}

export type GlobalService = ReturnType<typeof createGlobalService>