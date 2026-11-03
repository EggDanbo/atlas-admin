<script setup lang="ts">
import type { OpenModal } from '@/components/SpModal'
import { PdfSetting } from '@/components/BizPrint'
import { SpDateRange } from '@/components/SpDateRange'
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { SpTree } from '@/components/SpTree'
import { useListPage } from '@/hooks/list'
import { subjectBalance as api } from '@/service/api/finance'
import { subject as contentApi } from '@/service/api/masterdata'
import { useEnumStore } from '@/store/modules/enums'
import { getYearFirstAndLastMonthTimestamp } from '@/utils/dateUtil'
import { createIcon } from '@/utils/iconify'
import zflz from '@/views/finance/general-ledger/table.vue'

const enumStore = useEnumStore()

const zflzRef = ref<OpenModal | null>(null)

const contentTreeOptions = ref<any>([])
async function loadContentOptions() {
  const { isSuccess, data } = await contentApi.tree({
    types: queryModel.content_type,
    stoped: true,
  })
  if (!isSuccess)
    return
  contentTreeOptions.value = data
}

onMounted(() => loadContentOptions())

function createQueryModel() {
  return {
    format: 'atlas/finance/subject-balance',
    date: getYearFirstAndLastMonthTimestamp() as any,
    level: null,
    content_type: null,
    content_id: null as string[] | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const {
  tableRef,
  pageLoading,
  pdfSettingRef,
  queryModel,
  gridOptions,
  hasPermExport,
  hasPermPrint,
  handleExportOrPrint,
} = useListPage<QueryModel>({
  api,
  detailRef: undefined,
  idField: 'id',
  createQueryModel,
  rowClassName: ({ row }) => {
    if (row.id === '0') {
      return 'font-bold'
    }
    return null
  },
  columns: [
    {
      field: 'code',
      slots: {
        default: ({ row }) => {
          return [
            h(
              'a',
              {
                onClick: () => handleQuery(row),
              },
              row.code,
            ),
          ]
        },
      },
    },
  ],
  gridOptions: {
    checkboxDisabled: true,
    pagination: false,
    immediate: false,
  },
})

const moreOptions = reactive([
  { label: '打印预览', key: 'pdf', icon: createIcon('ant-design:printer-outlined'), disabled: !hasPermPrint },
  { label: '导出Excel', key: 'excel', icon: createIcon('ant-design:file-excel-outlined'), disabled: !hasPermExport },
])

async function handleMore(key: string) {
  const rows = tableRef.value.getCheckboxRows()
  if (['excel', 'pdf', 'print'].includes(key)) {
    await handleExportOrPrint(key, rows)
  }
}

function handleQuery(row: Recordable) {
  zflzRef.value?.open({
    year: row.year,
    month_begin: row.month_begin,
    month_end: row.month_end,
    content_code: row.code,
  })
}
</script>

<script lang="ts">
export default { name: 'FinanceBalanceSubject' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :cols="12">
          <n-gi span="3">
            <SpDateRange
              v-model="queryModel.date"
              type="month"
              :min="new Date(2008, 0, 1).getTime()"
              :max="new Date(new Date().getFullYear() + 1, 11, 31).getTime()"
            />
          </n-gi>
          <n-gi span="2">
            <n-input-group>
              <n-input-group-label>科目显示到</n-input-group-label>
              <n-input-number v-model:value="queryModel.level" placeholder="" min="0" />
            </n-input-group>
          </n-gi>
          <n-gi span="5">
            <n-select
              v-model:value="queryModel.content_type"
              placeholder="科目分类"
              max-tag-count="responsive"
              multiple
              clearable
              :options="enumStore.getEnumOptions('basic_content_types')"
              @update:value="loadContentOptions"
            />
          </n-gi>
          <n-gi span="10">
            <SpTree
              v-model:value="queryModel.content_id"
              :options="contentTreeOptions"
              placeholder="会计科目"
              value-field="id"
            />
          </n-gi>
        </SpQueryGrid>
      </n-card>
      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
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
        </SpTable>
      </n-card>
    </n-flex>

    <PdfSetting ref="pdfSettingRef" />
    <zflz ref="zflzRef" />
  </NaPage>
</template>
