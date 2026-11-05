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
