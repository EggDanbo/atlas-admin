<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { ModalInst, OpenModal } from '@/components/SpModal'
import type { TableInstance } from '@/components/SpTable'
import { format } from 'date-fns'
import printJS from 'print-js'
import { add, multiply, round, subtract } from 'xe-utils'
import DraftBox from '@/components/DraftBox'
import { BizLogChanges, LogBiz } from '@/components/Logs/Biz'
import { SpCascader } from '@/components/SpCascader'
import { AssistSelect } from '@/components/TableSelect'
import { createTransformer, useDetail } from '@/hooks/detail'
import { content as contentApi } from '@/service/api/basic'
import { entry as api } from '@/service/api/vouch'
import { useEnumStore } from '@/store/modules/enums'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'
import { gridOptions, updateDataTableCount, viewGridOptions } from './columns'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)
const logBizChangesRef = ref<OpenModal | null>(null)

const tableKeys = ref<any>(null)
const tableRef = ref<TableInstance | null>(null)
const viewTableRef = ref<any>(null)

const modalMode = ref<string | null>(null)

const updateNoValue = ref<string | null>(null)
const updateNoModalRef = ref<ModalInst | null>(null)

const enumStore = useEnumStore()

const tenantId = ref<any>(null)
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

const contentTreeOptions = ref<any>([])
async function loadContentOptions() {
  const { isSuccess, data } = await contentApi.tree()
  if (!isSuccess)
    return
  contentTreeOptions.value = data
}

async function getLastDate() {
  const { isSuccess, data } = await contentApi.getLast()
  if (!isSuccess)
    return
  formModel.date = Number(data)
}

async function load() {
  await getLastDate()
  await loadContentOptions()

  tenantId.value = tenantStorage.get()
}

function createFormModel() {
  return {
    id: '0',
    opt_confirm: false,
    source: '0',
    date: Date.now(),
    no: null,
    attach: null,
    remark: null,
    links: null,
    list: [] as any,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    date: [{ type: 'number', required: true, message: '请选择凭证日期', trigger: 'change' }],
    source: [{ required: true, message: '请选择凭证来源', trigger: 'change' }],
  }

  for (let i = 0; i < formModel.list.length; i++) {
    const item: any = formModel.list[i]

    for (const n in assistMapping) {
      const targetKey = assistMapping[n]
      rules[`list[${i}].${targetKey}_id`] = [{ required: false, trigger: ['blur', 'change'] }]
    }
    const requireList = item.content_require?.split(',').map(item => item.trim()).filter(Boolean)
    requireList?.forEach((name) => {
      const targetKey = assistMapping[name]
      if (targetKey) {
        rules[`list[${i}].${targetKey}_id`][0].required = true
      }
    })

    if (item.content_period) {
      rules[`list[${i}].expire`] = [{ required: true, trigger: ['blur', 'change'] }]
    }
    else {
      rules[`list[${i}].expire`] = [{ required: false, trigger: ['blur', 'change'] }]
    }
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
  showEdit,
  submit,
  edit,
  clearTabState,
  updateModel,
} = useDetail<FormModel>({
  api,
  createFormModel,
  title: '凭证录入',
  permission: { useTabPermission: true, permName: 'DEMO_VOUCH_ENTRY' },
  canEdit: form => true,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    string: ['source'],
    number: ['date'],
    enum: {
      source: 'vouch_entry_source',
    },
    custom: {
      date: val => val ? format(Number(val), 'yyyy-MM') : null,
    },
  }),
  async beforeEdit(_data, params) {
    await load()
    modalMode.value = params?.mode

    if (params?.isvouch) {
      const data = params?.data

      formModel.no = data.no
      formModel.date = Number(data.date)
      formModel.types = String(data.types)
      formModel.links = data.links
      formModel.source = data.source
      formModel.attach = data.attach

      handleDateSelected()

      formModel.list = data.list
    }

    if (formModel.list.length === 0) {
      tableItemsAdd({ opt: 'list' })
    }
    else {
      for (const i in formModel.list) {
        const item = formModel.list[i]
        item.transform = {}
        item.expire = item.expire && Number(item.expire) > 0 ? Number(item.expire) : null
        item.transform.expire = item.expire && Number(item.expire) > 0 ? format((Number(item.expire)), 'yyyy-MM') : null
      }
    }

    return true
  },
  beforeView() {
    return true
  },
  async beforeSubmit() {
    if (await tableItemsCheck(tableRef.value))
      return false

    const list = formModel.list.filter(q => q.digest && q.content_id)
    let debit = 0
    let credit = 0
    for (const item of list) {
      debit = add(debit, item.debit || 0)
      credit = add(credit, item.credit || 0)
    }
    if (Math.abs(Number(debit) - Number(credit)) > 0.005) {
      toast.error('借方金额与贷方金额不一致')
      return false
    }
    list.forEach((item, index) => {
      item.line = index + 1
    })
    formModel.list = list

    return true
  },
  onOpen: async (params, mode) => {
    await nextTick()
    if (mode === 'view') {
      viewTableRef.value.redoHeight()
      tableKeys.value = 0
      updateDataTableCount(formModel.list)
    }
    else {
      tableRef.value?.redoHeight()
      tableKeys.value = 0
      updateDataTableCount(formModel.list)
    }
  },
})

function handleDateSelected() {
  if (formModel.date) {
    loadContentOptions()
  }
}

async function tableItemsCheck(tref: any) {
  const $table = tref
  if ($table) {
    const errMap = await $table.table.fullValidate(true)
    return !!errMap
  }
  return false
}

function rowsChange(e, tref) {
  tableKeys.value = Number(e.rowIndex)
  const $table = tref
  $table?.editRowEvent(e.row)

  handleRowsChange()
}

function viewRosChange(e) {
  tableKeys.value = Number(e.rowIndex)
}

async function tableItemsAdd({ opt, key = 0 }: { opt: string, key?: number | string }) {
  const listNums = Number(key)
  const list: any = {}

  if (formModel[opt] && formModel[opt].length > 0) {
    if (await tableItemsCheck(tableRef.value))
      return
  }

  formModel[opt].splice(listNums + 1, 0, list)
}

function tableItemsRemove({ opt, key }: { opt: string, key: number | string }) {
  const items = formModel[opt]
  if (items.length > 1) {
    items.splice(key, 1)
  }
  else {
    toast.warning('必须录入凭证信息')
  }
}

function tableItemsMoveUp({ opt, key }: { opt: string, key: number | string }) {
  const nuns = Number(key)
  if (nuns === 0)
    return
  const items = formModel[opt];
  [items[nuns], items[nuns - 1]] = [items[nuns - 1], items[nuns]]
}

function tableItemsMoveDown({ opt, key }: { opt: string, key: number | string }) {
  const nuns = Number(key)
  if (nuns < formModel[opt].length - 1) {
    const items = formModel[opt];
    [items[nuns], items[nuns + 1]] = [items[nuns + 1], items[nuns]]
  }
}

function handleItemContentSelected(options, row) {
  if (options) {
    row.content_name = options.label
    row.content_assist = options.assist
    row.content_require = options.require
    row.content_period = options.period
  }
  else {
    row.content_name = null
  }

  handleRowsChange()
}

function handleUpdateDebit(row) {
  if (row.debit)
    row.credit = null
  updateAmount()
}

function handleUpdateCredit(row) {
  if (row.credit)
    row.debit = null
  updateAmount()
}

function updateAmount() {
  let amount = 0
  const items = formModel.list
  const item = items[tableKeys.value]
  amount = item.debit ? add(amount, item.debit) : add(amount, item.credit)
  item.amount = round(multiply(amount, item.rate), 2)

  updateDataTableCount(items)
}

function handleRowsChange() {
  for (const i in disabledOptions.value) {
    disabledOptions.value[i] = true
  }

  const items = formModel.list
  const item = items[tableKeys.value]
  const assist = item?.content_assist
  const period = item?.content_period

  if (assist) {
    Object.values(assistMapping).forEach((name) => {
      disabledOptions.value[name] = true
    })

    const assistList = assist.split(',').map(item => item.trim()).filter(Boolean)
    assistList.forEach((name) => {
      const targetKey = assistMapping[name]
      if (targetKey) {
        disabledOptions.value[targetKey] = false
      }
    })

    disabledOptions.value.expire = !period
  }
}

async function print() {
  btnLoading.value = true
  const { isSuccess, data } = await api.card(formModel.id).finally(() => {
    btnLoading.value = false
  })
  if (isSuccess) {
    printJS({
      printable: data,
      type: 'pdf',
      showModal: true,
      modalMessage: '下载中...',
    })
  }
}

async function copy(isRed?: boolean) {
  await edit(formModel.id)
  await load()

  modalRef.value.setProps({ title: isRed ? '凭证录入-冲红' : '凭证录入-复制', mask: true })
  formModel.id = '0'
  formModel.no = null
  const listArr = formModel.list
  if (listArr?.length > 0) {
    listArr.forEach((item) => {
      item.id = null
      if (isRed) {
        item.digest = `${formModel.red}${item.digest}`
        item.debit = subtract(0, item.debit)
        item.credit = subtract(0, item.credit)
      }

      item.debit = item.debit === 0 ? null : item.debit
      item.credit = item.credit === 0 ? null : item.credit
    })
  }

  handleDateSelected()

  await nextTick()
  formModel.list = listArr
  tableRef.value?.redoHeight()
  if (formModel.list.length === 0) {
    tableItemsAdd({ opt: 'list' })
  }
  updateDataTableCount(formModel.list)
}

function handleNo() {
  updateNoValue.value = null
  updateNoModalRef.value?.open()
}

async function handleUpdateNo() {
  if (!updateNoValue.value) {
    toast.error('请输入凭证号码')
    return
  }

  btnLoading.value = true
  const { isSuccess } = await api
    .updateNo({
      id: formModel.id,
      no: updateNoValue.value,
    })
    .finally(() => (btnLoading.value = false))
  if (!isSuccess)
    return
  toast.success('操作成功')
  updateNoModalRef.value?.close()
  modalRef.value.close()
  emit('on-action', 'EDIT')
}

function handleLogs(opt?: string) {
  if (opt === 'no') {
    logBizChangesRef.value?.open({ xid: formModel.id, name: 'vouch_bills', field: 'no' })
  }
  else {
    logBizRef.value?.open({ xid: formModel.id, name: 'vouch_bills' })
  }
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'VouchEntryDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="80vw" height="85vh" :before-close="clearTabState">
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
        <n-form-item-gi :span="8" label="凭证日期" path="date">
          <n-date-picker
            v-model:value="formModel.date"
            type="date"
            clearable
            fast-month-select
            class="w-full"
            @update:value="handleDateSelected"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="凭证号码" path="no">
          <n-input-number
            v-model:value="formModel.no"
            placeholder="不填写则自增编号，非补断号不要填写"
            :show-button="false"
            :precision="0"
            clearable
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="附件张数" path="attach">
          <n-input-number
            v-model:value="formModel.attach"
            :show-button="false"
            :precision="0"
            clearable
            class="w-full"
          />
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
      <div class="stamp-text">
        {{ enumStore.getLabel('vouch_entry_status', formModel.status) }}
      </div>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="8" label="凭证日期">
          <n-input :value="formModel.transform?.date" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="凭证号码">
          <n-input-number v-model:value="formModel.no" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="附件纸张">
          <n-input-number v-model:value="formModel.attach" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
      </n-grid>
    </n-form>

    <SpTable v-if="isEdit" ref="tableRef" v-bind="gridOptions" :data-source="formModel.list" @current-change="rowsChange($event, tableRef)">
      <template #operate="{ rowIndex }">
        <div class="flex items-center justify-right gap-[10px]">
          <n-button v-if="formModel.list.length > 1" :disabled="Number(rowIndex) === 0" text @click="tableItemsMoveUp({ opt: 'list', key: rowIndex })">
            <template #icon>
              <n-icon>
                <Icon icon="ant-design:arrow-up-outlined" />
              </n-icon>
            </template>
          </n-button>
          <n-button v-if="formModel.list.length > 1" :disabled="Number(rowIndex) === formModel.list.length - 1" text @click="tableItemsMoveDown({ opt: 'list', key: rowIndex })">
            <template #icon>
              <n-icon>
                <Icon icon="ant-design:arrow-down-outlined" />
              </n-icon>
            </template>
          </n-button>
          <n-button text @click="tableItemsAdd({ opt: 'list', key: rowIndex })">
            <template #icon>
              <n-icon>
                <Icon icon="ant-design:plus-outlined" />
              </n-icon>
            </template>
          </n-button>
          <n-button text @click="tableItemsRemove({ opt: 'list', key: rowIndex })">
            <template #icon>
              <n-icon>
                <Icon icon="ant-design:delete-outlined" />
              </n-icon>
            </template>
          </n-button>
        </div>
      </template>
      <!-- 凭证摘要 -->
      <template #digest_edit="{ row }">
        <n-input v-model:value="row.digest" clearable />
      </template>
      <template #content_default="{ row }">
        {{ row.content_name }}
      </template>
      <template #content_edit="{ row }">
        <SpCascader
          v-model:value="row.content_id"
          :options="contentTreeOptions"
          placeholder="请选择"
          value-field="id"
          @update:value="(_e, options) => handleItemContentSelected(options, row)"
        />
      </template>
      <template #debit_edit="{ row }">
        <n-input-number
          v-model:value="row.debit"
          clearable
          :show-button="false"
          :precision="2"
          @update:value="handleUpdateDebit(row)"
        />
      </template>
      <template #credit_edit="{ row }">
        <n-input-number
          v-model:value="row.credit"
          clearable
          :show-button="false"
          :precision="2"
          @update:value="handleUpdateCredit(row)"
        />
      </template>
    </SpTable>
    <SpTable v-else ref="viewTableRef" v-bind="viewGridOptions" :data-source="formModel.list" @current-change="viewRosChange" />

    <div v-for="(items, keys) in formModel.list" :key="keys">
      <div v-if="keys === tableKeys" style="margin-top: 30px">
        <n-form
          v-if="isEdit"
          label-placement="left"
          require-mark-placement="left"
          :label-width="110"
          :rules="formRules"
        >
          <n-grid :cols="24" :x-gap="24" :y-gap="24">
            <n-form-item-gi :span="12" label="部门" :path="`list[${keys}].room_id`" :show-feedback="false">
              <AssistSelect
                v-model:value="items.room_id"
                v-model:options="items.room_name"
                types="部门"
                :team_id="tenantId"
                :disabled="disabledOptions.room"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="6" label="员工" :path="`list[${keys}].work_id`" :show-feedback="false">
              <AssistSelect
                v-model:value="items.work_id"
                v-model:options="items.work_name"
                types="员工"
                :team_id="tenantId"
                :disabled="disabledOptions.work"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="6" label="到期月份" :path="`list[${keys}].expire`" :show-feedback="false">
              <n-date-picker
                v-model:value="items.expire"
                type="month"
                clearable
                :disabled="disabledOptions.expire"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="银行" :path="`list[${keys}].bank_id`" :show-feedback="false">
              <AssistSelect
                v-model:value="items.bank_id"
                v-model:options="items.bank_name"
                types="银行"
                :team_id="tenantId"
                :disabled="disabledOptions.bank"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="银行账号" :path="`list[${keys}].account_id`" :show-feedback="false">
              <AssistSelect
                v-model:value="items.account_id"
                v-model:options="items.account_name"
                types="银行账号"
                :team_id="tenantId"
                :disabled="disabledOptions.account"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="项目" :path="`list[${keys}].project_id`" :show-feedback="false">
              <AssistSelect
                v-model:value="items.project_id"
                v-model:options="items.project_name"
                types="项目"
                :team_id="tenantId"
                :disabled="disabledOptions.project"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="客户" :path="`list[${keys}].customer_id`" :show-feedback="false">
              <AssistSelect
                v-model:value="items.customer_id"
                v-model:options="items.customer_name"
                types="客户"
                :team_id="tenantId"
                :disabled="disabledOptions.customer"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="供应商" :path="`list[${keys}].supplier_id`" :show-feedback="false">
              <AssistSelect
                v-model:value="items.supplier_id"
                v-model:options="items.supplier_name"
                types="供应商"
                :team_id="tenantId"
                :disabled="disabledOptions.supplier"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="往来单位" :path="`list[${keys}].transact_id`" :show-feedback="false">
              <AssistSelect
                v-model:value="items.transact_id"
                v-model:options="items.transact_name"
                types="往来单位"
                :team_id="tenantId"
                :disabled="disabledOptions.transact"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="资产类别" :path="`list[${keys}].article_id`" :show-feedback="false">
              <AssistSelect
                v-model:value="items.article_id"
                v-model:options="items.article_name"
                types="资产类别"
                :team_id="tenantId"
                :disabled="disabledOptions.article"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="业态类型" :path="`list[${keys}].pattern_id`" :show-feedback="false">
              <AssistSelect
                v-model:value="items.pattern_id"
                v-model:options="items.pattern_name"
                types="业态类型"
                :team_id="tenantId"
                :disabled="disabledOptions.pattern"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="投资品种" :path="`list[${keys}].product_id`" :show-feedback="false">
              <AssistSelect
                v-model:value="items.product_id"
                v-model:options="items.product_name"
                types="投资品种"
                :team_id="tenantId"
                :disabled="disabledOptions.product"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="投资项目" :path="`list[${keys}].invests_id`" :show-feedback="false">
              <AssistSelect
                v-model:value="items.invests_id"
                v-model:options="items.invests_name"
                types="投资项目"
                :team_id="tenantId"
                :disabled="disabledOptions.invests"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="期间费用" :path="`list[${keys}].expense_id`" :show-feedback="false">
              <AssistSelect
                v-model:value="items.expense_id"
                v-model:options="items.expense_name"
                types="期间费用"
                :team_id="tenantId"
                :disabled="disabledOptions.expense"
              />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="营业外收支来源" :path="`list[${keys}].unusual_id`" :show-feedback="false">
              <AssistSelect
                v-model:value="items.unusual_id"
                v-model:options="items.unusual_name"
                types="营业外收支来源"
                :team_id="tenantId"
                :disabled="disabledOptions.unusual"
              />
            </n-form-item-gi>
          </n-grid>
        </n-form>

        <n-form
          v-if="!isEdit"
          label-placement="left"
          require-mark-placement="left"
          :label-width="110"
        >
          <n-grid :cols="24" :x-gap="24" :y-gap="24">
            <n-form-item-gi :span="12" label="部门" :show-feedback="false">
              <n-input v-model:value="items.room_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="6" label="员工" :show-feedback="false">
              <n-input v-model:value="items.work_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="6" label="到期月份" :show-feedback="false">
              <n-input :value="items.transform?.expire" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="银行" :show-feedback="false">
              <n-input v-model:value="items.bank_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="银行账号" :show-feedback="false">
              <n-input v-model:value="items.account_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="项目" :show-feedback="false">
              <n-input v-model:value="items.project_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="客户" :show-feedback="false">
              <n-input v-model:value="items.customer_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="供应商" :show-feedback="false">
              <n-input v-model:value="items.supplier_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="往来单位" :show-feedback="false">
              <n-input v-model:value="items.transact_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="资产类别" :show-feedback="false">
              <n-input v-model:value="items.article_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="业态类型" :show-feedback="false">
              <n-input v-model:value="items.pattern_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="投资品种" :show-feedback="false">
              <n-input v-model:value="items.product_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="投资项目" :show-feedback="false">
              <n-input v-model:value="items.invests_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="期间费用" :show-feedback="false">
              <n-input v-model:value="items.expense_name" placeholder="" readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="营业外收支来源" :show-feedback="false">
              <n-input v-model:value="items.unusual_name" placeholder="" readonly="true" />
            </n-form-item-gi>
          </n-grid>
        </n-form>
      </div>
    </div>

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
          types="vouch/entry"
          :save="() => ({ ...formModel })"
          :get="updateModel"
        />
        <n-button v-if="Number(formModel.id) > 0 && !isEdit" @click="print">
          打印
        </n-button>
        <n-button-group>
          <n-button v-if="Number(formModel.id) !== 0" @click="handleLogs('no')">
            改号历史
          </n-button>
          <n-button
            v-if="formModel.opt_confirm && Number(formModel.id) > 0 && !isEdit"
            type="success"
            @click="handleNo"
          >
            改号
          </n-button>
        </n-button-group>
        <n-button v-if="Number(formModel.id) > 0 && !isEdit" type="warning" @click="copy()">
          复制
        </n-button>
        <n-button
          v-if="!formModel.opt_confirm && Number(formModel.id) > 0 && !isEdit"
          type="error"
          @click="copy(true)"
        >
          冲红
        </n-button>
        <n-button v-if="formModel.opt_confirm && showEdit()" type="primary" @click="edit(formModel.id)">
          修改
        </n-button>
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

  <SpModal ref="updateNoModalRef" title="凭证号码修改" width="500">
    <template #default>
      <div class="w-full flex pb-5 pt-6">
        <n-input v-model:value="updateNoValue" clearable />
      </div>
    </template>

    <template #footer>
      <n-space justify="end">
        <n-button @click="updateNoModalRef?.close">
          关闭
        </n-button>
        <n-button @click="handleLogs('no')">
          改号历史
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="handleUpdateNo">
          修改
        </n-button>
      </n-space>
    </template>
  </SpModal>

  <LogBiz ref="logBizRef" />
  <BizLogChanges ref="logBizChangesRef" />
</template>
