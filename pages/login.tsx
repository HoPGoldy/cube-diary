import type { GetServerSideProps, NextPage } from 'next'
import { PasswordInput } from 'react-vant'
import { getDiaryConfig } from 'lib/loadConfig'
import md5 from 'crypto-js/md5'

interface Props {
    passwordLength: number
}

const Home: NextPage<Props> = (props) => {
    const { passwordLength } = props

    const onSubmit = (password: string) => {
        console.log('password', password, md5(password).toString().toUpperCase())
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