/**
 * 这里包含了一些用于处理后端数据库中父代路径的工具函数
 * 父代路径形如 #1#2#3#，开头和结尾都有一个 #，中间的数字是祖先节点 id，最后一位是父代 id
 */

/**
 * 从父代路径中获取父代 id
 */
export const getParentIdByPath = (path?: string) => {
  if (!path) return undefined;
  const pathArr = path.split('#');
  return +pathArr[pathArr.length - 2];
};

/**
 * 往路径后追加一个 id
 */
export const appendIdToPath = (path: string, id: number) => {
  if (!path) return '#' + id + '#';
  return path + id + '#';
};

/**
 * 从路径中移除一个 id
 */
export const removeIdFromPath = (path: string, id: number) => {
  return path.replace('#' + id + '#', '#');
};

/**
 * 替换父节点 id
 */
export const replaceParentId = (path: string, newId: number) => {
  if (!path) return `#${newId}#`;

  let pathArr: Array<number | string> = path.split('#');
  // 移除开头和结尾两个空元素
  pathArr = pathArr.slice(1, pathArr.length - 1);
  // 替换最后一个元素
  pathArr[pathArr.length - 1] = newId;

  return '#' + pathArr.join('#') + '#';
};

/**
 * 路径转数组
 */
export const pathToArray = (path?: string): number[] => {
  if (!path) return [];
  return path
    .split('#')
    .slice(1, -1)
    .map((id) => +id);
};

/**
 * 数组转路径
 */
export const arrayToPath = (arr: number[]): string => {
  return '#' + arr.join('#') + '#';
};
