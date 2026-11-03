import { floor, round } from 'lodash-es'

// 预编译正则表达式
// 注意：[^+-Ee] 中的 +-E 是范围（ASCII 43-69），包含 +,-./0-9:;<=>?@A-E
// 这里保持原有逻辑，只将正则移到模块作用域
// eslint-disable-next-line regexp/no-obscure-range
const NON_NUMERIC_REGEX = /[^+-Ee]/g
const THOUSANDS_REGEX = /(-?\d+)(\d{3})/

/**
 * 金额格式化输出
 * @param {*} number 要格式化的数字
 * @param {*} decimals 保留几位小数
 * @param {*} isFloorOrRound true:floor;false:round
 * @param {*} dec_point 小数点符号
 * @param {*} thousands_sep 千分位符号
 */
function fmtMoney(number, decimals = 2, isFloorOrRound = false, dec_point = '.', thousands_sep = ','): string {
  number = number.toString().replaceAll(NON_NUMERIC_REGEX, '')
  const n = !Number.isFinite(+number) ? 0 : +number
  const prec = !Number.isFinite(+decimals) ? 0 : Math.abs(decimals)
  const sep = thousands_sep
  const dec = dec_point

  const s = (isFloorOrRound ? `${floor(n, prec).toString()}` : round(n, prec).toString()).split(
    '.',
  )
  if (sep) {
    while (THOUSANDS_REGEX.test(s[0] || '')) {
      s[0] = (s[0] || '').replace(THOUSANDS_REGEX, `$1${sep}$2`)
    }
  }

  if ((s[1] || '').length < prec) {
    s[1] = s[1] || ''
    s[1] += Array.from({ length: prec - s[1].length + 1 }).join('0')
  }
  return s.join(dec)
}

export default fmtMoney
