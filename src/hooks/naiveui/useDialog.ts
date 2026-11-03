export function useDialog() {
  function destroyAll() {
    window.$dialog?.destroyAll()
  }

  function create(option) {
    window.$dialog?.create(option)
  }

  function error(option) {
    window.$dialog?.error(option)
  }

  function info(option) {
    window.$dialog?.info(option)
  }

  function success(option) {
    window.$dialog?.success(option)
  }

  function warning(option) {
    window.$dialog?.warning(option)
  }

  return {
    destroyAll,
    create,
    error,
    info,
    success,
    warning,
  }
}
