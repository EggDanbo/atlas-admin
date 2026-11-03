<script lang="ts" setup>
import type { DataFormatColumn, TableColumn } from '../../types/table'
import { Icon } from '@iconify/vue'
// import { SettingsOutline } from '@vicons/ionicons5'
import { cloneDeep } from 'lodash-es'
import { onUnmounted, ref, unref } from 'vue'
import { SpModal, useModal } from '@/components/SpModal'

import { useThemeStore } from '@/store/modules/theme'
import { useTableContext } from '../../hooks/useTableContext'
import { columns as tableColumns } from './columns'

const loading = ref(false)
const table: any = useTableContext()
const columnsRef = ref<TableColumn[]>(tableColumns)
const columns = ref<DataFormatColumn[]>([])

const { primaryColor } = storeToRefs(useThemeStore())

const [modalRegister, { open, close }] = useModal({
  title: '网格设置',
  mask: true,
  lockView: true,
})

function showModal() {
  const data = cloneDeep(table.getDataFmtList()) as DataFormatColumn[]
  columns.value = data.map(m => ({ ...m, fixed1: m.fixed === 'left' }))
  open()
}

async function reset() {
  const { isSuccess } = await table.resetDataFmt()
  if (!isSuccess)
    return
  await table.resetColumn()
  close()
}

async function submit() {
  loading.value = true
  const cols = unref(columns) as any[]
  const data = cols.map(m => ({ ...m, fixed: m.fixed1 ? 'left' : '' }))
  const { isSuccess } = await table.saveDataFmt(data)
  loading.value = false
  if (!isSuccess)
    return
  await table.resetColumn()
  close()
}

function dragEndMethod(params: any) {
  if (params.newRow.fixed1 === true || params.oldRow.fixed1 === true) {
    return false
  }
  return true
}

function rowDragChange({ _index }) {
  const currRow = columns.value.splice(_index.oldIndex, 1)[0]
  columns.value.splice(_index.newIndex, 0, currRow!)
}

onUnmounted(() => {
  // nothing
})
</script>

<template>
  <n-tooltip trigger="hover" placement="top-start">
    <template #trigger>
      <div class="table-toolbar-right-icon cursor-pointer">
        <n-icon size="18" @click="showModal">
          <Icon icon="ant-design:setting-outlined" />
        </n-icon>
      </div>
    </template>
    <span>网格设置</span>
  </n-tooltip>
  <SpModal width="660" height="580" @register="modalRegister">
    <!-- <div v-for="item in columns" :key="item.title">{{ item.title }}</div> -->
    <vxe-grid
      border
      height="420"
      :row-config="{
        useKey: true,
        drag: true,
      }"
      :row-drag-config="{
        dragEndMethod,
      }"
      :columns="columnsRef"
      :data="columns"
      class="sortable-row"
      @row-dragend="rowDragChange"
    >
      <template #title="{ row }">
        {{ row.hcolumn }}{{ row.title }}
      </template>

      <template #width="{ row }">
        <n-input-number v-model:value="row.width" :precision="0" :show-button="false" />
      </template>

      <template #view="{ row }">
        <n-checkbox v-model:checked="row.isview" />
      </template>

      <template #print="{ row }">
        <n-checkbox v-model:checked="row.isprint" />
      </template>

      <template #fixed="{ row }">
        <n-checkbox v-model:checked="row.fixed1" />
      </template>
    </vxe-grid>
    <template #footer>
      <n-space justify="end">
        <n-button :loading="loading" :disabled="loading" type="primary" @click="submit">
          保存
        </n-button>
        <n-button type="primary" @click="reset">
          重置
        </n-button>
        <n-button @click="close">
          关闭
        </n-button>
      </n-space>
    </template>
  </SpModal>
</template>

<style lang="less" scoped>
  .table-toolbar {
  &-inner-popover-title {
    padding: 3px 0;
  }

  &-right {
    &-icon {
      margin-left: 12px;
      font-size: 16px;
      color: var(--text-color);
      cursor: pointer;

      :hover {
        color: v-bind(primaryColor);
      }
    }
  }
}

.sortable-row .drag-btn {
  cursor: move;
}

.sortable-row .vxe-body--row.sortable-ghost,
.sortable-row .vxe-body--row.sortable-chosen {
  background-color: #dfecfb;
}
</style>
