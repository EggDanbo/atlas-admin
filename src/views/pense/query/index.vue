<script setup lang="ts">
import type { OpenModal } from '@/components/SpModal'
import { PdfSetting } from '@/components/Print'
import { QueryGrid } from '@/components/QueryGrid'
import { SpDateRange } from '@/components/SpDateRange'
import { SpTree } from '@/components/SpTree'
import { useListPage } from '@/hooks/list'
import common from '@/service/api/common'
import { team as teamApi } from '@/service/api/organ'
import { query as api } from '@/service/api/pense'
import { useEnumStore } from '@/store/modules/enums'
import { defDate, unDate } from '@/utils/dateUtil'
import { createIcon } from '@/utils/iconify'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'
import AnsureDetail from '@/views/pense/ansure/detail.vue'
import ApplyDetail from '@/views/pense/apply/detail.vue'
import BorrowDetail from '@/views/pense/borrow/detail.vue'
import OrderDetail from '@/views/pense/order/detail.vue'
import PayerDetail from '@/views/pense/payer/detail.vue'
import ServeDetail from '@/views/pense/serve/detail.vue'
import TravelDetail from '@/views/pense/travel/detail.vue'

const ansureDetailRef = ref<OpenModal | null>(null)
const applyDetailRef = ref<OpenModal | null>(null)
const borrowDetailRef = ref<OpenModal | null>(null)
const orderDetailRef = ref<OpenModal | null>(null)
const payerDetailRef = ref<OpenModal | null>(null)
const serveDetailRef = ref<OpenModal | null>(null)
const travelDetailRef = ref<OpenModal | null>(null)

const enumStore = useEnumStore()

const teamTreeOptions = ref<Recordable[]>([])
async function loadTeamTree() {
  const tenantId = tenantStorage.get()
  if (!tenantId)
    return
  const { isSuccess, data } = await teamApi.tree({
    permission: [tabPermName.value!],
    tenant: tenantId,
    alone: true,
    stoped: true,
  })
  if (isSuccess)
    teamTreeOptions.value = data
}

onMounted(() => loadTeamTree())

function createQueryModel() {
  return {
    format: 'atlas/pense/bill',
    filter: null as string | null,
    date: defDate({ start: -3, ymd: 'm' }),
    team_id: null as string | null,
    status: null,
    printed: null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const {
  tableRef,
  pageLoading,
  pdfSettingRef,
  queryModel,
  gridOptions,
  tabPermName,
  hasPermExport,
  hasPermPrint,
  handleEdit,
  handleExportOrPrint,
} = useListPage<QueryModel>({
  api,
  idField: 'id',
  createQueryModel,
  columns: [
    {
      field: 'no',
      slots: {
        default: ({ row }) => {
          return [
            h(
              'a',
              {
                onClick: () => handleEdit('view', row),
              },
              row.no,
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
  customHandleEdit: (action, row, extra) => {
    if (!tenantStorage.get()) {
      toast.warning('请先选择组织机构')
      return
    }

    if (action === 'view' && row) {
      if (Number(row.types) === 1) {
        orderDetailRef.value?.open({ id: row.id, opt: 'VIEW' })
      }
      else if (Number(row.types) === 2) {
        travelDetailRef.value?.open({ id: row.id, opt: 'VIEW' })
      }
      else if (Number(row.types) === 3) {
        serveDetailRef.value?.open({ id: row.id, opt: 'VIEW' })
      }
      else if (Number(row.types) === 6) {
        applyDetailRef.value?.open({ id: row.id, opt: 'VIEW' })
      }
      else if (Number(row.types) === 7) {
        borrowDetailRef.value?.open({ id: row.id, opt: 'VIEW' })
      }
      else if (Number(row.types) === 8) {
        ansureDetailRef.value?.open({ id: row.id, opt: 'VIEW' })
      }
      else if (Number(row.types) === 9) {
        payerDetailRef.value?.open({ id: row.id, opt: 'VIEW' })
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

async function handleAlert(row: Recordable) {
  pageLoading.value = true
  const { isSuccess } = await common.alert({
    id: row.id,
    team_id: row.team_id,
  })
    .finally(() => (pageLoading.value = false))
  if (!isSuccess)
    return
  toast.success('操作成功')
}
</script>

<script lang="ts">
export default { name: 'PenseApply' }
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
              v-model:value="queryModel.types"
              :options="enumStore.getEnumOptions('pense_bill_types')"
              placeholder="单据类型"
              max-tag-count="responsive"
              multiple
              clearable
              @update:value="tableRef.clear()"
            />
          </n-gi>
          <n-gi span="1">
            <n-select
              v-model:value="queryModel.status"
              :options="enumStore.getEnumOptions('workflow_status')"
              placeholder="单据状态"
              clearable
              @update:value="tableRef.clear()"
            />
          </n-gi>
          <!-- <n-gi span="1">
            <n-select
              v-model:value="queryModel.printed"
              :options="querySchemas.printed"
              placeholder="是否打印"
              clearable
              @update:value="tableRef.clear()"
            />
          </n-gi> -->
          <n-gi span="1">
            <n-input
              v-model:value="queryModel.filter"
              placeholder="单号或申请人"
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
              <n-button text type="primary" @click="handleEdit('VIEW', row)">
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

    <AnsureDetail ref="ansureDetailRef" />
    <ApplyDetail ref="applyDetailRef" />
    <BorrowDetail ref="borrowDetailRef" />
    <OrderDetail ref="orderDetailRef" />
    <PayerDetail ref="payerDetailRef" />
    <ServeDetail ref="serveDetailRef" />
    <TravelDetail ref="travelDetailRef" />

    <PdfSetting ref="pdfSettingRef" />
  </NaPage>
</template>
