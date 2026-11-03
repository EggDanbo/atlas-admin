<script lang="ts" setup>
import type { ModalInst } from '@/components/SpModal'
import type { TableProps } from '@/components/SpTable'
import { SpCascader } from '@/components/SpCascader'
import { SpDateRange } from '@/components/SpDateRange'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { unit } from '@/service/api/access'
import { check as api } from '@/service/api/asset'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'

const emit = defineEmits(['confirm'])

const { getPermission } = useTabbar()
const tabPermName = getPermission()

const teamTreeOptions = ref<Recordable[]>([])
async function loadTeamTree() {
  const { isSuccess, data } = await unit.tree({
    permission: [tabPermName],
    tenant: tenantStorage.get(),
  })
  if (!isSuccess)
    return
  teamTreeOptions.value = data
}

const filterModel = ref<any>({
  format: 'atlas/asset/check/bill',
})

const tableRef = ref<any>(null)
const modalRef = ref<ModalInst | null>(null)
const createModalRef = ref<ModalInst | null>(null)
const btnLoading = ref<boolean>(false)

const teamId = ref<string | null>(null)

async function open(params: any) {
  filterModel.value = {
    ...filterModel.value,
    ...params,
    format: filterModel.value.format,
  }
  modalRef.value?.open()

  setTimeout(() => {
    tableRef.value.redoHeight()
    tableRef.value.fetch({ page: 1 })
  }, 0)
}

function close() {
  modalRef.value?.close()
}

async function fetchData(params: Recordable) {
  const { isSuccess, data } = await api.searchBill({
    ...params,
    ...filterModel.value,
  })
  if (!isSuccess)
    return []
  return data
}

const gridOptions = reactive<TableProps>({
  rowClassName: ({ row }) => {
    if (row.stoped) {
      return 'row-warning'
    }
    return null
  },
  dataFormat: filterModel.value.format,
  columns: [
    {
      isOperate: true,
      title: '操作',
      width: 120,
      align: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  fetchData,
  resizeHeightOffset: 140,
  showToolbarRight: false,
})

function handleSelected(row: Recordable) {
  modalRef.value?.close()
  emit('confirm', { value: row.id, label: row.no })
}

async function handleRemove(rows: Recordable) {
  const { isSuccess } = await api.deleteBill({
    id: rows.id,
  })
  if (!isSuccess)
    return
  toast.success('操作成功')
  createModalRef.value?.close()
  tableRef.value.refresh()
}

async function handleCreate() {
  await loadTeamTree()
  teamId.value = null
  createModalRef.value?.open()
}

async function create() {
  btnLoading.value = true
  const { isSuccess } = await api.createBill({
    team_id: teamId.value,
  }).finally(() => btnLoading.value = false)
  if (!isSuccess)
    return
  toast.success('操作成功')
  createModalRef.value?.close()
  tableRef.value.refresh()
}

defineExpose({ open, close })
</script>

<template>
  <SpModal
    ref="modalRef"
    title="盘点单列表"
    width="90vw"
    height="90vh"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <SpTable ref="tableRef" v-bind="gridOptions">
        <template #toolbarLeftBtn>
          <div style="width: 250px;">
            <SpDateRange v-model="filterModel.date" type="date" />
          </div>

          <n-button type="default" @click="handleCreate">
            <template #icon>
              <n-icon>
                <Icon icon="ant-design:plus-outlined" />
              </n-icon>
            </template>
            新增
          </n-button>
        </template>

        <template #operate="{ row }">
          <div class="flex items-center justify-center">
            <n-button text type="primary" @click="handleRemove(row)">
              删除
            </n-button>
            <n-divider vertical />
            <n-button text type="primary" @click="handleSelected(row)">
              选择
            </n-button>
          </div>
        </template>
      </SpTable>
    </template>

    <template #footer>
      <n-flex justify="end" align="center">
        <n-button @click="close">
          关闭
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <SpModal
    ref="createModalRef"
    title="新增盘点单"
    width="500"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <div class="w-full flex p-2">
        <SpCascader
          v-model:value="teamId"
          :options="teamTreeOptions"
          placeholder="请选择"
          value-field="id"
        />
      </div>
    </template>

    <template #footer>
      <n-space justify="end" align="center">
        <n-button @click="createModalRef?.close">
          关闭
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="create">
          新增
        </n-button>
      </n-space>
    </template>
  </SpModal>
</template>
