// 预编译正则表达式
const TRAILING_AMP_REGEX = /&$/
const TRAILING_QUESTION_REGEX = /\?$/
const TRAILING_SLASH_QUESTION_REGEX = /\/?$/

/**
 * 将对象添加当作参数拼接到URL上面
 * @param baseUrl 需要拼接的url
 * @param obj 参数对象
 * @returns {string} 拼接后的对象
 * 例子:
 *  let obj = {a: '3', b: '4'}
 *  setObjToUrlParams('www.baidu.com', obj)
 *  ==>www.baidu.com?a=3&b=4
 */
export function setObjToUrlParams(baseUrl: string, obj: object): string {
  let parameters = ''
  let url = ''
  for (const key in obj) {
    parameters += `${key}=${encodeURIComponent(obj[key])}&`
  }
  parameters = parameters.replace(TRAILING_AMP_REGEX, '')
  if (TRAILING_QUESTION_REGEX.test(baseUrl)) {
    url = baseUrl + parameters
  }
  else {
    url = baseUrl.replace(TRAILING_SLASH_QUESTION_REGEX, '?') + parameters
  }
  return url
}
