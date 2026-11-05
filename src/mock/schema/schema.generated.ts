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
        "title": ""
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
        "title": ""
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
        "title": ""
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
        "title": "联系人"
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
        "title": ""
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
        "title": ""
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
        "title": ""
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
        "title": ""
      },
      {
        "field": "digest",
        "title": ""
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
        "title": ""
      },
      {
        "field": "content",
        "title": ""
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
        "title": ""
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
        "title": ""
      },
      {
        "field": "require",
        "title": ""
      },
      {
        "field": "digest",
        "title": ""
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
        "title": ""
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
        "title": "支付金额"
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
        "title": ""
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
        "title": ""
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
        "title": ""
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
        "title": ""
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
  "expense/budget/quota": {
    "formats": [
      "atlas/expense/budget/quota"
    ],
    "columnFields": [
      {
        "field": "expense_type",
        "title": "费用类别"
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
        "title": "剩余额度"
      },
      {
        "field": "execution_rate",
        "title": "执行率(%)"
      }
    ],
    "fields": [
      {
        "field": "expense_type",
        "title": "费用类别"
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
        "title": "剩余额度"
      },
      {
        "field": "execution_rate",
        "title": "执行率(%)"
      }
    ]
  },
  "expense/claim/list": {
    "formats": [
      "atlas/expense/claim/list"
    ],
    "columnFields": [
      {
        "field": "claim_no",
        "title": "申请单号"
      },
      {
        "field": "expense_type",
        "title": "费用类型"
      },
      {
        "field": "applicant",
        "title": "申请人"
      },
      {
        "field": "dept_name",
        "title": "部门"
      },
      {
        "field": "amount",
        "title": "金额"
      },
      {
        "field": "apply_date",
        "title": "申请日期"
      },
      {
        "field": "claim_state",
        "title": "状态"
      }
    ],
    "fields": [
      {
        "field": "claim_no",
        "title": "申请单号"
      },
      {
        "field": "expense_type",
        "title": "费用类型"
      },
      {
        "field": "applicant",
        "title": "申请人"
      },
      {
        "field": "dept_name",
        "title": "部门"
      },
      {
        "field": "amount",
        "title": "金额"
      },
      {
        "field": "apply_date",
        "title": "申请日期"
      },
      {
        "field": "claim_state",
        "title": "状态"
      }
    ]
  },
  "expense/contract/list": {
    "formats": [
      "atlas/expense/contract/list"
    ],
    "columnFields": [
      {
        "field": "contract_no",
        "title": "合同编号"
      },
      {
        "field": "contract_name",
        "title": "合同名称"
      },
      {
        "field": "supplier",
        "title": "供应商"
      },
      {
        "field": "amount",
        "title": "合同金额"
      },
      {
        "field": "paid_amount",
        "title": "已付款"
      },
      {
        "field": "payment_rate",
        "title": "付款进度(%)"
      },
      {
        "field": "expire_date",
        "title": "到期日"
      },
      {
        "field": "contract_state",
        "title": "状态"
      }
    ],
    "fields": [
      {
        "field": "contract_no",
        "title": "合同编号"
      },
      {
        "field": "contract_name",
        "title": "合同名称"
      },
      {
        "field": "supplier",
        "title": "供应商"
      },
      {
        "field": "amount",
        "title": "合同金额"
      },
      {
        "field": "paid_amount",
        "title": "已付款"
      },
      {
        "field": "payment_rate",
        "title": "付款进度(%)"
      },
      {
        "field": "expire_date",
        "title": "到期日"
      },
      {
        "field": "contract_state",
        "title": "状态"
      }
    ]
  },
  "expense/payment/list": {
    "formats": [
      "atlas/expense/payment/list"
    ],
    "columnFields": [
      {
        "field": "payment_no",
        "title": "支付单号"
      },
      {
        "field": "claim_no",
        "title": "关联申请单"
      },
      {
        "field": "applicant",
        "title": "收款人"
      },
      {
        "field": "dept_name",
        "title": "部门"
      },
      {
        "field": "amount",
        "title": "支付金额"
      },
      {
        "field": "pay_method",
        "title": "支付方式"
      },
      {
        "field": "pay_date",
        "title": "支付日期"
      },
      {
        "field": "pay_state",
        "title": "状态"
      }
    ],
    "fields": [
      {
        "field": "payment_no",
        "title": "支付单号"
      },
      {
        "field": "claim_no",
        "title": "关联申请单"
      },
      {
        "field": "applicant",
        "title": "收款人"
      },
      {
        "field": "dept_name",
        "title": "部门"
      },
      {
        "field": "amount",
        "title": "支付金额"
      },
      {
        "field": "pay_method",
        "title": "支付方式"
      },
      {
        "field": "pay_date",
        "title": "支付日期"
      },
      {
        "field": "pay_state",
        "title": "状态"
      }
    ]
  },
  "expense/report/dashboard": {
    "formats": [],
    "columnFields": [],
    "fields": []
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
  "hr/attendance/record": {
    "formats": [
      "atlas/hr/attendance/record"
    ],
    "columnFields": [
      {
        "field": "work_date",
        "title": "日期"
      },
      {
        "field": "employee_name",
        "title": "员工"
      },
      {
        "field": "dept_name",
        "title": "部门"
      },
      {
        "field": "check_in",
        "title": "上班打卡"
      },
      {
        "field": "check_out",
        "title": "下班打卡"
      },
      {
        "field": "work_hours",
        "title": "工时(小时)"
      },
      {
        "field": "attendance_state",
        "title": "状态"
      }
    ],
    "fields": [
      {
        "field": "work_date",
        "title": "日期"
      },
      {
        "field": "employee_name",
        "title": "员工"
      },
      {
        "field": "dept_name",
        "title": "部门"
      },
      {
        "field": "check_in",
        "title": "上班打卡"
      },
      {
        "field": "check_out",
        "title": "下班打卡"
      },
      {
        "field": "work_hours",
        "title": "工时(小时)"
      },
      {
        "field": "attendance_state",
        "title": "状态"
      }
    ]
  },
  "hr/attendance/summary": {
    "formats": [
      "atlas/hr/attendance/summary"
    ],
    "columnFields": [
      {
        "field": "employee_name",
        "title": "员工"
      },
      {
        "field": "dept_name",
        "title": "部门"
      },
      {
        "field": "should_days",
        "title": "应出勤(天)"
      },
      {
        "field": "actual_days",
        "title": "实出勤(天)"
      },
      {
        "field": "late_count",
        "title": "迟到(次)"
      },
      {
        "field": "leave_days",
        "title": "请假(天)"
      },
      {
        "field": "overtime_hours",
        "title": "加班(小时)"
      },
      {
        "field": "exception_count",
        "title": "异常(次)"
      }
    ],
    "fields": [
      {
        "field": "employee_name",
        "title": "员工"
      },
      {
        "field": "dept_name",
        "title": "部门"
      },
      {
        "field": "should_days",
        "title": "应出勤(天)"
      },
      {
        "field": "actual_days",
        "title": "实出勤(天)"
      },
      {
        "field": "late_count",
        "title": "迟到(次)"
      },
      {
        "field": "leave_days",
        "title": "请假(天)"
      },
      {
        "field": "overtime_hours",
        "title": "加班(小时)"
      },
      {
        "field": "exception_count",
        "title": "异常(次)"
      }
    ]
  },
  "hr/employee/movement": {
    "formats": [
      "atlas/hr/employee/movement"
    ],
    "columnFields": [
      {
        "field": "employee_name",
        "title": "员工"
      },
      {
        "field": "employee_no",
        "title": "工号"
      },
      {
        "field": "movement_type",
        "title": "异动类型"
      },
      {
        "field": "from_dept",
        "title": "原部门"
      },
      {
        "field": "to_dept",
        "title": "新部门"
      },
      {
        "field": "effect_date",
        "title": "生效日期"
      },
      {
        "field": "reason",
        "title": "异动原因"
      },
      {
        "field": "operator",
        "title": "经办人"
      }
    ],
    "fields": [
      {
        "field": "employee_name",
        "title": "员工"
      },
      {
        "field": "employee_no",
        "title": "工号"
      },
      {
        "field": "movement_type",
        "title": "异动类型"
      },
      {
        "field": "from_dept",
        "title": "原部门"
      },
      {
        "field": "to_dept",
        "title": "新部门"
      },
      {
        "field": "effect_date",
        "title": "生效日期"
      },
      {
        "field": "reason",
        "title": "异动原因"
      },
      {
        "field": "operator",
        "title": "经办人"
      }
    ]
  },
  "hr/employee/roster": {
    "formats": [
      "atlas/hr/employee/roster"
    ],
    "columnFields": [
      {
        "field": "employee_no",
        "title": "工号"
      },
      {
        "field": "employee_name",
        "title": "姓名"
      },
      {
        "field": "dept_name",
        "title": "部门"
      },
      {
        "field": "position_name",
        "title": "岗位"
      },
      {
        "field": "job_grade",
        "title": "职级"
      },
      {
        "field": "staff_state",
        "title": "状态"
      },
      {
        "field": "entry_date",
        "title": "入职日期"
      },
      {
        "field": "education",
        "title": "学历"
      },
      {
        "field": "age",
        "title": "年龄"
      },
      {
        "field": "base_salary",
        "title": "基本工资"
      }
    ],
    "fields": [
      {
        "field": "employee_no",
        "title": "工号"
      },
      {
        "field": "employee_name",
        "title": "姓名"
      },
      {
        "field": "dept_name",
        "title": "部门"
      },
      {
        "field": "position_name",
        "title": "岗位"
      },
      {
        "field": "job_grade",
        "title": "职级"
      },
      {
        "field": "staff_state",
        "title": "状态"
      },
      {
        "field": "entry_date",
        "title": "入职日期"
      },
      {
        "field": "education",
        "title": "学历"
      },
      {
        "field": "age",
        "title": "年龄"
      },
      {
        "field": "base_salary",
        "title": "基本工资"
      }
    ]
  },
  "hr/org/team": {
    "formats": [
      "atlas/hr/org/team"
    ],
    "columnFields": [
      {
        "field": "dept_name",
        "title": "部门"
      },
      {
        "field": "manager",
        "title": "负责人"
      },
      {
        "field": "headcount",
        "title": "编制人数"
      },
      {
        "field": "on_job",
        "title": "在职人数"
      },
      {
        "field": "vacancy",
        "title": "空缺"
      },
      {
        "field": "avg_tenure",
        "title": "平均司龄(年)"
      }
    ],
    "fields": [
      {
        "field": "dept_name",
        "title": "部门"
      },
      {
        "field": "manager",
        "title": "负责人"
      },
      {
        "field": "headcount",
        "title": "编制人数"
      },
      {
        "field": "on_job",
        "title": "在职人数"
      },
      {
        "field": "vacancy",
        "title": "空缺"
      },
      {
        "field": "avg_tenure",
        "title": "平均司龄(年)"
      }
    ]
  },
  "hr/payroll/sheet": {
    "formats": [
      "atlas/hr/payroll/sheet"
    ],
    "columnFields": [
      {
        "field": "pay_month",
        "title": "月份"
      },
      {
        "field": "employee_name",
        "title": "员工"
      },
      {
        "field": "dept_name",
        "title": "部门"
      },
      {
        "field": "gross_amount",
        "title": "应发工资"
      },
      {
        "field": "social_amount",
        "title": "社保"
      },
      {
        "field": "fund_amount",
        "title": "公积金"
      },
      {
        "field": "tax_amount",
        "title": "个税"
      },
      {
        "field": "net_amount",
        "title": "实发工资"
      },
      {
        "field": "pay_state",
        "title": "发放状态"
      }
    ],
    "fields": [
      {
        "field": "pay_month",
        "title": "月份"
      },
      {
        "field": "employee_name",
        "title": "员工"
      },
      {
        "field": "dept_name",
        "title": "部门"
      },
      {
        "field": "gross_amount",
        "title": "应发工资"
      },
      {
        "field": "social_amount",
        "title": "社保"
      },
      {
        "field": "fund_amount",
        "title": "公积金"
      },
      {
        "field": "tax_amount",
        "title": "个税"
      },
      {
        "field": "net_amount",
        "title": "实发工资"
      },
      {
        "field": "pay_state",
        "title": "发放状态"
      }
    ]
  },
  "hr/report/dashboard": {
    "formats": [],
    "columnFields": [],
    "fields": []
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
        "title": ""
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
        "title": ""
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
        "title": ""
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
        "title": ""
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
        "title": ""
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
        "title": ""
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
  "atlas/expense/budget/quota": "expense/budget/quota",
  "atlas/expense/claim/list": "expense/claim/list",
  "atlas/expense/contract/list": "expense/contract/list",
  "atlas/expense/payment/list": "expense/payment/list",
  "atlas/finance/analysis/indicator": "finance/analysis/indicator",
  "atlas/finance/arap/payable": "finance/arap/payable",
  "atlas/finance/arap/receivable": "finance/arap/receivable",
  "atlas/finance/budget/execution": "finance/budget/execution",
  "atlas/finance/budget/project-cost": "finance/budget/project-cost",
  "atlas/finance/treasury/account": "finance/treasury/account",
  "atlas/finance/treasury/plan": "finance/treasury/plan",
  "atlas/hr/attendance/record": "hr/attendance/record",
  "atlas/hr/attendance/summary": "hr/attendance/summary",
  "atlas/hr/employee/movement": "hr/employee/movement",
  "atlas/hr/employee/roster": "hr/employee/roster",
  "atlas/hr/org/team": "hr/org/team",
  "atlas/hr/payroll/sheet": "hr/payroll/sheet",
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
  "atlas/masterdata/payroll-item": "masterdata/payroll-item",
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
  "amount": "支付金额",
  "enroll": "购置日期",
  "source": "源",
  "article_name": "资产分类",
  "outer_id": "维保单位",
  "price": "单价",
  "contact": "联系人",
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
  "pay_method": "支付方式",
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
  "manager": "负责人",
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
  "expense_type": "费用类型",
  "year": "年度",
  "budget_amount": "年度预算",
  "used_amount": "已使用",
  "remain_amount": "剩余",
  "execution_rate": "执行率(%)",
  "claim_no": "关联申请单",
  "applicant": "收款人",
  "dept_name": "部门",
  "apply_date": "申请日期",
  "claim_state": "状态",
  "contract_no": "合同编号",
  "contract_name": "合同名称",
  "supplier": "供应商",
  "paid_amount": "已付款",
  "payment_rate": "付款进度(%)",
  "expire_date": "到期日",
  "contract_state": "状态",
  "payment_no": "支付单号",
  "pay_date": "支付日期",
  "pay_state": "发放状态",
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
  "work_date": "日期",
  "employee_name": "员工",
  "check_in": "上班打卡",
  "check_out": "下班打卡",
  "work_hours": "工时(小时)",
  "attendance_state": "状态",
  "should_days": "应出勤(天)",
  "actual_days": "实出勤(天)",
  "late_count": "迟到(次)",
  "leave_days": "请假(天)",
  "overtime_hours": "加班(小时)",
  "exception_count": "异常(次)",
  "employee_no": "工号",
  "movement_type": "异动类型",
  "from_dept": "原部门",
  "to_dept": "新部门",
  "effect_date": "生效日期",
  "reason": "异动原因",
  "operator": "经办人",
  "position_name": "岗位",
  "job_grade": "职级",
  "staff_state": "状态",
  "entry_date": "入职日期",
  "education": "学历",
  "age": "年龄",
  "base_salary": "基本工资",
  "headcount": "编制人数",
  "on_job": "在职人数",
  "vacancy": "空缺",
  "avg_tenure": "平均司龄(年)",
  "pay_month": "月份",
  "gross_amount": "应发工资",
  "social_amount": "社保",
  "fund_amount": "公积金",
  "tax_amount": "个税",
  "net_amount": "实发工资",
  "kind": "固定",
  "depth": "深度",
  "max_depth": "最大深度",
  "user_id": "用户ID",
  "user_name": "操作人",
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
  "EXP_BUDGET_QUOTA",
  "EXP_CLAIM_LIST",
  "EXP_CONTRACT_LIST",
  "EXP_PAYMENT_LIST",
  "EXP_REPORT_DASHBOARD",
  "FIN_ANALYSIS_DASHBOARD",
  "FIN_ANALYSIS_INDICATOR",
  "FIN_ARAP_PAYABLE",
  "FIN_ARAP_RECEIVABLE",
  "FIN_BUDGET_EXECUTION",
  "FIN_BUDGET_PROJECT",
  "FIN_TREASURY_ACCOUNT",
  "FIN_TREASURY_OVERVIEW",
  "FIN_TREASURY_PLAN",
  "HR_ATTENDANCE_RECORD",
  "HR_ATTENDANCE_SUMMARY",
  "HR_EMPLOYEE_MOVEMENT",
  "HR_EMPLOYEE_ROSTER",
  "HR_ORG_TEAM",
  "HR_PAYROLL_SHEET",
  "HR_REPORT_DASHBOARD",
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
