import type { TableActionType, TableProps } from '../types/table'
import { inject, provide } from 'vue'

const key = Symbol('sp-data-table')

type Instance = TableActionType & {
  getBindValues: ComputedRef<Recordable>
  isShowTable: any
  wrapRef: Ref<Nullable<HTMLElement>>
}

type RetInstance = Omit<Instance, 'getBindValues'> & {
  getBindValues: ComputedRef<TableProps>
}

export function createTableContext(instance: Instance) {
  provide(key, instance)
}

export function useTableContext(): RetInstance {
  return inject(key) as RetInstance
}
