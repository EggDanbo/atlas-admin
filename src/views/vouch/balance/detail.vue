<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import { format } from 'date-fns'
import DraftBox from '@/components/DraftBox'
import { LogBiz } from '@/components/Logs/Biz'
import { SpCascader } from '@/components/SpCascader'
import { AssistSelect } from '@/components/TableSelect'
import { createTransformer, useDetail } from '@/hooks/detail'
import { content } from '@/service/api/basic'
import { balance as api } from '@/service/api/vouch'
import { findTreeNodeById } from '@/utils'
import { tenantStorage } from '@/utils/tenant'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

const tenantId = ref<any>(null)
const contentTreeOptions = ref<any>([])
async function loadContentOptions() {
  const { isSuccess, data } = await content.tree()
  if (!isSuccess)
    return

  contentTreeOptions.value = data
  if (formModel.content_id) {
    const options = findTreeNodeById(contentTreeOptions.value, formModel.content_id)
    handleContentSelected(options)
  }
}

async function load() {
  await loadContentOptions()

  tenantId.value = tenantStorage.get()
}

const disabledOptions = ref<any>({
  expire: true,
  room: true,
  work: true,
  bank: true,
  account: true,
  project: true,
  customer: true,
  supplier: true,
  transact: true,
  article: true,
  pattern: true,
  product: true,
  invests: true,
  expense: true,
  unusual: true,
})
const assistMapping = {
  部门: 'room',
  员工: 'work',
  银行: 'bank',
  银行账号: 'account',
  项目: 'project',
  客户: 'customer',
  供应商: 'supplier',
  往来单位: 'transact',
  资产类别: 'article',
  业态类型: 'pattern',
  投资品种: 'product',
  投资项目: 'invests',
  期间费用: 'expense',
  营业外收支来源: 'unusual',
}

function createFormModel() {
  return {
    id: '0',
    opt_submit: true,
    year: null,
    content_id: null,
    content_name: null,
    debit: null,
    credit: null,
    expire: null,
    room_id: null,
    room_name: null,
    work_id: null,
    work_name: null,
    bank_id: null,
    bank_name: null,
    account_id: null,
    account_name: null,
    project_id: null,
    project_name: null,
    customer_id: null,
    customer_name: null,
    supplier_id: null,
    supplier_name: null,
    transact_id: null,
    transact_name: null,
    article_id: null,
    article_name: null,
    pattern_id: null,
    pattern_name: null,
    product_id: null,
    product_name: null,
    invests_id: null,
    invests_name: null,
    expense_id: null,
    expense_name: null,
    unusual_id: null,
    unusual_name: null,
    transform: {},
    content_period: false,
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules: FormRules = {
  content_id: [{ required: true, message: '请选择会计科目', trigger: 'change' }],
  expire: [{ type: 'number', required: true, message: '请选择到期月份', trigger: 'change' }],
  room_id: [{ required: false, message: '请选择部门', trigger: 'change' }],
  work_id: [{ required: false, message: '请选择员工', trigger: 'change' }],
  bank_id: [{ required: false, message: '请选择银行', trigger: 'change' }],
  account_id: [{ required: false, message: '请选择银行帐号', trigger: 'change' }],
  project_id: [{ required: false, message: '请选择项目', trigger: 'change' }],
  customer_id: [{ required: false, message: '请选择客户', trigger: 'change' }],
  supplier_id: [{ required: false, message: '请选择供应商', trigger: 'change' }],
  transact_id: [{ required: false, message: '请选择往来单位', trigger: 'change' }],
  article_id: [{ required: false, message: '请选择资产类别', trigger: 'change' }],
  pattern_id: [{ required: false, message: '请选择业态类型', trigger: 'change' }],
  product_id: [{ required: false, message: '请选择投资品种', trigger: 'change' }],
  invests_id: [{ required: false, message: '请选择投资项目', trigger: 'change' }],
  expense_id: [{ required: false, message: '请选择期间费用', trigger: 'change' }],
  unusual_id: [{ required: false, message: '请选择营业外收支来源', trigger: 'change' }],
}

const rules = ref({ ...formRules })

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
  title: '期初余额',
  permission: { useTabPermission: true, permName: 'DEMO_VOUCH_BALANCE' },
  canEdit: form => form.opt_submit,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    number: ['credit', 'debit', 'expire'],
    custom: {
      expire: val => val ? format(Number(val), 'yyyy-MM') : null,
    },
  }),
  async beforeEdit(data, params) {
    if (params.year)
      formModel.year = params.year

    handleContentSelected({
      assist: formModel.content_assist,
      require: formModel.content_require,
      period: formModel.content_period,
    })

    await load()
    return true
  },
})

function handleUpdateAmount(opt: string) {
  if (opt === 'debit') {
    formModel.credit = null
    formModel.amount = formModel.debit
  }
  else if (opt === 'credit') {
    formModel.debit = null
    formModel.amount = formModel.credit
  }
}

function handleContentSelected(options: any) {
  for (const i in disabledOptions.value) {
    disabledOptions.value[i] = true
  }

  if (options.assist) {
    const assistList = options.assist.split(',').map(item => item.trim()).filter(Boolean)
    const requireList = options.require.split(',').map(item => item.trim()).filter(Boolean)

    assistList.forEach((name) => {
      const targetKey = assistMapping[name]
      if (targetKey) {
        disabledOptions.value[targetKey] = false
      }
    })
    requireList.forEach((name) => {
      const targetKey = assistMapping[name]
      if (targetKey) {
        rules.value[`${targetKey}_id`][0].required = true
      }
    })
  }

  if (options.period) {
    disabledOptions.value.expire = false
    rules.value.expire[0].required = true
  }
  else {
    disabledOptions.value.expire = true
    rules.value.expire[0].required = false
  }
}

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id, name: 'vouch_entry' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'VouchBalanceDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="960" :before-close="clearTabState">
    <n-form
      v-if="isEdit"
      ref="formRef"
      label-placement="left"
      require-mark-placement="left"
      :label-width="110"
      :model="formModel"
      :rules="formModel.opt_submit ? rules : {}"
      :disabled="!hasPerm || !formModel.opt_submit"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="24" label="会计科目" path="content_id">
          <SpCascader
            v-model:value="formModel.content_id"
            :options="contentTreeOptions"
            placeholder="请选择"
            value-field="id"
            @update:value="(_value, options) => handleContentSelected(options)"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="借方金额" path="debit">
          <n-input-number
            v-model:value="formModel.debit"
            :show-button="false"
            :precision="2"
            clearable
            @update:value="handleUpdateAmount('debit')"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="贷方金额" path="credit">
          <n-input-number
            v-model:value="formModel.credit"
            :show-button="false"
            :precision="2"
            clearable
            @update:value="handleUpdateAmount('credit')"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="到期月份" path="expire">
          <n-date-picker
            v-model:value="formModel.expire"
            placeholder="请选择"
            type="month"
            :disabled="disabledOptions.expire"
            clearable
          />
        </n-form-item-gi>
      </n-grid>
      <n-divider title-placement="left">
        核算维度
      </n-divider>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="12" label="部门" path="room_id">
          <AssistSelect
            v-model:value="formModel.room_id"
            v-model:options="formModel.room_name"
            types="部门"
            :team_id="tenantId"
            :disabled="disabledOptions.room"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="员工" path="work_id">
          <AssistSelect
            v-model:value="formModel.work_id"
            v-model:options="formModel.work_name"
            types="员工"
            :team_id="tenantId"
            :disabled="disabledOptions.work"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="银行" path="bank_id">
          <AssistSelect
            v-model:value="formModel.bank_id"
            v-model:options="formModel.bank_name"
            types="银行"
            :team_id="tenantId"
            :disabled="disabledOptions.bank"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="银行账号" path="account_id">
          <AssistSelect
            v-model:value="formModel.account_id"
            v-model:options="formModel.account_name"
            types="银行账号"
            :team_id="tenantId"
            :disabled="disabledOptions.account"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="项目" path="project_id">
          <AssistSelect
            v-model:value="formModel.project_id"
            v-model:options="formModel.project_name"
            types="项目"
            :team_id="tenantId"
            :disabled="disabledOptions.project"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="客户" path="customer_id">
          <AssistSelect
            v-model:value="formModel.customer_id"
            v-model:options="formModel.customer_name"
            types="客户"
            :team_id="tenantId"
            :disabled="disabledOptions.customer"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="供应商" path="supplier_id">
          <AssistSelect
            v-model:value="formModel.supplier_id"
            v-model:options="formModel.supplier_name"
            types="供应商"
            :team_id="tenantId"
            :disabled="disabledOptions.supplier"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="往来单位" path="transact_id">
          <AssistSelect
            v-model:value="formModel.transact_id"
            v-model:options="formModel.transact_name"
            types="往来单位"
            :team_id="tenantId"
            :disabled="disabledOptions.transact"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="资产类别" path="article_id">
          <AssistSelect
            v-model:value="formModel.article_id"
            v-model:options="formModel.article_name"
            types="资产类别"
            :team_id="tenantId"
            :disabled="disabledOptions.article"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="业态类型" path="pattern_id">
          <AssistSelect
            v-model:value="formModel.pattern_id"
            v-model:options="formModel.pattern_name"
            types="业态类型"
            :team_id="tenantId"
            :disabled="disabledOptions.pattern"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="投资品种" path="product_id">
          <AssistSelect
            v-model:value="formModel.product_id"
            v-model:options="formModel.product_name"
            types="投资品种"
            :team_id="tenantId"
            :disabled="disabledOptions.product"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="投资项目" path="invests_id">
          <AssistSelect
            v-model:value="formModel.invests_id"
            v-model:options="formModel.invests_name"
            types="投资项目"
            :team_id="tenantId"
            :disabled="disabledOptions.invests"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="期间费用" path="expense_id">
          <AssistSelect
            v-model:value="formModel.expense_id"
            v-model:options="formModel.expense_name"
            types="期间费用"
            :team_id="tenantId"
            :disabled="disabledOptions.expense"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="营业外收支来源" path="unusual_id">
          <AssistSelect
            v-model:value="formModel.unusual_id"
            v-model:options="formModel.unusual_name"
            types="营业外收支来源"
            :team_id="tenantId"
            :disabled="disabledOptions.unusual"
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>

    <n-form
      v-else
      label-placement="left"
      require-mark-placement="left"
      :label-width="110"
      :model="formModel"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="24" label="会计科目">
          <n-input v-model:value="formModel.content_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="借方金额">
          <n-input-number v-model:value="formModel.debit" placeholder="" :precision="2" :show-button="false" :readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="贷方金额">
          <n-input-number v-model:value="formModel.credit" placeholder="" :precision="2" :show-button="false" :readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="到期月份">
          <n-input :value="formModel.transform?.expire" placeholder="" readonly="true" />
        </n-form-item-gi>
      </n-grid>
      <n-divider title-placement="left">
        核算维度
      </n-divider>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="12" label="部门">
          <n-input v-model:value="formModel.room_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="员工">
          <n-input v-model:value="formModel.work_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="银行">
          <n-input v-model:value="formModel.bank_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="银行账号">
          <n-input v-model:value="formModel.account_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="项目">
          <n-input v-model:value="formModel.project_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="客户">
          <n-input v-model:value="formModel.customer_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="供应商">
          <n-input v-model:value="formModel.supplier_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="往来单位">
          <n-input v-model:value="formModel.transact_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="资产类别">
          <n-input v-model:value="formModel.article_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="业态类型">
          <n-input v-model:value="formModel.pattern_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="投资品种">
          <n-input v-model:value="formModel.product_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="投资项目">
          <n-input v-model:value="formModel.invests_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="期间费用">
          <n-input v-model:value="formModel.expense_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="营业外收支来源">
          <n-input v-model:value="formModel.unusual_name" placeholder="" readonly="true" />
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
        <DraftBox
          v-if="isEdit && Number(formModel.id) === 0"
          types="vouch/balance"
          :save="() => ({ ...formModel })"
          :get="updateModel"
        />
        <n-button v-if="showEdit() && formModel.opt_submit" type="primary" @click="edit(formModel.id)">
          修改
        </n-button>
        <n-button
          v-if="isEdit"
          type="primary"
          :disabled="!hasPerm || !formModel.opt_submit"
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
