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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "项目编码"
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
        "title": ""
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
      },
      {
        "field": "code",
        "title": "项目编码"
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
        "title": "项目编码"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
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
        "title": "分摊单位"
      },
      {
        "field": "team_id",
        "title": "分摊单位"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
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
        "title": "分摊单位"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
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
        "title": "分摊单位"
      },
      {
        "field": "methods",
        "title": ""
      },
      {
        "field": "period",
        "title": "应收期间"
      },
      {
        "field": "name",
        "title": "格式名称"
      }
    ]
  },
  "crm/customer": {
    "formats": [
      "atlas/crm/customer"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "stoped",
        "title": ""
      },
      {
        "field": "team_id",
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
      },
      {
        "field": "no",
        "title": ""
      },
      {
        "field": "code",
        "title": "项目编码"
      },
      {
        "field": "name",
        "title": "格式名称"
      },
      {
        "field": "nature",
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
        "title": "证明人"
      },
      {
        "field": "mobile",
        "title": "手机号"
      },
      {
        "field": "email",
        "title": ""
      },
      {
        "field": "hotline",
        "title": ""
      },
      {
        "field": "address",
        "title": "用餐地点"
      }
    ]
  },
  "crm/invoice": {
    "formats": [
      "atlas/crm/invoice"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "team_id",
        "title": "单位部门"
      },
      {
        "field": "amount",
        "title": "金额"
      },
      {
        "field": "name",
        "title": "名称"
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
        "field": "pcs",
        "title": "数量"
      },
      {
        "field": "price",
        "title": "单价"
      },
      {
        "field": "rates",
        "title": "税率"
      },
      {
        "field": "taxes",
        "title": "税额"
      },
      {
        "field": "totals",
        "title": "价税合计"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "outer_name",
        "title": "客户名称"
      },
      {
        "field": "no",
        "title": ""
      },
      {
        "field": "red",
        "title": ""
      },
      {
        "field": "source",
        "title": "源"
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
        "field": "date",
        "title": ""
      },
      {
        "field": "drawer",
        "title": ""
      },
      {
        "field": "user_name",
        "title": "操作人"
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "settle",
        "title": ""
      },
      {
        "field": "remark",
        "title": "备注"
      }
    ]
  },
  "crm/project": {
    "formats": [
      "atlas/crm/project"
    ],
    "columnFields": [
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "outer_name",
        "title": "开票客户"
      },
      {
        "field": "invoice",
        "title": "发票类型"
      },
      {
        "field": "product_name",
        "title": "业务类型"
      },
      {
        "field": "payment",
        "title": "支付方式"
      },
      {
        "field": "period",
        "title": "期数"
      },
      {
        "field": "price",
        "title": "每期服务费"
      },
      {
        "field": "amount",
        "title": "服务费"
      },
      {
        "field": "months",
        "title": "不支付月份"
      },
      {
        "field": "content_name",
        "title": "费用科目"
      },
      {
        "field": "name",
        "title": "名称"
      },
      {
        "field": "salary",
        "title": "工资总额"
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
        "field": "branch_name",
        "title": "所在分队"
      },
      {
        "field": "position",
        "title": "岗位"
      },
      {
        "field": "pcs",
        "title": "人数"
      },
      {
        "field": "van",
        "title": "空缺人数"
      },
      {
        "field": "scale",
        "title": "工资级别"
      }
    ],
    "fields": [
      {
        "field": "team_name",
        "title": "所属单位"
      },
      {
        "field": "outer_name",
        "title": "开票客户"
      },
      {
        "field": "invoice",
        "title": "发票类型"
      },
      {
        "field": "product_name",
        "title": "业务类型"
      },
      {
        "field": "payment",
        "title": "支付方式"
      },
      {
        "field": "period",
        "title": "期数"
      },
      {
        "field": "price",
        "title": "每期服务费"
      },
      {
        "field": "amount",
        "title": "服务费"
      },
      {
        "field": "months",
        "title": "不支付月份"
      },
      {
        "field": "content_name",
        "title": "费用科目"
      },
      {
        "field": "name",
        "title": "名称"
      },
      {
        "field": "salary",
        "title": "工资总额"
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
        "field": "branch_name",
        "title": "所在分队"
      },
      {
        "field": "position",
        "title": "岗位"
      },
      {
        "field": "pcs",
        "title": "人数"
      },
      {
        "field": "van",
        "title": "空缺人数"
      },
      {
        "field": "scale",
        "title": "工资级别"
      },
      {
        "field": "team_id",
        "title": "所属单位"
      },
      {
        "field": "outer_id",
        "title": "开票客户"
      },
      {
        "field": "product_id",
        "title": "业务类型"
      },
      {
        "field": "content_id",
        "title": "费用科目"
      },
      {
        "field": "branch_id",
        "title": "所在分队"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "link_id",
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
        "field": "code",
        "title": "项目编码"
      },
      {
        "field": "model",
        "title": "规格型号"
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
        "field": "pattern",
        "title": ""
      },
      {
        "field": "schedule",
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
        "field": "reason",
        "title": "原因"
      },
      {
        "field": "renew",
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
        "field": "scales",
        "title": ""
      },
      {
        "field": "incomes",
        "title": ""
      },
      {
        "field": "expenses",
        "title": ""
      },
      {
        "field": "alloctes",
        "title": ""
      },
      {
        "field": "files_htyj",
        "title": ""
      },
      {
        "field": "files_gdht",
        "title": ""
      },
      {
        "field": "files_cbys",
        "title": ""
      },
      {
        "field": "files_yyzz",
        "title": ""
      },
      {
        "field": "files_sfz",
        "title": ""
      },
      {
        "field": "files_jht",
        "title": ""
      },
      {
        "field": "files_bcxy",
        "title": ""
      },
      {
        "field": "files_zmcl",
        "title": ""
      },
      {
        "field": "files_zzxy",
        "title": ""
      },
      {
        "field": "files_zzsq",
        "title": ""
      },
      {
        "field": "files_jcxy",
        "title": ""
      },
      {
        "field": "files_jcsm",
        "title": ""
      },
      {
        "field": "files_jczj",
        "title": ""
      },
      {
        "field": "files_qksm",
        "title": ""
      },
      {
        "field": "files_xctp",
        "title": ""
      },
      {
        "field": "files_cns",
        "title": ""
      },
      {
        "field": "files_zfsm",
        "title": ""
      },
      {
        "field": "states",
        "title": ""
      }
    ]
  },
  "crm/receipt": {
    "formats": [
      "atlas/crm/receipt"
    ],
    "columnFields": [
      {
        "field": "invoice_no",
        "title": "发票号码"
      },
      {
        "field": "outer_name",
        "title": "客户名称"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
      },
      {
        "field": "amount",
        "title": "分摊金额"
      }
    ],
    "fields": [
      {
        "field": "invoice_no",
        "title": "发票号码"
      },
      {
        "field": "outer_name",
        "title": "客户名称"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
      },
      {
        "field": "amount",
        "title": "分摊金额"
      },
      {
        "field": "outer_id",
        "title": "客户名称"
      },
      {
        "field": "team_id",
        "title": "分摊单位"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "invoice_id",
        "title": ""
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "totals",
        "title": "开票金额"
      },
      {
        "field": "account",
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
  "crm/receivable": {
    "formats": [
      "atlas/crm/receivable"
    ],
    "columnFields": [
      {
        "field": "period",
        "title": "应收期间"
      },
      {
        "field": "remain",
        "title": "应收日期"
      },
      {
        "field": "amount",
        "title": "应收金额"
      },
      {
        "field": "product_name",
        "title": "业务类型"
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
        "title": "税率"
      },
      {
        "field": "totals",
        "title": "开票金额"
      }
    ],
    "fields": [
      {
        "field": "period",
        "title": "应收期间"
      },
      {
        "field": "remain",
        "title": "应收日期"
      },
      {
        "field": "amount",
        "title": "应收金额"
      },
      {
        "field": "product_name",
        "title": "业务类型"
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
        "title": "税率"
      },
      {
        "field": "totals",
        "title": "开票金额"
      },
      {
        "field": "product_id",
        "title": "业务类型"
      },
      {
        "field": "id",
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
        "field": "indate",
        "title": "有效期"
      },
      {
        "field": "expire",
        "title": "结束日期"
      },
      {
        "field": "team_id",
        "title": "分摊单位"
      },
      {
        "field": "outer_id",
        "title": "客户名称"
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "crm/report/project": {
    "formats": [
      "atlas/crm/report/project"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "year",
        "title": "年度"
      },
      {
        "field": "team_id",
        "title": "分摊单位"
      }
    ]
  },
  "crm/report/receivable": {
    "formats": [
      "atlas/crm/report/receivable"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "year",
        "title": "年度"
      },
      {
        "field": "team_id",
        "title": "分摊单位"
      },
      {
        "field": "outer_id",
        "title": "客户名称"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
      },
      {
        "field": "outer_id",
        "title": "客户名称"
      },
      {
        "field": "outer_name",
        "title": "客户名称"
      },
      {
        "field": "project_id",
        "title": ""
      },
      {
        "field": "project_name",
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
        "field": "source",
        "title": "源"
      },
      {
        "field": "payment",
        "title": "支付方式"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
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
        "title": "分摊单位"
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
        "title": "分摊单位"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "finance/cashflow": {
    "formats": [
      "atlas/finance/cashflow",
      "atlas/finance/cashflow/list"
    ],
    "columnFields": [
      {
        "field": "digest",
        "title": "凭证摘要"
      },
      {
        "field": "debit_credit",
        "title": "金额"
      },
      {
        "field": "content_name",
        "title": "会计科目"
      },
      {
        "field": "amount",
        "title": "分配金额"
      },
      {
        "field": "cash_dir_id",
        "title": "主表项目"
      },
      {
        "field": "cash_sub_id",
        "title": "附表项目"
      },
      {
        "field": "cash_dir_name",
        "title": "主表项目"
      },
      {
        "field": "cash_sub_name",
        "title": "附表项目"
      }
    ],
    "fields": [
      {
        "field": "digest",
        "title": "凭证摘要"
      },
      {
        "field": "debit_credit",
        "title": "金额"
      },
      {
        "field": "content_name",
        "title": "会计科目"
      },
      {
        "field": "amount",
        "title": "分配金额"
      },
      {
        "field": "cash_dir_id",
        "title": "主表项目"
      },
      {
        "field": "cash_sub_id",
        "title": "附表项目"
      },
      {
        "field": "cash_dir_name",
        "title": "主表项目"
      },
      {
        "field": "cash_sub_name",
        "title": "附表项目"
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
        "field": "date",
        "title": ""
      },
      {
        "field": "code",
        "title": "项目编码"
      },
      {
        "field": "cash_amount",
        "title": ""
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "finance/detail-ledger": {
    "formats": [
      "atlas/finance/detail-ledger"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "content_code",
        "title": ""
      }
    ]
  },
  "finance/dimension-balance": {
    "formats": [
      "atlas/finance/dimension-balance"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "assist_type",
        "title": ""
      },
      {
        "field": "content_id",
        "title": "会计科目"
      },
      {
        "field": "assist_id",
        "title": ""
      }
    ]
  },
  "finance/dimension-ledger": {
    "formats": [
      "atlas/finance/dimension-ledger"
    ],
    "columnFields": [],
    "fields": []
  },
  "finance/general-ledger": {
    "formats": [
      "atlas/finance/general-ledger"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "content_code",
        "title": ""
      }
    ]
  },
  "finance/opening": {
    "formats": [
      "atlas/finance/opening"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "year",
        "title": "年度"
      },
      {
        "field": "content_id",
        "title": "会计科目"
      },
      {
        "field": "content_name",
        "title": "会计科目"
      },
      {
        "field": "debit",
        "title": "借方金额"
      },
      {
        "field": "credit",
        "title": "贷方金额"
      },
      {
        "field": "expire",
        "title": "结束日期"
      },
      {
        "field": "room_id",
        "title": ""
      },
      {
        "field": "room_name",
        "title": ""
      },
      {
        "field": "work_id",
        "title": ""
      },
      {
        "field": "work_name",
        "title": ""
      },
      {
        "field": "bank_id",
        "title": ""
      },
      {
        "field": "bank_name",
        "title": ""
      },
      {
        "field": "account_id",
        "title": ""
      },
      {
        "field": "account_name",
        "title": ""
      },
      {
        "field": "project_id",
        "title": ""
      },
      {
        "field": "project_name",
        "title": ""
      },
      {
        "field": "customer_id",
        "title": ""
      },
      {
        "field": "customer_name",
        "title": ""
      },
      {
        "field": "supplier_id",
        "title": ""
      },
      {
        "field": "supplier_name",
        "title": ""
      },
      {
        "field": "transact_id",
        "title": ""
      },
      {
        "field": "transact_name",
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
        "field": "pattern_id",
        "title": ""
      },
      {
        "field": "pattern_name",
        "title": ""
      },
      {
        "field": "product_id",
        "title": "业务类型"
      },
      {
        "field": "product_name",
        "title": "业务类型"
      },
      {
        "field": "invests_id",
        "title": ""
      },
      {
        "field": "invests_name",
        "title": ""
      },
      {
        "field": "expense_id",
        "title": ""
      },
      {
        "field": "expense_name",
        "title": "费用分类"
      },
      {
        "field": "unusual_id",
        "title": ""
      },
      {
        "field": "unusual_name",
        "title": ""
      },
      {
        "field": "content_period",
        "title": ""
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "assist_id",
        "title": ""
      }
    ]
  },
  "finance/period": {
    "formats": [
      "atlas/finance/period"
    ],
    "columnFields": [
      {
        "field": "year",
        "title": "年度"
      },
      {
        "field": "month",
        "title": "月份"
      },
      {
        "field": "isAudited",
        "title": "审核状态"
      },
      {
        "field": "isCarried",
        "title": "结转状态"
      },
      {
        "field": "isClosed",
        "title": "结账状态"
      }
    ],
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
        "field": "isAudited",
        "title": "审核状态"
      },
      {
        "field": "isCarried",
        "title": "结转状态"
      },
      {
        "field": "isClosed",
        "title": "结账状态"
      }
    ]
  },
  "finance/statement/balance-sheet": {
    "formats": [
      "atlas/finance/statement/balance-sheet"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "name",
        "title": "名称"
      },
      {
        "field": "debit",
        "title": "一年内到期投资"
      },
      {
        "field": "credit",
        "title": "一年内到期负债"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "date",
        "title": ""
      }
    ]
  },
  "finance/statement/cash-flow": {
    "formats": [
      "atlas/finance/statement/cash-flow"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "code",
        "title": "项目编码"
      },
      {
        "field": "debit",
        "title": "调增数"
      },
      {
        "field": "credit",
        "title": "调减数"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "source",
        "title": "源"
      }
    ]
  },
  "finance/statement/equity": {
    "formats": [
      "atlas/finance/statement/equity"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "date",
        "title": ""
      }
    ]
  },
  "finance/statement/profit": {
    "formats": [
      "atlas/finance/statement/profit"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "date",
        "title": ""
      }
    ]
  },
  "finance/subject-balance": {
    "formats": [
      "atlas/finance/subject-balance",
      "atlas/finance/subject-balance/list"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "level",
        "title": "日志等级"
      },
      {
        "field": "content_type",
        "title": ""
      },
      {
        "field": "content_id",
        "title": "会计科目"
      }
    ]
  },
  "finance/voucher": {
    "formats": [
      "atlas/finance/voucher"
    ],
    "columnFields": [
      {
        "field": "digest",
        "title": "凭证摘要"
      },
      {
        "field": "content_name",
        "title": "会计科目"
      },
      {
        "field": "debit",
        "title": "借方金额"
      },
      {
        "field": "credit",
        "title": "贷方金额"
      }
    ],
    "fields": [
      {
        "field": "digest",
        "title": "凭证摘要"
      },
      {
        "field": "content_name",
        "title": "会计科目"
      },
      {
        "field": "debit",
        "title": "借方金额"
      },
      {
        "field": "credit",
        "title": "贷方金额"
      },
      {
        "field": "content_id",
        "title": "会计科目"
      },
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "source",
        "title": "源"
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
        "field": "remark",
        "title": "备注"
      }
    ]
  },
  "finance/voucher-query": {
    "formats": [
      "atlas/finance/voucher-query"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "assist_id",
        "title": ""
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
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
        "title": "凭证摘要"
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
        "title": "分摊单位"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
      },
      {
        "field": "outer_id",
        "title": "客户名称"
      },
      {
        "field": "outer_name",
        "title": "客户名称"
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
        "title": "分摊单位"
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
        "title": "分摊单位"
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
        "title": "凭证摘要"
      },
      {
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "team_id",
        "title": "分摊单位"
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
        "title": "分摊单位"
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
        "title": "分摊单位"
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
        "title": "分摊单位"
      },
      {
        "field": "code",
        "title": "项目编码"
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
        "title": "分摊单位"
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
        "title": "分摊单位"
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
        "title": "分摊单位"
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
        "title": "分摊单位"
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
        "title": "分摊单位"
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
        "title": "分摊单位"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
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
        "title": "客户名称"
      },
      {
        "field": "outer_name",
        "title": "客户名称"
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
        "title": "分摊单位"
      },
      {
        "field": "code",
        "title": "项目编码"
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
        "title": "分摊单位"
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
        "title": "分摊单位"
      },
      {
        "field": "code",
        "title": "项目编码"
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
        "title": "分摊单位"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
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
        "title": "分摊单位"
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
        "title": "分摊单位"
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
        "title": "分摊单位"
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
        "title": "分摊单位"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "凭证摘要"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "分摊单位"
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
        "title": "分摊单位"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
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
        "title": "项目编码"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
      },
      {
        "field": "code",
        "title": "项目编码"
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
        "title": "项目编码"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
      },
      {
        "field": "code",
        "title": "项目编码"
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
        "title": "项目编码"
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
        "title": "税率"
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
        "title": "项目编码"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "code",
        "title": "项目编码"
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
        "title": "项目编码"
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
        "title": "项目编码"
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
        "title": "项目编码"
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
        "title": "项目编码"
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
        "title": "项目编码"
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
        "title": "应收期间"
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
        "title": "分摊单位"
      },
      {
        "field": "team_name",
        "title": "分摊单位"
      },
      {
        "field": "code",
        "title": "项目编码"
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
        "title": "分摊单位"
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
  "atlas/crm/customer": "crm/customer",
  "atlas/crm/invoice": "crm/invoice",
  "atlas/crm/project": "crm/project",
  "atlas/crm/receipt": "crm/receipt",
  "atlas/crm/receivable": "crm/receivable",
  "atlas/crm/report/project": "crm/report/project",
  "atlas/crm/report/receivable": "crm/report/receivable",
  "atlas/expense/payment": "expense/advance",
  "atlas/expense/budget": "expense/budget",
  "atlas/expense/contract": "expense/contract",
  "atlas/expense/entertain": "expense/entertain",
  "atlas/expense/purchase": "expense/purchase",
  "atlas/expense/query": "expense/query",
  "atlas/expense/reimburse": "expense/reimburse",
  "atlas/expense/travel": "expense/travel",
  "atlas/finance/cashflow": "finance/cashflow",
  "atlas/finance/cashflow/list": "finance/cashflow",
  "atlas/finance/detail-ledger": "finance/detail-ledger",
  "atlas/finance/dimension-balance": "finance/dimension-balance",
  "atlas/finance/dimension-ledger": "finance/dimension-ledger",
  "atlas/finance/general-ledger": "finance/general-ledger",
  "atlas/finance/opening": "finance/opening",
  "atlas/finance/period": "finance/period",
  "atlas/finance/statement/balance-sheet": "finance/statement/balance-sheet",
  "atlas/finance/statement/cash-flow": "finance/statement/cash-flow",
  "atlas/finance/statement/equity": "finance/statement/equity",
  "atlas/finance/statement/profit": "finance/statement/profit",
  "atlas/finance/subject-balance": "finance/subject-balance",
  "atlas/finance/subject-balance/list": "finance/subject-balance",
  "atlas/finance/voucher": "finance/voucher",
  "atlas/finance/voucher-query": "finance/voucher-query",
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
  "code": "项目编码",
  "mobile": "手机号",
  "team_name": "分摊单位",
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
  "outer_id": "客户名称",
  "price": "单价",
  "contact": "证明人",
  "explain": "维保内容",
  "outer_name": "客户名称",
  "team_id": "分摊单位",
  "rates": "税率",
  "taxes": "税额",
  "totals": "开票金额",
  "invoice": "发票",
  "product_id": "业务类型",
  "payment": "支付方式",
  "period": "应收期间",
  "months": "不支付月份",
  "product_name": "业务类型",
  "content_id": "会计科目",
  "content_name": "会计科目",
  "salary": "合同约定工资",
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
  "branch_id": "派驻分队",
  "position": "岗位",
  "van": "空缺人数",
  "scale": "工资级别",
  "branch_name": "派驻分队",
  "invoice_no": "发票号码",
  "remain": "应收日期",
  "rate": "税率",
  "indate": "有效期",
  "address": "用餐地点",
  "guests": "招待对象",
  "quotas": "预算标准",
  "digest": "凭证摘要",
  "expense_name": "费用分类",
  "predict": "需求日期",
  "supplier": "供应商",
  "start": "开始日期",
  "expire": "结束日期",
  "types": "奖惩类型",
  "depart": "出发地",
  "bourn": "目的地",
  "debit_credit": "金额",
  "cash_dir_id": "主表项目",
  "cash_sub_id": "附表项目",
  "cash_dir_name": "主表项目",
  "cash_sub_name": "附表项目",
  "year": "年度",
  "month": "月份",
  "isAudited": "审核状态",
  "isCarried": "结转状态",
  "isClosed": "结账状态",
  "debit": "借方金额",
  "credit": "贷方金额",
  "day": "加班日期",
  "leave_time_fmt": "请假时长",
  "checkin_time": "补卡时间",
  "over_time": "加班时长（小时）",
  "ranks": "职务",
  "reason": "原因",
  "user_pre_rank": "原职务",
  "user_pre_position": "原岗位",
  "user_pre_scale": "原工资级别",
  "card": "身份证号",
  "conditions": "条件内容",
  "content": "培训内容",
  "describe": "公式说明",
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
  "progress": "进程地址",
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
  "CRM_CUSTOMER",
  "CRM_INVOICE",
  "CRM_PROJECT",
  "CRM_RECEIPT",
  "CRM_RECEIVABLE",
  "CRM_REPORT_PROJECT",
  "CRM_REPORT_RECEIVABLE",
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
  "FIN_BALANCE_DIMENSION",
  "FIN_BALANCE_SUBJECT",
  "FIN_CASHFLOW",
  "FIN_LEDGER_DETAIL",
  "FIN_LEDGER_GENERAL",
  "FIN_OPENING",
  "FIN_PERIOD",
  "FIN_STATEMENT_BALANCE",
  "FIN_STATEMENT_CASHFLOW",
  "FIN_STATEMENT_EQUITY",
  "FIN_STATEMENT_PROFIT",
  "FIN_VOUCHER_CREATE",
  "FIN_VOUCHER_ENTRY",
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
