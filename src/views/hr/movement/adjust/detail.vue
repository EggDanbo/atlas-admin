<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { ModalInst, OpenModal } from '@/components/SpModal'
import type { TableInstance } from '@/components/SpTable'
import { BizApprovalActions, BizProcessSider } from '@/components/BizApproval'
import BizDraftBox from '@/components/BizDraftBox'
import { LogBiz } from '@/components/BizLogs/Biz'
import { BizTableOperate } from '@/components/BizTableOperate'
import { SpCascader } from '@/components/SpCascader'
import { SpDict } from '@/components/SpDict'
import { StaffPicker, TeamPicker } from '@/components/SpTablePicker'
import { createTransformer, toDateLabel, useDetail } from '@/hooks/detail'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { unit as teamApi } from '@/service/api/access'
import { roster as infoApi } from '@/service/api/hr'
import { adjust as api } from '@/service/api/hr/movement'
import { useEnumStore } from '@/store/modules/enums'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'
import { gridOptions, viewGridOptions } from './columns'

const emit = defineEmits(['on-action'])

const { getPermission } = useTabbar()
const tabPermName = getPermission()

const enumStore = useEnumStore()

const tableRef = ref<TableInstance | null>(null)
const viewTableRef = ref<TableInstance | null>(null)

const logBizRef = ref<OpenModal | null>(null)

const workSelectRef = ref<OpenModal | null>(null)

const isApprove = ref<boolean>(false)
const detailMode = ref<string | null>(null)

const handleModalRef = ref<ModalInst | null>(null)
const handleDate = ref<number | null>(null)

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

const scaleOptions = ref(new Map<string, Recordable[]>())
async function loadScaleOptions(branch_id: string) {
  if (!formModel.team_id) {
    return
  }

  const key = formModel.team_id + branch_id

  if (scaleOptions.value.has(key))
    return

  const { isSuccess, data } = await infoApi.getScale({
    team_id: formModel.team_id,
  })
  if (!isSuccess)
    return

  scaleOptions.value.set(key, data)
}

async function load() {
  await loadTeamTree()
}

function createFormModel() {
  return {
    id: '0',
    opt_return: false,
    opt_revoke: false,
    opt_submit: false,
    opt_confirm: false,
    opt_cancel: false,
    opt_handle: false,
    opt_restore: false,
    team_id: null,
    team_name: null,
    date: Date.now(),
    predict: null,
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
    predict: [{ type: 'number', required: true, message: '请选择预计生效日期', trigger: 'change' }],
    // title: [{ required: true, message: '请输入标题', trigger: 'change' }],
    // digest: [{ required: true, message: '请输入申请事由', trigger: 'change' }],
  }

  // for (let i = 0; i < formModel.list.length; i++) {
  //   rules[`list[${i}].ranks`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`list[${i}].scale`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`list[${i}].position`] = [{ required: true, trigger: ['blur', 'change'] }]
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
  title: '内部调动',
  permission: { useTabPermission: true, permName: 'HR_MOVEMENT_ADJUST' },
  canEdit: form => true,
  onSuccess: (action) => {
    emit('on-action', action)
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
    for (const i in formModel.list) {
      const item = formModel.list[i]

      await loadScaleOptions(item.branch_id)
    }

    await load()
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
  if (!formModel.team_id) {
    toast.info('请先选择调岗单位')
    return
  }

  workSelectRef.value?.open()
}

function rowsChange(e, tref) {
  const $table = tref
  $table?.editRowEvent(e.row)
}

function handleItemUserSelected(options) {
  options.forEach((item) => {
    formModel.list.push({
      user_id: item.id,
      name: item.name,
      user_pre_rank: item.ranks,
      user_pre_position: item.position,
      user_pre_scale: item.scale,
      ranks: item.ranks,
      position: item.position,
      scale: item.scale,
      salary: item.salary,
      remark: null,
    })
  })
}

function handleTeamSelected() {
  loadScaleOptions('')
}

function handleBranchSelected(key: string | number, options: any) {
  const item = formModel.list[key]
  item.branch_id = options.id
  item.branch_name = options.label
  loadScaleOptions(item.branch_id)
}

function handleModalShow() {
  handleDate.value = formModel.predict
  handleModalRef.value?.open()
}

async function handleConfirm() {
  if (!handleDate.value) {
    toast.error('请选择入职日期')
    return
  }

  btnLoading.value = true
  const { isSuccess } = await api
    .confirm({
      id: formModel.id,
      date: handleDate.value,
    })
    .finally(() => (btnLoading.value = false))
  if (isSuccess) {
    toast.success('操作成功')
    handleModalRef.value?.close()
    modalRef.value.close()
    emit('on-action', 'edit')
  }
}

async function handleRestore() {
  toast.infoModal('确定取消调岗吗？', {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      btnLoading.value = true
      const { isSuccess } = await api.cancel({ id: formModel.id })
        .finally(() => btnLoading.value = false)
      if (!isSuccess)
        return
      toast.success('操作成功')
      modalRef.value.close()
      emit('on-action', 'EDIT')
    },
  })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'HrMovementAdjustDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="90vw" height="90vh" :before-close="clearTabState">
    <n-form
      v-if="isEdit"
      ref="formRef"
      label-placement="left"
      require-mark-placement="left"
      :label-width="110"
      :model="formModel"
      :rules="formRules"
      :disabled="!hasPerm"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="12" label="申请日期" path="date">
          <n-date-picker v-model:value="formModel.date" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="预计生效日期" path="predict">
          <n-date-picker v-model:value="formModel.predict" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="调动单位" path="team_id">
          <SpCascader
            v-model:value="formModel.team_id"
            :options="teamTreeOptions"
            placeholder="请选择"
            value-field="id"
            @update:value="handleTeamSelected"
          />
          <span class="w-3" />
          <n-button
            v-if="isEdit"
            :disabled="!hasPerm || !formModel.team_id"
            :loading="btnLoading"
            @click="itemsAdd"
          >
            选择人员
          </n-button>
        </n-form-item-gi>
        <!-- <n-form-item-gi :span="24" label="标题" path="title">
          <n-input v-model:value="formModel.title" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="调动事由" path="digest">
          <n-input v-model:value="formModel.digest" type="textarea" :rows="3" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注" path="remark">
          <n-input v-model:value="formModel.remark" type="textarea" :rows="3" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="附件">
          <Upload v-model:value="formModel.files" :only-image="false" upload-title="上传附件" />
        </n-form-item-gi> -->
      </n-grid>

      <SpTable ref="tableRef" v-bind="gridOptions" :data-source="formModel.list" @current-change="rowsChange($event, tableRef)">
        <template #operate="{ rowIndex }">
          <BizTableOperate
            :model="formModel"
            opt="list"
            :row-index="Number(rowIndex)"
          />
        </template>

        <template #branch_default="{ row }">
          {{ row.branch_name }}
        </template>
        <template #branch_edit="{ row, rowIndex }">
          <TeamPicker
            v-model:value="row.branch_id"
            :options="row.branch_name"
            :team_id="formModel.team_id"
            :disabled="!formModel.team_id"
            @change="(options) => handleBranchSelected(rowIndex, options)"
          />
        </template>
        <template #ranks_edit="{ row }">
          <SpDict v-model:value="row.ranks" name="职务" clearable />
        </template>
        <template #position_edit="{ row }">
          <SpDict v-model:value="row.position" name="岗位" clearable />
        </template>
        <!-- <template #scale_edit="{ row }">
          <SpDict v-model:value="row.scale" name="工资级别" clearable />
        </template>
        <template #salary_edit="{ row }">
          <n-input-number v-model:value="row.salary" :show-button="false" />
        </template> -->
        <template #remark_edit="{ row }">
          <n-input v-model:value="row.remark" clearable />
        </template>
      </SpTable>

      <div class="w-full flex">
        <StaffPicker
          ref="workSelectRef"
          :team_id="formModel.team_id"
          :disabled="!formModel.team_id"
          :select-list="formModel.list"
          :multiple="true"
          :open-modal="true"
          placeholder="调岗人员"
          @change="(options) => handleItemUserSelected(options)"
        />
      </div>
    </n-form>

    <n-form
      v-else
      label-placement="left"
      require-mark-placement="left"
      :label-width="110"
      :model="formModel"
    >
      <div class="stamp-text">
        {{ enumStore.getLabel('workflow_status', formModel.status) }}
      </div>
      <n-layout has-sider>
        <BizProcessSider :model="formModel" />
        <n-layout class="pl-6">
          <n-grid :cols="24" :x-gap="24">
            <n-form-item-gi :span="12" label="申请日期">
              <n-input :value="formModel.transform?.date" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="预计生效日期">
              <n-input :value="formModel.transform?.predict" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="申请单位">
              <n-input v-model:value="formModel.team_name" placeholder="" readonly />
            </n-form-item-gi>
            <!-- <n-form-item-gi :span="24" label="标题">
              <n-input v-model:value="formModel.title" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="调动事由">
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
            </n-form-item-gi> -->
          </n-grid>

          <SpTable ref="viewTableRef" v-bind="viewGridOptions" :data-source="formModel.list" />
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
          types="hr/movement/adjust"
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
          biz-class="Staff"
          :is-approve="isApprove"
          :detail-mode="detailMode"
          @done="finishApproval"
        />
        <n-button
          v-if="showEdit() && formModel.opt_handle && !isApprove"
          type="warning"
          @click="handleModalShow"
        >
          调岗确认
        </n-button>
        <n-button
          v-if="showEdit() && formModel.opt_restore && !isApprove"
          type="warning"
          @click="handleRestore"
        >
          取消调岗
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <SpModal
    ref="handleModalRef"
    title="生效确认"
    width="450"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <div class="w-full flex pb-3 pt-3">
        <n-date-picker v-model:value="handleDate" type="date" fast-month-select clearable />
      </div>
    </template>

    <template #footer>
      <n-space justify="end">
        <n-button @click="handleModalRef?.close">
          关闭
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="handleConfirm">
          提交
        </n-button>
      </n-space>
    </template>
  </SpModal>

  <LogBiz ref="logBizRef" />
</template>
