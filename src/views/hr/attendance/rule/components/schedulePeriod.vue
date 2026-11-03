<script lang="ts" setup>
import type { ModalInst } from '@/components/SpModal'
import toast from '@/utils/toast'

const props = defineProps({
  value: [Array] as PropType<any>,
  options: {
    type: Array,
  },
})

const emit = defineEmits(['update:value'])

const modalRef = ref<ModalInst | null>(null)

const dataList = ref<any>([])
const periodListShow = ref(false)
const periodListInfo = ref<any>([])
const periodListData = ref<any>({})
const periodListDataErrorAlert = ref({
  name: false,
  list: false,
})
const periodListNums = ref(0)
const periodListTypes = ref<any>(null)

const checkInDataOptions = ref<any>([])

/**
 * 深拷贝工具函数
 */
const deepClone = (value: any) => JSON.parse(JSON.stringify(value))

function showDrawer() {
  const data = deepClone(dataList.value)
  periodListInfo.value = data
  for (const i in periodListInfo.value) {
    periodListInfo.value[i].keys = i
  }
  periodListShow.value = true
}

function submit() {
  const data = deepClone(periodListInfo.value)
  dataList.value = data

  periodListShow.value = false
  emit('update:value', dataList.value)
}

function periodListAdd(opt: string, keys: string | number) {
  periodListTypes.value = opt
  periodListNums.value = Number(keys)

  if (opt === 'ADD') {
    periodListData.value.name = null
    periodListData.value.list = []
    scheduleCycleListAdd()
  }
  else if (opt === 'EDIT') {
    const data = JSON.parse(JSON.stringify(periodListInfo.value[keys]))
    periodListData.value = data
  }

  modalRef.value?.open()
}

function periodListRemove(keys: string | number) {
  toast.infoModal('确定删除吗？', {
    positiveText: `确定`,
    negativeText: '取消',
    onPositiveClick: () => {
      const items = periodListInfo.value
      items.splice(keys, 1)
    },
  })
}

function scheduleCycleListAdd() {
  periodListDataErrorAlert.value.list = false
  periodListData.value.list.push({
    day: null,
    name: null,
  })
}

function scheduleCycleListRemove(keys: number | string) {
  periodListDataErrorAlert.value.list = false
  const items = periodListData.value.list
  items.splice(keys, 1)
}

function formCheck() {
  let isRepat = true
  if (periodListTypes.value === 'ADD') {
    isRepat = periodListInfo.value.find(q => q.name === periodListData.value.name)
  }
  else {
    isRepat = periodListInfo.value.find(
      q => q.name === periodListData.value.name && q.keys !== periodListNums.value,
    )
  }
  if (isRepat) {
    toast.warning('周期名称不能相同')
    return true
  }

  if (!periodListData.value.name) {
    periodListDataErrorAlert.value.name = true
    toast.error('请输入周期名称')
    return true
  }
  for (const i in periodListData.value.list) {
    const items = periodListData.value.list[i]
    if (!items.name) {
      periodListDataErrorAlert.value.list = true
      toast.error('周期不能为空')
      return true
    }
  }
  return false
}

function periodListSave() {
  for (const i in periodListDataErrorAlert.value) {
    periodListDataErrorAlert.value[i] = false
  }
  if (formCheck())
    return

  if (periodListInfo.value.length === 0 || periodListTypes.value === 'ADD') {
    const data = deepClone({ ...periodListData.value })
    for (const i in data.list) {
      data.list[i].day = Number(i) + 1
    }
    periodListInfo.value.push({ ...data, keys: periodListInfo.value.length })
  }
  else if (periodListTypes.value === 'EDIT') {
    const data = deepClone({ ...periodListData.value })
    periodListInfo.value[periodListNums.value] = data
  }

  modalRef.value?.close()
}

function buildPeriodListText(arr: any, opt: string) {
  const days = arr.length
  const texts = arr.map(q => q.name).join('-')
  if (opt === 'days') {
    return `${days}天为1周期:`
  }
  else if (opt === 'text') {
    return texts
  }
}

watch(
  () => props.value,
  (value) => {
    dataList.value = value || []
  },
  {
    immediate: true,
    deep: true,
  },
)

watch(
  () => props.options,
  (value) => {
    if (value) {
      checkInDataOptions.value = value.map((q: any) => {
        return {
          value: q.checkin_date.name,
          label: q.checkin_date.name,
        }
      })
    }
  },
  {
    immediate: true,
    deep: true,
  },
)

defineExpose({ open, close })
</script>

<template>
  <div class="w-full">
    <div v-if="dataList.length === 0" class="h-[34px] flex items-center">
      <n-button type="default" @click="showDrawer">
        配置
      </n-button>
    </div>
    <div v-else class="flex gap-4">
      <n-tag v-for="(items, keys) in dataList" :key="keys">
        {{ items.name }}
      </n-tag>
      <n-button text @click="showDrawer">
        <template #icon>
          <n-icon>
            <Icon icon="ant-design:form-outlined" />
          </n-icon>
        </template>
      </n-button>
    </div>
  </div>

  <n-drawer
    v-model:show="periodListShow"
    :width="520"
    placement="right"
    :mask-closable="false"
  >
    <n-drawer-content title="配置周期" closable>
      <div>
        <n-button type="default" style="width: 120px" @click="periodListAdd('ADD', 0)">
          添加
        </n-button>
      </div>
      <div class="schedule_table">
        <dl class="schedule_table_header">
          <dd>周期名称</dd>
          <dd>周期天数与班次</dd>
          <dd>操作</dd>
        </dl>
        <div v-for="(items, keys) in periodListInfo" :key="keys">
          <dl class="schedule_table_cell">
            <dd>
              {{ items.name }}
            </dd>
            <dd>
              <p>{{ buildPeriodListText(items.list, 'days') }}</p>
              <p>{{ buildPeriodListText(items.list, 'text') }}</p>
            </dd>
            <dd>
              <div class="flex items-center justify-center">
                <n-button text type="primary" @click="periodListAdd('EDIT', keys)">
                  编辑
                </n-button>
                <n-divider vertical />
                <n-button text type="primary" @click="periodListRemove(keys)">
                  删除
                </n-button>
              </div>
            </dd>
          </dl>
        </div>
      </div>

      <template #footer>
        <n-space>
          <n-button type="primary" @click="submit">
            确认
          </n-button>
          <n-button type="default" @click="periodListShow = false">
            取消
          </n-button>
        </n-space>
      </template>

      <SpModal
        ref="modalRef"
        title="配置周期"
        width="800"
        :mask="true"
      >
        <template #default>
          <n-form label-placement="left" require-mark-placement="left" :label-width="100">
            <n-grid :cols="24" :x-gap="20">
              <n-form-item-gi
                :span="24"
                label="周期名称"
                :show-require-mark="true"
                :class="{ 'error-alert': periodListDataErrorAlert.name }"
              >
                <n-input
                  v-model:value="periodListData.name"
                  style="width: 240px"
                  :maxlength="20"
                  clearable
                  @update:value="periodListDataErrorAlert.name = false"
                />
              </n-form-item-gi>
              <n-form-item-gi :span="24" label="周期天数" :show-require-mark="true">
                <div class="schedule_cycle_list">
                  <dl
                    v-for="(items, keys) in periodListData.list"
                    :key="keys"
                    class="schedule_cycle_list_item"
                  >
                    <dd>第{{ Number(keys) + 1 }}天</dd>
                    <dd :class="{ 'error-alert': periodListDataErrorAlert.list && !items.name }">
                      <n-select v-model:value="items.name" :options="checkInDataOptions" />
                    </dd>
                    <dd>
                      <n-button
                        tertiary
                        circle
                        size="tiny"
                        :disabled="periodListData.list.length <= 1"
                        @click="scheduleCycleListRemove(keys)"
                      >
                        <template #icon>
                          <n-icon>
                            <Icon icon="ant-design:delete-outlined" />
                          </n-icon>
                        </template>
                      </n-button>
                      <n-button tertiary circle size="tiny" @click="scheduleCycleListAdd">
                        <template #icon>
                          <n-icon>
                            <Icon icon="ant-design:plus-outlined" />
                          </n-icon>
                        </template>
                      </n-button>
                    </dd>
                  </dl>
                </div>
              </n-form-item-gi>
            </n-grid>
          </n-form>
        </template>

        <template #footer>
          <n-space justify="end">
            <n-button @click="modalRef?.close">
              关闭
            </n-button>
            <n-button type="primary" @click="periodListSave">
              保存
            </n-button>
          </n-space>
        </template>
      </SpModal>
    </n-drawer-content>
  </n-drawer>
</template>

<style lang="less" scoped>
  .alert-default-text {
  font-size: 13px;
  color: rgba(11, 18, 26, 0.6);
  line-height: 1;
}

.items-list {
  height: 34px;
}
.items-text {
  width: 82px;
  font-size: 14px;
  line-height: 1;
}
.items-content {
  width: calc(100% - 82px);
}

.schedule_table {
  margin-top: 16px;
  font-size: 14px;
  dl {
    display: flex;
    align-items: center;
    &.schedule_table_header {
      background-color: #f6f6f7;
      color: rgba(11, 18, 26, 0.6);
      height: 28px;
    }
    &.schedule_table_cell {
      border-bottom: 1px solid rgba(6, 15, 26, 0.07);
      height: auto;
    }
    dd {
      display: flex;
      align-items: center;
      line-height: 1;
      &:nth-child(1) {
        width: 164px;
        padding: 0 8px 0 16px;
      }
      &:nth-child(2) {
        width: 196px;
        padding: 16px 8px;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 6px;
      }
      &:nth-child(3) {
        width: calc(100% - 164px - 196px);
        justify-content: center;
      }
      .circle_mark {
        margin-right: 8px;
      }
    }
  }
}

.schedule_cycle_list {
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  gap: 10px;
  &_item {
    display: flex;
    align-items: center;
    width: 200px;
    gap: 5px;
    dd {
      display: flex;
      &:nth-child(1) {
        width: 45px;
        font-size: 14px;
      }
      &:nth-child(2) {
        width: 90px;
      }
      &:nth-child(3) {
        width: 50px;
        justify-content: space-between;
      }
    }
  }
}

.error-alert {
  ::v-deep(.n-base-selection) {
    border: 1px solid #fc5a4e !important;
  }
  ::v-deep(.n-input) {
    border: 1px solid #fc5a4e !important;
  }
}

html[data-vxe-ui-theme='dark'] {
  .schedule_table {
    dl {
      &.schedule_table_header {
        background-color: rgba(0, 0, 0, 0.2);
        color: rgba(255, 255, 255, 0.8);
      }
      &.schedule_table_cell {
        color: #fff;
        border-bottom-color: rgba(255, 255, 255, 0.2);
      }
    }
  }
}
</style>
