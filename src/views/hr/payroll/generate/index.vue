<script setup lang="ts">
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { LogBiz } from '@/components/BizLogs/Biz'
import { PdfSetting } from '@/components/BizPrint'
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { SalaryGroupPicker } from '@/components/SpTablePicker'
import { SpTree } from '@/components/SpTree'
import { useListPage } from '@/hooks/list'
import { unit as teamApi } from '@/service/api/access'
import { generate as api, group as groupApi } from '@/service/api/hr/payroll'
import { useEnumStore } from '@/store/modules/enums'
import { createIcon } from '@/utils/iconify'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'
import detail from './detail.vue'

const detailRef = ref<OpenModal | null>(null)
const logBizRef = ref<OpenModal | null>(null)
const battchModalRef = ref<ModalInst | null>(null)

const enumStore = useEnumStore()

const btnLoading = ref<boolean>(false)

const teamTreeOptions = ref<Recordable[]>([])
async function loadTeamTree() {
  if (!queryModel.group_id)
    return

  const { isSuccess, data } = await teamApi.tree({
    permission: [tabPermName.value!],
    cuid: queryModel.cuid,
    stoped: true,
  })
  if (isSuccess)
    teamTreeOptions.value = data
}

const querySchemas = computed(() => ({
  states: [
    {
      value: '0',
      label: '在职',
    },
    {
      value: '1',
      label: '离职',
    },
  ],
}))

const battchTypes = ref<string | null>(null)
const battchInfo = ref<any>({
  month: null,
  group_id: null,
  team_id: null,
})

function createQueryModel() {
  return {
    format: 'atlas/hr/payroll/generate',
    group_id: null as string | null,
    filter: null as string | null,
    team_id: null,
    cuid: null,
    status: null,
    states: null,
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
      isOperate: true,
      title: '操作',
      width: 150,
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
  gridOptions: {
    immediate: false,
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

function handleProcess(opt: string) {
  if (!queryModel.group_id) {
    toast.info('请选择工资分组')
    return
  }

  battchTypes.value = opt
  battchModalShow()
}

function handleDateSelected() {
  queryModel.group_id = null
}

async function battchModalShow() {
  battchInfo.value.month = queryModel.month
  battchInfo.value.group_id = queryModel.group_id
  battchInfo.value.team_id = null

  battchModalRef.value?.open()
}

function handleBattch() {
  switch (battchTypes.value) {
    case 'battch': {
      battch()
      break
    }
    case 'cancel': {
      cancel()
      break
    }
    case 'confirm': {
      confirm()
      break
    }
  }
}

async function battch() {
  btnLoading.value = true

  const { isSuccess } = await api.battch({ ...battchInfo.value }).finally(() => (btnLoading.value = false))
  if (isSuccess) {
    toast.success('操作成功')
    battchModalRef.value?.close()
    await tableRef.value.refresh()
  }
}

async function confirm() {
  btnLoading.value = true

  const { isSuccess } = await api.confirm({
    group_id: queryModel.group_id,
    month: queryModel.month,
  }).finally(() => (btnLoading.value = false))
  if (isSuccess) {
    toast.success('操作成功')
    battchModalRef.value?.close()
    await tableRef.value.refresh()
  }
}

async function cancel() {
  btnLoading.value = true

  const { isSuccess } = await api.cancel({
    group_id: queryModel.group_id,
    month: queryModel.month,
  }).finally(() => (btnLoading.value = false))
  if (isSuccess) {
    toast.success('操作成功')
    battchModalRef.value?.close()
    await tableRef.value.refresh()
  }
}

async function salaryItemHandle(item: any) {
  queryModel.group_id = item ? item.group_id : null
  queryModel.cuid = item ? item.team_id : null

  await loadTeamTree()
  await loadGridColumns()

  await tableRef.value?.search()
}

async function loadGridColumns() {
  if (!queryModel.group_id || !queryModel.month) {
    return
  }

  const { isSuccess, data } = await groupApi.getGridColumns({
    group_id: queryModel.group_id,
    month: queryModel.month,
  })

  if (isSuccess && data && Array.isArray(data)) {
    const col: any = data
    tableRef.value.loadFormat(col)
  }
}
</script>

<script lang="ts">
export default { name: 'HrPayrollGenerate' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef">
          <n-gi span="1">
            <n-date-picker
              v-model:value="queryModel.month"
              placeholder="工资月份"
              type="month"
              :year-range="[2008, new Date().getFullYear() + 1]"
              @update:value="handleDateSelected"
            />
          </n-gi>
          <n-gi span="2">
            <SalaryGroupPicker
              v-model:value="queryModel.group_id"
              :month="queryModel.month"
              :multiple="false"
              :permission="`${tabPermName}`"
              placeholder="工资分组"
              @change="salaryItemHandle"
            />
          </n-gi>
          <n-gi span="1">
            <n-select
              v-model:value="queryModel.status"
              :options="enumStore.getEnumOptions('staff_salary_status')"
              placeholder="工资状态"
              clearable
              @update:value="tableRef.clear()"
            />
          </n-gi>
          <n-gi span="1">
            <n-select
              v-model:value="queryModel.states"
              :options="querySchemas.states"
              placeholder="人员状态"
              clearable
              @update:value="tableRef.clear()"
            />
          </n-gi>
          <n-gi span="5">
            <SpTree
              v-model:value="queryModel.team_id"
              :options="teamTreeOptions"
              placeholder="所属单位"
              value-field="id"
            />
          </n-gi>
          <n-gi span="5">
            <SpSearch :table-ref="tableRef" />
          </n-gi>
        </SpQueryGrid>
      </n-card>
      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions" @cell-dblclick="({ row }) => handleEdit('view', row)">
          <template #toolbarLeftBtn>
            <n-button :disabled="!hasPermAdd" type="default" @click="handleProcess('battch')">
              生成考勤
            </n-button>

            <n-button-group>
              <n-button :loading="tableRef.getLoading" @click="handleProcess('confirm')">
                提交
              </n-button>
              <n-button :loading="tableRef.getLoading" @click="handleProcess('cancel')">
                取消
              </n-button>
            </n-button-group>

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

    <SpModal
      ref="battchModalRef"
      title="考勤部门"
      width="450"
      :mask="true"
      :draggable="true"
    >
      <template #default>
        <div
          class="w-full flex flex-col items-center justify-center pb-6 pt-1"
          style="gap: 15px; font-size: 14px"
        >
          <SpTree
            v-model:value="battchInfo.team_id"
            :options="teamTreeOptions"
            placeholder="请选择"
            value-field="id"
            :multiple="true"
          />
        </div>
      </template>

      <template #footer>
        <n-space justify="end">
          <n-button @click="battchModalRef?.close">
            关闭
          </n-button>
          <n-button type="primary" :loading="btnLoading" @click="handleBattch">
            提交
          </n-button>
        </n-space>
      </template>
    </SpModal>
  </NaPage>
</template>
