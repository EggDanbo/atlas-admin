<script lang="ts" setup>
import toast from '@/utils/toast'

const props = defineProps({
  value: [String, Number, Array] as PropType<null | number | string | string[]>,
  isText: {
    type: Boolean,
    default: false,
  },
  isSmall: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['on-action', 'update:value'])

const modalRef = ref<any>(null)
const checkInWifiMacInfo = ref<any>({
  wifiname: null,
})
const checkInWifiMacArrs = ref<any>([
  {
    value: null,
  },
  {
    value: null,
  },
  {
    value: null,
  },
  {
    value: null,
  },
  {
    value: null,
  },
  {
    value: null,
  },
])
const checkInWifiMacInputRef = ref<any>(null)
const dataList = ref<any>([])

function open() {
  checkInWifiMacInfo.value.wifiname = null
  checkInWifiMacInfo.value.wifimac = null
  for (const i in checkInWifiMacArrs.value) {
    const items = checkInWifiMacArrs.value[i]
    items.value = null
  }

  modalRef.value?.open()
}

function close() {
  modalRef.value?.close()
}

function handleWifiMac(keys: any) {
  const nums = checkInWifiMacArrs.value.length
  if (checkInWifiMacArrs.value[keys].value && checkInWifiMacArrs.value[keys].value.length === 2) {
    checkInWifiMacInputRef.value[keys].blur()
    if (keys < nums - 1) {
      checkInWifiMacInputRef.value[keys + 1].focus()
    }
  }
}

function formCheck() {
  if (!checkInWifiMacInfo.value.wifiname) {
    toast.error('请输入Wi-Fi名称')
    return true
  }
  for (const i in checkInWifiMacArrs.value) {
    const items = checkInWifiMacArrs.value[i]
    if (!items.value || items.value.length !== 2) {
      toast.error('请输入Wi-Fi正确的BBSID')
      return true
    }
  }
  return false
}

function submit() {
  if (formCheck())
    return
  const wifimac = checkInWifiMacArrs.value.map(q => q.value).join(':')

  const data = JSON.parse(JSON.stringify({ ...checkInWifiMacInfo.value, wifimac }))
  dataList.value.push(data)

  close()
  emit('update:value', dataList.value)
}

function checkInWifiMacRemove(keys: any) {
  const items = dataList.value
  items.splice(keys, 1)
  emit('update:value', dataList.value)
}

defineExpose({ open, close })
</script>

<template>
  <div class="w-full">
    <div v-if="props.isText" class="h-[34px] flex items-center">
      <n-button type="primary" text @click="open">
        添加
      </n-button>
    </div>
    <n-button v-else @click="open">
      添加
    </n-button>
    <div
      v-if="dataList.length > 0"
      class="table-list-wrapper location-table-list mt-4 w-full"
      :class="{ small: props.isSmall }"
    >
      <div class="table-list-title">
        <dl>
          <dd>Wi-Fi名称</dd>
          <dd>BSSID</dd>
        </dl>
      </div>
      <div v-for="(items, keys) in dataList" :key="keys" class="table-list-content">
        <div class="table-list-content-item truncate">
          {{ items.wifiname }}
        </div>
        <div class="table-list-content-item truncate">
          {{ items.wifimac }}
        </div>
        <div class="table-list-content-item">
          <div class="w-full flex items-center justify-center">
            <n-button text type="primary" @click="checkInWifiMacRemove(keys)">
              删除
            </n-button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <SpModal
    ref="modalRef"
    title="打卡Wi-Fi"
    width="700"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <div class="location-list w-full pb-4">
        <div class="list-wrapper mt-4 flex">
          <div class="items-text">
            Wi-Fi名称
          </div>
          <div class="items-content">
            <n-input v-model:value="checkInWifiMacInfo.wifiname" clearable style="width: 407px" />
          </div>
        </div>
        <div class="list-wrapper mt-4 flex">
          <div class="items-text">
            BSSID
          </div>
          <div class="items-content">
            <div class="w-full">
              <n-input-group>
                <div
                  v-for="(items, keys) in checkInWifiMacArrs"
                  :key="keys"
                  class="flex items-center"
                >
                  <span v-if="Number(keys) > 0" style="margin: 0 8px">:</span>
                  <n-input
                    ref="checkInWifiMacInputRef"
                    v-model:value="items.value"
                    :maxlength="2"
                    placeholder=""
                    style="width: 52px"
                    @update:value="handleWifiMac(keys)"
                  />
                </div>
              </n-input-group>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <n-space justify="end">
        <n-button @click="close">
          关闭
        </n-button>
        <n-button type="primary" @click="submit">
          确定
        </n-button>
      </n-space>
    </template>
  </SpModal>
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

.table-list-wrapper {
  border-radius: 4px;
  box-shadow: 0 0 0 1px rgba(6, 15, 26, 0.1);
  .table-list-title {
    width: 100%;
    display: flex;
    height: 32px;
    dl {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      font-size: 14px;
      background-color: rgba(5, 14, 26, 0.03);
      color: rgba(11, 18, 26, 0.6);
      padding: 0 16px;
      gap: 8px;
      dd {
        position: relative;
        line-height: 1;
        &::before {
          content: '';
          position: absolute;
          height: 14px;
          width: 1px;
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          background-color: rgba(6, 15, 26, 0.1);
        }
        &:nth-child(1) {
          flex-basis: 180px;
          &::before {
            display: none;
          }
        }
        &:nth-child(2) {
          flex-basis: calc(100% - 180px);
        }
      }
    }
  }
  .table-list-content {
    width: 100%;
    display: flex;
    position: relative;
    padding: 16px;
    gap: 8px;
    align-items: center;
    background-color: #fff;
    color: rgba(14, 19, 25, 0.9);
    // 上边框
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background-color: rgba(6, 15, 26, 0.1);
    }
    &-item {
      &:nth-child(1) {
        flex-basis: 180px;
      }
      &:nth-child(2) {
        flex-basis: calc(100% - 180px - 80px);
      }
      &:nth-child(3) {
        flex-basis: 80px;
      }
    }
  }
  .table-list-bottom {
    display: flex;
    position: relative;
    height: 40px;
    align-items: center;
    justify-content: center;
    // 上边框
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background-color: rgba(6, 15, 26, 0.1);
    }
    dl {
      width: calc(100% - 8px);
      height: calc(100% - 8px);
      transition: all 0.3s ease-in-out;
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0 12px;
      &:hover {
        background-color: rgba(6, 15, 26, 0.05);
      }
      dd {
        display: flex;
        align-items: center;
        line-height: 1;
        &:nth-child(1) {
          color: #144384;
          span {
            line-height: 1;
            margin-left: 6px;
          }
        }
        &:nth-child(2) {
          color: rgba(11, 18, 26, 0.6);
          margin-left: 12px;
        }
      }
    }
  }
}
.location-list {
  .list-wrapper {
    .items-text {
      width: 100px;
      height: 34px;
      display: flex;
      align-items: center;
    }
    .items-content {
      width: calc(100% - 100px);
    }
  }
}

.location-table-list {
  .table-list-title {
    dl {
      dd {
        &:nth-child(1) {
          flex-basis: 280px;
        }
        &:nth-child(2) {
          flex-basis: calc(100% - 280px);
        }
      }
    }
  }
  .table-list-content {
    .table-list-content-item {
      &:nth-child(1) {
        flex-basis: 280px;
      }
      &:nth-child(2) {
        flex-basis: calc(100% - 280px - 80px);
      }
    }
  }
  &.small {
    .table-list-title {
      dl {
        dd {
          &:nth-child(1) {
            flex: 1;
          }
          &:nth-child(2) {
            flex: 1;
          }
        }
        &::after {
          display: block;
          content: '';
          width: 80px;
        }
      }
    }
    .table-list-content {
      .table-list-content-item {
        &:nth-child(1) {
          flex: 1;
        }
        &:nth-child(2) {
          flex: 1;
        }
        &:nth-child(3) {
          flex-basis: 80px;
        }
      }
    }
  }
}

html[data-vxe-ui-theme='dark'] {
  .table-list-wrapper {
    .table-list-title {
      dl {
        background-color: rgba(0, 0, 0, 0.3);
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .table-list-content {
      background-color: rgba(0, 0, 0, 0.1);
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .checkin_date_desc {
    dd {
      &.title {
        color: rgba(255, 255, 255, 0.6);
      }
      &.content {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
}
</style>
