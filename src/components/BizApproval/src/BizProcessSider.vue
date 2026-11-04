<script lang="ts" setup>
import type { PropType } from 'vue'
import type { OpenModal } from '@/components/SpModal'
import { LogProcess } from '@/components/BizLogs/process'

/**
 * 单据审批流程侧栏
 *
 * 收敛详情页重复了三十余次的「二维码 + 单号 + 流程日志入口 + 竖向步骤条」。
 * 无流程数据时不渲染，与原有 v-if 行为一致。
 */
const props = defineProps({
  /** 单据模型，需含 processes / no / id / opt_return */
  model: {
    type: Object as PropType<Recordable>,
    required: true,
  },
})

const logRef = ref<OpenModal | null>(null)

const hasProcess = computed(() => {
  const list = props.model.processes
  return Array.isArray(list) && list.length > 0
})

function stepStatus(item: Recordable) {
  if (item.status === '不同意')
    return 'error'
  return item.status ? 'process' : 'wait'
}

function openLogs() {
  logRef.value?.open({ id: props.model.id })
}
</script>

<template>
  <n-layout-sider
    v-if="hasProcess"
    show-trigger="bar"
    collapse-mode="transform"
    :collapsed-width="0"
    :width="256"
    :native-scrollbar="false"
  >
    <div class="biz-process__code">
      <n-qr-code :value="model.no || ''" :size="112" padding="0" />
      <span class="biz-process__no">{{ model.no }}</span>
      <n-button
        quaternary
        round
        size="small"
        :type="model.opt_return ? 'warning' : 'info'"
        @click="openLogs"
      >
        <template #icon>
          <n-icon>
            <Icon icon="ant-design:history-outlined" />
          </n-icon>
        </template>
        流程日志
      </n-button>
    </div>

    <n-steps vertical class="biz-process__steps">
      <n-step
        v-for="(item, index) in model.processes"
        :key="index"
        :status="stepStatus(item)"
      >
        <template #title>
          <span>{{ item.step_name }}</span>
        </template>
        <template #default>
          <p class="biz-process__audit">
            {{ item.audit_name }}<span v-if="item.status"> / {{ item.status }}</span>
          </p>
          <p v-if="item.remark" class="biz-process__remark">
            {{ item.remark }}
          </p>
          <p class="biz-process__time">
            {{ item.audit_time }}
          </p>
        </template>
      </n-step>
    </n-steps>

    <LogProcess ref="logRef" />
  </n-layout-sider>
</template>

<style lang="less" scoped>
  .biz-process {
  &__code {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 18px 12px 14px;
    margin: 0 8px 4px;
    background: var(--atlas-surface-sunken);
    border: 1px solid var(--atlas-border);
    border-radius: var(--atlas-radius-md);
  }

  &__no {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--atlas-text);
    letter-spacing: 0.2px;
    word-break: break-all;
    text-align: center;
  }

  &__steps {
    padding: 14px 16px 24px;

    // 步骤标题默认偏小偏淡，在窄侧栏里几乎读不出来
    :deep(.n-step-title) {
      font-size: 13px;
      line-height: 1.5;
      color: var(--atlas-text);
    }

    :deep(.n-step-content) {
      padding-bottom: 14px;
    }
  }

  &__audit {
    font-size: 12px;
    line-height: 1.5;
    color: var(--atlas-text-secondary);
  }

  &__remark {
    margin-top: 2px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--atlas-text-tertiary);
  }

  &__time {
    margin-top: 2px;
    font-size: 11px;
    line-height: 1.5;
    color: var(--atlas-text-tertiary);
  }
}
</style>
