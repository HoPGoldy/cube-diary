import CryptoJS from "crypto-js";
import bcrypt from "bcryptjs";

/**
 * 获取 sha512 hash
 */
export const shaWithSalt = (str: string, saltValue: string) => {
  const salt = CryptoJS.SHA512(saltValue).toString(CryptoJS.enc.Hex);
  const saltedMessage = salt + str;
  const hash = CryptoJS.SHA512(saltedMessage);
  return hash.toString(CryptoJS.enc.Hex).toUpperCase();
};

/**
 * bcrypt 摘要存储
 * 落库的密码都要使用这个函数处理一下
 */
export const hashPassword = (password: string) => {
  return bcrypt.hashSync(password, 10);
};
