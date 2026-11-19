<script setup lang="ts">
import { getAmapConfigSource, setAmapJsConfig, verifyAmapJs } from '@/utils/amap-js'
import { setAmapKey, verifyAmapKey } from '@/utils/geocode'
import toast from '@/utils/toast'

/**
 * 地名数据源配置
 *
 * 从 LocationPicker 里拆出来的：原来主组件同时管地图、候选、数据源三件事，
 * 这里的逻辑跟地图渲染完全无关，独立成一个组件更好维护。
 *
 * 两种高德 Key 都支持：
 * - 「Web 端 (JS API)」→ Key + 安全密钥，走 SDK 的 Geocoder
 * - 「Web 服务」→ 只填 Key，走 restapi
 */
type AmapMode = 'js' | 'rest' | ''

const props = defineProps<{ mode: AmapMode }>()
const emit = defineEmits<{
  (e: 'update:mode', value: AmapMode): void
  /** 数据源变了，调用方需要重新拉一次候选 */
  (e: 'changed'): void
}>()

const keyInput = ref('')
const securityInput = ref('')
const keySaving = ref(false)
const configSource = ref(getAmapConfigSource())

const sourceLabel = computed(() => {
  if (configSource.value === 'env')
    return '环境变量'
  if (configSource.value === 'local')
    return '页面内配置'
  return '未配置'
})

const modeLabel = computed(() => {
  if (props.mode === 'js')
    return '高德 · JS API'
  if (props.mode === 'rest')
    return '高德 · Web服务'
  return 'OSM 数据'
})

async function save() {
  const key = keyInput.value.trim()
  const security = securityInput.value.trim()

  // 留空等于清除
  if (!key) {
    setAmapKey('')
    setAmapJsConfig(null)
    emit('update:mode', '')
    configSource.value = getAmapConfigSource()
    toast.success('已切回 OpenStreetMap 数据')
    emit('changed')
    return
  }

  keySaving.value = true
  try {
    if (security) {
      const result = await verifyAmapJs({ key, securityCode: security })
      if (!result.ok) {
        toast.error(result.message)
        return
      }
      setAmapJsConfig({ key, securityCode: security })
      setAmapKey('')
      emit('update:mode', 'js')
    }
    else {
      const result = await verifyAmapKey(key)
      if (!result.ok) {
        toast.error(`${result.message}。如果 Key 是「Web 端 (JS API)」类型，请同时填安全密钥`)
        return
      }
      setAmapKey(key)
      setAmapJsConfig(null)
      emit('update:mode', 'rest')
    }

    keyInput.value = ''
    securityInput.value = ''
    configSource.value = getAmapConfigSource()
    toast.success('已切换到高德数据，地名会精确到门牌')
    emit('changed')
  }
  finally {
    keySaving.value = false
  }
}

defineExpose({ refreshSource: () => (configSource.value = getAmapConfigSource()) })
</script>

<template>
  <n-popover trigger="click" placement="bottom-end" :width="340">
    <template #trigger>
      <n-button text type="primary" size="small" class="source-trigger">
        <template #icon>
          <Icon :icon="mode ? 'ant-design:check-circle-filled' : 'ant-design:info-circle-outlined'" />
        </template>
        {{ modeLabel }}
      </n-button>
    </template>

    <div class="source">
      <p class="source__title">
        地名数据源
      </p>
      <p class="source__desc">
        <template v-if="mode">
          当前走高德（{{ sourceLabel }}），门牌级地址 + 周边 POI。
        </template>
        <template v-else>
          当前走 OpenStreetMap 免费服务：国内 POI 覆盖有限，只到街区 / 路名，
          还会混进拼音名。填高德 Key 可精确到门牌。
          <br>
          <b v-if="sourceLabel === '未配置'" class="source__warn">
            配了 .env.local 还看到这句，说明 dev server 没重启 —— 环境变量只在启动时读取。
          </b>
        </template>
      </p>

      <div class="source__form">
        <n-input v-model:value="keyInput" placeholder="Key" size="small" />
        <n-input v-model:value="securityInput" placeholder="安全密钥（Web端 JS API 必填）" size="small" />
      </div>

      <div class="source__actions">
        <n-button size="small" :loading="keySaving" type="primary" ghost @click="save">
          {{ keyInput.trim() ? '保存并验证' : '清除' }}
        </n-button>
        <span class="source__hint">
          Key 与安全密钥都在
          <a href="https://console.amap.com/dev/key/app" target="_blank" rel="noreferrer">高德控制台</a>
          的 Key 详情里
        </span>
      </div>
    </div>
  </n-popover>
</template>

<style scoped lang="less">
.source-trigger {
  font-size: 12px;
  font-weight: 400;
}

.source {
  padding: 4px 2px;

  &__title {
    margin: 0 0 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--atlas-text);
  }

  &__desc {
    margin: 0 0 10px;
    font-size: 12px;
    line-height: 1.65;
    color: var(--atlas-text-tertiary);
  }

  &__warn {
    display: inline-block;
    margin-top: 6px;
    font-weight: 400;
    color: var(--atlas-brand);
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
  }

  &__hint {
    font-size: 11px;
    line-height: 1.5;
    color: var(--atlas-text-tertiary);

    a {
      color: var(--atlas-brand);
      text-decoration: none;
    }
  }
}
</style>
