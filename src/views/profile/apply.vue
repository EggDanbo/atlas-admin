<script setup lang="ts">
import type { OpenModal } from '@/components/SpModal'
import { useRoute, useRouter } from 'vue-router'
import { PdfSetting } from '@/components/Print'
import { QueryGrid } from '@/components/QueryGrid'
import { SpDateRange } from '@/components/SpDateRange'
import { SpTree } from '@/components/SpTree'
import { useListPage } from '@/hooks/list'
import { unit as teamApi } from '@/service/api/access'
import common from '@/service/api/common'
import { apply as api } from '@/service/api/workflow'
import bus from '@/utils/bus'
import { defDate, unDate } from '@/utils/dateUtil'
import { createIcon } from '@/utils/iconify'
import toast from '@/utils/toast'

const route = useRoute()
const router = useRouter()

const detailRef = ref<OpenModal | null>(null)

const teamTreeOptions = ref<Recordable[]>([])

function createQueryModel() {
  return {
    format: 'workflow',
    filter: null as string | null,
    team_id: new Array<string>(),
    date: defDate({ start: -1, ymd: 'm' }),
    status: null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const {
  tableRef,
  pageLoading,
  pdfSettingRef,
  queryModel,
  tabPermName,
  gridOptions,
  hasPermExport,
  hasPermPrint,
  handleEdit,
  handleExportOrPrint,
} = useListPage<QueryModel>({
  api,
  detailRef,
  idField: 'id',
  createQueryModel,
  columns: [
    {
      field: 'biz_no',
      slots: {
        default: ({ row }) => {
          return [
            h(
              'a',
              {
                onClick: () => handleEdit('view', row),
              },
              row.biz_no,
            ),
          ]
        },
      },
    },
    {
      isOperate: true,
      title: '操作',
      width: 110,
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
  customHandleEdit(action, row, extra) {
    if (action === 'view' && row) {
      if (Number(row.biz_id) === 1) {
        const [first, second] = row.biz_name.split('_')
        const bizName = `${first}_${second}`
        const url = bizName
          .split('_')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('')
        router.push({ name: url })
      }
      else {
        bus.emit('biz-detail:open', {
          biz_name: row.biz_route,
          biz_id: row.biz_id,
          mode: 'apply',
          approve: false,
        })
      }
    }
  },
})

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

function handleDetail(id, name) {
  if (Number(id) === 1) {
    const [first, second] = name.split('_')
    const bizName = `${first}_${second}`
    const url = bizName
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
    router.push({ name: url })
  }
  else {
    bus.emit('biz-detail:open', {
      biz_name: name,
      biz_id: id,
      mode: 'apply',
      approve: false,
    })
  }
}

async function handleAlert(row: Recordable) {
  pageLoading.value = true
  const { isSuccess } = await common
    .alert({
      id: row.biz_id,
    })
    .finally(() => (pageLoading.value = false))
  if (isSuccess) {
    toast.success('操作成功')
  }
}

async function loadTeamTree() {
  const { isSuccess, data } = await teamApi.tree({
    permission: [tabPermName.value!],
    stoped: true,
  })
  if (isSuccess)
    teamTreeOptions.value = data
}

onMounted(() => loadTeamTree())

onMounted(() => {
  if (history.state.id) {
    setTimeout(() => {
      handleDetail(history.state.id, history.state.name)
      history.state.id = null
      history.state.name = null
    }, 1000)
  }
})

watch(
  () => route,
  (r) => {
    if (r.name === route.name && history.state.id) {
      setTimeout(() => {
        handleDetail(history.state.id, history.state.name)
        history.state.id = null
        history.state.name = null
      }, 500)
    }
  },
  {
    deep: true,
  },
)
</script>

<script lang="ts">
export default { name: 'UserApply' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <QueryGrid :table-ref="tableRef">
          <n-gi span="2">
            <SpDateRange v-model="queryModel.date" type="date" />
          </n-gi>
          <n-gi span="1">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="单号、标题及申请人"
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
        </QueryGrid>
      </n-card>
      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions" @cell-dblclick="({ row }) => handleEdit('view', row)">
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
              <n-button text type="primary" @click="handleEdit('view', row)">
                查看
              </n-button>
              <n-divider vertical />
              <n-button text type="primary" @click="handleAlert(row)">
                催办
              </n-button>
            </div>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <PdfSetting ref="pdfSettingRef" />
  </NaPage>
</template>
