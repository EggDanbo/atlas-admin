<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'

import { settings } from '@/service/api/system'
import { useAppInfoStore } from '@/store/modules/appinfo'
import { useUserStore } from '@/store/modules/user'
import toast from '@/utils/toast'

const formRef: any = ref(null)
const loading = ref(false)
const complexityList = [
  { label: '大写字母', value: '大写字母' },
  { label: '小写字母', value: '小写字母' },
  { label: '数字', value: '数字' },
  { label: '特殊字符', value: '特殊字符' },
]

const formData = reactive({
  app: {
    longitude: 0,
    latitude: 0,
    logincaptcha: false,
    reportfiletrace: false,
    privacy: true,
    watermark: false,
  },
  pwdstrategy: {
    minlen: 0,
    period: 0,
    complexity: [],
    errors: 0,
    locks: 0,
    email: '',
  },
})

async function formSubmit() {
  loading.value = true
  const { isSuccess } = await settings.save(formData)
  loading.value = false
  if (!isSuccess)
    return
  toast.success('保存成功')
  useAppInfoStore().asyncAppInfo()
  useUserStore().asyncUserInfo()
}

onMounted(async () => {
  const { isSuccess, data } = await settings.get()
  if (!isSuccess)
    return
  Object.assign(formData, data)
})
</script>

<template>
  <n-card :bordered="false">
    <n-tabs type="line" animated size="large">
      <n-tab-pane name="basic" tab="基础设置">
        <n-form ref="formRef" :label-width="160" :model="formData" label-placement="left">
          <n-form-item label="登录验证码">
            <n-checkbox v-model:checked="formData.app!.logincaptcha">
              开启
            </n-checkbox>
          </n-form-item>
          <n-form-item label="报表文件追踪">
            <n-checkbox v-model:checked="formData.app!.reportfiletrace">
              开启
            </n-checkbox>
          </n-form-item>
          <n-form-item label="敏感词开启">
            <n-checkbox v-model:checked="formData.app!.privacy">
              开启
            </n-checkbox>
          </n-form-item>
          <n-form-item label="水印开启">
            <n-checkbox v-model:checked="formData.app!.watermark">
              开启
            </n-checkbox>
          </n-form-item>
        </n-form>
      </n-tab-pane>

      <n-tab-pane name="safety" tab="密码策略">
        <n-form ref="formRef" :label-width="160" :model="formData" label-placement="left" class="max-w-3xl py-4">
          <n-form-item label="密码至少长度">
            <n-input-number
              v-model:value="formData.pwdstrategy!.minlen"
              :show-button="false"
            />
          </n-form-item>
          <n-form-item label="密码复杂度">
            <n-input-group>
              <n-select
                v-model:value="formData.pwdstrategy!.complexity"
                max-tag-count="responsive"
                multiple
                clearable
                placeholder=""
                :options="complexityList"
              />
              <n-input-group-label>
                请全选保证密码强度
              </n-input-group-label>
            </n-input-group>
          </n-form-item>
          <n-form-item label="密码有效期(天)">
            <n-input-group>
              <n-input-number
                v-model:value="formData.pwdstrategy!.period"
                :show-button="false"
              />
              <n-input-group-label>
                到期后不能登录，0为不限制
              </n-input-group-label>
            </n-input-group>
          </n-form-item>
          <n-form-item label="密码错误次数">
            <n-input-group>
              <n-input-number
                v-model:value="formData.pwdstrategy!.errors"
                :show-button="false"
              />
              <n-input-group-label>
                密码试错最大次数，0为不限制
              </n-input-group-label>
            </n-input-group>
          </n-form-item>
          <n-form-item label="锁定时间(分钟)">
            <n-input-group>
              <n-input-number
                v-model:value="formData.pwdstrategy!.locks"
                :show-button="false"
              />
              <n-input-group-label>
                达到密码错误次数进行锁定，0为不限制
              </n-input-group-label>
            </n-input-group>
          </n-form-item>
        </n-form>
      </n-tab-pane>
    </n-tabs>
    <n-button :loading="loading" :disable="loading" type="primary" @click="formSubmit">
      保存设置
    </n-button>
  </n-card>
</template>
