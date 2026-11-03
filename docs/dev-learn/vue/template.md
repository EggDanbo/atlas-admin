# Vue 模板必须单根节点

> `<template>` 中只能有一个根元素，多个元素需要用 `<div>` 包裹

---
tags: [vue, template, transition]
severity: high
files: [src/views/**/*.vue]
created: 2025-03-31
updated: 2025-03-31
---

## 场景

页面组件使用 `<Transition>` 包裹进行路由切换动画时，如果模板有多个根节点会触发警告。

## ❌ 错误做法

```vue
<template>
  <!-- 多个根节点 -->
  <n-card>...</n-card>
  <SpModal ref="modalRef">...</SpModal>
</template>
```

**问题**：
- Vue 警告：`Component inside <Transition> renders non-element root node that cannot be animated.`
- 路由切换动画失效

## ✅ 正确做法

```vue
<template>
  <!-- 单一根节点包裹 -->
  <div>
    <n-card>...</n-card>
    <SpModal ref="modalRef">...</SpModal>
  </div>
</template>
```

## 关键点

- **单一根节点**：模板必须有且只有一个根元素
- **弹窗组件**：`SpModal`、`n-modal` 等也需要放在根元素内
- **布局组件**：使用 `<div>` 或 `<n-flex>` 包裹所有内容
