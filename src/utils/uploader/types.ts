/**
 * 上传器类型定义
 */

/** 分片状态枚举 */
export type ChunkStatus = 'pending' | 'uploading' | 'reading' | 'success' | 'error' | 'complete' | 'progress' | 'retry'

/** 分片状态常量 */
export const CHUNK_STATUS = {
  PENDING: 'pending' as const,
  UPLOADING: 'uploading' as const,
  READING: 'reading' as const,
  SUCCESS: 'success' as const,
  ERROR: 'error' as const,
  COMPLETE: 'complete' as const,
  PROGRESS: 'progress' as const,
  RETRY: 'retry' as const,
}

/** 分片参数 */
export interface ChunkParams {
  chunkNumber: number
  chunkSize: number
  currentChunkSize: number
  totalSize: number
  identifier: string
  filename: string
  relativePath: string
  totalChunks: number
}

/** 事件处理器类型 */
export type EventHandler = (...args: unknown[]) => boolean | void | undefined | Promise<void>

/** 原生文件类型别名 */
export type NativeFile = globalThis.File

/** 扩展的 File 接口（包含额外属性） */
export interface ExtendedFile {
  name: string
  size: number
  type: string
  fileName?: string
  relativePath?: string
  webkitRelativePath?: string
}
