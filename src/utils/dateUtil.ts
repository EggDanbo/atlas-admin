import {
  addDays,
  addMonths,
  addYears,
  format,
  getTime,
  minutesToHours,
  secondsToMinutes,
  subDays,
  subMonths,
} from 'date-fns'

const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm:ss'
const DATE_FORMAT = 'yyyy-MM-dd'

/**
 * Date转换成日期时间格式字符串
 * @param date
 * @param formatStr
 */
export function formatToDateTime(date: Date | number, formatStr = DATE_TIME_FORMAT): string {
  return format(date, formatStr)
}

/**
 * Date转换成日期格式字符串
 * @param date
 * @param formatStr
 */
export function formatToDate(date: Date | number, formatStr = DATE_FORMAT): string {
  return format(date, formatStr)
}

/**
 * Date转换成时间戳
 * @param date
 */
export function dateToTimestamp(date: Date): number {
  return getTime(date)
}

export function getDateShortcuts() {
  const currDate = getCurrZeroTime()
  const currDateEnd = addDays(currDate, 1).getTime() - 1
  const dateShortcuts = {
    过去一年: [subMonths(currDate, 12).getTime(), currDateEnd] as [number, number],
    过去半年: [subMonths(currDate, 6).getTime(), currDateEnd] as [number, number],
    过去三个月: [subMonths(currDate, 3).getTime(), currDateEnd] as [number, number],
    过去一个月: [subMonths(currDate, 1).getTime(), currDateEnd] as [number, number],
    过去两周: [subDays(currDate, 14).getTime(), currDateEnd] as [number, number],
    过去一周: [subDays(currDate, 7).getTime(), currDateEnd] as [number, number],
    今天: [currDate.getTime(), currDateEnd] as [number, number],
  }
  return dateShortcuts
}

// 获取当前0点
function getCurrZeroTime() {
  const date = new Date()
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
}

// 获取当前时间戳
function getTimestamp(isDate) {
  const todayTimes = new Date()
  if (isDate) {
    return new Date(
      todayTimes.getFullYear(),
      todayTimes.getMonth(),
      todayTimes.getDate(),
      0,
      0,
      0,
      0,
    ).getTime()
  }
  return todayTimes.getTime()
}

export function getMonthTimestamp() {
  const todayTimes = new Date()
  return new Date(todayTimes.getFullYear(), todayTimes.getMonth(), 1, 0, 0, 0, 0).getTime()
}

/**
 * Date格式
 */
export function defDate({ start, ymd, isDate = true }) {
  const now = getTimestamp(isDate)
  let startTime = now
  let endTime = now

  if (start && start !== 0) {
    if (ymd === 'y') {
      startTime = addYears(now, start).getTime()
    }
    else if (ymd === 'm') {
      startTime = addMonths(now, start).getTime()
    }
    else if (ymd === 'd') {
      startTime = addDays(now, start).getTime()
    }
  }

  endTime = addDays(getTimestamp(true), 1).getTime() - 1

  return [startTime, endTime] as [number, number]
}

/**
 * 解构date值
 */
export function unDate({ dateArr, start = 'time_begin', end = 'time_end', isDateTime = false }) {
  if (!dateArr) {
    return null
  }
  const obj = {}
  if (dateArr.length > 0) {
    obj[start] = dateArr[0]
  }
  if (dateArr.length > 0) {
    obj[end] = isDateTime ? dateArr[1] : addDays(dateArr[1], 1).getTime()
  }

  return obj
}

/**
 * 格式化时间显示
 * @param sec 总秒数
 */
export function formatSeconds(sec: number) {
  let prefix = ''
  if (sec >= 86_400) {
    prefix = '次日'
    sec -= 86_400
  }

  let minutes = secondsToMinutes(sec)
  const hours = minutesToHours(minutes)

  if (hours > 0) {
    minutes -= hours * 60
  }

  let hourStr = hours.toString()
  if (hours < 10) {
    hourStr = `0${hours}`
  }

  const minutesStr = minutes < 10 ? `0${minutes}` : minutes
  return `${prefix}${hourStr}:${minutesStr}`
}

/**
 * 返回当前月份的第一天和最后一天
 */
export function getMonthFirstAndLastDayTimestamp() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  const currentDay = new Date(currentYear, currentMonth + 1, 0).getDate()

  const firstMonthDate = new Date(currentYear, currentMonth, 1, 0, 0, 0)
  const firstMonthTimestamp = firstMonthDate.getTime()

  const lastMonthDate = new Date(currentYear, currentMonth, currentDay, 23, 59, 59)
  const lastMonthTimestamp = lastMonthDate.getTime()

  return [firstMonthTimestamp, lastMonthTimestamp]
}

/**
 * 返回当前年份的第一天和最后一天
 */
export function getYearFirstAndLastMonthTimestamp() {
  const currentYear = new Date().getFullYear()

  const firstMonthDate = new Date(currentYear, 0, 1, 0, 0, 0)
  const firstMonthTimestamp = firstMonthDate.getTime()

  const lastMonthDate = new Date(currentYear + 1, 0, 0, 23, 59, 59)
  const lastMonthTimestamp = lastMonthDate.getTime()

  return [firstMonthTimestamp, lastMonthTimestamp]
}

/**
 * 把接口返回的「年份」转成日期选择器需要的时间戳
 *
 * 后端只给年份（如 2026），直接 `Number()` 交给 n-date-picker 会被当成毫秒数，
 * 渲染出来是 1970。这里统一转成该年 1 月 1 日（或该年当前月 1 日）的时间戳。
 *
 * @param value 接口返回值，可能是 2026、'2026' 或已是时间戳
 * @param unit  year 用于年度选择器，month 用于月度选择器
 */
export function resolvePeriodTimestamp(value: unknown, unit: 'year' | 'month' = 'year'): number | null {
  const raw = Number(value)
  if (!Number.isFinite(raw) || raw <= 0)
    return null
  // 已经是时间戳（毫秒）就直接用
  if (raw > 100_000_000_000)
    return raw
  // 合理年份：1900 - 2999
  if (raw < 1900 || raw > 2999)
    return null
  const month = unit === 'month' ? new Date().getMonth() : 0
  return new Date(raw, month, 1).getTime()
}
