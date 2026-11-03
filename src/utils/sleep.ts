/**
 *  模拟休眠
 * @param duration 休眠毫秒
 */
async function sleep(duration: number | undefined) {
  return new Promise<void>((resolve) => {
    const timeoutId = setTimeout(() => {
      clearTimeout(timeoutId)
      resolve()
    }, duration)
  })
}

export default sleep
