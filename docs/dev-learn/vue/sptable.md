# SpTable 方法使用规范

> 重置筛选条件用 reloadData 或 resetData，不要用 reload

---
tags: [vue, table, sptable]
severity: medium
files: [src/views/**/*.vue]
created: 2025-03-31
updated: 2025-03-31
---

## 场景

使用 SpTable 组件时，需要重置筛选条件并重新加载数据。

## 方法对比

| 方法 | 作用 | 是否请求接口 |
|------|------|-------------|
| `reloadData()` | 清空条件 + 重新请求 | ✅ 是 |
| `resetData()` | 调用 resetData 回调 + 重新请求 | ✅ 是 |
| `reload()` | 刷新当前数据 | ❌ 否 |
| `fetch()` | 请求接口 | ✅ 是 |
| `refresh()` | 刷新当前页 | ✅ 是 |

## ❌ 错误做法

重置条件时使用 `reload()`，实际上不会重新请求接口。

```vue
<script setup lang="ts">
function handleReset() {
  Object.assign(queryModel, createQueryModel())
  tableRef.value.reload()  // ❌ 不会重新请求
}
</script>
```

## ✅ 正确做法

### 方式一：使用 reloadData

```vue
<script setup lang="ts">
function handleReset() {
  Object.assign(queryModel, createQueryModel())
  tableRef.value.reloadData()  // ✅ 清空条件并重新请求
}
</script>
```

### 方式二：使用 resetData（推荐）

在 gridOptions 中定义 resetData 回调：

```vue
<script setup lang="ts">
const gridOptions = reactive<TableProps>({
  columns: unref(columnsRef),
  async fetchData(params) {
    const { isSuccess, data } = await api.getList({ ...params, ...queryModel })
    if (!isSuccess) return []
    return data
  },
  resetData: () => Object.assign(queryModel, createQueryModel()),  // ✅ 定义重置回调
})

function handleReset() {
  tableRef.value.resetData()  // ✅ 自动调用 resetData 回调 + reloadData
}
</script>
```

### 方式三：使用 fetch

```vue
<script setup lang="ts">
function handleReset() {
  Object.assign(queryModel, createQueryModel())
  tableRef.value.fetch({ page: 1 })  // ✅ 从第一页重新请求
}
</script>
```

## 各方法详解

### reloadData()
```ts
function reloadData() {
  clear()           // 清空数据和排序
  advSearch.clear() // 清空高级搜索条件
  return fetch({ page: 1 })  // 从第一页重新请求
}
```
- 清空表格数据和排序状态
- 清空高级搜索条件
- 从第一页重新请求

### resetData()
```ts
function resetData() {
  const props = unref(getProps)
  if (props.resetData) {
    props.resetData()  // 调用外部定义的重置回调
  }
  return reloadData()
}
```
- 先调用 props.resetData 回调重置查询模型
- 然后调用 reloadData 重新请求

### reload()
```ts
function reload() {
  clearCheckBox()
  tableElRef.value.reloadData(getDataSourceRef.value)  // 刷新当前数据
}
```
- 只清空复选框
- 刷新当前数据展示（不请求接口）
- 用于本地数据变化后刷新视图

### fetch()
```ts
function fetch(opt?: FetchParams) {
  clearCheckBox()
  return fetchData(opt)  // 请求接口
}
```
- 清空复选框
- 请求接口获取新数据

## 关键点

- **重置条件** → 用 `resetData()` 或 `reloadData()`
- **刷新当前页** → 用 `fetch()` 或 `refresh()`
- **本地数据变化刷新视图** → 用 `reload()`
- 推荐在 gridOptions 中定义 `resetData` 回调

---
*记录时间: 2025-03-31 | 场景: src/views/system/usergrid/index.vue*

---

## 2. SpTable 默认按钮规范

> SpTable 默认自带查询和重置按钮，无需在 toolbarLeftBtn 中重复定义

---
tags: [vue, table, sptable]
severity: low
files: [src/views/**/*.vue]
created: 2025-03-31
updated: 2025-03-31
---

## 场景

使用 SpTable 组件时，页面需要查询和重置功能。

## 默认行为

SpTable 默认配置：
- `showQueryBtn: true` - 显示查询按钮，调用 `search()` → `fetch({ page: 1 })`
- `showResetBtn: true` - 显示重置按钮，调用 `resetData()`

## ❌ 错误做法

在 `toolbarLeftBtn` 中重复定义查询和重置按钮。

```vue
<template>
  <SpTable v-bind="gridOptions">
    <template #toolbarLeftBtn>
      <!-- ❌ 重复定义，SpTable 已经自带了 -->
      <n-button type="primary" @click="handleSearch">查询</n-button>
      <n-button @click="handleReset">重置</n-button>
    </template>
  </SpTable>
</template>

<script setup lang="ts">
function handleSearch() {
  tableRef.value.fetch()
}

function handleReset() {
  Object.assign(queryModel, createQueryModel())
  tableRef.value.fetch()
}
</script>
```

**问题**：页面上会出现两组查询/重置按钮。

## ✅ 正确做法

只需在 `gridOptions` 中定义 `fetchData` 和 `resetData`，SpTable 会自动处理。

```vue
<template>
  <SpTable v-bind="gridOptions">
    <template #toolbarLeftBtn>
      <!-- ✅ 只放其他操作按钮 -->
      <n-button @click="handleExport">导出</n-button>
      <n-button @click="handleBatchDelete">批量删除</n-button>
    </template>
  </SpTable>
</template>

<script setup lang="ts">
const gridOptions = reactive<TableProps>({
  columns: unref(columnsRef),

  // ✅ 定义数据获取方法，查询按钮会自动调用
  async fetchData(params) {
    const { isSuccess, data } = await api.getList({ ...params, ...queryModel })
    if (!isSuccess) return []
    return data
  },

  // ✅ 定义重置回调，重置按钮会自动调用
  resetData: () => Object.assign(queryModel, createQueryModel()),
})
</script>
```

## 隐藏默认按钮

如果不需要默认按钮，可以关闭：

```vue
<SpTable
  v-bind="gridOptions"
  :show-query-btn="false"
  :show-reset-btn="false"
>
  <template #toolbarLeftBtn>
    <!-- 自定义按钮 -->
  </template>
</SpTable>
```

## 关键点

- SpTable 默认 `showQueryBtn: true`，`showResetBtn: true`
- 查询按钮调用 `fetch({ page: 1 })`
- 重置按钮调用 `resetData()`（需要定义 resetData 回调）
- `toolbarLeftBtn` 只放其他操作按钮（新增、删除、导出等）

---
*记录时间: 2025-03-31*
