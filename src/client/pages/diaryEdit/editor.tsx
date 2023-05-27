import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Editor as MdEditor } from '@bytemd/react'
import { plugins } from '@/client/components/fileUploaderPlugin'
import debounce from 'lodash/debounce'
import { STATUS_CODE } from '@/config'
import { messageError } from '@/client/utils/message'
import { useIsMobile } from '@/client/layouts/responsive'
import zh_Hans from 'bytemd/locales/zh_Hans.json'
import { autoSaveContent } from '@/client/services/diary'

interface Props {
    onAutoSave?: () => void
    diaryDate: number
}

export const useEditor = (props: Props) => {
    const isMobile = useIsMobile()
    // 正在编辑的文本内容
    const [content, setContent] = useState('')
    // 内容是否被编辑了
    const isContentModified = useRef(false)
    // 自动保存的引用，防止闭包陷阱
    const contentRef = useRef(content)

    useEffect(() => {
        contentRef.current = content
    }, [content])

    // 自动保存
    const autoSave = async (diaryDate: number) => {
        if (!isContentModified.current) return

        const resp = await autoSaveContent(diaryDate, contentRef.current)
        if (resp.code !== STATUS_CODE.SUCCESS) {
            messageError('自动保存失败')
            localStorage.setItem('diary-autosave-content', content)
            localStorage.setItem('diary-autosave-id', diaryDate.toString())
            localStorage.setItem('diary-autosave-date', Date.now().toString())
            return
        }

        props.onAutoSave?.()
    }

    // 编辑时的节流
    const onContentChangeThrottle = useMemo(() => debounce(() => {
        autoSave(props.diaryDate)
    }, 1000), [props.diaryDate])

    // 编辑时触发节流
    const onContentChange = (newContent: string) => {
        setContent(newContent)
        isContentModified.current = true
        onContentChangeThrottle()
    }

    const renderEditor = () => {
        return (
            <MdEditor
                value={content}
                mode={isMobile ? 'tab' : 'split'}
                plugins={plugins}
                locale={zh_Hans}
                onChange={onContentChange}
            />
        )
    }

    return { renderEditor, setEditorContent: setContent, content, isContentModified }
}
