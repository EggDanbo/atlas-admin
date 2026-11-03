<script setup lang="ts">
import type { OpenModal } from '@/components/SpModal'
import { PdfSetting } from '@/components/Print'
import { QueryGrid } from '@/components/QueryGrid'
import { SpDateRange } from '@/components/SpDateRange'
import { SpTree } from '@/components/SpTree'
import { AssistSelect } from '@/components/TableSelect'
import { useListPage } from '@/hooks/list'
import { content as contentApi } from '@/service/api/basic'
import { wdyeb as api } from '@/service/api/vouch/report'
import { useEnumStore } from '@/store/modules/enums'
import { getYearFirstAndLastMonthTimestamp } from '@/utils/dateUtil'
import { createIcon } from '@/utils/iconify'
import { tenantStorage } from '@/utils/tenant'
import wdmxz from '@/views/vouch/book/wdmxz/table.vue'

const enumStore = useEnumStore()

const wdmxzRef = ref<OpenModal | null>(null)

const contentTreeOptions = ref<any>([])
async function loadContentOptions() {
  const { isSuccess, data } = await contentApi.tree({
    stoped: true,
  })
  if (!isSuccess)
    return
  contentTreeOptions.value = data
}

onMounted(() => {
  loadContentOptions()
})

function createQueryModel() {
  return {
    format: 'atlas/vouch/report/wdyeb',
    date: getYearFirstAndLastMonthTimestamp() as any,
    assist_type: '部门',
    content_id: null as string[] | null,
    assist_id: null as string[] | null,
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
  wdmxzRef.value?.open({
    content_id: queryModel.content_id,
    assist_id: row.id,
    assist_type: queryModel.assist_type,
    code: row.code,
    year: row.year,
    month_begin: row.month_begin,
    month_end: row.month_end,
  })
}
</script>

<script lang="ts">
export default { name: 'VouchReportWdyeb' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <QueryGrid :table-ref="tableRef" :cols="12">
          <n-gi span="3">
            <SpDateRange
              v-model="queryModel.date"
              type="month"
              :min="new Date(2008, 0, 1).getTime()"
              :max="new Date(new Date().getFullYear() + 1, 11, 31).getTime()"
            />
          </n-gi>
          <n-gi span="7">
            <n-input-group>
              <n-select
                v-model:value="queryModel.assist_type"
                :options="enumStore.getEnumOptions('basic_content_assist', 'label')"
                placeholder="维度分类"
                :style="{ width: '210px' }"
                @update:value="tableRef.clear()"
              />
              <AssistSelect
                v-model:value="queryModel.assist_id"
                placeholder="核算维度"
                :multiple="true"
                :types="queryModel.assist_type"
                :team_id="tenantStorage.get()"
              />
            </n-input-group>
          </n-gi>
          <n-gi span="10">
            <SpTree
              v-model:value="queryModel.content_id"
              :options="contentTreeOptions"
              placeholder="会计科目"
              value-field="id"
            />
          </n-gi>
        </QueryGrid>
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

    <wdmxz ref="wdmxzRef" />
    <PdfSetting ref="pdfSettingRef" />
  </NaPage>
</template>
