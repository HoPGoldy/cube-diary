import dotenvFlow from "dotenv-flow";
import { nanoid } from "nanoid";

dotenvFlow.config();

const getEnv = (key: string, defaultValue: string): string => {
  return process.env[key] ?? defaultValue;
};

export const EnumEnvType = {
  Development: "development",
  Production: "production",
} as const;

/** 是否为生产环境 */
export const ENV_IS_PROD =
  getEnv("NODE_ENV", "development") === EnumEnvType.Production;

/** 是否为开发环境 */
export const ENV_IS_DEV =
  getEnv("NODE_ENV", "development") === EnumEnvType.Development;

/** jwt 的签发秘钥 */
export const ENV_JWT_SECRET = getEnv("BACKEND_JWT_SECRET", nanoid());

/** 后端服务监听的端口 */
export const ENV_BACKEND_PORT = +getEnv("BACKEND_PORT", "3499");

/** 前端部署到的基础路径 */
export const ENV_FRONTEND_BASE_URL = getEnv("FRONTEND_BASE_URL", "/");

/** 用户登录密码 */
export const ENV_BACKEND_LOGIN_PASSWORD = (() => {
  let pwd = getEnv("BACKEND_LOGIN_PASSWORD", "");
  if (!pwd) {
    pwd = nanoid(12);
    console.warn(
      `[password] A random login password has been generated: ${pwd}`,
    );
    console.warn(
      "[password] This can be set using the BACKEND_LOGIN_PASSWORD environment variable.",
    );
  }

  return pwd;
})();
