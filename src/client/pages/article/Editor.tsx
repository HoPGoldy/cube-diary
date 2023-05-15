import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Editor as MdEditor } from '@bytemd/react'
import { plugins } from '@/client/components/FileUploaderPlugin'
import debounce from 'lodash/debounce'
import { autoSaveContent } from '@/client/services/article'
import { STATUS_CODE } from '@/config'
import { messageError } from '@/client/utils/message'
import { useIsMobile } from '@/client/layouts/Responsive'
import zh_Hans from 'bytemd/locales/zh_Hans.json'

interface Props {
    onAutoSave: () => void
    articleId: number
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
    const autoSave = async (id: number) => {
        const resp = await autoSaveContent(id, contentRef.current)
        if (resp.code !== STATUS_CODE.SUCCESS) {
            messageError('自动保存失败')
            localStorage.setItem('article-autosave-content', content)
            localStorage.setItem('article-autosave-id', id.toString())
            localStorage.setItem('article-autosave-date', Date.now().toString())
            return
        }

        props.onAutoSave()
    }

    // 编辑时的节流
    const onContentChangeThrottle = useMemo(() => debounce(() => {
        autoSave(props.articleId)
    }, 1000), [props.articleId])

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
