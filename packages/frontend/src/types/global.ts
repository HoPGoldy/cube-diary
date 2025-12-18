/**
 * 后端接口返回的数据格式
 */
export type AppResponse<T = any> = {
  code?: number;
  message?: string;
  success: boolean;
  data?: T;
};

export type AppListResponse<T = any> = {
  total: number;
  items: T[];
};

/**
 * 通用的表格筛选条件
 */
export interface CommonListQueryDto {
  page?: number;
  size?: number;
  keyword?: string;
}

export interface CommonIdQueryDto {
  id: string;
}
