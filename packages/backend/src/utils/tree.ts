/**
 * 将路径字符串转换为数组
 * "#1#2#3#" -> ["1", "2", "3"]
 */
export const pathToArray = (path: string | null | undefined): string[] => {
  if (!path) return [];
  return path.split("#").filter(Boolean);
};

/**
 * 将数组转换为路径字符串
 * ["1", "2", "3"] -> "#1#2#3#"
 */
export const arrayToPath = (arr: string[]): string => {
  if (arr.length === 0) return "";
  return "#" + arr.join("#") + "#";
};

/**
 * 在路径后追加一个 ID
 * ("#1#2#", "3") -> "#1#2#3#"
 */
export const appendIdToPath = (
  parentPath: string | null | undefined,
  id: string,
): string => {
  return (parentPath || "") + id + "#";
};

/**
 * 从路径中获取父级 ID
 * "#1#2#3#" -> "3"
 */
export const getParentIdByPath = (
  path: string | null | undefined,
): string | undefined => {
  const arr = pathToArray(path);
  return arr.length > 0 ? arr[arr.length - 1] : undefined;
};

/**
 * 从路径中获取路径数组的所有 ID
 * "#1#2#3#" -> ["1", "2", "3"]
 */
export const getIdsFromPath = (path: string | null | undefined): string[] => {
  return pathToArray(path);
};
