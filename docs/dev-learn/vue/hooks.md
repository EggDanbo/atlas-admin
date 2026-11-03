# useDetail 不适用于非标准弹窗

> 自定义弹窗场景不要使用 useDetail hook，直接用 ref + reactive

---
tags: [vue, hook, modal]
severity: medium
files: [src/views/**/*Modal.vue]
created: 2025-03-30
updated: 2025-03-30
---

## 场景

当弹窗需要同时加载多个数据源，或者不符合标准的"获取→编辑→保存"流程时。

典型场景：
- 角色设置弹窗（需要加载角色列表 + 用户已有角色）
- 批量操作弹窗（不需要获取详情）
- 数据选择弹窗（只做选择，不编辑）

## ❌ 错误做法

useDetail 的 open 会自动调用 api.get()，但角色设置场景不需要这个。

```vue
<script setup lang="ts">
const { hasPerm, formModel, submit } = useDetail({
  api: {
    create: (data) => api.updateRole(data),
    update: (data) => api.updateRole(data),
    get: () => Promise.resolve({ isSuccess: true, data: formModel }), // 多余
  },
  ...
})

// 重复定义 open 函数，与 useDetail 暴露的 open 冲突
async function open(params: OpenParams) {
  await loadRoleList()
  modalRef.value?.open()
}

defineExpose({ open })
</script>
```

**问题**：
1. `useDetail` 的 `open` 会调用 `api.get()`，这里完全不需要
2. 自定义 `open` 与 hook 暴露的方法重名，逻辑混乱
3. `formModel` 结构被 hook 限制，不够灵活

## ✅ 正确做法

不使用 useDetail，直接用 reactive + ref 管理状态。

```vue
<script setup lang="ts">
import type { ModalInst } from '@/components/SpModal'
import { usePermission } from '@/hooks/permission/usePermission'

const emit = defineEmits(['on-action'])

// 接口定义
interface RoleInfo {
  id: string
  name: string
  kind: number
  disabled: boolean
}

// 表单数据 - 直接用 reactive，更灵活
const formData = reactive({
  kindList: [] as DropDownItem[],
  roleList: [] as RoleInfo[],
  userIds: [] as string[],
  title: '设置角色',
})

// 状态管理 - 直接用 ref
const modalRef = ref<ModalInst | null>(null)
const btnLoading = ref(false)
const roleIds = ref<string[]>([])

// 权限检查 - 单独调用
const { hasPermission } = usePermission()
const hasPerm = computed(() => hasPermission(['_SET']))

// 按类型获取角色列表
function getRoleListByKind(kind: number) {
  return formData.roleList.filter((q: RoleInfo) => q.kind === kind)
}

// 打开弹窗 - 完全自定义逻辑
async function open(params: { userIds: string[], title: string }) {
  formData.userIds = params.userIds
  formData.title = params.title

  // 加载角色列表
  await loadRoleList()

  // 如果是单个用户，获取用户已有角色
  if (params.userIds.length === 1) {
    const { isSuccess, data } = await api.userPerm(params.userIds[0])
    if (isSuccess)
      roleIds.value = data.map((m: Recordable) => m.id)
    else
      roleIds.value = []
  }
  else {
    roleIds.value = []
  }

  modalRef.value?.open()
}

// 加载角色列表
async function loadRoleList() {
  const [kindRes, roleRes] = await Promise.all([
    roleApi.getKind(),
    api.roleList(),
  ])

  if (kindRes.isSuccess)
    formData.kindList = kindRes.data

  if (roleRes.isSuccess) {
    formData.roleList = roleRes.data.map((e: Recordable) => ({
      id: e.id,
      name: e.name,
      kind: e.kind,
      disabled: e.disabled,
    }))
  }
}

// 提交表单
async function handleSubmit() {
  btnLoading.value = true
  const { isSuccess } = await api.updateRole({
    list: formData.userIds,
    role: roleIds.value,
  }).finally(() => btnLoading.value = false)

  if (isSuccess) {
    toast.success('操作成功')
    modalRef.value?.close()
    emit('on-action', 'update')
  }
}

defineExpose({ open })
</script>
```

## 关键点

- **useDetail 适用场景**：标准 CRUD 详情页（获取→编辑→保存）
- **自定义弹窗场景**：用 `ref` + `reactive` 更灵活
- **不要重名**：避免与 hook 暴露的方法重名
- **权限独立**：`usePermission()` 返回对象，需要解构使用

## 相关记录

- [弹窗重置表单验证](modal.md)

---
*记录时间: 2025-03-30 | 场景: src/views/permit/user/RoleModal.vue*
