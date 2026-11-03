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
        "title": "用户标识"
      },
      {
        "field": "user_name",
        "title": "用户名称"
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
        "title": "用户标识"
      },
      {
        "field": "user_name",
        "title": "用户名称"
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
        "title": "名称"
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
        "title": "分配金额"
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
        "title": "用户标识"
      },
      {
        "field": "user_name",
        "title": "用户名称"
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
        "title": "用户标识"
      },
      {
        "field": "user_name",
        "title": "用户名称"
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
        "title": "用户标识"
      },
      {
        "field": "user_name",
        "title": "用户名称"
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
        "title": "名称"
      }
    ]
  },
  "basic/account": {
    "formats": [
      "atlas/basic/account"
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
        "title": "名称"
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
  "basic/article": {
    "formats": [
      "atlas/basic/article"
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
        "title": "名称"
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
  "basic/asset": {
    "formats": [
      "atlas/basic/asset"
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
        "title": "名称"
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
  "basic/assist": {
    "formats": [
      "atlas/basic/assist"
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
        "title": "名称"
      }
    ]
  },
  "basic/cashflow": {
    "formats": [
      "atlas/basic/cashflow"
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
        "title": "名称"
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
  "basic/content": {
    "formats": [
      "atlas/basic/content"
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
        "title": "名称"
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
  "basic/expense": {
    "formats": [
      "atlas/basic/expense"
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
        "title": "名称"
      }
    ]
  },
  "basic/holiday": {
    "formats": [
      "atlas/basic/holiday"
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
        "title": "名称"
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
  "basic/pattern": {
    "formats": [
      "atlas/basic/pattern"
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
  "basic/product": {
    "formats": [
      "atlas/basic/product"
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
  "basic/salary": {
    "formats": [
      "atlas/basic/salary"
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
  "basic/space": {
    "formats": [
      "atlas/basic/space"
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
        "title": "名称"
      }
    ]
  },
  "basic/stock": {
    "formats": [
      "atlas/basic/stock"
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
        "title": "名称"
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
  "basic/store": {
    "formats": [
      "atlas/basic/store"
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
        "title": "名称"
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
  "board/home": {
    "formats": [],
    "columnFields": [],
    "fields": []
  },
  "board/monitor": {
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
  "organ/outer": {
    "formats": [
      "organ/outer"
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
        "title": "名称"
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
        "title": ""
      }
    ]
  },
  "organ/room": {
    "formats": [
      "organ/room"
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
        "title": "名称"
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
  "organ/team": {
    "formats": [
      "organ/team"
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
        "title": "名称"
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
  "organ/user": {
    "formats": [
      "organ/user"
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
        "title": "用户标识"
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
  "paper/borrow": {
    "formats": [
      "atlas/paper/borrow"
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
        "title": "用户标识"
      },
      {
        "field": "user_name",
        "title": "用户名称"
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
  "paper/info": {
    "formats": [
      "atlas/paper/info"
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
        "title": "名称"
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "content",
        "title": "公式内容"
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
  "pense/ansure": {
    "formats": [
      "atlas/pense/apply"
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
        "title": "用户标识"
      },
      {
        "field": "user_name",
        "title": "用户名称"
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
        "title": "分配金额"
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
  "pense/apply": {
    "formats": [
      "atlas/pense/apply"
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
        "title": "用户标识"
      },
      {
        "field": "user_name",
        "title": "用户名称"
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
        "title": "分配金额"
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
  "pense/borrow": {
    "formats": [
      "atlas/pense/apply"
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
        "title": "用户标识"
      },
      {
        "field": "user_name",
        "title": "用户名称"
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
        "title": "分配金额"
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
  "pense/contract": {
    "formats": [
      "atlas/pense/contract"
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
        "title": "名称"
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
        "title": ""
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
        "title": "分配金额"
      },
      {
        "field": "ensure",
        "title": ""
      },
      {
        "field": "content",
        "title": "公式内容"
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
  "pense/limit": {
    "formats": [
      "atlas/pense/limit"
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
        "title": "用户标识"
      },
      {
        "field": "user_name",
        "title": "用户名称"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "amount",
        "title": "分配金额"
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
  "pense/order": {
    "formats": [
      "atlas/pense/order"
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
  "pense/payer": {
    "formats": [
      "atlas/pense/apply"
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
        "title": "用户标识"
      },
      {
        "field": "user_name",
        "title": "用户名称"
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
        "title": "分配金额"
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
  "pense/query": {
    "formats": [
      "atlas/pense/bill"
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
  "pense/serve": {
    "formats": [
      "atlas/pense/serve"
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
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "pense/settle": {
    "formats": [
      "atlas/pense/settle"
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
        "title": "用户标识"
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
  "pense/travel": {
    "formats": [
      "atlas/pense/travel"
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
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "status",
        "title": ""
      }
    ]
  },
  "permit/external/account": {
    "formats": [
      "permit/account"
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
  "permit/external/role": {
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
  "permit/group": {
    "formats": [
      "permit/group"
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
        "title": "用户标识"
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
  "permit/role": {
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
  "permit/user": {
    "formats": [
      "permit/user"
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
  "preview": {
    "formats": [],
    "columnFields": [],
    "fields": []
  },
  "staff/alter/adjust": {
    "formats": [
      "atlas/staff/alter/adjust"
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
  "staff/alter/allot": {
    "formats": [
      "atlas/staff/alter/allot"
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
  "staff/alter/entry": {
    "formats": [
      "atlas/staff/alter/entry"
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
  "staff/alter/grade": {
    "formats": [
      "atlas/staff/alter/grade"
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
  "staff/apply/outside": {
    "formats": [
      "atlas/staff/apply/outside"
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
        "title": "用户标识"
      },
      {
        "field": "user_name",
        "title": "用户名称"
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
  "staff/apply/overtime": {
    "formats": [
      "atlas/staff/apply/overtime"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
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
  "staff/apply/reissue": {
    "formats": [
      "atlas/staff/apply/reissue"
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
        "field": "remark",
        "title": "备注"
      },
      {
        "field": "progress",
        "title": "进程地址"
      }
    ]
  },
  "staff/apply/translate": {
    "formats": [
      "atlas/staff/apply/translate"
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
        "title": "用户名称"
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
  "staff/apply/vacation": {
    "formats": [
      "atlas/staff/apply/vacation"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
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
        "title": ""
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
  "staff/branch": {
    "formats": [
      "atlas/staff/branch"
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
        "title": "名称"
      },
      {
        "field": "address",
        "title": ""
      }
    ]
  },
  "staff/checkin/daily": {
    "formats": [
      "atlas/checkin/daily"
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
  "staff/checkin/day": {
    "formats": [
      "atlas/checkin/day"
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
  "staff/checkin/festival": {
    "formats": [],
    "columnFields": [],
    "fields": []
  },
  "staff/checkin/leave": {
    "formats": [
      "atlas/checkin/leave"
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
        "title": "名称"
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
  "staff/checkin/month": {
    "formats": [
      "atlas/checkin/month"
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
  "staff/checkin/record": {
    "formats": [
      "atlas/checkin/record"
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
  "staff/checkin/rules": {
    "formats": [
      "atlas/checkin/rules"
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
  "staff/daily/because": {
    "formats": [
      "atlas/staff/daily/because"
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
  "staff/daily/educate": {
    "formats": [
      "atlas/staff/daily/educate"
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
  "staff/daily/labor": {
    "formats": [
      "atlas/staff/daily/labor"
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
        "title": "用户标识"
      },
      {
        "field": "user_name",
        "title": "用户名称"
      },
      {
        "field": "date",
        "title": ""
      },
      {
        "field": "pcs",
        "title": "人数"
      },
      {
        "field": "year",
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
  "staff/daily/scales": {
    "formats": [
      "atlas/staff/daily/scales"
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
  "staff/deduct/house": {
    "formats": [
      "atlas/staff/deduct/house"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "team_id",
        "title": "分摊单位"
      },
      {
        "field": "month",
        "title": ""
      }
    ]
  },
  "staff/deduct/social": {
    "formats": [
      "atlas/staff/deduct/social"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "team_id",
        "title": "分摊单位"
      },
      {
        "field": "month",
        "title": ""
      }
    ]
  },
  "staff/info": {
    "formats": [
      "atlas/staff/info"
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
        "title": "所在分队"
      },
      {
        "field": "branch_name",
        "title": "所在分队"
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
        "title": "名称"
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
        "title": ""
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
  "staff/leave/refuse": {
    "formats": [
      "atlas/staff/leave/refuse"
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
  "staff/leave/remove": {
    "formats": [
      "atlas/staff/leave/remove"
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
  "staff/leave/retire": {
    "formats": [
      "atlas/staff/leave/retire"
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
  "staff/protect/house": {
    "formats": [
      "atlas/staff/protect/house"
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
        "title": "名称"
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
  "staff/protect/insure": {
    "formats": [
      "atlas/staff/protect/insure",
      "atlas/staff/protect/insure/list"
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
        "title": "人数"
      },
      {
        "field": "amount",
        "title": "分配金额"
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
        "title": "名称"
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
  "staff/protect/social": {
    "formats": [
      "atlas/staff/protect/social"
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
        "title": "名称"
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
  "staff/report/gzhzb": {
    "formats": [
      "atlas/staff/report/gzhzb"
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
  "staff/report/ryjgb": {
    "formats": [
      "atlas/staff/report/ryjgb"
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
  "staff/resume": {
    "formats": [
      "atlas/staff/resume"
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
        "title": "名称"
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
        "title": "所在分队"
      },
      {
        "field": "branch_name",
        "title": "所在分队"
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
        "title": ""
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
  "staff/salary/group": {
    "formats": [
      "atlas/staff/salary/group",
      "atlas/staff/salary/group/item",
      "atlas/basic/salary"
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
        "title": ""
      },
      {
        "field": "group_id",
        "title": ""
      }
    ]
  },
  "staff/salary/payment": {
    "formats": [
      "atlas/staff/salary/record"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
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
        "title": ""
      }
    ]
  },
  "staff/salary/record": {
    "formats": [
      "atlas/staff/salary/record"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
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
        "title": ""
      }
    ]
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
  "system/logs": {
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
  "system/settings": {
    "formats": [],
    "columnFields": [],
    "fields": []
  },
  "system/usergrid": {
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
  "trade/custom": {
    "formats": [
      "atlas/trade/custom"
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
        "title": "名称"
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
        "title": ""
      }
    ]
  },
  "trade/invoice": {
    "formats": [
      "atlas/trade/invoice"
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
        "title": "用户名称"
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
  "trade/project": {
    "formats": [
      "atlas/trade/project"
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
        "title": ""
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
        "title": "用户标识"
      },
      {
        "field": "user_name",
        "title": "用户名称"
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
  "trade/promise": {
    "formats": [
      "atlas/trade/promise"
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
        "title": "名称"
      },
      {
        "field": "types",
        "title": "奖惩类型"
      },
      {
        "field": "indate",
        "title": ""
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
  "trade/receive": {
    "formats": [
      "atlas/trade/receive"
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
  "trade/report/xmtjb": {
    "formats": [
      "atlas/trade/report/xmtjb"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "year",
        "title": ""
      },
      {
        "field": "team_id",
        "title": "分摊单位"
      }
    ]
  },
  "trade/report/ystjb": {
    "formats": [
      "atlas/trade/report/ystjb"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "year",
        "title": ""
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
  "user": {
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
  "user/message": {
    "formats": [],
    "columnFields": [],
    "fields": []
  },
  "vouch/balance": {
    "formats": [
      "atlas/vouch/balance"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "id",
        "title": ""
      },
      {
        "field": "year",
        "title": ""
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
        "title": "一年内到期投资"
      },
      {
        "field": "credit",
        "title": "一年内到期负债"
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
        "title": ""
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
  "vouch/book/mxflz": {
    "formats": [
      "atlas/vouch/book/mxflz"
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
  "vouch/book/wdmxz": {
    "formats": [
      "atlas/vouch/book/wdmxz"
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
        "field": "assist_id",
        "title": ""
      },
      {
        "field": "content_id",
        "title": "会计科目"
      }
    ]
  },
  "vouch/book/zflz": {
    "formats": [
      "atlas/vouch/book/zflz"
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
  "vouch/cashflow": {
    "formats": [
      "atlas/vouch/cashflow",
      "atlas/vouch/cashflow/list"
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
  "vouch/entry": {
    "formats": [
      "atlas/vouch/entry"
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
  "vouch/finance/lrfpb": {
    "formats": [
      "atlas/vouch/finance/lrfpb"
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
  "vouch/finance/qybdb": {
    "formats": [
      "atlas/vouch/finance/qybdb"
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
  "vouch/finance/xjllb": {
    "formats": [
      "atlas/vouch/finance/xjllb"
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
  "vouch/finance/zcfzb": {
    "formats": [
      "atlas/vouch/finance/zcfzb"
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
  "vouch/period": {
    "formats": [
      "atlas/vouch/period"
    ],
    "columnFields": [],
    "fields": [
      {
        "field": "year",
        "title": ""
      }
    ]
  },
  "vouch/query": {
    "formats": [
      "atlas/vouch/query"
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
  "vouch/report/kmyeb": {
    "formats": [
      "atlas/vouch/report/kmyeb",
      "atlas/vouch/report/kmyeb/list"
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
  "vouch/report/wdyeb": {
    "formats": [
      "atlas/vouch/report/wdyeb"
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
  }
}

export const FORMAT_OWNER: Record<string, string> = {
  "atlas/asset/bill": "asset/allot",
  "atlas/asset/apply": "asset/apply",
  "atlas/asset/check/bill": "asset/check",
  "atlas/asset/check": "asset/check",
  "atlas/asset/info": "asset/info",
  "atlas/asset/order": "asset/order",
  "atlas/asset/value": "asset/value",
  "atlas/basic/account": "basic/account",
  "atlas/basic/article": "basic/article",
  "atlas/basic/asset": "basic/asset",
  "atlas/basic/assist": "basic/assist",
  "atlas/basic/cashflow": "basic/cashflow",
  "atlas/basic/content": "basic/content",
  "atlas/basic/expense": "basic/expense",
  "atlas/basic/holiday": "basic/holiday",
  "atlas/basic/pattern": "basic/pattern",
  "atlas/basic/product": "basic/product",
  "atlas/basic/salary": "basic/salary",
  "atlas/basic/space": "basic/space",
  "atlas/basic/stock": "basic/stock",
  "atlas/basic/store": "basic/store",
  "organ/outer": "organ/outer",
  "organ/room": "organ/room",
  "organ/team": "organ/team",
  "organ/user": "organ/user",
  "atlas/paper/borrow": "paper/borrow",
  "atlas/paper/info": "paper/info",
  "atlas/pense/apply": "pense/ansure",
  "atlas/pense/contract": "pense/contract",
  "atlas/pense/limit": "pense/limit",
  "atlas/pense/order": "pense/order",
  "atlas/pense/bill": "pense/query",
  "atlas/pense/serve": "pense/serve",
  "atlas/pense/settle": "pense/settle",
  "atlas/pense/travel": "pense/travel",
  "permit/account": "permit/external/account",
  "permit/group": "permit/group",
  "permit/user": "permit/user",
  "atlas/staff/alter/adjust": "staff/alter/adjust",
  "atlas/staff/alter/allot": "staff/alter/allot",
  "atlas/staff/alter/entry": "staff/alter/entry",
  "atlas/staff/alter/grade": "staff/alter/grade",
  "atlas/staff/apply/outside": "staff/apply/outside",
  "atlas/staff/apply/overtime": "staff/apply/overtime",
  "atlas/staff/apply/reissue": "staff/apply/reissue",
  "atlas/staff/apply/translate": "staff/apply/translate",
  "atlas/staff/apply/vacation": "staff/apply/vacation",
  "atlas/staff/branch": "staff/branch",
  "atlas/checkin/daily": "staff/checkin/daily",
  "atlas/checkin/day": "staff/checkin/day",
  "atlas/checkin/leave": "staff/checkin/leave",
  "atlas/checkin/month": "staff/checkin/month",
  "atlas/checkin/record": "staff/checkin/record",
  "atlas/checkin/rules": "staff/checkin/rules",
  "atlas/staff/daily/because": "staff/daily/because",
  "atlas/staff/daily/educate": "staff/daily/educate",
  "atlas/staff/daily/labor": "staff/daily/labor",
  "atlas/staff/daily/scales": "staff/daily/scales",
  "atlas/staff/deduct/house": "staff/deduct/house",
  "atlas/staff/deduct/social": "staff/deduct/social",
  "atlas/staff/info": "staff/info",
  "atlas/staff/leave/refuse": "staff/leave/refuse",
  "atlas/staff/leave/remove": "staff/leave/remove",
  "atlas/staff/leave/retire": "staff/leave/retire",
  "atlas/staff/protect/house": "staff/protect/house",
  "atlas/staff/protect/insure": "staff/protect/insure",
  "atlas/staff/protect/insure/list": "staff/protect/insure",
  "atlas/staff/protect/social": "staff/protect/social",
  "atlas/staff/report/gzhzb": "staff/report/gzhzb",
  "atlas/staff/report/ryjgb": "staff/report/ryjgb",
  "atlas/staff/resume": "staff/resume",
  "atlas/staff/salary/group": "staff/salary/group",
  "atlas/staff/salary/group/item": "staff/salary/group",
  "atlas/staff/salary/record": "staff/salary/payment",
  "atlas/trade/custom": "trade/custom",
  "atlas/trade/invoice": "trade/invoice",
  "atlas/trade/project": "trade/project",
  "atlas/trade/promise": "trade/promise",
  "atlas/trade/receive": "trade/receive",
  "atlas/trade/report/xmtjb": "trade/report/xmtjb",
  "atlas/trade/report/ystjb": "trade/report/ystjb",
  "atlas/vouch/balance": "vouch/balance",
  "atlas/vouch/book/mxflz": "vouch/book/mxflz",
  "atlas/vouch/book/wdmxz": "vouch/book/wdmxz",
  "atlas/vouch/book/zflz": "vouch/book/zflz",
  "atlas/vouch/cashflow": "vouch/cashflow",
  "atlas/vouch/cashflow/list": "vouch/cashflow",
  "atlas/vouch/entry": "vouch/entry",
  "atlas/vouch/finance/lrfpb": "vouch/finance/lrfpb",
  "atlas/vouch/finance/qybdb": "vouch/finance/qybdb",
  "atlas/vouch/finance/xjllb": "vouch/finance/xjllb",
  "atlas/vouch/finance/zcfzb": "vouch/finance/zcfzb",
  "atlas/vouch/period": "vouch/period",
  "atlas/vouch/query": "vouch/query",
  "atlas/vouch/report/kmyeb": "vouch/report/kmyeb",
  "atlas/vouch/report/kmyeb/list": "vouch/report/kmyeb",
  "atlas/vouch/report/wdyeb": "vouch/report/wdyeb"
}

/** 全局字段中文标题词典（跨模块同名取众数） */
export const FIELD_TITLE_DICT: Record<string, string> = {
  "code": "项目编码",
  "name": "名称",
  "brand": "品牌",
  "model": "规格型号",
  "remark": "备注",
  "pcs": "人数",
  "unit": "计量单位",
  "article_id": "资产分类",
  "amount": "分配金额",
  "enroll": "购置日期",
  "source": "源",
  "article_name": "资产分类",
  "outer_id": "客户名称",
  "price": "每期服务费",
  "contact": "证明人",
  "mobile": "手机号",
  "explain": "维保内容",
  "outer_name": "客户名称",
  "sort": "排序",
  "predict": "需求日期",
  "supplier": "供应商",
  "content_id": "会计科目",
  "quotas": "预算标准",
  "content_name": "会计科目",
  "perm_name": "分组权限",
  "ctime": "更新时间",
  "utime": "更新时间",
  "team_name": "分摊单位",
  "working": "工作中",
  "user_pre_rank": "原职务",
  "user_pre_position": "原岗位",
  "user_pre_scale": "原工资级别",
  "branch_id": "所在分队",
  "ranks": "职务",
  "position": "岗位",
  "scale": "工资级别",
  "salary": "工资总额",
  "branch_name": "所在分队",
  "card": "身份证号",
  "types": "奖惩类型",
  "content": "公式内容",
  "user_name": "用户名称",
  "start": "开始日期",
  "expire": "结束日期",
  "branch": "培训机构",
  "outcome": "培训成果",
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
  "reason": "原因",
  "conditions": "条件内容",
  "describe": "公式说明",
  "kind": "固定",
  "depth": "深度",
  "max_depth": "最大深度",
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
  "user_id": "用户标识",
  "ref_count": "关联数",
  "mobile_number": "手机号码",
  "team_id": "分摊单位",
  "rates": "税率",
  "taxes": "税额",
  "totals": "开票金额",
  "invoice": "发票类型",
  "product_id": "业务类型",
  "payment": "支付方式",
  "period": "应收期间",
  "months": "不支付月份",
  "product_name": "业务类型",
  "van": "空缺人数",
  "remain": "应收日期",
  "rate": "税率",
  "invoice_no": "发票号码",
  "digest": "凭证摘要",
  "debit_credit": "金额",
  "cash_dir_id": "主表项目",
  "cash_sub_id": "附表项目",
  "cash_dir_name": "主表项目",
  "cash_sub_name": "附表项目",
  "debit": "一年内到期投资",
  "credit": "一年内到期负债"
}

/** 路由中声明过的权限码（用于给演示账号授予完整权限） */
export const ROUTE_PERMISSIONS: string[] = [
  "DEMO_ASSET_ALLOT",
  "DEMO_ASSET_APPLY",
  "DEMO_ASSET_BACK",
  "DEMO_ASSET_BATCH",
  "DEMO_ASSET_CHECK",
  "DEMO_ASSET_DISUSE",
  "DEMO_ASSET_INFO",
  "DEMO_ASSET_LEASE",
  "DEMO_ASSET_LEND",
  "DEMO_ASSET_ORDER",
  "DEMO_ASSET_REPAIR",
  "DEMO_ASSET_RESUME",
  "DEMO_ASSET_VALUE",
  "DEMO_BASIC_ACCOUNT",
  "DEMO_BASIC_ASSET",
  "DEMO_BASIC_ASSIST",
  "DEMO_BASIC_CASHFLOW",
  "DEMO_BASIC_CONTENT",
  "DEMO_BASIC_EXPENSE",
  "DEMO_BASIC_HOLIDAY",
  "DEMO_BASIC_PATTERN",
  "DEMO_BASIC_PRODUCT",
  "DEMO_BASIC_SALARY",
  "DEMO_BOARD_MONITOR",
  "DEMO_PAPER_BORROW",
  "DEMO_PAPER_INFO",
  "DEMO_PENSE_ANSURE",
  "DEMO_PENSE_APPLY",
  "DEMO_PENSE_BORROW",
  "DEMO_PENSE_CONTRACT",
  "DEMO_PENSE_LIMIT",
  "DEMO_PENSE_ORDER",
  "DEMO_PENSE_PAYER",
  "DEMO_PENSE_QUERY",
  "DEMO_PENSE_SERVE",
  "DEMO_PENSE_SETTLE",
  "DEMO_PENSE_TRAVEL",
  "DEMO_STAFF_ADJUST",
  "DEMO_STAFF_ALLOT",
  "DEMO_STAFF_BECAUSE",
  "DEMO_STAFF_BRANCH",
  "DEMO_STAFF_CHECKIN_DAILY",
  "DEMO_STAFF_CHECKIN_DAY",
  "DEMO_STAFF_CHECKIN_FESTIVAL",
  "DEMO_STAFF_CHECKIN_LEAVE",
  "DEMO_STAFF_CHECKIN_MONTH",
  "DEMO_STAFF_CHECKIN_RECORD",
  "DEMO_STAFF_CHECKIN_RULES",
  "DEMO_STAFF_DEDUCT_HOUSE",
  "DEMO_STAFF_DEDUCT_SOCIAL",
  "DEMO_STAFF_EDUCATE",
  "DEMO_STAFF_ENTRY",
  "DEMO_STAFF_GRADE",
  "DEMO_STAFF_INFO",
  "DEMO_STAFF_LABOR",
  "DEMO_STAFF_PROTECT_HOUSE",
  "DEMO_STAFF_PROTECT_INSURE",
  "DEMO_STAFF_PROTECT_SOCIAL",
  "DEMO_STAFF_REFUSE",
  "DEMO_STAFF_REMOVE",
  "DEMO_STAFF_REPORT_GZHZB",
  "DEMO_STAFF_REPORT_RYJGB",
  "DEMO_STAFF_RESUME",
  "DEMO_STAFF_RETIRE",
  "DEMO_STAFF_SALARY_GROUP",
  "DEMO_STAFF_SALARY_PAYMENT",
  "DEMO_STAFF_SALARY_RECORD",
  "DEMO_STAFF_SCALES",
  "DEMO_TRADE_CUSTOM",
  "DEMO_TRADE_INVOICE",
  "DEMO_TRADE_PROJECT",
  "DEMO_TRADE_PROMISE",
  "DEMO_TRADE_RECEIVE",
  "DEMO_TRADE_REPORT_XMTJB",
  "DEMO_TRADE_REPORT_YSTJB",
  "DEMO_VOUCH_BALANCE",
  "DEMO_VOUCH_BOOK_MXFLZ",
  "DEMO_VOUCH_BOOK_WDMXZ",
  "DEMO_VOUCH_BOOK_ZFLZ",
  "DEMO_VOUCH_CASHFLOW",
  "DEMO_VOUCH_ENTRY",
  "DEMO_VOUCH_FINANCE_LRFPB",
  "DEMO_VOUCH_FINANCE_QYBDB",
  "DEMO_VOUCH_FINANCE_XJLLB",
  "DEMO_VOUCH_FINANCE_ZCFZB",
  "DEMO_VOUCH_PERIOD",
  "DEMO_VOUCH_REPORT_KMYEB",
  "DEMO_VOUCH_REPORT_SSPHB",
  "DEMO_VOUCH_REPORT_WDYEB",
  "EXTERNAL_ACCOUNT",
  "EXTERNAL_ROLE",
  "ORGAN_OUTER",
  "ORGAN_ROOM",
  "ORGAN_TEAM",
  "ORGAN_USER",
  "PERMIT_GROUP",
  "PERMIT_ROLE",
  "PERMIT_USER_ROLE",
  "SYSTEM_DICTIONARY",
  "SYSTEM_LOG",
  "SYSTEM_SETTINGS",
  "SYSTEM_USERGRID"
]
