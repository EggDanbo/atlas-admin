<script setup lang="ts">
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { LogBiz } from '@/components/Logs/Biz'
import { PdfSetting } from '@/components/Print'
import { QueryGrid } from '@/components/QueryGrid'
import { SpTree } from '@/components/SpTree'
import { useListPage } from '@/hooks/list'
import { value as api } from '@/service/api/asset'
import { team as teamApi } from '@/service/api/organ'
import { useEnumStore } from '@/store/modules/enums'
import { createIcon } from '@/utils/iconify'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'

const enumStore = useEnumStore()

const dateModalRef = ref<ModalInst | null>(null)
const logBizRef = ref<OpenModal | null>(null)

const handleTypes = ref<string | null>(null)
const handleInfoDate = ref<number | null>(null)
const btnLoading = ref(false)

const teamTreeOptions = ref<Recordable[]>([])
async function loadTeamTree() {
  const tenantId = tenantStorage.get()
  if (!tenantId)
    return
  const { isSuccess, data } = await teamApi.tree({
    permission: [tabPermName.value!],
    tenant: tenantId,
    stoped: true,
  })
  if (isSuccess)
    teamTreeOptions.value = data
}

onMounted(() => loadTeamTree())

function createQueryModel() {
  return {
    format: 'atlas/asset/value',
    team_id: [],
    methods: [],
    period: null,
    name: null,
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
      isOperate: true,
      title: '操作',
      width: 60,
      align: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
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

async function dateOpenModal(opt: string) {
  handleTypes.value = opt

  const { isSuccess, data } = await api.getLast({ value: opt })
  if (!isSuccess)
    return

  if (opt === 'cancel' && Number(data) === 0) {
    toast.error('没有计提过折旧无法取消')
    return
  }

  handleInfoDate.value = Number(data) === 0 ? null : Number(data)

  dateModalRef.value?.open()
}

async function handle() {
  if (handleTypes.value === 'confirm')
    await confirm()
  if (handleTypes.value === 'cancel')
    await cancel()
}

async function confirm() {
  if (!handleInfoDate.value) {
    toast.error('请选择年月')
    return
  }

  btnLoading.value = true
  const { isSuccess } = await api
    .confirm({
      date: handleInfoDate.value,
    })
    .finally(() => (btnLoading.value = false))
  if (!isSuccess)
    return
  toast.success('操作成功')
  dateModalRef.value?.close()
  await tableRef.value.refresh()
}

async function cancel() {
  if (!handleInfoDate.value) {
    toast.error('请选择年月')
    return
  }

  btnLoading.value = true
  const { isSuccess } = await api
    .cancel({
      date: handleInfoDate.value,
    })
    .finally(() => (btnLoading.value = false))
  if (!isSuccess)
    return
  toast.success('操作成功')
  dateModalRef.value?.close()
  await tableRef.value.refresh()
}
</script>

<script lang="ts">
export default { name: 'AssetValue' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <QueryGrid :table-ref="tableRef">
          <n-gi span="1">
            <n-date-picker
              v-model:value="queryModel.period"
              placeholder="计提期间"
              type="month"
              :year-range="[2008, new Date().getFullYear() + 1]"
            />
          </n-gi>
          <n-gi span="2">
            <n-input
              v-model:value="queryModel.name"
              type="text"
              placeholder="资产名称"
              clearable
            />
          </n-gi>
          <n-gi span="2">
            <n-select
              v-model:value="queryModel.methods"
              :options="enumStore.getEnumOptions('asset_info_method')"
              placeholder="折旧方法"
              max-tag-count="responsive"
              multiple
              clearable
              @update:value="tableRef.clear()"
            />
          </n-gi>
          <n-gi span="5">
            <SpTree
              v-model:value="queryModel.team_id"
              :options="teamTreeOptions"
              placeholder="所属单位"
              value-field="id"
              :multiple="true"
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
            <n-button-group>
              <n-button type="default" @click="dateOpenModal('confirm')">
                计提
              </n-button>
              <n-button type="default" @click="dateOpenModal('cancel')">
                取消计提
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

    <PdfSetting ref="pdfSettingRef" />
    <LogBiz ref="logBizRef" />

    <SpModal
      ref="dateModalRef"
      title="计提年月"
      width="450"
      :mask="true"
      :draggable="true"
    >
      <template #default>
        <div class="w-full flex p-2">
          <n-date-picker
            v-model:value="handleInfoDate"
            type="month"
            style="width: 100%"
          />
        </div>
      </template>

      <template #footer>
        <n-space justify="end">
          <n-button @click="dateModalRef?.close">
            关闭
          </n-button>
          <n-button type="primary" :loading="btnLoading" @click="handle">
            提交
          </n-button>
        </n-space>
      </template>
    </SpModal>
  </NaPage>
</template>
