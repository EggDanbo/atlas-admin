/**
 * 明细表格的行操作
 *
 * 详情里的明细（单据行、分摊行、人员行…）都挂在 `formModel[opt]` 上，
 * 增、删、上下移、复制这四件事在几十个 detail.vue 里被重复实现过一遍，
 * 差别只在插入新行时的默认值。这里收成一个入口：
 *
 * ```ts
 * const { tableItemsAdd, tableItemsRemove } = useTableItems(formModel)
 * tableItemsAdd({ opt: 'list', key: rowIndex, def: { name: null } })
 * ```
 *
 * `opt` 是 formModel 上的数组字段名，便于同一页面维护多张明细表。
 */
export function useTableItems<T extends Record<string, any>>(formModel: T) {
  /** 取明细数组，字段不存在时给出明确报错，避免静默写入错误字段 */
  function getItems(opt: string): any[] {
    const items = formModel[opt]
    if (!Array.isArray(items))
      throw new Error(`[useTableItems] formModel.${opt} 不是数组`)
    return items
  }

  /** 在指定行之后插入一行，`def` 为新行的默认值 */
  function tableItemsAdd({ opt, key = 0, def = {} }: {
    opt: string
    key?: number | string
    def?: Record<string, any>
  }) {
    getItems(opt).splice(Number(key) + 1, 0, { ...def })
  }

  /** 删除指定行 */
  function tableItemsRemove({ opt, key }: { opt: string, key: number | string }) {
    getItems(opt).splice(Number(key), 1)
  }

  /** 上移一行 */
  function tableItemsMoveUp({ opt, key }: { opt: string, key: number | string }) {
    const index = Number(key)
    if (index <= 0)
      return
    const items = getItems(opt);
    [items[index], items[index - 1]] = [items[index - 1], items[index]]
  }

  /** 下移一行 */
  function tableItemsMoveDown({ opt, key }: { opt: string, key: number | string }) {
    const index = Number(key)
    const items = getItems(opt)
    if (index < 0 || index >= items.length - 1)
      return;
    [items[index], items[index + 1]] = [items[index + 1], items[index]]
  }

  /** 复制一行（去掉 VXETable 内部挂的行标识，避免两行共享同一 key） */
  function tableItemsCopy({ opt, key }: { opt: string, key: number | string }) {
    const items = getItems(opt)
    const index = Number(key)
    const item = items[index]
    if (!item)
      return
    const { _X_ROW_KEY: _ignored, ...rest } = item
    items.splice(index + 1, 0, { ...rest })
  }

  return {
    tableItemsAdd,
    tableItemsRemove,
    tableItemsMoveUp,
    tableItemsMoveDown,
    tableItemsCopy,
  }
}
