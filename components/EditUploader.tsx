import { upload } from 'lib/request'
import { FC, MouseEvent, useState } from 'react'
import { Popup, Uploader, UploaderFileListItem } from 'react-vant'
import { UploaderAfterRead } from 'react-vant/es/uploader/PropsType'

interface Props {
    defaultFiles?: UploaderFileListItem[]
    visible: boolean
    onClose: () => unknown
}

export const EditUploader: FC<Props> = (props) => {
    const { visible, defaultFiles, onClose } = props

    const [files, setFiles] = useState<UploaderFileListItem[]>(defaultFiles || []);

    const onInsert = (item: UploaderFileListItem, event: MouseEvent) => {
        event.stopPropagation()
        console.log('item', item)
    }

    const onUploadFile: UploaderAfterRead = async (items, detail) => {
        console.log('detail', detail)
        console.log('items', items)
        const formData: Record<string, File> = {}

        if (Array.isArray(items)) {
            items.forEach(item => {
                if (!item.file) return
                formData[item.file.name] = item.file
            })
        }
        else {
            if (items.file) formData[items.file.name] = items.file
        }

        const resp = await upload('/api/file/upload', formData)
        console.log('resp', resp)
        
    }

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
                    onChange={setFiles}
                    afterRead={onUploadFile}
                    previewCoverRender={(item) => {
                        return (
                            <div
                                className="absolute bottom-0 w-full text-white text-center bg-gray-700"
                                onClick={(e) => onInsert(item, e)}
                            >填入</div>
                        );
                    }}
                >
                </Uploader>
            </div>
        </Popup>
    )
}