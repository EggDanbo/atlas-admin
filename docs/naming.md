# 组件命名规范

> 目录名 = 主导出符号名。看到一个名字，就知道它属于哪一层、干什么用。

## 1. 三层前缀

`src/components` 下 30+ 个目录，前缀只有三种：

| 前缀 | 含义 | 判据 | 例子 |
| --- | --- | --- | --- |
| `Na*` | **对 Naive UI 的薄封装** | props 原样透传，只做样式/默认值增强，行为与 `N` 组件一致 | `NaCard` `NaTag` `NaIcon` `NaPage` `NaLoading` `NaIconButton` |
| `Sp*` | **自有设计系统组件** | 有独立交互或数据逻辑，但与具体业务无关，换项目可复用 | `SpTable` `SpModal` `SpTree` `SpTablePicker` `SpQueryGrid` `SpDateRange` |
| `Biz*` | **业务组件** | 依赖具体业务概念或接口，换项目不可复用 | `BizDetailHost` `BizDraftBox` `BizLogs` `BizPrint` `BizFile` |

例外只有一个：`AppProvider`（`App*`）——应用级容器，全局唯一，不参与分页/列表，单独一类比硬塞进上面三层更清楚。

**判据不用猜，问三个问题**：
1. 它内部 `import` 了 `@/service/api` 吗？→ `Biz*`
2. 它只是把 Naive 组件包了一层、加了些默认值吗？→ `Na*`
3. 都不是，那它有自己的交互逻辑吗？→ `Sp*`

## 2. 角色后缀

后缀说明"这是什么形态的组件"，比前缀更能体现职责：

| 后缀 | 形态 | 例子 |
| --- | --- | --- |
| `Picker` | 点击弹出表格选择面板，回填 id + 文本 | `CustomerPicker`、`SpTablePicker` |
| `Modal` | 弹窗 | `SpModal`、`SpBatchImportModal`、`BizSendMessageModal` |
| `Table` | 表格 | `SpTable` |
| `Grid` | 栅格布局 | `SpQueryGrid` |
| `Tree` | 树 | `SpTree` |
| `Host` | 挂载点（占位，内部换实现） | `BizDetailHost` |
| `Provider` | 上下文注入容器 | `AppProvider` |
| `Button` | 按钮（不写 `Btn`） | `NaIconButton` |
| `Scope` | 作用域选择 | `SpMapScope` |
| `Editor` | 富文本 | `SpRichTextEditor` |

缩写只在已成词的地方保留（`Icon`、`Dict`），**`Btn` / `BtnGroup` / `Modal2` 这类简称不再使用**。

## 3. 系列组件：目录即命名空间

`SpTablePicker/` 下 15 个 picker 不再重复加层前缀——目录已经限定了语义，导入路径本身就是上下文：

```ts
import { CustomerPicker, PartnerPicker } from '@/components/SpTablePicker'
```

这条规则的好处是可预测：**要找"选客户的控件"，先找 `components/`，再想它是哪一类（picker），然后进 `SpTablePicker/`。** 不用记 15 个顶层目录。

## 4. `TableSelect` → `SpTablePicker`：为什么改

原名有三个问题：

1. **它不是一个组件，是 15 个**。叫 `TableSelect` 让人以为是"一个表格选择器"，实际是选择器家族。
2. **`TableSelect` 读不出"弹窗选表"这个交互**。它的真实形态是：只读输入框 → 点击弹出带分页/筛选/多选的表格 → 确认回填。英文里这叫 picker，不叫 select（select 通常指下拉）。
3. **半数子组件名与业务语义脱节**，甚至有拼写错误。

### 逐项对照

| 原文件 | 原问题 | 新名字 | 实际选择对象 | 数据格式 |
| --- | --- | --- | --- | --- |
| `AssistSelect` | `Assist` 猜不出是辅助核算 | `AuxDimensionPicker` | 辅助核算维度 | `select/assist` |
| `AssetInfoSelect` | `Info` 泛泛 | `AssetLedgerPicker` | 资产台账 | `select/asset` |
| `AssetApplySelect` | — | `AssetApplyPicker` | 资产领用单 | `select/asset/apply` |
| `AssetOrderSelect` | 接口叫 batch，名字叫 order | `AssetBatchPicker` | 资产批次 | `select/asset/order` |
| `AssetLeaseSelect` | — | `AssetLeasePicker` | 租赁合同 | `select/asset/lease` |
| `OuterSelect` | **`Outer` 完全不可读** | `PartnerPicker` | 往来单位（客户/供应商） | `select/outer` |
| `UserSelect` | `User` 与系统账号混淆 | `MemberPicker` | 系统成员 | `select/user` |
| `WorkSelect` | **名叫 Work，实际选员工名册** | `StaffPicker` | 在职员工 | `select/work` |
| `ResumeSelect` | — | `ResumePicker` | 简历 | `select/resume` |
| `BranchSelect` | **名叫 Branch，实际是组织团队** | `TeamPicker` | 组织/团队 | `select/branch` |
| `CustomSelect` | **拼写错误：应为 Customer** | `CustomerPicker` | 客户 | `select/custom` |
| `InvoiceSelect` | — | `InvoicePicker` | 发票 | `select/invoice` |
| `TradeProjectSelect` | `Trade` 是多余的旧域前缀 | `ProjectPicker` | 项目 | `select/project` |
| `PenseContractSelect` | **拼写错误：Pense → Expense** | `ExpenseContractPicker` | 费用合同 | `select/contract` |
| `SalaryGroupSelect` | — | `SalaryGroupPicker` | 薪资组 | `select/salary` |

配套改名：`useTableSelect` → `useTablePicker`、`TableSelectItem` → `TablePickerItem`、`SelectProps` → `TablePickerProps`。

> `dataFormat` 字符串（`select/work` 等）**保持不变**——它是 mock schema 的键，与组件命名无关。

## 5. 其余目录改名一览

| 原名 | 新名 | 理由 |
| --- | --- | --- |
| `Card` `Tag` `Icon` `Page` `Loading` `CheckCard` `CountTo` `ImageGroup` `Paragraph` `Password` `Authority` | `Na*` 前缀 | 与 `NCard`/`NTag` 区分，一眼看出是 Naive 封装 |
| `IconBtn` | `NaIconButton` | 不用缩写 |
| `QueryGrid` | `SpQueryGrid` | 缺层前缀，与 `SpTable` 不成体系 |
| `Render` | `SpRender` | 同上，且 `Render` 单独出现会与 `render` 函数混淆 |
| `map` | `SpScope` | 原目录名是拼音式简写，组件本体是"作用域选择"；且 kebab/小写目录与 PascalCase 组件规则冲突 |
| `wang-editor` | `SpRichTextEditor` | 原目录名是第三方库名，不该出现在业务组件命名里 |
| `DraftBox` | `BizDraftBox` | 草稿箱是业务概念 |
| `File` | `BizFile` | 文件管理依赖业务上传接口 |
| `Logs` | `BizLogs` | 操作日志是业务概念 |
| `Print` | `BizPrint` | 打印模板依赖业务单据 |
| `SendMessageModal` | `BizSendMessageModal` | 站内信是业务概念 |
| `Provider` | `AppProvider` | 应用级容器 |

## 6. 保持不动的部分

- **`Sp*` 系列本来就规范**：`SpTable`、`SpModal`、`SpTree`、`SpCascader`、`SpDateRange`、`SpDict`、`SpSearch`、`SpTimePicker`、`SpSliderCaptcha`、`SpBatchImportModal`
- **`BizDetailHost` 本来就规范**
- **`_composables` / `_utils`** 以下划线开头的私有目录，不进命名体系

## 7. 怎么检查

```bash
# 目录名与主导出符号是否一致（新增组件时最容易破的规则）
ls src/components

# 有没有残留的旧引用
rg "components/(TableSelect|QueryGrid|DraftBox|IconBtn|map|wang-editor)" src

# 类型与模板引用是否正确（组件改名后必跑）
pnpm typecheck && pnpm build
```

## 8. 页面组件的 `name` 必须等于路由 `name`

这条不是风格问题，是**功能约束**。

`layout/components/Main/Main.vue` 的缓存写法是：

```vue
<keep-alive :include="keepAliveComp">
  <component :is="Component" :key="route.fullPath" />
</keep-alive>
```

`keepAliveComp` 里装的是**路由 name**（`initKeepAliveComp` 从 `to.name` 取），而 `<KeepAlive :include>` 匹配的是**组件自己的 name**。两者不相等 → 该页面永远不进缓存，切换页签时状态全丢，而且不会报任何错。

命名规则：

| 页面文件 | 组件 name |
| --- | --- |
| `<域>/<模块>/index.vue` | 路由 `name`，如 `AccessMember` |
| `<域>/<模块>/detail.vue` | `路由 name + Detail`，如 `AccessMemberDetail` |
| `<域>/<模块>/CodeModal.vue` | `路由 name + CodeModal`，如 `AccessGrantCodeModal` |

没有 `<script setup>` 之外选项的页面，用 `defineOptions({ name })` 声明；已有 `export default { name }` 的页面，直接改字符串。

新增页面时最容易漏这条——**页面能打开、能查询，只是缓存悄悄失效**。

## 9. 已清理的无引用组件

`Tag`、`Password`、`Paragraph`、`ImageGroup`、`CountTo`、`CheckCard`、`SpRichTextEditor`
（原 `wang-editor`）在命名归位之后仍然没有任何页面引用，已连同 `@wangeditor/*` 依赖
与打包分块配置一并移除。

判据是「全仓 PascalCase 与 kebab-case 都不出现，且不在全局注册表里」——只靠 import
语句判断会漏掉模板里以 kebab-case 使用、或由 `unplugin-vue-components` 自动注册的情况。

另有 `views/access/room/`（路由已注释停用）与 `BizDetailHost` 里的 `pense_*` / `trade_*` / `organ_*` 业务键仍是旧域命名——前者是死代码，后者是运行时事件契约（改动需同步所有派发方），暂未动。
