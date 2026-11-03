<script setup lang="ts">
import type { DataTableColumns } from 'naive-ui'
import type { FestivalRow } from './types.ts'
import type { OpenModal } from '@/components/SpModal'
import { NButton, NTag } from 'naive-ui'
import { usePermission } from '@/hooks/permission/usePermission'
import { holiday as api } from '@/service/api/hr/attendance'
import toast from '@/utils/toast'
import Detail from './detail.vue'

const FESTIVAL_PERMISSION = 'HR_ATTENDANCE_HOLIDAY'
const { hasPermission } = usePermission()
const hasPermAdd = hasPermission([`${FESTIVAL_PERMISSION}_ADD`])
const hasPermEdit = hasPermission([`${FESTIVAL_PERMISSION}_EDIT`])
const hasPermDele = hasPermission([`${FESTIVAL_PERMISSION}_DELE`])

const detailRef = ref<OpenModal | null>(null)
const optLoading = ref(false)
// year 类型选择器绑定毫秒时间戳;默认今天零点
const yearValue = ref<number | null>(new Date().setHours(0, 0, 0, 0))
const year = ref(new Date().getFullYear())
const list = ref<FestivalRow[]>([])

/** 按日期类型取日期标签 */
function dayTags(
  row: FestivalRow,
  dayType: number,
  type: 'default' | 'error' | 'info' | 'warning',
) {
  const days = row.days
    .filter(item => item.day_type === dayType)
    .map(item => item.day.slice(5))
  if (days.length === 0)
    return '-'
  return h(
    'div',
    { class: 'flex flex-wrap gap-1' },
    days.map(day =>
      h(NTag, { size: 'small', type, bordered: false }, { default: () => day.slice(0, 5) }),
    ),
  )
}

function handleAdd() {
  detailRef.value?.open({ year: yearValue.value })
}

function handleEdit(row: FestivalRow) {
  detailRef.value?.open({ id: row.id, row })
}

function handleRemove(row: FestivalRow) {
  toast.infoModal(`确定删除节日「${row.name}」及其全部日期登记吗？`, {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      optLoading.value = true
      const { isSuccess } = await api.delete({ id: row.id })
        .finally(() => (optLoading.value = false))
      if (!isSuccess)
        return
      toast.success('操作成功')
      await load()
    },
  })
}

function renderOperate(row: FestivalRow) {
  const buttons: ReturnType<typeof h>[] = []
  if (hasPermEdit) {
    buttons.push(
      h(
        NButton,
        { text: true, type: 'primary', onClick: () => handleEdit(row) },
        { default: () => '编辑' },
      ),
    )
  }
  if (hasPermDele) {
    buttons.push(
      h(
        NButton,
        { text: true, type: 'primary', onClick: () => handleRemove(row) },
        { default: () => '删除' },
      ),
    )
  }
  return h('div', { class: 'flex items-center justify-center gap-2' }, buttons)
}

const columns: DataTableColumns<FestivalRow> = [
  { title: '节日名称', key: 'name', width: 120, align: 'center' },
  {
    title: '法定节假日',
    key: 'legal',
    align: 'center',
    render: row => dayTags(row, 1, 'error'),
  },
  {
    title: '调休日期',
    key: 'transfer',
    align: 'center',
    render: row => dayTags(row, 2, 'warning'),
  },
  {
    title: '补班日期',
    key: 'makeup',
    align: 'center',
    render: row => dayTags(row, 3, 'info'),
  },
  { title: '备注', key: 'notes', align: 'center', render: row => row.notes || '-' },
  {
    title: '操作',
    key: 'operate',
    width: 130,
    align: 'center',
    render: renderOperate,
  },
]

async function load() {
  if (!yearValue.value) {
    yearValue.value = new Date().setHours(0, 0, 0, 0)
  }
  year.value = new Date(yearValue.value).getFullYear()

  optLoading.value = true
  const { isSuccess, data } = await api.get({ year: year.value })
    .finally(() => (optLoading.value = false))
  if (!isSuccess)
    return
  list.value = (data ?? []) as FestivalRow[]
}

onMounted(() => {
  load()
})
</script>

<script lang="ts">
export default { name: 'StaffCheckinFestival' }
</script>

<template>
  <NaPage>
    <n-flex vertical :size="12">
      <n-card :bordered="false">
        <n-space align="center">
          <n-date-picker
            v-model:value="yearValue"
            type="year"
            clearable
            style="width: 140px"
            @update:value="load"
          />
          <span class="text-gray-400">
            未登记的日期按内置法定安排判定；登记仅用于修正覆盖（如多放假、调休补班）
          </span>
        </n-space>
      </n-card>
      <n-card :bordered="false">
        <template #header>
          节假日安排（{{ year }} 年）
        </template>
        <template #header-extra>
          <NButton v-if="hasPermAdd" type="default" @click="handleAdd">
            <template #icon>
              <n-icon>
                <Icon icon="ant-design:plus-outlined" />
              </n-icon>
            </template>
            新增节日
          </NButton>
        </template>
        <n-data-table
          :columns="columns"
          :data="list"
          :loading="optLoading"
          :row-key="row => row.id"
        />
      </n-card>
    </n-flex>

    <Detail ref="detailRef" @on-action="load" />
  </NaPage>
</template>
