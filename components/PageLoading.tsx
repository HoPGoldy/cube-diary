import { FC } from 'react'
import { Loading } from 'react-vant'

export const PageLoading: FC = () => {
    return <Loading className="my-24" color="#3f45ff" size="36px" vertical>加载中...</Loading>
}
