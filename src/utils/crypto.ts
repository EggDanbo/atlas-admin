import CryptoJS from 'crypto-js'

/**
 * 演示环境的占位密钥
 *
 * 原项目使用与服务端约定的固定密钥，属于敏感配置。
 * 演示版本改为本地占位值：登录请求不会发往任何服务端，
 * 因此这里的加解密仅用于保持调用链完整，不具备任何保密意义。
 */
const DEMO_KEY = 'demo-mock-only-not-a-secret-key'.padEnd(32, '0').slice(0, 32)
const DEMO_IV = 'demo-mock-iv-001'.padEnd(16, '0').slice(0, 16)

const key = CryptoJS.enc.Utf8.parse(DEMO_KEY)
const iv = CryptoJS.enc.Utf8.parse(DEMO_IV)

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
