import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/staff',
    name: 'staff',
    meta: {
      title: '人事管理',
      icon: 'ant-design:safety-outlined',
      alwaysShow: true,
      sort: 10,
    },
    children: [
      {
        path: 'branch',
        name: 'StaffBranch',
        meta: {
          title: '分队管理',
          permissions: ['DEMO_STAFF_BRANCH'],
          keepAlive: true,
        },
        component: () => import('@/views/staff/branch/index.vue'),
      },
      {
        path: 'resume',
        name: 'StaffResume',
        meta: {
          title: '人员简历',
          permissions: ['DEMO_STAFF_RESUME'],
          keepAlive: true,
        },
        component: () => import('@/views/staff/resume/index.vue'),
      },
      {
        path: 'info',
        name: 'StaffInfo',
        meta: {
          title: '人员档案',
          permissions: ['DEMO_STAFF_INFO'],
          keepAlive: true,
        },
        component: () => import('@/views/staff/info/index.vue'),
      },
      {
        path: 'alter',
        name: 'StaffAlter',
        meta: {
          title: '人员变动',
          permissions: ['DEMO_STAFF_ENTRY', 'DEMO_STAFF_ALLOT', 'DEMO_STAFF_ADJUST', 'DEMO_STAFF_GRADE'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'entry',
            name: 'StaffEntry',
            meta: {
              title: '入职分配',
              permissions: ['DEMO_STAFF_ENTRY'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/alter/entry/index.vue'),
          },
          {
            path: 'allot',
            name: 'StaffAllot',
            meta: {
              title: '外部调动',
              permissions: ['DEMO_STAFF_ALLOT'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/alter/allot/index.vue'),
          },
          {
            path: 'adjust',
            name: 'StaffAdjust',
            meta: {
              title: '内部调岗',
              permissions: ['DEMO_STAFF_ADJUST'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/alter/adjust/index.vue'),
          },
          {
            path: 'grade',
            name: 'StaffGrade',
            meta: {
              title: '晋升降级',
              permissions: ['DEMO_STAFF_GRADE'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/alter/grade/index.vue'),
          },
        ],
      },
      {
        path: 'leave',
        name: 'StaffLeave',
        meta: {
          title: '人员离职',
          permissions: ['DEMO_STAFF_RETIRE', 'DEMO_STAFF_REMOVE', 'DEMO_STAFF_REFUSE'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'retire',
            name: 'StaffRetire',
            meta: {
              title: '人员辞职',
              permissions: ['DEMO_STAFF_RETIRE'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/leave/retire/index.vue'),
          },
          {
            path: 'remove',
            name: 'StaffRemove',
            meta: {
              title: '人员辞退',
              permissions: ['DEMO_STAFF_REMOVE'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/leave/remove/index.vue'),
          },
          {
            path: 'refuse',
            name: 'StaffRefuse',
            meta: {
              title: '人员自离',
              permissions: ['DEMO_STAFF_REFUSE'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/leave/refuse/index.vue'),
          },
        ],
      },
      {
        path: 'daily',
        name: 'StaffDaily',
        meta: {
          title: '日常管理',
          permissions: ['DEMO_STAFF_LABOR', 'DEMO_STAFF_SCALES', 'DEMO_STAFF_BECAUSE', 'DEMO_STAFF_EDUCATE'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'labor',
            name: 'StaffDailyLabor',
            meta: {
              title: '劳动合同',
              permissions: ['DEMO_STAFF_LABOR'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/daily/labor/index.vue'),
          },
          {
            path: 'scales',
            name: 'StaffDailyScales',
            meta: {
              title: '工资级别',
              permissions: ['DEMO_STAFF_SCALES'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/daily/scales/index.vue'),
          },
          {
            path: 'because',
            name: 'StaffDailyBecause',
            meta: {
              title: '奖惩登记',
              permissions: ['DEMO_STAFF_BECAUSE'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/daily/because/index.vue'),
          },
          {
            path: 'educate',
            name: 'StaffDailyEducat',
            meta: {
              title: '培训登记',
              permissions: ['DEMO_STAFF_EDUCATE'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/daily/educate/index.vue'),
          },
        ],
      },
      {
        path: 'checkin',
        name: 'Checkin',
        meta: {
          title: '考勤设置',
          permissions: [
            'DEMO_STAFF_CHECKIN_RULES',
            'DEMO_STAFF_CHECKIN_FESTIVAL',
            'DEMO_STAFF_CHECKIN_LEAVE',
          ],
          alwaysShow: true,
        },
        children: [
          {
            path: 'rules',
            name: 'CheckinRules',
            meta: {
              title: '考勤规则',
              permissions: ['DEMO_STAFF_CHECKIN_RULES'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/checkin/rules/index.vue'),
          },

          {
            path: 'festival',
            name: 'CheckinFestival',
            meta: {
              title: '公共假期',
              permissions: ['DEMO_STAFF_CHECKIN_FESTIVAL'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/checkin/festival/index.vue'),
          },
          {
            path: 'leave',
            name: 'CheckinLeave',
            meta: {
              title: '请假设置',
              permissions: ['DEMO_STAFF_CHECKIN_LEAVE'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/checkin/leave/index.vue'),
          },
        ],
      },
      {
        path: 'apply',
        name: 'StaffApply',
        meta: {
          title: '考勤申请',
          alwaysShow: true,
        },
        children: [
          {
            path: 'reissue',
            name: 'StaffApplyReissue',
            meta: {
              title: '补卡申请',
              keepAlive: true,
            },
            component: () => import('@/views/staff/apply/reissue/index.vue'),
          },
          {
            path: 'outside',
            name: 'StaffApplyOutside',
            meta: {
              title: '外出申请',
              keepAlive: true,
            },
            component: () => import('@/views/staff/apply/outside/index.vue'),
          },
          {
            path: 'overtime',
            name: 'StaffApplyOvertime',
            meta: {
              title: '加班申请',
              keepAlive: true,
            },
            component: () => import('@/views/staff/apply/overtime/index.vue'),
          },
          {
            path: 'translate',
            name: 'StaffApplyTranslate',
            meta: {
              title: '调班申请',
              keepAlive: true,
            },
            component: () => import('@/views/staff/apply/translate/index.vue'),
          },
          {
            path: 'vacation',
            name: 'StaffApplyVacation',
            meta: {
              title: '请假申请',
              keepAlive: true,
            },
            component: () => import('@/views/staff/apply/vacation/index.vue'),
          },
        ],
      },
      {
        path: 'checkout',
        name: 'Checkout',
        meta: {
          title: '考勤记录',
          permissions: [
            'DEMO_STAFF_CHECKIN_RECORD',
            'DEMO_STAFF_CHECKIN_DAILY',
            'DEMO_STAFF_CHECKIN_DAY',
            'DEMO_STAFF_CHECKIN_MONTH',
          ],
          alwaysShow: true,
        },
        children: [
          {
            path: 'record',
            name: 'CheckinRecord',
            meta: {
              title: '打卡记录',
              permissions: ['DEMO_STAFF_CHECKIN_RECORD'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/checkin/record/index.vue'),
          },
          {
            path: 'daily',
            name: 'CheckinDaily',
            meta: {
              title: '每日明细',
              permissions: ['DEMO_STAFF_CHECKIN_DAILY'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/checkin/daily/index.vue'),
          },
          {
            path: 'day',
            name: 'CheckinDay',
            meta: {
              title: '每日考勤',
              permissions: ['DEMO_STAFF_CHECKIN_DAY'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/checkin/day/index.vue'),
          },
          {
            path: 'month',
            name: 'CheckinMonth',
            meta: {
              title: '每月考勤',
              permissions: ['DEMO_STAFF_CHECKIN_MONTH'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/checkin/month/index.vue'),
          },
        ],
      },
      {
        path: 'protect',
        name: 'StaffProtect',
        meta: {
          title: '参保设置',
          permissions: [
            'DEMO_STAFF_PROTECT_HOUSE',
            'DEMO_STAFF_PROTECT_SOCIAL',
            'DEMO_STAFF_PROTECT_INSURE',
          ],
          alwaysShow: true,
        },
        children: [
          {
            path: 'house',
            name: 'StaffProtectHouse',
            meta: {
              title: '公积金',
              permissions: ['DEMO_STAFF_PROTECT_HOUSE'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/protect/house/index.vue'),
          },
          {
            path: 'social',
            name: 'StaffProtectSocial',
            meta: {
              title: '社会保险',
              permissions: ['DEMO_STAFF_PROTECT_SOCIAL'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/protect/social/index.vue'),
          },
          {
            path: 'insure',
            name: 'StaffProtectInsure',
            meta: {
              title: '商业保险',
              permissions: ['DEMO_STAFF_PROTECT_INSURE'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/protect/insure/index.vue'),
          },
        ],
      },
      {
        path: 'deduct',
        name: 'StaffDeduct',
        meta: {
          title: '参保扣款',
          permissions: ['DEMO_STAFF_DEDUCT_HOUSE', 'DEMO_STAFF_DEDUCT_SOCIAL'],
          alwaysShow: true,
        },
        children: [
          {
            path: 'house',
            name: 'StaffDeductHouse',
            meta: {
              title: '公积金',
              permissions: ['DEMO_STAFF_DEDUCT_HOUSE'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/deduct/house/index.vue'),
          },
          {
            path: 'social',
            name: 'StaffDeductSocial',
            meta: {
              title: '社会保险',
              permissions: ['DEMO_STAFF_DEDUCT_SOCIAL'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/deduct/social/index.vue'),
          },
        ],
      },
      {
        path: 'salary',
        name: 'StaffSalary',
        meta: {
          title: '工资管理',
          permissions: [
            'DEMO_STAFF_SALARY_GROUP',
            'DEMO_STAFF_SALARY_RECORD',
            'DEMO_STAFF_SALARY_PAYMENT',
          ],
          alwaysShow: true,
        },
        children: [
          {
            path: 'group',
            name: 'StaffSalaryGroup',
            meta: {
              title: '工资分组',
              permissions: ['DEMO_STAFF_SALARY_GROUP'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/salary/group/index.vue'),
          },
          {
            path: 'record',
            name: 'StaffSalaryRecord',
            meta: {
              title: '工资生成',
              permissions: ['DEMO_STAFF_SALARY_RECORD'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/salary/record/index.vue'),
          },
          {
            path: 'payment',
            name: 'StaffSalaryPayment',
            meta: {
              title: '工资计算',
              permissions: ['DEMO_STAFF_SALARY_PAYMENT'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/salary/payment/index.vue'),
          },
        ],
      },
      {
        path: 'report',
        name: 'StaffReport',
        meta: {
          title: '查询统计',
          permissions: ['DEMO_STAFF_REPORT_GZHZB', 'DEMO_STAFF_REPORT_RYJGB'],
          alwaysShow: true,
        },
        children: [
          // {
          //   path: 'query',
          //   name: 'staff-query',
          //   meta: {
          //     title: '申请单查询',
          //     permissions: ['DEMO_STAFF_QUERY'],
          //     keepAlive: true,
          //   },
          //   component: () => import('@/views/staff/query/index.vue'),
          // },
          {
            path: 'ryjgb',
            name: 'StaffReportRyjgb',
            meta: {
              title: '人员结构表',
              permissions: ['DEMO_STAFF_REPORT_RYJGB'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/report/ryjgb/index.vue'),
          },
          {
            path: 'gzhzb',
            name: 'StaffReportGzhzb',
            meta: {
              title: '工资汇总表',
              permissions: ['DEMO_STAFF_REPORT_GZHZB'],
              keepAlive: true,
            },
            component: () => import('@/views/staff/report/gzhzb/index.vue'),
          },
        ],
      },
    ],
  },
]

export default routes
