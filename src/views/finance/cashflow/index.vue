<script setup lang="ts">
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { format } from 'date-fns'
import { LogBiz } from '@/components/BizLogs/Biz'
import { PdfSetting } from '@/components/BizPrint'
import { SpBatchImportModal } from '@/components/SpBatchImportModal'
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { cashflow as api } from '@/service/api/finance'
import { subject as contentApi } from '@/service/api/masterdata'
import { getMonthFirstAndLastDayTimestamp } from '@/utils/dateUtil'
import { createIcon } from '@/utils/iconify'
import toast from '@/utils/toast'
import detail from './detail.vue'

const detailRef = ref<OpenModal | null>(null)
const logBizRef = ref<OpenModal | null>(null)

const batchImportRef = ref<InstanceType<typeof SpBatchImportModal> | null>(null)
const checkFileUrl = ref<string | null>(null)
const checkFileMessage = ref<string | null>(null)

const btnLoading = ref(false)
const exportModalRef = ref<ModalInst | null>(null)
const exportInfo = ref({
  year: null as number | null,
})

const querySchemas = computed(() => ({
  status: [
    { label: '无影响', value: '无影响' },
    { label: '未分配', value: '未分配' },
    { label: '已分配', value: '已分配' },
  ],
}))

async function getLastDate() {
  const { isSuccess, data } = await contentApi.getLast()
  if (isSuccess) {
    queryModel.date = Number(data)
  }
}

onMounted(() => getLastDate())

function createQueryModel() {
  return {
    format: 'atlas/finance/cashflow',
    filter: null as string | null,
    status: null as string | null,
    date: getMonthFirstAndLastDayTimestamp() as any,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const {
  tableRef,
  pageLoading,
  pdfSettingRef,
  queryModel,
  gridOptions,
  hasPermDele,
  hasPermExport,
  hasPermPrint,
  editAction,
  handleEdit,
  handleExportOrPrint,
} = useListPage<QueryModel>({
  api,
  detailRef,
  idField: 'id',
  createQueryModel,
  columns: [
    {
      field: 'no',
      slots: {
        default: ({ row }) => {
          return [
            h(
              'a',
              {
                onClick: () => handleEdit('view', row),
              },
              row.no,
            ),
          ]
        },
      },
    },
    {
      isOperate: true,
      title: '操作',
      width: 150,
      align: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  gridOptions: {
    immediate: false,
  },
})

const rowMoreOptions = [
  { label: '操作变更日志', key: '操作变更日志' },
]

function handleRowMore(key: string, row: Recordable) {
  if (key === '操作变更日志') {
    logBizRef.value?.open({ xid: row.id, name: 'vouch_bills' })
  }
}

const moreOptions = reactive([
  { label: '批量匹配', key: '批量匹配', icon: createIcon('ant-design:cloud-upload-outlined') },
  { label: '批量删除', key: '批量删除', icon: createIcon('ant-design:delete-row-outlined') },
  { type: 'divider', key: 'd1' },
  // { label: '重新校验', key: '重新校验', icon: createIcon('ant-design:check-circle-outlined') },
  // { type: 'divider', key: 'd2' },
  { label: '打印预览', key: 'pdf', icon: createIcon('ant-design:printer-outlined'), disabled: !hasPermPrint },
  { label: '导出Excel', key: 'excel', icon: createIcon('ant-design:file-excel-outlined'), disabled: !hasPermExport },
])

async function handleMore(key: string) {
  const rows = tableRef.value.getCheckboxRows()
  if (['excel', 'pdf', 'print'].includes(key)) {
    await handleExportOrPrint(key, rows)
  }
  else if (key === '重新校验') {
    // TODO
  }
  else if (key === '批量删除') {
    handleRemove(rows)
  }
  else if (key === '批量匹配') {
    batchImportRef.value?.open()
  }
}

function handleRemove(rows: Recordable[]) {
  if (rows.length === 0) {
    toast.warning('请选择要删除的行')
    return
  }
  toast.infoModal('确定删除吗？', {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      pageLoading.value = true
      const { isSuccess } = await api.delete({ list: rows.map(m => m.id) })
        .finally(() => pageLoading.value = false)
      if (!isSuccess)
        return
      toast.success('操作成功')
      tableRef.value?.refresh()
    },
  })
}

function exportModalShow() {
  exportInfo.value.year = queryModel.date
  exportModalRef.value?.open()
}

async function handleExport() {
  if (!exportInfo.value.year) {
    toast.error('请选择导出年度')
    return
  }

  const year = format(queryModel.date, 'yyyy')

  btnLoading.value = true
  const { isSuccess, data } = await api.sheet({
    format: 'atlas/finance/cashflow/list',
    year,
  }).finally(() => (btnLoading.value = false))

  if (!isSuccess)
    return

  location.href = data
  exportModalRef.value?.close()
}

async function handleImportSuccess(fileId: string) {
  const { isSuccess, data } = await api.batchCheck({
    value: fileId,
  })

  batchImportRef.value?.close()
  if (isSuccess) {
    if (data) {
      checkFileUrl.value = data.url
      checkFileMessage.value = data.message

      batchImportRef.value?.check()
    }
    else {
      toast.success('导入成功')
    }
    tableRef.value?.refresh()
  }
  else {
    toast.error(data.message)
  }
}
</script>

<script lang="ts">
export default { name: 'FinanceCashflow' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="1">
            <n-date-picker
              v-model:value="queryModel.date"
              placeholder="期间"
              type="month"
              :year-range="[2008, new Date().getFullYear() + 1]"
            />
          </n-gi>
          <n-gi span="1">
            <n-select
              v-model:value="queryModel.status"
              :options="querySchemas.status"
              placeholder="分配状态"
              clearable
              @update:value="tableRef.clear()"
            />
          </n-gi>
          <n-gi span="4">
            <SpSearch :table-ref="tableRef" />
          </n-gi>
        </SpQueryGrid>
      </n-card>
      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions" @cell-dblclick="({ row }) => handleEdit('view', row)">
          <template #toolbarLeftBtn>
            <n-button type="default" @click="exportModalShow">
              现金流分配导出
            </n-button>

            <n-dropdown trigger="hover" :options="moreOptions" @select="handleMore">
              <n-button type="default" icon-placement="right">
                <template #icon>
                  <n-icon>
                    <Icon icon="ant-design:down-outlined" />
                  </n-icon>
                </template>
                更多操作
              </n-button>
            </n-dropdown>
          </template>
          <!-- 操作列 -->
          <template #operate="{ row }">
            <div class="flex items-center justify-center">
              <n-button text type="primary" @click="handleEdit('view', row)">
                查看
              </n-button>
              <n-divider vertical />
              <n-button text type="primary" :disabled="!hasPermDele || row.status === 0 || row.status > 1" @click="handleRemove([row])">
                删除
              </n-button>
              <n-divider vertical />
              <n-dropdown trigger="hover" :options="rowMoreOptions" @select="(key: string) => handleRowMore(key, row)">
                <n-button text type="primary">
                  更多
                </n-button>
              </n-dropdown>
            </div>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <detail ref="detailRef" @on-action="editAction" />
    <PdfSetting ref="pdfSettingRef" />
    <LogBiz ref="logBizRef" />
    <SpBatchImportModal
      ref="batchImportRef"
      title="现金流向批量匹配"
      template-download-url="/template/现金流向匹配模板.xlsx"
      :check-file-download-url="checkFileUrl"
      :check-file-message="checkFileMessage"
      @upload-success="handleImportSuccess"
    />

    <SpModal
      ref="exportModalRef"
      title="现金流分配导出"
      width="360"
      :mask="true"
      :draggable="true"
    >
      <template #default>
        <div class="w-full flex">
          <n-form label-placement="left" require-mark-placement="left" :label-width="80">
            <n-grid :cols="12" :x-gap="24">
              <n-form-item-gi :span="12" label="会计年度" :show-feedback="false">
                <n-date-picker
                  v-model:value="exportInfo.year"
                  placeholder="请选择"
                  type="year"
                />
              </n-form-item-gi>
            </n-grid>
          </n-form>
        </div>
      </template>

      <template #footer>
        <n-space justify="end">
          <n-button @click="exportModalRef?.close">
            关闭
          </n-button>
          <n-button type="primary" :loading="btnLoading" @click="handleExport">
            提交
          </n-button>
        </n-space>
      </template>
    </SpModal>
  </NaPage>
</template>
