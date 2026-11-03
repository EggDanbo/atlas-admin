<script setup lang="ts">
import type { OpenModal } from '@/components/SpModal'
import { LogBiz } from '@/components/BizLogs/Biz'
import { PdfSetting } from '@/components/BizPrint'
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { SpTree } from '@/components/SpTree'
import { useListPage } from '@/hooks/list'
import { unit as teamApi } from '@/service/api/access'
import { group as api } from '@/service/api/hr/payroll'
import { createIcon } from '@/utils/iconify'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'
import detail from './detail.vue'
import itemModal from './item.vue'

const detailRef = ref<OpenModal | null>(null)
const itemModalRef = ref<OpenModal | null>(null)
const logBizRef = ref<OpenModal | null>(null)

const teamTreeOptions = ref<Recordable[]>([])
async function loadTeamTree() {
  const tenantId = tenantStorage.get()
  if (!tenantId)
    return
  const { isSuccess, data } = await teamApi.tree({
    permission: [tabPermName.value!],
    tenant: tenantId,
    alone: true,
    stoped: true,
  })
  if (isSuccess)
    teamTreeOptions.value = data
}

onMounted(() => loadTeamTree())

function createQueryModel() {
  return {
    format: 'atlas/hr/payroll/group',
    team_id: null,
    filter: null,
    month: Date.now(),
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
  hasPermAdd,
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
  rowClassName: ({ row }) => row.current === 1 ? 'row-warning' : null,
  createQueryModel,
  columns: [
    {
      field: 'user_code',
      slots: {
        default: ({ row }) => {
          return [
            h(
              'a',
              {
                onClick: () => handleEdit('view', row),
              },
              row.user_code,
            ),
          ]
        },
      },
    },
    {
      field: 'status',
      slots: { default: 'status' },
    },
    {
      isOperate: true,
      title: '操作',
      width: 220,
      align: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  customHandleEdit: (action, row, extra) => {
    if (!tenantStorage.get()) {
      toast.warning('请先选择组织机构')
      return
    }
    if (action === 'add') {
      detailRef.value?.open()
    }
    else {
      detailRef.value?.open({ id: row?.id })
    }
  },
})

const rowMoreOptions = [
  { label: '操作变更日志', key: '操作变更日志' },
]

function handleRowMore(key: string, row: Recordable) {
  if (key === '操作变更日志') {
    logBizRef.value?.open({ xid: row.id })
  }
}

const moreOptions = computed(() => [
  { label: '批量删除', key: '批量删除', icon: createIcon('ant-design:delete-row-outlined') },
  { type: 'divider', key: 'd1' },
  { label: '打印预览', key: 'pdf', icon: createIcon('ant-design:printer-outlined'), disabled: !hasPermPrint },
  { label: '导出Excel', key: 'excel', icon: createIcon('ant-design:file-excel-outlined'), disabled: !hasPermExport },
])

async function handleMore(key: string) {
  const rows = tableRef.value.getCheckboxRows()
  if (['excel', 'pdf', 'print'].includes(key)) {
    await handleExportOrPrint(key, rows)
  }
  else if (key === '批量删除') {
    handleRemove(rows)
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

async function handleDateSelected() {
  await tableRef.value?.search()
}

function handleItem(row: Recordable) {
  itemModalRef.value?.open({
    group_id: row.id,
    month: queryModel.month,
    title: `${row.title} ${row.team_name}`,
  })
}
</script>

<script lang="ts">
export default { name: 'HrPayrollGroup' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="1">
            <n-date-picker
              v-model:value="queryModel.month"
              placeholder="工资月份"
              type="month"
              :year-range="[2008, new Date().getFullYear() + 1]"
              @update:value="handleDateSelected"
            />
          </n-gi>
          <n-gi span="1">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="工资表名"
              type="text"
              clearable
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
        </SpQueryGrid>
      </n-card>
      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions" @cell-dblclick="({ row }) => handleEdit('view', row)">
          <template #toolbarLeftBtn>
            <n-button :disabled="!hasPermAdd" type="default" @click="handleEdit('add')">
              <template #icon>
                <n-icon>
                  <Icon icon="ant-design:plus-outlined" />
                </n-icon>
              </template>
              新增
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

          <template #status="{ row }">
            <n-tag v-if="row.status" :bordered="false" type="success">
              已设置
            </n-tag>
            <n-tag v-if="!row.status" :bordered="false" type="warning">
              未设置
            </n-tag>
          </template>

          <template #operate="{ row }">
            <div class="flex items-center justify-center">
              <n-button text type="primary" @click="handleEdit('view', row)">
                查看
              </n-button>
              <n-divider vertical />
              <n-button text type="primary" :disabled="!hasPermDele" @click="handleRemove([row])">
                删除
              </n-button>
              <n-divider vertical />
              <n-button text type="primary" @click="handleItem(row)">
                工资项目
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
    <itemModal ref="itemModalRef" />
    <PdfSetting ref="pdfSettingRef" />
    <LogBiz ref="logBizRef" />
  </NaPage>
</template>
