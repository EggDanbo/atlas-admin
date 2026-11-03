<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { ModalInst, OpenModal } from '@/components/SpModal'
import type { TableInstance } from '@/components/SpTable'
import { format } from 'date-fns'
import BizDraftBox from '@/components/BizDraftBox'
import { LogBiz } from '@/components/BizLogs/Biz'
import { LogProcess } from '@/components/BizLogs/process'
import { SpCascader } from '@/components/SpCascader'
import { SpDict } from '@/components/SpDict'
import { createTransformer, useDetail } from '@/hooks/detail'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { unit as teamApi } from '@/service/api/access'
import { level as api } from '@/service/api/hr/relation'
import { approve } from '@/service/api/workflow'
import { useEnumStore } from '@/store/modules/enums'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'
import { gridOptions, viewGridOptions } from './columns'

const emit = defineEmits(['on-action'])

const { getPermission } = useTabbar()
const tabPermName = getPermission()

const logBizRef = ref<OpenModal | null>(null)
const logProcessRef = ref<OpenModal | null>(null)

const tableRef = ref<TableInstance | null>(null)
const viewTableRef = ref<TableInstance | null>(null)

const riseModalRef = ref<ModalInst | null>(null)
const riseDataList = ref<any>([])
const riseDataIndex = ref<number>(0)

const isConfirm = ref(false)

const enumStore = useEnumStore()

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

async function load() {
  await loadTeamTree()
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
    title: [{ required: true, message: '请输入标题', trigger: 'change' }],
    digest: [{ required: true, message: '请输入申请事由', trigger: 'change' }],
  }

  // for (let i = 0; i < formModel.list.length; i++) {
  //   rules[`list[${i}].name`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`list[${i}].salary`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
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
  title: '工资级别',
  permission: { useTabPermission: true, permName: 'HR_RELATION_LEVEL' },
  canEdit: form => form.opt_submit,
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
      predict: val => val ? format(Number(val), 'yyyy-MM') : null,
    },
  }),
  beforeEdit: async () => {
    await load()
    if (formModel.list.length === 0) {
      tableItemsAdd({ opt: 'list' })
    }
    return true
  },
  beforeView() {
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

function rowsChange(e, tref) {
  const $table = tref
  $table?.editRowEvent(e.row)
}

function tableItemsCheck(opt: string) {
  return false
}

async function tableItemsAdd({ opt, key = 0 }: { opt: string, key?: number | string }) {
  const listNums = Number(key)
  const list: any = {}

  if (formModel[opt] && formModel[opt].length > 0) {
    if (await tableItemsCheck(opt))
      return
  }

  formModel[opt].splice(listNums + 1, 0, list)
}

function tableItemsRemove({ opt, key }: { opt: string, key: number | string }) {
  if (formModel[opt].length <= 1) {
    toast.info('不能少于一行')
    return
  }

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

function handleLogs(opt?: string) {
  if (opt === 'process') {
    logProcessRef.value?.open({ id: formModel.id })
  }
  else {
    logBizRef.value?.open({ xid: formModel.id })
  }
}

function handleRiseVarSetModal(key) {
  const item = formModel.list[key]
  riseDataIndex.value = Number(key)

  riseDataList.value = []

  if (item.rise_var) {
    const arr = item.rise_var.split(';')
    if (arr.length > 1) {
      const rateArr = arr[0].split(',')
      const valueArr = arr[1].split(',')
      for (const i in rateArr) {
        riseDataList.value.push({
          rate: rateArr[i],
          value: Number(valueArr[i]),
        })
      }
    }
  }

  // if (riseDataList.value.length === 0) {
  //   riseDataListItemAdd()
  // }
  riseModalRef.value?.open()
}

function riseDataListItemAdd() {
  if (riseDataListItemCheck())
    return

  const def = {
    rate: null,
    value: null,
  }
  riseDataList.value.push(def)
}

function riseDataListItemMoveUp(key) {
  if (Number(key) === 0)
    return
  const items = riseDataList.value;
  [items[key], items[key - 1]] = [items[key - 1], items[key]]
}

function riseDataListItemMoveDown(key) {
  if (Number(key) < riseDataList.value.length - 1) {
    const items = riseDataList.value;
    [items[key], items[key + 1]] = [items[key + 1], items[key]]
  }
}

function riseDataListItemCopy(key) {
  const item = riseDataList.value[key]
  const newItem = { ...item }
  riseDataList.value.splice(key + 1, 0, newItem)
}

function riseDataListItemRemove(key) {
  // if (riseDataList.value.length > 1) {
  riseDataList.value.splice(key, 1)
  // }
  // else {
  //   toast.info('请填写浮动绩效工资')
  // }
}

function riseDataListItemCheck() {
  const hasError = riseDataList.value.some((item, index) => {
    if (!item.rate) {
      toast.error(`请选择 #${index + 1} 评级`)
      return true
    }
    // if (!item.value) {
    //   toast.error(`请输入 #${index + 1} 值`)
    //   return true
    // }
    return false
  })

  return hasError
}

function handleRiseSet() {
  if (riseDataListItemCheck())
    return

  const rateArr = riseDataList.value.map(q => q.rate)
  const valueArr = riseDataList.value.map(q => q.value)

  if (rateArr.length === 0) {
    formModel.list[riseDataIndex.value].rise_var = ''
  }
  else {
    formModel.list[riseDataIndex.value].rise_var = `${rateArr.join(',')};${valueArr.join(',')}`
  }

  riseModalRef.value?.close()
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'HrRelationLevelDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="90vw" height="90vh" :before-close="clearTabState">
    <n-form
      v-if="isEdit && !isConfirm"
      ref="formRef"
      label-placement="left"
      require-mark-placement="left"
      :label-width="110"
      :model="formModel"
      :rules="formRules"
      :disabled="!hasPerm"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="8" label="申请日期" path="date">
          <n-date-picker v-model:value="formModel.date" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="申请单位" path="team_id">
          <SpCascader
            v-model:value="formModel.team_id"
            :options="teamTreeOptions"
            placeholder="请选择"
            value-field="id"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="生效月份" path="predict">
          <n-date-picker v-model:value="formModel.predict" type="month" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="标题" path="title">
          <n-input v-model:value="formModel.title" clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注" path="remark">
          <n-input v-model:value="formModel.remark" type="textarea" :rows="3" clearable />
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
          <SpDict v-model:value="row.name" name="工资级别" clearable />
        </template>
        <template #salary_edit="{ row }">
          <n-input-number v-model:value="row.salary" :show-button="false" clearable />
        </template>
        <template #bases_edit="{ row }">
          <n-input-number v-model:value="row.bases" :show-button="false" clearable />
        </template>
        <template #grade_edit="{ row }">
          <n-input-number v-model:value="row.grade" :show-button="false" clearable />
        </template>
        <template #posts_edit="{ row }">
          <n-input-number v-model:value="row.posts" :show-button="false" clearable />
        </template>
        <template #dine_fix_edit="{ row }">
          <n-input-number v-model:value="row.dine_fix" :show-button="false" clearable />
        </template>
        <template #dine_day_edit="{ row }">
          <n-input-number v-model:value="row.dine_day" :show-button="false" clearable />
        </template>
        <template #heats_edit="{ row }">
          <n-input-number v-model:value="row.heats" :show-button="false" clearable />
        </template>
        <template #rise_fix_edit="{ row }">
          <n-input-number v-model:value="row.rise_fix" :show-button="false" clearable />
        </template>
        <template #rise_var_edit="{ row, rowIndex }">
          <n-input-group>
            <n-input v-model:value="row.rise_var" placeholder="" readonly />
            <n-button secondary @click="handleRiseVarSetModal(rowIndex)">
              设置
            </n-button>
          </n-input-group>
        </template>
        <template #hour_on_edit="{ row }">
          <n-input-number v-model:value="row.hour_on" :show-button="false" clearable />
        </template>
        <template #hour_off_edit="{ row }">
          <n-input-number v-model:value="row.hour_off" :show-button="false" clearable />
        </template>
        <template #hour_ext_edit="{ row }">
          <n-input-number v-model:value="row.hour_ext" :show-button="false" clearable />
        </template>
        <template #hour_add_edit="{ row }">
          <n-input-number v-model:value="row.hour_add" :show-button="false" clearable />
        </template>
        <template #hour_fix_edit="{ row }">
          <n-input-number v-model:value="row.hour_fix" :show-button="false" clearable />
        </template>
        <template #times_edit="{ row }">
          <n-input-number v-model:value="row.times" :show-button="false" clearable />
        </template>
        <template #extra_edit="{ row }">
          <n-input-number v-model:value="row.extra" :show-button="false" clearable />
        </template>
        <template #skill_edit="{ row }">
          <n-input-number v-model:value="row.skill" :precision="2" :show-button="false" clearable />
        </template>
        <template #other_edit="{ row }">
          <n-input-number v-model:value="row.other" :show-button="false" clearable />
        </template>
        <template #insure_edit="{ row }">
          <n-input-number v-model:value="row.insure" :show-button="false" clearable />
        </template>
        <template #social_edit="{ row }">
          <n-input-number v-model:value="row.social" :precision="2" :show-button="false" clearable />
        </template>
        <template #house_edit="{ row }">
          <n-input-number v-model:value="row.house" :show-button="false" clearable />
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
      :label-width="110"
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
            <n-form-item-gi :span="8" label="申请日期">
              <n-input :value="formModel.transform?.date" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="申请单位">
              <n-input v-model:value="formModel.team_name" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="生效月份">
              <n-input :value="formModel.transform?.predict" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="标题">
              <n-input v-model:value="formModel.title" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="申请事由">
              <n-input v-model:value="formModel.digest" type="textarea" :rows="3" placeholder="" readonly />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="备注">
              <n-input v-model:value="formModel.remark" type="textarea" :rows="3" placeholder="" readonly />
            </n-form-item-gi>
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
        <n-button v-if="Number(formModel.id) !== 0" @click="handleLogs()">
          操作日志
        </n-button>
        <BizDraftBox
          v-if="isEdit && Number(formModel.id) === 0"
          types="hr/relation/level"
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

  <SpModal ref="riseModalRef" title="浮动绩效设置" width="900" :mask="true" :draggable="true">
    <template #default>
      <div class="w-full flex flex-col gap-[15px]">
        <n-card v-for="(item, key) in riseDataList" :key="key" :content-style="{ padding: '0' }" class="detail-card-box">
          <div class="flex items-stretch">
            <div class="label-nums">
              <n-text strong>
                #{{ Number(key) + 1 }}
              </n-text>
            </div>

            <div class="detail-card-box-content">
              <n-form
                label-placement="left"
                require-mark-placement="left"
                :label-width="60"
              >
                <n-grid :cols="24" :x-gap="24" :y-gap="24">
                  <n-form-item-gi :span="12" label="评级" :show-feedback="false" :show-require-mark="true">
                    <n-select
                      v-model:value="item.rate"
                      :options="enumStore.getEnumOptions('staff_scale_caste', 'label')"
                      clearable
                    />
                  </n-form-item-gi>
                  <n-form-item-gi :span="12" label="值" :show-feedback="false" :show-require-mark="true">
                    <n-input-number v-model:value="item.value" :show-button="false" clearable />
                  </n-form-item-gi>
                </n-grid>
              </n-form>
            </div>

            <div class="menu-bar">
              <div class="flex items-start justify-center gap-[10px]">
                <n-button v-if="riseDataList.length > 1" :disabled="Number(key) === 0" text @click="riseDataListItemMoveUp(key)">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:arrow-up-outlined" />
                    </n-icon>
                  </template>
                </n-button>
                <n-button
                  v-if="riseDataList.length > 1"
                  :disabled="Number(key) === riseDataList.length - 1"
                  text
                  @click="riseDataListItemMoveDown (key)"
                >
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:arrow-down-outlined" />
                    </n-icon>
                  </template>
                </n-button>
                <n-button text @click="riseDataListItemCopy(key)">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:copy-outlined" />
                    </n-icon>
                  </template>
                </n-button>
                <n-button text @click="riseDataListItemRemove(key)">
                  <template #icon>
                    <n-icon>
                      <Icon icon="ant-design:delete-outlined" />
                    </n-icon>
                  </template>
                </n-button>
              </div>
            </div>
          </div>
        </n-card>
        <div class="w-full flex">
          <n-button dashed round size="small" class="w-full" @click="riseDataListItemAdd">
            <template #icon>
              <n-icon>
                <Icon icon="ant-design:plus-outlined" />
              </n-icon>
            </template>
            新增
          </n-button>
        </div>
      </div>
    </template>

    <template #footer>
      <n-space justify="end">
        <n-button @click="riseModalRef?.close">
          关闭
        </n-button>
        <n-button type="primary" :loading="btnLoading" @click="handleRiseSet">
          提交
        </n-button>
      </n-space>
    </template>
  </SpModal>

  <LogBiz ref="logBizRef" />
  <LogProcess ref="logProcessRef" />
</template>
