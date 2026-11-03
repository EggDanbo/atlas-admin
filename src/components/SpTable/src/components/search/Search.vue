<script lang="ts" setup>
import type { VxeGridPropTypes } from 'vxe-table'

import { computed, ref, unref } from 'vue'
import { SpModal, useModal } from '@/components/SpModal'
import { useThemeStore } from '@/store/modules/theme'
import { getDateShortcuts } from '@/utils/dateUtil'
import { useTableContext } from '../../hooks/useTableContext'

const loading = ref(false)
const table: any = useTableContext()

const dateShortcuts = getDateShortcuts()

const searchOptions = [
  {
    type: 'menu',
    label: '高级查询',
    key: 'search',
  },
  {
    type: 'menu',
    label: '重置条件',
    key: 'clear',
  },
]

const { isDark, primaryColor } = storeToRefs(useThemeStore())

const tableColumn: VxeGridPropTypes.Columns = [
  {
    field: 'title',
    width: 200,
    title: '列名',
    headerAlign: 'center',
    align: 'left',
    showOverflow: true,
    slots: {
      default: 'title',
    },
  },
  {
    title: '条件',
    width: 130,
    headerAlign: 'center',
    align: 'center',
    showOverflow: true,
    slots: {
      default: 'express',
    },
  },
  {
    title: '内容',
    headerAlign: 'center',
    align: 'center',
    showOverflow: true,
    slots: {
      default: 'cont',
    },
  },
]

const [modalRegister, { open, close }] = useModal({
  title: '高级查询',
  mask: true,
  lockView: true,
})

function showModal() {
  open()
}

async function searchSelect(e) {
  if (e === 'clear') {
    table.reloadData()
  }
  else if (e === 'search') {
    showModal()
  }
}

function updateCond(row, e) {
  if (e == null) {
    row.filter_value = null
  }
  updateSelect()
}

function submit() {
  table.fetch({ page: 1 })
  close()
}

const advSearchRef = computed(() => {
  if (!table)
    return null
  return unref(table.advSearch)
})

function updateSelect() {
  advSearchRef.value.update()
}

const columnsRef = computed(() => {
  if (!table)
    return null
  return unref(advSearchRef.value.columnsRef)
})
</script>

<template>
  <div class="table-toolbar-right-icon cursor-pointer">
    <n-dropdown :options="searchOptions" trigger="hover" @select="searchSelect">
      <n-icon size="18">
        <Icon icon="ant-design:search-outlined" />
      </n-icon>
    </n-dropdown>
  </div>
  <SpModal width="900" height="560" @register="modalRegister">
    <vxe-grid
      border
      height="420"
      :row-config="{
        useKey: true,
      }"
      :columns="tableColumn"
      :data="columnsRef"
      :class="{ 'vxe-dark': isDark === true }"
    >
      <!-- 标题 -->
      <template #title="{ row }">
        {{ row.hcolumn }}{{ row.title }}
      </template>

      <!-- 条件 -->
      <template #express="{ row }">
        <n-select
          v-if="advSearchRef.componentCond.hasCondType(row.type)"
          v-model:value="row.filter_express"
          :options="advSearchRef.componentCond.getCondTypeList(row.type)"
          clearable
          @update:value="updateCond(row, $event)"
        />
      </template>

      <!-- 内容 -->
      <template #cont="{ row }">
        <n-select
          v-if="row.type === 'bool'"
          v-model:value="row.filter_value"
          :options="advSearchRef.componentCond.getCondBool(row)"
          max-tag-count="responsive"
          clearable
          @update:value="updateSelect()"
        />

        <n-select
          v-if="row.type === 'textlist'"
          v-model:value="row.filter_value"
          :options="advSearchRef.componentCond.getCondList(row, false)"
          max-tag-count="responsive"
          multiple
          clearable
          @update:value="updateSelect()"
        />

        <n-select
          v-if="row.type === 'textlistinvalue'"
          v-model:value="row.filter_value"
          :options="advSearchRef.componentCond.getCondListInValue(row)"
          max-tag-count="responsive"
          multiple
          clearable
          @update:value="updateSelect()"
        />

        <n-select
          v-if="row.type === 'numberlist'"
          v-model:value="row.filter_value"
          :options="advSearchRef.componentCond.getCondList(row, true)"
          max-tag-count="responsive"
          multiple
          clearable
          @update:value="updateSelect()"
        />

        <n-select
          v-if="row.type === 'enums'"
          v-model:value="row.filter_value"
          :options="advSearchRef.componentCond.getCondListInValue(row)"
          max-tag-count="responsive"
          multiple
          clearable
          @update:value="updateSelect()"
        />

        <n-select
          v-if="row.type === 'numberlistinvalue'"
          v-model:value="row.filter_value"
          :options="advSearchRef.componentCond.getCondListInValue(row)"
          max-tag-count="responsive"
          multiple
          clearable
          @update:value="updateSelect()"
        />

        <n-date-picker
          v-if="row.type === 'timestamp'"
          v-model:value="row.filter_value"
          :type="advSearchRef.componentCond.getDateType(row)"
          :shortcuts="dateShortcuts"
          fast-month-select
          clearable
          @update:value="updateSelect()"
        />

        <n-input
          v-if="advSearchRef.componentCond.hasTextType(row.type)"
          v-model:value="row.filter_value"
          type="text"
          clearable
          @change="updateSelect()"
        />

        <n-input-number
          v-if="advSearchRef.componentCond.hasNumberType(row.type)"
          v-model:value="row.filter_value"
          :show-button="false"
          clearable
          @update:value="updateSelect()"
        />
      </template>
    </vxe-grid>
    <template #footer>
      <n-flex justify="end">
        <n-button :loading="loading" :disabled="loading" type="primary" @click="submit">
          查询
        </n-button>
        <n-button @click="close">
          关闭
        </n-button>
      </n-flex>
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
</style>
