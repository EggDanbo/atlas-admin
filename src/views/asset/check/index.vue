<script setup lang="ts">
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { LogBiz } from '@/components/Logs/Biz'
import { PdfSetting } from '@/components/Print'
import { QueryGrid } from '@/components/QueryGrid'
import { useListPage } from '@/hooks/list'
import { check as api } from '@/service/api/asset'
import { useEnumStore } from '@/store/modules/enums'
import { createIcon } from '@/utils/iconify'
import toast from '@/utils/toast.ts'
import bill from './bill.vue'

const enumStore = useEnumStore()

const btnLoading = ref<boolean>(false)

const logBizRef = ref<OpenModal | null>(null)
const billRef = ref<OpenModal | null>(null)
const confirmModalRef = ref<ModalInst | null>(null)

const confirmData = ref<any>({
  id: null,
  status: null,
})

function createQueryModel() {
  return {
    format: 'atlas/asset/check',
    filter: null as string | null,
    status: null,
    bill_id: null,
    bill_no: null,
  }
}

type QueryModel = ReturnType<typeof createQueryModel> & Service.SearchCondition

const {
  tableRef,
  pageLoading,
  pdfSettingRef,
  queryModel,
  gridOptions,
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
      isOperate: true,
      title: '操作',
      width: 110,
      align: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  gridOptions: {
    immediate: false,
  },
})

const rowMoreOptions = [
  { label: '操作变更日志', key: '操作变更日志' },
]

function handleRowMore(key: string, row: Recordable) {
  if (key === '操作变更日志') {
    logBizRef.value?.open({ xid: row.id })
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

async function handleUpdate(row: Recordable, opt: string) {
  if (opt === 'confirm') {
    confirmData.value.id = row.id
    confirmData.value.status = null
    confirmModalRef.value?.open()
  }
  else {
    await cancel(row.id)
  }
}

async function confirm() {
  if (!confirmData.value.status) {
    toast.info('请选择盘点状态')
    return
  }

  btnLoading.value = true
  const { isSuccess } = await api.confirm({
    ...confirmData.value,
  }).finally(() => btnLoading.value = false)
  if (!isSuccess)
    return
  toast.success('操作成功')
  confirmModalRef.value?.close()
  await tableRef.value.refresh()
}

async function cancel(id: string) {
  const { isSuccess } = await api.cancel({
    id,
  })
  if (!isSuccess)
    return
  toast.success('操作成功')
  await tableRef.value.refresh()
}

async function handleCheck() {
  if (!queryModel.bill_id) {
    toast.warning('请选择盘点单')
    return
  }
  const { isSuccess } = await api.handleBill({
    id: queryModel.bill_id,
  })
  if (!isSuccess)
    return
  toast.success('操作成功')
}

function handleBill() {
  billRef.value?.open()
}

function billSelected(opt: any) {
  queryModel.bill_id = opt.value
  queryModel.bill_no = opt.label
}

function billClear() {
  queryModel.bill_id = null
  queryModel.bill_no = null
}
</script>

<script lang="ts">
export default { name: 'AssetCheck' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <QueryGrid :table-ref="tableRef">
          <n-gi span="2">
            <n-input-group>
              <n-input
                v-model:value="queryModel.bill_no"
                placeholder="盘点单"
                clearable
                readonly
                @clear="billClear"
              />
              <n-button type="primary" @click="handleBill">
                管理
              </n-button>
            </n-input-group>
          </n-gi>
          <n-gi span="1">
            <n-select
              v-model:value="queryModel.status"
              :options="enumStore.getEnumOptions('asset_check_status')"
              placeholder="盘点结果"
              clearable
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
            <n-button type="default" :loading="btnLoading" @click="handleCheck">
              盘点处理
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
              <n-button
                v-if="Number(row.time) === 0"
                text
                type="primary"
                @click="handleUpdate(row, 'confirm')"
              >
                盘点
              </n-button>
              <n-button v-else text type="primary" @click="handleUpdate(row, 'cancel')">
                取消
              </n-button>
              <n-divider vertical />
              <n-dropdown trigger="hover" :options="rowMoreOptions" @select="(key: string) => handleRowMore(key, row)">
                <n-button text type="primary">
                  更多
                </n-button>
              </n-dropdown>
            </div>
          </template>
        </SpTable>
      </n-card>
    </n-flex>

    <bill ref="billRef" @confirm="billSelected" />
    <PdfSetting ref="pdfSettingRef" />
    <LogBiz ref="logBizRef" />

    <SpModal
      ref="confirmModalRef"
      title="盘点状态"
      width="450"
      :mask="true"
      :draggable="true"
    >
      <template #default>
        <div class="w-full flex p-2">
          <n-select
            v-model:value="confirmData.status"
            :options="enumStore.getEnumOptions('asset_check_status')"
            clearable
          />
        </div>
      </template>

      <template #footer>
        <n-space justify="end">
          <n-button @click="confirmModalRef?.close">
            关闭
          </n-button>
          <n-button type="primary" :loading="btnLoading" @click="confirm">
            提交
          </n-button>
        </n-space>
      </template>
    </SpModal>
  </NaPage>
</template>
