<script setup lang="ts">
import { useRouter } from 'vue-router'
import { workplace as api } from '@/service/api/board'
import { apply, approve } from '@/service/api/workflow'
import { useEnumStore } from '@/store/modules/enums'
import { useThemeStore } from '@/store/modules/theme'
import { useUserStore } from '@/store/modules/user'
import bus from '@/utils/bus'
import toast from '@/utils/toast'

const enumStore = useEnumStore()

const { primaryColor } = storeToRefs(useThemeStore())

const router = useRouter()

const userStore = useUserStore()

const btnLoading = ref<boolean>(false)

const viewModel = ref<any>({
  applyOptions: [],
  approveOptions: [],
  dynamiclist: [],
})

function colors(val) {
  switch (val) {
    case 'error': {
      return '#d03050'
    }
    case 'success': {
      return '#18a058'
    }
    case 'warning': {
      return '#f0a020'
    }
    default: {
      // 默认类型跟随主题主色，换主题后不会残留蓝色
      return primaryColor.value
    }
  }
}

async function getViewApplyOptions() {
  const { isSuccess, data } = await apply.search()
  if (!isSuccess)
    return
  viewModel.value.applyOptions = data.list
}

async function getViewApproveOptions() {
  const { isSuccess, data } = await approve.search({ status: 'wait' })
  if (!isSuccess)
    return
  viewModel.value.approveOptions = data.list
}

function open(items, approve = false) {
  if (Number(items.biz_id) === 1) {
    const [first, second] = items.biz_name.split('_')
    const bizName = `${first}_${second}`
    const url = bizName
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
    router.push({ name: url })
  }
  else {
    bus.emit('biz-detail:open', {
      biz_name: items.biz_route,
      biz_id: items.biz_id,
      mode: approve ? 'approve' : 'apply',
      approve,
    })
  }
}

function handleMore(opt: string) {
  if (opt === 'apply') {
    router.push({ name: `UserApply` })
  }
  else if (opt === 'approve') {
    router.push({ name: `UserApprove` })
  }
}

async function handleConfirm() {
  toast.infoModal('确定全部审批吗？', {
    positiveText: `确定`,
    negativeText: '取消',
    onPositiveClick: async () => {
      const { isSuccess } = await approve.confirm()
      if (!isSuccess)
        return
      toast.success('操作成功')
      await getViewApproveOptions()
    },
  })
}

async function vaild(text: string) {
  btnLoading.value = true
  const { isSuccess } = await api.valid({
    types: text,
  }).finally(() => btnLoading.value = false)
  if (isSuccess) {
    toast.success('操作成功')
  }
}

async function getAlter() {
  const { isSuccess, data } = await api.getAlter()
  if (isSuccess) {
    viewModel.value.dynamiclist = data
  }
}

async function load() {
  if (!userStore.isAdmin) {
    // 我的申请
    await getViewApplyOptions()

    // 我的审批
    await getViewApproveOptions()

    // 最新动态
    await getAlter()
  }
}

const { start, stop } = useTimeoutFn(async () => {
  stop()
  await load()
}, 1000 * 60)

onMounted(() => {
  load()
  start()
})

onUnmounted(() => {
  stop()
})
</script>

<template>
  <NaPage style="height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
    <n-card :bordered="false" title="工作台">
      显示个人信息、待办事项及最新变动信息等。
    </n-card>

    <div
      v-if="userStore.isAdmin"
      class="workplace w-full flex"
      style="height: calc(100% - 118px); box-sizing: border-box; padding-bottom: 6px;"
    >
      <div class="tabsBox w-full" style="padding: 20px; height: auto; border-radius: 0.25rem;">
        <n-space>
          <n-button v-for="(item, index) in enumStore.getEnumOptions('board_valid_types', 'label')" :key="index" :loading="btnLoading" @click="vaild(item.label)">
            {{ item.label }}
          </n-button>
        </n-space>
      </div>
    </div>

    <div v-if="!userStore.isAdmin" class="workplace flex" style="height: calc(100% - 118px); box-sizing: border-box;">
      <div class="workplace-box">
        <n-card
          class="tabsBox"
          :bordered="false"
          content-style="padding: 0; height: calc(100% - 60px)"
          header-style="padding: 14px"
        >
          <template #header>
            <div class="flex justify-between">
              <p style="font-size: 18px">
                我的申请
              </p>
              <n-button type="primary" text @click="handleMore('apply')">
                更多
              </n-button>
            </div>
          </template>
          <div v-if="viewModel.applyOptions" style="height: 100%">
            <n-card
              :segmented="{ content: true }"
              content-style="padding: 0 6px 10px; height: 100%;"
              :bordered="false"
              size="small"
              style="height: 100%"
            >
              <div class="h-full overflow-auto">
                <n-list v-if="viewModel.applyOptions.length > 0" :show-divider="true" hoverable>
                  <n-list-item
                    v-for="(items, keys) of viewModel.applyOptions"
                    :key="keys"
                    class="cursor-pointer"
                    @click="open(items)"
                  >
                    <n-thing>
                      <template #header>
                        <div>
                          <p class="truncate">
                            {{ items.biz_name }}
                          </p>
                        </div>
                      </template>
                      <template #header-extra>
                        <p style="font-size: 12px; line-height: 1; opacity: 0.6">
                          {{ items.team_name }} / {{ items.user_name }}
                        </p>
                      </template>
                      <template #description>
                        <div class="mt-4 flex justify-between" style="font-size: 12px">
                          <p class="text-gray-500" style="line-height: 1">
                            {{ items.content }}
                          </p>
                          <p class="text-gray-500" style="line-height: 1">
                            {{ items.ctime }}
                          </p>
                        </div>
                      </template>
                    </n-thing>
                  </n-list-item>
                </n-list>

                <div v-else style="height: 100%">
                  <n-empty class="h-full flex items-center justify-center py-5" description="暂无内容" />
                </div>
              </div>
            </n-card>
          </div>
        </n-card>

        <n-card
          class="tabsBox mt-2"
          :bordered="false"
          content-style="padding: 0; height: calc(100% - 60px)"
          header-style="padding: 14px"
        >
          <template #header>
            <div class="flex justify-between">
              <p style="font-size: 18px">
                我的审批
              </p>
              <n-space>
                <n-button type="primary" text @click="handleConfirm">
                  一键审批
                </n-button>
                <n-divider vertical />
                <n-button type="primary" text @click="handleMore('approve')">
                  更多
                </n-button>
              </n-space>
            </div>
          </template>
          <div v-if="viewModel.approveOptions" style="height: 100%">
            <n-card
              :segmented="{ content: true }"
              content-style="padding: 0 6px 10px; height: 100%;"
              :bordered="false"
              size="small"
              style="height: 100%"
            >
              <div class="h-full overflow-auto">
                <n-list v-if="viewModel.approveOptions.length > 0" :show-divider="true" hoverable>
                  <n-list-item
                    v-for="(items, keys) of viewModel.approveOptions"
                    :key="keys"
                    class="cursor-pointer"
                    @click="open(items, true)"
                  >
                    <n-thing>
                      <template #header>
                        <div>
                          <p class="truncate">
                            {{ items.biz_name }}
                          </p>
                        </div>
                      </template>
                      <template #header-extra>
                        <p style="font-size: 12px; line-height: 1; opacity: 0.6">
                          {{ items.team_name }} / {{ items.user_name }}
                        </p>
                      </template>
                      <template #description>
                        <div class="mt-4 flex justify-between" style="font-size: 12px">
                          <p class="text-gray-500" style="line-height: 1">
                            {{ items.content }}
                          </p>
                          <p class="text-gray-500" style="line-height: 1">
                            {{ items.ctime }}
                          </p>
                        </div>
                      </template>
                    </n-thing>
                  </n-list-item>
                </n-list>

                <div v-else style="height: 100%">
                  <n-empty class="h-full flex items-center justify-center py-5" description="暂无内容" />
                </div>
              </div>
            </n-card>
          </div>
        </n-card>
      </div>

      <div class="workplace-box">
        <n-card
          style="height: calc(100% - 6px)"
          class="dynamic"
          :bordered="false"
          content-style="padding: 0; height: calc(100% - 80px)"
          header-style="padding: 14px"
        >
          <template #header>
            <div class="flex justify-between">
              <p style="font-size: 18px">
                最新动态
              </p>
            </div>
          </template>
          <n-empty
            v-if="!viewModel.dynamiclist || viewModel.dynamiclist.length === 0"
            description="暂无内容"
            class="h-full flex items-center justify-center py-5"
          />
          <n-card
            v-else
            :segmented="{ content: true }"
            content-style="padding: 0 6px 10px; height: 100%;"
            :bordered="false"
            size="small"
            style="height: calc(100% - 60px)"
          >
            <div class="h-full overflow-auto">
              <n-list style="width: 100%; padding: 0 12px" hoverable>
                <n-list-item v-for="item in viewModel.dynamiclist" :key="item" style="width: 100%">
                  <n-thing style="width: 100%">
                    <template #avatar>
                      <n-avatar :size="55" :color="colors(item.types)">
                        {{ item.types }}
                      </n-avatar>
                    </template>
                    <template #header>
                      <p class="truncate text-base">
                        {{ item.title }}
                      </p>
                    </template>
                    <template #description>
                      <div class="mt-3 flex justify-between">
                        <p class="text-sm text-gray-500">
                          {{ item.date }}
                        </p>
                      </div>
                    </template>
                  </n-thing>
                </n-list-item>
              </n-list>
            </div>
          </n-card>
        </n-card>
      </div>
    </div>
  </NaPage>
</template>

<style lang="less" scoped>
.main-view {
  height: 100%;
}

.tabsBox {
  --color: #ffffff;
  background-color: var(--color);
  height: calc(50% - 7px);

  ::v-deep(.n-tabs-nav) {
    padding: 10px 0 0;
  }

  ::v-deep(.n-list) {
    .n-list-item {
      padding: 10px;
    }
  }
}

.workplace {
  justify-content: space-between;
  .workplace-box {
    width: calc(50% - 4px);
    height: 100%;

    * {
      &::-webkit-scrollbar {
        background: transparent;
        width: 8px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

.dynamic {
  ::v-deep(.n-list-item__main, .n-thing-main, .n-thing-header, .n-thing-header__title) {
    width: 100% !important;
  }

  ::v-deep(.n-thing-header-wrapper) {
    width: 90% !important;
  }
}

html[data-vxe-ui-theme='dark'] {
  .tabsBox {
    --color: rgb(24, 24, 28);
  }
}

@media screen and (max-width: 1280px) {
  .main-view {
    height: auto;
  }
}
</style>
