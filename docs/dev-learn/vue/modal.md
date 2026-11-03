# 弹窗组件规范

> 每次打开弹窗时重置表单状态

## 1. 弹窗打开时重置表单验证状态

> 打开弹窗时不仅要清空表单值，还要调用 restoreValidation() 清除验证错误

---
tags: [vue, modal, form]
severity: medium
files: [src/views/**/*Modal.vue]
created: 2025-03-30
updated: 2025-03-30
---

### 场景

所有表单弹窗，特别是有验证规则的弹窗。

### ❌ 错误做法

只清空表单值，不清除验证状态。下次打开时会显示上次的验证错误。

```vue
<script setup lang="ts">
function open(params: { userIds: string[] }) {
  userIds.value = params.userIds
  formModel.pass1 = ''
  formModel.pass2 = ''
  // ❌ 忘记重置验证状态
  modalRef.value?.open()
}
</script>
```

**问题**：如果上次表单验证失败后关闭弹窗，下次打开时红色错误提示仍然显示。

### ✅ 正确做法

同时清空表单值和验证状态。

```vue
<script setup lang="ts">
function open(params: { userIds: string[] }) {
  userIds.value = params.userIds
  formModel.pass1 = ''
  formModel.pass2 = ''
  formRef.value?.restoreValidation()  // ✅ 清除验证状态
  modalRef.value?.open()
}
</script>
```

### 关键点

- `formRef.value?.restoreValidation()` 清除表单验证错误
- 在设置表单值之后、打开弹窗之前调用
- 使用可选链 `?.` 避免 formRef 未挂载时报错

---
*记录时间: 2025-03-30 | 场景: src/views/permit/user/PassModal.vue*

---

## 2. usePermission 的正确用法

> usePermission() 返回的是对象，包含 hasPermission 方法，不接受参数

---
tags: [vue, permission]
severity: high
files: [src/**]
created: 2025-03-30
updated: 2025-03-30
---

### 场景

需要检查用户权限时。

### ❌ 错误做法

```vue
<script setup lang="ts">
// ❌ 错误：usePermission 不接受参数
const hasPerm = usePermission('PERMISSION_SET')
</script>
```

### ✅ 正确做法

```vue
<script setup lang="ts">
// ✅ 正确：解构获取 hasPermission 方法
const { hasPermission } = usePermission()

// 使用 computed 或直接调用
const hasPerm = computed(() => hasPermission(['PERMISSION_SET']))

// 或在函数中调用
function checkPerm() {
  return hasPermission(['PERMISSION_SET'])
}
</script>
```

### 关键点

- `usePermission()` 返回 `{ hasPermission, hasEveryPermission, hasSomePermission }`
- `hasPermission()` 接受字符串数组
- 支持前缀匹配：`hasPermission(['ORGAN'])` 对 `ORGAN_ADD` 也返回 true

---
*记录时间: 2025-03-30 | 场景: src/views/permit/user/RoleModal.vue*

## 相关记录

- [useDetail 不适用弹窗](hooks.md)
