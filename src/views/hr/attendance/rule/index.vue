<script setup lang="ts">
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { usePermission } from '@/hooks/permission/usePermission'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { attendance } from '@/service/api/hr'
import { request } from '@/service/http'
import toast from '@/utils/toast'
import RuleForm from './components/RuleForm.vue'

/**
 * 考勤规则
 *
 * 从 App 端搬过来的模块，但只留「规则」本身：谁、什么时候、按什么时间上班。
 * 打卡是规则的执行结果，属于明细页，不在这里。
 *
 * 「生效时间」是这张表的重点：规则从哪天开始算，四条路（立即 / 明日 /
 * 指定日期 / 暂不生效），暂不生效的行整行淡化，一眼能从在用规则里挑出来。
 */
const RULE_STATES = ['立即生效', '明日生效', '指定日期', '暂不生效']

function createQueryModel() {
  return {
    format: 'atlas/hr/attendance/rule',
    filter: null as string | null,
    effective_state: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const ruleFormRef = ref<InstanceType<typeof RuleForm> | null>(null)

const { getPermission } = useTabbar()
const { hasPermission } = usePermission()
const permName = getPermission()
const canAdd = computed(() => hasPermission([`${permName}_ADD`]))
const canEdit = computed(() => hasPermission([`${permName}_EDIT`]))
const canDelete = computed(() => hasPermission([`${permName}_DELE`]))

/** 生效时间的展示：能落到具体日期就带上日期，别只写一句「指定日期」 */
function effectiveText(row: Recordable) {
  const state = String(row.effective_state ?? '')
  const date = String(row.effective_date ?? '')
  if (state === '指定日期')
    return date ? `${date} 生效` : '指定日期'
  if (state === '明日生效' && date)
    return `明日生效 · ${date.slice(5)}`
  return state || '—'
}

function effectiveTagType(state: string) {
  if (state === '立即生效')
    return 'success'
  if (state === '明日生效')
    return 'info'
  if (state === '指定日期')
    return 'warning'
  return 'default'
}

/** 班次时间列的第二行：班次数 / 排班人数 / 弹性，有哪个说哪个 */
function shiftHint(row: Recordable) {
  const parts: string[] = []
  if (row.shift_count > 1)
    parts.push(`${row.shift_count} 个班次`)
  if (row.attendance_mode === '排班制')
    parts.push(`${row.member_count ?? 0} 人排班`)
  else if (row.flex_minutes)
    parts.push(`弹性 ${row.flex_minutes} 分钟`)
  return parts.join(' · ')
}

function modeTagType(mode: string) {
  if (mode === '固定班次')
    return 'info'
  if (mode === '自由工时')
    return 'success'
  return 'warning'
}

/** 操作列走模板插槽，和列表其它插槽放在一起，读起来不用在两处跳 */
const operateColumn = {
  isOperate: true,
  title: '操作',
  width: 132,
  align: 'center' as const,
  fixed: 'right' as const,
  slots: { default: 'operate' },
}

const { tableRef, pageLoading, queryModel, gridOptions, handleExportOrPrint, hasPermExport } = useListPage<QueryModel>({
  api: { search: attendance.ruleSearch },
  createQueryModel,
  columns: [
    { field: 'rule_name', title: '规则名称', minWidth: 140 },
    { field: 'attendance_mode', title: '考勤模式', width: 84, align: 'center', slots: { default: 'mode' } },
    { field: 'apply_dept', title: '适用部门', width: 170 },
    { field: 'work_days_text', title: '工作日', width: 88, align: 'center' },
    { field: 'work_time', title: '班次时间', width: 118, slots: { default: 'workTime' } },
    { field: 'member_total', title: '覆盖人数', width: 88, align: 'right' },
    { field: 'effective_state', title: '生效时间', width: 128, align: 'center', slots: { default: 'effective' } },
    operateColumn,
  ],
  // 暂不生效的规则整行淡化：它们还留在表里，但已经不参与考勤计算
  rowClassName: ({ row }) => (row.effective_state === '暂不生效' ? 'rule-row--muted' : null),
  gridOptions: {
    checkboxDisabled: true,
  },
})

function openCreate() {
  ruleFormRef.value?.open({ opt: 'create' })
}

function openView(row: Recordable) {
  ruleFormRef.value?.open({ opt: 'view', row })
}

function openEdit(row: Recordable) {
  ruleFormRef.value?.open({ opt: 'edit', row })
}

function handleRemove(row: Recordable) {
  toast.infoModal(`确定删除规则「${row.rule_name}」吗？删除后使用该规则的员工将回落到默认班次。`, {
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { isSuccess } = await request.Post<Service.Response>('hr/attendance/rule/delete', { id: row.id })
      if (!isSuccess) {
        toast.error('删除失败')
        return
      }
      toast.success('已删除')
      tableRef.value?.refresh()
    },
  })
}
</script>

<script lang="ts">
export default { name: 'HrAttendanceRule' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="3">
            <n-input v-model:value="queryModel.filter" placeholder="规则名称 / 适用部门" clearable />
          </n-gi>
          <n-gi span="2">
            <n-select
              v-model:value="queryModel.effective_state"
              :options="RULE_STATES.map(item => ({ label: item, value: item }))"
              placeholder="生效状态"
              clearable
            />
          </n-gi>
        </SpQueryGrid>
      </n-card>

      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions">
          <template #toolbarLeftBtn>
            <n-button type="primary" :disabled="!canAdd" @click="openCreate">
              新增规则
            </n-button>
            <n-button :disabled="!hasPermExport" @click="handleExportOrPrint('excel', [])">
              导出
            </n-button>
          </template>

          <template #mode="{ row }">
            <n-tag v-if="row.attendance_mode" :type="modeTagType(row.attendance_mode)" size="small" :bordered="false">
              {{ row.attendance_mode }}
            </n-tag>
          </template>

          <template #workTime="{ row }">
            <div class="rule-time">
              <span class="rule-time__main">{{ row.work_time }}</span>
              <span v-if="shiftHint(row)" class="rule-time__flex">{{ shiftHint(row) }}</span>
            </div>
          </template>

          <template #operate="{ row }">
            <div class="rule-ops">
              <n-button text type="primary" @click="openView(row)">
                查看
              </n-button>
              <n-divider vertical />
              <n-button text type="primary" :disabled="!canEdit" @click="openEdit(row)">
                编辑
              </n-button>
              <n-divider vertical />
              <n-button text type="primary" :disabled="!canDelete" @click="handleRemove(row)">
                删除
              </n-button>
            </div>
          </template>

          <template #effective="{ row }">
            <n-tag
              v-if="row.effective_state"
              :type="effectiveTagType(row.effective_state)"
              size="small"
              :bordered="false"
            >
              {{ effectiveText(row) }}
            </n-tag>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <RuleForm ref="ruleFormRef" @saved="tableRef?.refresh()" />
  </NaPage>
</template>

<style lang="less" scoped>
.rule-ops {
  display: flex;
  align-items: center;
  justify-content: center;
}

.rule-time {
  display: flex;
  flex-direction: column;
  line-height: 18px;

  &__main {
    font-variant-numeric: tabular-nums;
  }

  &__flex {
    font-size: 11.5px;
    color: var(--atlas-text-tertiary);
  }
}

/* 暂不生效：整行退到背景里。用透明度而不是改颜色，
   这样操作按钮、标签也一起淡下去，不会被误认成「在用规则」 */
:deep(.rule-row--muted) {
  opacity: 0.45;
}
</style>
