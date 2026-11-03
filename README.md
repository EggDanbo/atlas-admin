# Atlas Admin

![Vue](https://img.shields.io/badge/Vue-3.5-42b883?logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![Naive UI](https://img.shields.io/badge/Naive%20UI-2.44-18a058)
![Mock](https://img.shields.io/badge/Data-Local%20Mock-f97316)

> 一体化管理系统 · 前端演示版
>
> 基于 Vue 3 + TypeScript + Naive UI 的企业级后台，**纯前端运行**
>
> 所有数据均由本地 mock 引擎生成，不连接任何后端服务，克隆后 `pnpm dev` 即可完整浏览。

**关于名字**：Atlas 取「地图集」之意——一套界面把人事、业务、资产、费用、财务、档案六块业务收在同一张图上；
也取「承载」之意，它承载的是一套开箱即跑、不依赖任何服务的完整演示数据。

## 📸 界面预览

**工作台** — 个人申请、待办审批、最新动态三栏聚合

![工作台](./docs/screenshots/dashboard.jpg)

**监控台** — 按六大业务模块聚合的指标卡与 ECharts 图表

![监控台](./docs/screenshots/monitor.jpg)

**暗色主题**

![监控台 · 暗色](./docs/screenshots/monitor-dark.jpg)

| 业务列表 | 登录页 |
| -------- | ------ |
| ![列表](./docs/screenshots/list.jpg) | ![登录](./docs/screenshots/login.jpg) |

## ✨ 这个版本做了什么

本仓库由实际业务项目整理而来，面向对外演示 / 作品展示场景，做了三件事：

1. **去除业务敏感信息** —— 真实服务地址、内网 IP、域名、接口前缀、固定加密密钥、后台管理员标识等全部清除或替换为占位值
2. **剥离后端接口** —— 移除 HTTP 传输层，请求不再发往任何服务器；接口路径去掉内部命名空间前缀，统一收敛到本地命名空间
3. **全站可用的 mock 数据** —— 内置本地 mock 引擎，按页面真实的字段结构生成中文业务数据，列表、详情、增删改、导出、打印均有反馈

## 🧭 快速开始

```bash
# 安装依赖（Node >= 22）
pnpm install

# 启动开发服务，默认 http://localhost:5180
pnpm dev

# 生产构建（同样使用本地 mock）
pnpm build
```

**登录**：任意账号密码均可进入。默认关闭滑块验证，登录后以「全权限演示账号」进入，
所有菜单可见，但没有超级管理员专属分支，保证演示视角一致。

## 🛠 技术栈

| 类别     | 技术          | 说明                          |
| -------- | ------------- | ----------------------------- |
| 框架     | Vue 3.5       | Composition API + `<script setup>` |
| 语言     | TypeScript 6  | 严格模式                      |
| 构建     | Vite 8        | ESM                           |
| UI       | Naive UI      | 按需自动导入                  |
| 表格     | VXE Table     | 高级表格场景                  |
| 请求     | Alova 3       | 自定义本地适配器              |
| 状态     | Pinia         | 持久化插件                    |
| 样式     | UnoCSS + Less | 原子类优先                    |
| 图表     | ECharts 6     | 数据可视化                    |

## 📁 目录结构

```
atlas-admin/
├── build/                    # 构建配置（Vite 插件、server、build）
├── public/                   # 静态资源
├── scripts/
│   └── mock/
│       ├── extract-schema.mjs  # 从视图代码提取字段结构
│       └── verify.ts           # mock 引擎自检
├── src/
│   ├── components/           # 业务组件（40+）
│   ├── config/               # 应用配置
│   ├── hooks/                # 组合式函数
│   ├── layout/               # 布局
│   ├── locales/              # 国际化
│   ├── mock/                 # ★ 本地 mock 数据服务
│   │   ├── adapter.ts        #   Alova 本地适配器（不发网络请求）
│   │   ├── engine.ts         #   请求分发与响应组装
│   │   ├── data/             #   词库、字段语义、枚举
│   │   └── schema/           #   由视图提取的字段结构 + 列定义生成
│   ├── router/               # 路由（前端固定路由 + 权限过滤）
│   ├── service/
│   │   ├── api/              # 接口声明（仅作为方法签名，不产生真实请求）
│   │   └── http/             # Alova 实例、配置、响应处理
│   ├── store/                # Pinia Store
│   ├── styles/               # 全局样式
│   ├── utils/                # 工具函数
│   └── views/                # 页面视图
└── typings/                  # 全局类型
```

## 🔌 mock 工作机制

### 请求链路

```
业务页面 → service/api/**.ts → alova 实例 → src/mock/adapter.ts → engine.ts → 本地数据
```

`src/mock/adapter.ts` 作为 Alova 的 `requestAdapter`，接管全部请求：
读取 URL 与参数 → 交给 `engine.ts` 分发 → 返回与后端一致的 `{ code, message, data }`。
**整个过程不发生任何网络请求。**

请求地址统一形如 `/mock-api/atlas/asset/allot/search`：`mock-api` 是接口前缀（`VITE_API_URL_PREFIX`），
`atlas` 是本地 mock 命名空间；适配器先剥掉这两层，再按业务路径分发。
视图里声明的 `format: 'atlas/asset/allot'` 与之一一对应，换品牌时把前缀一起替换、再跑一次
`pnpm mock:schema` 即可。

### 响应形态

| 请求类型       | 返回结构                                                       |
| -------------- | -------------------------------------------------------------- |
| 列表 `search`  | `{ list, totalcount, page, pageindex, pagesize, totalpages, sum }` |
| 详情 `get`     | 单条业务对象（含该模块全部业务字段）                           |
| 树 `tree`      | 节点数组（含 `id / pid / label / children`）                   |
| 字典 `getlist` | 选项数组（含 `label / value`）                                 |
| 增删改         | 成功标记 + 新 ID                                               |
| 导出 / 打印    | 前端生成的 CSV / 可打印 HTML 的 data URL                       |
| 登录 / 权限    | AccessToken / 当前用户 / 权限码                                |

### 数据如何贴合页面

表格列并不是写死的，而是由 `dataformat` 接口下发。为了让演示页面表格字段完整、表头是中文，
项目用脚本从 `src/views` 中提取真实字段与标题：

```bash
pnpm mock:schema   # 重新生成 src/mock/schema/schema.generated.ts
```

产物包含三部分：

- `MODULE_SCHEMA` —— 每个业务模块的列表列字段与表单字段
- `FORMAT_OWNER` —— 数据格式名 → 模块目录的映射
- `FIELD_TITLE_DICT` —— 全局字段中文标题词典

`src/mock/schema/columns.ts` 据此生成列定义；`src/mock/data/fieldValue.ts` 按字段名推断语义
（金额 / 日期 / 人员 / 部门 / 科目…），生成符合业务直觉的值。

### 数据可复现

随机数由「模块名 + 行号」派生的固定种子驱动，因此同一页刷新后数据不变，
不同模块之间数据不雷同，便于演示时稳定讲解。

### 自检

```bash
npx tsx scripts/mock/verify.ts
```

会输出登录、用户、应用信息、枚举、组织树、各模块列表、详情、列定义等响应摘要。

## 🔒 脱敏对照

| 项目             | 处理方式                                              |
| ---------------- | ----------------------------------------------------- |
| 后端服务地址     | 移除真实内网 IP 与端口，`VITE_API_URL` 置空           |
| 文件预览域名     | 移除独立域名，留空走本地内置预览                      |
| 接口前缀         | 改为中性的本地命名空间 `/mock-api`                    |
| 接口路径         | 去掉内部命名空间前缀，仅保留业务语义路径              |
| 加密密钥         | 固定 AES Key / IV 替换为占位值                        |
| 品牌标识         | 原企业 logo 与站点图标替换为重新生成的示意图形        |
| 管理员标识       | 硬编码用户 ID 改为 `system-admin`，演示账号不再命中管理员分支 |
| 后台服务框架     | 移除 axios 适配器与 mock 框架依赖，改为自研本地适配器 |
| 真实机构标识     | 移除真实租户 ID 与客户简称，演示数据只使用合成机构    |
| 内网地址         | 清除代码注释中残留的内网瓦片服务地址与测试 IP          |
| 政务化用语       | 审批意见中的公文式表述改为中性业务用语                |
| 版本库与开发文档 | 不包含原仓库信息、内部需求与依赖审计记录              |

> 说明：`src/service/api/` 下仍保留各业务模块的方法签名，它们只是页面调用的「函数名 + 参数」声明，
> 不含任何服务地址，实际数据全部由本地 mock 产生。

## 📋 常用命令

```bash
pnpm dev           # 开发服务
pnpm build         # 生产构建
pnpm build:test    # 测试环境构建
pnpm preview       # 预览构建产物
pnpm lint          # ESLint 检查
pnpm lint:fix      # 自动修复
pnpm tsc:app       # 类型检查
pnpm mock:schema   # 重新提取字段结构
pnpm icons:all     # 扫描并生成离线图标
```

## 🧩 功能模块

演示版收敛为 **13 个一级菜单**，覆盖「人、事、财、物、档」的完整链路：

| 一级菜单 | 包含页面 |
| -------- | -------- |
| 我的看板 | 工作台、监控台 |
| 人事管理 | 人员档案 / 简历 / 变动 / 离职、日常管理、考勤、申请、参保、扣款、工资、查询统计 |
| 业务管理 | 合同、订单、收款、开票、应收应付、业务报表 |
| 资产管理 | 资产信息 / 申领 / 采购 / 验收 / 调拨 / 借用 / 归还 / 处置 / 盘点 / 折旧 / 维保 |
| 费用报销 | 借款、报销、差旅、付款、额度、结算等 |
| 账务处理 | 凭证录入、日记账、明细账、余额表、结转、财务报表 |
| 档案管理 | 档案信息、档案借阅 |
| 基础资料 | 假期类型、工资项目、业务类型、资产分类、银行账户、核算维度、会计科目、现金流向、结转模板 |
| 组织机构 | 单位设置、用户设置、外部机构 |
| 用户权限 | 角色设置、用户权限、分组权限 |
| 外部接口 | 角色设置、账号管理（面向第三方系统的账号治理） |
| 系统设置 | 系统参数、选项设置、表格格式 |
| 系统日志 | 应用日志、访问日志、操作日志 |

### 相比原始工程移除的部分

| 移除内容 | 原因 |
| -------- | ---- |
| `/sso/{vendor}/login` 第三方 OA 单点登录 | 第三方产品品牌，演示环境无入口，且属于对外集成而非业务能力 |
| 「系统分析 / 活跃度」 | 与「监控台」的数据可视化职责重复 |
| 「缓存重置」 | 纯运维按钮页，无业务叙事 |
| 导入日志、修改日志、删除记录、短信日志、消息日志、作业日志 6 个页面 | 与「应用 / 访问 / 操作日志」同模板换字段，属于凑数页面；保留三类核心日志即可覆盖排障场景 |

> 批量导入弹窗仍需要「按 ID 取导入结果」的接口，因此 `service/api/system/logImport.ts`
> 与对应 mock 分支保留，仅删除了列表页。

## 🎨 视觉与品牌

| 项目       | 说明                                                                 |
| ---------- | -------------------------------------------------------------------- |
| 仓库 / 包名 | `atlas-admin`；应用标识 `atlas`（`.env` 的 `VITE_APP_SHORT_NAME`，同时作为本地存储前缀） |
| 系统名称   | 「一体化管理系统」，见 `src/config/index.ts`、`.env` 的 `VITE_APP_TITLE` |
| 主色       | `#F97316`（琥珀橙），悬停 `#FB923C`，按下 `#EA6A0A`                   |
| 主题令牌   | `src/config/index.ts` 的 `primaryColor`、`src/config/common.ts` 的 `appTheme`、`src/styles/var.less`、`src/styles/vxe-pc-ui.scss`（VXE 组件变量） |
| 派生规则   | 侧边栏悬停底色、按钮浅色态等由主色经 `@ant-design/colors` 的 `generate()` 派生，改主色即可全站同步 |
| Logo / 图标 | `src/assets/logo.png`（256）、`public/logo.png`（512）、`public/favicon.ico`（16/32/48）同源栅格化生成 |

### 「我的看板」两个页面

- **工作台** `/board/home`：个人申请 / 待办审批 / 最新动态三栏聚合
- **监控台** `/board/monitor`：按一级导航（人事、业务、资产、费用、账务、档案）汇总，
  含 6 张指标卡与 5 张 ECharts 图表（12 个月趋势、本月占比环形、待办超期堆叠条、
  模块健康度雷达、二级业务量 TOP 10），配色按模块固定，跨图表可对应

### 文件命名约定

- 单文件组件、页面目录：`PascalCase` / 语义化目录（`views/asset/allot`）
- 工具函数、组合式函数、Store、常量模块：`camelCase`（`utils/storage.ts`、`hooks/useECharts.ts`、`store/modules/theme.ts`）
- 全局样式：按职责命名（`var.less` 变量、`global.less` 全局、`vxe-pc-ui.scss` 第三方覆盖）

## ⚠️ 演示版限制

- 文件上传、OCR、短信、企业微信扫码等依赖真实服务的能力仅作界面展示，不会真正执行
- 导出 Excel / 打印预览由前端生成 CSV 与 HTML，样式与真实后端产物不同
- 数据不落库，刷新页面后新增/修改的演示数据会回到初始状态
- 生产构建同样走本地 mock，因此**不可**直接当作生产环境部署使用

## 🧱 图标规范

演示项目统一使用免费开源图标（Ant Design Icons / Remix Icon / MingCute / Material Design Icons），
禁止使用需署名或商业授权图标。详见 `docs/icon-license-audit.md`。
