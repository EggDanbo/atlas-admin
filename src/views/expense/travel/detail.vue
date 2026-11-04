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
import { ExpenseContractPicker, MemberPicker } from '@/components/SpTablePicker'
import { createTransformer, useDetail, useTableItems } from '@/hooks/detail'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { unit as teamApi } from '@/service/api/access'
import { travel as api } from '@/service/api/expense'
import { subject } from '@/service/api/masterdata'
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

const logBizRef = ref<OpenModal | null>(null)
const logProcessRef = ref<OpenModal | null>(null)

const PenseApplySelectRef = ref<OpenModal | null>(null)

const isApprove = ref<boolean>(false)
const detailMode = ref<string | null>(null)

const processModalRef = ref<ModalInst | null>(null)
const processTitle = ref<string | null>(null)
const processTypes = ref<string | null>(null)
const processRemark = ref<string | null>(null)

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
    code: '5201',
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
    opt_accept: false,
    opt_cancel: false,
    opt_confirm: false,
    opt_submit: false,
    team_id: null,
    team_name: null,
    date: Date.now(),
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
    team_id: [{ required: true, message: '请选择申请单位', trigger: 'change' }],
    user_id: [{ required: true, message: '请选择申请人', trigger: 'change' }],
    date: [{ type: 'number', required: true, message: '请选择单据日期', trigger: 'change' }],
    title: [{ required: true, message: '请输入标题', trigger: 'change' }],
    digest: [{ required: true, message: '请输入申请事由', trigger: 'change' }],
  }

  for (let i = 0; i < formModel.list.length; i++) {
    rules[`list[${i}].start`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
    rules[`list[${i}].expire`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
    rules[`list[${i}].types`] = [{ required: true, trigger: ['blur', 'change'] }]
    rules[`list[${i}].depart`] = [{ required: true, trigger: ['blur', 'change'] }]
    rules[`list[${i}].bourn`] = [{ required: true, trigger: ['blur', 'change'] }]
    rules[`list[${i}].amount`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
    rules[`list[${i}].content_id`] = [{ required: true, trigger: ['blur', 'change'] }]
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
  title: '出差申请',
  permission: { useTabPermission: true, permName: 'EXP_REQUEST_TRAVEL' },
  canEdit: form => !form.stoped,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    nullIfZero: ['team_id'],
    number: ['date'],
    custom: {
      date: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
    },
  }),
  beforeEdit: async () => {
    if (formModel.list.length === 0) {
      itemsAdd()
    }
    else {
      for (const i in formModel.list) {
        const item = formModel.list[i]
        item.start = item.start && Number(item.start) > 0 ? Number(item.start) : null
        item.expire = item.expire && Number(item.expire) > 0 ? Number(item.expire) : null
        item.types = Number(item.types) ? Number(item.types) : null
      }
    }

    await load()
    return true
  },
  beforeView: (data) => {
    if (data.list && data.list.length > 0) {
      data.list.forEach((item: any) => {
        item.transform = {}
        item.transform.start = item.start && Number(item.start) > 0 ? format((Number(item.start)), 'yyyy-MM-dd') : null
        item.transform.expire = item.expire && Number(item.expire) > 0 ? format((Number(item.expire)), 'yyyy-MM-dd') : null
        item.transform.types = enumStore.getLabel('pense_travel_types', item.types)
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

const { tableItemsAdd, tableItemsRemove, tableItemsMoveUp, tableItemsMoveDown, tableItemsCopy } = useTableItems(formModel)

/** 新增一行的默认值，与表单字段保持一致 */
function itemsAdd(opt?: string) {
  if (opt && opt === 'open') {
    PenseApplySelectRef.value?.open()
  }
  else {
    tableItemsAdd({ opt: 'list', def: { start: null, expire: null, types: null, depart: null, bourn: null, content_id: null, quotas: null, amount: null, remark: null } })
  }
}

function rowsChange(e, tref) {
  tref?.editRowEvent(e.row)
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

  const list = [{ id: formModel.id, biz_class: 'Pense' }]

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
            biz_class: 'Pense',
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
export default { name: 'ExpenseRequestTravelDetail' }
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
        <n-form-item-gi :span="16" label="申请单位" path="team_id">
          <SpCascader
            v-model:value="formModel.team_id"
            :options="teamTreeOptions"
            placeholder="请选择"
            value-field="id"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="申请日期" path="date">
          <n-date-picker v-model:value="formModel.date" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="标题" path="title">
          <n-input v-model:value="formModel.title" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="申请人" path="user_id">
          <MemberPicker
            v-model:value="formModel.user_id"
            v-model:options="formModel.user_name"
            :stoped="false"
            :permission="`${tabPermName}`"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="申请事由" path="digest">
          <n-input v-model:value="formModel.digest" type="textarea" :rows="3" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="付款合同" path="contract_id">
          <ExpenseContractPicker v-model:value="formModel.contract_id" :team_id="formModel.team_id" />
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
              <n-button text @click="tableItemsCopy({ opt: 'list', key: rowIndex })">
                <template #icon>
                  <n-icon>
                    <Icon icon="ant-design:copy-outlined" />
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
          <template #start_default="{ row }">
            {{ row.transform?.start }}
          </template>
          <template #start_edit="{ row }">
            <n-date-picker v-model:value="row.start" type="date" fast-month-select clearable />
          </template>
          <template #expire_default="{ row }">
            {{ row.transform?.expire }}
          </template>
          <template #expire_edit="{ row }">
            <n-date-picker v-model:value="row.expire" type="date" fast-month-select clearable />
          </template>
          <template #types_default="{ row }">
            {{ row.transform?.types }}
          </template>
          <template #types_edit="{ row }">
            <n-select
              v-model:value="row.types"
              :options="enumStore.getEnumOptions('pense_travel_types')"
              clearable
            />
          </template>
          <template #depart_edit="{ row }">
            <n-input v-model:value="row.depart" clearable />
          </template>
          <template #bourn_edit="{ row }">
            <n-input v-model:value="row.bourn" clearable />
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
          <template #quotas_edit="{ row }">
            <n-input-number v-model:value="row.quotas" :precision="2" :show-button="false" clearable />
          </template>
          <template #amount_edit="{ row }">
            <n-input-number v-model:value="row.amount" :precision="2" :show-button="false" clearable />
          </template>
          <template #remark_edit="{ row }">
            <n-input v-model:value="row.remark" clearable />
          </template>
        </SpTable>
        <div class="mt-2 w-full flex">
          <n-button dashed round size="small" class="w-full" @click="itemsAdd()">
            <template #icon>
              <n-icon>
                <Icon icon="ant-design:plus-outlined" />
              </n-icon>
            </template>
            添加出差明细
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
            <n-form-item-gi :span="16" label="申请单位">
              <n-input v-model:value="formModel.team_name" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="申请日期">
              <n-input :value="formModel.transform?.date" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="16" label="标题">
              <n-input v-model:value="formModel.title" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="申请人">
              <n-input v-model:value="formModel.user_name" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="申请事由">
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

          <div class="mt-4">
            <SpTable ref="viewTableRef" v-bind="viewGridOptions" :data-source="formModel.list">
              <template #start_default="{ row }">
                {{ row.transform?.start }}
              </template>
              <template #expire_default="{ row }">
                {{ row.transform?.expire }}
              </template>
              <template #types_default="{ row }">
                {{ row.transform?.types }}
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
        <n-button v-if="Number(formModel.id) !== 0" @click="handleLogs()">
          操作日志
        </n-button>
        <BizDraftBox
          v-if="isEdit && Number(formModel.id) === 0"
          types="expense/travel"
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

  <LogBiz ref="logBizRef" />
  <LogProcess ref="logProcessRef" />
</template>
