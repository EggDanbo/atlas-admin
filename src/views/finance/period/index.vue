<script setup lang="ts">
import { format } from 'date-fns'
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { period as api } from '@/service/api/finance'
import { subject as contentApi } from '@/service/api/masterdata'
import toast from '@/utils/toast'

async function getLastDate() {
  const { isSuccess, data } = await contentApi.getLast()
  if (isSuccess) {
    queryModel.year = Number(data)
  }
}

onMounted(() => getLastDate())

function createQueryModel() {
  return {
    format: 'atlas/finance/period',
    year: null as number | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const {
  tableRef,
  pageLoading,
  queryModel,
  gridOptions,
} = useListPage<QueryModel>({
  api,
  detailRef: undefined,
  idField: 'id',
  createQueryModel,
  columns: [
    {
      isOperate: true,
      title: '操作',
      width: 180,
      align: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  gridOptions: {
    checkboxDisabled: true,
    pagination: false,
    immediate: false,
  },
  beforeFetch: (options) => {
    const year = options.year ? format(Number(options.year), 'yyyy') : null
    const params: any = { ...options, year }
    return params
  },
})

async function handleCopyBalance() {
  pageLoading.value = true
  const year = queryModel.year ? format(Number(queryModel.year), 'yyyy') : null
  const { isSuccess } = await api.copyBalance({ year })
    .finally(() => (pageLoading.value = false))
  if (!isSuccess)
    return
  toast.success('操作成功')
}

async function handleAuditExport() {
  pageLoading.value = true
  const year = queryModel.year ? format(Number(queryModel.year), 'yyyy') : null
  const { isSuccess } = await api.auditExport({ year })
    .finally(() => (pageLoading.value = false))
  if (!isSuccess)
    return
  toast.success('操作成功')
}

const rowMoreOptions = [
  { label: '重新编号', key: '重新编号' },
  { label: '末位补缺', key: '末位补缺' },
]

function handleRowMore(key: string, row: Recordable) {
  toast.infoModal(`确定对凭证号进行${key}吗？`, {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      pageLoading.value = true
      const { isSuccess } = await api.updateNo({ year: row.year, month: row.month, renumber: key === '重新编号' })
        .finally(() => pageLoading.value = false)
      if (!isSuccess)
        return
      toast.success('操作成功')
    },
  })
}

async function lookConfirm(row: Recordable) {
  pageLoading.value = true
  const { isSuccess } = await api.lookConfirm({ year: row.year, month: row.month })
    .finally(() => (pageLoading.value = false))
  if (!isSuccess)
    return
  toast.success('操作成功')
  await tableRef.value.refresh()
}

async function lookCancel(row: Recordable) {
  pageLoading.value = true
  const { isSuccess } = await api.lookCancel({ year: row.year, month: row.month })
    .finally(() => (pageLoading.value = false))
  if (!isSuccess)
    return
  toast.success('操作成功')
  await tableRef.value.refresh()
}

async function turnConfirm(row: Recordable) {
  pageLoading.value = true
  const { isSuccess } = await api.turnConfirm({ year: row.year, month: row.month })
    .finally(() => (pageLoading.value = false))
  if (!isSuccess)
    return
  toast.success('操作成功')
  await tableRef.value.refresh()
}

async function turnCancel(row: Recordable) {
  pageLoading.value = true
  const { isSuccess } = await api.turnCancel({ year: row.year, month: row.month })
    .finally(() => (pageLoading.value = false))
  if (!isSuccess)
    return
  toast.success('操作成功')
  await tableRef.value.refresh()
}

async function bookConfirm(row: Recordable) {
  pageLoading.value = true
  const { isSuccess } = await api.bookConfirm({ year: row.year, month: row.month })
    .finally(() => (pageLoading.value = false))
  if (!isSuccess)
    return
  toast.success('操作成功')
  await tableRef.value.refresh()
}

async function bookCancel(row: Recordable) {
  pageLoading.value = true
  const { isSuccess } = await api.bookCancel({ year: row.year, month: row.month })
    .finally(() => (pageLoading.value = false))
  if (!isSuccess)
    return
  toast.success('操作成功')
  await tableRef.value.refresh()
}
</script>

<script lang="ts">
export default { name: 'FinancePeriod' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="1">
            <n-date-picker
              v-model:value="queryModel.year"
              placeholder="期间"
              type="year"
              :year-range="[2008, new Date().getFullYear() + 1]"
            />
          </n-gi>
        </SpQueryGrid>
      </n-card>
      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-button-group>
              <n-button type="default" @click="handleCopyBalance">
                复制上年余额
              </n-button>
              <n-button type="default" @click="handleAuditExport">
                年审数据导出
              </n-button>
            </n-button-group>
          </template>

          <!-- 操作列 -->
          <template #operate="{ row }">
            <div class="flex items-center justify-center">
              <n-dropdown v-if="!row.look" trigger="hover" :options="rowMoreOptions" @select="(key: string) => handleRowMore(key, row)">
                <n-button text type="primary">
                  修改凭证号
                </n-button>
              </n-dropdown>
              <n-divider v-if="!row.look" vertical />
              <n-button
                v-if="!row.look"
                text
                type="primary"
                @click="lookConfirm(row)"
              >
                审核
              </n-button>
              <n-button
                v-if="row.look && !row.turn"
                text
                type="primary"
                @click="lookCancel(row)"
              >
                取消审核
              </n-button>
              <n-divider v-if="row.look && !row.turn" vertical />
              <n-button
                v-if="row.look && !row.turn"
                text
                type="primary"
                @click="turnConfirm(row)"
              >
                结转
              </n-button>
              <n-button
                v-if="!row.book && row.turn"
                text
                type="primary"
                @click="turnCancel(row)"
              >
                取消结转
              </n-button>
              <n-divider v-if="!row.book && row.turn" vertical />
              <n-button
                v-if="!row.book && row.turn"
                text
                type="primary"
                @click="bookConfirm(row)"
              >
                结账
              </n-button>
              <n-button
                v-if="row.book"
                text
                type="primary"
                @click="bookCancel(row)"
              >
                取消结账
              </n-button>
            </div>
          </template>
        </SpTable>
      </n-card>
    </n-flex>
  </NaPage>
</template>
