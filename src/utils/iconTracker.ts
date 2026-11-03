/**
 * 图标使用监察器（仅开发模式）
 * 实时监测图标使用并自动记录到 discovered 区域
 */

// 内存去重 Set
const discoveredIcons = new Set<string>()
const printedIcons = new Set<string>()

// 已知图标集合（从配置文件加载，避免重复打印）
const knownIcons = new Set<string>()

// 初始化状态标志
let isInitialized = false
const initPromise: Promise<void> = (async () => {
  try {
    const response = await fetch('/api/icons/config')
    if (response.ok) {
      const config = await response.json()
      // 合并 manual 和 scanned 区域的图标
      const allKnown = [
        ...(config.manual?.icons || []),
        ...(config.scanned?.icons || []),
      ]
      allKnown.forEach(icon => knownIcons.add(icon))
      console.log(
        '%c[Icon Tracker] ✓ 已加载 %c%d%c 个已知图标',
        'color: #6b7280; font-size: 12px',
        'color: #3b82f6; font-weight: bold',
        knownIcons.size,
        'color: #6b7280',
      )
    }
    else {
      console.warn('[Icon Tracker] 配置加载失败:', response.status)
    }
  }
  catch (error) {
    console.warn('[Icon Tracker] 无法加载已知图标配置', error)
  }
  finally {
    isInitialized = true
  }
})()

/**
 * 初始化：加载已知图标（内部使用）
 */
async function initKnownIcons() {
  knownIcons.clear()
  isInitialized = false
  return initPromise
}

/**
 * 记录图标使用
 */
export function recordIconUsage(icon: string, source: string) {
  // 等待初始化完成后再处理
  if (!isInitialized) {
    // 初始化完成后重新检查
    initPromise.then(() => {
      // 递归调用，此时 isInitialized 为 true
      if (isInitialized && !knownIcons.has(icon) && !discoveredIcons.has(icon)) {
        recordIconUsage(icon, source)
      }
    })
    return
  }

  // 跳过已知图标（已在 manual 或 scanned 中）
  if (knownIcons.has(icon)) {
    return
  }

  // 首次发现该图标
  if (!discoveredIcons.has(icon)) {
    discoveredIcons.add(icon)

    // 输出美化的控制台日志（仅首次）
    if (!printedIcons.has(icon)) {
      printedIcons.add(icon)
      console.group(
        '%c[Icon Tracker] 🆕 新图标发现',
        'color: #f59e0b; font-weight: bold; font-size: 14px',
      )
      console.log(
        `%c图标:%c ${icon}`,
        'color: #6b7280',
        'color: #3b82f6; font-weight: bold',
      )
      console.log(
        `%c来源:%c ${source}`,
        'color: #6b7280',
        'color: #10b981',
      )
      console.groupEnd()
    }

    // 持久化到 Vite 中间件
    persistToConfig(icon).catch((error) => {
      console.warn(
        '%c[Icon Tracker] 持久化失败，下次扫描时将记录',
        'color: #f59e0b',
        error,
      )
    })
  }
}

/**
 * 持久化图标到配置文件（通过 Vite 中间件）
 */
async function persistToConfig(icon: string) {
  const response = await fetch('/api/icons/discovered', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ icon }),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
}

/**
 * 输出会话摘要
 */
function printSessionSummary() {
  if (discoveredIcons.size === 0) {
    return
  }

  console.group(
    '%c[Icon Tracker] 📊 会话摘要',
    'color: #10b981; font-weight: bold; font-size: 14px',
  )
  console.log(
    `%c本次会话发现:%c ${discoveredIcons.size} 个图标`,
    'color: #6b7280',
    'color: #3b82f6; font-weight: bold',
  )

  // 按图标集分组显示
  const byCollection: Record<string, string[]> = {}
  for (const icon of discoveredIcons) {
    const [prefix] = icon.split(':')
    if (!byCollection[prefix]) {
      byCollection[prefix] = []
    }
    byCollection[prefix].push(icon)
  }

  console.log('%c图标列表:', 'color: #6b7280')
  for (const [prefix, icons] of Object.entries(byCollection)) {
    console.log(`%c  ${prefix}:%c ${icons.join(', ')}`, 'color: #6b7280', 'color: #3b82f6')
  }

  console.groupEnd()
}

/**
 * 开发工具 API
 */
export const iconTrackerAPI = {
  /**
   * 获取本次会话发现的图标
   */
  getDiscovered() {
    return Array.from(discoveredIcons)
  },

  /**
   * 获取已知图标数量
   */
  getKnownCount() {
    return knownIcons.size
  },

  /**
   * 重新加载已知图标
   */
  async reloadKnown() {
    knownIcons.clear()
    await initKnownIcons()
  },

  /**
   * 清空会话记录（保留已知图标）
   */
  clearSession() {
    discoveredIcons.clear()
    printedIcons.clear()
    console.log('%c[Icon Tracker] 会话记录已清空', 'color: #10b981')
  },

  /**
   * 手动打印摘要
   */
  printSummary() {
    printSessionSummary()
  },
}

// 页面卸载时输出摘要
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    printSessionSummary()
  })

  // 暴露开发工具 API
  ;(window as any).__iconTracker = iconTrackerAPI
}
