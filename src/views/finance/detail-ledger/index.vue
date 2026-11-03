<script setup lang="ts">
import type { ModalInst, OpenModal } from '@/components/SpModal'
import { format } from 'date-fns'
import { PdfSetting } from '@/components/Print'
import { QueryGrid } from '@/components/QueryGrid'
import { SpDateRange } from '@/components/SpDateRange'
import { useWindowSizeFn } from '@/hooks/help/useWindowSizeFn'
import { useListPage } from '@/hooks/list'
import { detailLedger as api } from '@/service/api/finance'
import { subject as contentApi } from '@/service/api/masterdata'
import { useUserStore } from '@/store/modules/user'
import { getYearFirstAndLastMonthTimestamp } from '@/utils/dateUtil'
import { getViewportOffset } from '@/utils/domUtils'
import { filter, forEach } from '@/utils/helper/treeHelper'
import { createIcon } from '@/utils/iconify'
import toast from '@/utils/toast'
import detail from '@/views/finance/voucher/detail.vue'

const userStore = useUserStore()

/**
 * 深拷贝工具函数
 */
const deepClone = (value: any) => JSON.parse(JSON.stringify(value))

const detailRef = ref<OpenModal | null>(null)

const exportModalRef = ref<ModalInst | null>(null)
const exportInfo = ref({
  year: null as number | null,
  content_level: null as number | null,
})

const treeRef = ref(null)
const disabledAdd = ref(true) // 禁止新增
const treeHeight = ref(150)
const contentTreeOptions = ref<Array<Recordable>>([])
const contentTreeDefault = ref<Array<Recordable>>([])
const expanded = ref<Array<string>>([])
const current = ref<Recordable>({}) // 选项树选择中的对象

async function loadContentOptions() {
  const { isSuccess, data } = await contentApi.tree({
    stoped: true,
  })
  if (!isSuccess)
    return
  contentTreeOptions.value = data
}

onMounted(() => loadContentOptions())

async function computeTreeHeight() {
  const tree = unref(treeRef)
  if (!tree)
    return
  const treeEl = tree['$el'] as any
  await nextTick()
  const { bottomIncludeBody } = getViewportOffset(treeEl)
  const height = bottomIncludeBody - 32
  treeHeight.value = height
}

const getTreeHeight = computed(() => {
  const maxHeight = `${unref(treeHeight)}px`
  return maxHeight
})

function createQueryModel() {
  return {
    format: 'atlas/finance/detail-ledger',
    date: getYearFirstAndLastMonthTimestamp() as any,
    content_code: null as string | null,
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
  editAction,
  handleExportOrPrint,
} = useListPage<QueryModel>({
  api,
  detailRef,
  idField: 'id',
  createQueryModel,
  rowClassName: ({ row }) => {
    if (row.id === '0') {
      return 'font-bold'
    }
    return null
  },
  columns: [
    {
      field: 'no',
      slots: {
        default: ({ row }) => {
          if (row.bill_id !== 0) {
            return [
              h(
                'a',
                {
                  onClick: () => handleQuery(row),
                },
                row.no,
              ),
            ]
          }
          else {
            return [row.no]
          }
        },
      },
    },
  ],
  gridOptions: {
    checkboxDisabled: true,
    pagination: false,
    immediate: false,
  },
})

const moreOptions = reactive([
  { label: '打印预览', key: 'pdf', icon: createIcon('ant-design:printer-outlined'), disabled: !hasPermPrint },
  { label: '导出Excel', key: 'excel', icon: createIcon('ant-design:file-excel-outlined'), disabled: !hasPermExport },
])

async function handleMore(key: string) {
  if (!queryModel.content_code) {
    toast.info('请选择会计科目')
    return
  }

  if (['excel', 'pdf', 'print'].includes(key)) {
    await handleExportOrPrint(key, [])
  }
}

function exportModalShow() {
  exportInfo.value.year = queryModel.date ? queryModel.date[1] : Date.now()
  exportInfo.value.content_level = null
  exportModalRef.value?.open()
}

async function handleExport(key: string) {
  if (!exportInfo.value.year) {
    toast.error('请选择导出年度')
    return
  }

  queryModel.content_code = null
  queryModel.content_level = exportInfo.value.content_level
  queryModel.year = format(exportInfo.value.year, 'yyyy')

  await handleExportOrPrint(key, [])

  exportModalRef.value?.close()
}

function handleQuery(row: Recordable) {
  detailRef.value?.open({
    id: row.bill_id,
    opt: 'view',
  })
}

function setCurrent(item: any) {
  current.value = item
}

function selectedTree(_keys: Array<string>, options: Array<any>) {
  if (options.length > 0) {
    disabledAdd.value = options[0].kind === 1 // 能否新增
    if (userStore.isAdmin)
      disabledAdd.value = false
    setCurrent(options[0])
    queryModel.content_code = options[0].code
    tableRef.value.fetch()
  }
}

function handleSearchTree(e) {
  tableRef.value.clear()
  const name = e.target.value
  searchTree(name)
}

function searchTree(name) {
  current.value = {}
  const data = deepClone(contentTreeDefault.value)
  if (!name) {
    contentTreeOptions.value = data
    expanded.value = []
    return
  }
  // 过滤
  const filterData = filter(data, item => item.label.includes(name))
  // 递归找到非叶结点的加上自动展开
  forEach(data, (item) => {
    if (item.children && item.children.length > 0) {
      expanded.value.push(item.key)
    }
  })
  contentTreeOptions.value = filterData
}

function searchReset() {
  contentTreeOptions.value = deepClone(contentTreeDefault.value)
}

useWindowSizeFn<void>(computeTreeHeight, 200)

onMounted(() => {
  nextTick(() => {
    computeTreeHeight()
  })
})
</script>

<script lang="ts">
export default { name: 'VouchBookMxflz' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <QueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="2">
            <SpDateRange
              v-model="queryModel.date"
              type="month"
              :min="new Date(2008, 0, 1).getTime()"
              :max="new Date(new Date().getFullYear() + 1, 11, 31).getTime()"
            />
          </n-gi>
        </QueryGrid>
      </n-card>
      <n-split
        direction="horizontal"
        min="300px"
        max="480px"
        default-size="300px"
        :resize-trigger-size="8"
      >
        <template #resize-trigger>
          <div
            :style="{
              height: '100%',
              backgroundColor: 'transparent',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }"
          />
        </template>
        <template #1>
          <n-card :bordered="false" class="h-full">
            <template #header>
              <div class="flex flex-col" style="gap: 15px">
                <n-input-group>
                  <n-input
                    type="text"
                    placeholder="搜索"
                    clearable
                    @keyup.enter="handleSearchTree"
                    @clear="searchReset"
                  >
                    <template #prefix>
                      <n-icon>
                        <Icon icon="ant-design:file-search-outlined" />
                      </n-icon>
                    </template>
                  </n-input>
                </n-input-group>
              </div>
            </template>
            <n-tree
              ref="treeRef"
              v-model:value="queryModel.content_code"
              block-line
              show-line
              ellipsis
              selectable
              virtual-scroll
              :data="contentTreeOptions"
              :default-expanded-keys="expanded"
              :style="{ height: getTreeHeight }"
              key-field="code"
              @update:selected-keys="selectedTree"
            />
          </n-card>
        </template>
        <template #2>
          <n-card :bordered="false" class="h-full">
            <SpTable ref="tableRef" v-bind="gridOptions">
              <template #toolbarLeftBtn>
                <n-button type="default" @click="exportModalShow">
                  年度账册
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
            </SpTable>
          </n-card>
        </template>
      </n-split>
    </n-flex>

    <detail ref="detailRef" @on-action="editAction" />
    <PdfSetting ref="pdfSettingRef" />

    <SpModal
      ref="exportModalRef"
      title="年度账册"
      width="400"
      :mask="true"
      :draggable="true"
    >
      <template #default>
        <div class="w-full flex">
          <n-form label-placement="left" require-mark-placement="left">
            <n-grid :cols="12" :x-gap="24" :y-gap="24">
              <n-form-item-gi :span="12" :show-feedback="false">
                <n-input-group>
                  <n-input-group-label>会计年度</n-input-group-label>
                  <n-date-picker
                    v-model:value="exportInfo.year"
                    placeholder="请选择"
                    type="year"
                    :year-range="[2008, new Date().getFullYear() + 1]"
                  />
                </n-input-group>
              </n-form-item-gi>
              <n-form-item-gi :span="12" :show-feedback="false">
                <n-input-group>
                  <n-input-group-label>科目级数</n-input-group-label>
                  <n-input-number v-model:value="exportInfo.content_level" min="0" max="10" />
                  <n-input-group-label>值为0时按科目设置</n-input-group-label>
                </n-input-group>
              </n-form-item-gi>
            </n-grid>
          </n-form>
        </div>
      </template>

      <template #footer>
        <n-space justify="end">
          <n-button type="primary" @click="handleExport('pdf')">
            打印预览
          </n-button>
          <n-button type="primary" @click="handleExport('excel')">
            导出Excel
          </n-button>
          <n-button @click="exportModalRef?.close">
            关闭
          </n-button>
        </n-space>
      </template>
    </SpModal>
  </NaPage>
</template>
