import { getExtension } from './fileType'

/**
 * 扩展名 ↔ MIME 映射（同时是「扩展名白名单」）。
 * key = 不含点的小写扩展名；value = 该扩展名可接受的 MIME 列表。
 * 增减允许的类型只需改这里。
 */
export const EXT_MIME_MAP: Record<string, string[]> = {
  // 图片
  'png': ['image/png'],
  'jpg': ['image/jpeg', 'image/pjpeg'],
  'jpeg': ['image/jpeg', 'image/pjpeg'],
  'bmp': ['image/bmp'],
  'gif': ['image/gif'],
  'svg': ['image/svg+xml'],
  'webp': ['image/webp'],
  'tiff': ['image/tiff'],
  // 视频
  'mp4': ['video/mp4', 'video/mpg4', 'video/x-mp4', 'video/x-mpg4'],
  'webm': ['video/webm'],
  'flv': ['video/flv', 'video/x-flv', 'video/x-flash-video'],
  'avi': ['video/avi', 'video/msvideo', 'video/x-msvideo'],
  'mov': ['video/quicktime'],
  'wmv': ['video/x-ms-wmv', 'video/x-ms-asf'],
  'mkv': ['video/x-matroska'],
  'mpeg': ['video/mpeg'],
  'mpg': ['video/mpeg'],
  '3gp': ['video/3gpp'],
  '3g2': ['video/3gpp2'],
  'm3u8': ['video/mpegurl', 'video/x-mpegurl'],
  // PDF
  'pdf': ['application/pdf'],
  // Word
  'doc': ['application/msword'],
  'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  'rtf': ['application/rtf'],
  'odt': ['application/vnd.oasis.opendocument.text'],
  // Excel
  'xls': ['application/vnd.ms-excel'],
  'xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  'csv': ['text/csv'],
  'ods': ['application/vnd.oasis.opendocument.spreadsheet'],
  // PPT
  'ppt': ['application/vnd.ms-powerpoint'],
  'pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  'odp': ['application/vnd.oasis.opendocument.presentation'],
  // Markdown
  'md': ['text/markdown'],
  'markdown': ['text/markdown'],
  // 代码 / 文本
  'txt': ['text/plain'],
  'json': ['application/json'],
  'log': ['text/plain'],
  'js': ['text/javascript'],
  'ts': ['text/typescript', 'video/mp2t'], // TypeScript 源码 / MPEG-2 TS 流（.ts 同名扩展名）
  'css': ['text/css'],
  'yaml': ['text/yaml'],
  'yml': ['text/yaml'],
  'sql': ['application/sql'],
  // 压缩
  'zip': ['application/zip', 'application/x-zip-compressed'],
  'rar': ['application/vnd.rar'],
  '7z': ['application/x-7z-compressed'],
  'gz': ['application/gzip'],
  'tar': ['application/x-tar'],
  // 其它原 accepts 涉及
  'wav': ['audio/wav'],
  'apk': ['application/vnd.android.package-archive'],
}

/**
 * 危险扩展名黑名单：对齐后端禁止列表 + 前端补充。
 * 命中即拒绝（即使扩展名在 EXT_MIME_MAP 中）。
 */
export const DANGEROUS_EXT: ReadonlySet<string> = new Set([
  // 后端禁止
  'exe',
  'xml',
  'php',
  'php2',
  'php3',
  'php4',
  'php5',
  'phtml',
  'pht',
  'html',
  'htm',
  'jsp',
  'jspa',
  'jspx',
  'jsw',
  'jsv',
  'jspf',
  'jtml',
  'asp',
  'aspx',
  'asa',
  'asax',
  'ascx',
  'ashx',
  'asmx',
  'cer',
  'swf',
  'htaccess',
  'cdx',
  'owf',
  // 前端补充
  'bat',
  'cmd',
  'com',
  'sh',
  'vbs',
  'ps1',
  'reg',
  'scr',
  'msi',
])

export interface UploadCheckOptions {
  /** 允许的 MIME 白名单（来自组件 props.accepts 或 acceptImage） */
  acceptMimes: string[]
  /** 最大体积，单位 MB */
  maxSizeMB: number
}

export interface UploadCheckResult {
  valid: boolean
  error?: string
}

export interface UploadFileInfo {
  /** 文件名（含后缀） */
  name?: string
  /** MIME 类型（simple-uploader 的 fileInfo.fileType） */
  type?: string
  /** 字节数（simple-uploader 的 fileInfo.size） */
  size?: number
}

/**
 * 上传校验，顺序：大小 → 黑名单 → 扩展名白名单 → MIME 白名单。
 * 任一不通过返回 { valid: false, error }。
 */
export function validateUploadFile(file: UploadFileInfo, opts: UploadCheckOptions): UploadCheckResult {
  const ext = getExtension(file.name)

  if (opts.maxSizeMB && file.size != null && file.size / 1024 / 1024 >= opts.maxSizeMB)
    return { valid: false, error: `上传文件大小不能超过${opts.maxSizeMB}M` }

  if (ext && DANGEROUS_EXT.has(ext))
    return { valid: false, error: '不是有效的文件' }

  if (!ext || !(ext in EXT_MIME_MAP))
    return { valid: false, error: '不是有效的文件' }

  if (file.type && !opts.acceptMimes.includes(file.type))
    return { valid: false, error: '不是有效的文件' }

  return { valid: true }
}
