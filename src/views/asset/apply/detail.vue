<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import type { TableInstance } from '@/components/SpTable'
import { BizApprovalActions, BizProcessSider } from '@/components/BizApproval'
import BizDraftBox from '@/components/BizDraftBox'
import { Upload } from '@/components/BizFile'
import { LogBiz } from '@/components/BizLogs/Biz'
import { BizTableOperate } from '@/components/BizTableOperate'
import { SpCascader } from '@/components/SpCascader'
import { dictLabel } from '@/dicts'
import { createTransformer, toDateLabel, useDetail, useTableItems } from '@/hooks/detail'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { unit as teamApi } from '@/service/api/access'
import { apply as api } from '@/service/api/asset'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'
import { gridOptions, viewGridOptions } from './columns'

const emit = defineEmits(['on-action'])

const { getPermission } = useTabbar()
const tabPermName = getPermission()
const isConfirm = ref(false)

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
    id: '0',
    opt_accept: false,
    opt_cancel: false,
    opt_confirm: false,
    opt_submit: true,
    team_id: null,
    team_name: null,
    date: Date.now(),
    predict: null,
    require: false,
    title: null,
    digest: null,
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
    digest: [{ required: true, message: '请输入申请事由', trigger: 'change' }],
  }

  // for (let i = 0; i < formModel.list.length; i++) {
  //   rules[`list[${i}].name`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`list[${i}].pcs`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
  //   rules[`list[${i}].unit`] = [{ required: true, trigger: ['blur', 'change'] }]
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
  refresh,
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
  title: '资产申领',
  permission: { useTabPermission: true, permName: 'AST_APPLY' },
  canEdit: form => !form.opt_submit,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  onBeforeOpen: (params) => {
    isApprove.value = params.approve
    detailMode.value = params.mode
    isConfirm.value = false

    return true
  },
  transform: createTransformer({
    nullIfZero: ['team_id'],
    number: ['date', 'predict'],
    custom: {
      date: val => toDateLabel(val),
      predict: val => toDateLabel(val),
    },
  }),
  beforeEdit: async () => {
    await load()

    if (formModel.list.length === 0) {
      tableItemsAdd({ opt: 'list' })
    }

    return true
  },
  beforeView: () => {
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

async function handleConfirm(id: any) {
  isConfirm.value = true
  await edit(id)
}

async function confirm() {
  const { list } = formModel
  const { isSuccess } = await api.confirm({
    id: formModel.id,
    list,
  })
  if (!isSuccess)
    return
  toast.success('操作成功')
  isConfirm.value = false
  isEdit.value = false
  modalRef.value.close()
  emit('on-action', 'edit')
}

async function reject(id: any) {
  const { isSuccess } = await api.reject({
    id,
  })
  if (!isSuccess)
    return
  toast.success('操作成功')
  refresh()
  emit('on-action', 'edit')
}

function rowsChange(e, tref) {
  const $table = tref
  $table?.editRowEvent(e.row)
}

const { tableItemsAdd } = useTableItems(formModel)

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'AssetApplyDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="90vw" height="90vh" :before-close="clearTabState">
    <n-form
      v-if="isEdit && !isConfirm"
      ref="formRef"
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="formModel"
      :rules="formRules"
      :disabled="!hasPerm"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="12" label="申请单位" path="team_id">
          <SpCascader
            v-model:value="formModel.team_id"
            :options="teamTreeOptions"
            placeholder="请选择"
            value-field="id"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="申请日期" path="date">
          <n-date-picker v-model:value="formModel.date" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="需求日期" path="predict">
          <n-date-picker v-model:value="formModel.predict" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="18" label="标题" path="title">
          <n-input v-model:value="formModel.title" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="计划内" path="require">
          <n-switch v-model:value="formModel.require" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="申领事由" path="digest">
          <n-input v-model:value="formModel.digest" type="textarea" :rows="3" clearable />
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

        <template #name_edit="{ row }">
          <n-input v-model:value="row.name" clearable />
        </template>
        <template #pcs_edit="{ row }">
          <n-input-number v-model:value="row.pcs" :show-button="false" clearable />
        </template>
        <template #unit_edit="{ row }">
          <n-input v-model:value="row.unit" clearable />
        </template>
        <template #model_edit="{ row }">
          <n-input v-model:value="row.model" clearable />
        </template>
        <template #remark_edit="{ row }">
          <n-input v-model:value="row.remark" clearable />
        </template>
      </SpTable>
    </n-form>

    <n-form
      v-else
      label-placement="left"
      require-mark-placement="left"
      :label-width="100"
      :model="formModel"
    >
      <div v-if="!isConfirm" class="stamp-text">
        {{ dictLabel('workflow_status', formModel.status) }}
      </div>
      <n-layout has-sider>
        <BizProcessSider :model="formModel" />
        <n-layout class="pl-6">
          <n-grid :cols="24" :x-gap="24">
            <n-form-item-gi :span="12" label="申请单位">
              <n-input v-model:value="formModel.team_name" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="6" label="申请日期">
              <n-input :value="formModel.transform?.date" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="6" label="需求日期">
              <n-input :value="formModel.transform?.predict" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="18" label="标题">
              <n-input v-model:value="formModel.title" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="6" label="计划内">
              <n-switch v-model:value="formModel.require" disabled />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="申领事由">
              <n-input v-model:value="formModel.digest" type="textarea" :rows="3" placeholder="" readonly />
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

          <SpTable v-if="isEdit && isConfirm" ref="tableRef" v-bind="gridOptions" :data-source="formModel.list" @current-change="rowsChange($event, tableRef)">
            <template #operate="{ rowIndex }">
              <BizTableOperate
                :model="formModel"
                opt="list"
                :row-index="Number(rowIndex)" copy add
              />
            </template>

            <template #name_edit="{ row }">
              <n-input v-model:value="row.name" clearable />
            </template>
            <template #pcs_edit="{ row }">
              <n-input-number v-model:value="row.pcs" :show-button="false" clearable />
            </template>
            <template #unit_edit="{ row }">
              <n-input v-model:value="row.unit" clearable />
            </template>
            <template #model_edit="{ row }">
              <n-input v-model:value="row.model" clearable />
            </template>
            <template #remark_edit="{ row }">
              <n-input v-model:value="row.remark" clearable />
            </template>
          </SpTable>
          <SpTable v-if="!isEdit" ref="viewTableRef" v-bind="viewGridOptions" :data-source="formModel.list" />
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
          types="asset/apply"
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
          v-if="isEdit && !isConfirm"
          type="primary"
          :disabled="!hasPerm"
          :loading="btnLoading"
          @click="submit"
        >
          保存
        </n-button>
        <n-button
          v-if="isEdit && isConfirm"
          type="primary"
          :loading="btnLoading"
          @click="confirm"
        >
          保存
        </n-button>
        <n-button
          v-if="!isEdit && formModel.opt_accept"
          type="primary"
          @click="handleConfirm(formModel.id)"
        >
          受理
        </n-button>
        <n-button
          v-if="!isEdit && formModel.opt_accept"
          type="primary"
          @click="reject(formModel.id)"
        >
          退回
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
