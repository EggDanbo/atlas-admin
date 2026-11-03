import type { PropType } from 'vue'
import type { DateRangeValue, ShortcutItem } from './types'
import { getDefaultShortcuts } from './shortcuts'

export const spDateRangeProps = {
  /** 绑定值，时间戳数组 [开始, 结束] */
  modelValue: {
    type: [Array, null] as PropType<DateRangeValue>,
    default: undefined,
  },
  /** 显示模式：date=纯日期，datetime=日期+时间，month=月份选择，year=年份选择 */
  type: {
    type: String as PropType<'date' | 'datetime' | 'month' | 'year'>,
    default: 'date',
  },
  /** 日期显示格式，不传时按 type 自动选择（date→yyyy-MM-dd, month→yyyy-MM, year→yyyy） */
  dateFormat: {
    type: String as PropType<string | undefined>,
    default: undefined,
  },
  /** 时间显示格式（仅 datetime 模式） */
  timeFormat: {
    type: String,
    default: 'HH:mm:ss',
  },
  /**
   * date/month 模式结束时间语义（仅 date/month 模式生效，datetime 模式用户自行选择时间）
   * true=当天/当月最后一刻（用于 <= end 查询）
   * false=始终输出次日/次月 00:00:00（用于 < end 左闭右开查询）
   */
  endOfDay: {
    type: Boolean,
    default: true,
  },
  /** 最小可选时间戳（毫秒），支持 string 兼容 C# long */
  min: {
    type: [Number, String] as PropType<number | string | undefined>,
    default: undefined,
  },
  /** 最大可选时间戳（毫秒），支持 string 兼容 C# long */
  max: {
    type: [Number, String] as PropType<number | string | undefined>,
    default: undefined,
  },
  /** 结束日期必须 >= 开始日期 */
  enforceOrder: {
    type: Boolean,
    default: true,
  },
  /** enforceOrder 下开始超过结束时自动清空结束 */
  autoClearEnd: {
    type: Boolean,
    default: false,
  },
  /** 全局可选小时（同时约束开始和结束） */
  timeHours: {
    type: Array as PropType<number[] | undefined>,
    default: undefined,
  },
  /** 全局可选分钟 */
  timeMinutes: {
    type: Array as PropType<number[] | undefined>,
    default: undefined,
  },
  /** 全局可选秒 */
  timeSeconds: {
    type: Array as PropType<number[] | undefined>,
    default: undefined,
  },
  /** 开始端可选小时（覆盖全局 timeHours） */
  startTimeHours: {
    type: Array as PropType<number[] | undefined>,
    default: undefined,
  },
  /** 开始端可选分钟（覆盖全局 timeMinutes） */
  startTimeMinutes: {
    type: Array as PropType<number[] | undefined>,
    default: undefined,
  },
  /** 开始端可选秒（覆盖全局 timeSeconds） */
  startTimeSeconds: {
    type: Array as PropType<number[] | undefined>,
    default: undefined,
  },
  /** 结束端可选小时（覆盖全局 timeHours） */
  endTimeHours: {
    type: Array as PropType<number[] | undefined>,
    default: undefined,
  },
  /** 结束端可选分钟（覆盖全局 timeMinutes） */
  endTimeMinutes: {
    type: Array as PropType<number[] | undefined>,
    default: undefined,
  },
  /** 结束端可选秒（覆盖全局 timeSeconds） */
  endTimeSeconds: {
    type: Array as PropType<number[] | undefined>,
    default: undefined,
  },
  /** 选择年份后自动关闭面板 */
  fastYearSelect: {
    type: Boolean,
    default: false,
  },
  /** 选择月份后自动关闭面板 */
  fastMonthSelect: {
    type: Boolean,
    default: true,
  },
  /** 是否显示清空按钮 */
  clearable: {
    type: Boolean,
    default: false,
  },
  /** 是否禁用所有选择器 */
  disabled: {
    type: Boolean,
    default: false,
  },
  /** 两端选择器之间的分隔符 */
  separator: {
    type: String,
    default: '~',
  },
  /** 两端都为空时输出 null 而非 [null, null]，兼容后端 long[]? */
  nullWhenEmpty: {
    type: Boolean,
    default: true,
  },
  /** 快捷选项，默认使用 getDefaultShortcuts()，传 [] 禁用快捷 */
  shortcuts: {
    type: Array as PropType<ShortcutItem[]>,
    default: () => getDefaultShortcuts(),
  },
} as const

export const spDateShortcutsProps = {
  /** 快捷选项列表 */
  shortcuts: {
    type: Array as PropType<ShortcutItem[]>,
    required: true as const,
  },
  /** 当前选中项的 key（v-model） */
  modelValue: {
    type: String,
    default: '',
  },
  /** 按钮尺寸 */
  size: {
    type: String as PropType<'small' | 'medium' | 'large'>,
    default: 'small',
  },
} as const
