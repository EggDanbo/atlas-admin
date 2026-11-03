<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import { format } from 'date-fns'
import { add } from 'xe-utils'
import DraftBox from '@/components/DraftBox'
import { LogBiz } from '@/components/Logs/Biz'
import { SpCascader } from '@/components/SpCascader'
import { createTransformer, useDetail } from '@/hooks/detail'
import { product } from '@/service/api/basic'
import { promise as api } from '@/service/api/trade'
import { useEnumStore } from '@/store/modules/enums'
import { gridOptions, viewGridOptions } from './columns'

const emit = defineEmits(['on-action'])

const enumStore = useEnumStore()

const tableRefs = new Map()

function setTableRef(key, el) {
  if (el)
    tableRefs.set(key, el)
  else tableRefs.delete(key)
}

function getTableRef(key) {
  return tableRefs.get(key)
}

const logBizRef = ref<OpenModal | null>(null)
const modalMode = ref<string | null>(null)

const productTreeOptions = ref<Recordable[]>([])
async function loadProductTreeOptions() {
  const { isSuccess, data } = await product.tree()
  if (!isSuccess)
    return
  productTreeOptions.value = data
}

async function load() {
  await loadProductTreeOptions()
}

function createFormModel() {
  return {
    id: '0',
    no: null,
    name: null,
    types: null,
    indate: null,
    expire: null,
    amount: null,
    list: [],
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules = computed<FormRules>(() => {
  const rules: FormRules = {}

  // for (let i = 0; i < formModel.list.length; i++) {
  //   const item = formModel.list[i]
  //   for (let n = 0; n < item.incomes.length; n++) {
  //     rules[`list[${i}].incomes[${n}].period`] = [{ required: true, trigger: ['blur', 'change'] }]
  //     rules[`list[${i}].incomes[${n}].remain`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
  //     rules[`list[${i}].incomes[${n}].amount`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
  //     rules[`list[${i}].incomes[${n}].product_id`] = [{ required: false, trigger: ['blur', 'change'] }]
  //     rules[`list[${i}].incomes[${n}].rate`] = [{ type: 'number', required: false, trigger: ['blur', 'change'] }]
  //     rules[`list[${i}].incomes[${n}].pcs`] = [{ type: 'number', required: false, trigger: ['blur', 'change'] }]
  //     rules[`list[${i}].incomes[${n}].unit`] = [{ required: false, trigger: ['blur', 'change'] }]
  //     rules[`list[${i}].incomes[${n}].totals`] = [{ type: 'number', required: false, trigger: ['blur', 'change'] }]
  //   }
  // }

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
  params,
} = useDetail<FormModel>({
  api: {
    get() {
      return api.get({ ...params.value })
    },
    update() {
      return api.update({ ...formModel })
    },
  },
  createFormModel,
  title: '应收管理',
  permission: { useTabPermission: true, permName: 'DEMO_TRADE_PROMISE' },
  canEdit: form => !form.opt_submit,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  onBeforeOpen: (params, mode) => {
    modalMode.value = mode

    return true
  },
  transform: createTransformer({
    string: ['types', 'payment'],
    number: ['amount'],
    custom: {
      indate: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
      expire: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
    },
    enum: {
      types: 'trade_project_types',
      paymetn: 'trade_project_payment',
    },
  }),
  beforeEdit: async () => {
    formModel.list.forEach((item: any, index: number) => {
      item.transform = {}
      item.transform.payment = enumStore.getLabel('trade_project_payment', item.payment)
    })

    await load()

    formModel.list.forEach((item: any, index: number) => {
      if (item.incomes.length === 0) {
        tableItemsAdd({ opt: 'incomes', index })
      }
    })

    return true
  },
  beforeView: (data) => {
    data.list.forEach((item: any, index: number) => {
      item.transform = {}
      item.transform.payment = enumStore.getLabel('trade_project_payment', item.payment)
    })
    return true
  },
  onOpen: async (params, mode) => {
    await nextTick()
    if (mode === 'view') {
      formModel.list.forEach((item: any, index: number) => {
        getTableRef(`view_${index}`).redoHeight()
      })
    }
    else {
      formModel.list.forEach((item: any, index: number) => {
        getTableRef(index).redoHeight()
      })
    }
  },
})

async function tableItemsCheck({ index }: { index: number | string }) {
  const $table = getTableRef(index)
  if ($table) {
    const errMap = await $table.table.fullValidate(true)
    return !!errMap
  }
  return false
}

function rowsChange({ e, index }) {
  const $table = getTableRef(index)
  $table?.editRowEvent(e.row)
}

async function tableItemsAdd({ opt, index, key = 0 }: { opt: string, index: number | string, key?: number | string }) {
  const listNums = Number(key)
  const list: any = {}

  if (formModel.list[index][opt] && formModel.list[index][opt].length > 0) {
    if (await tableItemsCheck({ index }))
      return
  }

  formModel.list[index][opt].splice(listNums + 1, 0, list)
}

function tableItemsRemove({ opt, index, key = 0 }: { opt: string, index: number | string, key?: number | string }) {
  formModel.list[index][opt].splice(key, 1)
}

function tableItemsCopy({ opt, index, key = 0 }: { opt: string, index: number | string, key?: number | string }) {
  const items = formModel.list[index][opt]
  const item = items[key]
  const { _X_ROW_KEY: _, ...newItem } = item
  items.splice(Number(key) + 1, 0, newItem)
}

function tableItemsMoveUp({ opt, index, key = 0 }: { opt: string, index: number | string, key?: number | string }) {
  const nuns = Number(key)
  if (nuns === 0)
    return
  const items = formModel.list[index][opt];
  [items[nuns], items[nuns - 1]] = [items[nuns - 1], items[nuns]]
}

function tableItemsMoveDown({ opt, index, key = 0 }: { opt: string, index: number | string, key?: number | string }) {
  const nuns = Number(key)
  if (nuns < formModel.list[index][opt].length - 1) {
    const items = formModel.list[index][opt];
    [items[nuns], items[nuns + 1]] = [items[nuns + 1], items[nuns]]
  }
}

function handleIncomesAmount(key: number | string, income_key: number | string) {
  const item = formModel.list[key].incomes[income_key]
  item.totals = item.amount
  buildListAmountTotal(key)
}

function buildListAmountTotal(key: number | string) {
  const items = formModel.list[key]
  const sum = buildAllotsTotals(key, 'amount')
  items.amount = formatAmount(sum)
}

function buildAllotsTotals(keys: number | string, name: string) {
  const item = formModel.list[keys]
  if (item && item.incomes && item.incomes.length > 0) {
    const sum = item.incomes.reduce((accumulator, current) => {
      return add(accumulator, current[name])
    }, 0)
    return sum
  }
}

function formatAmount(amount: any) {
  // 检查是否为有效数字
  if (Number.isNaN(amount) || amount === null) {
    return '0.00'
  }

  // 转换为数字并保留两位小数
  const num = Number.parseFloat(amount).toFixed(2)

  // 分割整数和小数部分
  const parts = num.split('.')
  let integerPart = parts[0]
  const decimalPart = parts[1]

  // 添加千位分隔符
  integerPart = integerPart.replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',')

  // 组合并返回结果
  return `${integerPart}.${decimalPart}`
}

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id, name: 'trade_promise' })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'TradePromiseDetail' }
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
      :rules="formModel.stoped ? {} : formRules"
      :disabled="!hasPerm || formModel.stoped"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="8" label="所属单位">
          <n-input v-model:value="formModel.team_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="项目类型">
          <n-input :value="formModel.transform?.types" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="负责人">
          <n-input v-model:value="formModel.user_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="合同编号">
          <n-input v-model:value="formModel.no" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="项目名称">
          <n-input v-model:value="formModel.name" placeholder="" readonly>
            <template #suffix>
              {{ formModel.source }}
            </template>
          </n-input>
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="开始日期">
          <n-input :value="formModel.transform?.indate" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="结束日期">
          <n-input :value="formModel.transform?.expire" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="总服务费">
          <n-input-number v-model:value="formModel.amount" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
      </n-grid>

      <div class="flex flex-col" style="gap: 16px; margin-top: 16px;">
        <n-card v-for="(item, key) in formModel.list" :key="key" :content-style="{ padding: '0' }" class="detail-card-box">
          <div class="detail-card-box-content">
            <n-grid :cols="24" :x-gap="20" :y-gap="24">
              <n-form-item-gi :span="16" label="开票客户" label-width="100" :show-feedback="false">
                <n-input v-model:value="item.outer_name" placeholder="" readonly />
              </n-form-item-gi>
              <n-form-item-gi :span="8" label="支付方式" label-width="100" :show-feedback="false">
                <n-input :value="item.transform?.payment" placeholder="" readonly="true" />
              </n-form-item-gi>
              <n-form-item-gi :span="8" label="发票类型" label-width="100">
                <n-input v-model:value="item.invoice" placeholder="" readonly />
              </n-form-item-gi>
              <n-form-item-gi :span="8" label="不收费月份" label-width="100">
                <n-input v-model:value="item.months" placeholder="" readonly />
              </n-form-item-gi>
              <n-form-item-gi :span="8" label="应收金额" label-width="100">
                <n-input-number v-model:value="item.amount" placeholder="" :show-button="false" :readonly="false" />
              </n-form-item-gi>
            </n-grid>

            <SpTable :ref="(el) => setTableRef(key, el)" v-bind="gridOptions" :data-source="item.incomes" @current-change="rowsChange({ e: $event, index: key })">
              <template #operate="{ rowIndex }">
                <div class="flex items-center justify-right gap-[10px]">
                  <n-button
                    v-if="item.incomes && item.incomes.length > 1"
                    :disabled="Number(rowIndex) === 0"
                    text
                    @click="tableItemsMoveUp({ opt: 'incomes', index: key, key: rowIndex })"
                  >
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:arrow-up-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button
                    v-if="item.incomes && item.incomes.length > 1"
                    :disabled="Number(rowIndex) === formModel.list.length - 1"
                    text
                    @click="tableItemsMoveDown({ opt: 'incomes', index: key, key: rowIndex })"
                  >
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:arrow-down-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button
                    text
                    @click="tableItemsCopy({ opt: 'incomes', index: key, key: rowIndex })"
                  >
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:copy-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button
                    text
                    @click="tableItemsAdd({ opt: 'incomes', index: key, key: rowIndex })"
                  >
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:plus-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button
                    text
                    @click="tableItemsRemove({ opt: 'incomes', index: key, key: rowIndex })"
                  >
                    <template #icon>
                      <n-icon>
                        <Icon icon="ant-design:delete-outlined" />
                      </n-icon>
                    </template>
                  </n-button>
                </div>
              </template>

              <template #period_edit="{ row }">
                <n-input
                  v-model:value="row.period"
                  maxlength="116"
                  :disabled="!row.isedit"
                  clearable
                />
              </template>
              <template #remain_default="{ row }">
                {{ row.remain ? format(Number(row.remain), 'yyyy-MM-dd') : null }}
              </template>
              <template #remain_edit="{ row }">
                <n-date-picker
                  v-model:value="row.remain"
                  type="date"
                  fast-month-select
                  :disabled="!row.isedit"
                  clearable
                />
              </template>
              <template #amount_edit="{ row, rowIndex }">
                <n-input-number
                  v-model:value="row.amount"
                  :show-button="false"
                  :disabled="!row.isedit"
                  clearable
                  @update:value="handleIncomesAmount(key, rowIndex)"
                />
              </template>
              <template #product_default="{ row }">
                {{ row.product_name }}
              </template>
              <template #product_edit="{ row }">
                <SpCascader
                  v-model:value="row.product_id"
                  :options="productTreeOptions"
                  placeholder="请选择"
                  value-field="id"
                  @update:value="(_, options) => row.product = options.label"
                />
              </template>
              <template #model_edit="{ row }">
                <n-input
                  v-model:value="row.model"
                  maxlength="116"
                  :disabled="!row.isedit"
                  clearable
                />
              </template>
              <template #unit_edit="{ row }">
                <n-input
                  v-model:value="row.unit"
                  maxlength="10"
                  :disabled="!row.isedit"
                  clearable
                />
              </template>
              <template #rate_edit="{ row }">
                <n-input-number
                  v-model:value="row.rate"
                  :show-button="false"
                  :disabled="!row.isedit"
                  clearable
                />
              </template>
              <template #totals_edit="{ row }">
                <n-input-number
                  v-model:value="row.totals"
                  :show-button="false"
                  :disabled="!row.isedit"
                  clearable
                />
              </template>
            </SpTable>
            <div class="w-full flex">
              <n-button dashed round size="small" class="w-full" @click="tableItemsAdd({ opt: 'incomes', index: key })">
                <template #icon>
                  <n-icon>
                    <Icon icon="ant-design:plus-outlined" />
                  </n-icon>
                </template>
                添加
              </n-button>
            </div>
          </div>
        </n-card>
      </div>
    </n-form>

    <n-form
      v-else
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="formModel"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="8" label="所属单位">
          <n-input v-model:value="formModel.team_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="项目类型">
          <n-input :value="formModel.transform?.types" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="负责人">
          <n-input v-model:value="formModel.user_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="合同编号">
          <n-input v-model:value="formModel.no" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="项目名称">
          <n-input v-model:value="formModel.name" placeholder="" readonly>
            <template #suffix>
              {{ formModel.source }}
            </template>
          </n-input>
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="开始日期">
          <n-input :value="formModel.transform?.indate" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="结束日期">
          <n-input :value="formModel.transform?.expire" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="总服务费">
          <n-input-number v-model:value="formModel.amount" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
      </n-grid>

      <div class="flex flex-col" style="gap: 16px; margin-top: 16px;">
        <n-card v-for="(item, key) in formModel.list" :key="key" :content-style="{ padding: '0' }" class="detail-card-box">
          <div class="detail-card-box-content">
            <n-grid :cols="24" :x-gap="20" :y-gap="24">
              <n-form-item-gi :span="16" label="开票客户" label-width="100" :show-feedback="false">
                <n-input v-model:value="item.outer_name" placeholder="" readonly />
              </n-form-item-gi>
              <n-form-item-gi :span="8" label="支付方式" label-width="100" :show-feedback="false">
                <n-input :value="item.transform?.payment" placeholder="" readonly="true" />
              </n-form-item-gi>
              <n-form-item-gi :span="8" label="发票类型" label-width="100">
                <n-input v-model:value="item.invoice" placeholder="" readonly />
              </n-form-item-gi>
              <n-form-item-gi :span="8" label="不收费月份" label-width="100">
                <n-input v-model:value="item.months" placeholder="" readonly />
              </n-form-item-gi>
              <n-form-item-gi :span="8" label="应收金额" label-width="100">
                <n-input-number v-model:value="item.amount" placeholder="" :show-button="false" :readonly="false" />
              </n-form-item-gi>
            </n-grid>
            <SpTable :ref="(el) => setTableRef(`view_${key}`, el)" v-bind="viewGridOptions" :data-source="item.incomes">
              <template #remain_default="{ row }">
                {{ row.remain ? format(Number(row.remain), 'yyyy-MM-dd') : null }}
              </template>
            </SpTable>
          </div>
        </n-card>
      </div>
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
          types="trade/promise"
          :save="() => ({ ...formModel })"
          :get="updateModel"
        />
        <n-button v-if="showEdit()" type="primary" @click="edit(formModel.id)">
          修改
        </n-button>
        <n-button
          v-if="isEdit"
          type="primary"
          :loading="btnLoading"
          :disabled="!hasPerm"
          @click="submit"
        >
          保存
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <LogBiz ref="logBizRef" />
</template>
