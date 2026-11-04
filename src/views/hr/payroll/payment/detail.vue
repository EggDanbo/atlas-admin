<script setup lang="ts">
import type { OpenModal } from '@/components/SpModal'
import { format } from 'date-fns'
import { LogBiz } from '@/components/BizLogs/Biz'
import { dictLabel } from '@/dicts'
import { createTransformer, toDateLabel, useDetail } from '@/hooks/detail'
import { payment as api } from '@/service/api/hr/payroll'

const emit = defineEmits(['on-action'])

const logBizRef = ref<OpenModal | null>(null)

function createFormModel() {
  return {
    id: '0',
    user_id: null,
    user_name: null,
    start: null as number | null,
    expire: null as number | null,
    transform: {},
  }
}

type FormModel = ReturnType<typeof createFormModel> & { [key: string]: any, transform?: Record<string, string> }

const {
  formModel,
  modalRef,
  exposed,
  clearTabState,
} = useDetail<FormModel>({
  api,
  createFormModel,
  title: '工资支付',
  permission: { useTabPermission: true, permName: 'HR_PAYROLL_PAYMENT' },
  canEdit: form => false,
  onSuccess: (action) => {
    emit('on-action', action)
  },
  transform: createTransformer({
    string: ['status'],
    nullIfZero: ['user_id'],
    number: ['user_add', 'start', 'expire'],
    custom: {
      user_add: val => val ? format(Number(val), 'yyyy-MM') : null,
      start: val => toDateLabel(val),
      expire: val => toDateLabel(val),
    },
  }),
})

function handleLogs(opt?: string) {
  logBizRef.value?.open({ xid: formModel.id })
}

defineExpose(exposed)
</script>

<script lang="ts">
export default { name: 'HrPayrollPaymentDetail' }
</script>

<template>
  <SpModal ref="modalRef" width="90vw" height="90vh" :before-close="clearTabState">
    <n-form
      label-placement="left"
      require-mark-placement="left"
      :label-width="140"
      :model="formModel"
    >
      <div class="stamp-text">
        {{ dictLabel('staff_salary_status', formModel.status) }}
      </div>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="16" label="单位部门">
          <n-input v-model:value="formModel.team_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="人员姓名">
          <n-input v-model:value="formModel.user_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="16" label="所在分队">
          <n-input v-model:value="formModel.branch_name" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="职务">
          <n-input v-model:value="formModel.user_rank" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="入职日期">
          <n-input :value="formModel.transform?.user_add" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="当前工龄">
          <n-input-number v-model:value="formModel.user_year" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="8" label="岗位">
          <n-input v-model:value="formModel.user_post" placeholder="" readonly="true" />
        </n-form-item-gi>
      </n-grid>
      <n-divider title-placement="left">
        考勤信息
      </n-divider>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="6" label="开始日期">
          <n-input :value="formModel.transform?.start" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="结束日期">
          <n-input :value="formModel.transform?.expire" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="绩效等级">
          <n-input v-model:value="formModel.caste" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="天数">
          <n-input-number v-model:value="formModel.days" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="应上班天数">
          <n-input-number v-model:value="formModel.work_day" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="休息日天数">
          <n-input-number v-model:value="formModel.rest_day" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="实际上班天数">
          <n-input-number v-model:value="formModel.fact_day" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="事假天数">
          <n-input-number v-model:value="formModel.case_day" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="病假天数">
          <n-input-number v-model:value="formModel.sick_day" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="休假天数">
          <n-input-number v-model:value="formModel.fest_day" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="缺勤天数">
          <n-input-number v-model:value="formModel.lack_day" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="工作日加班">
          <n-input-number v-model:value="formModel.work_time" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="休息日加班">
          <n-input-number v-model:value="formModel.rest_time" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="节假日加班">
          <n-input-number v-model:value="formModel.fest_time" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" label="年休假加班">
          <n-input-number v-model:value="formModel.self_time" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
      </n-grid>
      <n-divider title-placement="left">
        工资信息
      </n-divider>
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi v-if="formModel.bases && formModel.bases !== 0" :span="8" label="基本工资">
          <n-input-number v-model:value="formModel.bases" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.grade && formModel.grade !== 0" :span="8" label="综合补贴">
          <n-input-number v-model:value="formModel.grade" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.posts && formModel.posts !== 0" :span="8" label="岗位补贴">
          <n-input-number v-model:value="formModel.posts" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.years && formModel.years !== 0" :span="8" label="工龄工资">
          <n-input-number v-model:value="formModel.years" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.rises && formModel.rises !== 0" :span="8" label="绩效工资">
          <n-input-number v-model:value="formModel.rises" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.lends && formModel.lends !== 0" :span="8" label="顶班工资">
          <n-input-number v-model:value="formModel.lends" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.fulls && formModel.fulls !== 0" :span="8" label="有薪假工资">
          <n-input-number v-model:value="formModel.fulls" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.works && formModel.works !== 0" :span="8" label="工作日加班工资">
          <n-input-number v-model:value="formModel.works" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.rests && formModel.rests !== 0" :span="8" label="休息日加班工资">
          <n-input-number v-model:value="formModel.rests" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.fests && formModel.fests !== 0" :span="8" label="节假日加班工资">
          <n-input-number v-model:value="formModel.fests" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.selfs && formModel.selfs !== 0" :span="8" label="年休假加班工资">
          <n-input-number v-model:value="formModel.selfs" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.heats && formModel.heats !== 0" :span="8" label="高温补贴">
          <n-input-number v-model:value="formModel.heats" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.calls && formModel.calls !== 0" :span="8" label="通讯补贴">
          <n-input-number v-model:value="formModel.calls" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.dines && formModel.dines !== 0" :span="8" label="伙食补贴">
          <n-input-number v-model:value="formModel.dines" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.drive && formModel.drive !== 0" :span="8" label="交通补贴">
          <n-input-number v-model:value="formModel.drive" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.skill && formModel.skill !== 0" :span="8" label="分队长管理费">
          <n-input-number v-model:value="formModel.skill" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.wilds && formModel.wilds !== 0" :span="8" label="野外补贴">
          <n-input-number v-model:value="formModel.wilds" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.meets && formModel.meets !== 0" :span="8" label="应急补贴">
          <n-input-number v-model:value="formModel.meets" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.gifts && formModel.gifts !== 0" :span="8" label="节日补贴">
          <n-input-number v-model:value="formModel.gifts" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.other && formModel.other !== 0" :span="8" label="其他补贴">
          <n-input-number v-model:value="formModel.other" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.patch && formModel.patch !== 0" :span="8" label="补备用款">
          <n-input-number v-model:value="formModel.patch" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.attach && formModel.attach !== 0" :span="8" label="其他应补">
          <n-input-number v-model:value="formModel.attach" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.onces && formModel.onces !== 0" :span="8" label="年终奖">
          <n-input-number v-model:value="formModel.onces" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.royalty && formModel.royalty !== 0" :span="8" label="回收率奖金">
          <n-input-number v-model:value="formModel.royalty" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.bounty && formModel.bounty !== 0" :span="8" label="奖励金额">
          <n-input-number v-model:value="formModel.bounty" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.penalty && formModel.penalty !== 0" :span="8" label="罚款金额">
          <n-input-number v-model:value="formModel.penalty" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.fit_used && formModel.fit_used !== ''" :span="8" label="装备领用情况">
          <n-input v-model:value="formModel.fit_used" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.fit_back && formModel.fit_back !== ''" :span="8" label="装备回收情况">
          <n-input v-model:value="formModel.fit_back" placeholder="" readonly="true" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.fit_deduct && formModel.fit_deduct !== 0" :span="8" label="装备扣款">
          <n-input-number v-model:value="formModel.fit_deduct" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.meals && formModel.meals !== 0" :span="8" label="伙食扣款">
          <n-input-number v-model:value="formModel.meals" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.loses && formModel.loses !== 0" :span="8" label="缺勤扣款">
          <n-input-number v-model:value="formModel.loses" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.nones && formModel.nones !== 0" :span="8" label="事假扣款">
          <n-input-number v-model:value="formModel.nones" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.sicks && formModel.sicks !== 0" :span="8" label="病假扣款">
          <n-input-number v-model:value="formModel.sicks" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.deduct && formModel.deduct !== 0" :span="8" label="其他扣款">
          <n-input-number v-model:value="formModel.deduct" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.payable && formModel.payable !== 0" :span="8" label="应发工资">
          <n-input-number v-model:value="formModel.payable" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.insure && formModel.insure !== 0" :span="8" label="雇主险残障金">
          <n-input-number v-model:value="formModel.insure" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.social && formModel.social !== 0" :span="8" label="个人社保">
          <n-input-number v-model:value="formModel.social" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.house && formModel.house !== 0" :span="8" label="个人公积金">
          <n-input-number v-model:value="formModel.house" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.taxes && formModel.taxes !== 0" :span="8" label="应纳税所得额">
          <n-input-number v-model:value="formModel.taxable" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.taxes && formModel.taxes !== 0" :span="8" label="个税起征点">
          <n-input-number v-model:value="formModel.starts" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.taxes && formModel.taxes !== 0" :span="8" label="个税专项扣除">
          <n-input-number v-model:value="formModel.special" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.taxes && formModel.taxes !== 0" :span="8" label="个人所得税">
          <n-input-number v-model:value="formModel.taxes" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.netpay && formModel.netpay !== 0" :span="8" label="实发工资">
          <n-input-number v-model:value="formModel.netpay" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.socials && formModel.socials !== 0" :span="8" label="社保支出">
          <n-input-number v-model:value="formModel.socials" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.houses && formModel.houses !== 0" :span="8" label="公积金支出">
          <n-input-number v-model:value="formModel.houses" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi v-if="formModel.amount && formModel.amount !== 0" :span="8" label="人力成本">
          <n-input-number v-model:value="formModel.amount" placeholder="" :readonly="true" :show-button="false" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注">
          <n-input
            v-model:value="formModel.remark"
            type="textarea"
            :rows="3"
            placeholder=""
            readonly="true"
          />
        </n-form-item-gi>
      </n-grid>
    </n-form>
    <template #footer>
      <n-flex justify="end">
        <n-button @click="modalRef?.close">
          关闭
        </n-button>
        <n-button v-if="Number(formModel.id) !== 0" @click="handleLogs()">
          操作日志
        </n-button>
      </n-flex>
    </template>
  </SpModal>

  <LogBiz ref="logBizRef" />
</template>
