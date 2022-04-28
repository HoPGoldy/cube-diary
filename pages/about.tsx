import { NextPage } from 'next'
import Head from 'next/head'
import { Card, Space, Cell } from 'react-vant'
import { useRouter } from 'next/router'
import { PageContent, PageAction, ActionButton } from 'components/PageWithAction'

const DiaryList: NextPage = () => {
    const router = useRouter()

    return (
        <div className="min-h-screen">
            <Head>
                <title>关于</title>
            </Head>

            <PageContent>
                <Space direction="vertical" gap={16} className="w-screen p-4 overflow-y-scroll">
                    <Card round>
                        <Card.Header style={{ justifyContent: 'center' }}>关于</Card.Header>
                    </Card>

                    <Card round>
                        <Card.Body>
                            简单、可靠、开源、没有广告、没有收费的日记本。
                        </Card.Body>
                    </Card>

                    <Card round>
                        <a href="mailto:hopgoldy@gmail.com?&subject=hoho-diary 相关">
                            <Cell title="联系我" value="hopgoldy@gmail.com" />
                        </a>
                        <a href='https://github.com/HoPGoldy/hoho-diary' target="_blank" rel="noreferrer">
                            <Cell title="开源地址" value="github hoho-diary" />
                        </a>
                    </Card>
                </Space>
                <div className="text-center absolute w-full bottom-0">
                    Power by 💗 Yuzizi
                </div>
            </PageContent>

            <PageAction>
                <ActionButton onClick={() => router.back()}>返回</ActionButton>
            </PageAction>
        </div>
    )
}

export default DiaryList