// 请求配置
export const defaultConfig: AlovaService.Config = {
  // 自定义配置 给 alova 封装的实例使用
  codeField: 'code',
  messageField: 'message',
  dataField: 'data',
  successCode: 0,
  tokenField: 'Authorization', // Token 字段名
  authenticationScheme: '', // Token 认证方案
  joinTime: false, // 是否需要加入时间戳
  baseURL: '',
  // alova 配置
  alovaConfig: {
    cacheLogger: import.meta.env.DEV, // 在开发环境开启缓存命中日志
    cacheFor: null, // 关闭全局请求缓存
    timeout: 15 * 1000, // 超时时间
  },
}

// 错误信息 可根据项目情况 按需修改或使用
export const errorConfig = {
  // 错误时是否显示 message
  isShowMessage: true,
  default: '请求失败',
  500: '服务器错误',
  701: '请求失败',
  720: '请求超时',
  730: '参数错误',
  900: '暂无权限',
  901: '缺少凭证',
  902: '凭证校验失败',
  903: '账号异常',
  912: '需要登录',
  415: '参数格式错误',
}

export const responseStatus = {
  default: '请求错误',
  400: '请求出现语法错误',
  401: '用户未授权',
  403: '服务器拒绝访问',
  404: '请求的资源不存在',
  405: '请求方法未允许',
  408: '网络请求超时',
  500: '服务器内部错误',
  501: '服务器未实现请求功能',
  502: '错误网关',
  503: '服务不可用',
  504: '网关超时',
  505: 'http版本不支持该请求',
}

export const noErrorTipCodes = [10000] // 不需要错误提示的 code
