import { upload } from 'lib/request'
import { forwardRef, MouseEvent, useImperativeHandle, useState } from 'react'
import { Notify, Popup, Uploader, UploaderFileListItem } from 'react-vant'
import { AccessoryUploadResult } from 'types/accessory'

export type Accessory = AccessoryUploadResult & UploaderFileListItem

interface Props {
    /**
     * 默认展示的附件
     */
    defaultFiles?: Accessory[]
    /**
     * 是否显示弹出窗
     * 该组件位于弹出层中
     */
    visible: boolean
    /**
     * 将图片插入正文
     * 会在上传完成和点击“填入”按钮后触发
     */
    onInsert: (accessorys: Accessory[]) => unknown
    /**
     * 弹出层关闭
     */
    onClose: () => unknown
}

export interface EditUploaderRef {
    /**
     * 获取当前包含的附件列表
     */
    getFiles: () => Accessory[]
    /**
     * 设置当前的附件列表
     */
    setFiles: (newFiles: Accessory[]) => void
}

/**
 * 判断一个附件是否包含 id 等相关信息
 */
const isAccessory = (file: Partial<Accessory>): file is Accessory => {
    const hasProp = file.id !== undefined && file.name !== undefined && file.url !== undefined
    if (!hasProp) console.error('未通过 isAccessory 检查', file)
    return hasProp
}

/**
 * 日记编辑页面附件上传组件
 */
export const EditUploader = forwardRef<EditUploaderRef, Props>((props, ref) => {
    const { visible, defaultFiles, onClose, onInsert } = props

    const [files, setFiles] = useState<Accessory[]>(defaultFiles || []);

    const innerOnInsert = (items: Partial<Accessory>[], event?: MouseEvent) => {
        event?.stopPropagation()
        onInsert(items.filter(isAccessory))
    }

    /**
     * 单个日记内不允许上传同名文件
     */
    const beforeRead = (file: File | File[]) => {
        const newFiles = Array.isArray(file) ? file : [file];
        const existFileNames = files.map(file => file.file?.name);

        return new Promise<File[]>((resolve) => {
            const passFiles = newFiles.filter((f) => {
                if (existFileNames.includes(f.name)) {
                    Notify.show({ type: 'warning', message: `不可上传同名文件 ${f.name}` })
                    return false;
                }
                return true;
            });
            resolve(passFiles);
        });
    }

    /**
     * 将文件上传至服务器
     */
    const onUploadFile = async (items: UploaderFileListItem) => {
        const newItems = Array.isArray(items) ? items : [items]
        const formData: Record<string, File> = {}
        newItems.forEach(item => {
            if (!item.file) return
            formData[item.file.name] = item.file
        })

        setFiles([...files, ...newItems.map(item => ({ ...item, status: 'uploading' }))])

        try {
            const resp = await upload<Accessory[]>('/api/file/upload', formData)
            if (!resp.success) {
                Notify.show({ type: 'warning', message: '上传失败' })
                return
            }

            let newFiles: Accessory[] = []
            setFiles(oldFiles => {
                newFiles = oldFiles.map(f => {
                    const matchedFile = (resp.data || []).find(r => r.name === f.file?.name)
                    if (!matchedFile) return f
                    return { ...f, ...matchedFile, status: matchedFile.success ? 'done' : 'failed' }
                })

                return newFiles
            })

            innerOnInsert(newFiles)
            onClose()
        }
        catch (e) {
            console.error(e)
            const failedItemNames = newItems.map(item => item.file?.name)

            setFiles(oldFiles => {
                const newFiles = oldFiles.map(f => {
                    if (!failedItemNames.includes(f.file?.name)) return f
                    return { ...f, status: 'failed' }
                })

                return newFiles
            })
        }
    }

    /**
     * 删除一个文件
     */
    const onDeleteFile = (file: UploaderFileListItem, detail: { index: number }) => {
        const newFiles = [...files]
        newFiles.splice(detail.index, 1)
        setFiles(newFiles)
    }

    useImperativeHandle(ref, () => ({
        getFiles: () => [...files],
        setFiles
    }), [files])

    return (
        <Popup
            round
            className='text-mainColor'
            visible={visible}
            position="bottom"
            onClose={onClose}
            title={<b>图片上传</b>}
        >
            <div className="w-auto m-4">
                <Uploader
                    multiple
                    value={files}
                    beforeRead={beforeRead}
                    afterRead={onUploadFile}
                    onDelete={onDeleteFile}
                    previewCoverRender={(item) => (
                        <div
                            className="absolute bottom-0 w-full text-white text-center bg-gray-700"
                            onClick={(e) => innerOnInsert([item], e)}
                        >填入</div>
                    )}
                >
                </Uploader>
            </div>
        </Popup>
    )
})