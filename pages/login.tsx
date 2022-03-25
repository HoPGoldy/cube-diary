import type { GetServerSideProps, NextPage } from 'next'
import { PasswordInput, Notify } from 'react-vant'
import { getDiaryConfig } from 'lib/loadConfig'
import { login } from 'services/user'
import { USER_TOKEN_KEY } from 'lib/auth'

interface Props {
    passwordLength: number
}

const Home: NextPage<Props> = (props) => {
    const { passwordLength } = props

    const onSubmit = async (password: string) => {
        // console.log('password', password, md5(password).toString().toUpperCase())
        const resp = await login(password)
        console.log('resp', resp)
        if (!resp.success) {
            Notify.show({ type: 'warning', message: resp.message })
            return
        }

        if (!resp?.data?.token) {
            Notify.show({ type: 'danger', message: '找不到 token！' })
            return
        }
        
        localStorage.setItem(USER_TOKEN_KEY, resp?.data?.token)
        Notify.show({ type: 'success', message: `欢迎回来 ${resp.data.username}` })
    }

    return (
        <div>
            <PasswordInput
                gutter={10}
                info="请输入密码"
                length={passwordLength}
                onSubmit={onSubmit}
            />
        </div>
    )
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
    const config = await getDiaryConfig()

    if (!config) return {
        redirect: { statusCode: 302, destination: '/error/NO_CONFIG' }
    }

    return { props: { passwordLength: config.passwordLength } }
}

export default Home