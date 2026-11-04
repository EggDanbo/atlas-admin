<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import type { TableInstance } from '@/components/SpTable'
import { format } from 'date-fns'
import { add as lodashAdd } from 'xe-utils'
import { BizApprovalActions, BizProcessSider } from '@/components/BizApproval'
import BizDraftBox from '@/components/BizDraftBox'
import { Upload } from '@/components/BizFile'
import { LogBiz } from '@/components/BizLogs/Biz'
import { BizTableOperate } from '@/components/BizTableOperate'
import { SpCascader } from '@/components/SpCascader'
import { MemberPicker } from '@/components/SpTablePicker'
import { createTransformer, toDateLabel, useDetail, useTableItems } from '@/hooks/detail'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { unit as teamApi } from '@/service/api/access'
import { budget as api } from '@/service/api/expense'
import { subject } from '@/service/api/masterdata'
import { useEnumStore } from '@/store/modules/enums'
import { tenantStorage } from '@/utils/tenant'
import { gridOptions, viewGridOptions } from './columns'

const emit = defineEmits(['on-action'])

const { getPermission } = useTabbar()
const tabPermName = getPermission()

const enumStore = useEnumStore()

const tableRef = ref<TableInstance | null>(null)
const viewTableRef = ref<TableInstance | null>(null)

const logBizRef = ref<OpenModal | null>(null)

const isApprove = ref<boolean>(false)
const detailMode = ref<string | null>(null)

const teamTreeOptions = ref<Recordable[]>([])
async function loadTeamTree() {
  const { isSuccess, data } = await teamApi.tree({
    permission: [tabPermName],
    tenant: tenantStorage.get(),
    alone: true,
  })
  if (!isSuccess)
    return
  teamTreeOptions.value = data
}

const contentTreeOptions = ref<any>([])
async function loadContentOptions() {
  const { isSuccess, data } = await subject.tree({
    code: '6601',
    stoped: false,
  })
  if (!isSuccess)
    return
  contentTreeOptions.value = data
}

async function load() {
  await loadTeamTree()
  await loadContentOptions()
}

function createFormModel() {
  return {
    id: '0',
    opt_confirm: false,
    opt_cancel: false,
    opt_print: false,
    opt_submit: false,
    opt_return: false,
    team_id: null,
    team_name: null,
    user_id: null,
    user_name: null,
    date: Date.now(),
    title: null,
    amount: null,
    remark: null,
    files: [],
    list: [],
    processes: [] as any,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    team_id: [{ required: true, message: '请选择申请单位', trigger: 'change' }],
    user_id: [{ required: true, message: '请选择申请人', trigger: 'change' }],
    date: [{ type: 'number', required: true, message: '请选择申请日期', trigger: 'change' }],
    title: [{ required: true, message: '请输入申请标题', trigger: 'change' }],
  }

  for (let i = 0; i < formModel.list.length; i++) {
    rules[`list[${i}].content_id`] = [{ required: true, trigger: ['blur', 'change'] }]
    rules[`list[${i}].indate`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
    rules[`list[${i}].amount`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
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
  params,
  updateModel,
  finishApproval,
} = useDetail<FormModel>({
  api: {
    get() {
      return api.get({ ...params.value })
    },
    create() {
      return api.create({ ...formModel })
    },
    update() {
      return api.update({ ...formModel })
    },
  },
  createFormModel,
  title: '费用额度',
  permission: { useTabPermission: true, permName: 'EXP_BUDGET' },
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    nullIfZero: ['team_id'],
    number: ['date'],
    custom: {
      date: val => toDateLabel(val),
    },
  }),
  beforeEdit: async () => {
    if (formModel.list.length === 0) {
      itemsAdd()
    }
    else {
      for (const i in formModel.list) {
        const item = formModel.list[i]
        item.indate = item.indate && Number(item.indate) > 0 ? Number(item.indate) : null
      }
    }

    await load()
    return true
  },
  beforeView: (data) => {
    if (data.list && data.list.length !== 0) {
      data.list.forEach((item: any) => {
        item.transform = {}
        item.transform.indate = item.indate && Number(item.indate) > 0 ? format((Number(item.indate)), 'yyyy-MM-dd') : null
      })
    }

    return true
  },
  onBeforeOpen: (params) => {
    isApprove.value = params.approve
    detailMode.value = params.mode

    return true
  },
})

const { tableItemsAdd } = useTableItems(formModel)

/** 新增一行的默认值，与表单字段保持一致 */
function itemsAdd() {
  tableItemsAdd({ opt: 'list', def: { content_id: null, amount: null } })
}

function rowsChange(e, tref) {
  tref?.editRowEvent(e.row)
}

function handleAmountTotal() {
  const amount = formModel.list.map(q => q.amount).reduce((a, b) => lodashAdd(a, b))
  formModel.amount = amount.toFixed(2)
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'ExpenseBudgetDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="90vw" height="90vh" :before-close="clearTabState">
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
        <n-form-item-gi :span="8" label="申请单位" path="team_id">
          <SpCascader
            v-model:value="formModel.team_id"
            :options="teamTreeOptions"
            placeholder="请选择"
            value-field="id"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="申请人" path="user_id">
          <MemberPicker
            v-model:value="formModel.user_id"
            v-model:options="formModel.user_name"
            :stoped="false"
            :permission="`${tabPermName}`"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="申请日期" path="date">
          <n-date-picker v-model:value="formModel.date" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="申请标题" path="title">
          <n-input v-model:value="formModel.title" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="申请金额" path="amount">
          <n-input-number v-model:value="formModel.amount" placeholder="" :show-button="false" :readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注" path="remark">
          <n-input v-model:value="formModel.remark" type="textarea" :rows="3" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="附件">
          <Upload v-model:value="formModel.files" :only-image="false" upload-title="上传附件" />
        </n-form-item-gi>
      </n-grid>

      <div class="mt-4">
        <SpTable ref="tableRef" v-bind="gridOptions" :data-source="formModel.list" @current-change="rowsChange($event, tableRef)">
          <template #operate="{ rowIndex }">
            <BizTableOperate
              :model="formModel"
              opt="list"
              :row-index="Number(rowIndex)" copy add
            />
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
              @update:value="(_, options) => row.content_name = options.label"
            />
          </template>
          <template #indate_default="{ row }">
            {{ row.indate && Number(row.indate) > 0 ? format(Number(row.indate), 'yyyy-MM-dd') : '' }}
          </template>
          <template #indate_edit="{ row }">
            <n-date-picker v-model:value="row.indate" type="date" fast-month-select clearable />
          </template>
          <template #amount_edit="{ row }">
            <n-input-number v-model:value="row.amount" :precision="2" :show-button="false" clearable @update:value="handleAmountTotal" />
          </template>
        </SpTable>
        <div class="mt-2 w-full flex">
          <n-button tertiary round size="small" class="w-full" @click="itemsAdd()">
            <template #icon>
              <n-icon>
                <Icon icon="ant-design:plus-outlined" />
              </n-icon>
            </template>
            添加明细
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
      <div class="stamp-text">
        {{ enumStore.getLabel('workflow_status', formModel.status) }}
      </div>
      <n-layout has-sider>
        <BizProcessSider :model="formModel" />
        <n-layout class="pl-6">
          <n-grid :cols="24" :x-gap="24">
            <n-form-item-gi :span="8" label="申请单位">
              <n-input v-model:value="formModel.team_name" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="申请人">
              <n-input v-model:value="formModel.user_name" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="申请日期">
              <n-input :value="formModel.transform?.date" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="16" label="申请标题">
              <n-input v-model:value="formModel.title" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="申请金额" path="amount">
              <n-input-number v-model:value="formModel.amount" placeholder="" :show-button="false" :readonly="true" />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="备注">
              <n-input v-model:value="formModel.remark" type="textarea" :rows="3" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi
              v-if="formModel.files && formModel.files.length > 0"
              :span="24"
              label="附件"
            >
              <Upload v-model:value="formModel.files" :disabled="true" />
            </n-form-item-gi>
          </n-grid>

          <div class="mt-4">
            <SpTable ref="viewTableRef" v-bind="viewGridOptions" :data-source="formModel.list">
              <template #indate_default="{ row }">
                {{ row.transform?.indate }}
              </template>
            </SpTable>
          </div>
        </n-layout>
      </n-layout>
    </n-form>

    <template #footer>
      <n-flex justify="end">
        <n-button @click="modalRef?.close">
          关闭
        </n-button>
        <n-button v-if="Number(formModel.id) !== 0" @click="logBizRef?.open({ xid: formModel.id })">
          操作日志
        </n-button>
        <BizDraftBox
          v-if="isEdit && Number(formModel.id) === 0"
          types="expense/budget"
          :save="() => ({ ...formModel })"
          :get="updateModel"
        />
        <n-button
          v-if="showEdit() && formModel.opt_submit && !isApprove"
          type="primary"
          @click="edit(formModel.id)"
        >
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
        <!-- 审批 -->
        <BizApprovalActions
          :model="formModel"
          biz-class="Pense"
          :is-approve="isApprove"
          :detail-mode="detailMode"
          @done="finishApproval"
        />
      </n-flex>
    </template>
  </SpModal>

  <LogBiz ref="logBizRef" />
</template>
