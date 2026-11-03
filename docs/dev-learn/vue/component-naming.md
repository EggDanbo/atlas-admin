# 模板组件命名与 import 的关系

> 当页面手动 import 了组件（如用于 h() 函数），ESLint 会自动将模板中的 kebab-case 转换为 PascalCase

---

tags: [vue, naive-ui, eslint, naming]
severity: low
files: [src/**/*.vue]
created: 2026-04-01
updated: 2026-04-01

---

## 场景

当 Vue 组件需要手动 import 组件用于 render 函数（如 `h(NButton, ...)`）时。

## 现象

模板中写 `<n-button>` 会被 ESLint 自动转换为 `<NButton>`

## ❌ 会触发转换

```vue
<script setup>
import { NButton } from 'naive-ui'

// 用于 h() 函数
h(NButton, { ... }, '按钮')
</script>

<template>
  <!-- ESLint 会自动转换为 <NButton> -->
  <n-button>按钮</n-button>
</template>
```

## ✅ 正确做法

当页面需要手动 import 组件时，模板中也使用 PascalCase

```vue
<script setup>
import { NButton } from 'naive-ui'

h(NButton, { ... }, '按钮')
</script>

<template>
  <NButton>按钮</NButton>
</template>
```

## ✅ 无 import 时

如果页面没有手动 import，模板使用 kebab-case

```vue
<script setup>
// 无 import NButton
</script>

<template>
  <n-button>按钮</n-button>
</template>
```

## 关键点

- ESLint 规则会检测已导入的组件，并在模板中统一命名
- `h()` 函数必须使用 PascalCase（如 `h(NButton, ...)`）
- 当需要 import 用于 `h()` 函数时，接受模板中使用 PascalCase
- 这是 ESLint 自动处理的约定，无需手动干预
