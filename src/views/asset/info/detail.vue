<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import { format } from 'date-fns'
import printJS from 'print-js'
import DraftBox from '@/components/DraftBox'
import { Upload } from '@/components/File'
import { LogBiz } from '@/components/Logs/Biz'
import { SpCascader } from '@/components/SpCascader'
import { UserSelect } from '@/components/TableSelect'
import { createTransformer, useDetail } from '@/hooks/detail'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { unit as teamApi } from '@/service/api/access'
import { info as api } from '@/service/api/asset'
import { assetCategory as assetApi } from '@/service/api/masterdata'
import { useEnumStore } from '@/store/modules/enums'
import { tenantStorage } from '@/utils/tenant'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

const { getPermission } = useTabbar()
const tabPermName = getPermission()

const enumStore = useEnumStore()

const teamTreeOptions = ref<Recordable[]>([])
async function loadTeamTree() {
  const { isSuccess, data } = await teamApi.tree({
    permission: [tabPermName],
    tenant: tenantStorage.get(),
  })
  if (!isSuccess)
    return
  teamTreeOptions.value = data
}

const assetTreeOptions = ref<Recordable[]>([])
async function loadAssetTree() {
  const { isSuccess, data } = await assetApi.tree()
  if (!isSuccess)
    return
  assetTreeOptions.value = data
}

async function load() {
  await loadTeamTree()
  await loadAssetTree()
}

function createFormModel() {
  return {
    id: '0',
    stoped: '0',
    status: null,
    opt_alter: false,
    opt_renew: false,
    opt_confirm: true,
    team_id: null,
    article_id: null,
    name: null,
    brand: null,
    model: null,
    unit: null,
    supplier: null,
    serial: null,
    source: null,
    enroll: null,
    disuse: null,
    amount: null,
    realize: null,
    methods: null,
    durable: null,
    date: null,
    periods: null,
    compute: null,
    accrual: null,
    address: null,
    lead_id: null,
    remark: null,
    pic_id: [],
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  team_id: [{ required: true, message: '请选择所属单位', trigger: 'change' }],
  article_id: [{ required: true, message: '请选择资产分类', trigger: 'change' }],
  name: [{ required: true, message: '请填写资产名称', trigger: 'change' }],
  unit: [{ required: true, message: '请填写计量单位', trigger: 'change' }],
  source: [{ required: true, message: '请选择取得方式', trigger: 'change' }],
  enroll: [{ type: 'number', required: true, message: '请选择购置日期', trigger: 'change' }],
  amount: [{ type: 'number', required: true, message: '请输入购置金额', trigger: 'change' }],
  address: [{ required: true, message: '请输入存放位置', trigger: 'change' }],
  lead_id: [{ required: true, message: '请选择责任人', trigger: 'change' }],
}

const {
  isEdit,
  hasPerm,
  btnLoading,
  formModel,
  formRef,
  modalRef,
  exposed,
  showEdit,
  submit,
  edit,
  clearTabState,
  updateModel,
} = useDetail<FormModel>({
  api,
  createFormModel,
  title: '资产信息',
  permission: { useTabPermission: true, permName: 'AST_INFO' },
  canEdit: form => form.stoped === '0',
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    string: ['source', 'methods'],
    nullIfZero: ['article_id'],
    number: ['enroll', 'disuse', 'date'],
    custom: {
      enroll: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
      disuse: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
      date: val => val ? format(Number(val), 'yyyy-MM') : null,
    },
    enum: {
      source: 'asset_info_source',
      methods: 'asset_info_method',
    },
  }),
  async beforeEdit() {
    await load()
    return true
  },
})

async function printCard() {
  btnLoading.value = true
  const res = await api.card(formModel.id).finally(() => {
    btnLoading.value = false
  })
  if (!res.isSuccess)
    return
  printJS({
    printable: res.data,
    type: 'pdf',
    showModal: true,
    modalMessage: '下载中...',
  })
}

async function printLabel() {
  btnLoading.value = true
  const res = await api.label({ list: [formModel.id] }).finally(() => {
    btnLoading.value = false
  })
  if (!res.isSuccess)
    return
  printJS({
    printable: res.data,
    type: 'pdf',
    showModal: true,
    modalMessage: '下载中...',
  })
}

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id, name: 'asset_info' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'AssetInfoDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="960" :before-close="clearTabState">
    <n-form
      v-if="isEdit"
      ref="formRef"
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="formModel"
      :rules="formModel.stoped !== '0' ? {} : formRules"
      :disabled="!hasPerm || formModel.stoped !== '0'"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="16" :show-feedback="false">
          <n-grid :cols="24" :x-gap="20">
            <n-form-item-gi :span="24" label="所属单位" path="team_id">
              <SpCascader
                v-model:value="formModel.team_id"
                :options="teamTreeOptions"
                placeholder="请选择"
                value-field="id"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="14" label="资产名称" path="name">
              <n-input v-model:value="formModel.name" maxlength="25" clearable />
            </n-form-item-gi>
            <n-form-item-gi :span="10" label="计量单位" path="unit">
              <n-input v-model:value="formModel.unit" maxlength="10" clearable />
            </n-form-item-gi>
            <n-form-item-gi :span="14" label="取得方式" path="source">
              <n-select
                v-model:value="formModel.source"
                placeholder="请选择"
                :options="enumStore.getEnumOptions('asset_info_source')"
                clearable
              />
            </n-form-item-gi>
            <n-form-item-gi :span="10" label="序列号" path="serial">
              <n-input v-model:value="formModel.serial" maxlength="20" clearable />
            </n-form-item-gi>
            <n-form-item-gi :span="14" label="规格型号" path="model">
              <n-input v-model:value="formModel.model" maxlength="50" clearable />
            </n-form-item-gi>
            <n-form-item-gi :span="10" label="品牌" path="brand">
              <n-input v-model:value="formModel.brand" maxlength="10" clearable />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="供应商" path="supplier">
              <n-input v-model:value="formModel.supplier" maxlength="50" clearable />
            </n-form-item-gi>
          </n-grid>
        </n-form-item-gi>
        <n-form-item-gi :span="8" :show-feedback="false">
          <Upload
            v-model:value="formModel.pic_id"
            :max-number="1"
            :only-image="true"
            upload-title="资产照片"
            :disabled="!hasPerm || formModel.stoped !== '0'"
            :width="283"
            :height="230"
          />
        </n-form-item-gi>
      </n-grid>
      <n-divider title-placement="left">
        资产记账信息
      </n-divider>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="8" label="资产分类" path="article_id">
          <SpCascader
            v-model:value="formModel.article_id"
            :options="assetTreeOptions"
            placeholder="请选择"
            value-field="id"
            :disabled="formModel.opt_renew"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="购置日期" path="enroll">
          <n-date-picker
            v-model:value="formModel.enroll"
            type="date"
            fast-month-select
            :disabled="formModel.opt_renew"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="购置金额" path="amount">
          <n-input-number
            v-model:value="formModel.amount"
            :precision="2"
            :show-button="false"
            :disabled="formModel.opt_renew"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="折旧方法" path="methods">
          <n-select
            v-model:value="formModel.methods"
            placeholder="请选择"
            :options="enumStore.getEnumOptions('asset_info_method')"
            :disabled="formModel.opt_renew"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="折旧月数" path="durable">
          <n-input-number
            v-model:value="formModel.durable"
            :precision="0"
            :show-button="false"
            :disabled="formModel.opt_renew"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="预估残值" path="realize">
          <n-input-number
            v-model:value="formModel.realize"
            :precision="2"
            :show-button="false"
            :disabled="formModel.opt_renew"
            clearable
          />
        </n-form-item-gi>
      </n-grid>
      <n-divider title-placement="left">
        资产使用信息
      </n-divider>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="16" label="存放位置" path="address">
          <n-input
            v-model:value="formModel.address"
            maxlength="50"
            :disabled="formModel.opt_alter"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="责任人" path="lead_id">
          <UserSelect
            v-model:value="formModel.lead_id"
            v-model:options="formModel.lead_name"
            :team_id="formModel.team_id"
            :disabled="formModel.opt_alter"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注" path="remark">
          <n-input v-model:value="formModel.remark" type="textarea" :rows="3" clearable />
        </n-form-item-gi>
      </n-grid>
    </n-form>

    <n-form
      v-else
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="formModel"
    >
      <div v-if="formModel.stoped !== '0'" class="stamp-text">
        已停用
      </div>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="16" :show-feedback="false">
          <n-grid :cols="24" :x-gap="20">
            <n-form-item-gi :span="24" label="所属单位">
              <n-input v-model:value="formModel.team_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="14" label="资产名称">
              <n-input v-model:value="formModel.name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="10" label="计量单位">
              <n-input v-model:value="formModel.unit" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="14" label="取得方式">
              <n-input :value="formModel.transform?.source" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="10" label="序列号">
              <n-input v-model:value="formModel.serial" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="14" label="规格型号">
              <n-input v-model:value="formModel.model" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="10" label="品牌">
              <n-input v-model:value="formModel.brand" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="供货商">
              <n-input v-model:value="formModel.supplier" placeholder="" readonly="true" />
            </n-form-item-gi>
          </n-grid>
        </n-form-item-gi>
        <n-form-item-gi :span="8" :show-feedback="false">
          <Upload
            v-model:value="formModel.pic_id"
            :max-number="1"
            :only-image="true"
            upload-title="资产照片"
            :disabled="true"
            :width="283"
            :height="230"
          />
        </n-form-item-gi>
      </n-grid>
      <n-divider title-placement="left">
        资产记账信息
      </n-divider>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="8" label="资产分类">
          <n-input v-model:value="formModel.article_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="购置日期">
          <n-input :value="formModel.transform?.enroll" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="购置金额">
          <n-input-number v-model:value="formModel.amount" placeholder="" :precision="2" :show-button="false" :readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="折旧方式">
          <n-input :value="formModel.transform?.methods" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="折旧月数">
          <n-input-number v-model:value="formModel.durable" placeholder="" :show-button="false" :readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="预估残值">
          <n-input-number v-model:value="formModel.realize" placeholder="" :precision="2" :show-button="false" :readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="最末计提期间">
          <n-input :value="formModel.transform?.date" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="已提期数">
          <n-input-number v-model:value="formModel.periods" placeholder="" :show-button="false" :readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="本期计提">
          <n-input-number v-model:value="formModel.compute" placeholder="" :precision="2" :show-button="false" :readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="累计折旧">
          <n-input-number v-model:value="formModel.accrual" placeholder="" :precision="2" :show-button="false" :readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="资产净值">
          <n-input-number v-model:value="formModel.residue" placeholder="" :precision="2" :show-button="false" :readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="处置日期">
          <n-input :value="formModel.transform?.disuse" placeholder="" readonly="true" />
        </n-form-item-gi>
      </n-grid>
      <n-divider title-placement="left">
        资产使用信息
      </n-divider>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="16" label="存放位置">
          <n-input v-model:value="formModel.address" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="责任人">
          <n-input v-model:value="formModel.lead_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注">
          <n-input v-model:value="formModel.remark" :rows="3" placeholder="" readonly="true" />
        </n-form-item-gi>
      </n-grid>
    </n-form>
    <template #footer>
      <n-flex justify="end">
        <n-button @click="modalRef?.close">
          关闭
        </n-button>
        <n-button v-if="Number(formModel.id) !== 0" @click="handleLogs()">
          操作日志
        </n-button>
        <n-button-group>
          <n-button v-if="Number(formModel.id) !== 0" @click="printCard">
            打印卡片
          </n-button>
          <n-button v-if="Number(formModel.id) !== 0" @click="printLabel">
            打印标签
          </n-button>
        </n-button-group>
        <DraftBox
          v-if="isEdit && Number(formModel.id) === 0"
          types="asset/info"
          :save="() => ({ ...formModel })"
          :get="updateModel"
        />
        <n-button v-if="showEdit()" type="primary" @click="edit(formModel.id)">
          修改
        </n-button>
        <n-button
          v-if="isEdit"
          type="primary"
          :disabled="!hasPerm || formModel.stoped !== '0'"
          :loading="btnLoading"
          @click="submit"
        >
          保存
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <LogBiz ref="logBizRef" />
</template>
