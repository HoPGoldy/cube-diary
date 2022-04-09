import { useEffect } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { PageLoading } from 'components/PageLoading';

const Home: NextPage = () => {
    const router = useRouter()

    useEffect(() => {
        router.push(`/diary/${dayjs().format('YYYYMM')}`)
    }, [])

    return <PageLoading />
}

export default Home