# API 调用规范

> 主业务 API 导入使用别名 `api`，其他 API 使用具体别名

---
tags: [api, request, import]
severity: high
files: [src/views/**/*.vue, src/views/**/*.ts]
created: 2025-03-31
updated: 2025-03-31
---

## 场景

在视图组件中调用后端 API 获取数据或执行操作。

## ❌ 错误做法

### 错误 1：使用 res 变量

```typescript
const res = await api.search({ ... })
if (!res.isSuccess) return
dataModel.value = res.data
```

### 错误 2：主业务 API 使用其他别名

```typescript
// ❌ 主业务使用了具体别名
import messageApi from '@/service/api/message'

// ❌ 主业务使用了 serviceApi
import serviceApi from '@/service/api/message'
```

### 错误 3：所有 API 都用 api 别名

```typescript
// ❌ 多个 API 都用 api 会冲突
import api from '@/service/api/message'
import api from '@/service/api/organ/user'  // 命名冲突！
```

## ✅ 正确做法

### 1. 主业务 API 使用别名 `api`

```typescript
// 消息中心页面 - 主业务是 message
import api from '@/service/api/message'
import { team as teamApi } from '@/service/api/organ'  // 其他 API 用具体别名

async function fetch() {
  const { isSuccess, data } = await api.search({  // ✅ 主业务用 api
    format: 'message/my',
    page: 1,
  })

  if (!isSuccess)
    return

  dataModel.value = data
}
```

### 2. 其他 API 使用具体别名

```typescript
// 用户管理页面 - 主业务是 user
import api from '@/service/api/organ/user'
import { role as roleApi } from '@/service/api/identity'  // ✅ 其他用具体别名
import { team as teamApi } from '@/service/api/organ'

async function loadRoles() {
  const { isSuccess, data } = await roleApi.list()  // ✅ 使用具体别名
  if (isSuccess)
    roleOptions.value = data
}
```

## 命名规则

| API 类型 | 导入别名 | 示例 |
|----------|----------|------|
| **当前页面主业务** | `api` | `import api from '@/service/api/message'` |
| **其他关联 API** | `xxxApi` | `import { team as teamApi } from '@/service/api/organ'` |

## 关键点

- **主业务用 `api`**：当前页面核心业务使用简洁的 `api` 别名
- **其他用 `xxxApi`**：关联的其他 API 使用具体业务名
- **必须解构**：使用 `{ isSuccess, data }` 而非 `res.isSuccess`
- **format 必填**：`SearchCondition` 类型要求 `format` 属性
