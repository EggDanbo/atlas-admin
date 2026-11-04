/** 文件类别 */
export enum FileKind {
  Image = 'image',
  Video = 'video',
  Pdf = 'pdf',
  Word = 'word',
  Excel = 'excel',
  Ppt = 'ppt',
  Markdown = 'markdown',
  Code = 'code',
  Text = 'text',
  Archive = 'archive',
  Other = 'other',
}

interface FileTypeInput {
  /** 文件名（Upload 的 FileResourceModel.name 含后缀） */
  name?: string
  /** MIME 类型 */
  mime?: string
  /** FileManager 的 extension 字段，形如 ".doc" */
  extension?: string
}

/** 从文件名或扩展名提取小写扩展名（不含点）；无扩展名返回空串 */
export function getExtension(name?: string): string {
  if (!name)
    return ''
  const idx = name.lastIndexOf('.')
  if (idx < 0)
    return ''
  return name.slice(idx + 1).toLowerCase()
}

const EXT_TO_KIND: Record<string, FileKind> = {
  // 图片
  'png': FileKind.Image,
  'jpg': FileKind.Image,
  'jpeg': FileKind.Image,
  'bmp': FileKind.Image,
  'pjpeg': FileKind.Image,
  'gif': FileKind.Image,
  'svg': FileKind.Image,
  'webp': FileKind.Image,
  'tiff': FileKind.Image,
  'tif': FileKind.Image,
  'ico': FileKind.Image,
  // 视频
  'mp4': FileKind.Video,
  'webm': FileKind.Video,
  'flv': FileKind.Video,
  'avi': FileKind.Video,
  'mov': FileKind.Video,
  'wmv': FileKind.Video,
  'mkv': FileKind.Video,
  'mpeg': FileKind.Video,
  'mpg': FileKind.Video,
  '3gp': FileKind.Video,
  '3g2': FileKind.Video,
  'm4v': FileKind.Video,
  'pdf': FileKind.Pdf,
  'doc': FileKind.Word,
  'docx': FileKind.Word,
  'rtf': FileKind.Word,
  'odt': FileKind.Word,
  'xls': FileKind.Excel,
  'xlsx': FileKind.Excel,
  'csv': FileKind.Excel,
  'ods': FileKind.Excel,
  'ppt': FileKind.Ppt,
  'pptx': FileKind.Ppt,
  'odp': FileKind.Ppt,
  'md': FileKind.Markdown,
  'markdown': FileKind.Markdown,
  // 代码
  'ts': FileKind.Code,
  'tsx': FileKind.Code,
  'js': FileKind.Code,
  'mjs': FileKind.Code,
  'cjs': FileKind.Code,
  'vue': FileKind.Code,
  'jsx': FileKind.Code,
  'css': FileKind.Code,
  'less': FileKind.Code,
  'scss': FileKind.Code,
  'json': FileKind.Code,
  'jsonc': FileKind.Code,
  'json5': FileKind.Code,
  'py': FileKind.Code,
  'java': FileKind.Code,
  'go': FileKind.Code,
  'rs': FileKind.Code,
  'c': FileKind.Code,
  'cpp': FileKind.Code,
  'cc': FileKind.Code,
  'h': FileKind.Code,
  'hpp': FileKind.Code,
  'cs': FileKind.Code,
  'rb': FileKind.Code,
  'swift': FileKind.Code,
  'kt': FileKind.Code,
  'sh': FileKind.Code,
  'bash': FileKind.Code,
  'sql': FileKind.Code,
  'yaml': FileKind.Code,
  'yml': FileKind.Code,
  'toml': FileKind.Code,
  'ini': FileKind.Code,
  'conf': FileKind.Code,
  'log': FileKind.Code,
  // 文本
  'txt': FileKind.Text,
  // 压缩
  'zip': FileKind.Archive,
  'rar': FileKind.Archive,
  '7z': FileKind.Archive,
  'gz': FileKind.Archive,
  'tar': FileKind.Archive,
  'bz2': FileKind.Archive,
}

const MIME_PREFIX_TO_KIND: Record<string, FileKind> = {
  'image/': FileKind.Image,
  'video/': FileKind.Video,
  'application/pdf': FileKind.Pdf,
}

/** 判断文件类别：扩展名优先（extension 字段 > name），mime 兜底 */
export function getFileKind(input: FileTypeInput): FileKind {
  const ext = getExtension(input.extension) || getExtension(input.name)
  if (ext && EXT_TO_KIND[ext])
    return EXT_TO_KIND[ext]!

  const mime = (input.mime ?? '').toLowerCase()
  for (const prefix of Object.keys(MIME_PREFIX_TO_KIND)) {
    if (mime.startsWith(prefix))
      return MIME_PREFIX_TO_KIND[prefix]!
  }
  if (mime.startsWith('text/'))
    return FileKind.Text
  return FileKind.Other
}

const KIND_ICON: Record<FileKind, string> = {
  [FileKind.Image]: 'ant-design:file-image-outlined',
  [FileKind.Video]: 'ant-design:video-camera-outlined',
  [FileKind.Pdf]: 'ant-design:file-pdf-outlined',
  [FileKind.Word]: 'ant-design:file-word-outlined',
  [FileKind.Excel]: 'ant-design:file-excel-outlined',
  [FileKind.Ppt]: 'ant-design:file-ppt-outlined',
  [FileKind.Markdown]: 'ant-design:file-markdown-outlined',
  [FileKind.Code]: 'ant-design:code-outlined',
  [FileKind.Text]: 'ant-design:file-text-outlined',
  [FileKind.Archive]: 'ant-design:file-zip-outlined',
  [FileKind.Other]: 'ant-design:file-unknown-outlined',
}

/** 获取类别对应的图标名（开源 ant-design outlined） */
export function getFileIcon(kind: FileKind): string {
  return KIND_ICON[kind] ?? KIND_ICON[FileKind.Other]!
}

/** 是否为可在新窗口用 file-viewer 预览的类别（图片/视频/压缩/未知除外） */
export function isPreviewableKind(kind: FileKind): boolean {
  return ![
    FileKind.Image,
    FileKind.Video,
    FileKind.Other,
    FileKind.Archive,
  ].includes(kind)
}
