<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import type { TableInstance } from '@/components/SpTable'
import { format } from 'date-fns'
import { BizApprovalActions, BizProcessSider } from '@/components/BizApproval'
import BizDraftBox from '@/components/BizDraftBox'
import { Upload } from '@/components/BizFile'
import { LogBiz } from '@/components/BizLogs/Biz'
import { BizTableOperate } from '@/components/BizTableOperate'
import { SpCascader } from '@/components/SpCascader'
import { AssetBatchPicker } from '@/components/SpTablePicker'
import { dictLabel } from '@/dicts'
import { createTransformer, toDateLabel, useDetail, useTableItems } from '@/hooks/detail'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { unit as teamApi } from '@/service/api/access'
import { batch as api } from '@/service/api/asset'
import { assetCategory as assetApi } from '@/service/api/masterdata'
import { tenantStorage } from '@/utils/tenant'
import { gridOptions, viewGridOptions } from './columns'

const emit = defineEmits(['on-action'])

const { getPermission } = useTabbar()
const tabPermName = getPermission()

const tableRef = ref<TableInstance | null>(null)
const viewTableRef = ref<TableInstance | null>(null)

const logBizRef = ref<OpenModal | null>(null)

const AssetOrderSelectRef = ref<OpenModal | null>(null)

const isApprove = ref<boolean>(false)
const detailMode = ref<string | null>(null)

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
    opt_accept: false,
    opt_cancel: false,
    opt_confirm: false,
    opt_submit: false,
    team_id: null,
    team_name: null,
    date: Date.now(),
    remark: null,
    list: [] as any,
    files: [] as any,
    processes: [] as any,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const formRules = computed<FormRules>(() => {
  const rules: FormRules = {
    team_id: [{ required: true, message: '请选择调出单位', trigger: 'change' }],
    date: [{ type: 'number', required: true, message: '请选择单据日期', trigger: 'change' }],
    title: [{ required: true, message: '请输入标题', trigger: 'change' }],
  }

  //   rules[`list[${i}].article_id`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`list[${i}].name`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`list[${i}].brand`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`list[${i}].model`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`list[${i}].unit`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`list[${i}].pcs`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
  //   rules[`list[${i}].amount`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
  //   rules[`list[${i}].enroll`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
  //   rules[`list[${i}].source`] = [{ required: true, trigger: ['blur', 'change'] }]

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
  title: '资产验收',
  permission: { useTabPermission: true, permName: 'AST_BATCH' },
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
    await load()
    if (formModel.list && formModel.list.length > 0) {
      const items = formModel.list
      for (const i in items) {
        const item = items[i]
        item.enroll = item.enroll ? Number(item.enroll) : null
        item.source = item.source ? String(item.source) : null
      }
    }
    if (formModel.list.length === 0) {
      tableItemsAdd({ opt: 'list' })
    }
    return true
  },
  beforeView: () => {
    return true
  },
  onBeforeOpen: (params) => {
    isApprove.value = params.approve
    detailMode.value = params.mode

    return true
  },
  onOpen: async (params, mode) => {
    await nextTick()
    if (mode === 'view') {
      viewTableRef.value?.redoHeight()
    }
    else {
      tableRef.value?.redoHeight()
    }
  },
})

function itemsAdd() {
  AssetOrderSelectRef.value?.open()
}

function rowsChange(e, tref) {
  const $table = tref
  $table?.editRowEvent(e.row)
}

const { tableItemsAdd } = useTableItems(formModel)

async function handleItemAssetOrderSelected(options) {
  options.forEach((item) => {
    formModel.list.push({
      order_id: item.id,
      name: item.name,
      brand: item.brand || null,
      model: item.model || null,
      unit: item.unit || null,
      pcs: Number(item.pcs) || null,
      amount: Number(item.price) || null,
      enroll: null,
      source: null,
      remark: null,
    })
  })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'AssetBatchDetail' }
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
        <n-form-item-gi :span="16" label="所属单位" path="team_id">
          <SpCascader
            v-model:value="formModel.team_id"
            :options="teamTreeOptions"
            placeholder="请选择"
            value-field="id"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="单据日期" path="date">
          <n-date-picker v-model:value="formModel.date" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="标题" path="title">
          <n-input v-model:value="formModel.title" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注" path="remark">
          <n-input v-model:value="formModel.remark" type="textarea" :rows="3" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="附件">
          <Upload v-model:value="formModel.files" :only-image="false" upload-title="上传附件" />
        </n-form-item-gi>
      </n-grid>

      <SpTable ref="tableRef" v-bind="gridOptions" :data-source="formModel.list" @current-change="rowsChange($event, tableRef)">
        <template #operate="{ rowIndex }">
          <BizTableOperate
            :model="formModel"
            opt="list"
            :row-index="Number(rowIndex)" copy add
          />
        </template>

        <template #article_default="{ row }">
          {{ row.article_name }}
        </template>
        <template #article_edit="{ row }">
          <SpCascader
            v-model:value="row.article_id"
            :options="assetTreeOptions"
            placeholder="请选择"
            value-field="id"
            @update:value="(_, options) => row.article_name = options.label"
          />
        </template>
        <template #unit_edit="{ row }">
          <n-input v-model:value="row.unit" clearable />
        </template>
        <template #name_edit="{ row }">
          <n-input v-model:value="row.name" clearable />
        </template>
        <template #brand_edit="{ row }">
          <n-input v-model:value="row.brand" clearable />
        </template>
        <template #model_edit="{ row }">
          <n-input v-model:value="row.model" clearable />
        </template>
        <template #pcs_edit="{ row }">
          <n-input-number v-model:value="row.pcs" :show-button="false" clearable class="w-full" />
        </template>
        <template #amount_edit="{ row }">
          <n-input-number v-model:value="row.amount" :show-button="false" :precision="2" clearable class="w-full" />
        </template>
        <template #enroll_default="{ row }">
          {{ row.enroll ? format(Number(row.enroll), 'yyyy-MM-dd') : null }}
        </template>
        <template #enroll_edit="{ row }">
          <n-date-picker v-model:value="row.enroll" type="date" fast-month-select clearable class="w-full" />
        </template>
        <template #source_edit="{ row }">
          <n-input v-model:value="row.source" clearable />
        </template>
        <template #remark_edit="{ row }">
          <n-input v-model:value="row.remark" clearable />
        </template>
      </SpTable>

      <div class="w-full flex">
        <AssetBatchPicker
          ref="AssetOrderSelectRef"
          :team_id="formModel.team_id"
          :disabled="!formModel.team_id"
          :select-list="formModel.list"
          :multiple="true"
          :open-modal="true"
          placeholder="采购验收"
          @change="(options) => handleItemAssetOrderSelected(options)"
        />
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
        {{ dictLabel('workflow_status', formModel.status) }}
      </div>
      <n-layout has-sider>
        <BizProcessSider :model="formModel" />
        <n-layout class="pl-6">
          <n-grid :cols="24" :x-gap="24">
            <n-form-item-gi :span="16" label="所属单位">
              <n-input v-model:value="formModel.team_name" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="单据日期">
              <n-input :value="formModel.transform?.date" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="标题">
              <n-input v-model:value="formModel.title" placeholder="" readonly />
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

          <SpTable ref="viewTableRef" v-bind="viewGridOptions" :data-source="formModel.list">
            <template #enroll_default="{ row }">
              {{ row.enroll ? format(Number(row.enroll), 'yyyy-MM-dd') : null }}
            </template>
          </SpTable>
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
          types="asset/batch"
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
          type="success"
          :disabled="!hasPerm"
          @click="itemsAdd"
        >
          选择申领受理采购
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
          biz-class="Asset"
          :is-approve="isApprove"
          :detail-mode="detailMode"
          @done="finishApproval"
        />
      </n-flex>
    </template>
  </SpModal>

  <LogBiz ref="logBizRef" />
</template>
