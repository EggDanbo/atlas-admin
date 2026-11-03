/**
 * 文件类
 * 管理上传文件的元数据和状态
 */

import type { ChunkStatus, ExtendedFile } from './types'
import { CHUNK_STATUS } from './types'
import { each, formatSize, isFunction, isString, uid } from './utils'

// 前向声明类型
declare class ChunkType {
  offset: number
  tested: boolean
  preprocessState: number
  readState: number
  startByte: number
  endByte: number
  xhr: XMLHttpRequest | null
  status(isTest?: boolean): ChunkStatus
  progress(): number
  sizeUploaded(): number
  abort(): void
  send(): void
}

declare class UploaderType {
  opts: UploaderOpts
  filePaths: Record<string, UploaderFile>
  upload(preventEvents?: boolean): void
  uploadNextChunk(): boolean
  removeFile(file: UploaderFile): void
  _trigger(name: string, ...args: unknown[]): boolean
  _delFilePath(file: UploaderFile): void
  _triggerAsync(name: string, ...args: unknown[]): void
}

interface UploaderOpts {
  initialPaused: boolean
  chunkSize: number
  forceChunkSize: boolean
  initFileFn: ((file: UploaderFile) => void) | null
  progressCallbacksInterval: number
  speedSmoothingFactor: number
  checkChunkUploadedByResponse: ((chunk: ChunkType, message: string) => boolean) | null
}

/**
 * 解析路径中的目录层级
 * @param path - 文件相对路径
 * @returns 目录路径数组
 */
function parsePaths(path: string): string[] {
  const ret: string[] = []
  const paths = path.split('/')
  let len = paths.length
  let i = 1
  paths.splice(len - 1, 1)
  len--
  if (paths.length) {
    while (i <= len) {
      ret.push(`${paths.slice(0, i++).join('/')}/`)
    }
  }
  return ret
}

/**
 * 文件类
 * 表示上传的文件或文件夹
 */
export class UploaderFile {
  /** 上传器引用 */
  declare uploader: UploaderType
  /** 是否为根节点 */
  isRoot: boolean
  /** 是否为文件夹 */
  isFolder: boolean
  /** 父文件引用 */
  parent!: UploaderFile | null
  /** 子文件列表（文件夹用） */
  files!: UploaderFile[]
  /** 直接子文件列表 */
  fileList!: UploaderFile[]
  /** 分片列表 */
  chunks!: ChunkType[]
  /** 错误文件列表 */
  _errorFiles!: UploaderFile[]
  /** 原始文件对象 */
  file: globalThis.File | null
  /** 文件唯一 ID */
  id: number
  /** 文件路径（文件夹用） */
  path?: string
  /** 文件名 */
  name: string = ''
  /** 文件大小 */
  size: number = 0
  /** 文件类型 */
  fileType?: string
  /** 文件相对路径 */
  relativePath?: string
  /** 唯一标识符 */
  uniqueIdentifier?: string
  /** 是否暂停 */
  paused: boolean
  /** 是否有错误 */
  error: boolean
  /** 是否全部错误 */
  allError: boolean
  /** 是否已中止 */
  aborted: boolean
  /** 是否已完成 */
  completed: boolean
  /** 平均速度 */
  averageSpeed: number
  /** 当前速度 */
  currentSpeed: number
  /** 上次进度回调时间 */
  _lastProgressCallback: number
  /** 上次已上传大小 */
  _prevUploadedSize: number
  /** 上次进度 */
  _prevProgress: number
  /** 进度定时器 ID */
  _progeressId: ReturnType<typeof setTimeout> | 0
  /** 是否首次响应 */
  _firstResponse?: boolean

  /**
   * 构造函数
   * @param uploader - 上传器实例
   * @param file - 原始文件对象或路径字符串
   * @param parent - 父文件
   */
  constructor(uploader: UploaderType, file?: globalThis.File | string | null, parent?: UploaderFile | null) {
    // 使用 Object.defineProperty 直接设置不可枚举属性
    Object.defineProperty(this, 'uploader', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: uploader,
    })
    this.isRoot = this.isFolder = uploader === (this as unknown as UploaderType)
    Object.defineProperty(this, 'parent', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: parent || null,
    })
    Object.defineProperty(this, 'files', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: [],
    })
    Object.defineProperty(this, 'fileList', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: [],
    })
    Object.defineProperty(this, 'chunks', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: [],
    })
    Object.defineProperty(this, '_errorFiles', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: [],
    })
    Object.defineProperty(this, 'file', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: null,
    })
    this.id = uid()

    if (this.isRoot || !file) {
      this.file = null
    }
    else {
      if (isString(file)) {
        // 文件夹
        this.isFolder = true
        this.file = null
        this.path = file
        if (this.parent?.path) {
          file = file.substring(this.parent.path.length)
        }
        this.name
          = (file as string).charAt((file as string).length - 1) === '/'
            ? (file as string).substring(0, (file as string).length - 1)
            : (file as string)
      }
      else {
        this.file = file
        this.fileType = this.file.type
        const extFile = file as ExtendedFile
        this.name = extFile.fileName || extFile.name
        this.size = extFile.size
        this.relativePath = extFile.relativePath || extFile.webkitRelativePath || this.name
        this._parseFile()
      }
    }

    this.paused = uploader?.opts?.initialPaused ?? false
    this.error = false
    this.allError = false
    this.aborted = false
    this.completed = false
    this.averageSpeed = 0
    this.currentSpeed = 0
    this._lastProgressCallback = Date.now()
    this._prevUploadedSize = 0
    this._prevProgress = 0
    this._progeressId = 0

    // 只有当 uploader 有效时才调用 bootstrap（避免 Uploader 构造函数 super() 调用时出错）
    if (uploader) {
      this.bootstrap()
    }
  }

  /**
   * 解析文件路径
   */
  private _parseFile(): void {
    const ppaths = parsePaths(this.relativePath!)
    if (ppaths.length) {
      const filePaths = this.uploader.filePaths
      each(
        ppaths,
        (path, i) => {
          let folderFile = filePaths[path as string] as UploaderFile | undefined
          if (!folderFile) {
            folderFile = new UploaderFile(this.uploader, path as string, this.parent)
            filePaths[path as string] = folderFile
            this._updateParentFileList(folderFile)
          }
          this.parent = folderFile
          folderFile.files.push(this)
          if (!ppaths[(i as number) + 1]) {
            folderFile.fileList.push(this)
          }
        },
        this,
      )
    }
    else {
      this._updateParentFileList()
    }
  }

  /**
   * 更新父文件列表
   * @param file - 要添加的文件
   */
  private _updateParentFileList(file?: UploaderFile): void {
    const targetFile = file ?? this
    const p = this.parent
    if (p) {
      p.fileList.push(targetFile)
    }
  }

  /**
   * 遍历访问器
   * @param eachFn - 文件夹遍历函数
   * @param fileFn - 文件处理函数
   */
  private _eachAccess(
    eachFn: (file: UploaderFile, index: number) => boolean | void,
    fileFn: (file: UploaderFile) => void,
  ): void {
    if (this.isFolder) {
      each(
        this.files,
        (f, i) => {
          return eachFn.call(this, f, i as number)
        },
        this,
      )
      return
    }
    fileFn.call(this, this)
  }

  /**
   * 初始化文件分片
   */
  bootstrap(): void {
    if (this.isFolder)
      return
    const opts = this.uploader.opts
    if (isFunction(opts.initFileFn)) {
      opts.initFileFn.call(this, this)
    }

    this.abort(true)
    this._resetError()
    // 从文件重建分片堆栈
    this._prevProgress = 0
    const round = opts.forceChunkSize ? Math.ceil : Math.floor
    const chunks = Math.max(round(this.size / opts.chunkSize), 1)
    for (let offset = 0; offset < chunks; offset++) {
      // 使用动态获取的 Chunk 类
      const ChunkClass = (this.uploader as unknown as { constructor: { Chunk: new (u: UploaderType, f: UploaderFile, o: number) => ChunkType } }).constructor.Chunk
      this.chunks.push(new ChunkClass(this.uploader, this, offset))
    }
  }

  /**
   * 测量上传速度
   */
  private _measureSpeed(): void {
    const smoothingFactor = this.uploader.opts.speedSmoothingFactor
    const timeSpan = Date.now() - this._lastProgressCallback
    if (!timeSpan) {
      return
    }
    const uploaded = this.sizeUploaded()
    // 防止文件恢复上传后出现负的上传速度
    this.currentSpeed = Math.max(((uploaded - this._prevUploadedSize) / timeSpan) * 1000, 0)
    this.averageSpeed = smoothingFactor * this.currentSpeed + (1 - smoothingFactor) * this.averageSpeed
    this._prevUploadedSize = uploaded
    if (this.parent && this.parent._checkProgress()) {
      this.parent._measureSpeed()
    }
  }

  /**
   * 检查进度
   * @returns 是否需要更新进度
   */
  private _checkProgress(): boolean {
    return Date.now() - this._lastProgressCallback >= this.uploader.opts.progressCallbacksInterval
  }

  /**
   * 分片事件处理
   * @param chunk - 分片
   * @param evt - 事件类型
   * @param message - 消息
   */
  _chunkEvent(chunk: ChunkType, evt: ChunkStatus, message?: unknown): void {
    const uploader = this.uploader
    const STATUS = CHUNK_STATUS
    // eslint-disable-next-line ts/no-this-alias
    const that = this
    const rootFile = this.getRoot()

    const triggerProgress = (): void => {
      that._measureSpeed()
      uploader._trigger('fileProgress', rootFile, that, chunk)
      that._lastProgressCallback = Date.now()
    }

    switch (evt) {
      case STATUS.PROGRESS:
        if (this._checkProgress()) {
          triggerProgress()
        }
        break
      case STATUS.ERROR:
        this._error()
        this.abort(true)
        uploader._trigger('fileError', rootFile, this, message, chunk)
        break
      case STATUS.SUCCESS: {
        this._updateUploadedChunks(message, chunk)
        if (this.error) {
          return
        }
        clearTimeout(this._progeressId)
        this._progeressId = 0
        const timeDiff = Date.now() - this._lastProgressCallback
        if (timeDiff < uploader.opts.progressCallbacksInterval) {
          this._progeressId = setTimeout(
            triggerProgress,
            uploader.opts.progressCallbacksInterval - timeDiff,
          )
        }
        if (this.isComplete()) {
          clearTimeout(this._progeressId)
          triggerProgress()
          this.currentSpeed = 0
          this.averageSpeed = 0
          uploader._trigger('fileSuccess', rootFile, this, message, chunk)
          if (rootFile.isComplete()) {
            uploader._trigger('fileComplete', rootFile, this)
          }
        }
        else if (!this._progeressId) {
          triggerProgress()
        }
        break
      }
      case STATUS.RETRY:
        uploader._trigger('fileRetry', rootFile, this, chunk)
        break
    }
  }

  /**
   * 更新已上传分片
   * @param message - 响应消息
   * @param chunk - 分片
   */
  private _updateUploadedChunks(message: unknown, chunk: ChunkType): void {
    const checkChunkUploaded = this.uploader.opts.checkChunkUploadedByResponse
    if (checkChunkUploaded) {
      const xhr = chunk.xhr
      each(
        this.chunks,
        (_chunk) => {
          if (!_chunk.tested) {
            const uploaded = checkChunkUploaded.call(this, _chunk, message as string)
            if (_chunk === chunk && !uploaded) {
              // 修复第一个分片 xhr 状态
              // 被视为成功但 checkChunkUploaded 为 false
              // 所以当前分片应该重新上传
              _chunk.xhr = null
            }
            if (uploaded) {
              // 首次成功且其他分片已上传
              // 然后设置 xhr，这样已上传的分片
              // 也会被视为成功
              _chunk.xhr = xhr
            }
            _chunk.tested = true
          }
        },
        this,
      )
      if (!this._firstResponse) {
        this._firstResponse = true
        this.uploader.upload(true)
      }
      else {
        this.uploader.uploadNextChunk()
      }
    }
    else {
      this.uploader.uploadNextChunk()
    }
  }

  /**
   * 标记错误
   */
  private _error(): void {
    this.error = this.allError = true
    let parent = this.parent
    while (parent && parent !== (this.uploader as unknown as UploaderFile)) {
      parent._errorFiles.push(this)
      parent.error = true
      if (parent._errorFiles.length === parent.files.length) {
        parent.allError = true
      }
      parent = parent.parent
    }
  }

  /**
   * 重置错误状态
   */
  private _resetError(): void {
    this.error = this.allError = false
    let parent = this.parent
    let index = -1
    while (parent && parent !== (this.uploader as unknown as UploaderFile)) {
      index = parent._errorFiles.indexOf(this)
      parent._errorFiles.splice(index, 1)
      parent.allError = false
      if (!parent._errorFiles.length) {
        parent.error = false
      }
      parent = parent.parent
    }
  }

  /**
   * 检查是否完成
   * @returns 是否完成
   */
  isComplete(): boolean {
    if (!this.completed) {
      let outstanding = false
      this._eachAccess(
        (file) => {
          if (!file.isComplete()) {
            outstanding = true
            return false
          }
        },
        () => {
          if (this.error) {
            outstanding = true
          }
          else {
            const STATUS = CHUNK_STATUS
            each(this.chunks, (chunk) => {
              const status = chunk.status()
              if (
                status === STATUS.ERROR
                || status === STATUS.PENDING
                || status === STATUS.UPLOADING
                || status === STATUS.READING
                || chunk.preprocessState === 1
                || chunk.readState === 1
              ) {
                outstanding = true
                return false
              }
            })
          }
        },
      )
      this.completed = !outstanding
    }
    return this.completed
  }

  /**
   * 检查是否正在上传
   * @returns 是否正在上传
   */
  isUploading(): boolean {
    let uploading = false
    this._eachAccess(
      (file) => {
        if (file.isUploading()) {
          uploading = true
          return false
        }
      },
      () => {
        const uploadingStatus = CHUNK_STATUS.UPLOADING
        each(this.chunks, (chunk) => {
          if (chunk.status() === uploadingStatus) {
            uploading = true
            return false
          }
        })
      },
    )
    return uploading
  }

  /**
   * 恢复上传
   */
  resume(): void {
    this._eachAccess(
      (f) => {
        f.resume()
      },
      () => {
        this.paused = false
        this.aborted = false
        this.uploader.upload()
      },
    )
    this.paused = false
    this.aborted = false
  }

  /**
   * 暂停上传
   */
  pause(): void {
    this._eachAccess(
      (f) => {
        f.pause()
      },
      () => {
        this.paused = true
        this.abort()
      },
    )
    this.paused = true
  }

  /**
   * 取消上传
   */
  cancel(): void {
    this.uploader.removeFile(this)
  }

  /**
   * 重试上传
   * @param file - 可选，指定要重试的文件
   */
  retry(file?: UploaderFile): void {
    const fileRetry = (file: UploaderFile): void => {
      if (file.error) {
        file.bootstrap()
      }
    }
    if (file) {
      file.bootstrap()
    }
    else {
      this._eachAccess(fileRetry, () => {
        this.bootstrap()
      })
    }
    this.uploader.upload()
  }

  /**
   * 中止上传
   * @param reset - 是否重置
   */
  abort(reset?: boolean): void {
    if (this.aborted) {
      return
    }
    this.currentSpeed = 0
    this.averageSpeed = 0
    this.aborted = !reset
    const chunks = this.chunks
    if (reset) {
      this.chunks = []
    }
    const uploadingStatus = CHUNK_STATUS.UPLOADING
    each(
      chunks,
      (c) => {
        if (c.status() === uploadingStatus) {
          c.abort()
          this.uploader.uploadNextChunk()
        }
      },
      this,
    )
  }

  /**
   * 获取上传进度
   * @returns 进度值 0-1
   */
  progress(): number {
    let totalDone = 0
    let totalSize = 0
    let ret = 0
    this._eachAccess(
      (file, index) => {
        totalDone += file.progress() * file.size
        totalSize += file.size
        if (index === this.files.length - 1) {
          ret = totalSize > 0 ? totalDone / totalSize : this.isComplete() ? 1 : 0
        }
      },
      () => {
        if (this.error) {
          ret = 1
          return
        }
        if (this.chunks.length === 1) {
          this._prevProgress = Math.max(this._prevProgress, this.chunks[0]!.progress())
          ret = this._prevProgress
          return
        }
        // 汇总所有进度
        let bytesLoaded = 0
        each(this.chunks, (c) => {
          // 获取相对于整个文件的分片进度
          bytesLoaded += c.progress() * (c.endByte - c.startByte)
        })
        const percent = bytesLoaded / this.size
        // 我们不想在上传暂停时丢失百分比
        this._prevProgress = Math.max(this._prevProgress, percent > 0.9999 ? 1 : percent)
        ret = this._prevProgress
      },
    )
    return ret
  }

  /**
   * 获取文件大小
   * @returns 文件大小（字节）
   */
  getSize(): number {
    let size = 0
    this._eachAccess(
      (file) => {
        size += file.size
      },
      () => {
        size += this.size
      },
    )
    return size
  }

  /**
   * 获取格式化的文件大小
   * @returns 格式化的大小字符串
   */
  getFormatSize(): string {
    const size = this.getSize()
    return formatSize(size)
  }

  /**
   * 获取根文件
   * @returns 根文件
   */
  getRoot(): UploaderFile {
    if (this.isRoot) {
      return this
    }
    let parent = this.parent
    while (parent) {
      if (parent!.parent === (this.uploader as unknown as UploaderFile)) {
        // 找到了
        return parent!
      }
      parent = parent!.parent
    }
    return this
  }

  /**
   * 获取已上传大小
   * @returns 已上传大小（字节）
   */
  sizeUploaded(): number {
    let size = 0
    this._eachAccess(
      (file) => {
        size += file.sizeUploaded()
      },
      () => {
        each(this.chunks, (chunk) => {
          size += chunk.sizeUploaded()
        })
      },
    )
    return size
  }

  /**
   * 计算剩余时间
   * @returns 剩余时间（秒）
   */
  timeRemaining(): number {
    let ret = 0
    let sizeDelta = 0
    let averageSpeed = 0

    const calRet = (delta: number, avgSpeed: number): number => {
      if (delta && !avgSpeed) {
        return Number.POSITIVE_INFINITY
      }
      if (!delta && !avgSpeed) {
        return 0
      }
      return Math.floor(delta / avgSpeed)
    }

    this._eachAccess(
      (file, i) => {
        if (!file.paused && !file.error) {
          sizeDelta += file.size - file.sizeUploaded()
          averageSpeed += file.averageSpeed
        }
        if (i === this.files.length - 1) {
          ret = calRet(sizeDelta, averageSpeed)
        }
      },
      () => {
        if (this.paused || this.error) {
          ret = 0
          return
        }
        const delta = this.size - this.sizeUploaded()
        ret = calRet(delta, this.averageSpeed)
      },
    )
    return ret
  }

  /**
   * 移除文件
   * @param file - 要移除的文件
   */
  removeFile(file: UploaderFile): void {
    if (file.isFolder) {
      while (file.files.length) {
        const f = file.files.at(-1)
        this._removeFile(f!)
      }
    }
    this._removeFile(file)
  }

  /**
   * 删除文件路径
   * @param file - 文件
   */
  _delFilePath(file: UploaderFile): void {
    if (file.path && (this as unknown as { filePaths?: Record<string, unknown> }).filePaths) {
      delete (this as unknown as { filePaths: Record<string, unknown> }).filePaths[file.path]
    }
    each(
      file.fileList,
      (f) => {
        this._delFilePath(f)
      },
      this,
    )
  }

  /**
   * 内部移除文件
   * @param file - 要移除的文件
   */
  private _removeFile(file: UploaderFile): void {
    if (!file.isFolder) {
      each(
        this.files,
        (f, i) => {
          if (f === file) {
            this.files.splice(i as number, 1)
            return false
          }
        },
        this,
      )
      file.abort()
      let parent = file.parent
      let newParent
      while (parent && parent !== this) {
        newParent = parent!.parent
        parent!._removeFile(file)
        parent = newParent
      }
    }
    if (file.parent === this) {
      each(
        this.fileList,
        (f, i) => {
          if (f === file) {
            this.fileList.splice(i as number, 1)
            return false
          }
        },
        this,
      )
    }
    if (!this.isRoot && this.isFolder && !this.files.length) {
      this.parent!._removeFile(this);
      (this.uploader as unknown as UploaderFile)._delFilePath(this)
    }
    file.parent = null
  }

  /**
   * 获取文件类型
   * @returns 文件类型
   */
  getType(): string {
    if (this.isFolder) {
      return 'folder'
    }
    return this.file!.type && this.file!.type.split('/')[1]!
  }

  /**
   * 获取文件扩展名
   * @returns 文件扩展名
   */
  getExtension(): string {
    if (this.isFolder) {
      return ''
    }
    return this.name.substring((~-this.name.lastIndexOf('.') >>> 0) + 2).toLowerCase()
  }
}

export default UploaderFile
