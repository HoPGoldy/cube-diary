import CryptoJS from "crypto-js";

const { SHA256, AES, MD5, enc, mode, pad } = CryptoJS;

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
 * 将密码转换为 aes 加密需要的 key 和初始向量
 */
export const getAesMeta = (password: string) => {
  const key = enc.Utf8.parse(MD5(password).toString());
  const iv = enc.Utf8.parse(SHA256(password).toString());

  return { key, iv };
};

/**
 * 验证 aes 加密信息
 * 用于判断 key 和 iv 是否是从这个密码生成的
 */
export const validateAesMeta = (
  password: string,
  key: CryptoJS.lib.WordArray,
  iv: CryptoJS.lib.WordArray,
) => {
  const newKey = enc.Utf8.parse(MD5(password).toString());
  const newIv = enc.Utf8.parse(SHA256(password).toString());

  if (enc.Utf8.stringify(newKey) !== enc.Utf8.stringify(key)) return false;
  if (enc.Utf8.stringify(newIv) !== enc.Utf8.stringify(iv)) return false;
  return true;
};

/**
 * aes 加密
 */
export const aes = (
  str: string,
  key: CryptoJS.lib.WordArray,
  iv: CryptoJS.lib.WordArray,
) => {
  const srcs = enc.Utf8.parse(str);
  const encrypted = AES.encrypt(srcs, key, {
    iv,
    mode: mode.CBC,
    padding: pad.Pkcs7,
  });
  return encrypted.ciphertext.toString();
};

/**
 * aes 解密
 */
export const aesDecrypt = (
  str: string,
  key: CryptoJS.lib.WordArray,
  iv: CryptoJS.lib.WordArray,
) => {
  const encryptedHexStr = enc.Hex.parse(str);
  const srcs = enc.Base64.stringify(encryptedHexStr);
  const decrypt = AES.decrypt(srcs, key, {
    iv,
    mode: mode.CBC,
    padding: pad.Pkcs7,
  });
  const decryptedStr = decrypt.toString(enc.Utf8);
  return decryptedStr.toString();
};
