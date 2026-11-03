import CryptoJS from 'crypto-js'

/**
 * 演示环境的占位密钥
 *
 * 原项目使用与服务端约定的固定密钥，属于敏感配置。
 * 演示版本改为本地占位值：登录请求不会发往任何服务端，
 * 因此这里的加解密仅用于保持调用链完整，不具备任何保密意义。
 */
const MOCK_KEY = 'atlas-local-mock-key-placeholder'.padEnd(32, '0').slice(0, 32)
const MOCK_IV = 'atlas-local-mock-iv'.padEnd(16, '0').slice(0, 16)

const key = CryptoJS.enc.Utf8.parse(MOCK_KEY)
const iv = CryptoJS.enc.Utf8.parse(MOCK_IV)

/* 加密 */
export function encrypt(word: string) {
  if (!word)
    return null
  const message = CryptoJS.enc.Utf8.parse(word)
  const encrypted = CryptoJS.AES.encrypt(message, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })
  return encrypted.ciphertext.toString(CryptoJS.enc.Base64)
}

/* 解密 */
export function decrypt(ciphertext: string) {
  if (!ciphertext)
    return ''
  const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })
  return decrypted.toString(CryptoJS.enc.Utf8)
}

export default {
  encrypt,
  decrypt,
}
