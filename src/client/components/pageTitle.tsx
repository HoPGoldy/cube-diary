import React, { FC } from 'react'
import { Helmet } from 'react-helmet'

interface Props {
    title: string
}

export const PageTitle: FC<Props> = (props) => {
    return (
        <Helmet>
            <title>{props.title} - cubenote</title>
        </Helmet>
    )
}