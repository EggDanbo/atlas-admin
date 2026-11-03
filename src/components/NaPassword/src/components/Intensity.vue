<script lang="ts" setup>
import { useThemeStore } from '@/store/modules/theme'

defineProps({
  value: {
    type: String,
    default: '',
  },
  complexity: {
    type: Boolean,
    default: false,
  },
  complexityTip: {
    type: String,
    default: '需包含字母、数字及特殊字符两种或以上组合',
  },
  minLength: {
    type: Number,
    default: 6,
  },
  maxLength: {
    type: Number,
    default: 32,
  },
  password: {
    type: Object,
    default: () => {
      return {
        strength: 0,
        tips: null,
        length: false,
        format: false,
        complexity: false,
      }
    },
  },
})
const { primaryColor } = useThemeStore()
</script>

<template>
  <div class="intensity">
    <div class="intensity-item">
      <n-space>
        <span>密码强度 </span>
        <span :class="{ active: password.strength > 0 }" class="lump" />
        <span :class="{ active: password.strength > 1 }" class="lump" />
        <span :class="{ active: password.strength > 2 }" class="lump" />
        <span :class="{ active: password.strength > 3 }" class="lump" />
        <span v-if="password.tips" class="primary-color">{{ password.tips }}</span>
      </n-space>
    </div>

    <div class="intensity-item">
      <n-flex align="center" size="small">
        <NaIcon v-if="!password.length" icon="ant-design:close-outlined" class="text-red-500" />
        <NaIcon v-else icon="ant-design:check-outlined" class="text-green-500" />
        <span>{{ minLength }}-{{ maxLength }}个字符，区分大小写，前后无空格</span>
      </n-flex>
    </div>

    <div class="intensity-item">
      <n-flex align="center" size="small">
        <NaIcon v-if="!password.format" icon="ant-design:close-outlined" class="text-red-500" />
        <NaIcon v-else icon="ant-design:check-outlined" class="text-green-500" />
        <span>字母、数字及英文符号 ~!@#$%^&*(.,)_+=-</span>
      </n-flex>
    </div>

    <div v-if="complexity" class="intensity-item">
      <n-flex align="center" size="small">
        <NaIcon v-if="!password.complexity" icon="ant-design:close-outlined" class="text-red-500" />
        <NaIcon v-else icon="ant-design:check-outlined" class="text-green-500" />
        <span>{{ complexityTip }}</span>
      </n-flex>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .intensity {
  padding: 10px 0;

  &-item {
    padding: 5px 0;
  }

  span.lump {
    width: 40px;
    height: 12px;
    background: #f0f0f0;
    display: inline-block;
    border-radius: 2px;
  }

  span.active {
    background: v-bind(primaryColor);
  }

  span.primary-color {
    color: v-bind(primaryColor);
  }
}
</style>
