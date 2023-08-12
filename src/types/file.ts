export interface FileStorage {
  id: number;
  md5: string;
  filename: string;
  createUserId: number;
  createTime: number;
  size: number;
  type: string;
}

export interface UploadedFile {
  filename: string;
  type: string;
  tempPath: string;
  size: number;
  md5: string;
}
