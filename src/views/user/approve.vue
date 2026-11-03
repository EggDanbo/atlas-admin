<script setup lang="ts">
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { useRoute, useRouter } from 'vue-router'
import { PdfSetting } from '@/components/Print'
import { QueryGrid } from '@/components/QueryGrid'
import { SpDateRange } from '@/components/SpDateRange'
import { SpTree } from '@/components/SpTree'
import { useListPage } from '@/hooks/list'
import { team as teamApi } from '@/service/api/organ'
import { approve as api } from '@/service/api/workflow'
import bus from '@/utils/bus'
import { defDate, unDate } from '@/utils/dateUtil'
import { createIcon } from '@/utils/iconify'
import toast from '@/utils/toast'

const route = useRoute()
const router = useRouter()

const detailRef = ref<OpenModal | null>(null)
const processModalRef = ref<ModalInst | null>(null)
const processTitle = ref<string | null>(null)
const processTypes = ref<string | null>(null)
const processRemark = ref<string | null>(null)

const teamTreeOptions = ref<Recordable[]>([])
const btnLoading = ref(false)

const querySchemas = computed(() => ({
  status: [
    {
      value: 'wait',
      label: '未审批',
    },
    {
      value: 'pass',
      label: '已审批',
    },
  ],
}))

function createQueryModel() {
  return {
    format: 'workflow',
    filter: null as string | null,
    team_id: new Array<string>(),
    date: defDate({ start: -1, ymd: 'm' }),
    status: 'wait',
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
      width: 60,
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
          mode: 'approve',
          approve: true,
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

async function handleProcess(opt: string) {
  const rows = tableRef.value.getCheckboxRows()
  if (rows.length === 0) {
    toast.info('请选择需要操作的网格')
    return
  }

  processTypes.value = opt
  processRemark.value = null
  if (opt === '同意') {
    processTitle.value = '审批意见'
    processModalRef.value?.open()
  }
  else {
    processTitle.value = `${opt}原因`
    processModalRef.value?.open()
  }
}

async function process() {
  if (processTypes.value !== '同意' && !processRemark.value) {
    toast.error(`请填写${processTitle.value}`)
    return
  }

  const rows = tableRef.value.getCheckboxRows()
  const ids = rows.map(q => ({ id: q.biz_id, biz_class: q.biz_class }))

  btnLoading.value = true
  const { isSuccess } = await api
    .process({
      list: ids,
      status: processTypes.value,
      remark: processRemark.value,
    })
    .finally(() => (btnLoading.value = false))
  if (!isSuccess)
    return

  toast.success('操作成功')
  processModalRef.value?.close()
  await tableRef.value.refresh()
}

async function cancel() {
  const rows = tableRef.value.getCheckboxRows()
  const ids = rows.map(q => ({ id: q.biz_id, biz_class: q.biz_class }))
  if (rows.length === 0) {
    toast.info('请选择需要操作的网格')
    return
  }

  btnLoading.value = true
  const { isSuccess } = await api
    .cancel({
      list: ids,
    })
    .finally(() => (btnLoading.value = false))
  if (!isSuccess)
    return
  toast.success('操作成功')
  await tableRef.value.refresh()
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
      mode: 'approve',
      approve: true,
    })
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
export default { name: 'UserApprove' }
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
            <n-select
              v-model:value="queryModel.status"
              :options="querySchemas.status"
              placeholder="处理状态"
              clearable
              @update:value="tableRef.clear()"
            />
          </n-gi>
          <n-gi span="2">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="单号、标题及申请人"
              type="text"
              clearable
            />
          </n-gi>
          <n-gi span="3">
            <SpTree
              v-model:value="queryModel.team_id"
              :options="teamTreeOptions"
              placeholder="所属单位"
              value-field="id"
            />
          </n-gi>
          <n-gi span="2">
            <SpSearch :table-ref="tableRef" />
          </n-gi>
        </QueryGrid>
      </n-card>
      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions" @cell-dblclick="({ row }) => handleEdit('view', row)">
          <template #toolbarLeftBtn>
            <n-button-group>
              <n-button
                :disabled="
                  !queryModel.status ||
                    queryModel.status === 'pass' ||
                    queryModel.status === 'back'
                "
                @click="handleProcess('同意')"
              >
                审批
              </n-button>
              <n-button
                :disabled="
                  !queryModel.status ||
                    queryModel.status === 'pass' ||
                    queryModel.status === 'back'
                "
                @click="handleProcess('不同意')"
              >
                退回
              </n-button>
              <n-button
                :disabled="
                  !queryModel.status ||
                    queryModel.status === 'wait' ||
                    queryModel.status === 'back'
                "
                @click="cancel"
              >
                取消
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
          <!-- 操作列 -->
          <template #operate="{ row }">
            <div class="flex items-center justify-center">
              <n-button text type="primary" @click="handleEdit('view', row)">
                查看
              </n-button>
            </div>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <PdfSetting ref="pdfSettingRef" />

    <SpModal
      ref="processModalRef"
      width="500"
      :title="processTitle"
      :mask="true"
      :draggable="true"
    >
      <template #default>
        <div class="w-full flex pb-3 pt-3">
          <n-radio-group v-if="processTypes === '同意'" v-model:value="processRemark">
            <n-space>
              <n-radio value="拟同意，提交">
                拟同意，提交
              </n-radio>
              <n-radio value="同意">
                同意
              </n-radio>
            </n-space>
          </n-radio-group>
          <n-input
            v-model:value="processRemark"
            type="textarea"
            :rows="5"
            clearable
            :readonly="processTypes === '同意' ? true : false"
          />
        </div>
      </template>

      <template #footer>
        <n-space justify="end">
          <n-button @click="processModalRef?.close">
            关闭
          </n-button>
          <n-button type="primary" :loading="btnLoading" @click="process">
            提交
          </n-button>
        </n-space>
      </template>
    </SpModal>
  </NaPage>
</template>
