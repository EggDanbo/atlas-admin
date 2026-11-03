<script lang="ts" setup>
import type { ModalInst } from '@/components/SpModal'
import type { TableProps } from '@/components/SpTable'
import printJS from 'print-js'
import { SpTree } from '@/components/SpTree'
import { BranchSelect, WorkSelect } from '@/components/TableSelect'
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
  types: 1,
  user_status: 0,
})
const addUserGroupInfo = ref<any>({
  user_id: null,
  branch_id: null,
  expire_time: null,
})

const tableRef = ref<any>(null)
const modalRef = ref<any>(null)
const addUserGroupModalRef = ref<ModalInst | null>(null)

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

async function print() {
  btnLoading.value = true
  const { isSuccess, data } = await api.qrcode({ id: rulesId.value, types: 1, print: true }).finally(() => {
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
    {
      isOperate: true,
      title: '操作',
      width: 80,
      align: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  fetchData,
  immediate: false,
  resizeHeightOffset: 140,
  showToolbarRight: false,
})

async function handleRemove(row: Recordable) {
  const { isSuccess } = await api.removeUserGroup({
    id: rulesId.value,
    user_id: row.user_id,
  })
  if (!isSuccess)
    return
  toast.success('操作成功')
  await tableRef.value.fetch({ page: 1 })
  emit('on-action', 'EDIT')
}

function handleAddUserGroup() {
  if (!filterModel.value.team_id) {
    toast.success('请先选择所属单位')
    return
  }

  addUserGroupInfo.value.user_id = null
  addUserGroupInfo.value.branch_id = null
  addUserGroupInfo.value.expire_time = null
  addUserGroupModalRef.value?.open()
}

async function addUserGroup() {
  if (!addUserGroupInfo.value.expire_time || addUserGroupInfo.value.expire_time <= Date.now()) {
    toast.error('请选择晚于当前的有效时间')
    return
  }
  const { isSuccess } = await api.addUserGroup({
    id: rulesId.value,
    ...addUserGroupInfo.value,
  })
  if (!isSuccess)
    return
  toast.success('操作成功')
  addUserGroupModalRef.value?.close()
  await tableRef.value.fetch()
  emit('on-action', 'EDIT')
}

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
    title="设置顶班人员"
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
          <n-button type="default" icon-placement="left" :disabled="filterModel.types !== 1" @click="handleAddUserGroup">
            <template #icon>
              <n-icon>
                <Icon icon="ant-design:plus-outlined" />
              </n-icon>
            </template>
            新增
          </n-button>
        </template>

        <template #check_user_default="{ row }">
          <n-tag :type="Number(row.check_user) === 0 ? 'error' : 'info'">
            {{ Number(row.check_user) === 0 ? '未设置' : '已设置' }}
          </n-tag>
        </template>

        <!-- 操作列 -->
        <template #operate="{ row }">
          <div class="flex items-center justify-center">
            <n-button
              text
              type="primary"
              :disabled="filterModel.types !== 1"
              @click="handleRemove(row)"
            >
              删除
            </n-button>
          </div>
        </template>
      </SpTable>
    </template>

    <template #footer>
      <n-flex justify="end" align="center">
        <n-button @click="close">
          关闭
        </n-button>
        <n-button :loading="btnLoading" @click="print">
          顶班二维码
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <SpModal
    ref="addUserGroupModalRef"
    title="新增顶班人员"
    width="450"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <div class="w-full pb-6 pt-2">
        <div class="form-list">
          <dl>
            <dd>人员</dd>
            <dd>
              <WorkSelect v-model:value="addUserGroupInfo.user_id" />
            </dd>
          </dl>
          <dl>
            <dd>派驻分队</dd>
            <dd>
              <BranchSelect
                v-model:value="addUserGroupInfo.branch_id"
                types="0"
                :team_id="filterModel.team_id"
                :disabled="!filterModel.team_id"
              />
            </dd>
          </dl>
          <dl>
            <dd>有效时间</dd>
            <dd>
              <n-date-picker
                v-model:value="addUserGroupInfo.expire_time"
                type="datetime"
                placeholder="请选择到期时间"
                fast-month-select
                clearable
                style="width: 100%"
              />
            </dd>
          </dl>
        </div>
      </div>
    </template>

    <template #footer>
      <n-space justify="end">
        <n-button @click="addUserGroupModalRef?.close">
          关闭
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="addUserGroup">
          提交
        </n-button>
      </n-space>
    </template>
  </SpModal>
</template>

<style lang="less" scoped>
.form-list {
  display: flex;
  flex-flow: column;
  gap: 16px;
  dl {
    display: flex;
    align-items: center;
    gap: 10px;
    dd {
      display: flex;
      &:nth-child(1) {
        flex-basis: 60px;
        justify-content: flex-end;
      }
      &:nth-child(2) {
        flex: 1;
      }
    }
  }
}
</style>
