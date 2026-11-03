# 隐藏路由必须设置 activePath

> `hidden: true` 的路由必须在 meta 中设置 `activePath`，避免侧边栏高亮警告

---
tags: [vue, router, sidebar]
severity: medium
files: [src/router/modules/*.ts]
created: 2025-03-31
updated: 2025-03-31
---

## 场景

创建不在侧边栏菜单显示的页面（如消息中心、个人中心等）。

## ❌ 错误做法

```typescript
const routes: RouteRecordRaw[] = [
  {
    path: '/message/center',
    name: 'MessageCenter',
    meta: {
      title: '消息中心',
      hidden: true,  // 只设置 hidden
    },
    component: () => import('@/views/message/index.vue'),
  },
]
```

**问题**：
- 控制台警告：`This looks like a bug, please open an issue to report this problem`
- 侧边栏菜单高亮逻辑找不到匹配的 key

## ✅ 正确做法

```typescript
const routes: RouteRecordRaw[] = [
  {
    path: '/message/center',
    name: 'MessageCenter',
    meta: {
      title: '消息中心',
      hidden: true,
      activePath: '',  // 空字符串表示不高亮任何菜单
    },
    component: () => import('@/views/message/index.vue'),
  },
]
```

## activePath 设置规则

| 值 | 说明 |
|----|------|
| `''` (空字符串) | 不高亮任何侧边栏菜单 |
| `'/parent/path'` | 高亮指定的父菜单 |

## 相关代码

`src/layout/default.vue` 中的处理逻辑：

```typescript
// 处理高亮指定菜单 path（空字符串表示不高亮任何菜单）
if (route.meta?.activePath !== undefined) {
  activeKey.value = route.meta.activePath as string
  return
}
```

## 关键点

- **hidden 必须配合 activePath**：避免菜单高亮警告
- **空字符串有效**：`activePath: ''` 会提前 return，不会触发警告
- **检查判断条件**：确保使用 `!== undefined` 而非 truthy 检查
