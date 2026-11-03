import type { ShortcutItem } from './types'
import { endOfDay, startOfDay, subDays, subMonths, subYears } from 'date-fns'

/** 默认快捷选项：今天、近一周、近一月、近三月、近一年 */
export function getDefaultShortcuts(): ShortcutItem[] {
  const now = new Date()
  return [
    {
      key: 'today',
      label: '今天',
      getRange: () => [startOfDay(now).getTime(), endOfDay(now).getTime()],
    },
    {
      key: 'threeday',
      label: '近三天',
      getRange: () => [startOfDay(subDays(now, 3)).getTime(), endOfDay(now).getTime()],
    },
    {
      key: 'week',
      label: '近一周',
      getRange: () => [startOfDay(subDays(now, 7)).getTime(), endOfDay(now).getTime()],
    },
    {
      key: 'twoweek',
      label: '近两周',
      getRange: () => [startOfDay(subDays(now, 14)).getTime(), endOfDay(now).getTime()],
    },
    {
      key: 'month',
      label: '近一月',
      getRange: () => [startOfDay(subMonths(now, 1)).getTime(), endOfDay(now).getTime()],
    },
    {
      key: 'threeMonth',
      label: '近三月',
      getRange: () => [startOfDay(subMonths(now, 3)).getTime(), endOfDay(now).getTime()],
    },
    {
      key: 'halfyear',
      label: '近半年',
      getRange: () => [startOfDay(subMonths(now, 6)).getTime(), endOfDay(now).getTime()],
    },
    {
      key: 'year',
      label: '近一年',
      getRange: () => [startOfDay(subYears(now, 1)).getTime(), endOfDay(now).getTime()],
    },
  ]
}
