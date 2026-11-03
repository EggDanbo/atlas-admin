<script lang="ts" setup>
import type { OpenModal } from '@/components/SpModal'
import type { TableColumn, TableInstance, TableProps } from '@/components/SpTable'
import { onMounted, reactive, ref, unref, useTemplateRef } from 'vue'
import { dictionary as api } from '@/service/api/system'
import { useUserStore } from '@/store/modules/user'
import { filter, forEach } from '@/utils/helper/treeHelper'
import toast from '@/utils/toast'
import { columns } from './columns'
import Edit from './edit.vue'
import Root from './root.vue'

const userStore = useUserStore()

const columnsRef = ref<TableColumn[]>(columns)

const disabledAdd = ref(false) // 禁止新增
const cardHeight = ref<number | null>(null)
const rightCardRef = useTemplateRef<HTMLDivElement>('rightCard')
const editModal = ref<OpenModal | null>(null)
const rootModal = ref<OpenModal | null>(null)
const tableRef = ref<TableInstance>({} as TableInstance)

function defModel() {
  return ({
    parent_id: '0',
    name: '',
    current: {} as Recordable,
    treeData: [] as any,
    data: [] as Recordable[],
    expanded: [] as string[],
    selectedKeys: [] as string[],
  })
}

/** 筛选条件 */
const model = reactive(defModel())

const gridOptions = reactive<TableProps>({
  showReload: true,
  immediate: false,
  showResetBtn: false,
  showQueryBtn: false,
  showPageMode: false,
  columns: unref(columnsRef),
  async fetchData(params) {
    const { isSuccess, data } = await api.search({ ...params, ...model })
    if (!isSuccess)
      return []
    return data
  },
})

// 加载选项树
async function loadTree() {
  const { isSuccess, data } = await api.getAllTree()
  if (!isSuccess)
    return
  model.data = data
  model.treeData = data
  // 展开全部分类，便于直接看到下面的选项类别
  model.expanded = data.map(item => item.key)
  // 首次进入默认选中第一个选项类别，避免右侧表格空白
  if (model.selectedKeys.length === 0) {
    const first = data?.[0]?.children?.[0]
    if (first) {
      model.selectedKeys = [first.key]
      model.current = first
      model.parent_id = first.key
      disabledAdd.value = first.kind === 1
      tableRef.value?.fetch?.()
    }
  }
}

/**
 * 搜索树节点
 * - 清空搜索词时恢复原树并折叠所有节点
 * - 有搜索词时过滤匹配节点，并自动展开所有非叶节点
 * - 若当前选中节点不在过滤结果中，则清除选中状态
 */
function searchTree(name) {
  if (!name) {
    model.treeData = model.data
    model.expanded = []
    return
  }
  // 过滤匹配的节点
  const filterData = filter(model.data, item => item.label.includes(name))
  // 自动展开所有非叶节点（先清空避免累积）
  model.expanded = []
  forEach(model.data, (item) => {
    if (item.children && item.children.length > 0) {
      model.expanded.push(item.key)
    }
  })
  model.treeData = filterData

  // 检查选中节点是否在过滤结果中，不在则清除
  if (model.selectedKeys.length > 0) {
    let found = false
    forEach(filterData, (item) => {
      if (item.key === model.selectedKeys[0]) {
        found = true
      }
    })
    if (!found) {
      model.selectedKeys = []
      model.current = {}
      model.parent_id = '0'
    }
  }
}

/**
 * 左侧树节点选择处理
 * - 选中节点时加载对应表格数据
 * - kind=1 表示固定选项，非管理员禁止新增/编辑
 * - 取消选择时重置状态并清空表格
 */
function selectedTree(_keys: Array<string>, options: Array<any>) {
  if (options.length > 0) {
    // 固定选项(kind=1)禁止新增，管理员除外
    disabledAdd.value = options[0].kind === 1
    if (userStore.isAdmin)
      disabledAdd.value = false
    model.current = options[0]
    model.parent_id = options[0].key
    tableRef.value.fetch()
  }
  else {
    // 取消选择时重置状态
    disabledAdd.value = true
    model.current = {}
    model.parent_id = '0'
    tableRef.value.clear()
  }
}

// 过滤树
function handleSearchTree(e) {
  tableRef.value.clear()
  const name = e.target.value
  searchTree(name)
}

function clearSearch() {
  model.name = ''
  tableRef.value.fetch()
}

function searchReset() {
  model.treeData = model.data
}

/**
 * 新增/编辑操作
 * - 新增：需选择父节点，检查权限和深度限制
 * - 编辑：传递行数据到编辑弹窗
 * - kind=1 为固定选项，非管理员禁止操作
 */
function handleEdit(action: string, row?: Recordable) {
  if (action === 'add') {
    const treeItem = unref(model.current)
    if (!treeItem.key) {
      toast.info('请选择根节点')
      return
    }
    if (!userStore.isAdmin && treeItem.kind === 1) {
      toast.info('固定选项不允许编辑')
      return
    }
    // 检查是否超过最大深度
    if (treeItem.depth + 1 > treeItem.max_depth) {
      toast.info('已超过最大深度')
      return
    }

    editModal.value?.open({ parent_id: treeItem.key })
  }
  else {
    if (!row)
      return
    if (!userStore.isAdmin && row.kind === 1) {
      return
    }
    editModal.value?.open({
      id: row.id,
      parent_id: row.parent_id,
      name: row.name,
      sort: row.sort,
      child: row.child,
    })
  }
}

function editAction() {
  loadTree()
  tableRef.value.fetch()
}

/**
 * 删除选项
 * - 存在子级时提示用户确认
 * - 删除成功后本地更新表格数据（避免重新请求）
 * - 同时刷新左侧树结构
 */
function handleDelete(rows: Recordable[]) {
  if (rows.length === 0)
    return
  const msg = rows.some(q => q.child === true)
    ? '选项存在子级数据，确定删除吗？'
    : '确定删除吗？'
  toast.infoModal(msg, {
    positiveText: `确定`,
    negativeText: '取消',
    onPositiveClick: async () => {
      const { isSuccess } = await api.delete({
        list: rows.map(m => m.id),
      })
      if (!isSuccess)
        return
      toast.success('删除成功')
      // 本地删除数据，避免重新请求
      const data = tableRef.value.getData()
      for (const row of rows) {
        const index = data.findIndex((q: Recordable) => q.id === row.id)
        data.splice(index, 1)
      }
      tableRef.value.setData(data)
      loadTree()
    },
  })
}

function handleRoot() {
  // 处理跟节点
  rootModal.value?.open()
}

async function updateSort() {
  const data = tableRef.value.getData()
  if (!data || data.length === 0)
    return
  const postData = data.map((s: any) => ({
    id: s.id,
    sort: s.sort || 0,
  }))
  const { isSuccess } = await api.updateSort(postData)
  if (!isSuccess)
    return
  toast.success('操作成功')
  tableRef.value.fetch()
}

onMounted(async () => {
  await loadTree()
})

// 监听右侧卡片高度变化，同步到左侧
useResizeObserver(rightCardRef, (entries) => {
  const entry = entries[0]
  if (entry) {
    cardHeight.value = entry.contentRect.height
  }
})
</script>

<script lang="ts">
export default { name: 'SystemDictionary' }
</script>

<template>
  <NaPage>
    <n-split
      direction="horizontal"
      min="300px"
      max="400px"
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
        <n-card
          :bordered="false"
          :style="cardHeight ? { height: `${cardHeight}px` } : {}"
          content-style="display: flex; flex-direction: column; overflow: hidden;"
        >
          <template #header>
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
                    <Icon icon="ant-design:search-outlined" />
                  </n-icon>
                </template>
              </n-input>
              <n-button v-if="userStore.isAdmin" type="default" @click="handleRoot()">
                管理
              </n-button>
            </n-input-group>
          </template>
          <n-tree
            v-model:selected-keys="model.selectedKeys"
            block-line
            show-line
            ellipsis
            selectable
            virtual-scroll
            class="flex-1 overflow-auto"
            :data="model.treeData"
            :default-expanded-keys="model.expanded"
            @update:selected-keys="selectedTree"
          />
        </n-card>
      </template>
      <template #2>
        <n-card ref="rightCard" :bordered="false">
          <SpTable ref="tableRef" v-bind="gridOptions">
            <template #toolbarLeftBtn>
              <n-space>
                <n-button type="default" :disabled="disabledAdd" @click="handleEdit('add')">
                  新增
                </n-button>
                <n-button
                  type="default"
                  :disabled="disabledAdd"
                  @click="handleDelete(tableRef.getCheckboxRows())"
                >
                  删除
                </n-button>
                <n-button type="default" @click="updateSort">
                  排序
                </n-button>
                <n-input
                  v-model:value="model.name"
                  type="text"
                  placeholder="搜索"
                  clearable
                  style="width: 200px; min-width: 200px"
                  @clear="clearSearch"
                  @keyup.enter="tableRef.fetch()"
                >
                  <template #prefix>
                    <n-icon>
                      <Icon icon="ant-design:search-outlined" />
                    </n-icon>
                  </template>
                </n-input>
              </n-space>
            </template>
            <template #sort="{ row }">
              <n-input-number v-model:value="row.sort" :precision="0" :show-button="false" />
            </template>
            <!-- 操作列 -->
            <template #operate="{ row }">
              <n-space justify="center">
                <n-button
                  text
                  :disabled="!userStore.isAdmin && row.kind === 1"
                  type="primary"
                  @click="handleEdit('edit', row)"
                >
                  编辑
                </n-button>
                <n-button
                  text
                  :disabled="!userStore.isAdmin && row.kind === 1"
                  type="primary"
                  @click="handleDelete([row])"
                >
                  删除
                </n-button>
              </n-space>
            </template>
          </SpTable>
        </n-card>
      </template>
    </n-split>

    <Edit ref="editModal" @on-action="editAction" />
    <Root ref="rootModal" @on-action="editAction" />
  </NaPage>
</template>
