import React, { FC, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageContent, PageAction } from '../../layouts/pageWithAction'
import Loading from '../../layouts/loading'
import { useEditor } from './editor'
import { messageSuccess } from '@/client/utils/message'
import { STATUS_CODE } from '@/config'
import dayjs from 'dayjs'
import s from './styles.module.css'
import { useOperation } from './operation'
import { PageTitle } from '@/client/components/pageTitle'
import { useQueryDiaryDetail, useUpdateDiary } from '@/client/services/diary'
import { getLabelByDate } from '../monthList/listItem'
import { useAppDispatch } from '@/client/store'
import { setFocusDiaryDate } from '@/client/store/global'

const DiaryEdit: FC = () => {
    const params = useParams()
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const diaryDate = useMemo(() => dayjs(params.date).valueOf(), [params.date])
    const diaryTitle = useMemo(() => getLabelByDate(diaryDate), [diaryDate])
    /** 获取详情 */
    const { data: diaryResp, isFetching: isLoadingDiary } = useQueryDiaryDetail(diaryDate)
    /** 保存详情 */
    const { mutateAsync: updateDiary, isLoading: diaryUpdating } = useUpdateDiary()

    /** 功能 - 编辑器 */
    const { renderEditor, setEditorContent, content } = useEditor({
        onAutoSave: () => operation.setSaveBtnText(`自动保存于 ${dayjs().format('HH:mm')}`),
        diaryDate
    })

    /** 点击保存按钮必定会触发保存，无论内容是否被修改 */
    const onClickSaveBtn = async () => {
        const resp = await updateDiary({ date: diaryDate, content })
        if (resp.code !== STATUS_CODE.SUCCESS) return

        messageSuccess('保存成功')
        dispatch(setFocusDiaryDate(diaryDate?.toString()))
        navigate(-1)
    }

    /** 保存颜色修改 */
    const onChangeColor = async (color: string) => {
        const resp = await updateDiary({ date: diaryDate, color })
        if (resp.code !== STATUS_CODE.SUCCESS) return

        messageSuccess('颜色修改成功')
    }

    // /** 文章相关的操作 */
    const operation = useOperation({
        diaryDate,
        color: diaryResp?.data?.color,
        diaryUpdating,
        onClickSaveBtn,
        onChangeColor,
    })

    useEffect(() => {
        if (!diaryResp?.data) return
        setEditorContent(diaryResp.data.content)
    }, [diaryResp])

    const renderContent = () => {
        if (isLoadingDiary) return <Loading tip='内容加载中...' />

        return (
            <div className="box-border p-4 md:w-full h-full flex flex-col flex-nowrap">
                <div className="font-black text-xl flex flex-row flex-nowrap justify-between items-center">
                    {diaryTitle}
                    {operation.renderTitleOperation()}
                </div>

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

export default DiaryEdit