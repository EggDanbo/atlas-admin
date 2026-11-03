<script lang="ts" setup>
import type { TableProps } from '@/components/SpTable'
import printJS from 'print-js'
import { SpTree } from '@/components/SpTree'
import { BranchSelect } from '@/components/TableSelect'
import { team } from '@/service/api/organ'
import { rules as api } from '@/service/api/staff/checkin'
import toast from '@/utils/toast'

const emit = defineEmits(['on-reg', 'on-action'])

const btnLoading = ref(false)

const filterModel = ref({
  format: 'atlas/checkin/rules/usergroup',
  team_id: null,
  branch_id: null,
  status: null,
  types: 0,
  user_status: 0,
})

const tableRef = ref<any>(null)
const modalRef = ref<any>(null)

const rulesId = ref<any>(null)

const teamTreeOptions = ref<any>([])
const statusOptions = ref<any>([
  {
    value: 1,
    label: '已设置',
  },
  {
    value: 2,
    label: '未设置',
  },
])

async function open(params: any) {
  await load()
  rulesId.value = params.id

  modalRef.value?.open()

  setTimeout(() => {
    tableRef.value.redoHeight()
    tableRef.value.fetch({ page: 1 })
  }, 0)
}

function close() {
  modalRef.value?.close()
}

async function submit(opt: number, auto: boolean = false) {
  if (opt === 0 && !filterModel.value.team_id && !filterModel.value.branch_id) {
    toast.info('清空需要选择所属单位或派驻分队')
    return
  }

  const status = opt
  const rows = tableRef.value.getCheckboxRows()
  const ids = rows.map(q => q.user_id)

  if (status > 0 && rows.length === 0) {
    toast.info('请选择网格内容')
    return
  }

  const text = opt === 0 ? '清空选择单位' : opt === 1 ? '设置选择' : '取消设置选择'
  toast.infoModal(`确定${text}的人员吗？`, {
    positiveText: `确定`,
    negativeText: '取消',
    onPositiveClick: async () => {
      btnLoading.value = true
      const { isSuccess } = await api
        .setUserGroup({
          id: rulesId.value,
          user_id: status === 0 ? [] : ids,
          status,
          auto,
        })
        .finally(() => (btnLoading.value = false))
      if (!isSuccess)
        return
      toast.success('操作成功')
      await tableRef.value.fetch()
      emit('on-action', 'EDIT')
    },
  })
}

async function print() {
  btnLoading.value = true
  const { isSuccess, data } = await api.qrcode({ id: rulesId.value, types: 0, print: true }).finally(() => {
    btnLoading.value = false
  })
  if (!isSuccess)
    return
  printJS({
    printable: data,
    type: 'pdf',
    showModal: true,
    modalMessage: '下载中...',
  })
}

async function fetchData(params: Recordable) {
  const { isSuccess, data } = await api.searchUserGroup({
    ...params,
    ...filterModel.value,
    id: rulesId.value,
    user_status: filterModel.value.status === 1 ? null : 0, // 设置显示所有人
  })
  if (!isSuccess)
    return []
  return data
}

const gridOptions = reactive<TableProps>({
  rowClassName: ({ row }) => {
    if (row.stoped) {
      return 'row-warning'
    }
    return null
  },
  dataFormat: filterModel.value.format,
  columns: [
    {
      field: 'check_user',
      slots: { default: 'check_user_default' },
    },
  ],
  fetchData,
  immediate: false,
  resizeHeightOffset: 140,
  showToolbarRight: false,
})

async function loadTeamTree() {
  const { isSuccess, data } = await team.tree({
    fiction: true,
    stoped: true,
  })
  if (!isSuccess)
    return
  teamTreeOptions.value = data
}

async function load() {
  loadTeamTree()
}

defineExpose({ open, close })
</script>

<template>
  <SpModal
    ref="modalRef"
    title="设置人员"
    width="90vw"
    height="90vh"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <SpTable ref="tableRef" v-bind="gridOptions">
        <template #toolbarLeftBtn>
          <SpTree
            v-model:value="filterModel.team_id"
            :options="teamTreeOptions"
            placeholder="所属单位"
            value-field="id"
            style="width: 220px"
            :multiple="false"
          />
          <BranchSelect
            v-model:value="filterModel.branch_id"
            types="0"
            style="width: 220px"
            :team_id="filterModel.team_id"
            :disabled="!filterModel.team_id"
            placeholder="派驻分队"
          />
          <n-select
            v-model:value="filterModel.status"
            :options="statusOptions"
            placeholder="状态"
            clearable
            style="width: 140px"
          />
        </template>

        <template #check_user_default="{ row }">
          <n-tag :type="Number(row.check_user) === 0 ? 'error' : 'info'">
            {{ Number(row.check_user) === 0 ? '未设置' : '已设置' }}
          </n-tag>
        </template>
      </SpTable>
    </template>

    <template #footer>
      <n-flex justify="end" align="center">
        <n-button @click="close">
          关闭
        </n-button>
        <n-button :loading="btnLoading" @click="print">
          打卡二维码
        </n-button>
        <n-button type="success" :loading="btnLoading" @click="submit(1, true)">
          自动生成考勤
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="submit(1)">
          设置
        </n-button>
        <n-button type="error" :loading="btnLoading" @click="submit(2)">
          取消设置
        </n-button>
      </n-flex>
    </template>
  </SpModal>
</template>
