import { requestGet, requestPost } from './base'
import { AppTheme, ChangePasswordReqData, LoginReqData, LoginResp, RegisterReqData } from '@/types/user'
import { useQuery, useMutation } from 'react-query'

/** 查询用户信息 */
export const useQueryUserInfo = (enabled: boolean) => {
    return useQuery('userInfo', () => {
        return requestGet<LoginResp>('user/getInfo')
    }, {
        enabled,
        // 不能缓存获取用户信息，不然用户重新登录后会使用缓存的用户信息（即错误的显示了上个用户的信息）
        cacheTime: 0
    })
}

/** 登录 */
export const useLogin = () => {
    return useMutation((data: LoginReqData) => {
        return requestPost<LoginResp>('user/login', data)
    })
}

/** 创建管理员账号 */
export const useCreateAdmin = () => {
    return useMutation((data: LoginReqData) => {
        return requestPost('user/createAdmin', data)
    })
}

/** 注册用户 */
export const useRegister = () => {
    return useMutation((data: RegisterReqData) => {
        return requestPost('user/register', data)
    })
}


/** 统计文章 */
export const useQueryArticleCount = () => {
    return useQuery('userStatistic', () => {
        return requestGet('user/statistic')
    })
}

/** 修改密码 */
export const useChangePassword = () => {
    return useMutation((data: ChangePasswordReqData) => {
        return requestPost('user/changePwd', data)
    })
}

/** 设置主题色 */
export const useSetTheme = () => {
    return useMutation((theme: AppTheme) => {
        return requestPost('user/setTheme', { theme })
    })
}