import React, { FC, MouseEventHandler } from 'react'
import { Viewer } from '@bytemd/react'
import { plugins } from '@/client/components/FileUploaderPlugin'
import { Image } from 'antd'

interface Props {
    value: string
}

const Preview: FC<Props> = (props) => {
    /** 当前正在预览的图片链接 */
    const [visibleImgSrc, setVisibleImgSrc] = React.useState('')

    const onClickDetail: MouseEventHandler<HTMLDivElement> = (e) => {
        const target = (e.target as HTMLImageElement)
        if (target?.tagName === 'IMG') {
            setVisibleImgSrc(target.src)
        }
    }

    return (
        <div
            className="w-full xl:w-[60%] m-auto"
            onClick={onClickDetail}
        >
            <Viewer value={props.value} plugins={plugins} />
            <Image
                style={{ display: 'none' }}
                preview={{
                    visible: !!visibleImgSrc,
                    src: visibleImgSrc,
                    onVisibleChange: () => setVisibleImgSrc(''),
                }}
            />
        </div>
    )
}

export default Preview