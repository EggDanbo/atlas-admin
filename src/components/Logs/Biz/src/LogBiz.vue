<script lang="ts" setup>
import type { ModalInst, OpenModal } from '@/components/SpModal'
import type { TableColumn, TableInstance, TableProps } from '@/components/SpTable'
import { addDays, format } from 'date-fns'
import { computed, nextTick, reactive, ref } from 'vue'
import { SpDateRange } from '@/components/SpDateRange'
import { logBizLog as api } from '@/service/api/system'
import { intToIp } from '@/utils'
import BizlogView from './BizlogView.vue'

const modalRef = ref<ModalInst | null>(null)
const tableRef = ref<TableInstance | null>(null)
const detailRef = ref<OpenModal | null>(null)

let currentName = ''
let currentMark = ''
let currentXid = 0

// 视图：logs 业务日志 / changes 全部变更
const view = ref<'logs' | 'changes'>('logs')

const title = computed(() => (view.value === 'logs' ? '模块操作日志' : '数据变更记录'))

// 筛选条件（日期默认不限：按业务记录查询数据量少，需要时再选择时间）
function createQueryModel() {
  return {
    date: null as [number, number] | null,
    mark: '',
    field: '',
    filter: '',
    user_name: '',
    archive: null,
  }
}

const queryModel = reactive(createQueryModel())

const querySchemas = computed(() => {
  return {
    archive: [
      { label: '否', value: '0' },
      { label: '是', value: '1' },
    ],
  }
})

function fmtTime(value) {
  return value ? format(new Date(value), 'yyyy-MM-dd HH:mm:ss') : ''
}

const seqColumn: TableColumn = {
  type: 'seq',
  title: '序号',
  width: 70,
  resizable: false,
  headerAlign: 'center',
  align: 'right',
}

// 业务日志视图列（同业务日志模块）
const logColumns: TableColumn[] = [
  seqColumn,
  {
    field: 'ctime',
    title: '操作时间',
    headerAlign: 'center',
    align: 'center',
    width: 160,
    formatter: ({ cellValue }) => fmtTime(cellValue),
  },
  {
    field: 'mark',
    title: '操作描述',
    headerAlign: 'center',
    align: 'left',
    minWidth: 200,
    slots: {
      default: ({ row }) => {
        return [
          h(
            'a',
            {
              onClick: () => handleView(row),
            },
            row.mark,
          ),
        ]
      },
    },
  },
  {
    field: 'user_name',
    title: '操作人',
    headerAlign: 'center',
    align: 'center',
    width: 110,
  },
  {
    field: 'ref_count',
    title: '关联数',
    headerAlign: 'center',
    align: 'center',
    width: 90,
  },
  {
    field: 'ip',
    title: 'IP',
    headerAlign: 'center',
    align: 'center',
    width: 140,
    formatter: ({ cellValue }) => intToIp(cellValue),
  },
]

// 变更记录视图列（与修改日志页一致）
const changeColumns: TableColumn[] = [
  seqColumn,
  // {
  //   field: 'mark',
  //   title: '操作描述',
  //   headerAlign: 'center',
  //   align: 'left',
  //   minWidth: 160,
  //   showOverflow: 'tooltip',
  // },
  // {
  //   field: 'name',
  //   title: '业务表',
  //   headerAlign: 'center',
  //   align: 'center',
  //   width: 130,
  // },
  // {
  //   field: 'xid',
  //   title: '业务ID',
  //   headerAlign: 'center',
  //   align: 'center',
  //   width: 170,
  // },
  {
    field: 'describe',
    title: '字段',
    headerAlign: 'center',
    align: 'center',
    width: 120,
    slots: {
      default: ({ row }) => {
        return [row.describe || row.field]
      },
    },
  },
  {
    field: 'old_value',
    title: '变更前',
    headerAlign: 'center',
    align: 'left',
    minWidth: 200,
    showOverflow: 'tooltip',
  },
  {
    field: 'new_value',
    title: '变更后',
    headerAlign: 'center',
    align: 'left',
    minWidth: 200,
    showOverflow: 'tooltip',
  },
  {
    field: 'user_name',
    title: '操作人',
    headerAlign: 'center',
    align: 'center',
    width: 100,
  },
  {
    field: 'ctime',
    title: '操作时间',
    headerAlign: 'center',
    align: 'center',
    width: 160,
    formatter: ({ cellValue }) => fmtTime(cellValue),
  },
  {
    field: 'ip',
    title: 'IP',
    headerAlign: 'center',
    align: 'center',
    width: 140,
    formatter: ({ cellValue }) => (cellValue == null ? '' : intToIp(cellValue)),
  },
]

const gridOptions = reactive<TableProps>({
  columns: logColumns,
  height: 556,
  canResize: false,
  showReload: true,
  showResetBtn: false,
  showPageMode: false,
  async fetchData(params) {
    // 日期可选：未选择时不传时间范围（按业务表名/业务ID查询）
    const time = {
      begintime: queryModel.date?.[0]
        ? format(queryModel.date[0], 'yyyy-MM-dd HH:mm:ss')
        : undefined,
      endtime: queryModel.date?.[1]
        ? format(queryModel.date[1], 'yyyy-MM-dd HH:mm:ss')
        : undefined,
    }

    const { isSuccess, data } = await api.getList({
      ...params,
      name: currentName || undefined,
      xid: currentXid,
      mark: queryModel.mark,
      user_name: queryModel.user_name,
      ...time,
    })
    if (!isSuccess)
      return []
    return data
  },
  resetData: () => Object.assign(queryModel, createQueryModel()),
})

const changeGridOptions = reactive<TableProps>({
  columns: changeColumns,
  height: 556,
  canResize: false,
  showReload: true,
  showResetBtn: false,
  showPageMode: false,
  async fetchData(params) {
    // 日期可选：未选择时不传时间范围（按业务表名/业务ID查询）
    const time = {
      begintime: queryModel.date?.[0]
        ? format(queryModel.date[0], 'yyyy-MM-dd HH:mm:ss')
        : undefined,
      endtime: queryModel.date?.[1]
        ? format(queryModel.date[1], 'yyyy-MM-dd HH:mm:ss')
        : undefined,
    }

    const { isSuccess, data } = await api.getChanges({
      ...params,
      name: currentName || undefined,
      xid: currentXid,
      field: queryModel.field,
      filter: queryModel.filter,
      user_name: queryModel.user_name,
      archive: queryModel.archive,
      ...time,
    })
    if (!isSuccess)
      return []
    return data
  },
  resetData: () => Object.assign(queryModel, createQueryModel()),
})

// 查看业务日志详情
function handleView(row: Recordable) {
  detailRef.value?.open({ id: row.id })
}

// 切换业务日志 / 全部变更
function switchView() {
  view.value = view.value === 'logs' ? 'changes' : 'logs'
  nextTick(() => tableRef.value?.refresh())
}

const exposed: OpenModal = {
  open: async (args?: Recordable) => {
    if (!args?.xid && !args?.mark)
      return

    // name 可选：业务记录 ID 全局唯一，缺省时按 ID 跨表查询
    currentXid = args.xid ?? 0
    currentName = args.name ?? ''
    currentMark = args.mark ?? ''

    Object.assign(queryModel, createQueryModel())
    view.value = 'logs'
    modalRef.value?.open()

    nextTick(() => {
      // 如果是通过 mark 打开，则默认查询最近一周的记录
      if (currentMark !== '') {
        queryModel.mark = currentMark
        queryModel.date = [addDays(Date.now(), -7).getTime(), addDays(Date.now(), 1).getTime()]
      }
      tableRef.value?.refresh()
    })
  },
}

defineExpose(exposed)
</script>

<template>
  <SpModal ref="modalRef" width="1080" height="800" :title="title" :show-ok="false" :show-cancel="false">
    <n-flex vertical :size="12" style="overflow: hidden">
      <n-grid cols="12" x-gap="12" y-gap="12" responsive="screen" style="overflow: hidden">
        <n-gi span="8">
          <SpDateRange v-model="queryModel.date" type="datetime" clearable />
        </n-gi>
        <n-gi span="2">
          <n-select
            v-model:value="queryModel.archive"
            :options="querySchemas.archive"
            placeholder="查询归档"
            clearable
          />
        </n-gi>
        <n-gi span="2" class="text-right">
          <n-button type="info" secondary strong :disabled="currentName === ''" @click="switchView">
            {{ view === 'logs' ? '全部变更记录' : '返回操作日志' }}
          </n-button>
        </n-gi>
      </n-grid>
      <n-grid cols="12" x-gap="12" y-gap="12" responsive="screen" style="overflow: hidden">
        <n-gi span="4">
          <n-input v-model:value="queryModel.user_name" placeholder="操作人" clearable />
        </n-gi>
        <n-gi v-if="view === 'logs'" span="6">
          <n-input v-model:value="queryModel.mark" :disabled="currentMark !== ''" placeholder="操作描述" clearable />
        </n-gi>
        <n-gi v-if="view === 'changes'" span="2">
          <n-input v-model:value="queryModel.field" placeholder="字段名" clearable />
        </n-gi>
        <n-gi v-if="view === 'changes'" span="4">
          <n-input v-model:value="queryModel.filter" placeholder="描述或变更前后的值" clearable />
        </n-gi>
      </n-grid>
    </n-flex>
    <div class="mt-3">
      <SpTable
        v-if="view === 'logs'"
        ref="tableRef" v-bind="gridOptions"
        @cell-dblclick="({ row }) => handleView(row)"
      />
      <SpTable v-else ref="tableRef" v-bind="changeGridOptions" />
    </div>
  </SpModal>
  <BizlogView ref="detailRef" />
</template>
