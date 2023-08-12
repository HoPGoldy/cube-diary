import { AppResponse } from '@/types/global';
import { queryClient } from '../services/base';

/**
 * 把 item 添加到列表中
 *
 * @param listKey 列表在 queryClient 中的 key
 * @param item 要添加的 item
 */
export const addItemToList = <T>(listKey: string, item: T) => {
  const oldData = queryClient.getQueryData<AppResponse<T[]>>(listKey);
  const newData = {
    ...oldData,
    data: [...(oldData?.data || []), item],
  };
  queryClient.setQueryData(listKey, newData);
};

/**
 * 更新列表中的 item
 *
 * @param listKey 列表在 queryClient 中的 key
 * @param newItem 要更新的 item
 * @param findder 如何找到要更新的 item
 */
export const updateItemToList = <T>(listKey: string, newItem: T, findder: (item: T) => boolean) => {
  const oldData = queryClient.getQueryData<AppResponse<T[]>>(listKey);
  const newData = {
    ...oldData,
    data: oldData?.data?.map((i) => (findder(i) ? { ...i, ...newItem } : i)) || [],
  };
  queryClient.setQueryData(listKey, newData);
};

/**
 * 从列表中删除 item
 *
 * @param listKey 列表在 queryClient 中的 key
 * @param findder 如何找到要删除的 item
 */
export const deleteItemFromList = <T>(listKey: string, findder: (item: T) => boolean) => {
  const oldData = queryClient.getQueryData<AppResponse<T[]>>(listKey);
  const newData = {
    ...oldData,
    data: oldData?.data?.filter((i) => !findder(i)) || [],
  };
  queryClient.setQueryData(listKey, newData);
};
