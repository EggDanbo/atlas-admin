// 预编译正则表达式
const ABSOLUTE_URL_REGEX = /^(?:https?|ftp|file|data|blob):\/\//

/**
 * 判断是否为绝对url
 * @param url
 */
export function isAbsoluteUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }
  // 支持更多协议：http, https, ftp, file, data, blob 等
  return ABSOLUTE_URL_REGEX.test(url.trim())
}

/**
 * 获取文件url
 * @param url 文件路径或URL
 * @returns 完整的文件URL
 */
export function getFileUrl(url: string | undefined | null): string {
  // 处理各种空值情况
  if (!url || typeof url !== 'string' || url.trim() === '') {
    console.warn('getFileUrl: 传入的URL为空或无效')
    return ''
  }
  const trimmedUrl = url.trim()
  // 如果是绝对URL，直接返回
  if (isAbsoluteUrl(trimmedUrl)) {
    return trimmedUrl
  }
  // 检查环境变量是否存在
  const fileUrl = import.meta.env.VITE_FILE_URL
  if (!fileUrl || typeof fileUrl !== 'string') {
    console.error('getFileUrl: VITE_FILE_URL 环境变量未定义或无效')
    return trimmedUrl // 返回原始URL作为降级处理
  }
  try {
    // 根据约定：fileUrl 不以 / 结尾，相对路径通常以 / 开头
    // 但需要处理用户配置可能以 / 结尾的边界情况
    let baseUrl = fileUrl
    let relativePath = trimmedUrl
    // 处理 fileUrl 可能以 / 结尾的情况（用户配置错误）
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1)
    }
    // 处理相对路径，确保以 / 开头
    if (!relativePath.startsWith('/')) {
      relativePath = `/${relativePath}`
    }
    const fullUrl = `${baseUrl}${relativePath}`
    // 验证生成的URL格式
    if (URL.canParse(fullUrl)) {
      return fullUrl
    }
    console.error('getFileUrl: 生成的URL格式无效', { baseUrl, relativePath, fullUrl })
    return trimmedUrl // 返回原始URL作为降级处理
  }
  catch (error) {
    console.error('getFileUrl: 处理URL时发生错误', error)
    return trimmedUrl // 返回原始URL作为降级处理
  }
}
