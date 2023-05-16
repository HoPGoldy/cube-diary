import React, { FC, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageContent, PageAction } from '../../layouts/PageWithAction'
import Loading from '../../layouts/Loading'
import { useEditor } from './editor'
import { messageSuccess } from '@/client/utils/message'
import { STATUS_CODE } from '@/config'
import dayjs from 'dayjs'
import s from './styles.module.css'
import { useOperation } from './operation'
import { PageTitle } from '@/client/components/PageTitle'
import { useQueryDiaryDetail, useUpdateDiary } from '@/client/services/diary'
import { getLabelByDate } from '../monthList/listItem'
import { MARK_COLORS_MAP } from '@/client/components/ColorPicker'

const About: FC = () => {
    const params = useParams()
    const navigate = useNavigate()
    const diaryDate = useMemo(() => dayjs(params.date).valueOf(), [params.date])
    const diaryTitle = useMemo(() => getLabelByDate(diaryDate), [diaryDate])
    /** 获取详情 */
    const { data: diaryResp, isFetching: isLoadingArticle } = useQueryDiaryDetail(diaryDate)

    /** 保存详情 */
    const { mutateAsync: updateArticle, isLoading: diaryUpdating } = useUpdateDiary()

    /** 功能 - 编辑器 */
    const { renderEditor, setEditorContent, content } = useEditor({
        onAutoSave: () => operation.setSaveBtnText(`自动保存于 ${dayjs().format('HH:mm')}`),
        diaryDate
    })

    /** 点击保存按钮必定会触发保存，无论内容是否被修改 */
    const onClickSaveBtn = async () => {
        const resp = await updateArticle({ date: diaryDate, content })
        if (resp.code !== STATUS_CODE.SUCCESS) return

        messageSuccess('保存成功')
        navigate(-1)
    }

    /** 保存颜色修改 */
    const onChangeColor = async (color: string) => {
        const resp = await updateArticle({ date: diaryDate, color })
        if (resp.code !== STATUS_CODE.SUCCESS) return

        messageSuccess('颜色修改成功')
    }

    // /** 文章相关的操作 */
    const operation = useOperation({
        diaryDate,
        diaryUpdating,
        onClickSaveBtn,
        onChangeColor,
    })

    useEffect(() => {
        if (!diaryResp?.data) return
        setEditorContent(diaryResp.data.content)
    }, [diaryResp])

    const renderContent = () => {
        if (isLoadingArticle) return <Loading tip='内容加载中...' />

        return (
            <div className="box-border p-4 md:w-full h-full flex flex-col flex-nowrap">
                <div className="font-black text-xl flex flex-row flex-nowrap justify-between items-center">
                    {diaryTitle}
                    {diaryResp?.data?.color &&
                    <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: MARK_COLORS_MAP[diaryResp?.data?.color]}}
                    ></div>}</div>

                <div className={[s.editorArea, s.mdArea].join(' ')}>
                    {renderEditor()}
                </div>
            </div>
        )
    }

    return (<>
        <PageTitle title={'笔记'} />
        <PageContent>
            {renderContent()}
        </PageContent>

        <PageAction>
            {operation.renderMobileEditBar()}
        </PageAction>
    </>)
}

export default About