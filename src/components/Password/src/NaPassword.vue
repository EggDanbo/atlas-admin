<script lang="ts" setup>
import { computed, nextTick, ref, unref } from 'vue'
import Intensity from './components/Intensity.vue'
import { basicProps } from './props'

const props = defineProps({ ...basicProps })

const emit = defineEmits(['change', 'focus', 'update:value'])

// 预编译正则表达式：用于密码验证
const PASSWORD_FORMAT_REGEX = /^[\w~!@#$%^&*()+=\-.,]{6,32}$/
const PASSWORD_STRENGTH_REGEX = {
  lower: /[a-z]/,
  upper: /[A-Z]/,
  number: /\d/,
  character: /[~!@#$%^&*()_+=\-.,]/,
}

const isSuccess = ref(false)

const formValue = ref({
  password: props.value,
  repeat: '',
})

const password = ref({
  strength: 0,
  tips: null,
  length: false,
  format: false,
  complexity: false,
})

const rules = {
  password: [{ required: true, validator: checkPasswordVal, trigger: ['input', 'blur'] }],
  repeat: [{ required: props.repeat, validator: checkRepeat, trigger: ['input', 'blur'] }],
}

const popoverRef = ref()
const passwordRef = ref()

const intensityValue: any = computed(() => {
  return {
    value: formValue.value.password,
    complexity: props.complexity,
    minLength: props.minLength,
    maxLength: props.maxLength,
    password: password.value,
    complexityTip: props.complexityTip,
  }
})

function inputChange(value) {
  emit('change', value)
  emit('update:value', value)
  password.value.strength = getStrength(value)
}

function inputFocus() {
  popoverRef.value.handleFocus()
}

function inputBlur() {
  popoverRef.value.handleBlur()
}

function checkPasswordVal(_, value) {
  if (!props.required && !value) {
    isSuccess.value = true
    return true
  }
  if (!value) {
    password.value = {
      strength: 0,
      tips: null,
      length: false,
      format: false,
      complexity: false,
    }
    isSuccess.value = false
    return new Error('请设置密码')
  }
  else {
    password.value.format = true
    if (value.length < props.minLength) {
      password.value.length = false
      password.value.strength = 0
      password.value.tips = null
      return new Error(`密码长度至少为${props.minLength}个字符`)
    }
    if (props.complexity) {
      if (checkPassword(value)) {
        password.value.length = true
        const strength = getStrength(value)
        password.value.strength = strength
        password.value.tips = props.level[strength]
        if (strength <= 1) {
          password.value.complexity = false
          return new Error(props.complexityTip)
        }
        else {
          password.value.complexity = true
          isSuccess.value = true
          return true
        }
      }
    }
    else {
      password.value.length = true
      const strength = getStrength(value)
      password.value.strength = strength
      password.value.tips = props.level[strength]
      password.value.complexity = true
      isSuccess.value = true
      return true
    }
  }
  isSuccess.value = true
  return true
}

function checkRepeat(_, value) {
  if (!props.required && !value) {
    isSuccess.value = true
    return true
  }
  if (!value) {
    return new Error('请再次输入密码')
  }
  else {
    if (formValue.value.password !== value) {
      return new Error('两次密码输入不一致')
    }
    return true
  }
}

function checkPassword(password: string): boolean {
  return PASSWORD_FORMAT_REGEX.test(password)
}

function getStrength(password: string): number {
  let strength = 0
  if (PASSWORD_STRENGTH_REGEX.lower.test(password))
    strength++
  if (PASSWORD_STRENGTH_REGEX.upper.test(password))
    strength++
  if (PASSWORD_STRENGTH_REGEX.number.test(password))
    strength++
  if (PASSWORD_STRENGTH_REGEX.character.test(password))
    strength++
  return strength
}

function showValidator() {
  passwordRef.value.focus()
  passwordRef.value.blur()
  nextTick(() => {
    passwordRef.value.focus()
  })
}

function isValidator() {
  return unref(isSuccess)
}

defineExpose({
  isValidator,
  showValidator,
})
</script>

<template>
  <div :class="{ 'block-box': block }" class="password-box">
    <n-popover
      ref="popoverRef"
      :class="{ 'block-box': block }"
      display-directive="show"
      trigger="focus"
    >
      <template #trigger>
        <n-form
          :inline="!block"
          :model="formValue"
          :rules="rules"
          :show-label="false"
        >
          <n-form-item path="password">
            <n-input
              ref="passwordRef"
              v-model:value="formValue.password"
              :maxlength="maxLength"
              placeholder="请输入密码"
              show-password-on="click"
              type="password"
              @blur="inputBlur"
              @focus="inputFocus"
              @update:value="inputChange"
            >
              <template #prefix>
                <NaIcon icon="ant-design:lock-outlined" />
              </template>
            </n-input>
          </n-form-item>
          <n-form-item v-if="repeat" path="repeat">
            <n-input
              v-model:value="formValue.repeat"
              :maxlength="maxLength"
              placeholder="请再次输入密码"
              show-password-on="click"
              type="password"
            >
              <template #prefix>
                <NaIcon icon="ant-design:lock-outlined" />
              </template>
            </n-input>
          </n-form-item>
        </n-form>
      </template>
      <Intensity v-bind="intensityValue" />
    </n-popover>
  </div>
</template>

<style lang="less" scoped>
  .password-box {
  display: inline-block;
}

.block-box {
  display: block;
  width: 100%;
}
</style>
