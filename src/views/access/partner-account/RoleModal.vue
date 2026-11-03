<script setup lang="ts">
import type { ModalInst } from '@/components/SpModal'
import { usePermission } from '@/hooks/permission/usePermission'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { external as api } from '@/service/api/identity'
import toast from '@/utils/toast'

const emit = defineEmits(['on-action'])

// 角色信息接口
interface RoleInfo {
  id: string
  name: string
  kind: string
  disabled: boolean
}

// 表单数据
const formData = reactive({
  roleList: [] as RoleInfo[],
  kindList: [] as DropDownItem[],
  accountId: '',
  title: '设置角色',
})

const modalRef = ref<ModalInst | null>(null)
const btnLoading = ref(false)
const roleIds = ref<string[]>([])

const { getPermission } = useTabbar()
const tabPermName = getPermission()

// 权限检查
const { hasPermission } = usePermission()
const hasPermSetRole = computed(() => hasPermission([`${tabPermName}_SET`]))

// 按类型获取角色列表
function getRoleListByKind(kind?: string) {
  return formData.roleList.filter((q: RoleInfo) => q.kind === kind)
}

// 打开弹窗
async function open(params: { id: string, title: string }) {
  formData.accountId = params.id
  formData.title = params.title

  // 加载角色列表
  await loadRoleList()

  // 获取账号已有角色
  const { isSuccess, data } = await api.account.getRole(params.id)
  if (isSuccess) {
    roleIds.value = data.map((m: Recordable) => m.id)
  }
  else {
    roleIds.value = []
  }

  modalRef.value?.open()
}

// 加载角色列表
async function loadRoleList() {
  const [kindRes, roleRes] = await Promise.all([
    api.account.getKind(),
    api.account.roleList(),
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
  const { isSuccess } = await api.account.updateRole({
    list: [formData.accountId],
    role: roleIds.value,
  }).finally(() => btnLoading.value = false)

  if (isSuccess) {
    toast.success('操作成功')
    modalRef.value?.close()
    emit('on-action', 'edit')
  }
}

defineExpose({ open })
</script>

<script lang="ts">
export default { name: 'AccessPartnerAccountRoleModal' }
</script>

<template>
  <SpModal ref="modalRef" width="900" height="680" :title="formData.title">
    <n-checkbox-group v-model:value="roleIds">
      <n-tabs type="line">
        <n-tab-pane
          v-for="item in formData.kindList"
          :key="item.value"
          :name="item.value ?? ''"
          :tab="item.label"
        >
          <n-grid :cols="24" :x-gap="24" :y-gap="16">
            <n-gi
              v-for="role in getRoleListByKind(item.value)"
              :key="role.id"
              :span="8"
            >
              <n-checkbox
                :value="role.id"
                :label="role.name"
                :disabled="role.disabled"
              />
            </n-gi>
          </n-grid>
        </n-tab-pane>
      </n-tabs>
    </n-checkbox-group>

    <template #footer>
      <n-flex justify="end">
        <n-button @click="modalRef?.close">
          关闭
        </n-button>
        <n-button
          type="primary"
          :disabled="!hasPermSetRole"
          :loading="btnLoading"
          @click="handleSubmit"
        >
          保存
        </n-button>
      </n-flex>
    </template>
  </SpModal>
</template>
