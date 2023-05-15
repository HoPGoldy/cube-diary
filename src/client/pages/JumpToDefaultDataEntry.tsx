import React from 'react'
import { Navigate } from 'react-router-dom'
import dayjs from 'dayjs'

const JumpToDefaultDataEntry = () => {
    // 获取当前月份
    const month = dayjs().format('YYYYMM')

    return (
        <Navigate to={`/month/${month}`} replace />
    )
}

export default JumpToDefaultDataEntry