import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/hr',
    name: 'Hr',
    meta: {
      title: '人力资源',
      icon: 'ant-design:idcard-outlined',
      permissions: [
        'HR_ROSTER',
        'HR_RESUME',
        'HR_TEAM',
        'HR_MOVEMENT_ONBOARD',
        'HR_EXIT_RESIGN',
        'HR_RELATION_CONTRACT',
        'HR_ATTENDANCE_RULE',
        'HR_PAYROLL_GROUP',
      ],
      alwaysShow: true,
      sort: 20,
    },
    children: [
      {
        path: 'roster',
        name: 'HrRoster',
        meta: {
          title: '员工名册',
          permissions: ['HR_ROSTER'],
          keepAlive: true,
        },
        component: () => import('@/views/hr/roster/index.vue'),
      },
      {
        path: 'resume',
        name: 'HrResume',
        meta: {
          title: '简历库',
          permissions: ['HR_RESUME'],
          keepAlive: true,
        },
        component: () => import('@/views/hr/resume/index.vue'),
      },
      {
        path: 'team',
        name: 'HrTeam',
        meta: {
          title: '团队',
          permissions: ['HR_TEAM'],
          keepAlive: true,
        },
        component: () => import('@/views/hr/team/index.vue'),
      },
      {
        path: 'movement',
        name: 'HrMovement',
        meta: {
          title: '异动管理',
          permissions: [
            'HR_MOVEMENT_ONBOARD',
            'HR_MOVEMENT_TRANSFER',
            'HR_MOVEMENT_ADJUST',
            'HR_MOVEMENT_PROMOTION',
          ],
          alwaysShow: true,
        },
        children: [
          {
            path: 'onboard',
            name: 'HrMovementOnboard',
            meta: {
              title: '入职',
              permissions: ['HR_MOVEMENT_ONBOARD'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/movement/onboard/index.vue'),
          },
          {
            path: 'transfer',
            name: 'HrMovementTransfer',
            meta: {
              title: '调入',
              permissions: ['HR_MOVEMENT_TRANSFER'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/movement/transfer/index.vue'),
          },
          {
            path: 'adjust',
            name: 'HrMovementAdjust',
            meta: {
              title: '调岗',
              permissions: ['HR_MOVEMENT_ADJUST'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/movement/adjust/index.vue'),
          },
          {
            path: 'promotion',
            name: 'HrMovementPromotion',
            meta: {
              title: '晋升',
              permissions: ['HR_MOVEMENT_PROMOTION'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/movement/promotion/index.vue'),
          },
        ],
      },
      {
        path: 'exit',
        name: 'HrExit',
        meta: {
          title: '离职管理',
          permissions: ['HR_EXIT_RESIGN', 'HR_EXIT_DISMISS', 'HR_EXIT_ABSENT'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'resign',
            name: 'HrExitResign',
            meta: {
              title: '主动离职',
              permissions: ['HR_EXIT_RESIGN'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/exit/resign/index.vue'),
          },
          {
            path: 'dismiss',
            name: 'HrExitDismiss',
            meta: {
              title: '解聘',
              permissions: ['HR_EXIT_DISMISS'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/exit/dismiss/index.vue'),
          },
          {
            path: 'absent',
            name: 'HrExitAbsent',
            meta: {
              title: '自动离职',
              permissions: ['HR_EXIT_ABSENT'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/exit/absent/index.vue'),
          },
        ],
      },
      {
        path: 'relation',
        name: 'HrRelation',
        meta: {
          title: '员工关系',
          permissions: [
            'HR_RELATION_CONTRACT',
            'HR_RELATION_LEVEL',
            'HR_RELATION_REWARD',
            'HR_RELATION_TRAINING',
          ],
          alwaysShow: true,
        },
        children: [
          {
            path: 'contract',
            name: 'HrRelationContract',
            meta: {
              title: '劳动合同',
              permissions: ['HR_RELATION_CONTRACT'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/relation/contract/index.vue'),
          },
          {
            path: 'level',
            name: 'HrRelationLevel',
            meta: {
              title: '职级',
              permissions: ['HR_RELATION_LEVEL'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/relation/level/index.vue'),
          },
          {
            path: 'reward',
            name: 'HrRelationReward',
            meta: {
              title: '奖惩',
              permissions: ['HR_RELATION_REWARD'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/relation/reward/index.vue'),
          },
          {
            path: 'training',
            name: 'HrRelationTraining',
            meta: {
              title: '培训',
              permissions: ['HR_RELATION_TRAINING'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/relation/training/index.vue'),
          },
        ],
      },
      {
        path: 'attendance',
        name: 'HrAttendance',
        meta: {
          title: '考勤设置',
          permissions: ['HR_ATTENDANCE_RULE', 'HR_ATTENDANCE_HOLIDAY', 'HR_ATTENDANCE_LEAVE'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'rule',
            name: 'HrAttendanceRule',
            meta: {
              title: '考勤规则',
              permissions: ['HR_ATTENDANCE_RULE'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/attendance/rule/index.vue'),
          },
          {
            path: 'holiday',
            name: 'HrAttendanceHoliday',
            meta: {
              title: '假期设置',
              permissions: ['HR_ATTENDANCE_HOLIDAY'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/attendance/holiday/index.vue'),
          },
          {
            path: 'leave-rule',
            name: 'HrAttendanceLeave',
            meta: {
              title: '请假规则',
              permissions: ['HR_ATTENDANCE_LEAVE'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/attendance/leave-rule/index.vue'),
          },
        ],
      },
      {
        path: 'attendance-apply',
        name: 'HrAttendanceApply',
        meta: {
          title: '考勤申请',
          permissions: [
            'HR_APPLY_MAKEUP',
            'HR_APPLY_FIELD',
            'HR_APPLY_OVERTIME',
            'HR_APPLY_SHIFT',
            'HR_APPLY_LEAVE',
          ],
          alwaysShow: true,
        },
        children: [
          {
            path: 'makeup',
            name: 'HrApplyMakeup',
            meta: {
              title: '补卡',
              permissions: ['HR_APPLY_MAKEUP'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/attendance-apply/makeup/index.vue'),
          },
          {
            path: 'field',
            name: 'HrApplyField',
            meta: {
              title: '外出',
              permissions: ['HR_APPLY_FIELD'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/attendance-apply/field/index.vue'),
          },
          {
            path: 'overtime',
            name: 'HrApplyOvertime',
            meta: {
              title: '加班',
              permissions: ['HR_APPLY_OVERTIME'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/attendance-apply/overtime/index.vue'),
          },
          {
            path: 'shift',
            name: 'HrApplyShift',
            meta: {
              title: '调班',
              permissions: ['HR_APPLY_SHIFT'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/attendance-apply/shift/index.vue'),
          },
          {
            path: 'leave',
            name: 'HrApplyLeave',
            meta: {
              title: '请假',
              permissions: ['HR_APPLY_LEAVE'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/attendance-apply/leave/index.vue'),
          },
        ],
      },
      {
        path: 'attendance-record',
        name: 'HrAttendanceRecord',
        meta: {
          title: '考勤记录',
          permissions: [
            'HR_ATTENDANCE_PUNCH',
            'HR_ATTENDANCE_DAILY',
            'HR_ATTENDANCE_SUMMARY',
            'HR_ATTENDANCE_MONTHLY',
          ],
          alwaysShow: true,
        },
        children: [
          {
            path: 'punch',
            name: 'HrRecordPunch',
            meta: {
              title: '打卡记录',
              permissions: ['HR_ATTENDANCE_PUNCH'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/attendance/punch/index.vue'),
          },
          {
            path: 'daily',
            name: 'HrRecordDaily',
            meta: {
              title: '每日明细',
              permissions: ['HR_ATTENDANCE_DAILY'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/attendance/daily/index.vue'),
          },
          {
            path: 'daily-summary',
            name: 'HrRecordSummary',
            meta: {
              title: '日汇总',
              permissions: ['HR_ATTENDANCE_SUMMARY'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/attendance/daily-summary/index.vue'),
          },
          {
            path: 'monthly',
            name: 'HrRecordMonthly',
            meta: {
              title: '月汇总',
              permissions: ['HR_ATTENDANCE_MONTHLY'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/attendance/monthly/index.vue'),
          },
        ],
      },
      {
        path: 'insurance',
        name: 'HrInsurance',
        meta: {
          title: '社保福利',
          permissions: ['HR_INSURANCE_HOUSING', 'HR_INSURANCE_SOCIAL', 'HR_INSURANCE_COMMERCIAL'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'housing',
            name: 'HrInsuranceHousing',
            meta: {
              title: '公积金',
              permissions: ['HR_INSURANCE_HOUSING'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/insurance/housing/index.vue'),
          },
          {
            path: 'social',
            name: 'HrInsuranceSocial',
            meta: {
              title: '社会保险',
              permissions: ['HR_INSURANCE_SOCIAL'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/insurance/social/index.vue'),
          },
          {
            path: 'commercial',
            name: 'HrInsuranceCommercial',
            meta: {
              title: '商业保险',
              permissions: ['HR_INSURANCE_COMMERCIAL'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/insurance/commercial/index.vue'),
          },
        ],
      },
      {
        path: 'deduction',
        name: 'HrDeduction',
        meta: {
          title: '社保扣款',
          permissions: ['HR_DEDUCTION_HOUSING', 'HR_DEDUCTION_SOCIAL'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'housing',
            name: 'HrDeductionHousing',
            meta: {
              title: '公积金',
              permissions: ['HR_DEDUCTION_HOUSING'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/deduction/housing/index.vue'),
          },
          {
            path: 'social',
            name: 'HrDeductionSocial',
            meta: {
              title: '社会保险',
              permissions: ['HR_DEDUCTION_SOCIAL'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/deduction/social/index.vue'),
          },
        ],
      },
      {
        path: 'payroll',
        name: 'HrPayroll',
        meta: {
          title: '薪酬管理',
          permissions: ['HR_PAYROLL_GROUP', 'HR_PAYROLL_GENERATE', 'HR_PAYROLL_PAYMENT'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'group',
            name: 'HrPayrollGroup',
            meta: {
              title: '薪酬组',
              permissions: ['HR_PAYROLL_GROUP'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/payroll/group/index.vue'),
          },
          {
            path: 'generate',
            name: 'HrPayrollGenerate',
            meta: {
              title: '薪酬生成',
              permissions: ['HR_PAYROLL_GENERATE'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/payroll/generate/index.vue'),
          },
          {
            path: 'payment',
            name: 'HrPayrollPayment',
            meta: {
              title: '薪酬发放',
              permissions: ['HR_PAYROLL_PAYMENT'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/payroll/payment/index.vue'),
          },
        ],
      },
      {
        path: 'report',
        name: 'HrReport',
        meta: {
          title: '人事报表',
          permissions: ['HR_REPORT_STRUCTURE', 'HR_REPORT_SUMMARY'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'structure',
            name: 'HrReportStructure',
            meta: {
              title: '人员结构',
              permissions: ['HR_REPORT_STRUCTURE'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/report/structure/index.vue'),
          },
          {
            path: 'summary',
            name: 'HrReportSummary',
            meta: {
              title: '薪酬汇总',
              permissions: ['HR_REPORT_SUMMARY'],
              keepAlive: true,
            },
            component: () => import('@/views/hr/report/summary/index.vue'),
          },
        ],
      },
    ],
  },
]

export default routes
