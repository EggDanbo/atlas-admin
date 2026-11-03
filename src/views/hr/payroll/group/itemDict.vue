<script setup lang="ts">
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { useListPage } from '@/hooks/list'
import { groupItem as api } from '@/service/api/hr/payroll'
import { payrollItem as salaryApi } from '@/service/api/masterdata'
import toast from '@/utils/toast'

const emit = defineEmits(['on-action'])

const detailRef = ref<OpenModal | null>(null)
const modalRef = ref<ModalInst | null>(null)

function createQueryModel() {
  return {
    format: 'atlas/masterdata/payroll-item',
    group_id: null as string | null,
    month: null as number | null,
    filter: null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const {
  tableRef,
  pageLoading,
  queryModel,
  gridOptions,
} = useListPage<QueryModel>({
  api: {
    search: data => salaryApi.list({ ...data }),
  },
  detailRef,
  idField: 'id',
  createQueryModel,
  columns: [],
})

function open(params: { month: number, group_id: string }) {
  queryModel.group_id = params.group_id
  queryModel.month = params.month
  modalRef.value?.open()
}

async function submit() {
  const rows = tableRef.value.getCheckboxRows()
  if (rows.length === 0) {
    toast.info('请选数据行')
    return
  }
  pageLoading.value = true
  const { isSuccess } = await api.create({
    group_id: queryModel.group_id,
    month: queryModel.month,
    dict_list: rows.map(m => m.id),
  }).finally(() => pageLoading.value = false)
  if (isSuccess) {
    toast.success('操作成功')
    modalRef.value?.close()
    emit('on-action')
  }
}

defineExpose({ open })
</script>

<script lang="ts">
export default { name: 'HrPayrollGroupItemDict' }
</script>

<template>
  <SpModal ref="modalRef" width="900" height="680" :mask="true" title="设置字典">
    <NaPage :loading="pageLoading">
      <SpTable ref="tableRef" v-bind="gridOptions" />
    </NaPage>

    <template #footer>
      <n-flex justify="end">
        <n-button @click="modalRef?.close">
          关闭
        </n-button>
        <n-button type="primary" @click="submit">
          提交
        </n-button>
      </n-flex>
    </template>
  </SpModal>
</template>
