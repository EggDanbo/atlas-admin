<script lang="ts" setup>
import type { FormRules } from 'naive-ui'
import { Upload } from '@/components/File/Upload'
import { NaIcon } from '@/components/Icon'
import { NaPage } from '@/components/Page'
import { SpCascader } from '@/components/SpCascader'
import { useFormValid } from '@/hooks/help/useFormValid'
import profile from '@/service/api/identity/profile'
import team from '@/service/api/organ/team'
import { useUserStore } from '@/store/modules/user'
import { validMobileNumber } from '@/utils/rules'
import toast from '@/utils/toast'

const userStore = useUserStore()

const loading = ref(false)
const formRef = ref()
const teamTreeOptions = ref<Recordable[]>([])

const { validForm, resetForm } = useFormValid(formRef)

// 表单数据
const formModel = reactive({
  team_id: '',
  name: '',
  mobile_number: '',
  user_pic: '',
  sign_pic: '',
  wkno: '',
  working: true,
  id_no: '',
  code: '',
  user_type: null as number | null,
})

// 图片上传
const userPicFiles = ref<FileStorage.FileResourceModel[]>([])
const signPicFiles = ref<FileStorage.FileResourceModel[]>([])

// 登录账号验证正则
const CODE_REGEX = /^[\w\-]*$/

// 表单验证规则
const rules: FormRules = {
  team_id: {
    required: true,
    message: '请选择单位',
    trigger: 'blur',
  },
  name: {
    required: true,
    message: '请输入姓名',
    trigger: 'blur',
  },
  mobile_number: {
    required: true,
    trigger: 'blur',
    validator: validMobileNumber,
  },
  code: [
    { type: 'string', min: 2, message: '登录账号长度至少2位', trigger: 'blur' },
    {
      required: false,
      validator: (_rule, value, callback) => {
        if (!value) {
          callback()
        }
        else if (!CODE_REGEX.test(value)) {
          callback(new Error('只能包括字母、数字、下划线、横线'))
        }
        else {
          callback()
        }
        return undefined
      },
      trigger: 'blur',
    },
  ],
}

// 加载单位树
async function loadTeamTree() {
  const { isSuccess, data } = await team.tree({ all: true, fiction: true })
  if (isSuccess) {
    teamTreeOptions.value = data
  }
}

// 加载用户信息
async function loadUserInfo() {
  const { isSuccess, data } = await profile.info()
  if (isSuccess && data) {
    formModel.name = data.name || ''
    formModel.mobile_number = data.mobile_number || ''
    formModel.wkno = data.wkno || ''
    formModel.working = data.working ?? true
    formModel.team_id = data.team_id || ''
    formModel.id_no = data.id_no || ''
    formModel.code = data.code || ''
    formModel.user_type = data.user_type ?? null

    // 设置图片
    if (data.user_pic && data.user_url) {
      formModel.user_pic = data.user_pic
      userPicFiles.value = [{
        id: data.user_pic,
        url: data.user_url,
        name: 'user_pic',
        image: true,
        content_type: 'image/jpeg',
        size: '',
      }]
    }
    if (data.sign_pic && data.sign_url) {
      formModel.sign_pic = data.sign_pic
      signPicFiles.value = [{
        id: data.sign_pic,
        url: data.sign_url,
        name: 'sign_pic',
        image: true,
        content_type: 'image/jpeg',
        size: '',
      }]
    }
    resetForm()
  }
}

// 提交表单
async function formSubmit() {
  if (!await validForm())
    return

  // 处理图片
  formModel.user_pic = userPicFiles.value.length > 0 ? userPicFiles.value[0].id! : ''
  formModel.sign_pic = signPicFiles.value.length > 0 ? signPicFiles.value[0].id! : ''

  loading.value = true
  const { isSuccess } = await profile.updateProfile({
    team_id: formModel.team_id,
    name: formModel.name,
    mobile_number: formModel.mobile_number,
    user_pic: formModel.user_pic || undefined,
    sign_pic: formModel.sign_pic || undefined,
    wkno: formModel.wkno || undefined,
    working: formModel.working,
    id_no: formModel.id_no || undefined,
    code: formModel.code || undefined,
  }).finally(() => {
    loading.value = false
  })

  if (isSuccess) {
    userStore.asyncUserInfo()
    toast.success('保存成功')
  }
}

// 重置表单
async function handleReset() {
  loading.value = true
  await loadUserInfo()
  loading.value = false
}

onMounted(() => {
  loadTeamTree()
  loadUserInfo()
})
</script>

<script lang="ts">
export default { name: 'UserCenter' }
</script>

<template>
  <NaPage>
    <n-card :bordered="false" content-style="padding-top: 6px">
      <!-- 图片上传 -->
      <template v-if="!userStore.isAdmin">
        <n-flex :size="24" class="py-4">
          <div class="text-center">
            <div class="mb-2 text-sm" depth="3">
              人员照片
            </div>
            <Upload
              v-model:value="userPicFiles"
              :max-number="1"
              :only-image="true"
              :show-file-name="false"
              upload-title="上传照片"
            />
          </div>
          <div class="text-center">
            <div class="mb-2 text-sm" depth="3">
              签名图片
            </div>
            <Upload
              v-model:value="signPicFiles"
              :max-number="1"
              :only-image="true"
              :show-file-name="false"
              upload-title="上传签名"
            />
          </div>
        </n-flex>

        <n-divider />
      </template>

      <n-form
        ref="formRef"
        :model="formModel"
        :rules="rules"
        label-placement="left"
        label-width="100"
        class="max-w-3xl py-4"
      >
        <n-form-item label="所属单位" path="team_id">
          <SpCascader
            v-model:value="formModel.team_id"
            :options="teamTreeOptions"
            placeholder="请选择"
            value-field="id"
            :disabled="userStore.isAdmin"
          />
        </n-form-item>

        <n-form-item label="姓名" path="name">
          <n-input
            v-model:value="formModel.name"
            placeholder="请输入姓名"
            :disabled="userStore.isAdmin"
          />
        </n-form-item>

        <n-form-item label="手机号码" path="mobile_number">
          <n-input
            v-model:value="formModel.mobile_number"
            placeholder="请输入手机号码"
            :disabled="userStore.isAdmin"
          />
        </n-form-item>

        <n-form-item label="身份证号" path="id_no">
          <n-input
            v-model:value="formModel.id_no"
            maxlength="30"
            :disabled="userStore.isAdmin"
          />
        </n-form-item>

        <n-form-item v-if="formModel.user_type === 1" label="工号" path="wkno">
          <n-input
            v-model:value="formModel.wkno"
            maxlength="30"
            :disabled="userStore.isAdmin"
          />
        </n-form-item>

        <n-divider />

        <n-form-item label="登录账号" path="code">
          <n-input
            v-model:value="formModel.code"
            maxlength="30"
            placeholder="区分大小写"
            :disabled="userStore.isAdmin"
          />
        </n-form-item>

        <n-form-item label="工作状态" path="working">
          <n-switch v-model:value="formModel.working" :disabled="userStore.isAdmin">
            <template #checked>
              工作中
            </template>
            <template #unchecked>
              免打扰
            </template>
          </n-switch>
          <n-text class="ml-2" depth="3">
            （设为免打扰将收不到提醒）
          </n-text>
        </n-form-item>

        <div class="ml-25 mt-4 flex gap-3">
          <n-button
            type="primary"
            :disabled="userStore.isAdmin || loading"
            :loading="loading"
            @click="formSubmit"
          >
            <template #icon>
              <NaIcon icon="ant-design:save-outlined" />
            </template>
            更新个人信息
          </n-button>
          <n-button
            :disabled="loading"
            @click="handleReset"
          >
            <template #icon>
              <NaIcon icon="ant-design:reload-outlined" />
            </template>
            重置
          </n-button>
        </div>
      </n-form>
    </n-card>
  </NaPage>
</template>
