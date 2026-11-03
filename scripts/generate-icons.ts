import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { getIcons } from '@iconify/utils'
import pc from 'picocolors'

/**
 * Iconify 图标生成脚本
 * 从 icons.config.json 读取配置并生成离线图标注册代码和类型定义
 */

interface IconConfig {
  version: string
  manual: {
    icons: string[]
    note: string
  }
  scanned: {
    icons: string[]
    lastScan: string
    note: string
  }
  discovered: {
    icons: string[]
    lastUpdate: string
    note: string
  }
  metadata: {
    totalIcons: number
    byCollection: Record<string, number>
  }
}

// 静态正则表达式 - 用于格式化 JSON 输出
const NEWLINE_REGEX = /\n/g

/**
 * 读取图标配置文件
 */
function readIconConfig(): IconConfig {
  const configPath = 'icons.config.json'

  if (!fs.existsSync(configPath)) {
    console.error(pc.red('[Icon Generator] 错误: icons.config.json 不存在'))
    console.error(pc.dim('请先运行 pnpm run icons:scan 生成配置文件'))
    process.exit(1)
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8')
    return JSON.parse(content)
  }
  catch (error) {
    console.error(pc.red('[Icon Generator] 错误: 无法解析 icons.config.json'))
    console.error(pc.dim(String(error)))
    process.exit(1)
  }
}

/**
 * 合并三区图标
 */
function mergeIcons(config: IconConfig): string[] {
  const allIcons = new Set<string>([
    ...config.manual.icons,
    ...config.scanned.icons,
    ...config.discovered.icons,
  ])

  return Array.from(allIcons).sort()
}

/**
 * 按图标集分组
 */
function groupIconsByCollection(icons: string[]) {
  const grouped: Record<string, string[]> = {}

  // 已知的有效图标集前缀
  const validPrefixes = new Set([
    'akar-icons',
    'ant-design',
    'basil',
    'bi',
    'bxs',
    'carbon',
    'ci',
    'circle-flags',
    'clarity',
    'codicon',
    'cuida',
    'devicon',
    'eos-icons',
    'ep',
    'eva',
    'f7',
    'fa6-solid',
    'fa7-solid',
    'famicons',
    'flowbite',
    'fluent',
    'formkit',
    'gala',
    'gg',
    'gravity-ui',
    'gridicons',
    'healthicons',
    'heroicons-solid',
    'hugeicons',
    'humbleicons',
    'ic',
    'icon-park-outline',
    'iconamoon',
    'iconoir',
    'ion',
    'ix',
    'la',
    'line-md',
    'logos',
    'lsicon',
    'lucide',
    'majesticons',
    'material-symbols-light',
    'material-symbols',
    'mdi',
    'mingcute',
    'mynaui',
    'noto-v1',
    'nrk',
    'oi',
    'pajamas',
    'pixelarticons',
    'prime',
    'proicons',
    'qlementine-icons',
    'radix-icons',
    'ri',
    'simple-line-icons',
    'solar',
    'stash',
    'streamline-ultimate',
    'streamline',
    'tabler',
    'tdesign',
    'uil',
    'uim',
    'vaadin',
    'vscode-icons',
  ])

  for (const icon of icons) {
    const [prefix, name] = icon.split(':')

    // 跳过本地图标
    if (prefix === 'local') {
      continue
    }

    // 跳过无效前缀
    if (!validPrefixes.has(prefix)) {
      continue
    }

    if (!grouped[prefix]) {
      grouped[prefix] = []
    }
    grouped[prefix].push(name)
  }

  // 排序每个图标集中的图标
  for (const prefix in grouped) {
    grouped[prefix].sort()
  }

  return grouped
}

/**
 * 生成离线图标注册代码
 */
function generateOfflineIconsCode(icons: string[], grouped: Record<string, string[]>) {
  const registrations: string[] = []

  for (const [prefix, names] of Object.entries(grouped)) {
    const iconifyJsonPath = `node_modules/@iconify/json/json/${prefix}.json`
    let iconData: any

    try {
      iconData = JSON.parse(fs.readFileSync(iconifyJsonPath, 'utf-8'))
    }
    catch {
      console.warn(pc.yellow(`[Icon Generator] 警告: 无法读取 ${iconifyJsonPath}`))
      continue
    }

    // 使用 getIcons() 自动处理别名和提取图标
    const iconSet = getIcons(iconData, names, true)

    if (!iconSet || Object.keys(iconSet.icons || {}).length === 0) {
      continue
    }

    // 检查未找到的图标
    if (iconSet.not_found && iconSet.not_found.length > 0) {
      console.warn(pc.yellow(`[Icon Generator] 警告: ${prefix} 中未找到图标: ${iconSet.not_found.join(', ')}`))
    }

    const { width = 24, height = 24, icons: collectedIcons } = iconSet

    // 手动添加别名映射
    const { aliases = {} } = iconData
    for (const name of names) {
      if (aliases[name] && !collectedIcons[name]) {
        const parent = aliases[name].parent
        if (collectedIcons[parent]) {
          collectedIcons[name] = collectedIcons[parent]
        }
      }
    }

    registrations.push(`// ${prefix} - ${Object.keys(collectedIcons).length} 个图标`)
    registrations.push(`addCollection({`)
    registrations.push(`  prefix: '${prefix}',`)
    registrations.push(`  icons: ${JSON.stringify(collectedIcons, null, 2).replace(NEWLINE_REGEX, '\n  ')},`)
    registrations.push(`  width: ${width},`)
    registrations.push(`  height: ${height},`)
    registrations.push(`})`)
    registrations.push(``)
  }

  const totalIcons = icons.length
  const timestamp = new Date().toISOString()

  return `/**
 * Iconify 离线图标注册
 * 自动生成，请勿手动修改
 * 生成时间: ${timestamp}
 * 图标总数: ${totalIcons}
 */

import { addCollection } from '@iconify/vue'

// 注册图标集
${registrations.join('\n')}

// 开发模式下输出注册日志
if (import.meta.env.DEV) {
  console.log('[Iconify] 已注册 ${totalIcons} 个离线图标')
}

export const iconifyOfflineReady = true
`
}

/**
 * 生成类型定义文件
 */
function generateIconTypesCode(icons: string[]) {
  const iconType = icons.map(i => `'${i}'`).join('\n  | ')

  return `/**
 * Iconify 图标类型
 * 自动生成，请勿手动修改
 * 生成时间: ${new Date().toISOString()}
 * 图标总数: ${icons.length}
 */

/**
 * 所有可用的图标名称
 */
export type IconifyIcon =
  ${iconType}

/**
 * 图标名称常量数组
 */
export const ICON_NAMES: IconifyIcon[] = [
  ${icons.map(i => `'${i}',`).join('\n  ')}
] as const

/**
 * 检查图标名称是否有效
 */
export function isValidIcon(icon: string): icon is IconifyIcon {
  return ICON_NAMES.includes(icon as IconifyIcon)
}
`
}

/**
 * 主函数
 */
async function main() {
  console.log(pc.cyan('[Icon Generator] 开始生成...\n'))

  // 读取配置
  const config = readIconConfig()
  console.log(pc.dim(`[Icon Generator] 配置版本: ${config.version}`))

  // 合并三区图标
  const icons = mergeIcons(config)
  console.log(pc.green(`[Icon Generator] 合并图标: ${icons.length} 个\n`))

  console.log(pc.dim('  来源统计:'))
  console.log(pc.dim(`    manual: ${config.manual.icons.length} 个`))
  console.log(pc.dim(`    scanned: ${config.scanned.icons.length} 个`))
  console.log(pc.dim(`    discovered: ${config.discovered.icons.length} 个`))
  console.log('')

  // 按图标集分组
  const grouped = groupIconsByCollection(icons)

  // 重建有效图标列表
  const validIcons: string[] = []
  for (const [prefix, names] of Object.entries(grouped)) {
    for (const name of names) {
      validIcons.push(`${prefix}:${name}`)
    }
  }
  validIcons.sort()

  console.log(pc.cyan('[Icon Generator] 图标集分组统计:'))
  for (const [prefix, names] of Object.entries(grouped)) {
    console.log(pc.dim(`  ${prefix}: ${names.length} 个图标`))
  }
  console.log('')

  // 生成输出目录
  const outputDir = 'src/utils'
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // 生成离线图标注册文件
  const offlineIconsCode = generateOfflineIconsCode(validIcons, grouped)
  const offlineIconsPath = path.join(outputDir, 'iconify-offline.ts')
  fs.writeFileSync(offlineIconsPath, offlineIconsCode, 'utf-8')
  console.log(pc.green(`[Icon Generator] 已生成: ${offlineIconsPath}`))

  // 生成类型定义文件
  const iconTypesCode = generateIconTypesCode(validIcons)
  const iconTypesPath = path.join(outputDir, 'iconify.types.ts')
  fs.writeFileSync(iconTypesPath, iconTypesCode, 'utf-8')
  console.log(pc.green(`[Icon Generator] 已生成: ${iconTypesPath}`))

  console.log(pc.green('\n[Icon Generator] ✅ 生成完成!'))
}

main().catch((error) => {
  console.error(pc.red('[Icon Generator] 错误:'), error)
  process.exit(1)
})
