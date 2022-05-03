import { useEffect } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { PageLoading } from 'components/PageLoading';
import { parseCookies } from 'nookies';
import { USER_TOKEN_KEY } from 'lib/constants';

const Home: NextPage = () => {
    const router = useRouter()

    useEffect(() => {
        if (!parseCookies()[USER_TOKEN_KEY]) return
        router.push(`/diary/${dayjs().format('YYYYMM')}`)
    }, [])

    return <PageLoading />
}

export default Home