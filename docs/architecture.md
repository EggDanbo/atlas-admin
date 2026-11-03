# 架构说明

> 面向阅读源码的人：这份文档解释「为什么这样分层」，而不是逐文件罗列。
> 具体决策的取舍见 [docs/adr](./adr)。

## 1. 整体分层

```
┌───────────────────────────────────────────────────────────┐
│ views（110 个业务页面）                                     │
│   页面只做三件事：声明查询模型、声明列插槽、调用 useListPage   │
├───────────────────────────────────────────────────────────┤
│ components（40+ 业务组件）                                  │
│   SpTable / SpQueryGrid / SpModal / SpDateRange …             │
├───────────────────────────────────────────────────────────┤
│ hooks（组合式函数：useListPage、usePermission、useTabbar …） │
├───────────────────────────────────────────────────────────┤
│ service（api 方法签名 + http 实例）                          │
├───────────────────────────────────────────────────────────┤
│ mock（本地适配器 + 分发引擎 + 数据生成）                      │
│   adapter.ts → engine.ts → schema/ + data/                 │
└───────────────────────────────────────────────────────────┘
```

关键约束：**上层不感知下层实现，下层不反向依赖上层**。

- 页面不直接碰 `alova`，也不 import 任何 mock 代码；
- `service/api` 只有「方法名 + 参数 + 返回类型」，是接口契约而非实现；
- mock 层是唯一知道「没有后端」的地方，删掉它并换回真实 adapter，页面代码零改动。

## 2. 请求链路

```
页面 → service/api/xxx.ts → alova 实例 → mock/adapter.ts → mock/engine.ts → 本地数据
```

`adapter.ts` 实现 Alova 的 `AlovaRequestAdapter` 接口，把请求交给 `engine.ts` 分发：

1. 剥离接口前缀与 mock 命名空间（`/mock-api/atlas`）；
2. 按「模块 + 动作」路由：`crm/invoice` + `search`；
3. 依据动作类型返回符合后端契约的结构（分页对象 / 单条 / 数组 / 布尔）。

因为绕开了网络层，`await` 的时序依然保留（返回 Promise），页面的 loading、竞态、
错误分支都还在真实路径上——这是能"演进成真"的前提。

## 3. 表格列从哪来

企业后台最难维护的往往是表格：列顺序、列宽、哪些列可筛选、哪些列参与合计。
本项目的做法是**列由服务端下发**：

```
dataformat/get?name=atlas/crm/invoice
  → buildColumns('atlas/crm/invoice')
  → resolveModuleDir() 解析到 crm/invoice
  → MODULE_SCHEMA['crm/invoice'].fields
  → 推断类型 / 宽度 / 对齐 / 是否合计
  → DataFormatColumn[]
```

`MODULE_SCHEMA` 由脚本从视图代码里提取（`pnpm mock:schema`），所以「页面用了哪些字段」
和「表格显示哪些列」天然一致。个别页面的表单字段会污染列表（例如角色页的授权表单），
用 `FIELD_OVERRIDES` 显式覆盖，而不是去改生成器。

## 4. 权限模型

三层校验，共用一套权限码：

| 层级 | 位置 | 行为 |
| --- | --- | --- |
| 路由 | `router/guard` + 路由 `meta.permissions` | 无权限则不注册该路由 |
| 菜单 | 路由表推导 | 无权限的节点不渲染 |
| 按钮 | `usePermission().hasPermission([...])` | 控制新增/删除/导出等操作 |

权限码按业务域前缀组织（`CRM_INVOICE_ADD`、`FIN_VOUCHER_EDIT`），
`matchPermit` 支持「配置短码、校验子树」与「配置完整码、精确校验」两种写法。

## 5. 状态管理

Pinia，按职责切分，全部开启持久化（`pinia-plugin-persistedstate`）：

- `user` 用户与登录态
- `async-route` 过滤后的路由表与菜单
- `tabbar` 多页签
- `config` 布局偏好（侧栏宽度、页签风格、圆角…）
- `theme` 明暗模式与主题色
- `enums` 字典缓存

## 6. 设计系统

视觉不是散落在组件里的魔法值，而是三层：

```
tokens.less      CSS 变量：色板、圆角、阴影、层级、动效
   ↑
theme.ts         主色 → 派生色（@ant-design/colors）+ Naive UI themeOverrides
   ↑
skin.less        布局骨架皮肤：侧栏 / 顶栏 / 页签 / 卡片 / 表格
```

换主色时只改一个色值：派生色与 `--atlas-brand-*` 变量一起变，菜单选中态、页签、
按钮、图表全部跟随。

## 7. 数据可复现

mock 数据不是 `Math.random()`。种子由「模块名 + 行号」哈希得到，用 mulberry32 生成：

- 同一页面刷新两次，数据完全一致（演示时可以稳定讲解某一行的来龙去脉）
- 不同模块的数据不雷同（种子不同）
- 单测可以断言具体取值（见 `src/mock/data/__tests__`）

## 8. 质量闸门

```bash
pnpm verify   # lint + typecheck + unit test
pnpm build    # 生产构建
```

CI（`.github/workflows/ci.yml`）在每次 push / PR 上跑同样四步，任一步失败即阻断。
