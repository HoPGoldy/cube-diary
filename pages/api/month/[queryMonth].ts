import type { NextApiRequest, NextApiResponse } from 'next'
import { RespData } from 'types/global'
import { createHandler } from 'lib/utils/createHandler'
import { keyBy } from 'lodash'
import { getMonthExistDate } from 'lib/utils/getMonthExistDate'

export interface DiaryMonthQuery {
    queryMonth: string
}

export interface DiaryMonthResData {
    entries: Array<Diary | UndoneDiary>
}

export interface Diary {
    date: number,
    content: string
}

/**
 * 未完成的日记
 * 会显示成一个按钮让用户填写
 */
 export interface UndoneDiary {
     /**
      * 未完成的日期毫秒时间戳
      */
    date: number
    /**
     * 未完成标识
     */
    undone: true
}

export default createHandler({
    GET: async (req: NextApiRequest, res: NextApiResponse<RespData<DiaryMonthResData>>) => {
        const originDiarys: Diary[] = [{
            date: 1648396800000,
            content: '在鲁迅先生家里作客人，刚开始是从法租界来到虹口，搭电车也要差不多一个钟头的工夫，所以那时候来的次数比较少。记得有一次谈到半夜了，一过十二点电车就没有的，但那天不知讲了些什么，讲到一个段落就看看旁边小长桌上的圆钟，十一点半了，十一点四十五分了，电车没有了。'
        },
        {
            date: 1648310400000,
            content: '中国老例，凡要排斥异己的时候，常给对手起一个诨名，——或谓之“绰号”。这也是明清以来讼师的老手段;假如要控告张三李四，倘只说姓名，本很平常，现在却道“六臂太岁张三”，“白额虎李四”，则先不问事迹，县官只见绰号，就觉得他们是恶棍了。'
        },
        {
            date: 1648224000000,
            content: '我感到未尝经验的无聊，是自此以后的事。我当初是不知其所以然的;后来想，凡有一人的主张，得了赞和，是促其前进的，得了反对，是促其奋斗的，独有叫喊于生人中，而生人并无反应，既非赞同，也无反对，如置身毫无边际的荒原，无可措手的了，这是怎样的悲哀呵，我于是以我所感到者为寂寞。'
        },
        {
            date: 1648137600000,
            content: '我冒了严寒，回到相隔二千余里，别了二十余年的故乡去。'
        },
        {
            date: 1647964800000,
            content: '我所记得的故乡全不如此。我的故乡好得多了。但要我记起他的美丽，说出他的佳处来，却又没有影像，没有言辞了。仿佛也就如此。于是我自己解释说：故乡本也如此，——虽然没有进步，也未必有如我所感的悲凉，这只是我自己心情的改变罢了，因为我这次回乡，本没有什么好心绪。'
        },
        {
            date: 1647878400000,
            content: '老屋离我愈远了;故乡的山水也都渐渐远离了我，但我却并不感到怎样的留恋。我只觉得我四面有看不见的高墙，将我隔成孤身，使我非常气闷;那西瓜地上的银项圈的小英雄的影像，我本来十分清楚，现在却忽地模糊了，又使我非常的悲哀。'
        },
        {
            date: 1647619200000,
            content: '我在朦胧中，眼前展开一片海边碧绿的沙地来，上面深蓝的天空中挂着一轮金黄的圆月。我想：希望是本无所谓有，无所谓无的。这正如地上的路;其实地上本没有路，走的人多了，也便成了路。'
        }]

        const originDiaryEnums = keyBy(originDiarys, diary => diary.date)
        const existDateList = getMonthExistDate(req.query.queryMonth as string)

        const entries: Array<Diary | UndoneDiary> = existDateList.map(date => {
            if (date.toString() in originDiaryEnums) return originDiaryEnums[date]
            return { date, undone: true }
        })

        res.status(200).json({
            success: true,
            data: { entries }
        })
    }
})

