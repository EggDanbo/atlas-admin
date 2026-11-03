# CLAUDE.md

> AI 助手项目上下文配置 - 定义代码生成规范与约束

## Role

你是一位精通 Vue 3 Composition API + TypeScript + Naive UI 的高级前端工程师，熟悉企业级后台管理系统开发模式。

## Tech Stack

| 类别 | 技术          | 版本   | 用法                                     |
| ---- | ------------- | ------ | ---------------------------------------- |
| 框架 | Vue           | 3.5.x  | Composition API + `<script setup>`       |
| 语言 | TypeScript    | 6.0.x  | 严格模式，禁用 `any`                     |
| 构建 | Vite          | 8.0.x  | ES Module                                |
| UI   | Naive UI      | 2.44.x | 按需自动导入                             |
| 状态 | Pinia         | 3.0.x  | 持久化插件 `pinia-plugin-persistedstate` |
| 路由 | Vue Router    | 5.0.x  | 动态路由 + 权限守卫                      |
| HTTP | Alova         | 3.5.x  | **必须使用**，禁止 fetch/axios           |
| 样式 | UnoCSS + Less | -      | 原子类优先                               |
| 表格 | VXE Table     | 4.18.x | 高级表格场景                             |
| 日期 | date-fns      | 4.1.x  | **必须使用**，禁止 moment.js             |
| 工具 | lodash-es     | 4.17.x | ESM 版本                                 |

## Project Structure

```
src/
├── components/          # 业务组件（PascalCase 目录）
│   └── ComponentName/
│       ├── index.ts        # 导出入口
│       └── src/
│           ├── ComponentName.vue
│           ├── props.ts
│           └── types/
├── views/               # 页面（lowercase 目录，camelCase 文件）
│   └── module/
│       ├── index.vue       # 列表页
│       ├── detail.vue      # 详情/编辑页
│       └── columns.ts      # 表格列配置
├── hooks/               # 组合式函数（核心业务逻辑）
│   ├── list/useListPage.ts # 列表页通用 Hook
│   ├── detail/useDetail.ts # 详情页通用 Hook
│   └── naiveui/           # Naive UI 上下文钩子
├── store/modules/       # Pinia Store（持久化）
├── service/
│   ├── http/             # Alova 实例配置
│   └── api/{module}/     # API 接口定义
├── utils/               # 工具函数
│   ├── index.ts          # 通用工具
│   ├── Storage.ts        # 本地存储封装
│   ├── dateUtil.ts       # 日期处理
│   ├── toast.ts          # 消息提示
│   └── is/index.ts       # 类型判断
├── config/index.ts      # 全局配置
└── styles/var.less      # Less 变量
```

## Development Rules

### 必须使用

```typescript
// 日期处理 - 使用 date-fns
import { addDays, format } from "date-fns";

// HTTP 请求 - 使用 Alova
import { request } from "@/service/http";
import { formatToDate, formatToDateTime } from "@/utils/dateUtil";

// 类型判断 - 使用封装
import { isArray, isNumber, isString } from "@/utils/is";

// 本地存储 - 使用封装
import { storage } from "@/utils/Storage";

// 消息提示 - 使用封装
import toast from "@/utils/toast";

request.Get<T>("/api/path", { params });
request.Post<T>("/api/path", data);
storage.set(key, value);
storage.get(key);
toast.success(message);
toast.error(message);
toast.infoModal(content);
```

### 禁止事项

- **禁止** 使用 `any` 类型，使用具体类型或泛型
- **禁止** 使用原生 `fetch` 或 `axios`，必须使用 `@/service/http`
- **禁止** 使用 `moment.js`，必须使用 `date-fns`
- **禁止** 直接操作 DOM，使用 Vue 响应式或 `ref`
- **禁止** 使用 `@ts-ignore`、`as any` 等类型绕过
- **禁止** 未经请求的重构或"优化"
- **禁止** 在未解决根本原因时使用 `skip`、`disable`

### 组件规范

```vue
<!-- 组件文件结构：script -> template -> style -->
<script lang="ts" setup>
import type { PropsType } from "./types";
import { basicProps } from "./props";

const props = defineProps({ ...basicProps });
const emit = defineEmits(["update:value", "change"]);
</script>

<template>
  <!-- 模板内容 -->
</template>

<style lang="less" scoped>
/* 样式内容 */
</style>
```

### 组件命名前缀

| 前缀 | 含义                 | 示例                               |
| ---- | -------------------- | ---------------------------------- |
| `Na` | Naive UI 风格封装    | `NaSelect`, `NaCheckbox`, `NaIcon` |
| `Sp` | 超级组件（完整功能） | `SpTable`, `SpSearch`, `SpModal`   |

### 全局组件（无需导入）

`NaPage`, `NaAuthority`, `NaIcon`, `Icon`, `SpTable`, `SpModal`, `SpSearch`

### 命名规范

| 类型       | 规范             | 示例               |
| ---------- | ---------------- | ------------------ |
| 组件目录   | PascalCase       | `FormTable`        |
| 组件文件   | PascalCase       | `Table.vue`        |
| 页面目录   | lowercase        | `organ`, `system`  |
| 页面文件   | camelCase        | `accessView.vue`   |
| 工具文件   | camelCase        | `dateUtil.ts`      |
| Store 文件 | camelCase        | `async-route.ts`   |
| 常量       | UPPER_SNAKE_CASE | `ERROR_ROUTE_NAME` |

### 样式规范

- 优先使用 UnoCSS 原子类
- 组件样式使用 Less + `scoped`
- 全局变量在 `@/styles/var.less`
- 主题色：`@primaryColor: #2d8cf0`

## Key Hooks

### useListPage - 列表页通用 Hook

```typescript
import { useListPage } from '@/hooks/list'

const {
  tableRef,       // 表格引用
  queryModel,     // 查询模型
  gridOptions,    // 表格配置
  handleEdit,     // 编辑处理
  handleExportOrPrint,  // 导出/打印
  hasPermAdd,     // 新增权限
  hasPermEdit,    // 编辑权限
} = useListPage<QueryModel>({
  api: { search, export, print },
  detailRef,
  createQueryModel: () => ({ format: 'module/name', ... }),
  columns: [...],
  idField: 'id',  // 支持嵌套 'role.id'
})
```

### useDetail - 详情页通用 Hook

```typescript
import { useDetail } from "@/hooks/detail";

const {
  formModel, // 表单模型
  formRef, // 表单引用
  modalRef, // 弹窗引用
  isEdit, // 是否编辑模式
  submit, // 提交方法
  exposed, // 暴露方法 { open }
} = useDetail({
  api: { get, create, update },
  createFormModel: () => ({ id: "", name: "" }),
  permission: { useTabPermission: true },
  onSuccess: (action) => emit("on-action", action),
});

// 调用
detailRef.value?.open({ id: "1", opt: "edit" });
```

## API 规范

```typescript
// service/api/module/name.ts
import { request } from "@/service/http";

export default {
  list: (data: Recordable) =>
    request.Post<Service.ResultPage<T>>("module/list", data),
  get: (id: string) =>
    request.Get<Service.Result<T>>("module/get", { params: { id } }),
  create: (data: T) =>
    request.Post<Service.Result<string>>("module/create", data),
  update: (data: T) => request.Post<Service.Response>("module/update", data),
  delete: (data: Recordable) =>
    request.Post<Service.Response>("module/delete", data),
};
```

### 响应类型

```typescript
interface Service.Result<T> {
  isSuccess: boolean
  data: T
}
interface Service.ResultPage<T> {
  isSuccess: boolean
  data: { rows: T[], total: number }
}
```

## Key Commands

```bash
pnpm run host          # 开发服务器（host 模式）
pnpm run build         # 生产构建
pnpm run build:test    # 测试环境构建
pnpm run lint          # ESLint 检查
pnpm run lint:fix      # 自动修复
pnpm run tsc:app       # 类型检查
pnpm run icons:all     # 扫描并生成离线图标
```

## ESLint 配置

- 使用 `@antfu/eslint-config`
- 单引号，2 空格缩进
- Vue 文件顺序：`script` → `template` → `style`
- 格式化：`pnpm run lint:fix`

## Store 规范

```typescript
// store/modules/example.ts
import { defineStore } from "pinia";

export const useExampleStore = defineStore("example-store", {
  state: () => ({ data: [] }),
  getters: {
    getData: (state) => state.data,
  },
  actions: {
    async fetchData() {
      /* ... */
    },
  },
});
// 自动持久化到 sessionStorage
```

### 已有 Store

| ID                  | 用途               |
| ------------------- | ------------------ |
| `user-store`        | 用户信息、登录状态 |
| `theme-store`       | 主题配置           |
| `async-route-store` | 动态路由           |
| `config-store`      | 应用配置           |
| `tabbar-store`      | 标签页状态         |
| `enums-store`       | 枚举字典           |

## 开发规范

编码前请查阅 `docs/dev-learn/` 目录下的规范记录，避免重复犯错。

- 使用 `/dev-learn` 查看所有规范
- 使用 `/dev-learn 记录规范：[问题描述]` 添加新记录

## 图标规范

**必须使用免费开源图标**，禁止使用商业授权图标或许可证不兼容的图标。

### 推荐图标库（MIT/Apache 2.0 许可）

| 图标库                | 许可证     | 前缀          | 说明                                       |
| --------------------- | ---------- | ------------- | ------------------------------------------ |
| Ant Design Icons      | MIT        | `ant-design:` | **首选**，风格统一，优先使用 outlined 后缀 |
| Remix Icon            | Apache 2.0 | `ri:`         | 丰富全面                                   |
| MingCute              | MIT        | `mingcute:`   | 精致美观                                   |
| Material Design Icons | Apache 2.0 | `mdi:`        | Google 官方                                |
| Tabler Icons          | MIT        | `tabler:`     | 简洁现代                                   |

### 禁止使用的图标库

| 图标库               | 前缀          | 原因                  | 替代方案                                                            |
| -------------------- | ------------- | --------------------- | ------------------------------------------------------------------- |
| Gridicons            | `gridicons:`  | GPL v2 许可，有传染性 | `ant-design:question-circle-outlined`, `ant-design:filter-outlined` |
| Solar Icons          | `solar:`      | CC BY 4.0，需署名     | `ant-design:down-outlined`, `ant-design:up-outlined` 等             |
| Font Awesome 6 Solid | `fa6-solid:`  | 需署名                | `ant-design:moon-outlined`                                          |
| Streamline           | `streamline:` | 有项目限制            | `ant-design:bg-colors-outlined`                                     |
| Stash Icons          | `stash:`      | 许可证待确认          | `ant-design:search-outlined`                                        |

### 使用示例

```typescript
// ✅ 正确 - 开源图标（优先 outlined 风格）
icon: "ant-design:team-outlined";
icon: "ant-design:question-circle-outlined";
icon: "ri:user-line";
icon: "mingcute:dashboard-2-line";

// ❌ 禁止 - GPL/商业/需署名图标
icon: "gridicons:help-outline"; // GPL v2 许可
icon: "solar:alt-arrow-down-outline"; // CC BY 4.0 需署名
icon: "fa6-solid:moon"; // 需署名
icon: "fluent:people-24-filled"; // Fluent UI 部分需付费
```

### 图标生成

```bash
pnpm run icons:all  # 扫描项目并生成离线图标
```

> 详细许可证审查报告见 `docs/icon-license-audit.md`
