import { requestGet, requestPost } from "./base";
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  SchemaAttachmentInfoType,
  SchemaAccessTokenResponseType,
} from "@shared-types/attachment";

export const useGetFileInfo = (fileId: string) => {
  return useQuery({
    queryKey: ["attachments/info", fileId],
    enabled: !!fileId,
    queryFn: () =>
      requestPost<SchemaAttachmentInfoType>("attachments/info", { id: fileId }),
  });
};

export const useUploadFile = () => {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return requestPost("attachments/upload", formData);
    },
  });
};

/**
 * 主动获取文件访问链接
 * 用在下载场景
 */
export const useRequestFileUrl = () => {
  return useMutation({
    mutationFn: (fileId: string) => {
      return requestGet<SchemaAccessTokenResponseType>(
        `attachments/request/${fileId}`,
      );
    },
  });
};
