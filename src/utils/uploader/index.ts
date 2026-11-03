/**
 * 上传器模块入口
 * 提供文件分片上传功能
 */

// 导出类型
export * from './types'

// 导出工具函数
export * from './utils'
export { default as utils } from './utils'

// 导出事件模块
export { EventEmitter } from './event'
export { default as event } from './event'

// 导出分片类
export { Chunk } from './chunk'
export { default as ChunkClass } from './chunk'

// 导出文件类
export { UploaderFile } from './file'
export { default as FileClass } from './file'

// 导出上传器类
export { type PartialUploaderOptions, Uploader, type UploaderOptions } from './uploader'
export { default as UploaderClass } from './uploader'
export { default } from './uploader'
