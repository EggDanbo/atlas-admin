<script setup lang="ts">
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { PdfSetting } from '@/components/Print'
import { QueryGrid } from '@/components/QueryGrid'
import { SpTree } from '@/components/SpTree'
import { useListPage } from '@/hooks/list'
import { team as teamApi } from '@/service/api/organ'
import { rules as api } from '@/service/api/staff/checkin'
import { createIcon } from '@/utils/iconify'
import toast from '@/utils/toast'
import statModal from '../components/statModal.vue'
import shiftModal from './components/shiftModal.vue'
import userNamesCell from './components/userNamesCell.vue'
import userSet from './components/userSet.vue'
import userSetFill from './components/userSetFill.vue'
import fixedDetail from './fixed.vue'
import flexibleDetail from './flexible.vue'
import scheduleDetail from './schedule.vue'

const fixedDetailRef = ref<OpenModal | null>(null)
const flexibleDetailRef = ref<OpenModal | null>(null)
const scheduleDetailRef = ref<OpenModal | null>(null)
const userSetRef = ref<OpenModal | null>(null)
const userSetFillRef = ref<OpenModal | null>(null)
const statusSetModalRef = ref<ModalInst | null>(null)
const shiftModalRef = ref<OpenModal | null>(null)
const statModalRef = ref<OpenModal | null>(null)

const btnLoading = ref(false)

const teamTreeOptions = ref<Recordable[]>([])
async function loadTeamTree() {
  const { isSuccess, data } = await teamApi.tree({ stoped: true })
  if (isSuccess)
    teamTreeOptions.value = data
}
onMounted(() => loadTeamTree())

const createListOptions = reactive([
  {
    label: '固定上下班',
    key: '固定上下班',
  },
  {
    label: '自由上下班',
    key: '自由上下班',
  },
  {
    label: '班次上下班',
    key: '班次上下班',
  },
])

const statusOptionsDefault = ref([
  {
    value: 0,
    label: '立即生效',
  },
  {
    value: 3,
    label: '明日生效',
  },
])
const statusOptions = ref<any>()
const statusSetInfo = ref<any>({
  id: null,
  status: null,
})

function createQueryModel() {
  return {
    format: 'atlas/checkin/rules',
    filter: null as string | null,
    group_name: null as string | null,
    cuser: null as string | null,
    team_id: null as string | null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

/** 分组人员姓名;group_id -> {0:正常,1:顶班} */
const groupUserNames = ref<Map<number, Record<number, string[]>>>(new Map())

function userNamesOf(groupId: number, types: number) {
  return groupUserNames.value.get(groupId)?.[types] ?? []
}

/** 列表加载后批量拉取当页各组的分组人员姓名 */
async function fetchWithNames(params: Recordable) {
  const { isSuccess, data } = await api.search({ ...params, ...queryModel } as QueryModel)
  if (!isSuccess)
    return []
  groupUserNames.value = new Map()
  const rows = data?.list ?? []
  if (rows.length > 0) {
    const namesRes = await api.getUserGroupNames({ ids: rows.map((m: Recordable) => m.id) })
    if (namesRes.isSuccess) {
      const map = new Map<number, Record<number, string[]>>()
      for (const item of namesRes.data ?? []) {
        const entry = map.get(item.group_id) ?? { 0: [], 1: [] }
        entry[Number(item.types)]?.push(item.name)
        map.set(item.group_id, entry)
      }
      groupUserNames.value = map
    }
  }
  return data
}

const {
  tableRef,
  pageLoading,
  pdfSettingRef,
  queryModel,
  gridOptions,
  hasPermDele,
  hasPermExport,
  hasPermPrint,
  editAction,
  handleEdit,
  handleExportOrPrint,
} = useListPage<QueryModel>({
  api,
  detailRef: fixedDetailRef,
  idField: 'id',
  createQueryModel,
  columns: [
    {
      field: 'group_name',
      slots: {
        default: ({ row }) => {
          return [
            h(
              'a',
              {
                onClick: () => handleEdit('view', row),
              },
              row.group_name,
            ),
          ]
        },
      },
    },
    {
      field: 'user_total',
      slots: { default: 'user_total' },
    },
    {
      field: 'delay_total',
      slots: { default: 'delay_total' },
    },
    {
      field: 'delay_time',
      slots: { default: 'delay_time' },
    },
    {
      field: 'status',
      slots: { default: 'status' },
    },
    {
      isOperate: true,
      title: '操作',
      width: 380,
      align: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  customHandleEdit: (action, row, extra) => {
    if (row?.id) {
      if (row.group_type === 1) {
        fixedDetailRef.value?.open({ id: row.id })
      }
      else if (row.group_type === 2) {
        scheduleDetailRef.value?.open({ id: row.id })
      }
      else if (row.group_type === 3) {
        flexibleDetailRef.value?.open({ id: row.id })
      }
    }
  },
  gridOptions: {
    fetchData: fetchWithNames,
  },
})

function handleAddMore(key: any) {
  switch (key) {
    case '固定上下班': {
      fixedDetailRef.value?.open()
      break
    }
    case '班次上下班': {
      scheduleDetailRef.value?.open()
      break
    }
    case '自由上下班': {
      flexibleDetailRef.value?.open()
      break
    }
  }
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

function handleRemove(row: Recordable) {
  toast.infoModal('确定删除吗？', {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      pageLoading.value = true
      const { isSuccess } = await api.delete({ id: row.id })
        .finally(() => pageLoading.value = false)
      if (!isSuccess)
        return
      toast.success('操作成功')
      tableRef.value?.refresh()
    },
  })
}

function handleUserSet(row: Recordable) {
  userSetRef.value?.open({ id: row.id })
}

function handleUserSetFill(row: Recordable) {
  userSetFillRef.value?.open({ id: row.id })
}

function handleStatusSet(row: Recordable) {
  if (row.status === 3) {
    statusOptions.value = statusOptionsDefault.value.filter(q => q.value < 3)
  }
  else {
    statusOptions.value = statusOptionsDefault.value.filter(q => q.value === 0 || q.value === 3)
  }

  statusSetInfo.value.id = row.id
  statusSetInfo.value.status = 0
  statusSetModalRef.value?.open()
}

async function statusSet() {
  btnLoading.value = true
  const { isSuccess } = await api
    .statusSet({
      ...statusSetInfo.value,
    })
    .finally(() => (btnLoading.value = false))
  if (!isSuccess)
    return
  toast.success('操作成功')
  statusSetModalRef.value?.close()
  await tableRef.value.refresh()
}

function handleStatModal(row: Recordable) {
  statModalRef.value?.open({
    id: row.id,
    group_name: row.group_name,
  })
}

async function handleShiftModal(row: Recordable) {
  const { isSuccess, data } = await api.getUserGroupList({
    id: row.id,
  })
  if (!isSuccess)
    return
  const users = data
  if (users.length === 0) {
    toast.info('请先选择人员或顶班人员')
    return
  }

  shiftModalRef.value?.open({
    id: row.id,
  })
}
</script>

<script lang="ts">
export default { name: 'StaffCheckinRules' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <QueryGrid :table-ref="tableRef">
          <n-gi span="2">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="考勤人工号、姓名或手机号"
              type="text"
              clearable
            />
          </n-gi>
          <n-gi span="1">
            <n-input
              v-model:value="queryModel.group_name"
              placeholder="规则名称"
              type="text"
              clearable
            />
          </n-gi>
          <n-gi span="2">
            <n-input
              v-model:value="queryModel.cuser"
              placeholder="创建或修改人"
              type="text"
              clearable
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
        </QueryGrid>
      </n-card>
      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions" @cell-dblclick="({ row }) => handleEdit('view', row)">
          <template #toolbarLeftBtn>
            <n-dropdown trigger="hover" :options="createListOptions" @select="handleAddMore">
              <n-button type="default" icon-placement="left">
                <template #icon>
                  <n-icon>
                    <Icon icon="ant-design:plus-outlined" />
                  </n-icon>
                </template>
                新增
              </n-button>
            </n-dropdown>
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

          <template #delay_time="{ row }">
            <n-tag v-if="row.delay_time > 0" :bordered="false" type="success">
              明日生效
            </n-tag>
            <n-tag v-else :bordered="false" type="info">
              已生效
            </n-tag>
          </template>

          <template #status="{ row }">
            <n-tag v-if="Number(row.status) === 0" :bordered="false" type="success">
              已生效
            </n-tag>
            <n-tag v-if="Number(row.status) === 1" :bordered="false" type="default">
              未生效
            </n-tag>
            <n-tag v-if="Number(row.status) === 2" :bordered="false" type="warning">
              有更新未生效
            </n-tag>
            <n-tag v-if="Number(row.status) === 3" :bordered="false" type="success">
              明日生效
            </n-tag>
          </template>

          <!-- 人员总数;显示姓名缩略,悬浮查看完整名单 -->
          <template #user_total="{ row }">
            <userNamesCell :names="userNamesOf(row.id, 0)" />
          </template>

          <!-- 顶班总数;显示姓名缩略,悬浮查看完整名单 -->
          <template #delay_total="{ row }">
            <userNamesCell :names="userNamesOf(row.id, 1)" />
          </template>

          <!-- 操作列 -->
          <template #operate="{ row }">
            <div class="flex items-center justify-start" style="padding: 0 5px">
              <n-button text type="primary" @click="handleEdit('view', row)">
                查看
              </n-button>
              <n-divider vertical />
              <n-button text type="primary" :disabled="!hasPermDele" @click="handleRemove(row)">
                删除
              </n-button>
              <n-divider vertical />
              <n-button text type="primary" @click="handleUserSet(row)">
                人员
              </n-button>
              <n-divider vertical />
              <n-button text type="primary" @click="handleUserSetFill(row)">
                顶班
              </n-button>
              <n-divider v-if="Number(row.group_type) === 2" vertical />
              <n-button v-if="Number(row.group_type) === 2" text type="primary" @click="handleShiftModal(row)">
                排班
              </n-button>
              <n-divider vertical />
              <n-button text type="primary" @click="handleStatModal(row)">
                打卡统计
              </n-button>
              <n-divider v-if="Number(row.status) !== 0" vertical />
              <n-button v-if="Number(row.status) !== 0" text type="primary" @click="handleStatusSet(row)">
                状态设置
              </n-button>
            </div>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <fixedDetail ref="fixedDetailRef" @on-action="editAction" />
    <flexibleDetail ref="flexibleDetailRef" @on-action="editAction" />
    <scheduleDetail ref="scheduleDetailRef" @on-action="editAction" />
    <userSet ref="userSetRef" @on-action="editAction" />
    <userSetFill ref="userSetFillRef" @on-action="editAction" />
    <shiftModal ref="shiftModalRef" @on-action="editAction" />
    <statModal ref="statModalRef" />
    <PdfSetting ref="pdfSettingRef" />

    <SpModal
      ref="statusSetModalRef"
      title="状态设置"
      width="450"
      :mask="true"
      :draggable="true"
    >
      <template #default>
        <div class="w-full pb-6 pt-2">
          <n-select v-model:value="statusSetInfo.status" :options="statusOptions" />
        </div>
      </template>

      <template #footer>
        <n-space justify="end">
          <n-button @click="statusSetModalRef?.close">
            关闭
          </n-button>
          <n-button type="primary" :loading="btnLoading" @click="statusSet">
            提交
          </n-button>
        </n-space>
      </template>
    </SpModal>
  </NaPage>
</template>
