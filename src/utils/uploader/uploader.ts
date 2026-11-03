/**
 * 上传器主类
 * 提供文件分片上传功能
 */

import type { ChunkStatus, ExtendedFile, NativeFile } from './types'
import { Chunk } from './chunk'
import event from './event'
import { UploaderFile } from './file'
import utils, {
  bind,
  each,
  isDefined,
  isFunction,
  preventEvent,
} from './utils'

/** 版本号 */
const version = '__VERSION__'

/** 预编译正则表达式 */
const NON_WORD_DASH_REGEX = /[^\w-]/g

/** 是否为服务器环境 */
const isServer = typeof window === 'undefined'

/** ie10+ */
const ie10plus = isServer ? false : (window.navigator as Navigator & { msPointerEnabled?: boolean }).msPointerEnabled

/** Blob 原型接口 */
interface BlobPrototype {
  slice?: (start?: number, end?: number, contentType?: string) => Blob
  webkitSlice?: (start?: number, end?: number, contentType?: string) => Blob
  mozSlice?: (start?: number, end?: number, contentType?: string) => Blob
}

/** 检测浏览器支持 */
const support = ((): boolean => {
  if (isServer) {
    return false
  }
  let sliceName = 'slice'
  let _support
    = isDefined(window.File)
      && isDefined(window.Blob)
      && isDefined(window.FileList)
  let bproto: BlobPrototype | null = null
  if (_support) {
    bproto = window.Blob.prototype as BlobPrototype
    each(['slice', 'webkitSlice', 'mozSlice'], (n) => {
      if ((bproto as BlobPrototype)[n as keyof BlobPrototype]) {
        sliceName = n
        return false
      }
    })
    _support = !!(bproto as BlobPrototype)[sliceName as keyof BlobPrototype]
  }
  // 在类声明后设置 sliceName
  if (_support) {
    (globalThis as unknown as { __uploaderSliceName?: string }).__uploaderSliceName = sliceName
  }
  bproto = null
  return _support
})()

/** 检测是否支持目录上传 */
const supportDirectory = ((): boolean => {
  if (isServer) {
    return false
  }
  const input = window.document.createElement('input')
  input.type = 'file'
  const sd = 'webkitdirectory' in input || 'directory' in input
  return sd
})()

/**
 * 默认文件读取函数（使用 Web API）
 * @param fileObj - 文件对象
 * @param fileType - 文件类型
 * @param startByte - 起始字节
 * @param endByte - 结束字节
 * @param chunk - 分片对象
 */
function webAPIFileRead(fileObj: UploaderFile, fileType: string, startByte: number, endByte: number, chunk: Chunk): void {
  const sliceMethod = Uploader.sliceName as keyof File
  const file = fileObj.file as File
  const sliceFn = file[sliceMethod] as (start?: number, end?: number, contentType?: string) => Blob
  chunk.readFinished(sliceFn.call(file, startByte, endByte, fileType))
}

/** 上传器配置选项 */
export interface UploaderOptions {
  chunkSize: number
  forceChunkSize: boolean
  simultaneousUploads: number
  singleFile: boolean
  fileParameterName: string
  progressCallbacksInterval: number
  speedSmoothingFactor: number
  query: Record<string, unknown> | ((file: UploaderFile, chunk: Chunk, isTest: boolean) => Record<string, unknown>)
  headers: Record<string, string> | ((file: UploaderFile, chunk: Chunk, isTest: boolean) => Record<string, string>)
  withCredentials: boolean
  preprocess: ((chunk: Chunk) => void) | null
  method: 'multipart' | 'octet'
  testMethod: string | ((file: UploaderFile, chunk: Chunk) => string)
  uploadMethod: string | ((file: UploaderFile, chunk: Chunk) => string)
  prioritizeFirstAndLastChunk: boolean
  allowDuplicateUploads: boolean
  target: string | ((file: UploaderFile, chunk: Chunk, isTest: boolean) => string)
  testChunks: boolean
  generateUniqueIdentifier: ((file: NativeFile) => string) | null
  maxChunkRetries: number
  chunkRetryInterval: number | null
  permanentErrors: number[]
  successStatuses: number[]
  onDropStopPropagation: boolean
  initFileFn: ((file: UploaderFile) => void) | null
  readFileFn: (fileObj: UploaderFile, fileType: string, startByte: number, endByte: number, chunk: Chunk) => void
  checkChunkUploadedByResponse: ((chunk: Chunk, message: string) => boolean) | null
  initialPaused: boolean
  processResponse: (response: string, cb: (err: Error | null, res: string) => void, file: UploaderFile, chunk: Chunk) => void
  processParams: (params: Record<string, unknown>, file: UploaderFile, chunk: Chunk, isTest: boolean) => Record<string, unknown>
}

/** 部分上传器配置 */
export type PartialUploaderOptions = Partial<UploaderOptions>

/**
 * 上传器类
 * 继承自 UploaderFile 和 EventEmitter
 */
export class Uploader extends UploaderFile {
  /** 版本号 */
  static version = version
  /** 默认配置 */
  static defaults: UploaderOptions = {
    chunkSize: 1024 * 1024,
    forceChunkSize: false,
    simultaneousUploads: 3,
    singleFile: false,
    fileParameterName: 'file',
    progressCallbacksInterval: 500,
    speedSmoothingFactor: 0.1,
    query: {},
    headers: {},
    withCredentials: false,
    preprocess: null,
    method: 'multipart',
    testMethod: 'GET',
    uploadMethod: 'POST',
    prioritizeFirstAndLastChunk: false,
    allowDuplicateUploads: false,
    target: '/',
    testChunks: true,
    generateUniqueIdentifier: null,
    maxChunkRetries: 0,
    chunkRetryInterval: null,
    permanentErrors: [404, 415, 500, 501],
    successStatuses: [200, 201, 202],
    onDropStopPropagation: false,
    initFileFn: null,
    readFileFn: webAPIFileRead,
    checkChunkUploadedByResponse: null,
    initialPaused: false,
    processResponse(response, cb) {
      cb(null, response)
    },
    processParams(params) {
      return params
    },
  }

  /** 工具函数 */
  static utils = utils
  /** 事件模块 */
  static event = event
  /** 文件类 */
  static File = UploaderFile
  /** 分片类 */
  static Chunk = Chunk
  /** Blob 切片方法名 */
  static sliceName = 'slice'

  /** 浏览器支持 */
  support: boolean
  /** 是否支持目录上传 */
  supportDirectory!: boolean
  /** 文件路径映射 */
  declare filePaths: Record<string, UploaderFile>
  /** 配置选项 */
  opts: UploaderOptions
  /** 阻止事件处理函数 */
  preventEvent: (e: Event) => void
  /** 拖放处理函数 */
  private _onDrop: ((evt: DragEvent) => void) | null = null
  /** 事件数据 */
  protected _eventData: Record<string, ((...args: unknown[]) => boolean | void | undefined | Promise<void>)[]> | null = null

  /**
   * 构造函数
   * @param opts - 配置选项
   */
  constructor(opts?: PartialUploaderOptions) {
    // 调用父类构造函数（使用 any 类型断言避免循环类型检查）
    super(undefined as any, undefined, undefined)

    // 重新设置 uploader 属性
    Object.defineProperty(this, 'uploader', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: this,
    })

    this.support = support
    if (!this.support) {
      this.opts = Uploader.defaults
      this.preventEvent = () => {}
      return this
    }
    this.supportDirectory = supportDirectory

    Object.defineProperty(this, 'filePaths', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: {},
    })

    this.opts = { ...Uploader.defaults, ...opts } as UploaderOptions
    this.preventEvent = bind<(e: Event) => void>(this._preventEvent, this)

    // 重新初始化根节点状态
    this.isRoot = true
    this.isFolder = true
    this.file = null
    this.paused = this.opts.initialPaused
  }

  /**
   * 触发事件
   * @param name - 事件名称
   * @param args - 事件参数
   * @returns 是否未阻止默认行为
   */
  _trigger(name: string, ...args: unknown[]): boolean {
    const eventArgs: unknown[] = [name, ...args]
    let preventDefault = !this.trigger(name, ...args)
    if (name !== 'catchAll') {
      eventArgs.unshift('catchAll')
      preventDefault = !this.trigger(...eventArgs as [string, ...unknown[]]) || preventDefault
    }
    return !preventDefault
  }

  /**
   * 异步触发事件
   */
  _triggerAsync(...args: unknown[]): void {
    const asyncArgs: unknown[] = args
    utils.nextTick(() => {
      this._trigger(...asyncArgs as [string, ...unknown[]])
    }, this)
  }

  /**
   * 订阅事件
   * @param name - 事件名称
   * @param func - 事件处理函数
   */
  on(name: string, func: (...args: unknown[]) => boolean | void | undefined | Promise<void>): void {
    if (!this._eventData)
      this._eventData = {}
    if (!this._eventData[name])
      this._eventData[name] = []

    let listened = false
    each(this._eventData[name], (fuc) => {
      if (fuc === func) {
        listened = true
        return false
      }
    })

    if (!listened) {
      this._eventData[name].push(func)
    }
  }

  /**
   * 取消订阅事件
   * @param name - 事件名称
   * @param func - 可选，指定要移除的处理函数
   */
  off(name: string, func?: (...args: unknown[]) => boolean | void | undefined): void {
    if (!this._eventData)
      this._eventData = {}
    if (!this._eventData[name] || !this._eventData[name].length)
      return

    const handlers = this._eventData[name]!
    if (func) {
      each(handlers, (fuc, i) => {
        if (fuc === func) {
          handlers.splice(i as number, 1)
          return false
        }
      })
    }
    else {
      this._eventData[name] = []
    }
  }

  /**
   * 触发事件
   * @param name - 事件名称
   * @param args - 事件参数
   * @returns 是否未阻止默认行为
   */
  trigger(name: string, ...args: unknown[]): boolean {
    if (!this._eventData)
      this._eventData = {}
    if (!this._eventData[name])
      return true

    let preventDefault = false
    each(this._eventData[name], (fuc) => {
      preventDefault = fuc.apply(this, args) === false || preventDefault
    })
    return !preventDefault
  }

  /**
   * 添加多个文件
   * @param files - 文件列表
   * @param evt - 可选，触发事件
   */
  addFiles(files: NativeFile[] | FileList, evt?: Event): void {
    const _files: UploaderFile[] = []
    const oldFileListLen = this.fileList.length

    each(
      files as ArrayLike<NativeFile>,
      (file) => {
        // 上传空文件 IE10/IE11 会无限挂起
        // 目录大小为 0 且名称为 '.'
        // 如果 opts.allowDuplicateUploads 为 false，则忽略已添加的文件
        const extFile = file as ExtendedFile
        if (
          (!ie10plus || (ie10plus && extFile.size > 0))
          && !(extFile.size % 4096 === 0 && (extFile.name === '.' || extFile.fileName === '.'))
        ) {
          const uniqueIdentifier = this.generateUniqueIdentifier(file)
          if (this.opts.allowDuplicateUploads || !this.getFromUniqueIdentifier(uniqueIdentifier)) {
            const _file = new UploaderFile(this as any, file, this)
            _file.uniqueIdentifier = uniqueIdentifier
            if (this._trigger('fileAdded', _file, evt)) {
              _files.push(_file)
            }
            else {
              UploaderFile.prototype.removeFile.call(this, _file)
            }
          }
        }
      },
      this,
    )

    // 获取新文件列表
    const newFileList = this.fileList.slice(oldFileListLen)
    if (this._trigger('filesAdded', _files, newFileList, evt)) {
      each(
        _files,
        (file) => {
          if (this.opts.singleFile && this.files.length > 0) {
            const firstFile = this.files[0]
            if (firstFile) {
              this.removeFile(firstFile)
            }
          }
          this.files.push(file)
        },
        this,
      )
      this._trigger('filesSubmitted', _files, newFileList, evt)
    }
    else {
      each(
        newFileList,
        (file) => {
          UploaderFile.prototype.removeFile.call(this, file)
        },
        this,
      )
    }
  }

  /**
   * 添加单个文件
   * @param file - 文件
   * @param evt - 可选，触发事件
   */
  addFile(file: NativeFile, evt?: Event): void {
    this.addFiles([file], evt)
  }

  /**
   * 取消所有上传
   */
  cancel(): void {
    for (let i = this.fileList.length - 1; i >= 0; i--) {
      const file = this.fileList[i]
      if (file) {
        file.cancel()
      }
    }
  }

  /**
   * 移除文件
   * @param file - 要移除的文件
   */
  removeFile(file: UploaderFile): void {
    UploaderFile.prototype.removeFile.call(this, file)
    this._trigger('fileRemoved', file)
  }

  /**
   * 生成唯一标识符
   * @param file - 文件
   * @returns 唯一标识符
   */
  generateUniqueIdentifier(file: NativeFile): string {
    const custom = this.opts.generateUniqueIdentifier
    if (isFunction(custom)) {
      return custom(file)
    }
    // 不同版本的 Firefox 有一些混淆
    const extFile = file as ExtendedFile
    const relativePath
      = extFile.relativePath
        || extFile.webkitRelativePath
        || extFile.fileName
        || extFile.name
    return `${extFile.size}-${relativePath.replace(NON_WORD_DASH_REGEX, '_')}`
  }

  /**
   * 根据唯一标识符获取文件
   * @param uniqueIdentifier - 唯一标识符
   * @returns 文件或 false
   */
  getFromUniqueIdentifier(uniqueIdentifier: string): UploaderFile | false {
    let ret: UploaderFile | false = false
    each(this.files, (file) => {
      if (file.uniqueIdentifier === uniqueIdentifier) {
        ret = file
        return false
      }
    })
    return ret
  }

  /**
   * 上传下一个分片
   * @param preventEvents - 是否阻止事件
   * @returns 是否有上传任务
   */
  uploadNextChunk(preventEvents?: boolean): boolean {
    let found = false
    const pendingStatus: ChunkStatus = 'pending'
    const checkChunkUploaded = this.opts.checkChunkUploadedByResponse

    if (this.opts.prioritizeFirstAndLastChunk) {
      each(this.files, (file) => {
        if (file.paused) {
          return
        }
        if (checkChunkUploaded && !file._firstResponse && file.isUploading()) {
          // 等待当前文件的第一个分片响应
          return
        }
        const firstChunk = file.chunks[0]
        const lastChunk = file.chunks.at(-1)
        if (file.chunks.length && firstChunk && firstChunk.status() === pendingStatus) {
          firstChunk.send()
          found = true
          return false
        }
        if (
          file.chunks.length > 1
          && lastChunk
          && lastChunk.status() === pendingStatus
        ) {
          lastChunk.send()
          found = true
          return false
        }
      })
      if (found) {
        return found
      }
    }

    // 现在，简单地寻找下一个最好的上传对象
    each(this.files, (file) => {
      if (!file.paused) {
        if (checkChunkUploaded && !file._firstResponse && file.isUploading()) {
          // 等待当前文件的第一个分片响应
          return
        }
        each(file.chunks, (chunk) => {
          if (chunk.status() === pendingStatus) {
            chunk.send()
            found = true
            return false
          }
        })
      }
      if (found) {
        return false
      }
    })
    if (found) {
      return true
    }

    // 没有更多未完成的分片需要上传，检查是否全部完成
    let outstanding = false
    each(this.files, (file) => {
      if (!file.isComplete()) {
        outstanding = true
        return false
      }
    })
    // 应该现在检查文件
    // 如果列表中没有文件
    // 不应该触发完成事件
    if (!outstanding && !preventEvents && this.files.length) {
      // 所有分片已上传，完成
      this._triggerAsync('complete')
    }
    return outstanding
  }

  /**
   * 开始上传
   * @param preventEvents - 是否阻止事件
   */
  upload(preventEvents?: boolean): void {
    // 确保我们不会同时开始太多上传
    const ret = this._shouldUploadNext()
    if (ret === false) {
      return
    }
    !preventEvents && this._trigger('uploadStart')
    let started = false
    const uploadCount = typeof ret === 'number' ? ret : 0
    for (let num = 1; num <= this.opts.simultaneousUploads - uploadCount; num++) {
      started = this.uploadNextChunk(!preventEvents) || started
      if (!started && preventEvents) {
        // 已完成
        break
      }
    }
    if (!started && !preventEvents) {
      this._triggerAsync('complete')
    }
  }

  /**
   * 判断是否应该上传下一个分片
   * @returns false 表示不应上传，否则返回正在上传的分片数量
   */
  private _shouldUploadNext(): boolean | number {
    let num = 0
    let should = true
    const simultaneousUploads = this.opts.simultaneousUploads
    const uploadingStatus: ChunkStatus = 'uploading'

    each(this.files, (file) => {
      each(file.chunks, (chunk) => {
        if (chunk.status() === uploadingStatus) {
          num++
          if (num >= simultaneousUploads) {
            should = false
            return false
          }
        }
      })
      return should
    })
    // 如果 should 为 true，则返回正在上传的分片数量
    return should && num
  }

  /**
   * 分配浏览按钮
   * @param domNodes - DOM 节点或节点数组
   * @param isDirectory - 是否允许选择目录
   * @param singleFile - 是否单文件
   * @param attributes - 自定义属性
   */
  assignBrowse(
    domNodes: Element | Element[],
    isDirectory?: boolean,
    singleFile?: boolean,
    attributes?: Record<string, string>,
  ): void {
    if (!('length' in domNodes)) {
      domNodes = [domNodes]
    }

    each(
      domNodes,
      (domNode) => {
        let input: HTMLInputElement
        if ((domNode as HTMLElement).tagName === 'INPUT' && (domNode as HTMLInputElement).type === 'file') {
          input = domNode as HTMLInputElement
        }
        else {
          input = document.createElement('input')
          input.setAttribute('type', 'file')
          // display:none - 在 opera 12 中不起作用
          input.style.visibility = 'hidden'
          input.style.position = 'absolute'
          input.style.width = '1px'
          input.style.height = '1px'
          // 对于 opera 12 浏览器，input 必须分配给一个文档
          domNode.append(input)
          // https://developer.mozilla.org/en/using_files_from_web_applications)
          // 事件监听器执行两次
          // 第一次 - 原始鼠标点击事件
          // 第二次 - input.click()，input 在 domNode 内部
          domNode.addEventListener(
            'click',
            (_e) => {
              if ((domNode as HTMLElement).tagName.toLowerCase() === 'label') {
                return
              }
              input.click()
            },
            false,
          )
        }
        if (!this.opts.singleFile && !singleFile) {
          input.setAttribute('multiple', 'multiple')
        }
        if (isDirectory) {
          input.setAttribute('webkitdirectory', 'webkitdirectory')
        }
        if (attributes) {
          each(attributes, (value, key) => {
            input.setAttribute(key as string, value)
          })
        }
        // 当添加新文件时，简单地将它们追加到总列表中
        input.addEventListener(
          'change',
          (e) => {
            this._trigger((e as Event).type, e)
            if ((e.target as HTMLInputElement).value) {
              this.addFiles((e.target as HTMLInputElement).files!, e);
              (e.target as HTMLInputElement).value = ''
            }
          },
          false,
        )
      },
      this,
    )
  }

  /**
   * 拖放事件处理
   * @param evt - 拖放事件
   */
  onDrop(evt: DragEvent): void {
    this._trigger(evt.type, evt)
    if (this.opts.onDropStopPropagation) {
      evt.stopPropagation()
    }
    evt.preventDefault()
    this._parseDataTransfer(evt.dataTransfer!, evt)
  }

  /**
   * 解析 DataTransfer
   * @param dataTransfer - DataTransfer 对象
   * @param evt - 事件
   */
  private _parseDataTransfer(dataTransfer: DataTransfer, evt: DragEvent): void {
    if (dataTransfer.items && dataTransfer.items[0] && (dataTransfer.items[0] as DataTransferItem & { webkitGetAsEntry?: () => FileSystemEntry }).webkitGetAsEntry) {
      this.webkitReadDataTransfer(dataTransfer, evt)
    }
    else {
      this.addFiles(dataTransfer.files, evt)
    }
  }

  /**
   * 使用 WebKit API 读取 DataTransfer
   * @param dataTransfer - DataTransfer 对象
   * @param evt - 事件
   */
  private webkitReadDataTransfer(dataTransfer: DataTransfer, evt: DragEvent): void {
    // eslint-disable-next-line ts/no-this-alias
    const self = this
    let queue = dataTransfer.items.length
    const files: NativeFile[] = []

    each(dataTransfer.items, (item) => {
      const entry = (item as DataTransferItem & { webkitGetAsEntry: () => FileSystemEntry }).webkitGetAsEntry()
      if (!entry) {
        decrement()
        return
      }
      if (entry.isFile) {
        // 由于 Chrome 的 File System API 实现中的 bug - #149735
        fileReadSuccess(item.getAsFile()!, entry.fullPath)
      }
      else {
        readDirectory((entry as FileSystemDirectoryEntry).createReader())
      }
    })

    function readDirectory(reader: FileSystemDirectoryReader): void {
      reader.readEntries((entries) => {
        if (entries.length) {
          queue += entries.length
          each(entries, (entry) => {
            if (entry.isFile) {
              const fullPath = entry.fullPath;
              (entry as FileSystemFileEntry).file((file) => {
                fileReadSuccess(file, fullPath)
              }, readError)
            }
            else if (entry.isDirectory) {
              readDirectory((entry as FileSystemDirectoryEntry).createReader())
            }
          })
          readDirectory(reader)
        }
        else {
          decrement()
        }
      }, readError)
    }

    function fileReadSuccess(file: NativeFile, fullPath: string): void {
      // 相对路径不应以 "/" 开头
      const extFile = file as unknown as ExtendedFile & { relativePath: string }
      extFile.relativePath = fullPath.slice(1)
      files.push(file)
      decrement()
    }

    function readError(fileError: DOMException): void {
      throw fileError
    }

    function decrement(): void {
      if (--queue === 0) {
        self.addFiles(files, evt)
      }
    }
  }

  /**
   * 辅助函数：分配或取消分配事件
   * @param domNodes - DOM 节点
   * @param handles - 事件处理器映射
   * @param remove - 是否移除
   */
  private _assignHelper(
    domNodes: Element | Element[],
    handles: Record<string, (e: Event) => void>,
    remove?: boolean,
  ): void {
    if (!('length' in domNodes)) {
      domNodes = [domNodes]
    }
    const evtMethod = remove ? 'removeEventListener' : 'addEventListener'
    each(
      domNodes,
      (domNode) => {
        each(
          handles,
          (handler, name) => {
            (domNode as HTMLElement)[evtMethod](name as string, handler, false)
          },
          this,
        )
      },
      this,
    )
  }

  /**
   * 阻止默认事件并触发
   * @param e - 事件
   */
  private _preventEvent(e: Event): void {
    preventEvent(e)
    this._trigger(e.type, e)
  }

  /**
   * 分配拖放区域
   * @param domNodes - DOM 节点或节点数组
   */
  assignDrop(domNodes: Element | Element[]): void {
    this._onDrop = bind<(e: DragEvent) => void>(this.onDrop, this)
    this._assignHelper(domNodes, {
      dragover: this.preventEvent,
      dragenter: this.preventEvent,
      dragleave: this.preventEvent,
      drop: this._onDrop as (e: Event) => void,
    })
  }

  /**
   * 取消分配拖放区域
   * @param domNodes - DOM 节点或节点数组
   */
  unAssignDrop(domNodes: Element | Element[]): void {
    this._assignHelper(
      domNodes,
      {
        dragover: this.preventEvent,
        dragenter: this.preventEvent,
        dragleave: this.preventEvent,
        drop: this._onDrop as (e: Event) => void,
      },
      true,
    )
    this._onDrop = null
  }
}

// 初始化 sliceName（从支持检测中获取）
if (support && (window as unknown as { __uploaderSliceName?: string }).__uploaderSliceName) {
  Uploader.sliceName = (window as unknown as { __uploaderSliceName: string }).__uploaderSliceName
}

export default Uploader
