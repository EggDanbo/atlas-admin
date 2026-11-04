// 预编译正则表达式
const SAFARI_REGEX = /Safari/
// eslint-disable-next-line regexp/no-dupe-disjunctions
const NON_SAFARI_REGEX = /Chrome|CriOS|Edg|Edge|Chromium/

export function isSafari() {
  const ua = navigator.userAgent
  return SAFARI_REGEX.test(ua) && !NON_SAFARI_REGEX.test(ua)
}
