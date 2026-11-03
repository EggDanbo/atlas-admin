<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { ModalInst, OpenModal } from '@/components/SpModal'
import type { TableInstance } from '@/components/SpTable'
import { format } from 'date-fns'
import BizDraftBox from '@/components/BizDraftBox'
import { Upload } from '@/components/BizFile'
import { LogBiz } from '@/components/BizLogs/Biz'
import { LogProcess } from '@/components/BizLogs/process'
import { SpCascader } from '@/components/SpCascader'
import { StaffPicker } from '@/components/SpTablePicker'
import { createTransformer, useDetail } from '@/hooks/detail'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { unit as teamApi } from '@/service/api/access'
import { resign as api } from '@/service/api/hr/exit'
import { approve } from '@/service/api/workflow'
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
const tableKeys = ref<number>(0)

const logBizRef = ref<OpenModal | null>(null)
const logProcessRef = ref<OpenModal | null>(null)

const workSelectRef = ref<OpenModal | null>(null)

const isApprove = ref<boolean>(false)
const detailMode = ref<string | null>(null)

const processModalRef = ref<ModalInst | null>(null)
const processTitle = ref<string | null>(null)
const processTypes = ref<string | null>(null)
const processRemark = ref<string | null>(null)

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
    digest: '辞职申请',
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
    team_id: [{ required: true, message: '请选择离职单位', trigger: 'change' }],
    date: [{ type: 'number', required: true, message: '请选择单据日期', trigger: 'change' }],
    predict: [{ type: 'number', required: true, message: '请选择预计生效日期', trigger: 'change' }],
    // title: [{ required: true, message: '请输入标题', trigger: 'change' }],
  }

  // for (let i = 0; i < formModel.list.length; i++) {
  //   rules[`list[${i}].reason`] = [{ required: true, trigger: ['blur', 'change'] }]
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
  title: '人员辞职',
  permission: { useTabPermission: true, permName: 'HR_EXIT_ABSENT' },
  canEdit: form => true,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    nullIfZero: ['team_id'],
    number: ['date', 'predict'],
    custom: {
      date: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
      predict: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
    },
  }),
  beforeEdit: async () => {
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
    toast.info('请先选择辞职单位')
    return
  }

  workSelectRef.value?.open()
}

function rowsChange(e, tref) {
  const $table = tref
  $table?.editRowEvent(e.row)
  tableKeys.value = Number(e.rowIndex)
}

function viewRowsChange(e) {
  tableKeys.value = Number(e.rowIndex)
}

function tableItemsRemove({ opt, key }: { opt: string, key: number | string }) {
  formModel[opt].splice(key, 1)
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

function handleItemUserSelected(options) {
  options.forEach((item) => {
    formModel.list.push({
      user_id: item.id,
      name: item.name,
      ranks: item.ranks,
      position: item.position,
      branch_name: item.branch_name,
      remark: null,
    })
  })
}

async function handleProcess(opt: string) {
  processTypes.value = opt
  processRemark.value = null
  if (opt === '同意') {
    processTitle.value = '审批意见'
    await process()
  }
  else {
    processTitle.value = `${opt}原因`
    processModalRef.value?.open()
  }
}

async function process() {
  if (processTypes.value !== '同意' && !processRemark.value) {
    toast.error(`请填写${processTitle.value}`)
    return
  }

  const list = [{ id: formModel.id, biz_class: 'Staff' }]

  btnLoading.value = true
  if (processTypes.value === '撤回') {
    const { isSuccess } = await approve.revoke({
      list,
      remark: processRemark.value,
    }).finally(() => (btnLoading.value = false))
    if (!isSuccess)
      return
  }
  else if (processTypes.value === '作废') {
    const { isSuccess } = await approve.invalid({
      list,
      remark: processRemark.value,
    }).finally(() => (btnLoading.value = false))
    if (!isSuccess)
      return
  }
  else {
    const { isSuccess } = await approve
      .process({
        list,
        status: processTypes.value,
        remark: processRemark.value,
      })
      .finally(() => (btnLoading.value = false))
    if (!isSuccess)
      return
  }
  toast.success('操作成功')
  processModalRef.value?.close()
  modalRef.value.close()
  emit('on-action', 'EDIT')
}

async function handleCancel() {
  toast.infoModal('确定取消审批吗？', {
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      btnLoading.value = true
      const { isSuccess } = await approve
        .cancel({
          list: [{
            id: formModel.id,
            biz_class: 'Staff',
          }],
        })
        .finally(() => (btnLoading.value = false))
      if (!isSuccess)
        return
      toast.success('操作成功')
      modalRef.value.close()
      emit('on-action', 'EDIT')
    },
  })
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
  toast.infoModal('确定取消离职吗？', {
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

function handleLogs(opt?: string) {
  if (opt === 'process') {
    logProcessRef.value?.open({ id: formModel.id })
  }
  else {
    logBizRef.value?.open({ xid: formModel.id })
  }
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'HrExitResignDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="80vw" height="85vh" :before-close="clearTabState">
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
        <n-form-item-gi :span="24" label="辞职单位" path="team_id">
          <SpCascader
            v-model:value="formModel.team_id"
            :options="teamTreeOptions"
            placeholder="请选择"
            value-field="id"
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
        <n-form-item-gi :span="24" label="备注" path="remark">
          <n-input v-model:value="formModel.remark" type="textarea" :rows="3" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="附件">
          <Upload v-model:value="formModel.files" :only-image="false" upload-title="上传附件" />
        </n-form-item-gi> -->
      </n-grid>

      <SpTable ref="tableRef" v-bind="gridOptions" :data-source="formModel.list" @current-change="rowsChange($event, tableRef)">
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
            <n-button text @click="tableItemsRemove({ opt: 'list', key: rowIndex })">
              <template #icon>
                <n-icon>
                  <Icon icon="ant-design:delete-outlined" />
                </n-icon>
              </template>
            </n-button>
          </div>
        </template>

        <template #reason_edit="{ row }">
          <n-input v-model:value="row.reason" clearable />
        </template>
        <template #remark_edit="{ row }">
          <n-input v-model:value="row.remark" clearable />
        </template>
      </SpTable>

      <div v-for="(item, key) in formModel.list" :key="key">
        <div v-if="key === tableKeys" style="margin-top: 30px">
          <n-form
            label-placement="left"
            require-mark-placement="left"
            :label-width="110"
          >
            <n-grid :cols="24" :x-gap="24" :y-gap="24">
              <n-form-item-gi :span="24" label="网格附件" :show-feedback="false">
                <Upload v-model:value="item.files" :only-image="false" upload-title="上传附件" />
              </n-form-item-gi>
            </n-grid>
          </n-form>
        </div>
      </div>

      <div class="w-full flex">
        <StaffPicker
          ref="workSelectRef"
          :team_id="formModel.team_id"
          :disabled="!formModel.team_id"
          :select-list="formModel.list"
          :multiple="true"
          :open-modal="true"
          placeholder="辞职人员"
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
        <n-layout-sider
          v-if="formModel.processes && formModel.processes.length > 0"
          show-trigger="bar"
          collapse-mode="transform"
          :collapsed-width="0"
          :width="256"
          :native-scrollbar="false"
        >
          <div class="mb-2 flex flex-col items-center justify-center gap-1">
            <n-qr-code :value="formModel.no || ''" :size="160" padding="0" />
            <span style="font-size: 20px">{{ formModel.no }}</span>
            <n-button
              quaternary
              round
              size="large"
              :type="formModel.opt_return ? 'warning' : 'info'"
              @click="handleLogs('process')"
            >
              点击查看流程日志
            </n-button>
          </div>
          <n-steps vertical class="p-2">
            <n-step
              v-for="item in formModel.processes"
              :key="item"
              :status="item.status === '不同意' ? 'error' : item.status ? 'process' : 'wait'"
            >
              <template #title>
                <span>{{ item.step_name }}</span>
              </template>
              <template #default>
                <p>
                  {{ item.audit_name }}<span v-if="item.status"> / {{ item.status }}</span>
                </p>
                <p v-if="item.remark">
                  {{ item.remark }}
                </p>
                <p>{{ item.audit_time }}</p>
              </template>
            </n-step>
          </n-steps>
        </n-layout-sider>
        <n-layout class="pl-6">
          <n-grid :cols="24" :x-gap="24">
            <n-form-item-gi :span="12" label="申请日期">
              <n-input :value="formModel.transform?.date" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="预计生效日期">
              <n-input :value="formModel.transform?.predict" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="辞职单位">
              <n-input v-model:value="formModel.team_name" placeholder="" readonly />
            </n-form-item-gi>
            <!-- <n-form-item-gi :span="24" label="标题">
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
            </n-form-item-gi> -->
          </n-grid>

          <SpTable ref="viewTableRef" v-bind="viewGridOptions" @current-change="viewRowsChange" />

          <div v-for="(item, key) in formModel.list" :key="key">
            <div v-if="key === tableKeys" style="margin-top: 30px">
              <n-form
                v-if="item.files && item.files.length > 0"
                label-placement="left"
                require-mark-placement="left"
                :label-width="110"
              >
                <n-grid :cols="24" :x-gap="24" :y-gap="24">
                  <n-form-item-gi :span="24" label="网格附件" :show-feedback="false">
                    <Upload v-model:value="item.files" :disabled="true" />
                  </n-form-item-gi>
                </n-grid>
              </n-form>
            </div>
          </div>
        </n-layout>
      </n-layout>
    </n-form>

    <template #footer>
      <n-flex justify="end">
        <n-button @click="modalRef?.close">
          关闭
        </n-button>
        <n-button v-if="Number(formModel.id) !== 0" @click="handleLogs()">
          操作日志
        </n-button>
        <BizDraftBox
          v-if="isEdit && Number(formModel.id) === 0"
          types="hr/exit/resign"
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
        <n-button
          v-if="formModel.opt_confirm && isApprove"
          type="primary"
          @click="handleProcess('同意')"
        >
          同意
        </n-button>
        <n-button
          v-if="formModel.opt_confirm && isApprove"
          type="primary"
          @click="handleProcess('不同意')"
        >
          不同意
        </n-button>
        <n-button
          v-if="formModel.opt_cancel && isApprove"
          type="primary"
          :loading="btnLoading"
          @click="handleCancel"
        >
          取消
        </n-button>
        <n-button
          v-if="formModel.opt_revoke && detailMode === 'apply'"
          type="primary"
          :loading="btnLoading"
          @click="handleProcess('撤回')"
        >
          撤回
        </n-button>
        <n-button
          v-if="formModel.opt_revoke && detailMode === 'apply'"
          type="primary"
          :loading="btnLoading"
          @click="handleProcess('作废')"
        >
          作废
        </n-button>
        <n-button
          v-if="showEdit() && formModel.opt_handle && !isApprove"
          type="warning"
          @click="handleModalShow"
        >
          离职确认
        </n-button>
        <n-button
          v-if="showEdit() && formModel.opt_restore && !isApprove"
          type="warning"
          @click="handleRestore"
        >
          取消离职
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <SpModal
    ref="processModalRef"
    width="500"
    :title="processTitle"
    :mask="true"
    :draggable="true"
  >
    <template #default>
      <div class="w-full flex pb-3 pt-3">
        <n-radio-group v-if="processTypes === '同意'" v-model:value="processRemark">
          <n-space>
            <n-radio value="拟同意，提交">
              拟同意，提交
            </n-radio>
            <n-radio value="同意">
              同意
            </n-radio>
          </n-space>
        </n-radio-group>
        <n-input
          v-model:value="processRemark"
          type="textarea"
          :rows="5"
          clearable
          :readonly="processTypes === '同意' ? true : false"
        />
      </div>
    </template>

    <template #footer>
      <n-space justify="end">
        <n-button @click="processModalRef?.close">
          关闭
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="process">
          提交
        </n-button>
      </n-space>
    </template>
  </SpModal>

  <SpModal
    ref="handleModalRef"
    title="入职确认"
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
  <LogProcess ref="logProcessRef" />
</template>
