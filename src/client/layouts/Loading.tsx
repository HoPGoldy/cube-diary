import React, { FC, useState, useEffect } from 'react'

interface Props {
    tip?: string
    delay?: number
    className?: string
}

const Loading: FC<Props> = ({ tip = '页面加载中...', delay = 500, className }) => {
    const [showTip, setShowTip] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setShowTip(true), delay)
        return () => clearTimeout(timer)
    }, [])

    return showTip ? (
        <div className={'w-full flex justify-center items-center dark:text-gray-400 ' + className}>
            {tip}
        </div>
    ) : null
}

export default Loading