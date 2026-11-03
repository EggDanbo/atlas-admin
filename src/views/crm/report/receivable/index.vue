<script setup lang="ts">
import { format } from 'date-fns'
import { PdfSetting } from '@/components/Print'
import { QueryGrid } from '@/components/QueryGrid'
import { SpTree } from '@/components/SpTree'
import { OuterSelect } from '@/components/TableSelect/index.ts'
import { useListPage } from '@/hooks/list'
import { unit as teamApi } from '@/service/api/access'
import { receivable as api } from '@/service/api/crm/report'
import { createIcon } from '@/utils/iconify'
import { tenantStorage } from '@/utils/tenant'

const teamTreeOptions = ref<Recordable[]>([])
async function loadTeamTree() {
  const tenantId = tenantStorage.get()
  if (!tenantId)
    return
  const { isSuccess, data } = await teamApi.tree({
    permission: [tabPermName.value!],
    tenant: tenantId,
    stoped: true,
  })
  if (isSuccess)
    teamTreeOptions.value = data
}

onMounted(() => loadTeamTree())

function createQueryModel() {
  return {
    format: 'atlas/crm/report/receivable',
    year: Date.now(),
    team_id: null as string[] | null,
    outer_id: null as string[] | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const {
  tableRef,
  pageLoading,
  pdfSettingRef,
  queryModel,
  gridOptions,
  tabPermName,
  hasPermExport,
  hasPermPrint,
  handleExportOrPrint,
} = useListPage<QueryModel>({
  api,
  detailRef: undefined,
  idField: 'id',
  createQueryModel,
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
</script>

<script lang="ts">
export default { name: 'TradeReportXmtjb' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <QueryGrid :table-ref="tableRef">
          <n-gi span="1">
            <n-date-picker
              v-model:value="queryModel.year"
              placeholder="年度"
              type="year"
              :year-range="[2008, new Date().getFullYear() + 1]"
            />
          </n-gi>
          <n-gi span="4">
            <SpTree
              v-model:value="queryModel.team_id"
              :options="teamTreeOptions"
              placeholder="所属单位"
              value-field="id"
            />
          </n-gi>
          <n-gi span="5">
            <OuterSelect
              v-model:value="queryModel.outer_id"
              placeholder="客户"
              types="0"
              :multiple="true"
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

    <PdfSetting ref="pdfSettingRef" />
  </NaPage>
</template>
