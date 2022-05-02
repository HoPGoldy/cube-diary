import dayjs from "dayjs"
import { useRouter } from "next/router"
import { FC } from "react"
import { Notify, PullRefresh } from "react-vant"
import { PullupRefresh } from "./PullupRefresh"

/**
 * 提供了日记列表的上拉下拉跳转到其他月份的功能
 */
export const PullContainer: FC = function (props) {
    const router = useRouter()

    /**
     * 跳转到上个月
     */
    const goToPrevious = () => {
        const queryMonth = router.query.month as string
        const preMonth = dayjs(queryMonth, 'YYYYMM')
        router.push(`/diary/${preMonth.subtract(1, 'M').format('YYYYMM')}`)
    }

    /**
     * 跳转到下个月
     */
    const goToNext = () => {
        const queryMonth = router.query.month as string
        if (queryMonth === dayjs().format('YYYYMM')) {
            Notify.show({ type: 'primary', message: '已经是最新一月了哦' })
            return
        }
        const preMonth = dayjs(queryMonth, 'YYYYMM')
        router.push(`/diary/${preMonth.add(1, 'M').format('YYYYMM')}`)
    }

    return (
        <PullRefresh
            loosingText="释放查看上个月日记"
            pullingText="上个月"
            pullDistance="150"
            onRefresh={goToPrevious}
            className="h-full"
        >
            <PullupRefresh
                loosingText="释放查看下个月日记"
                pullingText="下个月"
                pullDistance="150"
                onRefresh={goToNext}
            >
                {props.children}
            </PullupRefresh>
        </PullRefresh>
    )
}