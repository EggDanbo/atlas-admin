/**
 * 打卡地点
 */
export interface CheckinLocation {
  /** 打卡地点名称 */
  title: string
  /** 打卡地点详情 */
  detail: string
  /** 经度 */
  lng: number
  /** 纬度 */
  lat: number
  /** 范围;米 */
  distance: number
}

/**
 * 打卡Wi-Fi
 */
export interface CheckinWifiMac {
  /** MAC地址 */
  wifimac: null | string
  /** WiFi打卡地点名称 */
  wifiname: null | string
}

/**
 * 打卡迟到规则
 */
export interface CheckinLaterRule {
  /** 下班晚走的时间;单位：秒 不超过600分钟 */
  offwork_after_time: number
  /** 次日可晚到的时间;单位：秒 不超过600分钟 */
  onwork_flex_time: number
}

/**
 * 无需打卡日
 */
export interface CheckinSpeOffDay {
  /** 单个日期;零点 */
  time: number | string
  /** 特殊日期备注 */
  notes: string
  /** 时间类型;0-时间点,1-时间段,2-两周重复 */
  time_type: number
  /** type为1时表示开始时间 */
  begin_time: number | string
  /** type为1,2时表示结束时间 */
  end_time: number | string
}

/**
 * 必须打卡日
 */
export interface CheckinSpeWorkDay extends CheckinSpeOffDay {
  /** 打卡时段 */
  checkin_time: Array<CheckinTime>
}

/**
 * 指定休息时间
 */
export interface CheckinOtFix {
  /** 休息开始时间，单位：秒，范围：00:00-次日23:59。 */
  begin_sec: null | number
  /** 休息结束时间，单位：秒，范围：00:00-次日23:59。 */
  end_sec: null | number
}

/**
 * 按加班时长扣除
 */
export interface CheckinOtCal {
  /** 休息开始时间，单位：秒，范围：00:00-次日23:59。 */
  ot_time: null | number
  /** 休息结束时间，单位：秒，范围：00:00-次日23:59。 */
  rest_time: null | number
}

/**
 * 加班规则
 */
export interface CheckinOt {
  /** 是否允许加班 */
  allow_ot: null | number
  /** 加班种类;0-工作日,1-休息日,2-节假日 */
  kind: number
  /** 加班类型;0-按加班审批时长计算,1-按打卡时长计算,2-按审批和打卡时长计算 */
  ot_type: number
  /** 允许加班时长记为调休和加班费 */
  trans_enable: boolean
  /** 加班时长类型;1-记为调休,2-记为加班费 */
  trans_type: number
  /** 调休比例；百分比,值为100表示1:1 */
  trans_ratio: number
  /** 休息扣除配置;0-不扣除,1-指定休息时间,2-按加班时长扣除 */
  rest_type: number
  /** 工作日加班时段类型;0-上班前和下班后,1-仅允许上班前,2-仅允许下班后 */
  workday_time_type: number
  /** 下班后多久开始计算加班；单位：秒，不超过720分钟 */
  ot_time_start: number
  /** 最小加班时长，按打卡时长计算，单位：秒，不超过720分钟 */
  ot_time_min?: number
  /** 最大加班时长;按打卡时长计算，单位：秒，不超过720分钟 */
  ot_time_max?: number
  /** 允许扣除休息时间 */
  allow_ot_rest?: boolean | null
  /** 指定休息时间 */
  ot_fix?: Array<CheckinOtFix> | null
  /** 按加班时长扣除 */
  ot_cal?: Array<CheckinOtCal> | null
}

/**
 * 休息时间
 */
export interface CheckinRestTime {
  /** 休息开始时间;单位：秒 */
  rest_begin_time: number
  /** 休息结束时间;单位：秒 */
  rest_end_time: number
}

/**
 * 打卡时段
 */
export interface CheckinTime {
  /** 上班时间;距0点秒数，整分钟 */
  work_sec: number
  /** 下班时间;距0点秒数，整分钟 */
  off_work_sec: number
  /** 上班最早时间;距0点秒数，整分钟 */
  earliest_work_sec: number
  /** 上班最晚时间;距0点秒数，整分钟 */
  latest_work_sec: number
  /** 下班最早时间;距0点秒数，整分钟 */
  earliest_off_work_sec: number
  /** 下班最晚时间;距0点秒数，整分钟 */
  latest_off_work_sec: number
  /** 上班提醒时间;距0点秒数，整分钟 */
  remind_work_sec: number
  /** 下班提醒时间;距0点秒数，整分钟 */
  remind_off_work_sec: number
  /** 打卡地点 */
  checkin_location?: Array<CheckinLocation> | null
  /** 打卡Wi-Fi */
  checkin_wifimac?: Array<CheckinWifiMac> | null
  /** 休息时间 */
  rest_time: Array<CheckinRestTime> | null
}

/**
 * 打卡时间
 */
export interface CheckinDate {
  /** 打卡时间名称;按班次上下班时候使用 */
  name?: null | string
  /** 工作日;按班次上下班时候不适用，则1到6分别表示星期一到星期六，0表示星期日 */
  workdays?: Array<number> | null
  /** 是否允许弹性时间 */
  allow_flex?: boolean | null
  /** 允许迟到时间;单位：秒 */
  flex_on_duty_time?: number
  /** 允许早退时间;单位：秒 */
  flex_off_duty_time?: number
  /** 允许早到早走时间;单位：秒 */
  max_allow_arrive_early?: number
  /** 允许晚到晚走时间;单位：秒 */
  max_allow_arrive_late?: number
  /** 是否允许超时下班 */
  allow_offwork_after_time?: number
  /** 打卡时段 */
  checkin_time?: Array<CheckinTime> | null
  /** 打卡迟到规则;下班晚走，次日晚到 */
  checkin_later_rule?: Array<CheckinLaterRule> | null
}

/**
 * 打卡规则
 */
export interface CheckinGroup {
  /** (编辑时候才有)规则ID */
  id?: null | string
  /** 所属单位ID */
  team_id?: null | number
  /** (编辑时候才有)规则类型;1-固定时间上下班；2-按班次上下班；3-自由上下班 */
  group_type?: null | number
  /** 是否明日生效 */
  delay?: boolean | null
  /** 打卡规则名称 */
  group_name: string | null
  /** 打卡必须拍照 */
  need_photo?: boolean
  /**
   * 节假日同步模式
   * 0-不同步
   * 1-仅法定节假日不用打卡（调休日、补班日按常规执行）
   * 2-法定节假日和调休日不用打卡（补班日需打卡）
   */
  sync_holidays?: null | number
  /** 是否非工作日允许打卡 */
  allow_checkin_offworkday?: boolean | null
  /** 是否允许提交补卡申请 */
  allow_apply_offworkday?: boolean | null
  /** 设置每月最多补卡次数 */
  allow_apply_bk_cnt?: null | number
  /** 允许补卡时限;默认-1表示不限制;1表示当天，2表示当天和昨天，最大不超过180天。 */
  allow_apply_bk_day_limit?: null | number
  /** 补卡截止日期;次月第n天不能补卡，-1表示不开启截止日期。 */
  buka_limit_next_month?: null | number
  /** 补卡提醒是否打开 */
  buka_open_remind?: boolean | null
  /** 补卡提醒日期，不超过30 */
  buka_remind_day?: null | number
  /** 补卡提醒月;0-当月,1-次月 */
  buka_remind_month?: null | number
  /** 范围外打卡;0-不在公司范围内视为异常，1-不在公司范围内视为外勤，2-禁止不在公司范围内打卡 */
  option_out_range?: null | number
  /** 是否人脸检测 */
  use_face_detect?: boolean
  /** 打卡间隔时间;每次上班打卡XX后可打下班卡 */
  offwork_interval_time?: null | number
  /** 自由上下班规则的跨天时间;表示为距离0点的秒数，必须为整分钟的秒数，且小于24小时。 */
  span_day_time?: number | null
  /** 自自由上下班规则的工作时长;-1表示不限制工作时长，否则值应该以半小时为步长，从1小时开始递增，最多不超过24小时。如：1小时，1.5小时，2小时，2.5小时...23小时，23.5小时，24小时。 */
  standard_work_duration?: null | number
  /** 自由上下班规则的工作日;按班次上下班时候不适用，则1到6分别表示星期一到星期六，0表示星期日 */
  workdays?: Array<number> | null
  /**
   * 打卡交替方式
   * 0-交替打卡1次,打卡上班-下班-更新下班，以最早最晚打卡计算工作时长
   * 1-交替打卡多次,打卡上班-下班-上班，依次交替，以多次交替上下班打卡计算时长
   * 2-仅记录打卡时间和位置,无需上下班交替打卡，不计算工作/加班时长
   */
  checkin_method_type: null | number
  /** 按班次上下班的未排班时,允许成员自己选择班次打卡 */
  allow_select_schedule?: boolean | null
  /** 打卡时间 */
  checkin_date?: Array<CheckinDate> | null
  /** 打卡地点 */
  checkin_location?: Array<CheckinLocation> | null
  /** 打卡Wi-Fi */
  checkin_wifimac?: Array<CheckinWifiMac> | null
  /** 必须打卡日期 */
  checkin_spe_workdays?: Array<CheckinSpeWorkDay> | null
  /** 无需打卡日期 */
  checkin_spe_offdays?: Array<CheckinSpeOffDay> | null
  /** 加班规则-工作日加班配置 */
  ot_workday?: Array<CheckinDate> | null
  /** 加班规则-休息日加班配置 */
  ot_restday?: Array<CheckinDate> | null
  /** 加班规则-节假日加班配置 */
  ot_holiday?: Array<CheckinDate> | null
}

export interface CheckinSchedulePeriodItem {
  /** 第几天 */
  day: number
  /** 班次名 */
  name: string
}

/** 周期排班 */
export interface CheckinSchedulePeriod {
  /** 周期名称 */
  name: string
  /** 周期列表 */
  list: Array<CheckinSchedulePeriodItem>
}

/** 人员排班 */
export interface CheckinUserSchedule {
  /** 人员ID */
  user_id: string
  /** 班次名 */
  name: string
  /** 排班日期 */
  schedule_date: number
}
