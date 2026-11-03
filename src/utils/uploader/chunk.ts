/**
 * 分片类
 * 处理文件分片的上传逻辑
 */

import type { ChunkParams, ChunkStatus } from './types'
import { CHUNK_STATUS } from './types'
import { each, evalOpts, isFunction } from './utils'

// 前向声明类型
declare class UploaderType {
  opts: UploaderOptions
  uploadNextChunk(): boolean
  upload(preventEvents?: boolean): void
  filePaths: Record<string, unknown>
}

declare class UploaderFileType {
  size: number
  name: string
  uniqueIdentifier?: string
  relativePath?: string
  fileType?: string
  chunks: Chunk[]
  paused: boolean
  _chunkEvent(chunk: Chunk, evt: ChunkStatus, message?: unknown): void
  isComplete(): boolean
  _firstResponse?: boolean
  isUploading(): boolean
}

interface UploaderOptions {
  chunkSize: number
  forceChunkSize: boolean
  testChunks: boolean
  testMethod: string | ((file: UploaderFileType, chunk: Chunk) => string)
  uploadMethod: string | ((file: UploaderFileType, chunk: Chunk) => string)
  method: 'multipart' | 'octet'
  query: Record<string, unknown> | ((file: UploaderFileType, chunk: Chunk, isTest: boolean) => Record<string, unknown>)
  headers: Record<string, string> | ((file: UploaderFileType, chunk: Chunk, isTest: boolean) => Record<string, string>)
  target: string | ((file: UploaderFileType, chunk: Chunk, isTest: boolean) => string)
  fileParameterName: string
  withCredentials: boolean
  preprocess: ((chunk: Chunk) => void) | null
  readFileFn: (fileObj: UploaderFileType, fileType: string, startByte: number, endByte: number, chunk: Chunk) => void
  processResponse: (response: string, cb: (err: Error | null, res: string) => void, file: UploaderFileType, chunk: Chunk) => void
  processParams: (params: Record<string, unknown>, file: UploaderFileType, chunk: Chunk, isTest: boolean) => Record<string, unknown>
  checkChunkUploadedByResponse: ((chunk: Chunk, message: string) => boolean) | null
  maxChunkRetries: number
  chunkRetryInterval: number | null
  permanentErrors: number[]
  successStatuses: number[]
}

/** 分片状态常量 */
export const STATUS = CHUNK_STATUS

/**
 * 分片类
 * 负责管理单个分片的上传状态和操作
 */
export class Chunk {
  /** 分片状态常量 */
  static STATUS = STATUS

  /** 上传器引用 */
  declare uploader: UploaderType
  /** 所属文件引用 */
  declare file: UploaderFileType
  /** 分片字节数据 */
  bytes: Blob | null = null
  /** 分片偏移量 */
  offset: number
  /** 是否已测试 */
  tested: boolean
  /** 重试次数 */
  retries: number
  /** 是否等待重试 */
  pendingRetry: boolean
  /** 预处理状态：0=未开始，1=进行中，2=已完成 */
  preprocessState: number
  /** 读取状态：0=未开始，1=进行中，2=已完成 */
  readState: number
  /** 已加载字节数 */
  loaded: number
  /** 总字节数 */
  total: number
  /** 分片大小 */
  chunkSize: number
  /** 起始字节位置 */
  startByte: number
  /** 结束字节位置 */
  endByte: number
  /** XMLHttpRequest 对象 */
  xhr: XMLHttpRequest | null
  /** 是否正在处理响应 */
  processingResponse: boolean
  /** 已处理的状态 */
  processedState: { err: Error | null, res: string } | null

  constructor(uploader: UploaderType, file: UploaderFileType, offset: number) {
    Object.defineProperty(this, 'uploader', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: uploader,
    })
    Object.defineProperty(this, 'file', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: file,
    })

    this.offset = offset
    this.tested = false
    this.retries = 0
    this.pendingRetry = false
    this.preprocessState = 0
    this.readState = 0
    this.loaded = 0
    this.total = 0
    this.chunkSize = this.uploader.opts.chunkSize
    this.startByte = this.offset * this.chunkSize
    this.endByte = this.computeEndByte()
    this.xhr = null
    this.processingResponse = false
    this.processedState = null
  }

  /**
   * 触发分片事件
   */
  _event(evt: ChunkStatus, ...args: unknown[]): void {
    this.file._chunkEvent(this, evt, ...args)
  }

  /**
   * 计算结束字节位置
   */
  computeEndByte(): number {
    let endByte = Math.min(this.file.size, (this.offset + 1) * this.chunkSize)
    if (this.file.size - endByte < this.chunkSize && !this.uploader.opts.forceChunkSize) {
      endByte = this.file.size
    }
    return endByte
  }

  /**
   * 获取分片参数
   */
  getParams(): ChunkParams {
    return {
      chunkNumber: this.offset + 1,
      chunkSize: this.uploader.opts.chunkSize,
      currentChunkSize: this.endByte - this.startByte,
      totalSize: this.file.size,
      identifier: this.file.uniqueIdentifier!,
      filename: this.file.name,
      relativePath: this.file.relativePath!,
      totalChunks: this.file.chunks.length,
    }
  }

  /**
   * 构建目标 URL
   */
  getTarget(target: string, params: string[]): string {
    if (!params.length) {
      return target
    }
    if (!target.includes('?')) {
      target += '?'
    }
    else {
      target += '&'
    }
    return target + params.join('&')
  }

  /**
   * 测试分片是否已上传
   */
  test(): void {
    this.xhr = new XMLHttpRequest()

    const testHandler = (): void => {
      const status = this.status(true)
      if (status === STATUS.ERROR) {
        this._event(status, this.message())
        this.uploader.uploadNextChunk()
      }
      else if (status === STATUS.SUCCESS) {
        this._event(status, this.message())
        this.tested = true
      }
      else if (!this.file.paused) {
        this.tested = true
        this.send()
      }
    }

    this.xhr.addEventListener('load', testHandler, false)
    this.xhr.addEventListener('error', testHandler, false)

    const testMethod = evalOpts(this.uploader.opts.testMethod, this.file, this)
    const data = this.prepareXhrRequest(testMethod, true)
    this.xhr.send(data)
  }

  /**
   * 预处理完成回调
   */
  preprocessFinished(): void {
    this.endByte = this.computeEndByte()
    this.preprocessState = 2
    this.send()
  }

  /**
   * 文件读取完成回调
   */
  readFinished(bytes: Blob): void {
    this.readState = 2
    this.bytes = bytes
    this.send()
  }

  /**
   * 发送分片
   */
  send(): void {
    const preprocess = this.uploader.opts.preprocess
    const read = this.uploader.opts.readFileFn

    if (isFunction(preprocess)) {
      switch (this.preprocessState) {
        case 0:
          this.preprocessState = 1
          preprocess(this)
          return
        case 1:
          return
      }
    }

    switch (this.readState) {
      case 0:
        this.readState = 1
        read(this.file, this.file.fileType!, this.startByte, this.endByte, this)
        return
      case 1:
        return
    }

    if (this.uploader.opts.testChunks && !this.tested) {
      this.test()
      return
    }

    this.loaded = 0
    this.total = 0
    this.pendingRetry = false

    // 定义事件处理器
    const progressHandler = (event: ProgressEvent): void => {
      if (event.lengthComputable) {
        this.loaded = event.loaded
        this.total = event.total
      }
      this._event(STATUS.PROGRESS, event)
    }

    const doneHandler = (): void => {
      const msg = this.message()
      this.processingResponse = true
      this.uploader.opts.processResponse(
        msg,
        (err, res) => {
          this.processingResponse = false
          if (!this.xhr) {
            return
          }
          this.processedState = { err, res }
          const status = this.status()
          if (status === STATUS.SUCCESS || status === STATUS.ERROR) {
            this._event(status, res)
            status === STATUS.ERROR && this.uploader.uploadNextChunk()
          }
          else {
            this._event(STATUS.RETRY, res)
            this.pendingRetry = true
            this.abort()
            this.retries++
            const retryInterval = this.uploader.opts.chunkRetryInterval
            if (retryInterval !== null) {
              setTimeout(() => this.send(), retryInterval)
            }
            else {
              this.send()
            }
          }
        },
        this.file,
        this,
      )
    }

    // 设置请求并监听事件
    this.xhr = new XMLHttpRequest()
    this.xhr.upload.addEventListener('progress', progressHandler, false)
    this.xhr.addEventListener('load', doneHandler, false)
    this.xhr.addEventListener('error', doneHandler, false)

    const uploadMethod = evalOpts(this.uploader.opts.uploadMethod, this.file, this)
    const data = this.prepareXhrRequest(uploadMethod, false, this.uploader.opts.method, this.bytes)
    this.xhr.send(data)
  }

  /**
   * 中止分片上传
   */
  abort(): void {
    const xhr = this.xhr
    this.xhr = null
    this.processingResponse = false
    this.processedState = null
    if (xhr) {
      xhr.abort()
    }
  }

  /**
   * 获取分片状态
   */
  status(isTest?: boolean): ChunkStatus {
    if (this.readState === 1) {
      return STATUS.READING
    }
    if (this.pendingRetry || this.preprocessState === 1) {
      return STATUS.UPLOADING
    }
    if (!this.xhr) {
      return STATUS.PENDING
    }
    if (this.xhr.readyState < 4 || this.processingResponse) {
      return STATUS.UPLOADING
    }

    let _status: ChunkStatus
    if (this.uploader.opts.successStatuses.includes(this.xhr.status)) {
      _status = STATUS.SUCCESS
    }
    else if (
      this.uploader.opts.permanentErrors.includes(this.xhr.status)
      || (!isTest && this.retries >= this.uploader.opts.maxChunkRetries)
    ) {
      _status = STATUS.ERROR
    }
    else {
      this.abort()
      _status = STATUS.PENDING
    }
    const processedState = this.processedState
    if (processedState && processedState.err) {
      _status = STATUS.ERROR
    }
    return _status
  }

  /**
   * 获取响应消息
   */
  message(): string {
    return this.xhr ? this.xhr.responseText : ''
  }

  /**
   * 获取分片上传进度
   */
  progress(): number {
    if (this.pendingRetry) {
      return 0
    }
    const s = this.status()
    if (s === STATUS.SUCCESS || s === STATUS.ERROR) {
      return 1
    }
    if (s === STATUS.PENDING) {
      return 0
    }
    return this.total > 0 ? this.loaded / this.total : 0
  }

  /**
   * 获取已上传字节数
   */
  sizeUploaded(): number {
    let size = this.endByte - this.startByte
    if (this.status() !== STATUS.SUCCESS) {
      size = this.progress() * size
    }
    return size
  }

  /**
   * 准备 XHR 请求
   */
  prepareXhrRequest(
    method: string,
    isTest: boolean,
    paramsMethod?: 'multipart' | 'octet',
    blob?: Blob | null,
  ): FormData | Blob | null {
    let query = evalOpts(this.uploader.opts.query, this.file, this, isTest)
    query = { ...this.getParams(), ...query } as Record<string, unknown>
    query = this.uploader.opts.processParams(query, this.file, this, isTest)

    let target = evalOpts(this.uploader.opts.target, this.file, this, isTest)
    let data: FormData | Blob | null = null

    if (method === 'GET' || paramsMethod === 'octet') {
      const params: string[] = []
      each(query as Record<string, unknown>, (v, k) => {
        params.push([encodeURIComponent(k as string), encodeURIComponent(String(v))].join('='))
      })
      target = this.getTarget(target, params)
      data = blob || null
    }
    else {
      const formData = new FormData()
      each(query as Record<string, unknown>, (v, k) => {
        formData.append(k as string, String(v))
      })
      if (blob) {
        formData.append(this.uploader.opts.fileParameterName, blob, this.file.name)
      }
      data = formData
    }

    this.xhr!.open(method, target, true)
    this.xhr!.withCredentials = this.uploader.opts.withCredentials

    const headers = evalOpts(this.uploader.opts.headers, this.file, this, isTest)
    each(headers as Record<string, string>, (v, k) => {
      this.xhr!.setRequestHeader(k as string, v)
    })

    return data
  }
}

export default Chunk
