import type { RouteRecordRaw } from 'vue-router'

/**
 * 人力资源
 *
 * 旧结构按「业务动作」拆菜单：补卡、外出、加班、调班、请假各占一项，
 * 36 个页面里一半是同构的申请单，员工想查一个人的考勤要在五个入口之间跳。
 *
 * 现在按「人 → 组织 → 考勤 → 薪酬 → 分析」组织，只保留能回答问题的页面：
 * 1. 员工：花名册与异动流水（入职/调入/调岗/晋升/离职合成一条时间线）
 * 2. 组织：团队编制，看每个部门缺不缺人
 * 3. 考勤：明细与月度汇总，异常集中在一张表里
 * 4. 薪酬：工资表，应发与实发逐项可查
 * 5. 分析：人力看板，人数、结构、成本趋势
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/hr',
    name: 'Hr',
    meta: {
      title: '人力资源',
      icon: 'ant-design:idcard-outlined',
      permissions: ['HR_EMPLOYEE_ROSTER', 'HR_ORG_TEAM', 'HR_ATTENDANCE_RECORD', 'HR_PAYROLL_SHEET'],
      alwaysShow: true,
      sort: 20,
    },
    children: [
      {
        path: 'employee',
        name: 'HrEmployee',
        meta: {
          title: '员工管理',
          permissions: ['HR_EMPLOYEE_ROSTER', 'HR_EMPLOYEE_MOVEMENT'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'roster',
            name: 'HrEmployeeRoster',
            meta: { title: '员工花名册', permissions: ['HR_EMPLOYEE_ROSTER'], keepAlive: true },
            component: () => import('@/views/hr/employee/roster/index.vue'),
          },
          {
            path: 'movement',
            name: 'HrEmployeeMovement',
            meta: { title: '异动流水', permissions: ['HR_EMPLOYEE_MOVEMENT'], keepAlive: true },
            component: () => import('@/views/hr/employee/movement/index.vue'),
          },
        ],
      },
      {
        path: 'org',
        name: 'HrOrg',
        meta: { title: '组织编制', permissions: ['HR_ORG_TEAM'], alwaysShow: true },
        children: [
          {
            path: 'team',
            name: 'HrOrgTeam',
            meta: { title: '团队编制', permissions: ['HR_ORG_TEAM'], keepAlive: true },
            component: () => import('@/views/hr/org/team/index.vue'),
          },
        ],
      },
      {
        path: 'attendance',
        name: 'HrAttendance',
        meta: {
          title: '考勤',
          permissions: ['HR_ATTENDANCE_RECORD', 'HR_ATTENDANCE_SUMMARY'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'record',
            name: 'HrAttendanceRecord',
            meta: { title: '考勤明细', permissions: ['HR_ATTENDANCE_RECORD'], keepAlive: true },
            component: () => import('@/views/hr/attendance/record/index.vue'),
          },
          {
            path: 'summary',
            name: 'HrAttendanceSummary',
            meta: { title: '月度汇总', permissions: ['HR_ATTENDANCE_SUMMARY'], keepAlive: true },
            component: () => import('@/views/hr/attendance/summary/index.vue'),
          },
        ],
      },
      {
        path: 'payroll',
        name: 'HrPayroll',
        meta: { title: '薪酬', permissions: ['HR_PAYROLL_SHEET'], alwaysShow: true },
        children: [
          {
            path: 'sheet',
            name: 'HrPayrollSheet',
            meta: { title: '工资表', permissions: ['HR_PAYROLL_SHEET'], keepAlive: true },
            component: () => import('@/views/hr/payroll/sheet/index.vue'),
          },
        ],
      },
      {
        path: 'report',
        name: 'HrReport',
        meta: { title: '人力分析', permissions: ['HR_REPORT_DASHBOARD'], alwaysShow: true },
        children: [
          {
            path: 'dashboard',
            name: 'HrReportDashboard',
            meta: { title: '人力看板', permissions: ['HR_REPORT_DASHBOARD'], keepAlive: true },
            component: () => import('@/views/hr/report/dashboard/index.vue'),
          },
        ],
      },
    ],
  },
]

export default routes
