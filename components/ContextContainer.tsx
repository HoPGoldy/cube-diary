import { createContext, Dispatch, FC, SetStateAction, useEffect } from 'react'
import { useAppConfig, useUserProfile } from 'services/user'
import { FontendConfig } from 'types/appConfig'
import { UserProfile } from 'types/user'
import { PageLoading } from './PageLoading'

export const UserConfigContext = createContext<FontendConfig | false | undefined>(undefined)

interface IUserProfileContext {
    userProfile: UserProfile | undefined
    setUserProfile: Dispatch<SetStateAction<UserProfile | undefined>>;
}

export const UserProfileContext = createContext<IUserProfileContext | undefined>(undefined)

/**
 * 全局上下文容器
 * 包含用户信息和 app 配置信息
 */
export const ContextContainer: FC = (props) => {
    const { children } = props

    const config = useAppConfig()
    const userInfo = useUserProfile()

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', userInfo.userProfile?.darkTheme ? 'dark' : '')
    }, [userInfo.userProfile?.darkTheme])

    return (
        <UserProfileContext.Provider value={userInfo}>
            <UserConfigContext.Provider value={config}>
                {config !== undefined ? children : <PageLoading />}
            </UserConfigContext.Provider>
        </UserProfileContext.Provider>
    )
}