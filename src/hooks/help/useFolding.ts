export function useFolding(tableRef?: Ref<any>) {
  const overflow = ref(true)
  const folding = () => {
    overflow.value = !overflow.value
    tableRef?.value.redoHeight() // 重算网格高度
  }
  return {
    overflow,
    folding,
  }
}
