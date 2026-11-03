<script lang="ts" setup>
import type { ModalInst, OpenModal } from '@/components/SpModal'
import type { TableColumn, TableInstance, TableProps } from '@/components/SpTable'
import { format } from 'date-fns'
import { reactive, ref } from 'vue'
import { SpDateRange } from '@/components/SpDateRange'
import { logBizLog as api } from '@/service/api/system'
import { intToIp } from '@/utils'

const modalRef = ref<ModalInst | null>(null)
const tableRef = ref<TableInstance | null>(null)

let currentName = ''
let currentXid = 0
let currentField = ''

// 筛选条件（日期默认不限：按业务记录/字段查询，需要时再选择时间）
function createQueryModel() {
  return {
    date: null as [number, number] | null,
    archive: null as string | null,
  }
}

const queryModel = reactive(createQueryModel())

const archiveOptions = [
  { label: '否', value: '0' },
  { label: '是', value: '1' },
]

const seqColumn: TableColumn = {
  type: 'seq',
  title: '序号',
  width: 70,
  resizable: false,
  headerAlign: 'center',
  align: 'right',
}

// 变更列（同修改日志页，作用域已由参数固定，隐藏业务表/业务ID）
const columns: TableColumn[] = [
  seqColumn,
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
    field: 'mark',
    title: '操作描述',
    headerAlign: 'center',
    align: 'left',
    minWidth: 180,
    showOverflow: 'tooltip',
  },
  {
    field: 'user_name',
    title: '操作人',
    headerAlign: 'center',
    align: 'center',
    width: 120,
  },
  {
    field: 'user_mobile',
    title: '手机号',
    headerAlign: 'center',
    align: 'center',
    width: 150,
  },
  {
    field: 'ctime',
    title: '修改时间',
    headerAlign: 'center',
    align: 'center',
    width: 160,
  },
  {
    field: 'ip',
    title: 'IP',
    headerAlign: 'center',
    align: 'center',
    width: 140,
    formatter: ({ cellValue }) => {
      return intToIp(cellValue)
    },
  },
]

const gridOptions = reactive<TableProps>({
  columns,
  height: 556,
  canResize: false,
  showReload: true,
  showResetBtn: false,
  showPageMode: false,
  async fetchData(params) {
    // 日期可选：未选择时不传时间范围（按业务表名/业务ID/字段查询）
    const { isSuccess, data } = await api.getChanges({
      ...params,
      name: currentName || undefined,
      xid: currentXid,
      field: currentField || undefined,
      archive: queryModel.archive,
      begintime: queryModel.date?.[0]
        ? format(queryModel.date[0], 'yyyy-MM-dd HH:mm:ss')
        : undefined,
      endtime: queryModel.date?.[1]
        ? format(queryModel.date[1], 'yyyy-MM-dd HH:mm:ss')
        : undefined,
    })
    if (!isSuccess)
      return []
    return data
  },
  resetData: () => Object.assign(queryModel, createQueryModel()),
})

const exposed: OpenModal = {
  open: async (args?: Recordable) => {
    if (!args?.xid)
      return
    // name 可选：业务记录 ID 全局唯一，缺省时按 ID 跨表查询；field 可选：限定单字段历史
    currentName = args.name ?? ''
    currentXid = args.xid
    currentField = args.field ?? ''
    Object.assign(queryModel, createQueryModel())
    modalRef.value?.open()
    tableRef.value?.refresh()
  },
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'BizLogChanges' }
</script>

<template>
  <SpModal ref="modalRef" width="1080" height="800" title="数据变更记录" :show-ok="false" :show-cancel="false">
    <n-flex vertical :size="12" style="overflow: hidden">
      <n-grid cols="12" x-gap="12" y-gap="12" responsive="screen" style="overflow: hidden">
        <n-gi span="8">
          <SpDateRange v-model="queryModel.date" type="datetime" clearable />
        </n-gi>
        <n-gi span="4">
          <n-select
            v-model:value="queryModel.archive"
            :options="archiveOptions"
            placeholder="查询归档"
            clearable
          />
        </n-gi>
      </n-grid>
    </n-flex>
    <div class="mt-3">
      <SpTable ref="tableRef" v-bind="gridOptions" />
    </div>
  </SpModal>
</template>
