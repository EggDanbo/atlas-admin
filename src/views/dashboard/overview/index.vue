<script setup lang="ts">
import { useRouter } from 'vue-router'
import { overview as api } from '@/service/api/dashboard'
import { apply, approve } from '@/service/api/workflow'
import { useEnumStore } from '@/store/modules/enums'
import { useUserStore } from '@/store/modules/user'
import bus from '@/utils/bus'
import toast from '@/utils/toast'

const enumStore = useEnumStore()

const router = useRouter()

const userStore = useUserStore()

const btnLoading = ref<boolean>(false)

/** 顶部问候卡：按时段问候，并汇总当前待办规模 */
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6)
    return '夜深了'
  if (hour < 12)
    return '早上好'
  if (hour < 14)
    return '中午好'
  if (hour < 18)
    return '下午好'
  return '晚上好'
})

const todayText = computed(() => {
  const now = new Date()
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()]
  return `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日 ${week}`
})

const viewModel = ref<any>({
  applyOptions: [],
  approveOptions: [],
  dynamiclist: [],
})

/** 问候卡右侧的三个数字 */
const heroStats = computed(() => [
  { label: '待办申请', value: viewModel.value.applyOptions?.length ?? 0 },
  { label: '待办审批', value: viewModel.value.approveOptions?.length ?? 0 },
  { label: '业务动态', value: viewModel.value.dynamiclist?.length ?? 0 },
])

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
    <n-card :bordered="false" class="dash-hero" content-style="padding: 18px 20px;">
      <div class="dash-hero__row">
        <div class="dash-hero__text">
          <p class="dash-hero__greeting">
            {{ greeting }}，{{ userStore.userInfo?.name || '同事' }}
          </p>
          <p class="dash-hero__meta">
            {{ todayText }}
            <span class="dash-hero__dot" />
            待办 {{ viewModel.applyOptions.length }} 项
            <span class="dash-hero__dot" />
            待审批 {{ viewModel.approveOptions.length }} 项
          </p>
        </div>
        <div class="dash-hero__stats">
          <div v-for="item in heroStats" :key="item.label" class="dash-hero__stat">
            <strong>{{ item.value }}</strong>
            <em>{{ item.label }}</em>
          </div>
        </div>
      </div>
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
              <p class="section-title">
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
              <p class="section-title">
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
              <p class="section-title">
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
                      <n-avatar
                        :size="42"
                        color="var(--atlas-brand-soft)"
                        :style="{ color: 'var(--atlas-brand)', borderRadius: '12px', fontWeight: 600 }"
                      >
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
/* 卡片小节标题：比页面标题轻一档，形成层级 */
.section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 650;
  letter-spacing: 0.01em;
  color: var(--atlas-text);
}

/* 列表底部渐隐，提示还有内容可滚动 */
.workplace-box :deep(.overflow-auto) {
  mask-image: linear-gradient(to bottom, #000 calc(100% - 26px), transparent 100%);
}

/* 顶部问候卡 */
.dash-hero {
  background: radial-gradient(140% 120% at 0% 0%, var(--atlas-brand-soft) 0%, transparent 62%), var(--atlas-surface);

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
  }

  &__greeting {
    margin: 0;
    font-size: 19px;
    font-weight: 650;
    letter-spacing: 0.01em;
    color: var(--atlas-text);
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 6px 0 0;
    font-size: 12.5px;
    color: var(--atlas-text-tertiary);
  }

  &__dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--atlas-border-strong);
  }

  &__stats {
    display: flex;
    gap: 28px;
  }

  &__stat {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    line-height: 1.2;

    strong {
      font-size: 20px;
      font-weight: 700;
      color: var(--atlas-brand);
      font-variant-numeric: tabular-nums;
    }

    em {
      margin-top: 4px;
      font-size: 11.5px;
      font-style: normal;
      color: var(--atlas-text-tertiary);
    }
  }
}

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
