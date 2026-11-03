<script setup lang="ts">
import type { OpenModal } from '@/components/SpModal'
import { useListPage } from '@/hooks/list'
import { external as api } from '@/service/api/identity'
import toast from '@/utils/toast'
import Edit from './edit.vue'
import RoleModal from './RoleModal.vue'

const editModalRef = ref<OpenModal | null>(null)
const roleModalRef = ref<{ open: (params: { id: string, title: string }) => void } | null>(null)

function createQueryModel() {
  return { format: 'atlas/access/partner-account' }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const {
  tableRef,
  pageLoading,
  gridOptions,
  hasPermAdd,
  hasPermDele,
  editAction,
} = useListPage<QueryModel>({
  api: { search: api.account.search },
  detailRef: editModalRef,
  createQueryModel,
  columns: [
    {
      isOperate: true,
      title: '操作',
      width: 200,
      align: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  gridOptions: {
    dataFormat: 'access/partner-account',
    advSearchDisabled: false,
    showPageMode: true,
    pagination: true,
    showResetBtn: false,
  },
})

// 查看密钥
async function handleSecret(row: Recordable) {
  const { isSuccess, data } = await api.account.getSecret(row.id)
  if (isSuccess) {
    toast.infoModal(data, { title: '访问密钥' })
  }
}

// 编辑账号
function handleEdit(row: Recordable) {
  editModalRef.value?.open({
    id: row.id,
    description: row.description,
    title: `编辑[${row.description || row.id}]账号`,
    opt: row.id > 0 ? 'edit' : 'add',
  })
}

// 角色设置
function handleRole(row: Recordable) {
  roleModalRef.value?.open({
    id: row.id,
    title: `设置[${row.description || row.id}]角色`,
  })
}

// 角色设置成功后刷新
function handleRoleAction() {
  tableRef.value?.refresh()
}

// 删除
async function handleDelete(row: Recordable) {
  toast.infoModal('确定删除吗？', {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      pageLoading.value = true
      const { isSuccess } = await api.account.delete(row.id)
        .finally(() => pageLoading.value = false)
      if (isSuccess) {
        toast.success('操作成功')
        tableRef.value?.refresh()
      }
    },
  })
}
</script>

<script lang="ts">
export default { name: 'ExternalAccount' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions" @cell-dblclick="({ row }) => handleEdit(row)">
          <template #toolbarLeftBtn>
            <n-button :disabled="!hasPermAdd" type="default" @click="handleEdit({ id: '', description: '' })">
              <template #icon>
                <n-icon>
                  <Icon icon="ant-design:plus-outlined" />
                </n-icon>
              </template>
              新增
            </n-button>
          </template>
          <!-- 操作列 -->
          <template #operate="{ row }">
            <div class="flex items-center justify-center">
              <n-button text type="primary" @click="handleEdit(row)">
                查看
              </n-button>
              <n-divider vertical />
              <n-button text type="primary" @click="handleRole(row)">
                角色
              </n-button>
              <n-divider vertical />
              <n-button text type="primary" @click="handleSecret(row)">
                密钥
              </n-button>
              <n-divider vertical />
              <n-button text type="primary" :disabled="!hasPermDele" @click="handleDelete(row)">
                删除
              </n-button>
            </div>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <!-- 编辑弹窗 -->
    <Edit ref="editModalRef" @on-action="editAction" />
    <!-- 角色设置弹窗 -->
    <RoleModal ref="roleModalRef" @on-action="handleRoleAction" />
  </NaPage>
</template>
