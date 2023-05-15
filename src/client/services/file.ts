import { UploadedFile } from '@/types/file'
import { AppResponse } from '@/types/global'
import { axiosInstance } from './base'

export const uploadFiles = async (fileList: FileList) => {
    const formData = new FormData()
    const files = Array.from(fileList)
    files.forEach(file => formData.append('file', file))
  
    const result = await axiosInstance.request<AppResponse<UploadedFile[]>>({
        method: 'post',
        url: 'file/upload',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
    })

    return result.data
}