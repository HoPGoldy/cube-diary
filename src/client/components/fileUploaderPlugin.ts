import type { BytemdPlugin } from 'bytemd'
import { uploadFiles } from '@/client/services/file'
import { STATUS_CODE } from '@/config'
import { messageError } from '@/client/utils/message'
import { UploadedFile } from '@/types/file'
import gfm from '@bytemd/plugin-gfm'
// import mediumZoom from '@bytemd/plugin-medium-zoom'
import highlight from '@bytemd/plugin-highlight'

export const getFileUrl = (file: UploadedFile) => {
    // 后缀名
    const suffix = file.filename?.split('.')?.pop()
    const isImg = ['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(suffix?.toLocaleLowerCase() || 'unknown')
    return `\n${isImg ? '!' : ''}[${file.filename}](api/file/get?hash=${file.md5})`
}

const FILE_ICON_CONFIG = [
    // word
    { suffix: ['doc', 'docx'], icon: 'file_word' },
    // excel
    { suffix: ['xls', 'xlsx'], icon: 'file_excel' },
    // ppt
    { suffix: ['ppt', 'pptx'], icon: 'file_ppt' },
    // pdf
    { suffix: ['pdf'], icon: 'file_pdf' },
    // 压缩包
    { suffix: ['zip', 'rar', '7z', 'tar', 'gz'], icon: 'file_zip' },
    // txt
    { suffix: ['txt'], icon: 'file_text' },
    // 视频
    { suffix: ['mp4', 'avi', 'rmvb', 'rm', 'flv', 'wmv', 'mov', 'mkv', 'mpg', 'mpeg'], icon: 'file_video' },
    // 音频
    { suffix: ['mp3', 'wav', 'wma', 'ogg', 'ape', 'flac'], icon: 'file_audio' },
    // 可执行文件
    { suffix: ['exe', 'msi'], icon: 'file_exe' },
    // psd
    { suffix: ['psd'], icon: 'file_psd' },
    // 图片
    { suffix: ['png', 'jpg', 'jpeg', 'gif', 'bmp'], icon: 'file_img' },
]

const getFileIcon = (suffix?: string) => {
    if (!suffix) return 'file_cloud'

    const config = FILE_ICON_CONFIG.find((item) => item.suffix.includes(suffix))
    return config?.icon || 'file_cloud'
}

const defaultRenderLink = (link: HTMLAnchorElement) => {
    // 通过后缀名获取 icon
    const suffix = link.innerText?.split(']')?.[0]?.split('.')?.pop()

    link.target = '_blank'
    link.innerHTML = `
        <div
            class="
                rounded p-3 my-2 flex 
                bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 hover:dark:bg-neutral-700
                transition-all overflow-hidden items-center bytemd-link-box"
        >
            <svg class="icon flex-shrink-0" aria-hidden="true" style="font-size: 1.75rem;">
                <use xlink:href="#icon-${getFileIcon(suffix)}"></use>
            </svg>
            <div class="text-slate-800 dark:text-neutral-200 font-bold truncate ml-2">${link.innerText || link.href}</div>
        </div>
    `
}

const uploadFunc = async (cm: CodeMirror.Editor, files: FileList) => {
    const resp = await uploadFiles(files)
    if (resp.code !== STATUS_CODE.SUCCESS || !resp.data) {
        messageError(resp.msg || '上传失败')
        return
    }

    const insertFileText = resp.data.map(getFileUrl).join('\n')
    cm.replaceSelection(insertFileText)
}

const pasteFileCallback = async (cm: CodeMirror.Editor, e: ClipboardEvent) => {
    if (!e.clipboardData?.files) return
    uploadFunc(cm, e.clipboardData?.files)
}

const dropFileCallback = async (cm: CodeMirror.Editor, e: DragEvent) => {
    if (!e.dataTransfer?.files) return
    uploadFunc(cm, e.dataTransfer?.files)
}

export const fileUploader = (): BytemdPlugin => {
    return {
        editorEffect: (ctx) => {
            ctx.editor.off('paste' as any, pasteFileCallback)
            ctx.editor.on('paste' as any, pasteFileCallback)
            ctx.editor.off('drop', dropFileCallback)
            ctx.editor.on('drop', dropFileCallback)
        },
        viewerEffect: (ctx) => {
            const { markdownBody } = ctx
            const links = markdownBody.querySelectorAll('a')
            links.forEach(link => {
                const parent = link.parentElement
                // 单独一行的链接才渲染
                if (parent?.childNodes.length !== 1 || parent?.tagName === 'LI') return
                defaultRenderLink(link)
            })
        }
    }
}

export const plugins = [
    gfm(),
    highlight(),
    // 官方的 mediumZoom 插件有时候会有图被遮罩盖住的问题，所以用的 antd 的图片预览
    // mediumZoom(),
    fileUploader()
]