declare namespace FileStorage {

  /** 上传临时图片，基于base64字符传输 */
  interface UploadImageTempRequest {
    /** base64图像数据 */
    data?: string | null | undefined
    /** 名称 */
    name?: string | null | undefined
    /** 是否开启水印 */
    watermark?: boolean | null | undefined
    /** 水印位置，按照小键盘方式定位1 ~ 9，默认3 */
    watermark_pos?: number | null | undefined
    /** 水印文字，空时默认为时间 */
    watermark_text?: string | null | undefined
    /** 是否开启质量处理，大于0则除了gif外转为jpeg图片 */
    quality?: number | null | undefined
  }

  /** 上传图片，基于base64字符传输 */
  interface UploadImageRequest extends UploadImageTempRequest {
    /** 关联的业务Id */
    xid?: string | null | undefined
    /** 分类 */
    mark?: string | null | undefined
  }

  /** 大文件分片上传完毕后续处理 */
  interface UploadFragmentRequest extends UploadImageRequest {
    /** 已上传的文件唯一标识 */
    identifier: string
    /** 是否临时文件 */
    temp: boolean
  }

  /** 文件资源模型 */
  interface FileResourceModel {
    /** 文件ID */
    id: string
    /** url */
    url: string
    /** 名称 */
    name: string
    /** 是否为图片 */
    image: boolean
    /** 文件MIME类型 */
    content_type: string
    /** 文件大小 */
    size: string
  }

  /** 资源删除 */
  interface FileDeleteRequest {
    /** 列表 */
    list?: string[] | null | undefined
    /** 关联ID */
    xid?: string | null | undefined
    /** (可选)分类 */
    mark?: string | null | undefined
  }

  /** 文件资源查询 */
  interface FileResourceCondition {
    /** 页码从 1 开始，如果设置值小于 1，则实际返回 1 */
    page?: null | number
    /** 获取或设置分页数据行数 */
    pagesize?: null | number
    /** 搜索文件名 */
    name?: string | null | undefined
    /** (可选)业务关联,默认查询自己上传的数据 */
    xid?: string | null | undefined
    /** 分类 */
    mark?: string | null | undefined
    /** 是否查看隐藏 */
    hide: number
  }

  /** 文件资源视图 */
  interface FileResourceResult {
    /** 文件ID */
    id?: string | null | undefined
    /** 关联ID */
    xid?: string | null | undefined
    /** 分类 */
    mark: string
    /** url */
    url: string
    /** 名称 */
    name: string
    /** 文件mime */
    mime: string
    /** 宽*高(不为空表示图片) */
    scale: string
    /** 扩展名 */
    extension: string
    /** 文件大小 */
    size: string
    /** 文件hash */
    hash: string
    /** 创建时间 */
    ctime: string
  }
}
