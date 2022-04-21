import dayjs from "dayjs"

/**
 * json 导入配置项
 */
export interface ExampleForm {
    /**
     * 日期字段名
     */
    dateKey: string
    /**
     * 日记内容名
     */
    contentKey: string
    /**
     * 日期字段解析
     */
    dateFormatter: string
}

/**
 * 为导入导出为 json 创建示例
 */
export const createExample = (formValues: ExampleForm): string => {
    const newExamples = Array.from({ length: 3 }).map((_, index) => {
        const date = dayjs().subtract(index, 'd').startOf('day')
        return {
            [formValues.dateKey || 'date']: formValues.dateFormatter ? date.format(formValues.dateFormatter) : date.valueOf(),
            [formValues.contentKey || 'content']: `这是 ${date.format('YYYY 年 MM 月 DD 日的一篇日记')}`
        }
    })

    return '```json\n' + JSON.stringify(newExamples, null, 2) + '\n```'
}