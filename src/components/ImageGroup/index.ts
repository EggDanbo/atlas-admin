import { useGlobSetting } from '@/hooks/setting'

export { default as NaImageGroup } from './src/ImageGroup.vue'

// 预编译正则表达式：用于匹配完整的 HTTP/HTTPS URL
const HTTP_URL_REGEX = /^(?:http|https):\/\//

const globSetting = useGlobSetting()
// 组装完整图片地址
export function fullImgUrl(url: string): string {
  const { fileUrl } = globSetting
  return HTTP_URL_REGEX.test(url) ? url : `${fileUrl}${url}`
}
