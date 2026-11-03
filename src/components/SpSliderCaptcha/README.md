# SpSliderCaptcha 滑块验证组件

滑块拼图验证组件，用于人机验证场景（如登录、注册、敏感操作等）。

## 基础用法

### Promise 方式（推荐）

```vue
<script setup lang="ts">
import type { SliderCaptchaInst } from "@/components/SpSliderCaptcha";

const sliderCaptchaRef = ref<SliderCaptchaInst>();

async function handleLogin() {
  try {
    // 打开滑块验证，验证成功返回 verifyToken
    const verifyToken = await sliderCaptchaRef.value?.verify();

    // 使用 verifyToken 进行登录
    await login({ ...formModel, verifyToken });
  } catch (error) {
    // 验证失败或取消
    console.log("验证失败", error);
  }
}
</script>

<template>
  <div>
    <n-button @click="handleLogin">登录</n-button>
    <SpSliderCaptcha ref="sliderCaptchaRef" />
  </div>
</template>
```

### 事件回调方式

```vue
<script setup lang="ts">
import type { SliderCaptchaInst } from "@/components/SpSliderCaptcha";

const sliderCaptchaRef = ref<SliderCaptchaInst>();
const verifyToken = ref("");

function handleSuccess(token: string) {
  verifyToken.value = token;
  // 继续登录流程
}

function handleFail(reason: number) {
  console.log("验证失败，原因码:", reason);
}

function handleLocked(message: string) {
  console.log("账户锁定:", message);
}
</script>

<template>
  <div>
    <n-button @click="sliderCaptchaRef?.verify()">验证</n-button>
    <SpSliderCaptcha
      ref="sliderCaptchaRef"
      @success="handleSuccess"
      @fail="handleFail"
      @locked="handleLocked"
    />
  </div>
</template>
```

## 登录集成示例

```vue
<script setup lang="ts">
import type { SliderCaptchaInst } from "@/components/SpSliderCaptcha";
import { ref } from "vue";
import { useUserStore } from "@/store/modules/user";

const formRef = ref();
const sliderCaptchaRef = ref<SliderCaptchaInst>();
const userStore = useUserStore();

const formModel = reactive({
  username: "",
  password: "",
});

async function handleSubmit() {
  try {
    // 1. 先进行滑块验证
    const verifyToken = await sliderCaptchaRef.value?.verify();

    // 2. 验证成功，提交登录（带 verifyToken）
    const { isSuccess, message } = await userStore.asyncLogin({
      ...formModel,
      verifyToken,
    });

    if (!isSuccess) {
      Message.error(message);
    }
  } catch (error) {
    // 滑块验证失败，不需要额外处理（组件内部已显示失败提示）
    console.log("滑块验证失败或取消");
  }
}
</script>

<template>
  <n-form ref="formRef" :model="formModel">
    <n-form-item path="username">
      <n-input v-model:value="formModel.username" placeholder="账号" />
    </n-form-item>
    <n-form-item path="password">
      <n-input
        v-model:value="formModel.password"
        type="password"
        placeholder="密码"
      />
    </n-form-item>
    <n-button type="primary" block @click="handleSubmit"> 登录 </n-button>
  </n-form>

  <!-- 滑块验证组件 -->
  <SpSliderCaptcha ref="sliderCaptchaRef" />
</template>
```

## Props

| 属性              | 类型      | 默认值       | 说明                       |
| ----------------- | --------- | ------------ | -------------------------- |
| width             | `number`  | `300`        | 验证区域宽度（px）         |
| height            | `number`  | `200`        | 验证区域高度（px）         |
| sliderSize        | `number`  | `58`         | 滑块尺寸（px）             |
| captchaExpiration | `number`  | `120`        | 验证码过期时间（秒）       |
| autoClose         | `boolean` | `true`       | 验证成功后自动关闭         |
| successDuration   | `number`  | `1500`       | 成功后延迟关闭时间（毫秒） |
| title             | `string`  | `'安全验证'` | 弹窗标题                   |

## Events

| 事件    | 参数                | 说明                       |
| ------- | ------------------- | -------------------------- |
| success | `(token: string)`   | 验证成功，返回 verifyToken |
| fail    | `(reason: number)`  | 验证失败，返回失败原因码   |
| locked  | `(message: string)` | 尝试次数过多被锁定         |
| close   | -                   | 弹窗关闭                   |

## Methods

| 方法   | 返回值            | 说明                               |
| ------ | ----------------- | ---------------------------------- |
| verify | `Promise<string>` | 打开验证弹窗，成功返回 verifyToken |
| close  | `void`            | 关闭弹窗                           |

## 失败原因码

| 码值 | 说明                 |
| ---- | -------------------- |
| 0    | 未知错误             |
| 1    | 验证码不存在         |
| 2    | 验证码已过期         |
| 3    | 滑块位置错误         |
| 4    | 轨迹验证失败         |
| 5    | 参数错误             |
| 6    | 服务异常             |
| 7    | 尝试次数过多，已锁定 |
