import { createOptionsMap } from '.'

export const {
  options: sexOptions,
  mapping: sexMap,
  mapping2: sexColorMap,
} = createOptionsMap([
  ['female', '女', 'error'],
  ['male', '男', 'info'],
])

export const {
  options: roleStatusOptions,
  mapping: roleStatusMap,
  mapping2: roleStatusColorMap,
} = createOptionsMap([
  ['normal', '正常', 'info'],
  ['enable', '启用', 'success'],
  ['disable', '禁用', 'error'],
])

export const {
  options: statusOptions,
  mapping: statusMap,
  mapping2: statusColorMap,
} = createOptionsMap([
  ['close', '已取消', 'default'],
  ['refuse', '已拒绝', 'error'],
  ['pass', '已通过', 'success'],
])

export const {
  options: isOptions,
  mapping: isMap,
  mapping2: isColorMap,
} = createOptionsMap([
  [true, '是', 'success'],
  [false, '否', 'default'],
])
