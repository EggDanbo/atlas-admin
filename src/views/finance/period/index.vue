<script setup lang="ts">
import { format } from 'date-fns'
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { period as api } from '@/service/api/finance'
import { subject as contentApi } from '@/service/api/masterdata'
import { resolvePeriodTimestamp } from '@/utils/dateUtil'
import toast from '@/utils/toast'

async function getLastDate() {
  const { isSuccess, data } = await contentApi.getLast()
  // 接口返回的是年份，选择器要时间戳，直接赋值会渲染成 1970
  if (isSuccess)
    queryModel.year = resolvePeriodTimestamp(data, 'year') ?? Date.now()
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
    // 按月结账的页面，只有年度看不出是哪一期，补上月份
    { field: 'year', title: '年度', width: 100, align: 'center' },
    { field: 'month', title: '月份', width: 80, align: 'center' },
    { field: 'isAudited', title: '审核状态', width: 110, align: 'center', slots: { default: 'isAudited' } },
    { field: 'isCarried', title: '结转状态', width: 110, align: 'center', slots: { default: 'isCarried' } },
    { field: 'isClosed', title: '结账状态', width: 110, align: 'center', slots: { default: 'isClosed' } },
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
export default { name: 'FinancePeriodClosing' }
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

          <!-- 状态列 -->
          <template #isAudited="{ row }">
            <n-tag :type="row.isAudited ? 'success' : 'default'" size="small" :bordered="false">
              {{ row.isAudited ? '已审核' : '待审核' }}
            </n-tag>
          </template>
          <template #isCarried="{ row }">
            <n-tag :type="row.isCarried ? 'success' : 'default'" size="small" :bordered="false">
              {{ row.isCarried ? '已结转' : '未结转' }}
            </n-tag>
          </template>
          <template #isClosed="{ row }">
            <n-tag :type="row.isClosed ? 'info' : 'default'" size="small" :bordered="false">
              {{ row.isClosed ? '已结账' : '未结账' }}
            </n-tag>
          </template>

          <!-- 操作列 -->
          <template #operate="{ row }">
            <div class="flex items-center justify-center">
              <n-dropdown v-if="!row.isAudited" trigger="hover" :options="rowMoreOptions" @select="(key: string) => handleRowMore(key, row)">
                <n-button text type="primary">
                  修改凭证号
                </n-button>
              </n-dropdown>
              <n-divider v-if="!row.isAudited" vertical />
              <n-button
                v-if="!row.isAudited"
                text
                type="primary"
                @click="lookConfirm(row)"
              >
                审核
              </n-button>
              <n-button
                v-if="row.isAudited && !row.isCarried"
                text
                type="primary"
                @click="lookCancel(row)"
              >
                取消审核
              </n-button>
              <n-divider v-if="row.isAudited && !row.isCarried" vertical />
              <n-button
                v-if="row.isAudited && !row.isCarried"
                text
                type="primary"
                @click="turnConfirm(row)"
              >
                结转
              </n-button>
              <n-button
                v-if="!row.isClosed && row.isCarried"
                text
                type="primary"
                @click="turnCancel(row)"
              >
                取消结转
              </n-button>
              <n-divider v-if="!row.isClosed && row.isCarried" vertical />
              <n-button
                v-if="!row.isClosed && row.isCarried"
                text
                type="primary"
                @click="bookConfirm(row)"
              >
                结账
              </n-button>
              <n-button
                v-if="row.isClosed"
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
