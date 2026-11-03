# SpQueryGrid 使用规范

> 查询条件布局组件，用于统一筛选条件的排列和响应式处理

---
tags: [vue, querygrid, layout, style]
severity: medium
files: [src/views/**/index.vue]
created: 2025-03-31
updated: 2025-03-31
---

## 场景

列表页面顶部的筛选条件布局。

## ❌ 错误做法

### 错误 1：组件设置固定宽度

```vue
<SpQueryGrid>
  <n-gi>
    <n-date-picker style="width: 250px" />  <!-- ❌ 不要设置固定宽度 -->
  </n-gi>
  <n-gi>
    <n-select style="width: 100px" />  <!-- ❌ 不要设置固定宽度 -->
  </n-gi>
</SpQueryGrid>
```

### 错误 2：按钮放在 SpQueryGrid 内部

```vue
<SpQueryGrid>
  <n-gi>
    <n-button type="primary" @click="handleSearch">查询</n-button>  <!-- ❌ -->
    <n-button @click="openModal">新增</n-button>  <!-- ❌ -->
  </n-gi>
  <n-gi>
    <n-input v-model:value="filter.name" />
  </n-gi>
</SpQueryGrid>
```

## ✅ 正确做法

### 1. 组件不设宽度，用 span 控制

```vue
<SpQueryGrid :cols="24" :show-fold="false">
  <n-gi span="6">
    <n-date-picker v-model:value="filter.date" />  <!-- ✅ 自适应宽度 -->
  </n-gi>
  <n-gi span="3">
    <n-select v-model:value="filter.status" />  <!-- ✅ 较窄的组件用小 span -->
  </n-gi>
  <n-gi span="4">
    <n-input v-model:value="filter.name" />
  </n-gi>
</SpQueryGrid>
```

### 2. 按钮放在 n-card header 中

```vue
<n-card :bordered="false">
  <template #header>
    <n-flex justify="space-between" align="center">
      <n-space>
        <n-button type="primary" @click="handleSearch">查询</n-button>
        <n-button @click="openModal">新增</n-button>
      </n-space>
      <n-pagination ... />
    </n-flex>
  </template>

  <!-- 内容区域 -->
</n-card>
```

## 常用属性

| 属性 | 说明 | 常用值 |
|------|------|--------|
| `:cols` | 总列数 | `24` |
| `:show-fold` | 是否显示折叠按钮 | `false` |
| `:collapsed-rows` | 折叠时显示行数 | `1` |

## span 分配建议

| 组件类型 | 建议 span | 说明 |
|----------|----------|------|
| 日期范围选择 | 6 | 较宽 |
| 普通下拉框 | 3 | 较窄 |
| 输入框 | 4 | 中等 |
| 级联选择 | 5 | 较宽 |

## 关键点

- **不设固定宽度**：组件自适应 `n-gi` 容器
- **用 span 控制比例**：通过 `:span` 调整组件宽度
- **按钮不放内部**：按钮放在 `n-card` header 或 `SpTable` toolbarLeftBtn
- **关闭折叠**：简单查询使用 `:show-fold="false"`
