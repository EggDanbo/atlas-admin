export function useMessage() {
  function destroyAll() {
    window.$message?.destroyAll()
  }

  function create(content, option?) {
    window.$message?.create(content, option)
  }

  function error(content, option?) {
    window.$message?.error(content, option)
  }

  function info(content, option?) {
    window.$message?.info(content, option)
  }

  function loading(content, option?) {
    window.$message?.loading(content, option)
  }

  function success(content, option?) {
    window.$message?.success(content, option)
  }

  function warning(content, option?) {
    window.$message?.warning(content, option)
  }

  return {
    destroyAll,
    create,
    error,
    info,
    loading,
    success,
    warning,
  }
}
