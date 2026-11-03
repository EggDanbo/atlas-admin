<script lang="ts" setup>
import type { CaptchaData, CaptchaDataResponse, SliderCaptchaInst, TrailPoint, VerifyResult } from './types'
import sliderCaptchaApi from '@/service/api/misc/sliderCaptcha'
import { useThemeStore } from '@/store/modules/theme'
import { sliderCaptchaProps } from './props'

defineOptions({ name: 'SpSliderCaptcha' })

const props = defineProps(sliderCaptchaProps)
const emit = defineEmits<{
  success: [token: string]
  fail: [reason: number | string]
  locked: [message: string]
  close: []
}>()

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

// ========== 状态管理 ==========
const show = ref(false)
const loading = ref(false)
const verifying = ref(false)
const captchaData = ref<CaptchaData | null>(null)
const loadTime = ref(0)

// 滑块状态
const sliderX = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const trail = ref<TrailPoint[]>([])
const trailStartTime = ref(0)
const sliderHandleRef = ref<HTMLElement | null>(null)

// 验证结果状态
const verifyStatus = ref<'idle' | 'success' | 'fail' | 'locked'>('idle')
const verifyMessage = ref('')

// Promise 回调（用于 verify 方法）
let resolveVerify: ((token: string) => void) | null = null
let rejectVerify: ((error: Error) => void) | null = null

// ========== 计算属性 ==========
const sliderSize = computed(() => props.sliderWidth + props.protrusionRadius * 2)
const maxSliderX = computed(() => props.width - sliderSize.value)
const clampedSliderX = computed(() => Math.max(0, Math.min(sliderX.value, maxSliderX.value)))

// ========== 工具函数 ==========
/** 清理 Promise 回调引用 */
function clearPromiseCallbacks() {
  resolveVerify = null
  rejectVerify = null
}

/** 重置滑块和轨迹状态 */
function resetSlider() {
  sliderX.value = 0
  trail.value = []
}

/** 重置完整验证状态 */
function resetVerifyState() {
  resetSlider()
  verifyStatus.value = 'idle'
  verifyMessage.value = ''
}

/** 检查验证码是否过期 */
function isExpired() {
  return Date.now() - loadTime.value > props.captchaExpiration * 1000
}

/** 类型守卫：验证 VerifyResult 格式 */
function isVerifyResult(data: unknown): data is VerifyResult {
  return typeof data === 'object' && data !== null && 'success' in data
}

/** 获取失败消息 */
function getFailMessage(reason: number | string): string {
  const messages: Record<number | string, string> = {
    0: '验证失败，请重试',
    1: '验证码不存在',
    2: '验证码已过期',
    3: '滑块位置错误',
    4: '轨迹验证失败',
    5: '参数错误',
    6: '服务异常',
    tooslow: '滑动过慢，请重试',
    toofast: '滑动过快，请重试',
    locked: '操作过于频繁，请稍后再试',
  }
  return messages[reason] || '验证失败，请重试'
}

// ========== 核心业务逻辑 ==========
/** 加载验证码 */
async function loadCaptcha() {
  loading.value = true
  try {
    const result = await sliderCaptchaApi.create()
    if (result.isSuccess && result.data) {
      // 兼容不同的属性命名风格（后端可能返回 background/slider/y 或其他变体）
      const data = result.data as CaptchaDataResponse
      captchaData.value = {
        key: data.key || data.Key || data.id || data.Id || '',
        background: data.background || data.Background || data.backgroundimage || data.BackgroundImage || '',
        slider: data.slider || data.Slider || data.sliderimage || data.SliderImage || '',
        y: data.y ?? data.Y ?? data.slidery ?? data.SliderY ?? 0,
      }
      loadTime.value = Date.now()
    }
    else {
      verifyMessage.value = '验证码加载失败'
      verifyStatus.value = 'fail'
      console.error('[SliderCaptcha] 加载失败, isSuccess:', result.isSuccess, 'data:', result.data)
    }
  }
  catch (error) {
    verifyMessage.value = '验证码加载失败'
    verifyStatus.value = 'fail'
    console.error('[SliderCaptcha] 加载异常:', error)
  }
  finally {
    loading.value = false
  }
}

/** 刷新验证码 */
async function refreshCaptcha() {
  resetVerifyState()
  await loadCaptcha()
}

/** 处理验证失败 */
function handleVerifyFail(reason: number | string, message?: string) {
  const isLocked = reason === 7 || reason === 'locked'

  if (isLocked) {
    // 锁定状态 - 用户无法继续验证，需清理 Promise
    verifyStatus.value = 'locked'
    verifyMessage.value = message || '操作过于频繁，请稍后再试'
    emit('locked', verifyMessage.value)
    rejectVerify?.(new Error(verifyMessage.value))
    clearPromiseCallbacks()
    return
  }

  // 普通失败 - 允许用户重试，不清理 Promise
  verifyStatus.value = 'fail'
  verifyMessage.value = message || getFailMessage(reason)
  emit('fail', reason)

  if (isExpired()) {
    refreshCaptcha()
  }
  else {
    // 延迟重置滑块位置，避免闪烁
    setTimeout(resetSlider, 300)
    setTimeout(resetVerifyState, 1500)
  }
}

/** 处理验证成功 */
function handleVerifySuccess(token: string) {
  verifyStatus.value = 'success'
  emit('success', token)
  resolveVerify?.(token)
  clearPromiseCallbacks()

  if (props.autoClose) {
    setTimeout(close, props.successDuration)
  }
}

/** 处理验证结果 */
function handleVerifyResult(result: VerifyResult) {
  if (result.success) {
    handleVerifySuccess(result.verifytoken || '')
  }
  else {
    handleVerifyFail(result.reason || 0, result.message)
  }
}

/** 提交验证 */
async function submitVerify() {
  if (!captchaData.value)
    return

  verifying.value = true
  // 计算实际滑动时间：使用轨迹中最后一个点的时间
  const sliderTime = trail.value.at(-1)?.t ?? 0
  // 计算发送给后端的 X 坐标：滑块图左边缘 + 凸起半径 = 拼图块左上角位置
  const slideX = Math.round(clampedSliderX.value + props.protrusionRadius)

  try {
    const result = await sliderCaptchaApi.verify(
      captchaData.value.key,
      slideX,
      sliderTime,
      trail.value,
    )

    if (result.isSuccess && isVerifyResult(result.data)) {
      handleVerifyResult(result.data)
    }
    else {
      handleVerifyFail(6) // ServerError
      if (!isVerifyResult(result.data)) {
        console.error('[SliderCaptcha] 验证响应格式错误:', result.data)
      }
    }
  }
  catch {
    handleVerifyFail(6) // ServerError
  }
  finally {
    verifying.value = false
  }
}

// ========== 指针事件处理 ==========
function handlePointerDown(e: PointerEvent) {
  if (verifyStatus.value !== 'idle' || !captchaData.value)
    return

  isDragging.value = true
  startX.value = e.clientX - sliderX.value
  startY.value = e.clientY
  trailStartTime.value = Date.now()
  trail.value = [{ x: Math.round(sliderX.value), y: 0, t: 0 }]

  // 捕获指针
  const target = e.target as HTMLElement | null
  target?.setPointerCapture?.(e.pointerId)
}

function handlePointerMove(e: PointerEvent) {
  if (!isDragging.value)
    return

  sliderX.value = Math.max(0, Math.min(e.clientX - startX.value, maxSliderX.value))

  // 节流采集轨迹点（约 16ms 间隔）
  const now = Date.now()
  const lastPoint = trail.value.at(-1)
  if (trail.value.length < props.maxTrailPoints && (!lastPoint || now - (trailStartTime.value + lastPoint.t) > 16)) {
    trail.value.push({
      x: Math.round(sliderX.value),
      y: Math.round(e.clientY - startY.value),
      t: now - trailStartTime.value,
    })
  }
}

async function handlePointerUp(e: PointerEvent) {
  if (!isDragging.value)
    return

  // 释放指针捕获
  const target = e.target as HTMLElement | null
  target?.releasePointerCapture?.(e.pointerId)

  if (captchaData.value && trail.value.length > 0) {
    await submitVerify()
  }

  isDragging.value = false
}

// ========== 公开方法 ==========
/** 打开验证弹窗 */
async function open() {
  // 移除当前焦点，避免 aria-hidden 警告
  ;(document.activeElement as HTMLElement | null)?.blur?.()

  show.value = true
  resetVerifyState()
  await loadCaptcha()

  // 模态框渲染后将焦点设置到滑块手柄
  nextTick(() => sliderHandleRef.value?.focus())
}

/** 关闭弹窗 */
function close() {
  show.value = false
  emit('close')

  // 清理未完成的 Promise（用户直接关闭弹窗时）
  if (rejectVerify) {
    rejectVerify(new Error('验证已取消'))
    clearPromiseCallbacks()
  }
}

/** Promise 方式调用验证 */
function verify(): Promise<string> {
  return new Promise((resolve, reject) => {
    resolveVerify = resolve
    rejectVerify = reject
    open()
  })
}

defineExpose<SliderCaptchaInst>({ verify, close })
</script>

<template>
  <n-modal
    v-model:show="show"
    :title="title"
    preset="card"
    :style="{ width: `${width + 40}px` }"
    :mask-closable="false"
    :close-on-esc="false"
  >
    <div class="slider-captcha" :class="{ 'is-dark': isDark }">
      <!-- 验证区域 -->
      <div class="captcha-area" :style="{ width: `${width}px`, height: `${height}px` }">
        <!-- 加载中 -->
        <div v-if="loading" class="captcha-loading">
          <Icon icon="ant-design:loading-outlined" class="animate-spin text-2xl" />
          <span class="ml-2">加载中...</span>
        </div>

        <!-- 验证码图片 -->
        <template v-else-if="captchaData">
          <!-- 背景图（后端已返回 data:image/png;base64, 前缀） -->
          <img :src="captchaData.background" class="captcha-bg" alt="captcha background" draggable="false">

          <!-- 刷新按钮（背景图右上角） -->
          <n-button
            quaternary
            circle
            size="small"
            class="refresh-btn"
            :disabled="verifying || verifyStatus === 'locked'"
            @click="refreshCaptcha"
          >
            <template #icon>
              <n-icon><Icon icon="ant-design:reload-outlined" /></n-icon>
            </template>
          </n-button>

          <!-- 滑块图（后端已返回 data:image/png;base64, 前缀） -->
          <img
            :src="captchaData.slider"
            class="captcha-slider"
            :style="{
              top: `${captchaData.y - props.protrusionRadius}px`,
              left: `${sliderX}px`,
              width: `${sliderSize}px`,
              height: `${sliderSize}px`,
            }"
            alt="captcha slider"
            draggable="false"
          >

          <!-- 验证结果遮罩 - 仅显示失败和锁定状态 -->
          <div
            v-if="verifyStatus === 'fail' || verifyStatus === 'locked'"
            class="captcha-result-mask"
            :class="`is-${verifyStatus}`"
          >
            <div class="result-content">
              <Icon
                :icon="verifyStatus === 'fail' ? 'ant-design:close-circle-outlined' : 'ant-design:lock-outlined'"
                class="text-4xl"
                :class="verifyStatus === 'fail' ? 'text-red-500' : 'text-orange-500'"
              />
              <p class="mt-2 text-sm">
                {{ verifyMessage }}
              </p>
            </div>
          </div>
        </template>

        <!-- 加载失败 -->
        <div v-else class="captcha-error">
          <Icon icon="ant-design:warning-outlined" class="text-2xl text-red-500" />
          <span class="ml-2">加载失败</span>
          <button class="text-primary ml-4 hover:underline" @click="refreshCaptcha">
            重试
          </button>
        </div>
      </div>

      <!-- 滑块区域 -->
      <div class="slider-track" :style="{ width: `${width}px` }">
        <div class="slider-bg">
          <span v-if="sliderX === 0" class="slider-hint">向右拖动完成验证</span>
        </div>

        <div class="slider-fill" :style="{ width: `${sliderX + props.handleSize / 2}px` }" />

        <div
          ref="sliderHandleRef"
          class="slider-handle"
          :class="{ 'is-dragging': isDragging, 'is-success': verifyStatus === 'success' }"
          :style="{
            width: `${props.handleSize}px`,
            height: `${props.handleSize}px`,
            transform: `translateX(${sliderX}px)`,
          }"
          tabindex="0"
          @pointerdown="handlePointerDown"
          @pointermove="handlePointerMove"
          @pointerup="handlePointerUp"
          @pointercancel="handlePointerUp"
        >
          <Icon
            :icon="verifyStatus === 'success' ? 'ant-design:check-outlined' : verifying ? 'ant-design:loading-outlined' : 'ant-design:double-right-outlined'"
            :class="{ 'text-white': verifyStatus === 'success', 'animate-spin': verifying }"
            :size="verifyStatus === 'success' || verifying ? undefined : 3"
          />
        </div>
      </div>
    </div>
  </n-modal>
</template>

<style lang="less" scoped>
.slider-captcha {
  position: relative;
  user-select: none;
}

// 验证区域 - 增大圆角 + 边框
.captcha-area {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #f5f5f5;
}

.captcha-loading,
.captcha-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #999;
}

.captcha-bg {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: fill; /* 精确匹配容器尺寸，不裁剪 */
}

.captcha-slider {
  position: absolute;
  left: 0;
  z-index: 2;
  pointer-events: none;
}

// 刷新按钮 - 半透明圆形背景
.refresh-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 5;
  color: #fff !important;
  background: rgba(0, 0, 0, 0.2) !important;
  backdrop-filter: blur(4px);

  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.35) !important;
  }

  &:disabled {
    opacity: 0.5;
  }
}

// 验证结果遮罩
.captcha-result-mask {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(2px);
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #333;
}

// 滑块轨道 - 斜条纹纹理背景
.slider-track {
  position: relative;
  height: 42px;
  margin-top: 16px;
  border-radius: 8px;
  background: repeating-linear-gradient(-45deg, #e8e8e8, #e8e8e8 10px, #f0f0f0 10px, #f0f0f0 20px);
  border: 1px solid #e0e0e0;
}

.slider-bg {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

// 提示文字
.slider-hint {
  display: flex;
  align-items: center;
  color: #000;
  font-size: 13px;
  letter-spacing: 0.5px;
  animation: hint-breathe 2s ease-in-out infinite;
}

// 提示文字呼吸动画
@keyframes hint-breathe {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// 填充区域 - vben 风格绿色
.slider-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 7px 0 0 7px;
  opacity: 0.15;
  pointer-events: none;
  background-color: hsl(144deg 57% 58%);
}

// 滑块手柄 - 精致渐变 + 立体阴影
.slider-handle {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: grab;
  font-size: 18px;
  color: #555;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.06);
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    color 0.2s;
  touch-action: none;

  &:hover {
    border-color: #ccc;
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.12),
      0 2px 6px rgba(0, 0, 0, 0.08);
    color: #333;
  }

  // 拖动时禁用 transition，确保即时响应
  &.is-dragging {
    cursor: grabbing;
    border-color: #bbb;
    scale: 1.02;
    box-shadow:
      0 6px 16px rgba(0, 0, 0, 0.15),
      0 3px 8px rgba(0, 0, 0, 0.1);
    transition: none;
  }

  &.is-success {
    color: #fff;
    cursor: default;
    border-color: transparent;
    background: hsl(144deg 57% 58%);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    // 移除动画，避免 scale 变化导致的抖动
    transition: none;
  }
}

// 暗色模式适配
&.is-dark {
  .captcha-area {
    border-color: #3a3a3a;
    background: #2a2a2a;
  }

  .slider-track {
    background: repeating-linear-gradient(-45deg, #3a3a3a, #3a3a3a 10px, #333 10px, #333 20px);
    border-color: #3a3a3a;
  }

  .slider-hint {
    color: #f4f4f4;
  }

  .slider-handle {
    background: linear-gradient(180deg, #3a3a3a 0%, #2d2d2d 100%);
    border-color: #4a4a4a;
    color: #aaa;

    &:hover {
      border-color: #666;
      color: #ccc;
    }

    &.is-dragging {
      border-color: #777;
      background: linear-gradient(180deg, #3a3a3a 0%, #333 100%);
    }
  }

  .result-content {
    color: #eee;
  }

  .captcha-result-mask {
    background: rgba(30, 30, 30, 0.95);
  }
}
</style>
