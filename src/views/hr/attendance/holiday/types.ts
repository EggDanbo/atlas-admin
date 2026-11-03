/** 节日登记行 */
export interface FestivalRow {
  id: number
  year: number
  name: string
  notes?: string
  sort: number
  days: { day: string, day_type: number }[]
}
