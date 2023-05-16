import React, { ChangeEventHandler, useRef, useState } from 'react'
import { LeftOutlined, CloudUploadOutlined, BgColorsOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { ActionButton, ActionIcon } from '@/client/layouts/PageWithAction'
import { uploadFiles } from '@/client/services/file'
import { STATUS_CODE } from '@/config'
import { messageError } from '@/client/utils/message'
import { getFileUrl } from '@/client/components/FileUploaderPlugin'
import { ColorPicker } from '@/client/components/ColorPicker'

interface Props {
    diaryDate: number
    diaryUpdating: boolean
    onClickSaveBtn: () => void
    onChangeColor: (color: string) => void
}

export const useOperation = (props: Props) => {
    const { diaryUpdating, onClickSaveBtn } = props

    const navigate = useNavigate()
    /** 保存按钮的文本 */
    const [saveBtnText, setSaveBtnText] = useState('')
    /** 移动端的附件选择器 */
    const fileSelectRef = useRef<HTMLInputElement>(null)
    /** 颜色选择器是否显示 */
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)

    /** 选中颜色选择弹窗 */
    const onSelectedColor = (color: string) => {
        setIsColorPickerOpen(false)
        props.onChangeColor(color)
    }

    /** 渲染颜色选择弹窗 */
    const renderColorPicker = () => {
        return (
            <ColorPicker
                onChange={onSelectedColor}
                visible={isColorPickerOpen}
                onClose={() => setIsColorPickerOpen(false)}
            />
        )
    }

    /** 移动端选中了附件 */
    const onFileSelect: ChangeEventHandler<HTMLInputElement> = async (event) => {
        event.preventDefault()

        const files = event.target.files
        if (!files) return

        const resp = await uploadFiles(files)
        if (resp.code !== STATUS_CODE.SUCCESS || !resp.data) {
            messageError(resp.msg || '上传失败')
            return
        }

        const insertFileText = resp.data.map(getFileUrl).join('\n')

        // 通过 dom 取到 bytemd 内部的 codemirror 实例
        // 然后将上传好的文件链接插入到光标处
        const cm: CodeMirror.Editor = (document.querySelector('.CodeMirror.CodeMirror-wrap') as any)?.CodeMirror
        if (!cm) {
            messageError('获取编辑器失败，无法上传文件')
            return
        }

        cm.replaceSelection(insertFileText)
    }

    /** 渲染移动端在编辑状态下的底部操作栏 */
    const renderMobileEditBar = () => {
        return (<>
            {renderColorPicker()}
            <input
                type="file"
                ref={fileSelectRef}
                style={{ display: 'none' }}
                onChange={onFileSelect}
            ></input>
            <ActionIcon icon={<LeftOutlined />} onClick={() => navigate(-1)} />
            <ActionIcon icon={<CloudUploadOutlined />} onClick={() => fileSelectRef.current?.click()} />
            <ActionIcon icon={<BgColorsOutlined />} onClick={() => setIsColorPickerOpen(true)} />
            <ActionButton onClick={onClickSaveBtn} loading={diaryUpdating}>
                保存
                <span className="ml-2 text-xs">{saveBtnText}</span>
            </ActionButton>
        </>)
    }

    return {
        renderMobileEditBar,
        setSaveBtnText
    }
}