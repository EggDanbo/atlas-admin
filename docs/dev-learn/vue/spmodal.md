# SpModal 使用规范

> SpModal 的 @ok 回调中不要使用 toast 二次确认弹窗

---
tags: [vue, modal, spmodal]
severity: high
files: [src/views/**/*.vue]
created: 2025-03-31
updated: 2025-03-31
---

## 场景

使用 SpModal 组件时，需要在点击确定后执行异步操作。

## ❌ 错误做法

在 `@ok` 回调中使用 `toast.infoModal` 二次确认，导致 loading 状态无法正确关闭。

```vue
<script setup lang="ts">
async function handleSubmit({ done }) {
  // ❌ toast.infoModal 同步返回，handleSubmit 先返回
  // done 在异步回调中调用，loading 无法正确控制
  toast.infoModal('确定删除吗？', {
    onPositiveClick: async () => {
      const { isSuccess } = await api.delete(data)
      if (!isSuccess) return done(false)
      done(true)
    },
  })
}
</script>

<template>
  <SpModal @ok="handleSubmit">
    <!-- 内容 -->
  </SpModal>
</template>
```

**问题**：
1. `toast.infoModal` 是同步返回的
2. `handleSubmit` 函数先返回，此时 `done` 还没被调用
3. SpModal 的 loading 状态无法正确关闭

## ✅ 正确做法

直接在 `@ok` 回调中执行操作，SpModal 本身就是确认操作。

```vue
<script setup lang="ts">
async function handleSubmit({ done }) {
  const { isSuccess } = await api.delete(data)
  if (!isSuccess) return done(false)
  done(true)
  toast.success('操作成功')
}
</script>

<template>
  <SpModal @ok="handleSubmit">
    <!-- 内容 -->
  </SpModal>
</template>
```

如果确实需要二次确认，应该在打开 SpModal 之前确认：

```vue
<script setup lang="ts">
function handleOpenBatchModal() {
  toast.infoModal('确定删除吗？', {
    onPositiveClick: () => {
      batchModalRef.value?.open()
    },
  })
}
</script>

<template>
  <n-button @click="handleOpenBatchModal">批量删除</n-button>
  <SpModal ref="batchModalRef" @ok="handleSubmit">
    <!-- 内容 -->
  </SpModal>
</template>
```

## 关键点

- SpModal 的 `@ok` 回调接收 `{ done, fail }` 参数
- 必须调用 `done(true/false)` 或 `fail()` 来关闭 loading
- 不要在 `@ok` 回调中使用同步返回的确认弹窗
- 如需二次确认，在打开 SpModal 之前进行

---
*记录时间: 2025-03-31 | 场景: src/views/system/usergrid/index.vue*

---

## 2. 弹窗按钮布局规范

> 弹窗 footer 按钮应统一靠右对齐

---
tags: [vue, modal, style]
severity: low
files: [src/views/**/*Modal.vue, src/views/**/view.vue]
created: 2025-03-31
updated: 2025-03-31
---

## 场景

所有弹窗组件的 footer 区域按钮布局。

## ❌ 错误做法

按钮分散在左右两侧。

```vue
<template #footer>
  <n-flex justify="space-between">
    <n-button type="primary">编辑</n-button>
    <n-flex>
      <n-button>关闭</n-button>
    </n-flex>
  </n-flex>
</template>
```

## ✅ 正确做法

所有按钮统一靠右对齐。

```vue
<template #footer>
  <n-flex justify="end">
    <n-button>关闭</n-button>
    <n-button type="primary">保存</n-button>
  </n-flex>
</template>
```

## 按钮顺序

从左到右：次要操作 → 主要操作

| 顺序 | 按钮 | 说明 |
|------|------|------|
| 1 | 关闭/取消 | 次要 |
| 2 | 编辑/取消编辑 | 次要 |
| 3 | 保存/确定 | 主要 |

---
*记录时间: 2025-03-31 | 场景: src/views/system/usergrid/view.vue*
