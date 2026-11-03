import { request } from '@/service/http'

/** 文件资源 */
export default {

  /**
   * 获取API授权令牌
   * @param data 请求数据
   * @returns 请求方法对象
   */
  search: (data: FileStorage.FileResourceCondition) => request.Get<Service.ResultPage<FileStorage.FileResourceResult>>(`file/search`, {
    params: data,
  }),
  /**
   * 资源删除
   * @param data 请求数据
   * @returns 请求方法对象
   */
  delete: (data: FileStorage.FileDeleteRequest) => request.Post<Service.Response>(`file/resource/delete`, data),
  /**
   * 大文件分片上传完毕后续处理
   */
  uploadFragmentFinish: (data: FileStorage.UploadFragmentRequest) =>
    request.Post<Service.Result<FileStorage.FileResourceModel>>('file/resource/upload/fragment/finish', data),
  /**
   * 上传临时文件，基于base64字符传输
   */
  uploadImageTemp: (data: FileStorage.UploadImageTempRequest) => request.Post<Service.Result<FileStorage.FileResourceModel>>('file/resource/uploadimagetemp', data),
  /**
   * 上传文件，基于base64字符传输
   */
  uploadImage: (data: FileStorage.UploadImageRequest) => request.Post<Service.Result<FileStorage.FileResourceModel>>('file/resource/uploadimage', data),
}
