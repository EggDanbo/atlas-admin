<script lang="ts" setup>
import type { VxeGridPropTypes } from 'vxe-table'

import type { TableInstance } from '@/components/SpTable'
import { useTimeoutFn } from '@vueuse/core'
import { NText } from 'naive-ui'
import { computed, h, nextTick, ref, unref } from 'vue'
import { getDateShortcuts } from '@/utils/dateUtil'
import { getViewportOffset } from '@/utils/domUtils'

import { UserSelectProps } from './props'

const props = defineProps({
  ...UserSelectProps,
})

const emit = defineEmits(['clear', 'change'])

function handleKeyUp(e?: Event) {
  if (e)
    e.cancelBubble = true
}

const dateShortcuts = getDateShortcuts()

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

const selectRef: any = ref(null)
const tableRef = ref<TableInstance>({} as TableInstance)

const tableHeight = ref(420)

// 弹出内容宽度
const getContentWidth = computed(() => {
  return {
    width: props.contentWidth,
    minWidth: '620px',
  }
})

// 选择器宽度
const getWidth = computed(() => {
  return {
    width: props.width,
  }
})

// 弹出内容宽度
const getTableRef = computed(() => {
  return props.tableRef as TableInstance
})

const advSearchRef = computed(() => {
  return unref(getTableRef.value.advSearch)
})

const selectValue = computed(() => {
  if (!advSearchRef.value)
    return null
  return unref(advSearchRef.value.filterRef).label
})

const columnsRef = computed<any[]>(() => {
  if (!advSearchRef.value)
    return []
  return unref(advSearchRef.value.columnsRef)
})

function renderLabel(option) {
  return [
    h(
      NText,
      {},
      {
        default: () => '',
      },
    ),
    props.multiple ? option.value.label : option.label,
  ]
}

async function onShow(opt) {
  if (!opt)
    return
  const select = unref(selectRef)
  if (!select)
    return
  const selectEl = select.$el
  const headEl = selectEl.querySelector('.n-base-selection ')
  const { bottomIncludeBody, top } = getViewportOffset(headEl)
  let height = 560
  if (bottomIncludeBody < height) {
    if (top < height) {
      height = Math.max(bottomIncludeBody, top)
    }
  }
  else if (top < height && bottomIncludeBody < height) {
    height = Math.max(bottomIncludeBody, top)
  }
  height -= 140
  tableHeight.value = height

  if (tableRef.value) {
    // 推迟到下一个 DOM 更新周期之后执行
    nextTick(() => {
      const { stop } = useTimeoutFn(() => {
        stop()
        tableRef.value.recalculate()
      }, 5)
    })
  }
}

// 清空重新查询
async function clear() {
  await getTableRef.value.reloadData()
  close()
  emit('clear')
  return false
}

function search() {
  getTableRef.value.fetch({ page: 1 })
  close()
}

function updateCond(row, e) {
  if (e == null) {
    row.filter_value = null
  }
  updateSelect()
}

function updateSelect() {
  const value = advSearchRef.value.update()
  emit('change', value)
}

async function reload() {
  await tableRef?.value?.fetch({ page: 1 })
}

function close() {
  selectRef.value.focus()
  selectRef.value.blur()
}

defineExpose({ reload, clear })
</script>

<template>
  <n-select
    ref="selectRef"
    clearable
    :style="getWidth"
    :placeholder="props.placeholder"
    :value="selectValue"
    :consistent-menu-width="false"
    max-tag-count="responsive"
    :render-label="renderLabel"
    @update:show="onShow"
    @clear="clear"
  >
    <template #empty>
      <div class="w-full flex flex-col" :style="getContentWidth">
        <div class="selectContent" :style="getContentWidth">
          <vxe-grid
            ref="tableRef"
            border
            :row-config="{
              useKey: true,
            }"
            :height="tableHeight"
            :columns="tableColumn"
            :data="columnsRef"
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
                @keyup="handleKeyUp"
                @keydown="handleKeyUp"
              />

              <n-input
                v-if="advSearchRef.componentCond.hasNumberType(row.type)"
                v-model:value="row.filter_value"
                clearable
                @update:value="updateSelect()"
                @keyup="handleKeyUp"
                @keydown="handleKeyUp"
              />
            </template>
          </vxe-grid>
        </div>
        <div class="mt-[20px] flex justify-end">
          <n-button type="primary" style="margin-right: 10px" @click="search()">
            查询
          </n-button>
          <n-button @click="clear()">
            清空
          </n-button>
        </div>
      </div>
    </template>
  </n-select>
</template>
