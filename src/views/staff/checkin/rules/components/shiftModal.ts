import type { CheckinDate } from '../types'

import { addDays, addMonths, eachDayOfInterval, endOfMonth, startOfMonth } from 'date-fns'
import ExcelJS from 'exceljs'
import { cloneDeep } from 'lodash-es'
import { computed, ref, unref } from 'vue'
import { rules as api } from '@/service/api/staff/checkin'
import { downloadFile, excelNumberToName } from '@/utils'

import { formatSeconds } from '@/utils/dateUtil'

/** 周期排班 */
export interface SchedulePeriodItem {
  /** 周期名称 */
  name: string
  /** 班次 */
  list: Array<SchedulePeriodDetailItem>
}

/** 周期排班 */
export interface SchedulePeriodDetailItem {
  /** 第几天 */
  day: number
  /** 班次名 */
  name: string
}

/** 班次数据 */
export interface ScheduleItem {
  /** 班次索引 */
  index: number
  /** 班次描述 */
  describe: string
  /** 短名称 */
  short_name: string
  /** 班次 */
  checkin_date: CheckinDate
}

/** 人员数据 */
export interface UserItem {
  /** 人员ID */
  user_id: string
  /** 派驻单位ID */
  outer_id?: string
  /** 0-正常,1-顶班 */
  types?: number
  /** 人员姓名 */
  name: string
  /** 单位 */
  team_name: string
  /** 手机 */
  mobile: string
}

/** 排班人员数据 */
export interface ScheduleUserItem {
  /** 人员ID */
  user_id: string
  /** 人员姓名 */
  name: string
  /** 所属单位 */
  team_name: string
  /** 手机 */
  mobile: string
  /** 班次数据 */
  schedule: Map<number, ScheduleItem>
}

/** 排班日期 */
export interface ScheduleDayItem {
  /** yyyyMMdd */
  day: number
  /** 数值 */
  num: number
  /** 具体日期 */
  date: Date
  /** 周几 */
  week: string
}

/** 月份数数据 */
export interface ScheduleMonthItem {
  /** 人员数据 */
  users: Array<ScheduleUserItem>
  /** 人员数据索引 */
  userIdx: Map<string, ScheduleUserItem>
  /** 排班日期 */
  days: Array<ScheduleDayItem>
  /** 可否编辑 */
  available: boolean
}

/** 筛选条件 */
export interface FilterModel {
  date: number
  name: string
  group_id: string
  group_name: string
}

function getMonthNumber(date: Date) {
  return date.getFullYear() * 100 + (date.getMonth() + 1)
}

function getDayNumber(date: Date) {
  return date.getFullYear() * 10_000 + (date.getMonth() + 1) * 100 + date.getDate()
}

function buildMonthDayList(date: Date): Array<ScheduleDayItem> {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  const days = eachDayOfInterval({ start, end })

  const result = new Array<ScheduleDayItem>()

  for (const item of days) {
    const obj = {} as ScheduleDayItem

    obj.date = item
    obj.num = item.getDate()
    obj.day = getDayNumber(item)
    obj.week = weekdays[item.getDay()]

    result.push(obj)
  }

  return result
}

function buildScheduleName(item: CheckinDate) {
  if (!item.checkin_time)
    return ''
  const dateArr = item.checkin_time.map((item) => {
    const start = formatSeconds(item.work_sec)
    const end = formatSeconds(item.off_work_sec)
    return `${start}-${end}`
  })
  return dateArr.join('、')
}

/**
 * 排班管理
 */
export function useSchedule() {
  const filterRef = ref<FilterModel>({
    date: Date.now(),
    name: '',
    group_id: '',
    group_name: '',
  })

  // 月份数据
  const dataRef = ref(new Map<number, ScheduleMonthItem>())

  // 班次数据
  const scheduleRef = ref<Array<ScheduleItem>>([])
  const scheduleMap = new Map<string, ScheduleItem>()

  // 周期数据
  const periodRef = ref<Array<SchedulePeriodItem>>([])

  // 人员数数据
  const usersRef = ref<Array<UserItem>>([])

  // 获取班次信息
  const getSchedule = computed(() => {
    return unref(scheduleRef)
  })

  /** 根据班次名获取班次信息 */
  function getScheduleByName(name: string) {
    return scheduleMap.get(name)
  }

  /** 根据索引获取班次信息 */
  function getScheduleByIndex(index: number) {
    const data = unref(scheduleRef)
    return data[index]
  }

  /**
   * 新增班次
   */
  function addSchedule(item: CheckinDate) {
    const data = unref(scheduleRef)
    const name = item.name || ''
    if (data.some(q => q.checkin_date.name === name)) {
      return false
    }

    const scheduleItem = {
      index: data.length,
      checkin_date: item,
      short_name: name?.length > 3 ? `${name.slice(0, 2)}..` : name,
      describe: `${name} ${buildScheduleName(item)}`,
    } as ScheduleItem

    data.push(scheduleItem)
    scheduleMap.set(name, scheduleItem)

    return true
  }

  /**
   * 更新班次
   */
  function updateSchedule(item: ScheduleItem, checkinDate: CheckinDate) {
    const data = unref(scheduleRef)
    const name = checkinDate.name || ''
    if (data.some(q => q.checkin_date.name === name && q.index !== item.index)) {
      return false
    }
    item.short_name = name?.length > 3 ? `${name.slice(0, 2)}..` : name
    item.describe = `${name} ${buildScheduleName(checkinDate)}`
    item.checkin_date = cloneDeep(checkinDate)

    return true
  }

  /** 删除班次 */
  function removeSchedule(name: string) {
    const data = unref(scheduleRef)
    const item = scheduleMap.get(name)
    if (!item) {
      return
    }

    // 清空排班
    dataRef.value.forEach((element) => {
      if (element.available && element.users) {
        element.users.forEach((e) => {
          const removes: Array<number> = []
          e.schedule.forEach((v, k) => {
            if (v.index === item.index) {
              removes.push(k)
            }
          })
          removes.forEach((v) => {
            e.schedule.delete(v)
          })
        })
      }
    })

    // 删除班次
    scheduleMap.delete(name)
    data.splice(item.index, 1)
    data.forEach((q, i) => {
      q.index = i
    })

    // 周期处理
    const period = unref(periodRef)
    if (period) {
      for (let i = 0; i < period.length; i++) {
        const element = period[i]
        for (let j = 0; j < element.list.length; j++) {
          if (!scheduleMap.has(element.list[j].name)) {
            element.list.splice(j, 1)
            j--
          }
        }
        // 重算天数
        for (let i = 0; i < element.list.length; i++) {
          element.list[i].day = i + 1
        }
        // 删除周期
        if (element.list.length === 0) {
          period.splice(i, 1)
          i--
        }
      }
    }
  }

  /** 周期排班 */
  function periodSchedule(
    monthItem: ScheduleMonthItem,
    userItem: ScheduleUserItem,
    dayItem: ScheduleDayItem,
    periodItem: SchedulePeriodItem,
  ) {
    if (periodItem.list.length === 0)
      return
    // 当月最后一天
    const last = monthItem.days[monthItem.days.length - 1]
    let day = dayItem.day
    while (day <= last.day) {
      for (const item of periodItem.list) {
        // 检查是否溢出
        if (day <= last.day) {
          const schedule = getScheduleByName(item.name)
          if (schedule)
            userItem.schedule.set(day, schedule)
        }
        day++
      }
    }
  }

  /** 复制上月数据 */
  function copyPrevMonth() {
    const date = new Date()
    date.setTime(filterRef.value.date)
    const prevMonth = getMonthNumber(addMonths(date, -1))
    const theMonth = getMonthNumber(date)
    const data = unref(dataRef)
    const prevMonthList = data.get(prevMonth)
    const theMonthList = data.get(theMonth)

    if (!prevMonthList || !theMonthList)
      return
    if (!theMonthList.available)
      return

    theMonthList.users.forEach(q => q.schedule.clear())

    const endDate = endOfMonth(date)
    const theMonthLastDay = getDayNumber(endDate)
    prevMonthList.users.forEach((element) => {
      const user = theMonthList.userIdx.get(element.user_id)
      if (!user)
        return
      element.schedule.forEach((item, key) => {
        const m = key + 100 // 增加一个月
        if (m <= theMonthLastDay) {
          user.schedule.set(m, item)
        }
      })
    })
  }

  /** 加载班次数据 */
  async function loadSchedule(groupId: string) {
    const { isSuccess, data } = await api.getSchedule(groupId)
    if (!isSuccess)
      return false

    if (data.checkin_date) {
      scheduleRef.value = data.checkin_date.map((m, i) => {
        const name = m.name || ''
        const scheduleItem = {
          index: i,
          checkin_date: m,
          short_name: name?.length > 3 ? `${name.slice(0, 2)}..` : name,
          describe: `${name} ${buildScheduleName(m)}`,
        } as ScheduleItem
        scheduleMap.set(m.name, scheduleItem)
        return scheduleItem
      })
    }
    if (data.period) {
      periodRef.value = data.period
    }

    return true
  }

  /** 加载人员数据 */
  async function loadUsers(groupId: string) {
    if (usersRef.value.length > 0)
      return true
    const { isSuccess, data } = await api.getUserGroupList({
      id: groupId,
    })
    if (!isSuccess)
      return false

    usersRef.value = data.map((m) => {
      return {
        user_id: m.user_id,
        name: m.name,
        team_name: m.team_name,
        mobile: m.mobile,
        schedule: new Map<number, ScheduleItem>(),
      }
    })

    return true
  }

  /** 加载人员排班信息 */
  async function loadUserSchedule(month: number, scheduleMonthItem: ScheduleMonthItem) {
    // 没有成员时不会存在个人排班，无需为每个月发送空查询。
    if (scheduleMonthItem.users.length === 0)
      return true

    const { isSuccess, data } = await api.getScheduleUser({ id: filterRef.value.group_id, month })
    if (!isSuccess)
      return false

    for (const element of data) {
      const userItem = scheduleMonthItem.userIdx.get(element.user_id)
      if (userItem) {
        let scheduleItem = getScheduleByName(element.name)
        if (!scheduleItem) {
          scheduleItem = {
            index: -1,
            describe: element.describe,
          } as ScheduleItem
        }

        userItem.schedule.set(element.schedule_date, scheduleItem)
      }
    }

    return true
  }

  async function createScheduleMonthItem(month: number, date: Date) {
    const scheduleMonthItem = {} as ScheduleMonthItem

    scheduleMonthItem.days = buildMonthDayList(date)

    const users = new Array<ScheduleUserItem>()
    const userIdx = new Map<string, ScheduleUserItem>()

    const list = usersRef.value || []
    for (const item of list) {
      const userItem: ScheduleUserItem = {
        user_id: item.user_id,
        name: item.name,
        team_name: item.team_name,
        mobile: item.mobile,
        schedule: new Map<number, ScheduleItem>(),
      }
      userIdx.set(item.user_id, userItem)
      users.push(userItem)
    }

    scheduleMonthItem.users = users
    scheduleMonthItem.userIdx = userIdx

    // 排班接口失败时不能返回空排班，否则用户保存后会覆盖已有数据。
    if (!(await loadUserSchedule(month, scheduleMonthItem)))
      return

    return scheduleMonthItem
  }

  /** 加载月份数据 */
  async function loadMonth(date: Date, available?: boolean) {
    const data = unref(dataRef)
    const month = getMonthNumber(date)
    if (!data.has(month)) {
      const scheduleMonthItem = await createScheduleMonthItem(month, date)
      if (!scheduleMonthItem)
        return false
      if (available) {
        scheduleMonthItem.available = true
      }
      data.set(month, scheduleMonthItem)
    }

    return true
  }

  /**
   * 加载指定考勤规则的完整排班数据。
   * @param groupId 考勤规则 ID。
   * @returns 所有接口是否均加载成功。
   */
  async function load(groupId: string) {
    filterRef.value.date = Date.now()
    filterRef.value.group_id = groupId
    usersRef.value = []
    periodRef.value = []
    dataRef.value.clear()
    scheduleRef.value = []
    scheduleMap.clear()

    // 任一基础接口失败都不能进入编辑态，成功返回空人员则仍允许配置班次。
    if (!(await loadSchedule(groupId)))
      return false
    if (!(await loadUsers(groupId)))
      return false

    if (scheduleRef.value.length === 0) {
      const defScheduleItem = {
        index: 0,
        describe: '休息',
        short_name: '休息',
        checkin_date: { name: '休息' },
      } as ScheduleItem
      scheduleRef.value.push(defScheduleItem)
      scheduleMap.set('休息', defScheduleItem)
    }

    // 加载可以编辑的数据
    const now = new Date()
    if (!(await loadMonth(addMonths(now, -1), true)))
      return false
    if (!(await loadMonth(now, true)))
      return false
    if (!(await loadMonth(addMonths(now, 1), true)))
      return false
    if (!(await loadMonth(addMonths(now, 2), true)))
      return false

    return true
  }

  /** 获取当月数据 */
  async function getData() {
    const date = new Date()
    date.setTime(filterRef.value.date)
    const month = getMonthNumber(date)
    const data = unref(dataRef)

    if (!(await loadMonth(date)))
      return

    return data.get(month)
  }

  async function save() {
    const userSchedule: any[] = []
    dataRef.value.forEach((element) => {
      if (element.available && element.users) {
        element.users.forEach((e) => {
          e.schedule.forEach((v, k) => {
            userSchedule.push({
              name: v.checkin_date.name,
              user_id: e.user_id,
              schedule_date: k,
              describe: v.describe,
            })
          })
        })
      }
    })

    const { isSuccess } = await api.setSchedule({
      id: filterRef.value.group_id,
      checkin_date: unref(scheduleRef).map(m => m.checkin_date),
      period: unref(periodRef),
      user_schedule: userSchedule,
    })
    if (!isSuccess)
      return false
    return true
  }

  async function exportData(temp: boolean) {
    const date = new Date()
    date.setTime(filterRef.value.date)
    const month = getMonthNumber(date)
    const data = dataRef.value.get(month)
    if (!data)
      return
    if (getSchedule.value.length === 0)
      return

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'demo'
    workbook.lastModifiedBy = 'demo'
    workbook.created = new Date()
    workbook.modified = new Date()
    workbook.lastPrinted = new Date()

    const worksheet = workbook.addWorksheet(month.toString())
    worksheet.properties.defaultRowHeight = 15
    worksheet.properties.defaultColWidth = 6

    const setFont = (cell: ExcelJS.Cell) => {
      cell.font = {
        bold: true,
      }
      return cell
    }

    const listFormulae = `"${getSchedule.value.map(m => m.checkin_date.name).join(',')}"`

    const setList = (cell: ExcelJS.Cell) => {
      cell.dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [listFormulae],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: '格式错误',
        error: '请勿修改班次名称',
      }
    }

    const setTitle = (name: string, value: any, callback?) => {
      const cell = worksheet.getCell(name)
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'CCFFFF' },
        bgColor: { argb: '000000' },
      }
      cell.font = {
        bold: true,
      }
      cell.value = value
      cell.alignment = { vertical: 'middle', horizontal: 'left' }
      callback && callback(cell)
    }

    const setHeader = (name: string, value: any, callback?) => {
      const cell = worksheet.getCell(name)
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '83CA90' },
        bgColor: { argb: '000000' },
      }
      cell.font = {
        bold: true,
      }
      cell.value = value
      cell.alignment = { vertical: 'middle', horizontal: 'left' }
      callback && callback(cell)
    }

    const setCell = (name: string, value: any, callback?) => {
      const cell = worksheet.getCell(name)
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
      cell.value = value
      cell.alignment = { vertical: 'middle', horizontal: 'left' }
      callback && callback(cell)
    }

    setTitle('A1', `${month}排班表`, (cell: ExcelJS.Cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
    })

    setTitle(
      'A2',
      `${getSchedule.value.map(m => m.describe).join(';')} （只能按现有班次排班，否则无法识别。班次信息只能在后台修改）`,
      (cell) => {
        cell.font = {
          bold: false,
        }
      },
    )

    setHeader('A3', `姓名`)
    setHeader('B3', `账号`)
    setHeader('C3', `单位`)
    setHeader('A4', `姓名`)
    setHeader('B4', `账号`)
    setHeader('C4', `单位`)

    // 遍历日期
    let cNum = 3
    data.days.forEach((q) => {
      const cName = excelNumberToName(cNum)
      setHeader(`${cName}3`, `周${q.week}`, setFont)
      setHeader(`${cName}4`, q.num.toString())
      cNum++
    })

    const maxCol = worksheet.lastColumn?.number || 1

    // 遍历人员
    let rowIdx = 5
    data.users.forEach((q) => {
      setCell(`A${rowIdx}`, q.name)
      setCell(`B${rowIdx}`, q.user_id)
      setCell(`C${rowIdx}`, q.team_name)

      let colIdx = 3
      data.days.forEach((d) => {
        if (temp) {
          setCell(`${excelNumberToName(colIdx++)}${rowIdx}`, '', setList)
        }
        else {
          const schedule = q.schedule.get(d.day)
          if (schedule) {
            setCell(`${excelNumberToName(colIdx++)}${rowIdx}`, schedule.checkin_date.name, setList)
          }
          else {
            setCell(`${excelNumberToName(colIdx++)}${rowIdx}`, '', setList)
          }
        }
      })

      // 模板数据
      rowIdx++
    })

    worksheet.mergeCells(`A1:${excelNumberToName(maxCol - 1)}1`)
    worksheet.mergeCells(`A2:${excelNumberToName(maxCol - 1)}2`)
    worksheet.mergeCells(`A3:A4`)
    worksheet.mergeCells(`B3:B4`)
    worksheet.mergeCells(`C3:C4`)

    const buffer = await workbook.xlsx.writeBuffer()
    downloadFile(
      { data: buffer },
      `${filterRef.value.group_name}-${temp ? '模板' : '数据'}-${month}.xlsx`,
    )
  }

  async function importData(buf) {
    const date = new Date()
    date.setTime(filterRef.value.date)
    const month = getMonthNumber(date)
    const data = dataRef.value.get(month)
    if (!data)
      return '当月无有数据'

    const workbook = new ExcelJS.Workbook()
    try {
      await workbook.xlsx.load(buf)
    }
    catch {
      return '文件格式无效'
    }

    const worksheet = workbook.getWorksheet(month.toString())
    if (!worksheet) {
      return `请导入${month}月份的排班表`
    }

    if (worksheet.rowCount < 5) {
      return `排班表格数据不正确`
    }

    const monthLastDay = addDays(
      addMonths(new Date(date.getFullYear(), date.getMonth(), 1), 1),
      -1,
    )

    const maxCol = monthLastDay.getDate() + 3

    // 从第五行开始
    for (let i = 5; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i)
      if (row.cellCount < maxCol) {
        continue
      }

      // 查询用户
      const userId = `${row.getCell(2).value}`
      const user = data.userIdx.get(userId)
      if (!user)
        continue

      // 先清空
      user.schedule.clear()

      // 设置排班
      let cIdx = 1
      // 从第四列开始
      for (let c = 4; c <= maxCol; c++) {
        const name = `${row.getCell(c).value}`
        if (name) {
          const schedule = getScheduleByName(name)
          if (schedule) {
            const day = month * 100 + cIdx
            user.schedule.set(day, schedule)
          }
        }
        cIdx++
      }
    }
  }

  return {
    filterRef,
    periodRef,
    load,
    save,
    getData,
    getSchedule,
    getScheduleByName,
    getScheduleByIndex,
    addSchedule,
    updateSchedule,
    removeSchedule,
    periodSchedule,
    copyPrevMonth,
    exportData,
    importData,
  }
}
