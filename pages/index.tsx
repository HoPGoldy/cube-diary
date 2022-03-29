import { useEffect } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { Loading } from 'react-vant';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';

const Home: NextPage = () => {
    const router = useRouter()

    useEffect(() => {
        router.push(`/diary/${dayjs().format('YYYYMM')}`)
    }, [router])

    return (
        <Loading className="mt-24" color="#3f45ff" size="48px" vertical>加载中...</Loading>
    )
}

export default Home