import fs from 'fs';
import json5 from 'json5';
import { AppConfig } from '@/types/appConfig';
import path from 'path';
import { nanoid } from 'nanoid';
import { ensureFile, readFile, writeFile } from 'fs-extra';

export const getFile = (filePath: string) => {
  try {
    return fs.readFileSync(filePath).toString();
  } catch (e) {
    return '';
  }
};

let configPath: string | null = null;

export const setConfigPath = (path: string) => {
  configPath = path;
};

let cache: AppConfig | undefined = undefined;

export const getAppConfig = () => {
  if (cache) return cache;
  if (!configPath) {
    throw new Error('配置文件路径未设置，启动失败');
  }

  const configResult = getFile(configPath);

  if (!configResult) {
    throw new Error('读取配置文件失败，请确保根目录下存在 config.json 或 config.example.json');
  }

  const config = json5.parse<AppConfig>(configResult);

  cache = config;
  return config;
};

interface CreateFileReaderProps {
  fileName: string;
  getInitData?: () => Promise<string>;
}

let storagePathCache: string | null = null;

export const setBaseStoragePath = (path: string) => {
  storagePathCache = path;
};

/**
 * 获取文件存储路径
 */
export const getStoragePath = (subpath = '') => {
  return path.join(storagePathCache || '', './.storage', subpath);
};

/**
 * 创建本地文件读写器
 */
export const createAccessor = (props: CreateFileReaderProps) => {
  const { fileName, getInitData = async () => nanoid() } = props;
  let cache: string;

  return {
    read: async () => {
      if (cache) return cache;

      // 读取本地文件
      const filePath = getStoragePath(fileName);
      await ensureFile(filePath);
      const content = await readFile(filePath);
      const contentStr = content.toString();
      if (contentStr.length > 0) return (cache = contentStr);

      // 没有内容，填充一下
      const initData = await getInitData();
      await writeFile(filePath, initData);
      return (cache = initData);
    },
    write: async (data: string) => {
      cache = data;

      const filePath = getStoragePath(fileName);
      await ensureFile(filePath);
      await writeFile(filePath, data);
    },
  };
};
