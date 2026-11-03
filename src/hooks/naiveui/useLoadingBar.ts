export function useLoadingBar() {
  function start() {
    window.$loadingBar?.start()
  }

  function error() {
    window.$loadingBar?.error()
  }

  function finish() {
    window.$loadingBar?.finish()
  }

  return {
    start,
    error,
    finish,
  }
}
