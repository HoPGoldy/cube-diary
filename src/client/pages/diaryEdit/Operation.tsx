import React, { ChangeEventHandler, useRef, useState } from 'react'
import { LeftOutlined, CloudUploadOutlined, BgColorsOutlined, SaveOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { ActionButton, ActionIcon } from '@/client/layouts/pageWithAction'
import { uploadFiles } from '@/client/services/file'
import { STATUS_CODE } from '@/config'
import { messageError } from '@/client/utils/message'
import { getFileUrl } from '@/client/components/fileUploaderPlugin'
import { ColorPicker, MARK_COLORS_MAP } from '@/client/components/colorPicker'
import { useIsMobile } from '@/client/layouts/responsive'
import { Button, Space } from 'antd'

interface Props {
    diaryDate: number
    diaryUpdating: boolean
    color?: string
    onClickSaveBtn: () => void
    onChangeColor: (color: string) => void
}

export const useOperation = (props: Props) => {
    const { diaryUpdating, color, onClickSaveBtn } = props
    const isMobile = useIsMobile()
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

    const renderColorMark = () => {
        if (!color) return null
        return (
            <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: MARK_COLORS_MAP[color] }}
            ></div>
        )
    }

    const renderTitleOperation = () => {
        if (isMobile) return renderColorMark()

        return (
            <div className="flex flex-row flex-nowrap items-center">
                {renderColorPicker()}
                <Space>
                    {saveBtnText && <span className="text-xs font-normal">{saveBtnText}</span>}
                    {renderColorMark()}
                    <Button
                        icon={<BgColorsOutlined />}
                        onClick={() => setIsColorPickerOpen(true)}
                    >颜色</Button>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={onClickSaveBtn}
                        loading={diaryUpdating}
                    >保存</Button>
                </Space>
            </div>
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
            <ActionIcon icon={<BgColorsOutlined />} onClick={() => setIsColorPickerOpen(true)} />
            <ActionIcon icon={<CloudUploadOutlined />} onClick={() => fileSelectRef.current?.click()} />
            <ActionButton onClick={onClickSaveBtn} loading={diaryUpdating}>
                保存
                {saveBtnText && <span className="ml-2 text-xs">{saveBtnText}</span>}
            </ActionButton>
        </>)
    }

    return {
        renderMobileEditBar,
        renderTitleOperation,
        setSaveBtnText
    }
}