// 预编译正则表达式
const DASH_REGEX = /-/g

const hexList: string[] = []
for (let i = 0; i <= 15; i++) {
  hexList[i] = i.toString(16)
}

export function buildUUID(): string {
  let uuid = ''
  for (let i = 1; i <= 36; i++) {
    if (i === 9 || i === 14 || i === 19 || i === 24) {
      uuid += '-'
    }
    else if (i === 15) {
      uuid += 4
    }
    else if (i === 20) {
      uuid += hexList[(Math.random() * 4) | 8]
    }
    else {
      uuid += hexList[Math.trunc(Math.random() * 16)]
    }
  }
  return uuid.replace(DASH_REGEX, '')
}

let unique = 0
export function buildShortUUID(prefix = ''): string {
  const time = Date.now()
  const random = Math.floor(Math.random() * 1_000_000_000)
  unique++
  return `${prefix}_${random}${unique}${String(time)}`
}

/**
 * 唯一标识实现
 * @param {*} len
 * @param {*} radix
 */
export function uuid(len = 32, radix: any = 64, firstU = true): string {
  const chars = [...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz']
  const uid: string[] = []
  let i: number
  radix = radix || chars.length

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uid[i] = chars[0 | (Math.random() * radix)]!
  }
  else {
    // rfc4122, version 4 form
    let r: number

    // rfc4122 requires these characters
    uid[8] = uid[13] = uid[18] = uid[23] = '-'
    uid[14] = '4'

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uid[i]) {
        r = 0 | (Math.random() * 16)
        uid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r]!
      }
    }
  }

  // 移除第一个字符,并用u替代,因为第一个字符为数值时,该guuid不能用作id或者class
  if (firstU) {
    uid.shift()
    return `u${uid.join('')}`
  }
  else {
    return uid.join('')
  }
}
