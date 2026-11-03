import type { FormItemRule } from 'naive-ui'

/**
 * Reg 配置规则
 * 可根据项目情况自行修改
 */
const RegConfig = {
  mobileReg: {
    reg: /^(?:(?:\+|00)86)?1[3-9]\d{9}$/,
    label: '手机号码',
  },
  emialReg: {
    reg: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])|(([a-z\-0-9]+\.)+[a-z]{2,}))$/i,
    label: '邮箱',
  },
}

function get(key) {
  return RegConfig[key] || {}
}

/**
 * @param label {string} 提示字段名
 * @param type {number} 0 | 1
 */
function reError(label: string, type = 0) {
  if (!type) {
    return new Error(`${label}不能为空`)
  }
  return new Error(`${label}不正确`)
}

/**
 * @param value 验证的值
 * @param label 提示字段名
 * @param reg 验证规则
 */
function verificate(value, label, reg) {
  if (!value) {
    return reError(label)
  }
  if (!reg.test(value)) {
    return reError(label, 1)
  }
  return true
}

/**
 * 统一表单验证规则 <br />
 * 把项目一些常用的验证规则进行定义 <br />
 * 还可以循环构建以下代码，为了清晰一点，逐个定义也不是很麻烦 <br />
 */
export function useVerificate() {
  /**
   * @param _ {*} FormItemRule
   * @param value {*} 验证值
   * @returns {boolean | Error} 验证结果，true表示验证通过，Error表示验证失败
   */
  function isMobile(_: FormItemRule, value: string) {
    const { reg, label } = get('mobileReg')
    return verificate(value, label, reg)
  }

  /**
   * @param _ {*} FormItemRule
   * @param value {*} 验证值
   * @returns {boolean | Error} 验证结果，true表示验证通过，Error表示验证失败
   */
  function isEmial(_: FormItemRule, value: string) {
    const { reg, label } = get('emialReg')
    return verificate(value, label, reg)
  }

  return {
    isMobile,
    isEmial,
  }
}
