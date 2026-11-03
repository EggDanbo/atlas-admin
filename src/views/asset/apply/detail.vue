<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { ModalInst, OpenModal } from '@/components/SpModal'
import type { TableInstance } from '@/components/SpTable'
import { format } from 'date-fns'
import DraftBox from '@/components/DraftBox'
import { Upload } from '@/components/File'
import { LogBiz } from '@/components/Logs/Biz'
import { LogProcess } from '@/components/Logs/process'
import { SpCascader } from '@/components/SpCascader'
import { createTransformer, useDetail } from '@/hooks/detail'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { unit as teamApi } from '@/service/api/access'
import { apply as api } from '@/service/api/asset'
import { approve } from '@/service/api/workflow'
import { useEnumStore } from '@/store/modules/enums'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'
import { gridOptions, viewGridOptions } from './columns'

const emit = defineEmits(['on-action'])

const { getPermission } = useTabbar()
const tabPermName = getPermission()
const isConfirm = ref(false)

const enumStore = useEnumStore()

const tableRef = ref<TableInstance | null>(null)
const viewTableRef = ref<TableInstance | null>(null)

const logBizRef = ref<OpenModal | null>(null)
const logProcessRef = ref<OpenModal | null>(null)

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
      date: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
      predict: val => val ? format(Number(val), 'yyyy-MM-dd') : null,
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

async function tableItemsAdd({ opt, key = 0 }: { opt: string, key?: number | string }) {
  const list: any = {}
  const items = formModel[opt]
  items.splice(Number(key) + 1, 0, list)
}

function tableItemsRemove({ opt, key }: { opt: string, key?: number | string }) {
  formModel[opt].splice(key, 1)
}

function tableItemsMoveUp({ opt, key }: { opt: string, key?: number | string }) {
  const nuns = Number(key)
  if (nuns === 0)
    return
  const items = formModel[opt];
  [items[nuns], items[nuns - 1]] = [items[nuns - 1], items[nuns]]
}

function tableItemsMoveDown({ opt, key }: { opt: string, key?: number | string }) {
  const nuns = Number(key)
  if (nuns < formModel[opt].length - 1) {
    const items = formModel[opt];
    [items[nuns], items[nuns + 1]] = [items[nuns + 1], items[nuns]]
  }
}

function tableItemsCopy({ opt, key }: { opt: string, key?: number | string }) {
  const items = formModel[opt]
  const item = items[Number(key)]
  const { _X_ROW_KEY: _, ...newItem } = item
  items.splice(Number(key) + 1, 0, newItem)
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

  const list = [{ id: formModel.id, biz_class: 'Asset' }]

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
            biz_class: 'Asset',
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
        <n-button v-if="Number(formModel.id) !== 0" @click="handleLogs()">
          操作日志
        </n-button>
        <DraftBox
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
