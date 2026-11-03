import { getExtension } from './fileType'

/** 可预览的文件项（兼容 FileResourceModel 与 FileResourceResult） */
export interface PreviewableItem {
  /** 文件资源 url（可能不带后缀） */
  url: string
  /** 文件名（FileResourceModel.name 含后缀） */
  name?: string
  /** 扩展名字段（FileResourceResult.extension，形如 ".doc"） */
  extension?: string
}

/**
 * 给文件资源 url 拼接扩展名后缀，供 file-viewer 按扩展名识别类型。
 * 后端对带/不带后缀的 url 均可访问。
 */
export function buildFileUrl(item: PreviewableItem): string {
  const ext = getExtension(item.extension) || getExtension(item.name)
  if (!ext)
    return item.url

  const queryIdx = item.url.indexOf('?')
  const pathPart = queryIdx < 0 ? item.url : item.url.slice(0, queryIdx)
  // url 路径已以该扩展名结尾则不再拼接，避免产生 xxx.docx.docx
  if (pathPart.toLowerCase().endsWith(`.${ext}`))
    return item.url

  if (queryIdx < 0)
    return `${pathPart}.${ext}`

  return `${pathPart}.${ext}${item.url.slice(queryIdx)}`
}

/** 独立文件预览服务地址；空值表示用本应用内置预览页 */
const FILE_PREVIEW_BASE = (import.meta.env.VITE_FILE_PREVIEW_BASE ?? '').trim()

/**
 * 组装新窗口预览地址：
 * - VITE_FILE_PREVIEW_BASE 非空：跳转独立预览服务 `<base>/?url=<拼后缀的文件url>&name=<文件名>`
 * - 为空（开发模式默认）：使用内置预览页 `<应用base>/file-viewer?url=&name=`
 */
export function buildPreviewUrl(item: PreviewableItem): string {
  const fileUrl = buildFileUrl(item)
  const params = new URLSearchParams({
    url: fileUrl,
    name: item.name ?? '',
  })
  if (FILE_PREVIEW_BASE)
    return `${FILE_PREVIEW_BASE.replace(/\/+$/, '')}/?${params.toString()}`
  // 拼上部署 base（如 /pc/），否则新窗口会打开根路径 /file-viewer 而 404
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '')
  return `${base}/file-viewer?${params.toString()}`
}
