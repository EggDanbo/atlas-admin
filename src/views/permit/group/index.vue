<script setup lang="ts">
import type { OpenModal } from '@/components/SpModal'
import { QueryGrid } from '@/components/QueryGrid'
import { SpTree } from '@/components/SpTree'
import { useListPage } from '@/hooks/list'
import { usePermission } from '@/hooks/permission/usePermission'
import { permitgroup as api, permituser as userApi } from '@/service/api/identity'
import { team as teamApi } from '@/service/api/organ'
import { createIcon } from '@/utils/iconify'
import toast from '@/utils/toast'
import CodeModal from './CodeModal.vue'
import GroupModal from './GroupModal.vue'
import PassModal from './PassModal.vue'

const groupRef = ref<OpenModal | null>(null)
const passRef = ref<OpenModal | null>(null)
const codeRef = ref<OpenModal | null>(null)

const { hasPermission } = usePermission()

// 密码状态选项
const pwdOptions = [
  { label: '已设置', value: 'true' },
  { label: '未设置', value: 'false' },
]

const queryData = ref({
  team: [] as Recordable[],
  groupList: [] as DropDownItem[],
})

async function loadTeamTree() {
  const { isSuccess, data } = await teamApi.tree({ fiction: true, stoped: true })
  if (isSuccess)
    queryData.value.team = data
}

async function loadGroupEnums() {
  const { isSuccess, data } = await api.getGroupEnum()
  if (isSuccess)
    queryData.value.groupList = data
}

onMounted(() => {
  loadTeamTree()
  loadGroupEnums()
})

function createQueryModel() {
  return {
    format: 'permit/group',
    team: [] as string[],
    group_list: null as string[] | null,
    filter: null as string | null,
    pwd: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel>

const {
  tableRef,
  pageLoading,
  queryModel,
  gridOptions,
  handleEdit,
} = useListPage<QueryModel>({
  api: {
    search: api.search,
  },
  detailRef: groupRef,
  createQueryModel,
  columns: [
    {
      field: 'name',
      title: '姓名',
      headerAlign: 'center',
      align: 'left',
      minWidth: 100,
    },
    {
      field: 'code',
      title: '账号',
      headerAlign: 'center',
      align: 'left',
      minWidth: 100,
    },
    {
      field: 'mobile',
      title: '手机号',
      headerAlign: 'center',
      align: 'left',
      minWidth: 120,
    },
    {
      field: 'team_name',
      title: '所属单位',
      headerAlign: 'center',
      align: 'left',
      minWidth: 150,
    },
    {
      field: 'perm_name',
      title: '分组权限',
      headerAlign: 'center',
      align: 'left',
      minWidth: 120,
    },
    {
      field: 'working',
      title: '工作中',
      headerAlign: 'center',
      align: 'center',
      width: 80,
      slots: {
        default: ({ row }) => [h('span', row.working ? '是' : '否')],
      },
    },
    {
      isOperate: true,
      title: '操作',
      width: 130,
      align: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  gridOptions: {
    dataFormat: 'permit/group',
    advSearchDisabled: false,
    showPageMode: false,
  },
})

function handleGroupAction() {
  tableRef.value?.refresh()
}

function openGroupModal(row: Recordable) {
  handleEdit('view', row, { user_id: row.id, team_id: row.team_id, name: row.name })
}

function handleOpenWorking() {
  const rows = tableRef.value?.getCheckboxRows() || []
  if (rows.length === 0) {
    toast.warning('请选择要设置的人。')
    return
  }

  pageLoading.value = true
  api.openWorking({ working: true, list: rows.map((m: Recordable) => m.id) })
    .then(({ isSuccess }) => {
      if (!isSuccess)
        return
      tableRef.value?.clearCheckBox()
      toast.success('操作成功')
      tableRef.value?.search()
    })
    .finally(() => pageLoading.value = false)
}

function handleCloseWorking() {
  const rows = tableRef.value?.getCheckboxRows() || []
  if (rows.length === 0) {
    toast.warning('请选择要设置的人。')
    return
  }

  pageLoading.value = true
  api.closeWorking({ working: false, list: rows.map((m: Recordable) => m.id) })
    .then(({ isSuccess }) => {
      if (!isSuccess)
        return
      tableRef.value?.clearCheckBox()
      toast.success('操作成功')
      tableRef.value?.search()
    })
    .finally(() => pageLoading.value = false)
}

function handleClearGroup() {
  const rows = tableRef.value?.getCheckboxRows() || []
  if (rows.length === 0) {
    toast.warning('请选择要清空的行。')
    return
  }

  toast.infoModal('确定清空分组权限吗？', {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      pageLoading.value = true
      api.clear({ list: rows.map((m: Recordable) => m.id) })
        .then(({ isSuccess }) => {
          if (!isSuccess)
            return
          tableRef.value?.clearCheckBox()
          toast.success('操作成功')
          tableRef.value?.search()
        })
        .finally(() => pageLoading.value = false)
    },
  })
}

function handleSetPass() {
  const rows = tableRef.value?.getCheckboxRows() || []
  if (rows.length === 0) {
    toast.warning('请选择要设置的人。')
    return
  }

  passRef.value?.open({ list: rows.map((m: Recordable) => m.id) })
}

function handleClearPass() {
  const rows = tableRef.value?.getCheckboxRows() || []
  if (rows.length === 0) {
    toast.warning('请选择要设置的人。')
    return
  }

  toast.infoModal('确定清空密码吗？', {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      pageLoading.value = true
      userApi.clearPwd({ list: rows.map((m: Recordable) => m.id) })
        .then(({ isSuccess }) => {
          if (!isSuccess)
            return
          toast.success('操作成功')
          tableRef.value?.search()
        })
        .finally(() => pageLoading.value = false)
    },
  })
}

function handleMore(key: string) {
  switch (key) {
    case 'clearGroup':
      handleClearGroup()
      break
    case 'setPass':
      handleSetPass()
      break
    case 'clearPass':
      handleClearPass()
      break
  }
}

function handleCodeBox(row: Recordable) {
  codeRef.value?.open({ userid: row.id, code: row.code })
}

const moreOptions = [
  { label: '清空分组权限', key: 'clearGroup', icon: createIcon('ant-design:usergroup-delete-outlined'), disabled: !hasPermission(['PERMIT_USER_ROLE_SET']) },
  { type: 'divider', key: 'd1' },
  { label: '设置密码登录', key: 'setPass', icon: createIcon('ant-design:key-outlined'), disabled: !hasPermission(['PERMIT_USER_ROLE_LOGON']) },
  { label: '删除密码登录', key: 'clearPass', icon: createIcon('ant-design:delete-outlined'), disabled: !hasPermission(['PERMIT_USER_ROLE_LOGON']) },
]
</script>

<script lang="ts">
export default { name: 'PermitGroup' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex vertical>
      <n-card :bordered="false">
        <QueryGrid :table-ref="tableRef">
          <n-gi span="1">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="姓名、账号、手机号或缩写码"
              type="text"
              clearable
            />
          </n-gi>
          <n-gi span="1">
            <n-select
              v-model:value="queryModel.pwd"
              :options="pwdOptions"
              placeholder="密码状态"
              clearable
              @update:value="tableRef.clear()"
            />
          </n-gi>
          <n-gi span="3">
            <n-select
              v-model:value="queryModel.group_list"
              placeholder="分组权限"
              max-tag-count="responsive"
              :options="queryData.groupList"
              multiple
              clearable
              @update:value="tableRef.clear()"
            />
          </n-gi>
          <n-gi span="5">
            <SpTree
              v-model:value="queryModel.team"
              :options="queryData.team"
              placeholder="所属单位"
              value-field="id"
              check-strategy="all"
            />
          </n-gi>
          <n-gi span="5">
            <SpSearch :table-ref="tableRef" />
          </n-gi>
        </QueryGrid>
      </n-card>
      <n-card :bordered="false" class="flex-1">
        <SpTable ref="tableRef" v-bind="gridOptions" @cell-dblclick="({ row }) => openGroupModal(row)">
          <template #toolbarLeftBtn>
            <n-button-group>
              <n-button type="default" @click="handleOpenWorking()">
                工作中
              </n-button>
              <n-button type="default" @click="handleCloseWorking()">
                取消工作中
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
              <n-button text type="primary" @click="openGroupModal(row)">
                查看
              </n-button>
              <n-divider vertical />
              <n-button v-perm="['PERMIT_USER_ROLE_SET']" text type="primary" @click="handleCodeBox(row)">
                修改账号
              </n-button>
            </div>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <GroupModal ref="groupRef" @on-action="handleGroupAction" />
    <PassModal ref="passRef" @on-success="tableRef.search()" />
    <CodeModal ref="codeRef" @on-success="tableRef.search()" />
  </NaPage>
</template>
