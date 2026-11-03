<script setup lang="ts">
import type { OpenModal } from '@/components/SpModal'
import { SpQueryGrid } from '@/components/SpQueryGrid'
import { useListPage } from '@/hooks/list'
import { role as api } from '@/service/api/identity'
import toast from '@/utils/toast'
import detail from './detail.vue'

const detailRef = ref<OpenModal | null>(null)

const queryData = ref({
  kind: [] as DropDownItem[],
})

async function loadKindList() {
  const { isSuccess, data } = await api.getKind()
  if (isSuccess)
    queryData.value.kind = data
}

onMounted(() => loadKindList())

function createQueryModel() {
  return { format: '', name: null as string | null, kind: null as string | null }
}

type QueryModel = ReturnType<typeof createQueryModel>

const {
  tableRef,
  pageLoading,
  queryModel,
  gridOptions,
  tabPermName,
  hasPermDele,
  editAction,
  handleEdit,
} = useListPage<QueryModel>({
  api: {
    search: api.list,
  },
  detailRef,
  createQueryModel,
  columns: [
    {
      isOperate: true,
      field: 'sort',
      title: '排序',
      headerAlign: 'center',
      align: 'center',
      width: 80,
      slots: { default: 'sort' },
    },
    {
      field: 'name',
      slots: {
        default: ({ row }) => [
          h('a', { onClick: () => handleEdit('edit', row) }, row.name),
        ],
      },
    },
    {
      isOperate: true,
      title: '操作',
      width: 150,
      align: 'center',
      slots: { default: 'operate' },
      fixed: 'right',
    },
  ],
  gridOptions: {
    dataFormat: 'access/role',
    advSearchDisabled: false,
    showPageMode: false,
    pagination: false,
  },
})

function handleCopy(row: Recordable) {
  detailRef.value?.open({ id: row.id, opt: 'edit', isCopy: true })
}

async function handleRemove(row: Recordable) {
  toast.infoModal('确定删除吗？', {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      pageLoading.value = true
      const { isSuccess } = await api.delete({ id: row.id })
        .finally(() => pageLoading.value = false)
      if (isSuccess) {
        toast.success('操作成功')
        tableRef.value?.refresh()
      }
    },
  })
}

async function handleSort() {
  const data = tableRef.value.getDataSource()
  if (!data || data.length === 0)
    return
  const postData = data.map((item: Recordable) => ({
    id: item.id,
    sort: item.sort || 0,
  }))
  pageLoading.value = true
  const { isSuccess } = await api.updateSort({ list: postData })
    .finally(() => pageLoading.value = false)
  if (isSuccess) {
    toast.success('操作成功')
    tableRef.value?.refresh()
  }
}
</script>

<script lang="ts">
export default { name: 'AccessRole' }
</script>

<template>
  <NaPage :loading="pageLoading">
    <n-flex>
      <n-card :bordered="false">
        <SpQueryGrid :table-ref="tableRef" :show-fold="false">
          <n-gi span="1">
            <n-select
              v-model:value="queryModel.kind"
              :options="queryData.kind"
              placeholder="角色类型"
              clearable
              @update:value="tableRef.clear()"
            />
          </n-gi>
          <n-gi span="2">
            <n-input
              v-model:value="queryModel.name"
              placeholder="角色名称"
              type="text"
              clearable
            />
          </n-gi>
        </SpQueryGrid>
      </n-card>
      <n-card :bordered="false" class="h-full">
        <SpTable ref="tableRef" v-bind="gridOptions" @cell-dblclick="({ row }) => handleEdit('edit', row)">
          <template #toolbarLeftBtn>
            <n-button v-perm="[`${tabPermName}_ADD`]" type="default" @click="handleEdit('add')">
              <template #icon>
                <n-icon>
                  <Icon icon="ant-design:plus-outlined" />
                </n-icon>
              </template>
              新增
            </n-button>
            <n-button type="default" icon-placement="right" @click="handleSort">
              <template #icon>
                <n-icon>
                  <Icon icon="ant-design:sort-descending-outlined" />
                </n-icon>
              </template>
              更新排序
            </n-button>
          </template>
          <template #sort="{ row }">
            <n-input-number
              v-model:value="row.sort"
              :mask="false"
              :precision="0"
              :show-button="false"
            />
          </template>
          <template #operate="{ row }">
            <div class="flex items-center justify-center">
              <n-button text type="primary" @click="handleEdit('edit', row)">
                查看
              </n-button>
              <n-divider vertical />
              <n-button text type="primary" @click="handleCopy(row)">
                复制
              </n-button>
              <n-divider vertical />
              <n-button text type="primary" :disabled="!hasPermDele" @click="handleRemove(row)">
                删除
              </n-button>
            </div>
          </template>
        </SpTable>
      </n-card>
    </n-flex>
    <detail ref="detailRef" @on-action="editAction" />
  </NaPage>
</template>
