export const rules = {
  // 验证手机
  isMobileNumber: /^1[1|3-9]\d{9}$/,
  // 验证数字
  isNumber: /^\d*$/,
  isLowerCase: /^[a-z]+&/,
  isUpperCase: /^[A-Z]+&/,
  isAlphabets: /^[A-Z]+&/i,
  // 验证价格（正数金额）
  isPrice: /(^[1-9](\d+)?(\.\d{1,2})?$)|(^0$)|(^\d\.\d{1,2}$)/,
  isEmail: /^([0-9a-z]+[-._+&])*[0-9a-z]+@([-0-9a-z]+\.)+[a-z]{2,6}$/i,
  isCertificateNumber: /(^\d{15}$)|(^\d{18}$)|(^\d{17}([\dX])$)/i,
  isUrl:
    /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d?)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:\d+)*(\/($|[\w.,?'\\+&%$#=~-]+))*$/,
}

export function validEmail(_rule, value, callback) {
  if (!value) {
    callback(new Error('请输入邮箱'))
    return undefined
  }
  if (!rules.isEmail.test(value)) {
    callback(new Error('邮箱格式不正确'))
    return undefined
  }
  callback()
}

export function validMobileNumber(_rule, value, callback) {
  if (!value) {
    callback(new Error('请输入手机号码'))
    return undefined
  }
  if (!rules.isMobileNumber.test(value)) {
    callback(new Error('手机号码格式不正确'))
    return undefined
  }
  callback()
}

export function validUrl(_rule, value, callback) {
  if (value && !rules.isUrl.test(value)) {
    callback(new Error('不合法的Url'))
    return undefined
  }
  callback()
}

export function validCertificateNumber(_rule, value, callback) {
  if (value && !rules.isCertificateNumber.test(value)) {
    callback(new Error('身份证号码格式不正确'))
    return undefined
  }
  callback()
}
