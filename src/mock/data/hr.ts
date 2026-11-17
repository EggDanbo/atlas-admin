/**
 * 人力资源 mock 数据
 *
 * 旧的人力资源有 36 个页面，补卡、外出、加班、调班、请假各占一个菜单，
 * 名册、异动、考勤、薪酬之间没有共同的「人」这条主线。这里重做：
 * 先建一份员工主数据，组织编制、异动流水、考勤、工资表都由它派生，
 * 保证同一部门的人数和编制对得上、工资表的实发等于应发减各项扣款。
 */
import { DEPARTMENTS, EDUCATIONS, GIVEN_NAMES, POSITIONS, SURNAMES } from './dict'
import { createRng, dateOffset, floatBetween, intBetween, pick, toDateString } from './random'

const round2 = (value: number) => Number(value.toFixed(2))
const money = (rng: () => number, min: number, max: number) => round2(floatBetween(rng, min, max, 2))

const LEVELS = ['P3', 'P4', 'P5', 'P6', 'P7', 'M1'] as const
const WORK_DEPTS = DEPARTMENTS.slice(0, 8)
const STAFF_STATES = ['在职', '在职', '在职', '在职', '试用', '离职'] as const

interface Employee {
  id: string
  employee_no: string
  employee_name: string
  dept_name: string
  position_name: string
  job_grade: string
  staff_state: string
  entry_date: string
  phone: string
  education: string
  age: number
  base_salary: number
}

interface HrDataset {
  employees: Employee[]
  movements: Record<string, any>[]
  teams: Record<string, any>[]
  attendance: Record<string, any>[]
  attendanceSummary: Record<string, any>[]
  attendanceRules: Record<string, any>[]
  payroll: Record<string, any>[]
}

let cache: HrDataset | null = null

/** 最近 n 个工作日（跳过周末），返回 Date */
function recentWorkdays(count: number) {
  const days: Date[] = []
  let offset = 0
  while (days.length < count) {
    const date = dateOffset(-offset)
    if (date.getDay() !== 0 && date.getDay() !== 6)
      days.push(date)
    offset++
  }
  return days.reverse()
}

function buildEmployees(): Employee[] {
  return Array.from({ length: 56 }, (_, index) => {
    const rng = createRng(`hr/employee#${index}`)
    const dept = WORK_DEPTS[index % WORK_DEPTS.length]!
    const state = STAFF_STATES[index % STAFF_STATES.length]!
    const level = LEVELS[index % LEVELS.length]!
    // 职级越高底薪越高，避免出现「M1 拿 5 千」这种违和数据
    const levelFactor = 1 + LEVELS.indexOf(level) * 0.22
    const base = round2(money(rng, 7_000, 16_000) * levelFactor)
    return {
      id: `HE${String(index + 1).padStart(4, '0')}`,
      employee_no: `YG${String(1001 + index)}`,
      employee_name: `${SURNAMES[index % SURNAMES.length]}${GIVEN_NAMES[(index * 3) % GIVEN_NAMES.length]}`,
      dept_name: dept,
      position_name: POSITIONS[index % POSITIONS.length]!,
      job_grade: level,
      staff_state: state,
      // 每 19 人安排一位近期入职，否则入职日期均匀分布在 6 年内，
      // 「近 30 天入职」几乎永远是 0，看板像坏了
      entry_date: toDateString(dateOffset(index % 19 === 1 ? -intBetween(rng, 5, 25) : -intBetween(rng, 30, 2200))),
      phone: `1${pick(rng, ['3', '5', '7', '8'])}${intBetween(rng, 100000000, 999999999)}`.slice(0, 11),
      education: pick(rng, [...EDUCATIONS]),
      age: intBetween(rng, 23, 46),
      base_salary: base,
    }
  })
}

function buildMovements(employees: Employee[]) {
  const types = ['入职', '调入', '调岗', '晋升', '离职'] as const
  return employees
    .filter((_, index) => index % 3 === 0)
    .map((employee, index) => {
      const rng = createRng(`hr/movement#${index}`)
      const type = index % 7 === 6 ? '离职' : types[index % 4]!
      const fromDept = employee.dept_name
      const toDept = type === '调入' ? WORK_DEPTS[(index + 3) % WORK_DEPTS.length]! : fromDept
      return {
        id: `HM${String(index + 1).padStart(4, '0')}`,
        employee_name: employee.employee_name,
        employee_no: employee.employee_no,
        movement_type: type,
        // 入职没有原部门，离职没有新部门
        from_dept: type === '入职' ? '' : fromDept,
        to_dept: type === '离职' ? '' : toDept,
        effect_date: toDateString(dateOffset(-intBetween(rng, 3, 420))),
        reason: pick(rng, ['业务调整', '个人申请', '组织架构优化', '绩效晋升', '岗位空缺补位']),
        operator: pick(rng, ['周敏', '陈可', '宋佳']),
      }
    })
    .sort((a, b) => (a.effect_date < b.effect_date ? 1 : -1))
}

function buildTeams(employees: Employee[]) {
  return WORK_DEPTS.map((dept, index) => {
    const rng = createRng(`hr/team#${index}`)
    const onJob = employees.filter(item => item.dept_name === dept && item.staff_state !== '离职').length
    // 编制略高于在职，个别部门满编
    const headcount = onJob + (index % 4 === 0 ? 0 : intBetween(rng, 1, 3))
    const manager = employees.find(item => item.dept_name === dept)?.employee_name ?? '—'
    return {
      id: `HT${String(index + 1).padStart(3, '0')}`,
      dept_name: dept,
      manager,
      headcount,
      on_job: onJob,
      vacancy: headcount - onJob,
      avg_tenure: Number(floatBetween(rng, 1.2, 6.8, 1)),
    }
  })
}

function buildAttendance(employees: Employee[]) {
  const days = recentWorkdays(5)
  const rows: Record<string, any>[] = []
  // 每天抽 12 人，够演示也能翻页
  employees.filter(item => item.staff_state !== '离职').slice(0, 12).forEach((employee, employeeIndex) => {
    days.forEach((day, dayIndex) => {
      const rng = createRng(`hr/attendance#${employeeIndex}#${dayIndex}`)
      const hit = rng()
      const state = hit > 0.94 ? '缺卡' : hit > 0.88 ? '迟到' : hit > 0.84 ? '请假' : '正常'
      const startHour = state === '迟到' ? intBetween(rng, 9, 10) : 8
      const startMinute = state === '迟到' ? intBetween(rng, 31, 59) : intBetween(rng, 30, 59)
      const endHour = intBetween(rng, 18, 20)
      const endMinute = intBetween(rng, 0, 59)
      rows.push({
        id: `HA${employeeIndex}${dayIndex}`,
        work_date: toDateString(day),
        employee_name: employee.employee_name,
        dept_name: employee.dept_name,
        check_in: state === '缺卡' ? '' : `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
        check_out: state === '缺卡' || state === '请假' ? '' : `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
        work_hours: state === '请假' || state === '缺卡' ? 0 : Number((endHour - startHour + (endMinute - startMinute) / 60).toFixed(1)),
        attendance_state: state,
      })
    })
  })
  return rows.sort((a, b) => (a.work_date < b.work_date ? 1 : -1))
}

function buildAttendanceSummary(employees: Employee[]) {
  return employees
    .filter(item => item.staff_state !== '离职')
    .map((employee, index) => {
      const rng = createRng(`hr/attendance-summary#${index}`)
      const late = intBetween(rng, 0, 4)
      const leave = intBetween(rng, 0, 3)
      const exception = late + intBetween(rng, 0, 2)
      return {
        id: `HS${String(index + 1).padStart(4, '0')}`,
        employee_name: employee.employee_name,
        dept_name: employee.dept_name,
        should_days: 22,
        actual_days: 22 - leave - (exception > 2 ? 1 : 0),
        late_count: late,
        leave_days: leave,
        overtime_hours: intBetween(rng, 0, 26),
        exception_count: exception,
      }
    })
}

function buildPayroll(employees: Employee[]) {
  const month = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  return employees
    .filter(item => item.staff_state !== '离职')
    .map((employee, index) => {
      const rng = createRng(`hr/payroll#${index}`)
      const gross = round2(employee.base_salary * floatBetween(rng, 1.05, 1.28))
      const social = round2(gross * 0.105)
      const fund = round2(gross * 0.07)
      const tax = round2(Math.max(0, (gross - social - fund - 5000) * 0.1))
      return {
        id: `HP${String(index + 1).padStart(4, '0')}`,
        pay_month: month,
        employee_name: employee.employee_name,
        dept_name: employee.dept_name,
        gross_amount: gross,
        social_amount: social,
        fund_amount: fund,
        tax_amount: tax,
        net_amount: round2(gross - social - fund - tax),
        pay_state: index % 9 === 8 ? '待发放' : '已发放',
      }
    })
}

/**
 * 考勤规则
 *
 * 只描述「规则本身」：班次、工作日、弹性与异常判定，以及什么时候开始生效。
 * 打卡记录是规则的执行结果，不放在这里 —— 规则的增删改不该被历史打卡绑住。
 *
 * 生效状态是四种互斥情况（立即 / 次日 / 指定日期 / 暂不生效），
 * 列表里靠它决定这一行要不要淡化，所以四个值都要有真实样本。
 */
function buildAttendanceRules(employees: Employee[]) {
  const active = employees.filter(item => item.staff_state !== '离职')
  const today = toDateString(dateOffset(0))
  const tomorrow = toDateString(dateOffset(1))

  interface ShiftSeed {
    name: string
    start: string
    end: string
    rest: string
    /** 固定班次：这个班次上哪几天；排班制不看它 */
    work_days?: number[]
  }

  interface RuleSeed {
    name: string
    mode: string
    depts: string[]
    /** 固定班次的弹性分钟，0 表示不弹性 */
    flex: number
    hours: number
    late: number
    early: number
    state: string
    date: string
    utime: string
    /** 自由工时：每天打几次卡、最晚几点下班 */
    freeTimes?: number
    latest?: string
    /** 打卡校验：地点 / Wi-Fi */
    checkLocation?: { name: string, address: string, intro: string, lng: number, lat: number }
    checkWifi?: string
    shifts: ShiftSeed[]
    /** 排班制：参与排班的人 */
    members?: string[]
  }

  const seeds: RuleSeed[] = [
    {
      name: '总部标准班次',
      mode: '固定班次',
      depts: ['综合管理部', '财务管理部'],
      flex: 0,
      hours: 8,
      late: 5,
      early: 5,
      state: '立即生效',
      date: today,
      utime: '2026-10-21 09:12',
      checkLocation: {
        name: '国贸 CBD',
        address: '北京市朝阳区建国门外大街 1 号',
        intro: '中央商务区核心，甲级写字楼与跨国企业总部集中，早高峰 8:30—9:30 最拥挤。',
        lng: 116.4605,
        lat: 39.9087,
      },
      checkWifi: 'A4:5E:60:12:88:01',
      shifts: [{ name: '标准班', start: '09:00', end: '18:00', rest: '12:00-13:00', work_days: [1, 2, 3, 4, 5] }],
    },
    {
      name: '研发弹性班次',
      mode: '固定班次',
      depts: ['技术研发部'],
      flex: 30,
      hours: 8,
      late: 30,
      early: 5,
      state: '立即生效',
      date: today,
      utime: '2026-10-18 16:40',
      checkWifi: '3C:52:82:0A:F1:7B',
      // 固定班次也能有多个：工作日错开，每天最多被一个班次占用
      shifts: [
        { name: '弹性班', start: '10:00', end: '19:00', rest: '13:00-14:00', work_days: [1, 2, 3, 4, 5] },
        { name: '周六值班', start: '10:00', end: '16:00', rest: '13:00-14:00', work_days: [6] },
      ],
    },
    {
      name: '销售外勤工时',
      mode: '自由工时',
      depts: ['市场运营部'],
      flex: 60,
      hours: 8,
      late: 60,
      early: 30,
      freeTimes: 2,
      latest: '22:00',
      state: '明日生效',
      date: tomorrow,
      utime: '2026-11-15 10:05',
      shifts: [{ name: '外勤班', start: '09:30', end: '18:30', rest: '12:00-13:00' }],
    },
    {
      name: '供应链轮班制',
      mode: '排班制',
      depts: ['采购供应部'],
      flex: 0,
      hours: 8,
      late: 10,
      early: 10,
      state: '立即生效',
      date: today,
      utime: '2026-09-30 11:05',
      shifts: [
        { name: '早班', start: '08:00', end: '17:00', rest: '12:00-13:00' },
        { name: '中班', start: '12:00', end: '21:00', rest: '16:00-17:00' },
        { name: '晚班', start: '22:00', end: '06:00', rest: '01:30-02:30' },
      ],
    },
    {
      name: '生产两班倒',
      mode: '排班制',
      depts: ['生产制造部'],
      flex: 0,
      hours: 11,
      late: 10,
      early: 10,
      state: '指定日期',
      date: toDateString(dateOffset(26)),
      utime: '2026-11-12 14:30',
      shifts: [
        { name: '白班', start: '08:00', end: '20:00', rest: '12:00-13:00' },
        { name: '夜班', start: '20:00', end: '08:00', rest: '00:00-01:00' },
      ],
    },
    {
      name: '质量检验排班',
      mode: '排班制',
      depts: ['质量管理部'],
      flex: 0,
      hours: 8,
      late: 5,
      early: 5,
      state: '立即生效',
      date: today,
      utime: '2026-08-08 09:00',
      shifts: [
        { name: '早班', start: '07:30', end: '16:30', rest: '11:30-12:30' },
        { name: '中班', start: '15:00', end: '23:30', rest: '18:00-19:00' },
      ],
    },
    {
      name: '实习生标准班',
      mode: '固定班次',
      depts: ['人力资源部'],
      flex: 0,
      hours: 8,
      late: 5,
      early: 5,
      state: '暂不生效',
      date: '',
      utime: '2026-11-14 17:20',
      shifts: [{ name: '标准班', start: '09:00', end: '18:00', rest: '12:00-13:00', work_days: [1, 2, 3, 4, 5] }],
    },
    {
      name: '远程办公工时',
      mode: '自由工时',
      depts: ['综合管理部'],
      flex: 120,
      hours: 8,
      late: 120,
      early: 60,
      freeTimes: 2,
      latest: '21:30',
      state: '暂不生效',
      date: '',
      utime: '2026-11-16 09:45',
      shifts: [{ name: '远程班', start: '09:00', end: '18:00', rest: '12:00-13:00' }],
    },
  ]

  /** 排班表：未来两周按人轮流排班，休息日和班次交替 */
  function buildAssignments(members: string[], shiftNames: string[]) {
    const rows: { member: string, date: string, shift: string }[] = []
    members.forEach((member, memberIndex) => {
      for (let offset = 0; offset < 14; offset++) {
        const date = toDateString(dateOffset(offset))
        const weekday = new Date(date).getDay()
        // 周末给一部分人排休息，工作日正常轮班
        const rest = weekday === 0 || (weekday === 6 && memberIndex % 2 === 0)
        const name = rest ? '休息' : shiftNames[(memberIndex + offset) % shiftNames.length]!
        rows.push({ member, date, shift: name })
      }
    })
    return rows
  }

  return seeds.map((seed, index) => {
    const members = seed.members ?? active.filter(item => seed.depts.includes(item.dept_name)).slice(0, 6).map(item => item.employee_name)
    const shiftNames = seed.shifts.map(item => item.name)
    const assignments = seed.mode === '排班制' ? buildAssignments(members, shiftNames) : []
    const first = seed.shifts[0]
    const workDays = seed.mode === '排班制'
      ? '按排班表'
      : workDaysLabel(first?.work_days ?? [])
    return {
      id: `HR${String(index + 1).padStart(4, '0')}`,
      rule_name: seed.name,
      attendance_mode: seed.mode,
      apply_dept: seed.depts.join('、'),
      work_days_text: workDays,
      work_time: first ? `${first.start} - ${first.end}` : '按排班表',
      rest_time: first?.rest ?? '不休息',
      flex_text: seed.flex ? `弹性 ${seed.flex} 分钟` : '不弹性',
      flex_minutes: seed.flex,
      standard_hours: seed.hours,
      free_times: seed.freeTimes ?? 0,
      latest: seed.latest ?? '',
      check_location: !!seed.checkLocation,
      location_name: seed.checkLocation?.name ?? '',
      location_address: seed.checkLocation?.address ?? '',
      location_lng: seed.checkLocation?.lng ?? 0,
      location_lat: seed.checkLocation?.lat ?? 0,
      location_intro: seed.checkLocation?.intro ?? '',
      check_wifi: !!seed.checkWifi,
      wifi_mac: seed.checkWifi ?? '',
      late_limit: seed.late,
      early_limit: seed.early,
      shifts: seed.shifts,
      shift_count: seed.shifts.length,
      members: seed.mode === '排班制' ? members : [],
      member_count: seed.mode === '排班制' ? members.length : 0,
      assignments,
      assignment_count: assignments.length,
      handover_minutes: seed.mode === '排班制' ? 30 : 0,
      member_total: active.filter(item => seed.depts.includes(item.dept_name)).length,
      effective_state: seed.state,
      effective_date: seed.date,
      utime: seed.utime,
    }
  })
}

/** [1,2,3,4,5] → 周一至周五 */
function workDaysLabel(days: number[]) {
  if (!days.length)
    return '—'
  const names = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const sorted = [...days].sort((a, b) => a - b)
  const continuous = sorted.every((value, index) => index === 0 || value === sorted[index - 1]! + 1)
  if (continuous && sorted.length > 2)
    return `${names[sorted[0]!]}至${names[sorted.at(-1)!]}`
  return sorted.map(day => names[day]).join('、')
}

function dataset(): HrDataset {
  if (cache)
    return cache
  const employees = buildEmployees()
  cache = {
    employees,
    movements: buildMovements(employees),
    teams: buildTeams(employees),
    attendance: buildAttendance(employees),
    attendanceSummary: buildAttendanceSummary(employees),
    attendanceRules: buildAttendanceRules(employees),
    payroll: buildPayroll(employees),
  }
  return cache
}

// ==================== 分析页 ====================

export function buildHrDashboard() {
  const { employees, payroll } = dataset()
  const active = employees.filter(item => item.staff_state !== '离职')
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(new Date().getFullYear(), new Date().getMonth() - (11 - index), 1)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  })

  // 在职人数从年初缓慢增长到当前人数，工资成本跟着涨
  const start = Math.max(20, active.length - 12)
  const headcountSeries = months.map((_, index) => Math.round(start + ((active.length - start) * index) / 11))
  const avgSalary = round2(payroll.reduce((sum, item) => sum + item.gross_amount, 0) / Math.max(1, payroll.length))
  const payrollSeries = headcountSeries.map((count, index) => {
    const rng = createRng(`hr/payroll-trend#${index}`)
    return Math.round(count * avgSalary * floatBetween(rng, 0.96, 1.04))
  })

  const deptShare = WORK_DEPTS.map(dept => ({
    name: dept,
    value: active.filter(item => item.dept_name === dept).length,
  }))

  const tenureBuckets = [
    { name: '1 年以内', min: 0, max: 365 },
    { name: '1-3 年', min: 365, max: 1095 },
    { name: '3-5 年', min: 1095, max: 1825 },
    { name: '5 年以上', min: 1825, max: 99999 },
  ].map(({ name, min, max }) => {
    const days = (value: string) => (Date.now() - new Date(value).getTime()) / 86400_000
    return { name, value: active.filter(item => days(item.entry_date) >= min && days(item.entry_date) < max).length }
  })

  const education = [...new Set(active.map(item => item.education))].map(name => ({
    name,
    value: active.filter(item => item.education === name).length,
  }))

  const recentEntry = active.filter(item => (Date.now() - new Date(item.entry_date).getTime()) / 86400_000 <= 30).length

  return {
    updated: toDateString(new Date()),
    summary: {
      headcount: active.length,
      probation: active.filter(item => item.staff_state === '试用').length,
      new_hires: recentEntry,
      // 离职率按名册口径算，演示数据里离职人数固定
      turnover_rate: Math.round(((employees.length - active.length) / employees.length) * 100),
      payroll_total: round2(payroll.reduce((sum, item) => sum + item.gross_amount, 0)),
      avg_salary: avgSalary,
    },
    months,
    headcount_series: headcountSeries,
    payroll_series: payrollSeries,
    dept_share: deptShare,
    tenure: tenureBuckets,
    education,
  }
}

// ==================== 列表与路由 ====================

const HR_LISTS: Record<string, () => Record<string, any>[]> = {
  'hr/employee/roster': () => dataset().employees,
  'hr/employee/movement': () => dataset().movements,
  'hr/org/team': () => dataset().teams,
  'hr/attendance/record': () => dataset().attendance,
  'hr/attendance/summary': () => dataset().attendanceSummary,
  'hr/attendance/rule': () => dataset().attendanceRules,
  'hr/payroll/sheet': () => dataset().payroll,
}

function paginate(rows: Record<string, any>[], params: Record<string, any>) {
  const keyword = String(params.filter ?? '').trim()
  const filtered = keyword
    ? rows.filter(row => Object.values(row).some(value => typeof value === 'string' && value.includes(keyword)))
    : rows

  const page = Math.max(1, Number(params.page) || 1)
  const pagesize = Math.max(1, Number(params.pagesize) || 30)
  const totalcount = filtered.length
  const totalpages = Math.max(1, Math.ceil(totalcount / pagesize))
  const current = Math.min(page, totalpages)
  const offset = (current - 1) * pagesize

  return {
    list: filtered.slice(offset, offset + pagesize),
    totalcount,
    page: current,
    pageindex: current - 1,
    pagesize,
    totalpages,
    isempty: totalcount === 0,
    haspreviouspage: current > 1,
    hasnextpage: current < totalpages,
  }
}

/** 人力资源模块的 mock 入口 */
export function resolveHrMock(
  module: string,
  action: string,
  params: Record<string, any>,
): Record<string, any> | undefined {
  if (module === 'hr/dashboard')
    return buildHrDashboard()

  // 费用单据的收款人选择器会按 id 取单个员工，返回单条而不是分页对象
  if (module === 'hr/employee/roster' && action === 'get') {
    const staff = dataset().employees.find(item => item.id === params.id) ?? dataset().employees[0]!
    return { ...staff, name: staff.employee_name }
  }

  const builder = HR_LISTS[module]
  if (!builder)
    return undefined
  return paginate(builder(), params)
}
