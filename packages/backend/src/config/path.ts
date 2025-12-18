import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync, mkdirSync } from "fs";
import { ENV_IS_PROD } from "./env";

const __filename = fileURLToPath(import.meta.url);

/**
 * dev 的 __dirname 是 packages/backend/src/config
 * prod 的 __dirname 是 packages/backend/dist
 */
const __dirname = dirname(__filename);

/**
 * 确保所需的目录存在
 */
export const ensurePathExists = (path: string) => {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }

  return path;
};

/**
 * 存储目录
 * 所有持久化的数据都应该放在这个目录下面
 */
export const PATH_ROOT = ensurePathExists(
  ENV_IS_PROD
    ? join(__dirname, "../storage")
    : join(__dirname, "../../storage"),
);

/**
 * 用户上传文件存储目录
 */
export const PATH_USER_FILE = ensurePathExists(join(PATH_ROOT, "user-files"));

/**
 * 用户上传图片缩略图存储目录
 */
export const PATH_USER_FILE_THUMB = ensurePathExists(
  join(PATH_ROOT, "image-thumbs"),
);

/**
 * 静态文件托管目录
 */
export const PATH_FRONTEND_FILE = ensurePathExists(
  ENV_IS_PROD
    ? join(__dirname, "frontend")
    : join(__dirname, "../../../frontend/dist"),
);

/**
 * 日志文件存储目录
 */
export const PATH_LOG = ensurePathExists(join(PATH_ROOT, "logs"));

/**
 * 数据库文件路径
 */
export const PATH_DATABASE = join(PATH_ROOT, "main.db");

/**
 * Prisma 迁移文件目录
 */
export const PATH_MIGRATIONS = ENV_IS_PROD
  ? join(__dirname, "../prisma/migrations")
  : join(__dirname, "../../prisma/migrations");

/**
 * package.json 文件路径
 */
export const PATH_PACKAGE_JSON = ENV_IS_PROD
  ? join(__dirname, "../../../package.json")
  : join(__dirname, "../../../../package.json");
