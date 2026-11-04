<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import { format } from 'date-fns'
import BizDraftBox from '@/components/BizDraftBox'
import { Upload } from '@/components/BizFile'
import { SpCascader } from '@/components/SpCascader'
import { SpDict } from '@/components/SpDict'
import { TeamPicker } from '@/components/SpTablePicker'
import { dictLabel, dictOptions } from '@/dicts'
import { createTransformer, useDetail } from '@/hooks/detail'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { unit as teamApi } from '@/service/api/access'
import { resume as api } from '@/service/api/hr'
import toast from '@/utils/toast'

const emit = defineEmits(['on-action'])

const { getPermission } = useTabbar()
const tabPermName = getPermission()

const militaryOptions = ref([
  {
    label: '是',
    value: '是',
  },
  {
    label: '否',
    value: '否',
  },
])
const relateTypesOptions = ref([
  {
    label: '紧急联系人',
    value: '紧急联系人',
  },
  {
    label: '推荐人',
    value: '推荐人',
  },
])

const teamTreeOptions = ref<Recordable[]>([])
async function loadTeamTree() {
  const { isSuccess, data } = await teamApi.tree({
    permission: [tabPermName],
  })
  if (!isSuccess)
    return
  teamTreeOptions.value = data
}

async function load() {
  await loadTeamTree()
}

function createFormModel() {
  return {
    opt_submit: true,
    team_id: null,
    team_name: null,
    branch_id: null,
    branch_name: null,
    name: null,
    card: null as string | null,
    card_issue: null,
    card_valid: null,
    birthday: null as string | null,
    gender: null as string | null,
    mobile: null as string | null,
    types: null,
    nation: null,
    politics: null,
    military: null,
    marital: null,
    children: null,
    health: null,
    stature: null,
    extent: null,
    school: null,
    subject: null,
    feature: null,
    cases: null,
    ranks: null,
    scale: null,
    position: null,
    license: null,
    bank_code: null,
    bank_open: null,
    native: null,
    polices: null,
    location: null,
    address: null,
    crime: null,
    remark: null,
    user_pic: [],
    files: [],
    files_gwxqb: [],
    files_msdjb: [],
    files_zpdjb: [],
    files_sfz: [],
    files_hkb: [],
    files_xlzs: [],
    files_zyzbz: [],
    files_wfzzm: [],
    files_jkbg: [],
    files_yhk: [],
    files_ldht: [],
    files_bcxy: [],
    files_zrz: [],
    files_bmxy: [],
    files_ygsc: [],
    files_ygczx: [],
    files_lzspb: [],
    careers: [] as CareerTypes[],
    familys: [] as FamilyTypes[],
    relates: [] as RelateTypes[],
    ability: [] as AbiltyTypes[],
    achieve: [] as AbiltyTypes[],
    transform: {},
  }
}

interface AbiltyTypes {
  name: string
  pagacount: number
  files: FileStorage.FileResourceModel[]
}
interface CareerTypes {
  add_date: string | null
  end_date: string | null
  employer: string
  position: string
  content: string | null
  name: string
  mobile: string
  transform: any
}
interface FamilyTypes {
  name: string
  mobile: string
  age: number
  address: string
  title: string
}
interface RelateTypes {
  types: string
  name: string
  mobile: string
  title: string
  address: string
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    name: [{ required: true, message: '请输入姓名', trigger: 'change' }],
    mobile: [{ required: true, message: '请输入手机号', trigger: 'change' }],
    card: [{ required: true, message: '请输入身份证号', trigger: 'change' }],
    card_issue: [{ type: 'number', required: true, message: '请选择签发日期', trigger: 'change' }],
    extent: [{ required: true, message: '请选择文化程度', trigger: 'change' }],
    status: [{ required: true, message: '请选择入职状态', trigger: 'change' }],
    types: [{ required: true, message: '请选择人员类型', trigger: 'change' }],
    nation: [{ required: true, message: '请选择民族', trigger: 'change' }],
    school: [{ required: true, message: '请输入毕业院校', trigger: 'change' }],
    subject: [{ required: true, message: '请输入专业', trigger: 'change' }],
    feature: [{ required: true, message: '请输入特长', trigger: 'change' }],
    politics: [{ required: true, message: '请选择政治面貌', trigger: 'change' }],
    military: [{ required: true, message: '请选择兵役情况', trigger: 'change' }],
    health: [{ required: true, message: '请选择健康情况', trigger: 'change' }],
    marital: [{ required: true, message: '请选择婚姻状况', trigger: 'change' }],
    stature: [{ type: 'number', required: true, message: '请输入身高', trigger: 'change' }],
    census: [{ required: true, message: '请选择户口类型', trigger: 'change' }],
    native: [{ required: true, message: '请输入籍贯', trigger: 'change' }],
    location: [{ required: true, message: '请输入户口地址', trigger: 'change' }],
    address: [{ required: true, message: '请输入居住地址', trigger: 'change' }],
    team_id: [{ required: true, message: '请选择意向单位', trigger: 'change' }],
    ranks: [{ required: true, message: '请选择人员职务', trigger: 'change' }],
    scale: [{ required: true, message: '请选择工资级别', trigger: 'change' }],
    position: [{ required: true, message: '请选择岗位', trigger: 'change' }],
  }

  for (let i = 0; i < formModel.ability.length; i++) {
    rules[`ability[${i}].name`] = [{ required: true, trigger: ['blur', 'change'] }]
    rules[`ability[${i}].files`] = [{ type: 'array', required: true, trigger: ['blur', 'change'] }]
  }
  for (let i = 0; i < formModel.achieve.length; i++) {
    rules[`achieve[${i}].name`] = [{ required: true, trigger: ['blur', 'change'] }]
    rules[`achieve[${i}].files`] = [{ type: 'array', required: true, trigger: ['blur', 'change'] }]
  }
  for (let i = 0; i < formModel.relates.length; i++) {
    rules[`relates[${i}].types`] = [{ required: true, trigger: ['blur', 'change'] }]
    rules[`relates[${i}].name`] = [{ required: true, trigger: ['blur', 'change'] }]
    rules[`relates[${i}].mobile`] = [{ required: true, trigger: ['blur', 'change'] }]
    rules[`relates[${i}].title`] = [{ required: true, trigger: ['blur', 'change'] }]
    rules[`relates[${i}].address`] = [{ required: true, trigger: ['blur', 'change'] }]
  }
  for (let i = 0; i < formModel.careers.length; i++) {
    rules[`careers[${i}].name`] = [{ required: true, trigger: ['blur', 'change'] }]
    rules[`careers[${i}].mobile`] = [{ required: true, trigger: ['blur', 'change'] }]
    rules[`careers[${i}].employer`] = [{ required: true, trigger: ['blur', 'change'] }]
    rules[`careers[${i}].add_date`] = [{ required: true, trigger: ['blur', 'change'] }]
    rules[`careers[${i}].end_date`] = [{ required: true, trigger: ['blur', 'change'] }]
    rules[`careers[${i}].position`] = [{ required: true, trigger: ['blur', 'change'] }]
    rules[`careers[${i}].content`] = [{ required: true, trigger: ['blur', 'change'] }]
  }
  for (let i = 0; i < formModel.familys.length; i++) {
    rules[`familys[${i}].name`] = [{ required: true, trigger: ['blur', 'change'] }]
    rules[`familys[${i}].mobile`] = [{ required: true, trigger: ['blur', 'change'] }]
    rules[`familys[${i}].age`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
    rules[`familys[${i}].title`] = [{ required: true, trigger: ['blur', 'change'] }]
    rules[`familys[${i}].address`] = [{ required: true, trigger: ['blur', 'change'] }]
  }

  return rules
})

const {
  isEdit,
  hasPerm,
  btnLoading,
  formModel,
  formRef,
  modalRef,
  exposed,
  submit,
  clearTabState,
  updateModel,
  params,
} = useDetail<FormModel>({
  api: {
    get(card) {
      return api.entry({
        card,
        opt: params.value.opt,
      })
    },
    update(data) {
      return api.updateEntry(data)
    },
  },
  createFormModel,
  title: '入职登记',
  permission: { useTabPermission: true, permName: 'HR_RESUME' },
  canEdit: form => form.opt_submit,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    string: ['status', 'social', 'gender', 'types'],
    nullIfZero: ['team_id', 'branch_id', 'nation'],
    number: ['card_issue', 'card_valid'],
    custom: {
      card_issue: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
      card_valid: val => val ? format(Number(val), 'yyyy-MM-dd') : '长期有效',
    },
  }),
  async beforeEdit(data, params) {
    if (data.careers && data.careers.length > 0) {
      for (const i in data.careers) {
        const item = data.careers[i]
        item.add_date = item.add_date ? item.add_date : null
        item.end_date = item.end_date ? item.end_date : null
      }
    }

    const { opt, ...items } = params
    formModel.id = items.id

    await load()

    return true
  },
  beforeSubmit(data) {
    if (data.relates.length === 0) {
      toast.warning('请填写联系人信息')
      return false
    }
    if (data.careers.length === 0) {
      toast.warning('请填写工作经历信息')
      return false
    }
    if (data.familys.length === 0) {
      toast.warning('请填写家庭成员信息')
      return false
    }

    return true
  },
})

function handleTeamSelected() {
  formModel.branch_id = null
  formModel.branch_name = null
  formModel.scale = null
}

function itemsAdd(opt: string) {
  const def = {}
  formModel[opt].push(def)
}

function itemsMoveUp(opt: string, key: any) {
  if (Number(key) === 0)
    return
  const items = formModel[opt];
  [items[key], items[key - 1]] = [items[key - 1], items[key]]
}

function itemsMoveDown(opt: string, key: any) {
  if (Number(key) < formModel[opt].length - 1) {
    const items = formModel[opt];
    [items[key], items[key + 1]] = [items[key + 1], items[key]]
  }
}

function itemsCopy(opt: string, key: any) {
  const items = formModel[opt][key]
  const newItems = { ...items }
  formModel[opt].splice(key + 1, 0, newItems)
}

function itemsRemove(opt: string, key: any) {
  if (formModel[opt].legnth <= 1) {
    toast.info(`请填写${opt === 'ability' ? '资格证书' : opt === 'achieve' ? '职称证书' : opt === 'careers' ? '工作经历' : opt === 'familys' ? '家庭成员' : opt === 'relates' ? '联系人' : ''}`)
    return
  }
  formModel[opt].splice(key, 1)
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'HrResumeEntry' }
</script>

<template>
  <SpModal ref="modalRef" width="980" height="90vh" :before-close="clearTabState">
    <n-form
      v-if="isEdit"
      ref="formRef"
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="formModel"
      :rules="formRules"
      :disabled="!hasPerm"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="16" :show-feedback="false">
          <n-grid :cols="24" :x-gap="20">
            <n-form-item-gi :span="12" label="姓名" path="name">
              <n-input v-model:value="formModel.name" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="手机号" path="mobile">
              <n-input v-model:value="formModel.mobile" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="身份证号" path="card">
              <n-input v-model:value="formModel.card" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="签发日期" path="card_issue">
              <n-date-picker v-model:value="formModel.card_issue" type="date" fast-month-select clearable />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="有效日期">
              <n-input :value="formModel.transform?.card_valid" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="出生日期" path="birthday">
              <n-input v-model:value="formModel.birthday" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="性别" path="gender">
              <n-input :value="dictLabel('organ_user_gender', formModel.gender)" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="人员类型" path="types">
              <n-select
                v-model:value="formModel.types"
                placeholder="请选择"
                :options="dictOptions('staff_info_types')"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="民族" path="nation">
              <n-select
                v-model:value="formModel.nation"
                :options="dictOptions('staff_info_nation', 'label')"
                clearable
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="文化程度" path="extent">
              <n-select
                v-model:value="formModel.extent"
                :options="dictOptions('staff_info_extent', 'label')"
                clearable
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="专业" path="subject">
              <n-input v-model:value="formModel.subject" clearable />
            </n-form-item-gi>
          </n-grid>
        </n-form-item-gi>
        <n-form-item-gi :span="8" :show-feedback="false">
          <Upload
            v-model:value="formModel.user_pic"
            :max-number="1"
            :only-image="true"
            upload-title="人员照片"
            :width="280"
            :height="286"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="毕业院校" path="school">
          <n-input v-model:value="formModel.school" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="特长" path="feature">
          <n-input v-model:value="formModel.feature" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="政治面貌" path="politics">
          <n-select
            v-model:value="formModel.politics"
            :options="dictOptions('staff_info_politics', 'label')"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="兵役情况" path="military">
          <n-select
            v-model:value="formModel.military"
            :options="militaryOptions"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="健康状况" path="health">
          <n-select
            v-model:value="formModel.health"
            :options="dictOptions('staff_info_health', 'label')"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="婚姻状况" path="marital">
          <n-select
            v-model:value="formModel.marital"
            :options="dictOptions('staff_info_marital', 'label')"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="子女数" path="children">
          <n-input-number
            v-model:value="formModel.children"
            :precision="0"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="身高" path="stature">
          <n-input-number
            v-model:value="formModel.stature"
            :precision="0"
            :show-button="false"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="户口类型" path="census">
          <n-select
            v-model:value="formModel.census"
            :options="dictOptions('staff_info_census', 'label')"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="籍贯" path="native">
          <n-input v-model:value="formModel.native" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="户口地址" path="location">
          <n-input v-model:value="formModel.location" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="居住地址" path="address">
          <n-input v-model:value="formModel.address" clearable />
        </n-form-item-gi>
      </n-grid>
      <n-divider title-placement="left">
        入职信息
      </n-divider>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="24" label="意向单位" path="team_id">
          <SpCascader
            v-model:value="formModel.team_id"
            :options="teamTreeOptions"
            placeholder="请选择"
            value-field="id"
            @update:value="handleTeamSelected"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="派驻分队" path="branch_id">
          <TeamPicker
            v-model:value="formModel.branch_id"
            :options="formModel.branch_name"
            :multiple="false"
            :team_id="formModel.team_id"
            :disabled="!formModel.team_id"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="工资级别" path="scale">
          <SpDict v-model:value="formModel.scale" name="工资级别" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="职务" path="ranks">
          <SpDict v-model:value="formModel.ranks" name="职务" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="岗位" path="position">
          <SpDict v-model:value="formModel.position" name="岗位" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="保安员证" path="license">
          <n-input v-model:value="formModel.license" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="银行账号" path="bank_code">
          <n-input v-model:value="formModel.bank_code" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="开户银行" path="bank_open">
          <SpDict v-model:value="formModel.bank_open" name="开户银行" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注" path="remark">
          <n-input v-model:value="formModel.remark" type="textarea" :rows="3" clearable />
        </n-form-item-gi>
      </n-grid>
      <n-divider title-placement="left">
        档案附件
      </n-divider>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="8" label="岗位需求表" path="files_gwxqb">
          <Upload
            v-model:value="formModel.files_gwxqb"
            upload-title="上传附件"
            :max-number="1"
            :accepts="[
              'image/png',
              'image/jpg',
              'image/bmp',
              'image/jpeg',
              'image/pjpeg',
              'application/pdf',
            ]"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="面试登记表" path="files_msdjb">
          <Upload
            v-model:value="formModel.files_msdjb"
            upload-title="上传附件"
            :max-number="1"
            :accepts="[
              'image/png',
              'image/jpg',
              'image/bmp',
              'image/jpeg',
              'image/pjpeg',
              'application/pdf',
            ]"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="无犯罪记录证明" path="files_wfzzm">
          <Upload
            v-model:value="formModel.files_wfzzm"
            upload-title="上传附件"
            :max-number="1"
            :accepts="[
              'image/png',
              'image/jpg',
              'image/bmp',
              'image/jpeg',
              'image/pjpeg',
              'application/pdf',
            ]"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="体验报告/健康证" path="files_jkbg">
          <Upload
            v-model:value="formModel.files_jkbg"
            upload-title="上传附件"
            :max-number="1"
            :accepts="[
              'image/png',
              'image/jpg',
              'image/bmp',
              'image/jpeg',
              'image/pjpeg',
              'application/pdf',
            ]"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="最高学历证书" path="files_xlzs">
          <Upload
            v-model:value="formModel.files_xlzs"
            upload-title="上传附件"
            :max-number="1"
            :accepts="[
              'image/png',
              'image/jpg',
              'image/bmp',
              'image/jpeg',
              'image/pjpeg',
              'application/pdf',
            ]"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="身份证" path="files_sfz">
          <Upload
            v-model:value="formModel.files_sfz"
            upload-title="上传附件"
            :max-number="1"
            :accepts="[
              'image/png',
              'image/jpg',
              'image/bmp',
              'image/jpeg',
              'image/pjpeg',
              'application/pdf',
            ]"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="户口本" path="files_hkb">
          <Upload
            v-model:value="formModel.files_hkb"
            upload-title="上传附件"
            :max-number="1"
            :accepts="[
              'image/png',
              'image/jpg',
              'image/bmp',
              'image/jpeg',
              'image/pjpeg',
              'application/pdf',
            ]"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="银行卡" path="files_yhk">
          <Upload
            v-model:value="formModel.files_yhk"
            upload-title="上传附件"
            :max-number="1"
            :accepts="[
              'image/png',
              'image/jpg',
              'image/bmp',
              'image/jpeg',
              'image/pjpeg',
              'application/pdf',
            ]"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="保安员证" path="files_zyzbz">
          <Upload
            v-model:value="formModel.files_zyzbz"
            upload-title="上传附件"
            :max-number="1"
            :accepts="[
              'image/png',
              'image/jpg',
              'image/bmp',
              'image/jpeg',
              'image/pjpeg',
              'application/pdf',
            ]"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="其他" path="files">
          <Upload
            v-model:value="formModel.files"
            upload-title="上传附件"
            :max-number="5"
            :accepts="[
              'image/png',
              'image/jpg',
              'image/bmp',
              'image/jpeg',
              'image/pjpeg',
              'application/pdf',
            ]"
          />
        </n-form-item-gi>
      </n-grid>

      <div class="flex flex-col" style="gap: 16px; margin-top: 16px;">
        <n-divider title-placement="left" style="margin: 0;">
          资格证书
        </n-divider>

        <div v-if="formModel.ability && formModel.ability.length > 0" class="w-full">
          <n-card v-for="(item, key) in formModel.ability" :key="key" :content-style="{ padding: '0' }" class="detail-card-box">
            <div class="flex items-stretch">
              <div class="label-nums">
                <n-text strong>
                  #{{ Number(key) + 1 }}
                </n-text>
              </div>

              <div class="detail-card-box-content">
                <n-grid :cols="24" :x-gap="24" :y-gap="24">
                  <n-form-item-gi :span="24" label="证书名称" :path="`ability[${key}].name`" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.name" clearable />
                  </n-form-item-gi>
                  <n-form-item-gi :span="24" label="附件" :path="`ability[${key}].files`" label-width="80" :show-feedback="false">
                    <Upload
                      v-model:value="item.files"
                      upload-title="上传附件"
                      :max-number="3"
                      :only-image="false"
                    />
                  </n-form-item-gi>
                </n-grid>
              </div>

              <div class="menu-bar">
                <div class="flex items-start justify-center gap-[10px]">
                  <n-button v-if="formModel.ability.length > 1" :disabled="Number(key) === 0" text @click="itemsMoveUp('ability', key)">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:arrow-up-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button v-if="formModel.ability.length > 1" :disabled="Number(key) === formModel.ability.length - 1" text @click="itemsMoveDown('ability', key)">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:arrow-down-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button text @click="itemsCopy('ability', key)">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:copy-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button text @click="itemsRemove('ability', key)">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:delete-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                </div>
              </div>
            </div>
          </n-card>
        </div>
        <div v-else class="w-full" style="padding: 20px 0">
          <n-empty description="未填写资格证书" :show-icon="false" />
        </div>

        <div class="w-full flex">
          <n-button dashed round size="small" class="w-full" @click="itemsAdd('ability')">
            <template #icon>
              <n-icon>
                <Icon icon="ant-design:plus-outlined" />
              </n-icon>
            </template>
            添加资格证书
          </n-button>
        </div>
      </div>

      <div class="flex flex-col" style="gap: 16px; margin-top: 16px;">
        <n-divider title-placement="left" style="margin: 0;">
          职称证书
        </n-divider>

        <div v-if="formModel.achieve && formModel.achieve.length > 0" class="w-full">
          <n-card v-for="(item, key) in formModel.achieve" :key="key" :content-style="{ padding: '0' }" class="detail-card-box">
            <div class="flex items-stretch">
              <div class="label-nums">
                <n-text strong>
                  #{{ Number(key) + 1 }}
                </n-text>
              </div>

              <div class="detail-card-box-content">
                <n-grid :cols="24" :x-gap="24" :y-gap="24">
                  <n-form-item-gi :span="24" label="证书名称" :path="`achieve[${key}].name`" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.name" clearable />
                  </n-form-item-gi>
                  <n-form-item-gi :span="24" label="附件" :path="`achieve[${key}].files`" label-width="80" :show-feedback="false">
                    <Upload
                      v-model:value="item.files"
                      upload-title="上传附件"
                      :max-number="3"
                      :only-image="false"
                    />
                  </n-form-item-gi>
                </n-grid>
              </div>

              <div class="menu-bar">
                <div class="flex items-start justify-center gap-[10px]">
                  <n-button v-if="formModel.achieve.length > 1" :disabled="Number(key) === 0" text @click="itemsMoveUp('achieve', key)">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:arrow-up-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button v-if="formModel.achieve.length > 1" :disabled="Number(key) === formModel.achieve.length - 1" text @click="itemsMoveDown('achieve', key)">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:arrow-down-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button text @click="itemsCopy('achieve', key)">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:copy-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button text @click="itemsRemove('achieve', key)">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:delete-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                </div>
              </div>
            </div>
          </n-card>
        </div>
        <div v-else class="w-full" style="padding: 20px 0">
          <n-empty description="未填写职称证书" :show-icon="false" />
        </div>

        <div class="w-full flex">
          <n-button dashed round size="small" class="w-full" @click="itemsAdd('achieve')">
            <template #icon>
              <n-icon>
                <Icon icon="ant-design:plus-outlined" />
              </n-icon>
            </template>
            添加职称证书
          </n-button>
        </div>
      </div>

      <div class="flex flex-col" style="gap: 16px; margin-top: 32px;">
        <n-divider title-placement="left" style="margin: 0;">
          联系人
        </n-divider>

        <div v-if="formModel.relates && formModel.relates.length > 0" class="w-full">
          <n-card v-for="(item, key) in formModel.relates" :key="key" :content-style="{ padding: '0' }" class="detail-card-box">
            <div class="flex items-stretch">
              <div class="label-nums">
                <n-text strong>
                  #{{ Number(key) + 1 }}
                </n-text>
              </div>

              <div class="detail-card-box-content">
                <n-grid :cols="24" :x-gap="24" :y-gap="24">
                  <n-form-item-gi :span="8" label="类型" :path="`relates[${key}].types`" label-width="80" :show-feedback="false">
                    <n-select v-model:value="item.types" :options="relateTypesOptions" clearable />
                  </n-form-item-gi>
                  <n-form-item-gi :span="8" label="姓名" :path="`relates[${key}].name`" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.name" clearable />
                  </n-form-item-gi>
                  <n-form-item-gi :span="8" label="手机号" :path="`relates[${key}].mobile`" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.mobile" clearable />
                  </n-form-item-gi>
                  <n-form-item-gi :span="8" label="关系" :path="`relates[${key}].title`" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.title" clearable />
                  </n-form-item-gi>
                  <n-form-item-gi :span="16" label="住址" :path="`relates[${key}].name`" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.address" clearable />
                  </n-form-item-gi>
                </n-grid>
              </div>

              <div class="menu-bar">
                <div class="flex items-start justify-center gap-[10px]">
                  <n-button v-if="formModel.relates.length > 1" :disabled="Number(key) === 0" text @click="itemsMoveUp('relates', key)">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:arrow-up-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button v-if="formModel.relates.length > 1" :disabled="Number(key) === formModel.relates.length - 1" text @click="itemsMoveDown('relates', key)">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:arrow-down-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button text @click="itemsCopy('relates', key)">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:copy-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button text @click="itemsRemove('relates', key)">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:delete-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                </div>
              </div>
            </div>
          </n-card>
        </div>
        <div v-else class="w-full" style="padding: 20px 0">
          <n-empty description="未填写联系人" :show-icon="false" />
        </div>

        <div class="w-full flex">
          <n-button dashed round size="small" class="w-full" @click="itemsAdd('relates')">
            <template #icon>
              <n-icon>
                <Icon icon="ant-design:plus-outlined" />
              </n-icon>
            </template>
            添加联系人
          </n-button>
        </div>
      </div>

      <div class="flex flex-col" style="gap: 16px; margin-top: 32px;">
        <n-divider title-placement="left" style="margin: 0;">
          工作经历
        </n-divider>

        <div v-if="formModel.careers && formModel.careers.length > 0" class="w-full">
          <n-card v-for="(item, key) in formModel.careers" :key="key" :content-style="{ padding: '0' }" class="detail-card-box">
            <div class="flex items-stretch">
              <div class="label-nums">
                <n-text strong>
                  #{{ Number(key) + 1 }}
                </n-text>
              </div>

              <div class="detail-card-box-content">
                <n-grid :cols="24" :x-gap="24" :y-gap="24">
                  <n-form-item-gi :span="12" label="工作单位" :path="`careers[${key}].employer`" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.employer" clearable />
                  </n-form-item-gi>
                  <n-form-item-gi :span="6" label="加入月份" :path="`careers[${key}].add_date`" label-width="80" :show-feedback="false">
                    <n-date-picker v-model:formatted-value="item.add_date" value-format="yyyy-MM" type="month" clearable />
                  </n-form-item-gi>
                  <n-form-item-gi :span="6" label="离职月份" :path="`careers[${key}].end_date`" label-width="80" :show-feedback="false">
                    <n-date-picker v-model:formatted-value="item.end_date" value-format="yyyy-MM" type="month" clearable />
                  </n-form-item-gi>
                  <n-form-item-gi :span="12" label="职务" :path="`careers[${key}].position`" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.position" clearable />
                  </n-form-item-gi>
                  <n-form-item-gi :span="6" label="证明人" :path="`careers[${key}].name`" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.name" clearable />
                  </n-form-item-gi>
                  <n-form-item-gi :span="6" label="手机号" :path="`careers[${key}].mobile`" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.mobile" clearable />
                  </n-form-item-gi>
                  <n-form-item-gi :span="24" label="工作内容" :path="`careers[${key}].content`" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.content" type="textarea" :rows="3" clearable />
                  </n-form-item-gi>
                </n-grid>
              </div>

              <div class="menu-bar">
                <div class="flex items-start justify-center gap-[10px]">
                  <n-button v-if="formModel.careers.length > 1" :disabled="Number(key) === 0" text @click="itemsMoveUp('careers', key)">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:arrow-up-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button v-if="formModel.careers.length > 1" :disabled="Number(key) === formModel.careers.length - 1" text @click="itemsMoveDown('careers', key)">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:arrow-down-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button text @click="itemsCopy('careers', key)">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:copy-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button text @click="itemsRemove('careers', key)">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:delete-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                </div>
              </div>
            </div>
          </n-card>
        </div>
        <div v-else class="w-full" style="padding: 20px 0">
          <n-empty description="未填写工作经历" :show-icon="false" />
        </div>

        <div class="w-full flex">
          <n-button dashed round size="small" class="w-full" @click="itemsAdd('careers')">
            <template #icon>
              <n-icon>
                <Icon icon="ant-design:plus-outlined" />
              </n-icon>
            </template>
            添加工作经历
          </n-button>
        </div>
      </div>

      <div class="flex flex-col" style="gap: 16px; margin-top: 32px;">
        <n-divider title-placement="left" style="margin: 0;">
          家庭成员
        </n-divider>

        <div v-if="formModel.familys && formModel.familys.length > 0" class="w-full">
          <n-card v-for="(item, key) in formModel.familys" :key="key" :content-style="{ padding: '0' }" class="detail-card-box">
            <div class="flex items-stretch">
              <div class="label-nums">
                <n-text strong>
                  #{{ Number(key) + 1 }}
                </n-text>
              </div>

              <div class="detail-card-box-content">
                <n-grid :cols="24" :x-gap="24" :y-gap="24">
                  <n-form-item-gi :span="8" label="姓名" :path="`familys[${key}].name`" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.name" clearable />
                  </n-form-item-gi>
                  <n-form-item-gi :span="8" label="手机号" :path="`familys[${key}].mobile`" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.mobile" clearable />
                  </n-form-item-gi>
                  <n-form-item-gi :span="8" label="年龄" :path="`familys[${key}].age`" label-width="80" :show-feedback="false">
                    <n-input-number v-model:value="item.age" :show-button="false" clearable />
                  </n-form-item-gi>
                  <n-form-item-gi :span="8" label="称谓" :path="`familys[${key}].title`" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.title" clearable />
                  </n-form-item-gi>
                  <n-form-item-gi :span="16" label="住址" :path="`familys[${key}].address`" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.address" clearable />
                  </n-form-item-gi>
                </n-grid>
              </div>

              <div class="menu-bar">
                <div class="flex items-start justify-center gap-[10px]">
                  <n-button v-if="formModel.familys.length > 1" :disabled="Number(key) === 0" text @click="itemsMoveUp('familys', key)">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:arrow-up-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button v-if="formModel.familys.length > 1" :disabled="Number(key) === formModel.familys.length - 1" text @click="itemsMoveDown('familys', key)">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:arrow-down-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button text @click="itemsCopy('familys', key)">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:copy-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button text @click="itemsRemove('familys', key)">
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:delete-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                </div>
              </div>
            </div>
          </n-card>
        </div>
        <div v-else class="w-full" style="padding: 20px 0">
          <n-empty description="未填写家庭成员" :show-icon="false" />
        </div>

        <div class="w-full flex">
          <n-button dashed round size="small" class="w-full" @click="itemsAdd('familys')">
            <template #icon>
              <n-icon>
                <Icon icon="ant-design:plus-outlined" />
              </n-icon>
            </template>
            添加家庭成员
          </n-button>
        </div>
      </div>
    </n-form>

    <n-form
      v-else
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="formModel"
    >
      <n-grid :cols="24" :x-gap="20">
        <n-form-item-gi :span="16" :show-feedback="false">
          <n-grid :cols="24" :x-gap="20">
            <n-form-item-gi :span="12" label="姓名">
              <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="手机号码">
              <n-input v-model:value="formModel.mobile" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="身份证号">
              <n-input v-model:value="formModel.card" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="签发日期">
              <n-input :value="formModel.transform?.card_issue" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="有效日期">
              <n-input :value="formModel.transform?.card_valid" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="出生日期">
              <n-input v-model:value="formModel.birthday" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="性别">
              <n-input :value="dictLabel('organ_user_gender', formModel.gender)" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="人员类型">
              <n-input :value="dictLabel('staff_info_types', formModel.types)" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="民族">
              <n-input v-model:value="formModel.nation" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="文化程度">
              <n-input v-model:value="formModel.extent" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="专业">
              <n-input v-model:value="formModel.subject" placeholder="" readonly="true" />
            </n-form-item-gi>
          </n-grid>
        </n-form-item-gi>
        <n-form-item-gi :span="8" :show-feedback="false">
          <Upload
            v-model:value="formModel.user_pic"
            :max-number="1"
            :only-image="false"
            upload-title="人员照片"
            :disabled="true"
            :width="280"
            :height="286"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="毕业院校">
          <n-input v-model:value="formModel.school" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="特长">
          <n-input v-model:value="formModel.feature" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="政治面貌">
          <n-input v-model:value="formModel.politics" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="兵役情况">
          <n-input v-model:value="formModel.military" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="健康状况">
          <n-input v-model:value="formModel.health" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="婚姻状况">
          <n-input v-model:value="formModel.marital" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="子女数">
          <n-input-number v-model:value="formModel.children" placeholder="" :show-button="false" :readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="身高">
          <n-input-number v-model:value="formModel.stature" placeholder="" :show-button="false" :readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="户口类型">
          <n-input v-model:value="formModel.census" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="籍贯">
          <n-input v-model:value="formModel.native" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="户口地址">
          <n-input v-model:value="formModel.location" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="居住地址">
          <n-input v-model:value="formModel.address" placeholder="" readonly="true" />
        </n-form-item-gi>
      </n-grid>
      <n-divider title-placement="left">
        入职信息
      </n-divider>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="24" label="意向单位">
          <n-input v-model:value="formModel.team_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="派驻分队">
          <n-input v-model:value="formModel.branch_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="工资级别">
          <n-input v-model:value="formModel.scale" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="职务">
          <n-input v-model:value="formModel.ranks" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="岗位">
          <n-input v-model:value="formModel.position" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="保安员证">
          <n-input v-model:value="formModel.license" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="银行账号">
          <n-input v-model:value="formModel.bank_code" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="开户银行">
          <n-input v-model:value="formModel.bank_open" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注">
          <n-input
            v-model:value="formModel.remark"
            type="textarea"
            :rows="3"
            placeholder=""
            readonly="true"
          />
        </n-form-item-gi>
      </n-grid>
      <n-divider title-placement="left">
        档案附件
      </n-divider>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="8" label="岗位需求表">
          <Upload v-model:value="formModel.files_gwxqb" :only-image="false" :disabled="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="面试登记表">
          <Upload v-model:value="formModel.files_msdjb" :only-image="false" :disabled="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="无犯罪记录证明">
          <Upload v-model:value="formModel.files_wfzzm" :only-image="false" :disabled="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="体验报告/健康证">
          <Upload v-model:value="formModel.files_jkbg" :only-image="false" :disabled="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="最高学历证书">
          <Upload v-model:value="formModel.files_xlzs" :only-image="false" :disabled="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="身份证">
          <Upload v-model:value="formModel.files_sfz" :only-image="false" :disabled="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="户口本">
          <Upload v-model:value="formModel.files_hkb" :only-image="false" :disabled="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="银行卡">
          <Upload v-model:value="formModel.files_yhk" :only-image="false" :disabled="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="保安员证">
          <Upload v-model:value="formModel.files_zyzbz" :only-image="false" :disabled="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="附件">
          <Upload v-model:value="formModel.files" :only-image="false" :disabled="true" />
        </n-form-item-gi>
      </n-grid>

      <div class="flex flex-col" style="gap: 16px; margin-top: 16px;">
        <n-divider title-placement="left" style="margin: 0;">
          资格证书
        </n-divider>

        <div v-if="formModel.ability && formModel.ability.length > 0" class="w-full">
          <n-card v-for="(item, key) in formModel.ability" :key="key" :content-style="{ padding: '0' }" class="detail-card-box">
            <div class="flex items-stretch">
              <div class="label-nums">
                <n-text strong>
                  #{{ Number(key) + 1 }}
                </n-text>
              </div>

              <div class="detail-card-box-content">
                <n-grid :cols="24" :x-gap="24" :y-gap="24">
                  <n-form-item-gi :span="16" label="证书名称" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.name" placeholder="" readonly="true" />
                  </n-form-item-gi>
                  <n-form-item-gi :span="8" label="页码数" label-width="80" :show-feedback="false">
                    <n-input-number v-model:value="item.pagacount" placeholder="" :show-button="false" :readonly="true" />
                  </n-form-item-gi>
                  <n-form-item-gi :span="24" label="附件" label-width="80" :show-feedback="false">
                    <Upload
                      v-model:value="item.files"
                      upload-title="上传附件"
                      :max-number="1"
                      :only-image="false"
                      :disabled="true"
                    />
                  </n-form-item-gi>
                </n-grid>
              </div>
            </div>
          </n-card>
        </div>
        <div v-else class="w-full" style="padding: 20px 0">
          <n-empty description="未填写资格证书" :show-icon="false" />
        </div>
      </div>

      <div class="flex flex-col" style="gap: 16px; margin-top: 16px;">
        <n-divider title-placement="left" style="margin: 0;">
          职称证书
        </n-divider>

        <div v-if="formModel.achieve && formModel.achieve.length > 0" class="w-full">
          <n-card v-for="(item, key) in formModel.achieve" :key="key" :content-style="{ padding: '0' }" class="detail-card-box">
            <div class="flex items-stretch">
              <div class="label-nums">
                <n-text strong>
                  #{{ Number(key) + 1 }}
                </n-text>
              </div>

              <div class="detail-card-box-content">
                <n-grid :cols="24" :x-gap="24" :y-gap="24">
                  <n-form-item-gi :span="16" label="证书名称" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.name" placeholder="" readonly="true" />
                  </n-form-item-gi>
                  <n-form-item-gi :span="8" label="页码数" label-width="80" :show-feedback="false">
                    <n-input-number v-model:value="item.pagacount" placeholder="" :show-button="false" :readonly="true" />
                  </n-form-item-gi>
                  <n-form-item-gi :span="24" label="附件" label-width="80" :show-feedback="false">
                    <Upload
                      v-model:value="item.files"
                      upload-title="上传附件"
                      :max-number="1"
                      :only-image="false"
                      :disabled="true"
                    />
                  </n-form-item-gi>
                </n-grid>
              </div>
            </div>
          </n-card>
        </div>
        <div v-else class="w-full" style="padding: 20px 0">
          <n-empty description="未填写职称证书" :show-icon="false" />
        </div>
      </div>

      <div class="flex flex-col" style="gap: 16px; margin-top: 16px;">
        <n-divider title-placement="left" style="margin: 0;">
          联系人
        </n-divider>

        <div v-if="formModel.relates && formModel.relates.length > 0" class="w-full">
          <n-card v-for="(item, key) in formModel.relates" :key="key" :content-style="{ padding: '0' }" class="detail-card-box">
            <div class="flex items-stretch">
              <div class="label-nums">
                <n-text strong>
                  #{{ Number(key) + 1 }}
                </n-text>
              </div>

              <div class="detail-card-box-content">
                <n-grid :cols="24" :x-gap="24" :y-gap="24">
                  <n-form-item-gi :span="8" label="类型" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.types" placeholder="" readonly="true" />
                  </n-form-item-gi>
                  <n-form-item-gi :span="8" label="姓名" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.name" placeholder="" readonly="true" />
                  </n-form-item-gi>
                  <n-form-item-gi :span="8" label="手机号" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.mobile" placeholder="" readonly="true" />
                  </n-form-item-gi>
                  <n-form-item-gi :span="8" label="关系" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.title" placeholder="" readonly="true" />
                  </n-form-item-gi>
                  <n-form-item-gi :span="16" label="住址" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.address" placeholder="" readonly="true" />
                  </n-form-item-gi>
                </n-grid>
              </div>
            </div>
          </n-card>
        </div>
        <div v-else class="w-full" style="padding: 20px 0">
          <n-empty description="未填写联系人" :show-icon="false" />
        </div>
      </div>

      <div class="flex flex-col" style="gap: 16px; margin-top: 16px;">
        <n-divider title-placement="left" style="margin: 0;">
          工作经历
        </n-divider>

        <div v-if="formModel.careers && formModel.careers.length > 0" class="w-full">
          <n-card v-for="(item, key) in formModel.careers" :key="key" :content-style="{ padding: '0' }" class="detail-card-box">
            <div class="flex items-stretch">
              <div class="label-nums">
                <n-text strong>
                  #{{ Number(key) + 1 }}
                </n-text>
              </div>

              <div class="detail-card-box-content">
                <n-grid :cols="24" :x-gap="24" :y-gap="24">
                  <n-form-item-gi :span="12" label="工作单位" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.employer" placeholder="" readonly />
                  </n-form-item-gi>
                  <n-form-item-gi :span="6" label="加入月份" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.add_date" placeholder="" readonly />
                  </n-form-item-gi>
                  <n-form-item-gi :span="6" label="离职月份" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.end_date" placeholder="" readonly />
                  </n-form-item-gi>
                  <n-form-item-gi :span="12" label="职务" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.position" placeholder="" readonly />
                  </n-form-item-gi>
                  <n-form-item-gi :span="6" label="证明人" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.name" placeholder="" readonly />
                  </n-form-item-gi>
                  <n-form-item-gi :span="6" label="手机号" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.mobile" placeholder="" readonly />
                  </n-form-item-gi>
                  <n-form-item-gi :span="24" label="工作内容" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.content" type="textarea" :rows="3" placeholder="" readonly />
                  </n-form-item-gi>
                </n-grid>
              </div>
            </div>
          </n-card>
        </div>
        <div v-else class="w-full" style="padding: 20px 0">
          <n-empty description="未填写工作经历" :show-icon="false" />
        </div>
      </div>

      <div class="flex flex-col" style="gap: 16px; margin-top: 16px;">
        <n-divider title-placement="left" style="margin: 0;">
          家庭成员
        </n-divider>

        <div v-if="formModel.familys && formModel.familys.length > 0" class="w-full">
          <n-card v-for="(item, key) in formModel.familys" :key="key" :content-style="{ padding: '0' }" class="detail-card-box">
            <div class="flex items-stretch">
              <div class="label-nums">
                <n-text strong>
                  #{{ Number(key) + 1 }}
                </n-text>
              </div>

              <div class="detail-card-box-content">
                <n-grid :cols="24" :x-gap="24" :y-gap="24">
                  <n-form-item-gi :span="8" label="姓名" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.name" placeholder="" readonly="true" />
                  </n-form-item-gi>
                  <n-form-item-gi :span="8" label="手机号" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.mobile" placeholder="" readonly="true" />
                  </n-form-item-gi>
                  <n-form-item-gi :span="8" label="年龄" label-width="80" :show-feedback="false">
                    <n-input-number v-model:value="item.age" placeholder="" :show-button="false" :readonly="true" />
                  </n-form-item-gi>
                  <n-form-item-gi :span="8" label="称谓" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.title" placeholder="" readonly="true" />
                  </n-form-item-gi>
                  <n-form-item-gi :span="16" label="住址" label-width="80" :show-feedback="false">
                    <n-input v-model:value="item.address" placeholder="" readonly="true" />
                  </n-form-item-gi>
                </n-grid>
              </div>
            </div>
          </n-card>
        </div>
        <div v-else class="w-full" style="padding: 20px 0">
          <n-empty description="未填写家庭成员" :show-icon="false" />
        </div>
      </div>
    </n-form>

    <template #footer>
      <n-flex justify="end">
        <n-button @click="modalRef?.close">
          关闭
        </n-button>
        <BizDraftBox
          v-if="isEdit && Number(formModel.id) === 0"
          types="hr/resume/entry"
          :save="() => ({ ...formModel })"
          :get="updateModel"
        />
        <n-button
          v-if="isEdit"
          type="primary"
          :disabled="!hasPerm"
          :loading="btnLoading"
          @click="submit"
        >
          保存
        </n-button>
      </n-flex>
    </template>
  </SpModal>
</template>
