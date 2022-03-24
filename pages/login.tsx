import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import { Arrow, Like } from '@react-vant/icons';
import { Card, Image, Button, Toast, Space, Typography, Tag } from 'react-vant';
import { getDiaryConfig } from 'lib/loadConfig';

const Home: NextPage = () => {
  return (
    <div>

    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const config = await getDiaryConfig()
    if (!config) return {
        redirect: { statusCode: 302, destination: '/error/NO_CONFIG' }
    }

    return { props: {} }
}

export default Home