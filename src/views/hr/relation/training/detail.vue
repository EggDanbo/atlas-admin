<script setup lang="ts">
import type { FormRules } from 'naive-ui'
import type { OpenModal } from '@/components/SpModal'
import type { TableInstance } from '@/components/SpTable'
import { format } from 'date-fns'
import BizDraftBox from '@/components/BizDraftBox'
import { Upload } from '@/components/BizFile'
import { LogBiz } from '@/components/BizLogs/Biz'
import { SpCascader } from '@/components/SpCascader'
import { StaffPicker } from '@/components/SpTablePicker'
import { createTransformer, toDateLabel, useDetail, useTableItems } from '@/hooks/detail'
import { useTabbar } from '@/hooks/tabbar/useTabbar'
import { unit as teamApi } from '@/service/api/access'
import { training as api } from '@/service/api/hr/relation'
import { useEnumStore } from '@/store/modules/enums'
import { tenantStorage } from '@/utils/tenant'
import toast from '@/utils/toast'
import { gridOptions, viewGridOptions } from './columns'

const emit = defineEmits(['on-action'])

const { getPermission } = useTabbar()
const tabPermName = getPermission()

const enumStore = useEnumStore()

const logBizRef = ref<OpenModal | null>(null)

const workSelectRef = ref<OpenModal | null>(null)

const tableRef = ref<TableInstance | null>(null)
const viewTableRef = ref<TableInstance | null>(null)

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
    opt_submit: false,
    team_id: null,
    team_name: null,
    date: Date.now(),
    title: null,
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

  // for (let i = 0; i < formModel.list.length; i++) {
  //   rules[`list[${i}].start`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
  //   rules[`list[${i}].expire`] = [{ type: 'number', required: true, trigger: ['blur', 'change'] }]
  //   rules[`list[${i}].branch`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`list[${i}].content`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`list[${i}].outcome`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`list[${i}].contact`] = [{ required: true, trigger: ['blur', 'change'] }]
  //   rules[`list[${i}].mobile`] = [{ required: true, trigger: ['blur', 'change'] }]
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
  title: '培训登记',
  permission: { useTabPermission: true, permName: 'HR_RELATION_TRAINING' },
  canEdit: form => true,
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
    for (const i in formModel.list) {
      const item = formModel.list[i]
      item.start = item.start && Number(item.start) > 0 ? Number(item.start) : null
      item.expire = item.expire && Number(item.expire) > 0 ? Number(item.expire) : null
    }

    await load()
    return true
  },
  async beforeView() {
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
    toast.info('请先选择申请单位')
    return
  }

  workSelectRef.value?.open()
}

function rowsChange(e, tref) {
  const $table = tref
  $table?.editRowEvent(e.row)
}

const { tableItemsRemove, tableItemsMoveUp, tableItemsMoveDown } = useTableItems(formModel)

function handleItemUserSelected(options) {
  options.forEach((item) => {
    formModel.list.push({
      user_id: item.id,
      user_name: item.name,
      start: null,
      expire: null,
    })
  })
}

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'HrRelationTrainingDetail' }
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
        <n-form-item-gi :span="8" label="申请日期" path="date">
          <n-date-picker v-model:value="formModel.date" type="date" fast-month-select clearable />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="申请单位" path="team_id">
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

        <template #start_default="{ row }">
          {{ row.start && format(Number(row.start), 'yyyy-MM-dd') }}
        </template>
        <template #start_edit="{ row }">
          <n-date-picker v-model:value="row.start" type="date" fast-month-select clearable />
        </template>
        <template #expire_default="{ row }">
          {{ row.expire && format(Number(row.expire), 'yyyy-MM-dd') }}
        </template>
        <template #expire_edit="{ row }">
          <n-date-picker v-model:value="row.expire" type="date" fast-month-select clearable />
        </template>
        <template #content_edit="{ row }">
          <n-input v-model:value="row.content" clearable />
        </template>
        <template #branch_edit="{ row }">
          <n-input v-model:value="row.branch" clearable />
        </template>
        <template #outcome_edit="{ row }">
          <n-input v-model:value="row.outcome" clearable />
        </template>
        <template #contact_edit="{ row }">
          <n-input v-model:value="row.contact" clearable />
        </template>
        <template #mobile_edit="{ row }">
          <n-input v-model:value="row.mobile" clearable />
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
          placeholder="培训人员"
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
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="8" label="申请日期">
          <n-input :value="formModel.transform?.date" placeholder="" readonly />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="申请单位">
          <n-input v-model:value="formModel.team_name" placeholder="" readonly />
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
        <template #start_default="{ row }">
          {{ row.start && format(Number(row.start), 'yyyy-MM-dd') }}
        </template>
        <template #expire_default="{ row }">
          {{ row.expire && format(Number(row.expire), 'yyyy-MM-dd') }}
        </template>
      </SpTable>
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
          types="hr/relation/reward"
          :save="() => ({ ...formModel })"
          :get="updateModel"
        />
        <n-button
          v-if="showEdit() && formModel.opt_submit"
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
      </n-flex>
    </template>
  </SpModal>

  <LogBiz ref="logBizRef" />
</template>
