import { useContext } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { Card, Dialog, Space, Cell, Notify } from 'react-vant'
import { useRouter } from 'next/router'
import { UserConfigContext } from './_app'
import { PageContent, PageAction, ActionButton } from 'components/PageWithAction'
import { useBackupList, rollbackTo } from 'services/backup'
import { PageLoading } from 'components/PageLoading'
import { BackupDetail } from 'types/storage'
import dayjs from 'dayjs'

const DiaryList: NextPage = () => {
    const router = useRouter()
    const { buttonColor } = useContext(UserConfigContext) || {}
    const { data, error, mutate } = useBackupList()

    const confirmRollback = async (item: BackupDetail) => {
        await Dialog.confirm({
            title: '备份恢复',
            message: `确定要恢复于 ${dayjs(item.date).format('YYYY-MM-DD HH:mm')} 创建的${item.title}吗？`
             + `\n\n恢复前将创建回滚备份，可随时通过该备份还原当前状态。`,
        });

        const resp = await rollbackTo(item.date)
        console.log('resp', resp)
        if (!resp.success) {
            mutate()
            Notify.show({ type: 'warning', message: resp.message })
            return
        }
    }

    const renderBackupItem = (item: BackupDetail) => {
        return (
            <Cell
                valueClass="min-w-[50%] py-1"
                title={item.title}
                key={item.date}
                value={dayjs(item.date).format('YYYY-MM-DD HH:mm')}
                onClick={() => confirmRollback(item)}
                center
                isLink
            />
        )
    }

    const renderList = () => {
        if (!data && !error) return <PageLoading />

        if (data?.data?.entries && data.data.entries.length <= 0) {
            return (
                <div className="text-center text-gray-500 my-6">
                    <div>暂无备份</div>
                    <div>备份将默认在每日的凌晨 4 点创建</div>
                </div>
            )
        }

        return (
            <Card round>
                {data?.data?.entries?.map(renderBackupItem)}
            </Card>
        )
    }

    return (
        <div className="min-h-screen">
            <Head>
                <title>备份管理</title>
            </Head>

            <PageContent>
                <Space direction="vertical" gap={16} className="w-screen p-4 overflow-y-scroll">
                    <Card round>
                        <Card.Header style={{ justifyContent: 'center' }}>备份管理</Card.Header>
                    </Card>

                    {renderList()}
                </Space>
            </PageContent>

            <PageAction>
                <ActionButton color={buttonColor} onClick={() => router.back()}>返回</ActionButton>
            </PageAction>
        </div>
    )
}

export default DiaryList