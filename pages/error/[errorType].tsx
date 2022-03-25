import { NextPage } from 'next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Empty, Button } from 'react-vant';

const ERROR_INFO: Record<string, string> = {
    NO_CONFIG: '配置项读取失败，请检查根目录下是否存在 config.json',
    AUTH_ERROR: '鉴权失败',
    DEFAULT: '系统异常，请刷新重试'
}

const ErrorPage: NextPage = () => {
    const router = useRouter()
    const { errorType } = router.query

    const description = (!errorType || typeof errorType === 'object')
        ? ERROR_INFO.DEFAULT
        : ERROR_INFO[errorType] || ERROR_INFO.DEFAULT

    return (
        <Empty
            style={{ textAlign: 'center' }}
            image="error"
            description={description}
        >
            <Link href="/" passHref>
                <div>
                    <Button style={{ width: 160 }} round type="primary">
                        刷新
                    </Button>
                </div>
            </Link>
        </Empty>
    )
}

export default ErrorPage