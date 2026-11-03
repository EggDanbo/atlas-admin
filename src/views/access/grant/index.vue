<script setup lang="ts">
import type { OpenModal } from '@/components/SpModal'
import { SpCascader } from '@/components/SpCascader'
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { SpTree } from '@/components/SpTree'
import { useListPage } from '@/hooks/list'
import { usePermission } from '@/hooks/permission/usePermission'
import { unit as teamApi } from '@/service/api/access'
import { permituser as api, role as roleApi } from '@/service/api/identity'
import { createIcon } from '@/utils/iconify'
import toast from '@/utils/toast'
import CodeModal from './CodeModal.vue'
import PassModal from './PassModal.vue'
import RoleModal from './RoleModal.vue'

const roleModalRef = ref<OpenModal | null>(null)
const passModalRef = ref<OpenModal | null>(null)
const codeModalRef = ref<OpenModal | null>(null)

// 密码状态选项
const pwdOptions = [
  { label: '已设置', value: 'true' },
  { label: '未设置', value: 'false' },
]

// 查询数据
const queryData = reactive({
  kind: [] as DropDownItem[],
  role: [] as Recordable[],
  team: [] as Recordable[],
})

// 加载团队树
async function loadTeamTree() {
  const { isSuccess, data } = await teamApi.tree({
    permission: [tabPermName.value!],
    fiction: true,
    stoped: true,
  })
  if (isSuccess)
    queryData.team = data
}

// 加载角色类型
async function loadKindList() {
  const { isSuccess, data } = await api.getKind()
  if (isSuccess)
    queryData.kind = data
}

// 加载角色选项（按类型分组）
async function loadRoleOptions() {
  const { isSuccess, data } = await roleApi.list({})
  if (!isSuccess)
    return
  // 按角色类型分组
  const kindMap = new Map<string, { label: string, value: string, children: { label: string, value: string }[] }>()
  data.forEach((item: Recordable) => {
    const kindLabel = item.role_desc || item.kind
    if (!kindMap.has(kindLabel)) {
      kindMap.set(kindLabel, { label: kindLabel, value: kindLabel, children: [] })
    }
    kindMap.get(kindLabel)!.children.push({ label: item.name, value: item.id })
  })
  queryData.role = Array.from(kindMap.values())
}

onMounted(() => {
  loadTeamTree()
  loadKindList()
  loadRoleOptions()
})

function createQueryModel() {
  return {
    format: 'atlas/access/grant',
    team: null as string | null,
    role_list: null as string[] | null,
    filter: null as string | null,
    pwd: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const {
  tableRef,
  pageLoading,
  queryModel,
  gridOptions,
  tabPermName,
  editAction,
} = useListPage<QueryModel>({
  api: { search: api.search },
  detailRef: roleModalRef,
  createQueryModel,
  columns: [
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
    dataFormat: 'access/grant',
    advSearchDisabled: false,
    showPageMode: true,
    pagination: true,
  },
})

const { hasPermission } = usePermission()
const hasPermSet = hasPermission([`${tabPermName.value}_SET`])
const hasPermLogon = hasPermission([`${tabPermName.value}_LOGON`])

// 更多操作选项
const moreOptions = computed(() => [
  { label: '清空所属角色', key: 'clearRole', icon: createIcon('ant-design:usergroup-delete-outlined'), disabled: !hasPermSet },
  { type: 'divider', key: 'd1' },
  { label: '设置密码登录', key: 'setPwd', icon: createIcon('ant-design:key-outlined'), disabled: !hasPermLogon },
  { label: '删除密码登录', key: 'clearPwd', icon: createIcon('ant-design:delete-outlined'), disabled: !hasPermLogon },
  { type: 'divider', key: 'd2' },
  { label: '清空用户登录', key: 'clearLogin', icon: createIcon('ant-design:logout-outlined'), disabled: !hasPermLogon },
  { label: '解除登录锁定', key: 'releaseLock', icon: createIcon('ant-design:unlock-outlined'), disabled: !hasPermLogon },
])

// 设置角色
function handleSetRole(row?: Recordable) {
  if (row) {
    roleModalRef.value?.open({ userIds: [row.id], title: `编辑[${row.name}]用户角色` })
  }
  else {
    const rows = tableRef.value.getCheckboxRows()
    if (rows.length === 0) {
      toast.warning('请选择要设置的用户')
      return
    }
    roleModalRef.value?.open({ userIds: rows.map((m: Recordable) => m.id), title: '根据选中的用户设置角色' })
  }
}

// 修改账号
function handleUpdateCode(row: Recordable) {
  codeModalRef.value?.open({ userId: row.id, code: row.code })
}

// 更多操作
async function handleMore(key: string) {
  const rows = tableRef.value.getCheckboxRows()
  if (rows.length === 0) {
    toast.warning('请选择要操作的用户')
    return
  }
  const userIds = rows.map((m: Recordable) => m.id)

  switch (key) {
    case 'clearRole':
      toast.infoModal('确定清空所选用户的角色吗？', {
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: async () => {
          pageLoading.value = true
          const { isSuccess } = await api.clearRole({ list: userIds })
            .finally(() => pageLoading.value = false)
          if (isSuccess) {
            toast.success('操作成功')
            tableRef.value?.refresh()
          }
        },
      })
      break
    case 'setPwd':
      passModalRef.value?.open({ userIds })
      break
    case 'clearPwd':
      toast.infoModal('确定清空所选用户的密码吗？', {
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: async () => {
          pageLoading.value = true
          const { isSuccess } = await api.clearPwd({ list: userIds })
            .finally(() => pageLoading.value = false)
          if (isSuccess) {
            toast.success('操作成功')
            tableRef.value?.refresh()
          }
        },
      })
      break
    case 'clearLogin':
      toast.infoModal('确定清空所选用户的登录信息吗？\n（包括密码、微信等所有登录方式）', {
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: async () => {
          pageLoading.value = true
          const { isSuccess } = await api.clearLogin({ list: userIds })
            .finally(() => pageLoading.value = false)
          if (isSuccess) {
            toast.success('操作成功')
            tableRef.value?.refresh()
          }
        },
      })
      break
    case 'releaseLock':
      toast.infoModal('确定解除所选用户的登录锁定吗？', {
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: async () => {
          pageLoading.value = true
          const { isSuccess } = await api.releaseLock({ list: userIds })
            .finally(() => pageLoading.value = false)
          if (isSuccess) {
            toast.success('操作成功')
            tableRef.value?.refresh()
          }
        },
      })
      break
  }
}

// 刷新表格
function handleRefresh() {
  tableRef.value?.refresh()
}
</script>

<script lang="ts">
export default { name: 'AccessGrant' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef">
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
            <SpCascader
              v-model:value="queryModel.role_list"
              :options="queryData.role"
              placeholder="所属角色"
              check-strategy="child"
              multiple
              @update:value="tableRef.clear()"
            />
          </n-gi>
          <n-gi span="5">
            <SpTree
              v-model:value="queryModel.team"
              :options="queryData.team"
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
        <SpTable ref="tableRef" v-bind="gridOptions" @cell-dblclick="({ row }) => handleSetRole(row)">
          <template #toolbarLeftBtn>
            <n-button :disabled="!hasPermSet" type="default" @click="handleSetRole()">
              <template #icon>
                <n-icon>
                  <Icon icon="ant-design:plus-outlined" />
                </n-icon>
              </template>
              设置角色
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
          <!-- 操作列 -->
          <template #operate="{ row }">
            <div class="flex items-center justify-center">
              <n-button text type="primary" @click="handleSetRole(row)">
                查看
              </n-button>
              <n-divider vertical />
              <n-button text type="primary" :disabled="!hasPermSet" @click="handleUpdateCode(row)">
                修改账号
              </n-button>
            </div>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <!-- 角色设置弹窗 -->
    <RoleModal ref="roleModalRef" @on-action="editAction" />
    <!-- 设置密码弹窗 -->
    <PassModal ref="passModalRef" @on-success="handleRefresh" />
    <!-- 修改账号弹窗 -->
    <CodeModal ref="codeModalRef" @on-success="handleRefresh" />
  </NaPage>
</template>
