<script setup lang="ts">
import type { OpenModal } from '@/components/SpModal'
import { PdfSetting } from '@/components/BizPrint'
import { SpDateRange } from '@/components/SpDateRange'
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { SpTree } from '@/components/SpTree'
import { useListPage } from '@/hooks/list'
import { usePermission } from '@/hooks/permission/usePermission'
import { unit as teamApi } from '@/service/api/access'
import { daily as api } from '@/service/api/hr/attendance'
import { defDate, unDate } from '@/utils/dateUtil'
import { createIcon } from '@/utils/iconify'
import { tenantStorage } from '@/utils/tenant'

import StatModal from '../components/statModal.vue'
import AdjustModal from './components/adjustModal.vue'

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
    format: 'atlas/hr/attendance/daily',
    filter: null as string | null,
    date: defDate({ start: -1, ymd: 'm' }),
    team_id: null as string | null,
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
  columns: [
    {
      field: 'no',
      slots: {
        default: ({ row }) => {
          return [
            h(
              'a',
              {
                onClick: () => null,
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
      width: 160,
      align: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  beforeFetch: (options) => {
    const { date, ...newObj } = options
    const params: any = { ...newObj, ...unDate({ dateArr: options.date }) }

    return params
  },
})

const { hasPermission } = usePermission()

const statModalRef = ref<OpenModal | null>(null)
const adjustModalRef = ref<OpenModal | null>(null)

// 打卡统计需考勤规则的查看权限
const RULES_PERM = 'HR_ATTENDANCE_RULE'
const canStat = computed(() => hasPermission([`${RULES_PERM}_ADD`, `${RULES_PERM}_EDIT`]))

// 校准需每日明细的维护权限
const ADJUST_PERM = 'HR_ATTENDANCE_DAILY'
const cellOptions = computed(() => {
  const p = hasPermission([`${ADJUST_PERM}_ADD`, `${ADJUST_PERM}_EDIT`])
  return [
    { label: '上班卡', key: 0, disabled: !p },
    { label: '下班卡', key: 1, disabled: !p },
  ]
})

function handleCellMore(key: number, row: Recordable) {
  adjustModalRef.value?.open({
    id: row.id,
    types: '0',
    work_type: String(key),
    adjust_time: defaultAdjustTime(row, key),
    memo: '',
    showTypes: key === 0 ? row.work_record_id > 0 : row.off_work_record_id > 0,
  })
}

// 未打卡时 work_time 为 0,日期控件会显示成 1970-01-01;默认改用当天排班的应打卡时间
function defaultAdjustTime(row: Recordable, workType: number) {
  const punched = Number(workType === 0 ? row.work_time : row.off_work_time)
  if (punched)
    return punched
  const sec = Number(workType === 0 ? row.work_sec : row.off_work_sec)
  const date = Number(row.checkin_date)
  // checkin_date 为 8 位 yyyymmdd;无排班秒数或日期格式异常时留空,交由操作员选择
  if (!sec || !date || String(date).length !== 8)
    return null
  const dayStart = new Date(
    Math.floor(date / 10_000),
    Math.floor((date % 10_000) / 100) - 1,
    date % 100,
  ).getTime()
  return dayStart + sec * 1000
}

function handleStat(row: Recordable) {
  statModalRef.value?.open({ id: row.group_id, user_id: row.user_id })
}

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
export default { name: 'HrRecordDaily' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef">
          <n-gi span="2">
            <SpDateRange v-model="queryModel.date" type="date" />
          </n-gi>
          <n-gi span="1">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="工号或姓名"
              type="text"
              clearable
            />
          </n-gi>
          <n-gi span="2">
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
          <!-- 操作列 -->
          <template #operate="{ row }">
            <div class="flex items-center justify-center">
              <n-dropdown trigger="hover" :options="cellOptions" @select="handleCellMore($event, row)">
                <n-button text type="primary" size="small" icon-placement="right">
                  <div class="flex items-center">
                    <span>校准</span>
                    <n-icon size="14">
                      <Icon icon="ant-design:down-outlined" />
                    </n-icon>
                  </div>
                </n-button>
              </n-dropdown>
              <n-divider v-if="canStat" vertical />
              <n-button v-if="canStat" text type="primary" @click="handleStat(row)">
                统计
              </n-button>
            </div>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <PdfSetting ref="pdfSettingRef" />
    <StatModal ref="statModalRef" />
    <AdjustModal ref="adjustModalRef" @success="tableRef?.refresh()" />
  </NaPage>
</template>
