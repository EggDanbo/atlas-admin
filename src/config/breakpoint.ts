export const sizeEnum = {
  XS: 'XS',
  SM: 'SM',
  MD: 'MD',
  LG: 'LG',
  XL: 'XL',
  XXL: 'XXL',
} as const

export const screenEnum = {
  XS: 480,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1600,
} as const

// 使用更具体的类型
export type SizeEnum = keyof typeof sizeEnum

const screenMap = new Map<SizeEnum, number>()
Object.keys(sizeEnum).forEach((key) => {
  screenMap.set(key as SizeEnum, screenEnum[key as SizeEnum])
})

export { screenMap }
