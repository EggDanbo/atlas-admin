/* eslint-disable */
// 本文件由 scripts/mock/extract-schema.mjs 自动生成，请勿手动修改
// 数据来源：src/views 中的列配置、表单配置与数据格式声明；src/router 中的路由权限声明

export interface MockFieldSchema {
  field: string
  title: string
}

export interface MockDirSchema {
  formats: string[]
  /** 列表页真实列字段（优先用于构建表格列） */
  columnFields: MockFieldSchema[]
  /** 该模块全部业务字段（列表列 + 表单字段） */
  fields: MockFieldSchema[]
}

export const MODULE_SCHEMA: Record<string, MockDirSchema> = {
  "access/grant": {
    "formats": [
      "atlas/access/grant"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "team",
        "title": ""
      },
      {
        "field": "role_list",
        "title": ""
      },
      {
        "field": "pwd",
        "title": ""
      }
    ]
  },
  "access/group": {
    "formats": [
      "atlas/access/group"
    ],
    "columnFields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "code",
        "title": "账号"
      },
      {
        "field": "mobile",
        "title": "手机号"
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "perm_name",
        "title": "分组权限"
      },
      {
        "field": "working",
        "title": "工作中"
      }
    ],
    "fields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "code",
        "title": "账号"
      },
      {
        "field": "mobile",
        "title": "手机号"
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "perm_name",
        "title": "分组权限"
      },
      {
        "field": "working",
        "title": "工作中"
      },
      {
        "field": "ctime",
        "title": "创建时间"
      },
      {
        "field": "utime",
        "title": "更新时间"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "user_id",
        "title": "用户ID"
      },
      {
        "field": "perm_team",
        "title": ""
      },
      {
        "field": "team",
        "title": ""
      },
      {
        "field": "group_list",
        "title": ""
      },
      {
        "field": "pwd",
        "title": ""
      }
    ]
  },
  "access/member": {
    "formats": [
      "atlas/access/member"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "sort",
        "title": "排序"
      },
      {
        "field": "name",
        "title": "排序"
      },
      {
        "field": "user_id",
        "title": "用户ID"
      },
      {
        "field": "stoped",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "mobile_number",
        "title": "手机号码"
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "wkno",
        "title": ""
      },
      {
        "field": "id_no",
        "title": ""
      },
      {
        "field": "gender",
        "title": ""
      },
      {
        "field": "position",
        "title": "岗位"
      },
      {
        "field": "user_pic",
        "title": ""
      }
    ]
  },
  "access/partner": {
    "formats": [
      "atlas/access/partner"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "stoped",
        "title": ""
      },
      {
        "field": "no",
        "title": ""
      },
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "hotline",
        "title": ""
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "account",
        "title": ""
      },
      {
        "field": "deposit",
        "title": ""
      },
      {
        "field": "contact",
        "title": "证明人"
      },
      {
        "field": "mobile",
        "title": "手机号"
      },
      {
        "field": "email",
        "title": "邮箱"
      },
      {
        "field": "address",
        "title": "用餐地点"
      }
    ]
  },
  "access/partner-account": {
    "formats": [
      "atlas/access/partner-account"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "description",
        "title": ""
      }
    ]
  },
  "access/partner-role": {
    "formats": [],
    "columnFields": [],
    "fields": [
      {
        "field": "sort",
        "title": "排序"
      },
      {
        "field": "name",
        "title": "排序"
      },
      {
        "field": "role",
        "title": ""
      },
      {
        "field": "perms",
        "title": ""
      },
      {
        "field": "data",
        "title": ""
      }
    ]
  },
  "access/role": {
    "formats": [],
    "columnFields": [],
    "fields": [
      {
        "field": "sort",
        "title": "排序"
      },
      {
        "field": "name",
        "title": "排序"
      },
      {
        "field": "role",
        "title": ""
      },
      {
        "field": "perms",
        "title": ""
      },
      {
        "field": "data",
        "title": ""
      }
    ]
  },
  "access/room": {
    "formats": [
      "atlas/access/room"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "stoped",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "address",
        "title": "用餐地点"
      },
      {
        "field": "parent_id",
        "title": ""
      }
    ]
  },
  "access/unit": {
    "formats": [
      "atlas/access/unit"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "stoped",
        "title": ""
      },
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "organ_code",
        "title": ""
      },
      {
        "field": "fullname",
        "title": ""
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "fore",
        "title": ""
      },
      {
        "field": "address",
        "title": "用餐地点"
      },
      {
        "field": "wechat_work_dept",
        "title": ""
      }
    ]
  },
  "archive/borrow": {
    "formats": [
      "atlas/archive/borrow"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "no",
        "title": ""
      },
      {
        "field": "user_id",
        "title": "用户ID"
      },
      {
        "field": "user_name",
        "title": "操作人"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "paper_id",
        "title": ""
      },
      {
        "field": "paper_name",
        "title": ""
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "archive/document": {
    "formats": [
      "atlas/archive/document"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "status",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "no",
        "title": ""
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "content",
        "title": "培训内容"
      },
      {
        "field": "location",
        "title": ""
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "stoped",
        "title": ""
      }
    ]
  },
  "asset/allot": {
    "formats": [
      "atlas/asset/bill"
    ],
    "columnFields": [
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "资产名称"
      },
      {
        "field": "brand",
        "title": "品牌"
      },
      {
        "field": "model",
        "title": "规格型号"
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ],
    "fields": [
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "资产名称"
      },
      {
        "field": "brand",
        "title": "品牌"
      },
      {
        "field": "model",
        "title": "规格型号"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "team_in",
        "title": ""
      },
      {
        "field": "team_in_name",
        "title": ""
      },
      {
        "field": "user_id",
        "title": "用户ID"
      },
      {
        "field": "user_name",
        "title": "操作人"
      },
      {
        "field": "check_id",
        "title": ""
      },
      {
        "field": "check_name",
        "title": ""
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "digest",
        "title": "摘要"
      }
    ]
  },
  "asset/apply": {
    "formats": [
      "atlas/asset/apply"
    ],
    "columnFields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "pcs",
        "title": "申领数量"
      },
      {
        "field": "unit",
        "title": "计量单位"
      },
      {
        "field": "model",
        "title": "规格型号"
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ],
    "fields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "pcs",
        "title": "申领数量"
      },
      {
        "field": "unit",
        "title": "计量单位"
      },
      {
        "field": "model",
        "title": "规格型号"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "predict",
        "title": "需求日期"
      },
      {
        "field": "require",
        "title": ""
      },
      {
        "field": "digest",
        "title": "摘要"
      }
    ]
  },
  "asset/batch": {
    "formats": [
      "atlas/asset/bill"
    ],
    "columnFields": [
      {
        "field": "article_name",
        "title": "资产分类"
      },
      {
        "field": "unit",
        "title": "计量单位"
      },
      {
        "field": "name",
        "title": "资产名称"
      },
      {
        "field": "brand",
        "title": "品牌"
      },
      {
        "field": "model",
        "title": "规格型号"
      },
      {
        "field": "pcs",
        "title": "数量"
      },
      {
        "field": "amount",
        "title": "购置金额"
      },
      {
        "field": "enroll",
        "title": "购置日期"
      },
      {
        "field": "source",
        "title": "取得方式"
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ],
    "fields": [
      {
        "field": "article_name",
        "title": "资产分类"
      },
      {
        "field": "unit",
        "title": "计量单位"
      },
      {
        "field": "name",
        "title": "资产名称"
      },
      {
        "field": "brand",
        "title": "品牌"
      },
      {
        "field": "model",
        "title": "规格型号"
      },
      {
        "field": "pcs",
        "title": "数量"
      },
      {
        "field": "amount",
        "title": "购置金额"
      },
      {
        "field": "enroll",
        "title": "购置日期"
      },
      {
        "field": "source",
        "title": "取得方式"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "article_id",
        "title": "资产分类"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "date",
        "title": ""
      }
    ]
  },
  "asset/check": {
    "formats": [
      "atlas/asset/check/bill",
      "atlas/asset/check"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "status",
        "title": ""
      },
      {
        "field": "bill_id",
        "title": ""
      },
      {
        "field": "bill_no",
        "title": ""
      }
    ]
  },
  "asset/disuse": {
    "formats": [
      "atlas/asset/bill"
    ],
    "columnFields": [
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "资产名称"
      },
      {
        "field": "brand",
        "title": "品牌"
      },
      {
        "field": "model",
        "title": "规格型号"
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ],
    "fields": [
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "资产名称"
      },
      {
        "field": "brand",
        "title": "品牌"
      },
      {
        "field": "model",
        "title": "规格型号"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "user_id",
        "title": "用户ID"
      },
      {
        "field": "user_name",
        "title": "操作人"
      },
      {
        "field": "user_in",
        "title": ""
      },
      {
        "field": "user_in_name",
        "title": ""
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "digest",
        "title": "摘要"
      }
    ]
  },
  "asset/info": {
    "formats": [
      "atlas/asset/info"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "stoped",
        "title": ""
      },
      {
        "field": "status",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "article_id",
        "title": "资产分类"
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "brand",
        "title": "品牌"
      },
      {
        "field": "model",
        "title": "规格型号"
      },
      {
        "field": "unit",
        "title": "计量单位"
      },
      {
        "field": "supplier",
        "title": "供应商"
      },
      {
        "field": "serial",
        "title": ""
      },
      {
        "field": "source",
        "title": "源"
      },
      {
        "field": "enroll",
        "title": "购置日期"
      },
      {
        "field": "disuse",
        "title": ""
      },
      {
        "field": "amount",
        "title": "金额"
      },
      {
        "field": "realize",
        "title": ""
      },
      {
        "field": "methods",
        "title": ""
      },
      {
        "field": "durable",
        "title": ""
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "periods",
        "title": ""
      },
      {
        "field": "compute",
        "title": ""
      },
      {
        "field": "accrual",
        "title": ""
      },
      {
        "field": "address",
        "title": "用餐地点"
      },
      {
        "field": "lead_id",
        "title": ""
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "pic_id",
        "title": ""
      }
    ]
  },
  "asset/lease": {
    "formats": [
      "atlas/asset/bill"
    ],
    "columnFields": [
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "资产名称"
      },
      {
        "field": "brand",
        "title": "品牌"
      },
      {
        "field": "model",
        "title": "规格型号"
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ],
    "fields": [
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "资产名称"
      },
      {
        "field": "brand",
        "title": "品牌"
      },
      {
        "field": "model",
        "title": "规格型号"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "lend_name",
        "title": ""
      },
      {
        "field": "user_id",
        "title": "用户ID"
      },
      {
        "field": "user_name",
        "title": "操作人"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "digest",
        "title": "摘要"
      }
    ]
  },
  "asset/order": {
    "formats": [
      "atlas/asset/order"
    ],
    "columnFields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "pcs",
        "title": "申领数量"
      },
      {
        "field": "unit",
        "title": "计量单位"
      },
      {
        "field": "model",
        "title": "规格型号"
      },
      {
        "field": "outer_id",
        "title": "供应商"
      },
      {
        "field": "price",
        "title": "单价"
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ],
    "fields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "pcs",
        "title": "申领数量"
      },
      {
        "field": "unit",
        "title": "计量单位"
      },
      {
        "field": "model",
        "title": "规格型号"
      },
      {
        "field": "outer_id",
        "title": "供应商"
      },
      {
        "field": "price",
        "title": "单价"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "require",
        "title": ""
      },
      {
        "field": "digest",
        "title": "摘要"
      }
    ]
  },
  "asset/repair": {
    "formats": [
      "atlas/asset/bill"
    ],
    "columnFields": [
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "资产名称"
      },
      {
        "field": "brand",
        "title": "品牌"
      },
      {
        "field": "model",
        "title": "规格型号"
      },
      {
        "field": "outer_name",
        "title": "维保单位"
      },
      {
        "field": "contact",
        "title": "联系人"
      },
      {
        "field": "mobile",
        "title": "手机号"
      },
      {
        "field": "explain",
        "title": "维保内容"
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ],
    "fields": [
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "资产名称"
      },
      {
        "field": "brand",
        "title": "品牌"
      },
      {
        "field": "model",
        "title": "规格型号"
      },
      {
        "field": "outer_name",
        "title": "维保单位"
      },
      {
        "field": "contact",
        "title": "联系人"
      },
      {
        "field": "mobile",
        "title": "手机号"
      },
      {
        "field": "explain",
        "title": "维保内容"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "outer_id",
        "title": "维保单位"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "user_id",
        "title": "用户ID"
      },
      {
        "field": "user_name",
        "title": "操作人"
      },
      {
        "field": "user_in",
        "title": ""
      },
      {
        "field": "user_in_name",
        "title": ""
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "no",
        "title": ""
      }
    ]
  },
  "asset/resume": {
    "formats": [
      "atlas/asset/bill"
    ],
    "columnFields": [
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "资产名称"
      },
      {
        "field": "brand",
        "title": "品牌"
      },
      {
        "field": "model",
        "title": "规格型号"
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ],
    "fields": [
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "资产名称"
      },
      {
        "field": "brand",
        "title": "品牌"
      },
      {
        "field": "model",
        "title": "规格型号"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "user_id",
        "title": "用户ID"
      },
      {
        "field": "user_name",
        "title": "操作人"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "digest",
        "title": "摘要"
      }
    ]
  },
  "asset/value": {
    "formats": [
      "atlas/asset/value"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "methods",
        "title": ""
      },
      {
        "field": "period",
        "title": ""
      },
      {
        "field": "name",
        "title": "格式名称"
      }
    ]
  },
  "crm/billing/invoice": {
    "formats": [
      "atlas/crm/billing/invoice"
    ],
    "columnFields": [
      {
        "field": "invoice_no",
        "title": "发票号码"
      },
      {
        "field": "customer_name",
        "title": "客户"
      },
      {
        "field": "project_name",
        "title": "项目"
      },
      {
        "field": "amount",
        "title": "金额"
      },
      {
        "field": "tax_rate",
        "title": "税率(%)"
      },
      {
        "field": "invoice_type",
        "title": "发票类型"
      },
      {
        "field": "invoice_date",
        "title": "开票日期"
      },
      {
        "field": "invoice_state",
        "title": "认证状态"
      }
    ],
    "fields": [
      {
        "field": "invoice_no",
        "title": "发票号码"
      },
      {
        "field": "customer_name",
        "title": "客户"
      },
      {
        "field": "project_name",
        "title": "项目"
      },
      {
        "field": "amount",
        "title": "金额"
      },
      {
        "field": "tax_rate",
        "title": "税率(%)"
      },
      {
        "field": "invoice_type",
        "title": "发票类型"
      },
      {
        "field": "invoice_date",
        "title": "开票日期"
      },
      {
        "field": "invoice_state",
        "title": "认证状态"
      }
    ]
  },
  "crm/billing/receipt": {
    "formats": [
      "atlas/crm/billing/receipt"
    ],
    "columnFields": [
      {
        "field": "customer_name",
        "title": "客户"
      },
      {
        "field": "project_name",
        "title": "项目"
      },
      {
        "field": "invoice_no",
        "title": "对应发票"
      },
      {
        "field": "receipt_amount",
        "title": "回款金额"
      },
      {
        "field": "pay_method",
        "title": "回款方式"
      },
      {
        "field": "receipt_date",
        "title": "到账日期"
      },
      {
        "field": "receipt_state",
        "title": "认领状态"
      }
    ],
    "fields": [
      {
        "field": "customer_name",
        "title": "客户"
      },
      {
        "field": "project_name",
        "title": "项目"
      },
      {
        "field": "invoice_no",
        "title": "对应发票"
      },
      {
        "field": "receipt_amount",
        "title": "回款金额"
      },
      {
        "field": "pay_method",
        "title": "回款方式"
      },
      {
        "field": "receipt_date",
        "title": "到账日期"
      },
      {
        "field": "receipt_state",
        "title": "认领状态"
      }
    ]
  },
  "crm/billing/revenue": {
    "formats": [],
    "columnFields": [],
    "fields": []
  },
  "crm/customer/archive": {
    "formats": [
      "atlas/crm/customer/archive"
    ],
    "columnFields": [
      {
        "field": "customer_name",
        "title": "客户名称"
      },
      {
        "field": "customer_level",
        "title": "客户分级"
      },
      {
        "field": "owner",
        "title": "负责人"
      },
      {
        "field": "coop_state",
        "title": "合作状态"
      },
      {
        "field": "project_count",
        "title": "项目数"
      },
      {
        "field": "contract_total",
        "title": "累计合同额"
      },
      {
        "field": "receivable_amount",
        "title": "应收余额"
      }
    ],
    "fields": [
      {
        "field": "customer_name",
        "title": "客户名称"
      },
      {
        "field": "customer_level",
        "title": "客户分级"
      },
      {
        "field": "owner",
        "title": "负责人"
      },
      {
        "field": "coop_state",
        "title": "合作状态"
      },
      {
        "field": "project_count",
        "title": "项目数"
      },
      {
        "field": "contract_total",
        "title": "累计合同额"
      },
      {
        "field": "receivable_amount",
        "title": "应收余额"
      }
    ]
  },
  "crm/customer/contact": {
    "formats": [
      "atlas/crm/customer/contact"
    ],
    "columnFields": [
      {
        "field": "customer_name",
        "title": "所属客户"
      },
      {
        "field": "contact_name",
        "title": "姓名"
      },
      {
        "field": "job_title",
        "title": "职务"
      },
      {
        "field": "phone",
        "title": "手机号"
      },
      {
        "field": "email",
        "title": "邮箱"
      },
      {
        "field": "decision_role",
        "title": "决策角色"
      }
    ],
    "fields": [
      {
        "field": "customer_name",
        "title": "所属客户"
      },
      {
        "field": "contact_name",
        "title": "姓名"
      },
      {
        "field": "job_title",
        "title": "职务"
      },
      {
        "field": "phone",
        "title": "手机号"
      },
      {
        "field": "email",
        "title": "邮箱"
      },
      {
        "field": "decision_role",
        "title": "决策角色"
      }
    ]
  },
  "crm/delivery/milestone": {
    "formats": [
      "atlas/crm/delivery/milestone"
    ],
    "columnFields": [
      {
        "field": "project_name",
        "title": "项目"
      },
      {
        "field": "customer_name",
        "title": "客户"
      },
      {
        "field": "milestone_node",
        "title": "里程碑"
      },
      {
        "field": "plan_date",
        "title": "计划完成"
      },
      {
        "field": "actual_date",
        "title": "实际完成"
      },
      {
        "field": "delay_days",
        "title": "延期(天)"
      },
      {
        "field": "node_state",
        "title": "状态"
      },
      {
        "field": "manager",
        "title": "项目经理"
      }
    ],
    "fields": [
      {
        "field": "project_name",
        "title": "项目"
      },
      {
        "field": "customer_name",
        "title": "客户"
      },
      {
        "field": "milestone_node",
        "title": "里程碑"
      },
      {
        "field": "plan_date",
        "title": "计划完成"
      },
      {
        "field": "actual_date",
        "title": "实际完成"
      },
      {
        "field": "delay_days",
        "title": "延期(天)"
      },
      {
        "field": "node_state",
        "title": "状态"
      },
      {
        "field": "manager",
        "title": "项目经理"
      }
    ]
  },
  "crm/delivery/project": {
    "formats": [
      "atlas/crm/delivery/project"
    ],
    "columnFields": [
      {
        "field": "project_no",
        "title": "项目编号"
      },
      {
        "field": "project_name",
        "title": "项目名称"
      },
      {
        "field": "customer_name",
        "title": "客户"
      },
      {
        "field": "contract_amount",
        "title": "合同额"
      },
      {
        "field": "progress",
        "title": "交付进度"
      },
      {
        "field": "receipt_rate",
        "title": "回款进度(%)"
      },
      {
        "field": "project_state",
        "title": "状态"
      },
      {
        "field": "manager",
        "title": "项目经理"
      }
    ],
    "fields": [
      {
        "field": "project_no",
        "title": "项目编号"
      },
      {
        "field": "project_name",
        "title": "项目名称"
      },
      {
        "field": "customer_name",
        "title": "客户"
      },
      {
        "field": "contract_amount",
        "title": "合同额"
      },
      {
        "field": "progress",
        "title": "交付进度"
      },
      {
        "field": "receipt_rate",
        "title": "回款进度(%)"
      },
      {
        "field": "project_state",
        "title": "状态"
      },
      {
        "field": "manager",
        "title": "项目经理"
      }
    ]
  },
  "crm/opportunity/funnel": {
    "formats": [],
    "columnFields": [],
    "fields": []
  },
  "crm/opportunity/list": {
    "formats": [
      "atlas/crm/opportunity/list"
    ],
    "columnFields": [
      {
        "field": "opp_name",
        "title": "商机名称"
      },
      {
        "field": "customer_name",
        "title": "客户"
      },
      {
        "field": "expect_amount",
        "title": "预计金额"
      },
      {
        "field": "opp_stage",
        "title": "阶段"
      },
      {
        "field": "win_rate",
        "title": "赢单率(%)"
      },
      {
        "field": "expect_date",
        "title": "预计成交"
      },
      {
        "field": "owner",
        "title": "负责人"
      }
    ],
    "fields": [
      {
        "field": "opp_name",
        "title": "商机名称"
      },
      {
        "field": "customer_name",
        "title": "客户"
      },
      {
        "field": "expect_amount",
        "title": "预计金额"
      },
      {
        "field": "opp_stage",
        "title": "阶段"
      },
      {
        "field": "win_rate",
        "title": "赢单率(%)"
      },
      {
        "field": "expect_date",
        "title": "预计成交"
      },
      {
        "field": "owner",
        "title": "负责人"
      }
    ]
  },
  "dashboard/monitor": {
    "formats": [],
    "columnFields": [],
    "fields": []
  },
  "dashboard/overview": {
    "formats": [],
    "columnFields": [],
    "fields": []
  },
  "expense/advance": {
    "formats": [
      "atlas/expense/payment"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "user_id",
        "title": "用户ID"
      },
      {
        "field": "user_name",
        "title": "操作人"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "amount",
        "title": "金额"
      },
      {
        "field": "contract_id",
        "title": ""
      },
      {
        "field": "apply_id",
        "title": ""
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "payee_id",
        "title": ""
      },
      {
        "field": "payee_name",
        "title": ""
      },
      {
        "field": "payee_bank",
        "title": ""
      },
      {
        "field": "payee_open",
        "title": ""
      },
      {
        "field": "payee_link",
        "title": ""
      },
      {
        "field": "status",
        "title": ""
      },
      {
        "field": "printed",
        "title": ""
      }
    ]
  },
  "expense/budget": {
    "formats": [
      "atlas/expense/budget"
    ],
    "columnFields": [
      {
        "field": "content_name",
        "title": "费用分类"
      },
      {
        "field": "indate",
        "title": "有效期"
      },
      {
        "field": "amount",
        "title": "金额"
      }
    ],
    "fields": [
      {
        "field": "content_name",
        "title": "费用分类"
      },
      {
        "field": "indate",
        "title": "有效期"
      },
      {
        "field": "amount",
        "title": "金额"
      },
      {
        "field": "content_id",
        "title": "费用分类"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "user_id",
        "title": "用户ID"
      },
      {
        "field": "user_name",
        "title": "操作人"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "status",
        "title": ""
      },
      {
        "field": "printed",
        "title": ""
      }
    ]
  },
  "expense/contract": {
    "formats": [
      "atlas/expense/contract"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "link_id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "outer_id",
        "title": "维保单位"
      },
      {
        "field": "outer_name",
        "title": "维保单位"
      },
      {
        "field": "project_id",
        "title": ""
      },
      {
        "field": "project_name",
        "title": "项目名称"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "no",
        "title": ""
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "source",
        "title": "源"
      },
      {
        "field": "payment",
        "title": ""
      },
      {
        "field": "indate",
        "title": "有效期"
      },
      {
        "field": "revise",
        "title": ""
      },
      {
        "field": "expire",
        "title": "结束日期"
      },
      {
        "field": "amount",
        "title": "金额"
      },
      {
        "field": "ensure",
        "title": ""
      },
      {
        "field": "content",
        "title": "培训内容"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "states",
        "title": ""
      }
    ]
  },
  "expense/deposit": {
    "formats": [
      "atlas/expense/payment"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "user_id",
        "title": "用户ID"
      },
      {
        "field": "user_name",
        "title": "操作人"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "amount",
        "title": "金额"
      },
      {
        "field": "contract_id",
        "title": ""
      },
      {
        "field": "apply_id",
        "title": ""
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "payee_id",
        "title": ""
      },
      {
        "field": "payee_name",
        "title": ""
      },
      {
        "field": "payee_bank",
        "title": ""
      },
      {
        "field": "payee_open",
        "title": ""
      },
      {
        "field": "payee_link",
        "title": ""
      },
      {
        "field": "status",
        "title": ""
      },
      {
        "field": "printed",
        "title": ""
      }
    ]
  },
  "expense/entertain": {
    "formats": [
      "atlas/expense/entertain"
    ],
    "columnFields": [
      {
        "field": "address",
        "title": "用餐地点"
      },
      {
        "field": "pcs",
        "title": "用餐人数"
      },
      {
        "field": "guests",
        "title": "招待对象"
      },
      {
        "field": "content_name",
        "title": "费用科目"
      },
      {
        "field": "amount",
        "title": "金额"
      },
      {
        "field": "quotas",
        "title": "预算标准"
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ],
    "fields": [
      {
        "field": "address",
        "title": "用餐地点"
      },
      {
        "field": "pcs",
        "title": "用餐人数"
      },
      {
        "field": "guests",
        "title": "招待对象"
      },
      {
        "field": "content_name",
        "title": "费用科目"
      },
      {
        "field": "amount",
        "title": "金额"
      },
      {
        "field": "quotas",
        "title": "预算标准"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "content_id",
        "title": "费用科目"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "require",
        "title": ""
      },
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "expense/payment": {
    "formats": [
      "atlas/expense/payment"
    ],
    "columnFields": [
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "expense_name",
        "title": "费用分类"
      },
      {
        "field": "invoice",
        "title": "发票"
      },
      {
        "field": "amount",
        "title": "金额"
      }
    ],
    "fields": [
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "expense_name",
        "title": "费用分类"
      },
      {
        "field": "invoice",
        "title": "发票"
      },
      {
        "field": "amount",
        "title": "金额"
      },
      {
        "field": "content_id",
        "title": "费用分类"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "user_id",
        "title": "用户ID"
      },
      {
        "field": "user_name",
        "title": "操作人"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "contract_id",
        "title": ""
      },
      {
        "field": "apply_id",
        "title": ""
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "payee_type",
        "title": ""
      },
      {
        "field": "payee_id",
        "title": ""
      },
      {
        "field": "payee_name",
        "title": ""
      },
      {
        "field": "payee_bank",
        "title": ""
      },
      {
        "field": "payee_open",
        "title": ""
      },
      {
        "field": "payee_link",
        "title": ""
      },
      {
        "field": "status",
        "title": ""
      },
      {
        "field": "printed",
        "title": ""
      }
    ]
  },
  "expense/purchase": {
    "formats": [
      "atlas/expense/purchase"
    ],
    "columnFields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "pcs",
        "title": "申领数量"
      },
      {
        "field": "unit",
        "title": "计量单位"
      },
      {
        "field": "model",
        "title": "规格型号"
      },
      {
        "field": "predict",
        "title": "需求日期"
      },
      {
        "field": "supplier",
        "title": "供应商"
      },
      {
        "field": "price",
        "title": "单价"
      },
      {
        "field": "content_name",
        "title": "费用科目"
      },
      {
        "field": "quotas",
        "title": "预算标准"
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ],
    "fields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "pcs",
        "title": "申领数量"
      },
      {
        "field": "unit",
        "title": "计量单位"
      },
      {
        "field": "model",
        "title": "规格型号"
      },
      {
        "field": "predict",
        "title": "需求日期"
      },
      {
        "field": "supplier",
        "title": "供应商"
      },
      {
        "field": "price",
        "title": "单价"
      },
      {
        "field": "content_name",
        "title": "费用科目"
      },
      {
        "field": "quotas",
        "title": "预算标准"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "content_id",
        "title": "费用科目"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "require",
        "title": ""
      },
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "expense/query": {
    "formats": [
      "atlas/expense/query"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "status",
        "title": ""
      },
      {
        "field": "printed",
        "title": ""
      }
    ]
  },
  "expense/reimburse": {
    "formats": [
      "atlas/expense/reimburse"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "user_id",
        "title": "用户ID"
      },
      {
        "field": "status",
        "title": ""
      },
      {
        "field": "printed",
        "title": ""
      }
    ]
  },
  "expense/tax": {
    "formats": [
      "atlas/expense/payment"
    ],
    "columnFields": [
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "expense_name",
        "title": "费用分类"
      },
      {
        "field": "amount",
        "title": "金额"
      }
    ],
    "fields": [
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "expense_name",
        "title": "费用分类"
      },
      {
        "field": "amount",
        "title": "金额"
      },
      {
        "field": "content_id",
        "title": "费用分类"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "user_id",
        "title": "用户ID"
      },
      {
        "field": "user_name",
        "title": "操作人"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "contract_id",
        "title": ""
      },
      {
        "field": "apply_id",
        "title": ""
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "payee_id",
        "title": ""
      },
      {
        "field": "payee_name",
        "title": ""
      },
      {
        "field": "payee_bank",
        "title": ""
      },
      {
        "field": "payee_open",
        "title": ""
      },
      {
        "field": "payee_link",
        "title": ""
      },
      {
        "field": "status",
        "title": ""
      },
      {
        "field": "printed",
        "title": ""
      }
    ]
  },
  "expense/travel": {
    "formats": [
      "atlas/expense/travel"
    ],
    "columnFields": [
      {
        "field": "start",
        "title": "出发日期"
      },
      {
        "field": "expire",
        "title": "结束日期"
      },
      {
        "field": "types",
        "title": "出行方式"
      },
      {
        "field": "depart",
        "title": "出发地"
      },
      {
        "field": "bourn",
        "title": "目的地"
      },
      {
        "field": "content_name",
        "title": "费用科目"
      },
      {
        "field": "quotas",
        "title": "预算标准"
      },
      {
        "field": "amount",
        "title": "金额"
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ],
    "fields": [
      {
        "field": "start",
        "title": "出发日期"
      },
      {
        "field": "expire",
        "title": "结束日期"
      },
      {
        "field": "types",
        "title": "出行方式"
      },
      {
        "field": "depart",
        "title": "出发地"
      },
      {
        "field": "bourn",
        "title": "目的地"
      },
      {
        "field": "content_name",
        "title": "费用科目"
      },
      {
        "field": "quotas",
        "title": "预算标准"
      },
      {
        "field": "amount",
        "title": "金额"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "content_id",
        "title": "费用科目"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "require",
        "title": ""
      },
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "finance/analysis/dashboard": {
    "formats": [],
    "columnFields": [],
    "fields": []
  },
  "finance/analysis/indicator": {
    "formats": [
      "atlas/finance/analysis/indicator"
    ],
    "columnFields": [
      {
        "field": "indicator",
        "title": "指标"
      },
      {
        "field": "current_value",
        "title": "本期"
      },
      {
        "field": "previous_value",
        "title": "上期"
      },
      {
        "field": "industry_value",
        "title": "行业均值"
      },
      {
        "field": "rating",
        "title": "评价"
      }
    ],
    "fields": [
      {
        "field": "indicator",
        "title": "指标"
      },
      {
        "field": "current_value",
        "title": "本期"
      },
      {
        "field": "previous_value",
        "title": "上期"
      },
      {
        "field": "industry_value",
        "title": "行业均值"
      },
      {
        "field": "rating",
        "title": "评价"
      }
    ]
  },
  "finance/arap/payable": {
    "formats": [
      "atlas/finance/arap/payable"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "supplier",
        "title": "供应商"
      },
      {
        "field": "total_amount",
        "title": "应付总额"
      },
      {
        "field": "due_month_amount",
        "title": "本月到期"
      },
      {
        "field": "overdue_amount",
        "title": "逾期未付"
      },
      {
        "field": "credit_days",
        "title": "信用账期(天)"
      },
      {
        "field": "credit_level",
        "title": "信用等级"
      }
    ]
  },
  "finance/arap/receivable": {
    "formats": [
      "atlas/finance/arap/receivable"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "customer",
        "title": "客户"
      },
      {
        "field": "total_amount",
        "title": "应收总额"
      },
      {
        "field": "not_due_amount",
        "title": "未到期"
      },
      {
        "field": "overdue_m1_amount",
        "title": "逾期 30 天内"
      },
      {
        "field": "overdue_m2_amount",
        "title": "逾期 31-60 天"
      },
      {
        "field": "overdue_m3_amount",
        "title": "逾期 61-90 天"
      },
      {
        "field": "overdue_over_amount",
        "title": "逾期 90 天以上"
      },
      {
        "field": "bad_debt_amount",
        "title": "坏账准备"
      },
      {
        "field": "overdue_days",
        "title": "最长逾期(天)"
      }
    ]
  },
  "finance/budget/execution": {
    "formats": [
      "atlas/finance/budget/execution"
    ],
    "columnFields": [
      {
        "field": "dept",
        "title": "部门"
      },
      {
        "field": "year",
        "title": "年度"
      },
      {
        "field": "budget_amount",
        "title": "年度预算"
      },
      {
        "field": "used_amount",
        "title": "已使用"
      },
      {
        "field": "remain_amount",
        "title": "剩余"
      },
      {
        "field": "execution_rate",
        "title": "执行率(%)"
      },
      {
        "field": "warning",
        "title": "预警"
      }
    ],
    "fields": [
      {
        "field": "dept",
        "title": "部门"
      },
      {
        "field": "year",
        "title": "年度"
      },
      {
        "field": "budget_amount",
        "title": "年度预算"
      },
      {
        "field": "used_amount",
        "title": "已使用"
      },
      {
        "field": "remain_amount",
        "title": "剩余"
      },
      {
        "field": "execution_rate",
        "title": "执行率(%)"
      },
      {
        "field": "warning",
        "title": "预警"
      }
    ]
  },
  "finance/budget/project-cost": {
    "formats": [
      "atlas/finance/budget/project-cost"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "project",
        "title": "项目"
      },
      {
        "field": "contract_amount",
        "title": "合同金额"
      },
      {
        "field": "labor_cost",
        "title": "人工成本"
      },
      {
        "field": "purchase_cost",
        "title": "采购成本"
      },
      {
        "field": "other_total_amount",
        "title": "其他成本"
      },
      {
        "field": "profit_amount",
        "title": "毛利"
      },
      {
        "field": "gross_rate",
        "title": "毛利率(%)"
      }
    ]
  },
  "finance/treasury/account": {
    "formats": [
      "atlas/finance/treasury/account"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "account_name",
        "title": "账户名称"
      },
      {
        "field": "bank_name",
        "title": "开户行"
      },
      {
        "field": "account_no",
        "title": "账号"
      },
      {
        "field": "currency",
        "title": "币种"
      },
      {
        "field": "account_type",
        "title": "账户类型"
      },
      {
        "field": "balance",
        "title": "账户余额"
      },
      {
        "field": "inflow_amount",
        "title": "本月流入"
      },
      {
        "field": "outflow_amount",
        "title": "本月流出"
      },
      {
        "field": "account_state_label",
        "title": "状态"
      }
    ]
  },
  "finance/treasury/overview": {
    "formats": [],
    "columnFields": [],
    "fields": []
  },
  "finance/treasury/plan": {
    "formats": [
      "atlas/finance/treasury/plan"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "year",
        "title": "年度"
      },
      {
        "field": "month",
        "title": "月份"
      },
      {
        "field": "plan_in_amount",
        "title": "计划流入"
      },
      {
        "field": "plan_out_amount",
        "title": "计划流出"
      },
      {
        "field": "actual_in_amount",
        "title": "实际流入"
      },
      {
        "field": "actual_out_amount",
        "title": "实际流出"
      },
      {
        "field": "diff_amount",
        "title": "净额差异"
      },
      {
        "field": "execution_rate",
        "title": "执行率(%)"
      }
    ]
  },
  "hr/attendance-apply/field": {
    "formats": [
      "atlas/hr/attendance-apply/field"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "team_in",
        "title": ""
      },
      {
        "field": "team_in_name",
        "title": ""
      },
      {
        "field": "user_id",
        "title": "用户ID"
      },
      {
        "field": "user_name",
        "title": "操作人"
      },
      {
        "field": "check_id",
        "title": ""
      },
      {
        "field": "check_name",
        "title": ""
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "hr/attendance-apply/leave": {
    "formats": [
      "atlas/hr/attendance-apply/leave"
    ],
    "columnFields": [
      {
        "field": "day",
        "title": "请假日期"
      },
      {
        "field": "leave_time_fmt",
        "title": "请假时长"
      }
    ],
    "fields": [
      {
        "field": "day",
        "title": "请假日期"
      },
      {
        "field": "leave_time_fmt",
        "title": "请假时长"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "user_id",
        "title": "用户ID"
      },
      {
        "field": "user_name",
        "title": "操作人"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "start",
        "title": "开始日期"
      },
      {
        "field": "expire",
        "title": "结束日期"
      },
      {
        "field": "days",
        "title": ""
      },
      {
        "field": "times",
        "title": "约定加班时长"
      },
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "leave",
        "title": ""
      },
      {
        "field": "address",
        "title": "用餐地点"
      },
      {
        "field": "contacts",
        "title": ""
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "status",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      }
    ]
  },
  "hr/attendance-apply/makeup": {
    "formats": [
      "atlas/hr/attendance-apply/makeup"
    ],
    "columnFields": [
      {
        "field": "day",
        "title": "补卡日期"
      },
      {
        "field": "checkin_time",
        "title": "补卡时间"
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ],
    "fields": [
      {
        "field": "day",
        "title": "补卡日期"
      },
      {
        "field": "checkin_time",
        "title": "补卡时间"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "predict",
        "title": "需求日期"
      },
      {
        "field": "status",
        "title": ""
      },
      {
        "field": "progress",
        "title": "进程地址"
      }
    ]
  },
  "hr/attendance-apply/overtime": {
    "formats": [
      "atlas/hr/attendance-apply/overtime"
    ],
    "columnFields": [
      {
        "field": "day",
        "title": "加班日期"
      },
      {
        "field": "over_time",
        "title": "加班时长（小时）"
      }
    ],
    "fields": [
      {
        "field": "day",
        "title": "加班日期"
      },
      {
        "field": "over_time",
        "title": "加班时长（小时）"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "user_id",
        "title": "用户ID"
      },
      {
        "field": "user_name",
        "title": "操作人"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "start",
        "title": "开始日期"
      },
      {
        "field": "expire",
        "title": "结束日期"
      },
      {
        "field": "times",
        "title": "约定加班时长"
      },
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "outer_id",
        "title": "维保单位"
      },
      {
        "field": "outer_name",
        "title": "维保单位"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "status",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      }
    ]
  },
  "hr/attendance-apply/shift": {
    "formats": [
      "atlas/hr/attendance-apply/shift"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "status",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "user_name",
        "title": "操作人"
      },
      {
        "field": "swap_id",
        "title": ""
      },
      {
        "field": "swap_name",
        "title": ""
      },
      {
        "field": "no",
        "title": ""
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "checkin_date",
        "title": ""
      },
      {
        "field": "checkin_back",
        "title": ""
      },
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "team_id",
        "title": ""
      }
    ]
  },
  "hr/attendance/daily": {
    "formats": [
      "atlas/hr/attendance/daily"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      }
    ]
  },
  "hr/attendance/daily-summary": {
    "formats": [
      "atlas/hr/attendance/daily-summary"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      }
    ]
  },
  "hr/attendance/holiday": {
    "formats": [],
    "columnFields": [],
    "fields": []
  },
  "hr/attendance/leave-rule": {
    "formats": [
      "atlas/hr/attendance/leave-rule"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "mobile",
        "title": "手机号"
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "card",
        "title": "身份证号"
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "position",
        "title": "岗位"
      },
      {
        "field": "add_date",
        "title": ""
      },
      {
        "field": "vacation",
        "title": ""
      },
      {
        "field": "leave_max",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      }
    ]
  },
  "hr/attendance/monthly": {
    "formats": [
      "atlas/hr/attendance/monthly"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      }
    ]
  },
  "hr/attendance/punch": {
    "formats": [
      "atlas/hr/attendance/punch"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      }
    ]
  },
  "hr/attendance/rule": {
    "formats": [
      "atlas/hr/attendance/rule"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "group_name",
        "title": ""
      },
      {
        "field": "checkin_date",
        "title": ""
      },
      {
        "field": "checkin_spe_workdays",
        "title": ""
      },
      {
        "field": "checkin_spe_offdays",
        "title": ""
      },
      {
        "field": "checkin_location",
        "title": ""
      },
      {
        "field": "checkin_wifimac",
        "title": ""
      },
      {
        "field": "checkin_method_type",
        "title": ""
      },
      {
        "field": "offwork_interval_time",
        "title": ""
      },
      {
        "field": "use_face_detect",
        "title": ""
      },
      {
        "field": "option_out_range",
        "title": ""
      },
      {
        "field": "remind_work",
        "title": ""
      },
      {
        "field": "remind_off_work",
        "title": ""
      },
      {
        "field": "reissue",
        "title": ""
      },
      {
        "field": "sync_holidays",
        "title": ""
      },
      {
        "field": "period_date",
        "title": ""
      },
      {
        "field": "workdays",
        "title": ""
      },
      {
        "field": "standard_work_duration",
        "title": ""
      },
      {
        "field": "span_day_time",
        "title": ""
      },
      {
        "field": "cuser",
        "title": ""
      },
      {
        "field": "allow_select_schedule",
        "title": ""
      }
    ]
  },
  "hr/deduction/housing": {
    "formats": [
      "atlas/hr/deduction/housing"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "month",
        "title": "月份"
      }
    ]
  },
  "hr/deduction/social": {
    "formats": [
      "atlas/hr/deduction/social"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "month",
        "title": "月份"
      }
    ]
  },
  "hr/exit/absent": {
    "formats": [
      "atlas/hr/exit/absent"
    ],
    "columnFields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "ranks",
        "title": "职务"
      },
      {
        "field": "position",
        "title": "岗位"
      },
      {
        "field": "branch_name",
        "title": "派驻分队"
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ],
    "fields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "ranks",
        "title": "职务"
      },
      {
        "field": "position",
        "title": "岗位"
      },
      {
        "field": "branch_name",
        "title": "派驻分队"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "predict",
        "title": "需求日期"
      },
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "hr/exit/dismiss": {
    "formats": [
      "atlas/hr/exit/dismiss"
    ],
    "columnFields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "ranks",
        "title": "职务"
      },
      {
        "field": "position",
        "title": "岗位"
      },
      {
        "field": "branch_name",
        "title": "派驻分队"
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ],
    "fields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "ranks",
        "title": "职务"
      },
      {
        "field": "position",
        "title": "岗位"
      },
      {
        "field": "branch_name",
        "title": "派驻分队"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "predict",
        "title": "需求日期"
      },
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "hr/exit/resign": {
    "formats": [
      "atlas/hr/exit/resign"
    ],
    "columnFields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "ranks",
        "title": "职务"
      },
      {
        "field": "position",
        "title": "岗位"
      },
      {
        "field": "branch_name",
        "title": "派驻分队"
      },
      {
        "field": "reason",
        "title": "原因"
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ],
    "fields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "ranks",
        "title": "职务"
      },
      {
        "field": "position",
        "title": "岗位"
      },
      {
        "field": "branch_name",
        "title": "派驻分队"
      },
      {
        "field": "reason",
        "title": "原因"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "predict",
        "title": "需求日期"
      },
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "hr/insurance/commercial": {
    "formats": [
      "atlas/hr/insurance/commercial",
      "atlas/hr/insurance/commercial/list"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "outer_id",
        "title": "维保单位"
      },
      {
        "field": "outer_name",
        "title": "维保单位"
      },
      {
        "field": "no",
        "title": ""
      },
      {
        "field": "pcs",
        "title": "申领数量"
      },
      {
        "field": "amount",
        "title": "金额"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "start",
        "title": "开始日期"
      },
      {
        "field": "expire",
        "title": "结束日期"
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "mobile",
        "title": "手机号"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "types",
        "title": "奖惩类型"
      }
    ]
  },
  "hr/insurance/housing": {
    "formats": [
      "atlas/hr/insurance/housing"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "mobile",
        "title": "手机号"
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "card",
        "title": "身份证号"
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "position",
        "title": "岗位"
      },
      {
        "field": "add_date",
        "title": ""
      },
      {
        "field": "house_buy",
        "title": ""
      },
      {
        "field": "house_date",
        "title": ""
      },
      {
        "field": "house_code",
        "title": ""
      },
      {
        "field": "house_base",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      }
    ]
  },
  "hr/insurance/social": {
    "formats": [
      "atlas/hr/insurance/social"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "mobile",
        "title": "手机号"
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "card",
        "title": "身份证号"
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "position",
        "title": "岗位"
      },
      {
        "field": "add_date",
        "title": ""
      },
      {
        "field": "census",
        "title": ""
      },
      {
        "field": "social_type",
        "title": ""
      },
      {
        "field": "social_date",
        "title": ""
      },
      {
        "field": "social_code",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "hr/movement/adjust": {
    "formats": [
      "atlas/hr/movement/adjust"
    ],
    "columnFields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "user_pre_rank",
        "title": "原职务"
      },
      {
        "field": "user_pre_position",
        "title": "原岗位"
      },
      {
        "field": "user_pre_scale",
        "title": "原工资级别"
      },
      {
        "field": "branch_name",
        "title": "派驻分队"
      },
      {
        "field": "ranks",
        "title": "职务"
      },
      {
        "field": "position",
        "title": "岗位"
      },
      {
        "field": "scale",
        "title": "工资级别"
      },
      {
        "field": "salary",
        "title": "工资金额"
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ],
    "fields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "user_pre_rank",
        "title": "原职务"
      },
      {
        "field": "user_pre_position",
        "title": "原岗位"
      },
      {
        "field": "user_pre_scale",
        "title": "原工资级别"
      },
      {
        "field": "branch_name",
        "title": "派驻分队"
      },
      {
        "field": "ranks",
        "title": "职务"
      },
      {
        "field": "position",
        "title": "岗位"
      },
      {
        "field": "scale",
        "title": "工资级别"
      },
      {
        "field": "salary",
        "title": "工资金额"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "branch_id",
        "title": "派驻分队"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "predict",
        "title": "需求日期"
      },
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "hr/movement/onboard": {
    "formats": [
      "atlas/hr/movement/onboard"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "card",
        "title": "身份证号"
      },
      {
        "field": "branch_id",
        "title": "派驻分队"
      },
      {
        "field": "ranks",
        "title": "职务"
      },
      {
        "field": "position",
        "title": "岗位"
      },
      {
        "field": "scale",
        "title": "工资级别"
      },
      {
        "field": "salary",
        "title": "工资金额"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "branch_name",
        "title": "派驻分队"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "predict",
        "title": "需求日期"
      },
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "hr/movement/promotion": {
    "formats": [
      "atlas/hr/movement/promotion"
    ],
    "columnFields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "user_pre_rank",
        "title": "原职务"
      },
      {
        "field": "user_pre_position",
        "title": "原岗位"
      },
      {
        "field": "user_pre_scale",
        "title": "原工资级别"
      },
      {
        "field": "ranks",
        "title": "职务"
      },
      {
        "field": "position",
        "title": "岗位"
      },
      {
        "field": "scale",
        "title": "工资级别"
      },
      {
        "field": "salary",
        "title": "工资金额"
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ],
    "fields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "user_pre_rank",
        "title": "原职务"
      },
      {
        "field": "user_pre_position",
        "title": "原岗位"
      },
      {
        "field": "user_pre_scale",
        "title": "原工资级别"
      },
      {
        "field": "ranks",
        "title": "职务"
      },
      {
        "field": "position",
        "title": "岗位"
      },
      {
        "field": "scale",
        "title": "工资级别"
      },
      {
        "field": "salary",
        "title": "工资金额"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "predict",
        "title": "需求日期"
      },
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "hr/movement/transfer": {
    "formats": [
      "atlas/hr/movement/transfer"
    ],
    "columnFields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "user_pre_rank",
        "title": "原职务"
      },
      {
        "field": "user_pre_position",
        "title": "原岗位"
      },
      {
        "field": "user_pre_scale",
        "title": "原工资级别"
      },
      {
        "field": "branch_name",
        "title": "派驻分队"
      },
      {
        "field": "ranks",
        "title": "职务"
      },
      {
        "field": "position",
        "title": "岗位"
      },
      {
        "field": "scale",
        "title": "工资级别"
      },
      {
        "field": "salary",
        "title": "工资金额"
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ],
    "fields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "user_pre_rank",
        "title": "原职务"
      },
      {
        "field": "user_pre_position",
        "title": "原岗位"
      },
      {
        "field": "user_pre_scale",
        "title": "原工资级别"
      },
      {
        "field": "branch_name",
        "title": "派驻分队"
      },
      {
        "field": "ranks",
        "title": "职务"
      },
      {
        "field": "position",
        "title": "岗位"
      },
      {
        "field": "scale",
        "title": "工资级别"
      },
      {
        "field": "salary",
        "title": "工资金额"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "branch_id",
        "title": "派驻分队"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "team_in",
        "title": ""
      },
      {
        "field": "team_in_name",
        "title": ""
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "predict",
        "title": "需求日期"
      },
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "hr/payroll/generate": {
    "formats": [
      "atlas/hr/payroll/generate"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "user_id",
        "title": "用户ID"
      },
      {
        "field": "user_name",
        "title": "操作人"
      },
      {
        "field": "start",
        "title": "开始日期"
      },
      {
        "field": "expire",
        "title": "结束日期"
      },
      {
        "field": "group_id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "status",
        "title": ""
      },
      {
        "field": "states",
        "title": ""
      },
      {
        "field": "month",
        "title": "月份"
      }
    ]
  },
  "hr/payroll/group": {
    "formats": [
      "atlas/hr/payroll/group",
      "atlas/hr/payroll/group/item",
      "atlas/masterdata/payroll-item"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "conditions",
        "title": "条件内容"
      },
      {
        "field": "content",
        "title": "公式内容"
      },
      {
        "field": "describe",
        "title": "公式说明"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "month",
        "title": "月份"
      },
      {
        "field": "group_id",
        "title": ""
      }
    ]
  },
  "hr/payroll/payment": {
    "formats": [
      "atlas/hr/payroll/generate"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "user_id",
        "title": "用户ID"
      },
      {
        "field": "user_name",
        "title": "操作人"
      },
      {
        "field": "start",
        "title": "开始日期"
      },
      {
        "field": "expire",
        "title": "结束日期"
      },
      {
        "field": "group_id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "status",
        "title": ""
      },
      {
        "field": "states",
        "title": ""
      },
      {
        "field": "month",
        "title": "月份"
      }
    ]
  },
  "hr/relation/contract": {
    "formats": [
      "atlas/hr/relation/contract"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "current",
        "title": ""
      },
      {
        "field": "user_id",
        "title": "用户ID"
      },
      {
        "field": "user_name",
        "title": "操作人"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "pcs",
        "title": "申领数量"
      },
      {
        "field": "year",
        "title": "年度"
      },
      {
        "field": "start",
        "title": "开始日期"
      },
      {
        "field": "expire",
        "title": "结束日期"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "files_ldht",
        "title": ""
      },
      {
        "field": "files_bcxy",
        "title": ""
      },
      {
        "field": "files_zrz",
        "title": ""
      },
      {
        "field": "files_bmxy",
        "title": ""
      },
      {
        "field": "files_ygsc",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "hr/relation/level": {
    "formats": [
      "atlas/hr/relation/level"
    ],
    "columnFields": [
      {
        "field": "name",
        "title": "级别名称"
      },
      {
        "field": "salary",
        "title": "合同约定工资"
      },
      {
        "field": "bases",
        "title": "基本工资"
      },
      {
        "field": "grade",
        "title": "综合补贴"
      },
      {
        "field": "posts",
        "title": "岗位补贴"
      },
      {
        "field": "dine_fix",
        "title": "每月伙食补助"
      },
      {
        "field": "dine_day",
        "title": "每日伙食补助"
      },
      {
        "field": "heats",
        "title": "高温补贴"
      },
      {
        "field": "rise_fix",
        "title": "固定绩效工资"
      },
      {
        "field": "rise_var",
        "title": "浮动绩效工资"
      },
      {
        "field": "hour_on",
        "title": "工作日时薪"
      },
      {
        "field": "hour_off",
        "title": "休息日时薪"
      },
      {
        "field": "hour_ext",
        "title": "节假日时薪"
      },
      {
        "field": "hour_add",
        "title": "年假加班时薪"
      },
      {
        "field": "hour_fix",
        "title": "约定时薪"
      },
      {
        "field": "times",
        "title": "约定加班时长"
      },
      {
        "field": "extra",
        "title": "约定加班工资"
      },
      {
        "field": "skill",
        "title": "分队长管理员"
      },
      {
        "field": "other",
        "title": "其他补贴"
      },
      {
        "field": "insure",
        "title": "扣残障金"
      },
      {
        "field": "social",
        "title": "扣社保"
      },
      {
        "field": "house",
        "title": "扣公积金"
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ],
    "fields": [
      {
        "field": "name",
        "title": "级别名称"
      },
      {
        "field": "salary",
        "title": "合同约定工资"
      },
      {
        "field": "bases",
        "title": "基本工资"
      },
      {
        "field": "grade",
        "title": "综合补贴"
      },
      {
        "field": "posts",
        "title": "岗位补贴"
      },
      {
        "field": "dine_fix",
        "title": "每月伙食补助"
      },
      {
        "field": "dine_day",
        "title": "每日伙食补助"
      },
      {
        "field": "heats",
        "title": "高温补贴"
      },
      {
        "field": "rise_fix",
        "title": "固定绩效工资"
      },
      {
        "field": "rise_var",
        "title": "浮动绩效工资"
      },
      {
        "field": "hour_on",
        "title": "工作日时薪"
      },
      {
        "field": "hour_off",
        "title": "休息日时薪"
      },
      {
        "field": "hour_ext",
        "title": "节假日时薪"
      },
      {
        "field": "hour_add",
        "title": "年假加班时薪"
      },
      {
        "field": "hour_fix",
        "title": "约定时薪"
      },
      {
        "field": "times",
        "title": "约定加班时长"
      },
      {
        "field": "extra",
        "title": "约定加班工资"
      },
      {
        "field": "skill",
        "title": "分队长管理员"
      },
      {
        "field": "other",
        "title": "其他补贴"
      },
      {
        "field": "insure",
        "title": "扣残障金"
      },
      {
        "field": "social",
        "title": "扣社保"
      },
      {
        "field": "house",
        "title": "扣公积金"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "predict",
        "title": "需求日期"
      },
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "hr/relation/reward": {
    "formats": [
      "atlas/hr/relation/reward"
    ],
    "columnFields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "amount",
        "title": "金额"
      },
      {
        "field": "content",
        "title": "奖惩内容"
      }
    ],
    "fields": [
      {
        "field": "name",
        "title": "姓名"
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "amount",
        "title": "金额"
      },
      {
        "field": "content",
        "title": "奖惩内容"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "predict",
        "title": "需求日期"
      },
      {
        "field": "digest",
        "title": "摘要"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "hr/relation/training": {
    "formats": [
      "atlas/hr/relation/training"
    ],
    "columnFields": [
      {
        "field": "user_name",
        "title": "人员信息"
      },
      {
        "field": "start",
        "title": "开始日期"
      },
      {
        "field": "expire",
        "title": "结束日期"
      },
      {
        "field": "content",
        "title": "培训内容"
      },
      {
        "field": "branch",
        "title": "培训机构"
      },
      {
        "field": "outcome",
        "title": "培训成果"
      },
      {
        "field": "contact",
        "title": "证明人"
      },
      {
        "field": "mobile",
        "title": "手机号"
      }
    ],
    "fields": [
      {
        "field": "user_name",
        "title": "人员信息"
      },
      {
        "field": "start",
        "title": "开始日期"
      },
      {
        "field": "expire",
        "title": "结束日期"
      },
      {
        "field": "content",
        "title": "培训内容"
      },
      {
        "field": "branch",
        "title": "培训机构"
      },
      {
        "field": "outcome",
        "title": "培训成果"
      },
      {
        "field": "contact",
        "title": "证明人"
      },
      {
        "field": "mobile",
        "title": "手机号"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "hr/report/structure": {
    "formats": [
      "atlas/hr/report/structure"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      }
    ]
  },
  "hr/report/summary": {
    "formats": [
      "atlas/hr/report/summary"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      }
    ]
  },
  "hr/resume": {
    "formats": [
      "atlas/hr/resume"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "status",
        "title": ""
      },
      {
        "field": "states",
        "title": ""
      },
      {
        "field": "card",
        "title": "身份证号"
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "birthday",
        "title": ""
      },
      {
        "field": "age",
        "title": ""
      },
      {
        "field": "gender",
        "title": ""
      },
      {
        "field": "mobile",
        "title": "手机号"
      },
      {
        "field": "reason",
        "title": "原因"
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "branch_id",
        "title": "派驻分队"
      },
      {
        "field": "branch_name",
        "title": "派驻分队"
      },
      {
        "field": "card_issue",
        "title": ""
      },
      {
        "field": "card_valid",
        "title": ""
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "nation",
        "title": ""
      },
      {
        "field": "politics",
        "title": ""
      },
      {
        "field": "military",
        "title": ""
      },
      {
        "field": "marital",
        "title": ""
      },
      {
        "field": "children",
        "title": ""
      },
      {
        "field": "health",
        "title": ""
      },
      {
        "field": "stature",
        "title": ""
      },
      {
        "field": "extent",
        "title": ""
      },
      {
        "field": "school",
        "title": ""
      },
      {
        "field": "subject",
        "title": ""
      },
      {
        "field": "feature",
        "title": ""
      },
      {
        "field": "cases",
        "title": ""
      },
      {
        "field": "ranks",
        "title": "职务"
      },
      {
        "field": "scale",
        "title": "工资级别"
      },
      {
        "field": "position",
        "title": "岗位"
      },
      {
        "field": "license",
        "title": ""
      },
      {
        "field": "bank_code",
        "title": ""
      },
      {
        "field": "bank_open",
        "title": ""
      },
      {
        "field": "native",
        "title": ""
      },
      {
        "field": "polices",
        "title": ""
      },
      {
        "field": "location",
        "title": ""
      },
      {
        "field": "address",
        "title": "用餐地点"
      },
      {
        "field": "crime",
        "title": ""
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "user_pic",
        "title": ""
      },
      {
        "field": "files_gwxqb",
        "title": ""
      },
      {
        "field": "files_msdjb",
        "title": ""
      },
      {
        "field": "files_zpdjb",
        "title": ""
      },
      {
        "field": "files_sfz",
        "title": ""
      },
      {
        "field": "files_hkb",
        "title": ""
      },
      {
        "field": "files_xlzs",
        "title": ""
      },
      {
        "field": "files_zyzbz",
        "title": ""
      },
      {
        "field": "files_wfzzm",
        "title": ""
      },
      {
        "field": "files_jkbg",
        "title": ""
      },
      {
        "field": "files_yhk",
        "title": ""
      },
      {
        "field": "files_ldht",
        "title": ""
      },
      {
        "field": "files_bcxy",
        "title": ""
      },
      {
        "field": "files_zrz",
        "title": ""
      },
      {
        "field": "files_bmxy",
        "title": ""
      },
      {
        "field": "files_ygsc",
        "title": ""
      },
      {
        "field": "files_ygczx",
        "title": ""
      },
      {
        "field": "files_lzspb",
        "title": ""
      },
      {
        "field": "careers",
        "title": ""
      },
      {
        "field": "familys",
        "title": ""
      },
      {
        "field": "relates",
        "title": ""
      },
      {
        "field": "ability",
        "title": ""
      },
      {
        "field": "achieve",
        "title": ""
      },
      {
        "field": "blacked",
        "title": ""
      }
    ]
  },
  "hr/roster": {
    "formats": [
      "atlas/hr/roster"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "stoped",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "branch_id",
        "title": "派驻分队"
      },
      {
        "field": "branch_name",
        "title": "派驻分队"
      },
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "mobile",
        "title": "手机号"
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "card",
        "title": "身份证号"
      },
      {
        "field": "card_issue",
        "title": ""
      },
      {
        "field": "card_valid",
        "title": ""
      },
      {
        "field": "birthday",
        "title": ""
      },
      {
        "field": "gender",
        "title": ""
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "nation",
        "title": ""
      },
      {
        "field": "politics",
        "title": ""
      },
      {
        "field": "military",
        "title": ""
      },
      {
        "field": "marital",
        "title": ""
      },
      {
        "field": "children",
        "title": ""
      },
      {
        "field": "health",
        "title": ""
      },
      {
        "field": "stature",
        "title": ""
      },
      {
        "field": "extent",
        "title": ""
      },
      {
        "field": "school",
        "title": ""
      },
      {
        "field": "subject",
        "title": ""
      },
      {
        "field": "feature",
        "title": ""
      },
      {
        "field": "cases",
        "title": ""
      },
      {
        "field": "status",
        "title": ""
      },
      {
        "field": "ranks",
        "title": "职务"
      },
      {
        "field": "scale",
        "title": "工资级别"
      },
      {
        "field": "position",
        "title": "岗位"
      },
      {
        "field": "license",
        "title": ""
      },
      {
        "field": "social",
        "title": "扣社保"
      },
      {
        "field": "house",
        "title": "扣公积金"
      },
      {
        "field": "archive",
        "title": ""
      },
      {
        "field": "add_date",
        "title": ""
      },
      {
        "field": "act_date",
        "title": ""
      },
      {
        "field": "end_date",
        "title": ""
      },
      {
        "field": "salary_bank",
        "title": ""
      },
      {
        "field": "salary_open",
        "title": ""
      },
      {
        "field": "bank_code",
        "title": ""
      },
      {
        "field": "bank_open",
        "title": ""
      },
      {
        "field": "native",
        "title": ""
      },
      {
        "field": "polices",
        "title": ""
      },
      {
        "field": "location",
        "title": ""
      },
      {
        "field": "address",
        "title": "用餐地点"
      },
      {
        "field": "career",
        "title": ""
      },
      {
        "field": "family",
        "title": ""
      },
      {
        "field": "relate",
        "title": ""
      },
      {
        "field": "contract",
        "title": ""
      },
      {
        "field": "educate",
        "title": ""
      },
      {
        "field": "promote",
        "title": ""
      },
      {
        "field": "because",
        "title": ""
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "user_pic",
        "title": ""
      },
      {
        "field": "files_gwxqb",
        "title": ""
      },
      {
        "field": "files_msdjb",
        "title": ""
      },
      {
        "field": "files_zpdjb",
        "title": ""
      },
      {
        "field": "files_sfz",
        "title": ""
      },
      {
        "field": "files_hkb",
        "title": ""
      },
      {
        "field": "files_xlzs",
        "title": ""
      },
      {
        "field": "files_zyzbz",
        "title": ""
      },
      {
        "field": "files_wfzzm",
        "title": ""
      },
      {
        "field": "files_jkbg",
        "title": ""
      },
      {
        "field": "files_yhk",
        "title": ""
      },
      {
        "field": "files_ldht",
        "title": ""
      },
      {
        "field": "files_bcxy",
        "title": ""
      },
      {
        "field": "files_zrz",
        "title": ""
      },
      {
        "field": "files_bmxy",
        "title": ""
      },
      {
        "field": "files_ygsc",
        "title": ""
      },
      {
        "field": "files_ygczx",
        "title": ""
      },
      {
        "field": "files_lzspb",
        "title": ""
      },
      {
        "field": "careers",
        "title": ""
      },
      {
        "field": "familys",
        "title": ""
      },
      {
        "field": "relates",
        "title": ""
      },
      {
        "field": "ability",
        "title": ""
      },
      {
        "field": "achieve",
        "title": ""
      },
      {
        "field": "blacked",
        "title": ""
      }
    ]
  },
  "hr/team": {
    "formats": [
      "atlas/hr/team"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "stoped",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "address",
        "title": "用餐地点"
      }
    ]
  },
  "login": {
    "formats": [],
    "columnFields": [],
    "fields": []
  },
  "login/composables": {
    "formats": [],
    "columnFields": [],
    "fields": []
  },
  "masterdata/asset-category": {
    "formats": [
      "atlas/masterdata/asset-category"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "stoped",
        "title": ""
      },
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "fore",
        "title": ""
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "unit",
        "title": "计量单位"
      },
      {
        "field": "life",
        "title": ""
      },
      {
        "field": "methods",
        "title": ""
      },
      {
        "field": "durable",
        "title": ""
      },
      {
        "field": "realize",
        "title": ""
      }
    ]
  },
  "masterdata/bank-account": {
    "formats": [
      "atlas/masterdata/bank-account"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "stoped",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "no",
        "title": ""
      },
      {
        "field": "bank",
        "title": ""
      }
    ]
  },
  "masterdata/biz-type": {
    "formats": [
      "atlas/masterdata/biz-type"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "stoped",
        "title": ""
      },
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "model",
        "title": "规格型号"
      },
      {
        "field": "unit",
        "title": "计量单位"
      },
      {
        "field": "rate",
        "title": ""
      },
      {
        "field": "add",
        "title": ""
      },
      {
        "field": "quota",
        "title": ""
      }
    ]
  },
  "masterdata/carryover": {
    "formats": [
      "atlas/masterdata/carryover"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "sort",
        "title": "排序"
      },
      {
        "field": "name",
        "title": "排序"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "stoped",
        "title": ""
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "source",
        "title": "源"
      },
      {
        "field": "content_out",
        "title": ""
      },
      {
        "field": "content_in",
        "title": ""
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ]
  },
  "masterdata/cashflow-item": {
    "formats": [
      "atlas/masterdata/cashflow-item"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "stoped",
        "title": ""
      },
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "direction",
        "title": ""
      },
      {
        "field": "content_debit",
        "title": ""
      },
      {
        "field": "content_credit",
        "title": ""
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ]
  },
  "masterdata/dimension": {
    "formats": [
      "atlas/masterdata/dimension"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "stoped",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "格式名称"
      }
    ]
  },
  "masterdata/expense-category": {
    "formats": [
      "atlas/masterdata/expense-category"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "stoped",
        "title": ""
      },
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "格式名称"
      }
    ]
  },
  "masterdata/holiday": {
    "formats": [
      "atlas/masterdata/holiday"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "stoped",
        "title": ""
      },
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "fix_day",
        "title": ""
      },
      {
        "field": "var_day",
        "title": ""
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ]
  },
  "masterdata/item-category": {
    "formats": [
      "atlas/masterdata/item-category"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "stoped",
        "title": ""
      },
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "unit",
        "title": "计量单位"
      },
      {
        "field": "life",
        "title": ""
      }
    ]
  },
  "masterdata/item-code": {
    "formats": [
      "atlas/masterdata/item-code"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "stoped",
        "title": ""
      },
      {
        "field": "article_id",
        "title": "资产分类"
      },
      {
        "field": "article_name",
        "title": "资产分类"
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "brand",
        "title": "品牌"
      },
      {
        "field": "model",
        "title": "规格型号"
      },
      {
        "field": "unit",
        "title": "计量单位"
      },
      {
        "field": "least",
        "title": ""
      },
      {
        "field": "life",
        "title": ""
      },
      {
        "field": "pack",
        "title": ""
      },
      {
        "field": "size",
        "title": ""
      },
      {
        "field": "batch",
        "title": ""
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ]
  },
  "masterdata/location": {
    "formats": [
      "atlas/masterdata/location"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "stoped",
        "title": ""
      },
      {
        "field": "store_id",
        "title": ""
      },
      {
        "field": "store_name",
        "title": ""
      },
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "格式名称"
      }
    ]
  },
  "masterdata/payroll-item": {
    "formats": [
      "atlas/masterdata/payroll-item"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "sort",
        "title": "排序"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "field_name",
        "title": ""
      },
      {
        "field": "field_type",
        "title": ""
      },
      {
        "field": "head",
        "title": ""
      },
      {
        "field": "stoped",
        "title": ""
      }
    ]
  },
  "masterdata/subject": {
    "formats": [
      "atlas/masterdata/subject"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "stoped",
        "title": ""
      },
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "direction",
        "title": ""
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "cashes",
        "title": ""
      },
      {
        "field": "period",
        "title": ""
      },
      {
        "field": "cashflow_in",
        "title": ""
      },
      {
        "field": "cashflow_out",
        "title": ""
      },
      {
        "field": "assist",
        "title": ""
      },
      {
        "field": "require",
        "title": ""
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ]
  },
  "masterdata/warehouse": {
    "formats": [
      "atlas/masterdata/warehouse"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "stoped",
        "title": ""
      },
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "code",
        "title": "资产编码"
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "address",
        "title": "用餐地点"
      },
      {
        "field": "user_list",
        "title": ""
      }
    ]
  },
  "needs/exception": {
    "formats": [],
    "columnFields": [],
    "fields": []
  },
  "needs/iframe": {
    "formats": [],
    "columnFields": [],
    "fields": []
  },
  "needs/redirect": {
    "formats": [],
    "columnFields": [],
    "fields": []
  },
  "preview": {
    "formats": [],
    "columnFields": [],
    "fields": []
  },
  "profile": {
    "formats": [],
    "columnFields": [],
    "fields": [
      {
        "field": "team_id",
        "title": ""
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "profile/message": {
    "formats": [],
    "columnFields": [],
    "fields": []
  },
  "system/dictionary": {
    "formats": [],
    "columnFields": [
      {
        "field": "name",
        "title": "名称"
      },
      {
        "field": "kind",
        "title": "固定"
      },
      {
        "field": "sort",
        "title": "排序"
      },
      {
        "field": "ctime",
        "title": "创建时间"
      },
      {
        "field": "utime",
        "title": "更新时间"
      }
    ],
    "fields": [
      {
        "field": "name",
        "title": "名称"
      },
      {
        "field": "kind",
        "title": "固定"
      },
      {
        "field": "sort",
        "title": "排序"
      },
      {
        "field": "ctime",
        "title": "创建时间"
      },
      {
        "field": "utime",
        "title": "更新时间"
      },
      {
        "field": "depth",
        "title": "深度"
      },
      {
        "field": "max_depth",
        "title": "最大深度"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "child",
        "title": ""
      }
    ]
  },
  "system/grid": {
    "formats": [],
    "columnFields": [
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "user_id",
        "title": "用户标识"
      },
      {
        "field": "user_name",
        "title": "用户名称"
      },
      {
        "field": "mobile_number",
        "title": "手机号码"
      },
      {
        "field": "ctime",
        "title": "更新时间"
      }
    ],
    "fields": [
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "user_id",
        "title": "用户标识"
      },
      {
        "field": "user_name",
        "title": "用户名称"
      },
      {
        "field": "mobile_number",
        "title": "手机号码"
      },
      {
        "field": "ctime",
        "title": "更新时间"
      }
    ]
  },
  "system/log": {
    "formats": [],
    "columnFields": [
      {
        "field": "requesttime",
        "title": "访问时间"
      },
      {
        "field": "host",
        "title": "主机头"
      },
      {
        "field": "requestpathbase",
        "title": "基础路径"
      },
      {
        "field": "requestpath",
        "title": "请求地址"
      },
      {
        "field": "routeendpoint",
        "title": "后端路由"
      },
      {
        "field": "httpmethod",
        "title": "后端路由"
      },
      {
        "field": "httpstatuscode",
        "title": "状态码"
      },
      {
        "field": "elapsedtime",
        "title": "耗时(ms)"
      },
      {
        "field": "requestcontentlength",
        "title": "请求长度"
      },
      {
        "field": "responsecontentlength",
        "title": "响应长度"
      },
      {
        "field": "requestcontenttype",
        "title": "请求类型"
      },
      {
        "field": "responsecontenttype",
        "title": "响应类型"
      },
      {
        "field": "username",
        "title": "用户名称"
      },
      {
        "field": "usersub",
        "title": "用户标识"
      },
      {
        "field": "ip",
        "title": "关联数"
      },
      {
        "field": "hostname",
        "title": " Host主机名"
      },
      {
        "field": "ex",
        "title": "异常"
      },
      {
        "field": "level",
        "title": "日志等级"
      },
      {
        "field": "time",
        "title": "时间"
      },
      {
        "field": "message",
        "title": "消息"
      },
      {
        "field": "appname",
        "title": "应用名称"
      },
      {
        "field": "source",
        "title": "源"
      },
      {
        "field": "progress",
        "title": "进程地址"
      },
      {
        "field": "ctime",
        "title": "操作时间"
      },
      {
        "field": "mark",
        "title": "操作描述"
      },
      {
        "field": "user_name",
        "title": "操作人"
      },
      {
        "field": "user_id",
        "title": "用户ID"
      },
      {
        "field": "ref_count",
        "title": "关联数"
      }
    ],
    "fields": [
      {
        "field": "requesttime",
        "title": "访问时间"
      },
      {
        "field": "host",
        "title": "主机头"
      },
      {
        "field": "requestpathbase",
        "title": "基础路径"
      },
      {
        "field": "requestpath",
        "title": "请求地址"
      },
      {
        "field": "routeendpoint",
        "title": "后端路由"
      },
      {
        "field": "httpmethod",
        "title": "后端路由"
      },
      {
        "field": "httpstatuscode",
        "title": "状态码"
      },
      {
        "field": "elapsedtime",
        "title": "耗时(ms)"
      },
      {
        "field": "requestcontentlength",
        "title": "请求长度"
      },
      {
        "field": "responsecontentlength",
        "title": "响应长度"
      },
      {
        "field": "requestcontenttype",
        "title": "请求类型"
      },
      {
        "field": "responsecontenttype",
        "title": "响应类型"
      },
      {
        "field": "username",
        "title": "用户名称"
      },
      {
        "field": "usersub",
        "title": "用户标识"
      },
      {
        "field": "ip",
        "title": "关联数"
      },
      {
        "field": "hostname",
        "title": " Host主机名"
      },
      {
        "field": "ex",
        "title": "异常"
      },
      {
        "field": "level",
        "title": "日志等级"
      },
      {
        "field": "time",
        "title": "时间"
      },
      {
        "field": "message",
        "title": "消息"
      },
      {
        "field": "appname",
        "title": "应用名称"
      },
      {
        "field": "source",
        "title": "源"
      },
      {
        "field": "progress",
        "title": "进程地址"
      },
      {
        "field": "ctime",
        "title": "操作时间"
      },
      {
        "field": "mark",
        "title": "操作描述"
      },
      {
        "field": "user_name",
        "title": "操作人"
      },
      {
        "field": "user_id",
        "title": "用户ID"
      },
      {
        "field": "ref_count",
        "title": "关联数"
      }
    ]
  },
  "system/parameter": {
    "formats": [],
    "columnFields": [],
    "fields": []
  }
}

export const FORMAT_OWNER: Record<string, string> = {
  "atlas/access/grant": "access/grant",
  "atlas/access/group": "access/group",
  "atlas/access/member": "access/member",
  "atlas/access/partner": "access/partner",
  "atlas/access/partner-account": "access/partner-account",
  "atlas/access/room": "access/room",
  "atlas/access/unit": "access/unit",
  "atlas/archive/borrow": "archive/borrow",
  "atlas/archive/document": "archive/document",
  "atlas/asset/bill": "asset/allot",
  "atlas/asset/apply": "asset/apply",
  "atlas/asset/check/bill": "asset/check",
  "atlas/asset/check": "asset/check",
  "atlas/asset/info": "asset/info",
  "atlas/asset/order": "asset/order",
  "atlas/asset/value": "asset/value",
  "atlas/crm/billing/invoice": "crm/billing/invoice",
  "atlas/crm/billing/receipt": "crm/billing/receipt",
  "atlas/crm/customer/archive": "crm/customer/archive",
  "atlas/crm/customer/contact": "crm/customer/contact",
  "atlas/crm/delivery/milestone": "crm/delivery/milestone",
  "atlas/crm/delivery/project": "crm/delivery/project",
  "atlas/crm/opportunity/list": "crm/opportunity/list",
  "atlas/expense/payment": "expense/advance",
  "atlas/expense/budget": "expense/budget",
  "atlas/expense/contract": "expense/contract",
  "atlas/expense/entertain": "expense/entertain",
  "atlas/expense/purchase": "expense/purchase",
  "atlas/expense/query": "expense/query",
  "atlas/expense/reimburse": "expense/reimburse",
  "atlas/expense/travel": "expense/travel",
  "atlas/finance/analysis/indicator": "finance/analysis/indicator",
  "atlas/finance/arap/payable": "finance/arap/payable",
  "atlas/finance/arap/receivable": "finance/arap/receivable",
  "atlas/finance/budget/execution": "finance/budget/execution",
  "atlas/finance/budget/project-cost": "finance/budget/project-cost",
  "atlas/finance/treasury/account": "finance/treasury/account",
  "atlas/finance/treasury/plan": "finance/treasury/plan",
  "atlas/hr/attendance-apply/field": "hr/attendance-apply/field",
  "atlas/hr/attendance-apply/leave": "hr/attendance-apply/leave",
  "atlas/hr/attendance-apply/makeup": "hr/attendance-apply/makeup",
  "atlas/hr/attendance-apply/overtime": "hr/attendance-apply/overtime",
  "atlas/hr/attendance-apply/shift": "hr/attendance-apply/shift",
  "atlas/hr/attendance/daily": "hr/attendance/daily",
  "atlas/hr/attendance/daily-summary": "hr/attendance/daily-summary",
  "atlas/hr/attendance/leave-rule": "hr/attendance/leave-rule",
  "atlas/hr/attendance/monthly": "hr/attendance/monthly",
  "atlas/hr/attendance/punch": "hr/attendance/punch",
  "atlas/hr/attendance/rule": "hr/attendance/rule",
  "atlas/hr/deduction/housing": "hr/deduction/housing",
  "atlas/hr/deduction/social": "hr/deduction/social",
  "atlas/hr/exit/absent": "hr/exit/absent",
  "atlas/hr/exit/dismiss": "hr/exit/dismiss",
  "atlas/hr/exit/resign": "hr/exit/resign",
  "atlas/hr/insurance/commercial": "hr/insurance/commercial",
  "atlas/hr/insurance/commercial/list": "hr/insurance/commercial",
  "atlas/hr/insurance/housing": "hr/insurance/housing",
  "atlas/hr/insurance/social": "hr/insurance/social",
  "atlas/hr/movement/adjust": "hr/movement/adjust",
  "atlas/hr/movement/onboard": "hr/movement/onboard",
  "atlas/hr/movement/promotion": "hr/movement/promotion",
  "atlas/hr/movement/transfer": "hr/movement/transfer",
  "atlas/hr/payroll/generate": "hr/payroll/generate",
  "atlas/hr/payroll/group": "hr/payroll/group",
  "atlas/hr/payroll/group/item": "hr/payroll/group",
  "atlas/masterdata/payroll-item": "hr/payroll/group",
  "atlas/hr/relation/contract": "hr/relation/contract",
  "atlas/hr/relation/level": "hr/relation/level",
  "atlas/hr/relation/reward": "hr/relation/reward",
  "atlas/hr/relation/training": "hr/relation/training",
  "atlas/hr/report/structure": "hr/report/structure",
  "atlas/hr/report/summary": "hr/report/summary",
  "atlas/hr/resume": "hr/resume",
  "atlas/hr/roster": "hr/roster",
  "atlas/hr/team": "hr/team",
  "atlas/masterdata/asset-category": "masterdata/asset-category",
  "atlas/masterdata/bank-account": "masterdata/bank-account",
  "atlas/masterdata/biz-type": "masterdata/biz-type",
  "atlas/masterdata/carryover": "masterdata/carryover",
  "atlas/masterdata/cashflow-item": "masterdata/cashflow-item",
  "atlas/masterdata/dimension": "masterdata/dimension",
  "atlas/masterdata/expense-category": "masterdata/expense-category",
  "atlas/masterdata/holiday": "masterdata/holiday",
  "atlas/masterdata/item-category": "masterdata/item-category",
  "atlas/masterdata/item-code": "masterdata/item-code",
  "atlas/masterdata/location": "masterdata/location",
  "atlas/masterdata/subject": "masterdata/subject",
  "atlas/masterdata/warehouse": "masterdata/warehouse"
}

/** 全局字段中文标题词典（跨模块同名取众数） */
export const FIELD_TITLE_DICT: Record<string, string> = {
  "perm_name": "分组权限",
  "ctime": "操作时间",
  "utime": "更新时间",
  "name": "格式名称",
  "code": "资产编码",
  "mobile": "手机号",
  "team_name": "所属单位",
  "working": "工作中",
  "sort": "排序",
  "brand": "品牌",
  "model": "规格型号",
  "remark": "备注",
  "pcs": "申领数量",
  "unit": "计量单位",
  "article_id": "资产分类",
  "amount": "金额",
  "enroll": "购置日期",
  "source": "源",
  "article_name": "资产分类",
  "outer_id": "维保单位",
  "price": "单价",
  "contact": "证明人",
  "explain": "维保内容",
  "outer_name": "维保单位",
  "invoice_no": "对应发票",
  "customer_name": "客户",
  "project_name": "项目名称",
  "tax_rate": "税率(%)",
  "invoice_type": "发票类型",
  "invoice_date": "开票日期",
  "invoice_state": "认证状态",
  "receipt_amount": "回款金额",
  "pay_method": "回款方式",
  "receipt_date": "到账日期",
  "receipt_state": "认领状态",
  "customer_level": "客户分级",
  "owner": "负责人",
  "coop_state": "合作状态",
  "project_count": "项目数",
  "contract_total": "累计合同额",
  "receivable_amount": "应收余额",
  "contact_name": "姓名",
  "job_title": "职务",
  "phone": "手机号",
  "email": "邮箱",
  "decision_role": "决策角色",
  "milestone_node": "里程碑",
  "plan_date": "计划完成",
  "actual_date": "实际完成",
  "delay_days": "延期(天)",
  "node_state": "状态",
  "manager": "项目经理",
  "project_no": "项目编号",
  "contract_amount": "合同金额",
  "progress": "进程地址",
  "receipt_rate": "回款进度(%)",
  "project_state": "状态",
  "opp_name": "商机名称",
  "expect_amount": "预计金额",
  "opp_stage": "阶段",
  "win_rate": "赢单率(%)",
  "expect_date": "预计成交",
  "content_id": "费用科目",
  "indate": "有效期",
  "content_name": "费用科目",
  "address": "用餐地点",
  "guests": "招待对象",
  "quotas": "预算标准",
  "digest": "摘要",
  "invoice": "发票",
  "expense_name": "费用分类",
  "predict": "需求日期",
  "supplier": "供应商",
  "start": "开始日期",
  "expire": "结束日期",
  "types": "奖惩类型",
  "depart": "出发地",
  "bourn": "目的地",
  "indicator": "指标",
  "current_value": "本期",
  "previous_value": "上期",
  "industry_value": "行业均值",
  "rating": "评价",
  "total_amount": "应收总额",
  "due_month_amount": "本月到期",
  "overdue_amount": "逾期未付",
  "credit_days": "信用账期(天)",
  "credit_level": "信用等级",
  "customer": "客户",
  "not_due_amount": "未到期",
  "overdue_m1_amount": "逾期 30 天内",
  "overdue_m2_amount": "逾期 31-60 天",
  "overdue_m3_amount": "逾期 61-90 天",
  "overdue_over_amount": "逾期 90 天以上",
  "bad_debt_amount": "坏账准备",
  "overdue_days": "最长逾期(天)",
  "dept": "部门",
  "year": "年度",
  "budget_amount": "年度预算",
  "used_amount": "已使用",
  "remain_amount": "剩余",
  "execution_rate": "执行率(%)",
  "warning": "预警",
  "project": "项目",
  "labor_cost": "人工成本",
  "purchase_cost": "采购成本",
  "other_total_amount": "其他成本",
  "profit_amount": "毛利",
  "gross_rate": "毛利率(%)",
  "account_name": "账户名称",
  "bank_name": "开户行",
  "account_no": "账号",
  "currency": "币种",
  "account_type": "账户类型",
  "balance": "账户余额",
  "inflow_amount": "本月流入",
  "outflow_amount": "本月流出",
  "account_state_label": "状态",
  "month": "月份",
  "plan_in_amount": "计划流入",
  "plan_out_amount": "计划流出",
  "actual_in_amount": "实际流入",
  "actual_out_amount": "实际流出",
  "diff_amount": "净额差异",
  "day": "加班日期",
  "leave_time_fmt": "请假时长",
  "checkin_time": "补卡时间",
  "over_time": "加班时长（小时）",
  "ranks": "职务",
  "position": "岗位",
  "branch_name": "派驻分队",
  "reason": "原因",
  "user_pre_rank": "原职务",
  "user_pre_position": "原岗位",
  "user_pre_scale": "原工资级别",
  "branch_id": "派驻分队",
  "scale": "工资级别",
  "salary": "合同约定工资",
  "card": "身份证号",
  "conditions": "条件内容",
  "content": "培训内容",
  "describe": "公式说明",
  "bases": "基本工资",
  "grade": "综合补贴",
  "posts": "岗位补贴",
  "dine_fix": "每月伙食补助",
  "dine_day": "每日伙食补助",
  "heats": "高温补贴",
  "rise_fix": "固定绩效工资",
  "rise_var": "浮动绩效工资",
  "hour_on": "工作日时薪",
  "hour_off": "休息日时薪",
  "hour_ext": "节假日时薪",
  "hour_add": "年假加班时薪",
  "hour_fix": "约定时薪",
  "times": "约定加班时长",
  "extra": "约定加班工资",
  "skill": "分队长管理员",
  "other": "其他补贴",
  "insure": "扣残障金",
  "social": "扣社保",
  "house": "扣公积金",
  "user_name": "操作人",
  "branch": "培训机构",
  "outcome": "培训成果",
  "kind": "固定",
  "depth": "深度",
  "max_depth": "最大深度",
  "user_id": "用户ID",
  "mobile_number": "手机号码",
  "requesttime": "访问时间",
  "host": "主机头",
  "requestpathbase": "基础路径",
  "requestpath": "请求地址",
  "routeendpoint": "后端路由",
  "httpmethod": "后端路由",
  "httpstatuscode": "状态码",
  "elapsedtime": "耗时(ms)",
  "requestcontentlength": "请求长度",
  "responsecontentlength": "响应长度",
  "requestcontenttype": "请求类型",
  "responsecontenttype": "响应类型",
  "username": "用户名称",
  "usersub": "用户标识",
  "ip": "关联数",
  "hostname": " Host主机名",
  "ex": "异常",
  "level": "日志等级",
  "time": "时间",
  "message": "消息",
  "appname": "应用名称",
  "mark": "操作描述",
  "ref_count": "关联数"
}

/** 路由中声明过的权限码（用于给演示账号授予完整权限） */
export const ROUTE_PERMISSIONS: string[] = [
  "AST_ALLOT",
  "AST_APPLY",
  "AST_BATCH",
  "AST_CHECK",
  "AST_DISUSE",
  "AST_INFO",
  "AST_LEASE",
  "AST_ORDER",
  "AST_REPAIR",
  "AST_RESUME",
  "AST_VALUE",
  "CRM_BILLING_INVOICE",
  "CRM_BILLING_RECEIPT",
  "CRM_BILLING_REVENUE",
  "CRM_CUSTOMER_ARCHIVE",
  "CRM_CUSTOMER_CONTACT",
  "CRM_DELIVERY_MILESTONE",
  "CRM_DELIVERY_PROJECT",
  "CRM_OPPORTUNITY_FUNNEL",
  "CRM_OPPORTUNITY_LIST",
  "DASH_MONITOR",
  "DOC_BORROW",
  "DOC_DOCUMENT",
  "EXP_BUDGET",
  "EXP_CLAIM_ADVANCE",
  "EXP_CLAIM_DEPOSIT",
  "EXP_CLAIM_REIMBURSE",
  "EXP_CLAIM_TAX",
  "EXP_CONTRACT",
  "EXP_PAYMENT",
  "EXP_QUERY",
  "EXP_REQUEST_ENTERTAIN",
  "EXP_REQUEST_PURCHASE",
  "EXP_REQUEST_TRAVEL",
  "FIN_ANALYSIS_DASHBOARD",
  "FIN_ANALYSIS_INDICATOR",
  "FIN_ARAP_PAYABLE",
  "FIN_ARAP_RECEIVABLE",
  "FIN_BUDGET_EXECUTION",
  "FIN_BUDGET_PROJECT",
  "FIN_TREASURY_ACCOUNT",
  "FIN_TREASURY_OVERVIEW",
  "FIN_TREASURY_PLAN",
  "HR_APPLY_FIELD",
  "HR_APPLY_LEAVE",
  "HR_APPLY_MAKEUP",
  "HR_APPLY_OVERTIME",
  "HR_APPLY_SHIFT",
  "HR_ATTENDANCE_DAILY",
  "HR_ATTENDANCE_HOLIDAY",
  "HR_ATTENDANCE_LEAVE",
  "HR_ATTENDANCE_MONTHLY",
  "HR_ATTENDANCE_PUNCH",
  "HR_ATTENDANCE_RULE",
  "HR_ATTENDANCE_SUMMARY",
  "HR_DEDUCTION_HOUSING",
  "HR_DEDUCTION_SOCIAL",
  "HR_EXIT_ABSENT",
  "HR_EXIT_DISMISS",
  "HR_EXIT_RESIGN",
  "HR_INSURANCE_COMMERCIAL",
  "HR_INSURANCE_HOUSING",
  "HR_INSURANCE_SOCIAL",
  "HR_MOVEMENT_ADJUST",
  "HR_MOVEMENT_ONBOARD",
  "HR_MOVEMENT_PROMOTION",
  "HR_MOVEMENT_TRANSFER",
  "HR_PAYROLL_GENERATE",
  "HR_PAYROLL_GROUP",
  "HR_PAYROLL_PAYMENT",
  "HR_RELATION_CONTRACT",
  "HR_RELATION_LEVEL",
  "HR_RELATION_REWARD",
  "HR_RELATION_TRAINING",
  "HR_REPORT_STRUCTURE",
  "HR_REPORT_SUMMARY",
  "HR_RESUME",
  "HR_ROSTER",
  "HR_TEAM",
  "IAM_GRANT",
  "IAM_GROUP",
  "IAM_MEMBER",
  "IAM_PARTNER",
  "IAM_PARTNER_ACCOUNT",
  "IAM_PARTNER_ROLE",
  "IAM_ROLE",
  "IAM_UNIT",
  "MDM_ASSET_CATEGORY",
  "MDM_BANK_ACCOUNT",
  "MDM_BIZ_TYPE",
  "MDM_CARRYOVER",
  "MDM_CASHFLOW_ITEM",
  "MDM_DIMENSION",
  "MDM_HOLIDAY",
  "MDM_PAYROLL_ITEM",
  "MDM_SUBJECT",
  "SYS_DICTIONARY",
  "SYS_GRID",
  "SYS_LOG",
  "SYS_PARAMETER"
]
