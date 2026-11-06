import fs from 'node:fs'
import process from 'node:process'
import fastGlob from 'fast-glob'
import pc from 'picocolors'

/**
 * Iconify 图标扫描脚本
 * 扫描项目中使用的图标并更新 icons.config.json 配置文件
 */

// 图标名称识别模式
const ICON_PATTERNS = [
  /icon\s*[:=]\s*['"`]([a-z0-9-]+:[a-z0-9-]+)['"`]/gi,
  /icon:\s*['"`]([a-z0-9-]+:[a-z0-9-]+)['"`]/gi,
  /createIcon\(['"`]([a-z0-9-]+:[a-z0-9-]+)['"`]/gi,
  /\?\s*['"`]([a-z0-9-]+:[a-z0-9-]+)['"`]/gi,
  /:\s*['"`]([a-z0-9-]+:[a-z0-9-]+)['"`](?!\s*\/\/)/gi,
]

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

/**
 * 读取或创建图标配置文件
 */
function readOrCreateConfig(): IconConfig {
  const configPath = 'icons.config.json'

  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf-8')
      return JSON.parse(content)
    }
    catch (error) {
      console.error(pc.red('[Icon Scanner] 错误: 无法解析 icons.config.json'))
      console.error(pc.dim(String(error)))
      process.exit(1)
    }
  }

  // 创建空配置
  console.log(pc.green('[Icon Scanner] 已创建 icons.config.json'))
  return {
    version: '1.0.0',
    manual: {
      icons: [],
      note: '手动添加的图标，不会被自动修改',
    },
    scanned: {
      icons: [],
      lastScan: '',
      note: '扫描发现的图标，每次扫描会更新',
    },
    discovered: {
      icons: [],
      lastUpdate: '',
      note: '开发时发现的新图标，会自动保存',
    },
    metadata: {
      totalIcons: 0,
      byCollection: {},
    },
  }
}

/**
 * 保存配置文件
 */
function saveConfig(config: IconConfig) {
  const configPath = 'icons.config.json'
  // 末尾补换行，与仓库里其它文本文件保持一致（lint 的 eol-last）
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf-8')
}

/**
 * 扫描项目文件中的图标使用
 */
async function scanIcons(sourceDir = 'src') {
  console.log(pc.cyan('[Icon Scanner] 扫描项目文件...'))

  const files = await fastGlob(`${sourceDir}/**/*.{vue,ts,js}`, {
    absolute: false,
    onlyFiles: true,
  })

  console.log(pc.dim(`[Icon Scanner] 找到 ${files.length} 个文件`))

  const iconSet = new Set<string>()

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')

    for (const pattern of ICON_PATTERNS) {
      const matches = content.matchAll(pattern)
      for (const match of matches) {
        if (match[1]) {
          iconSet.add(match[1])
        }
      }
    }
  }

  return Array.from(iconSet).sort()
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
    'local',
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
 * 自动清理 discovered 区域
 */
function cleanupDiscovered(config: IconConfig): number {
  const knownIcons = new Set([
    ...config.manual.icons,
    ...config.scanned.icons,
  ])

  const before = config.discovered.icons.length
  config.discovered.icons = config.discovered.icons.filter(
    icon => !knownIcons.has(icon),
  )
  const after = config.discovered.icons.length

  const cleaned = before - after

  if (cleaned > 0) {
    config.discovered.lastUpdate = new Date().toISOString()
    console.log(pc.yellow(`[Icon Scanner] 已清理 ${cleaned} 个图标从 discovered 区`))
  }

  return cleaned
}

/**
 * 更新 metadata
 */
function updateMetadata(config: IconConfig) {
  // 合并所有图标
  const allIcons = new Set([
    ...config.manual.icons,
    ...config.scanned.icons,
    ...config.discovered.icons,
  ])

  config.metadata.totalIcons = allIcons.size

  // 按图标集统计
  const byCollection: Record<string, number> = {}
  for (const icon of allIcons) {
    const [prefix] = icon.split(':')
    if (prefix === 'local')
      continue
    byCollection[prefix] = (byCollection[prefix] || 0) + 1
  }

  config.metadata.byCollection = byCollection
}

/**
 * 主函数
 */
async function main() {
  console.log(pc.cyan('[Icon Scanner] 开始扫描...\n'))

  // 读取或创建配置
  const config = readOrCreateConfig()

  // 扫描图标
  const icons = await scanIcons()
  console.log(pc.green(`[Icon Scanner] 找到 ${icons.length} 个不同的图标\n`))

  // 按图标集分组
  const grouped = groupIconsByCollection(icons)

  // 从分组中重建有效的图标列表
  const validIcons: string[] = []
  for (const [prefix, names] of Object.entries(grouped)) {
    for (const name of names) {
      validIcons.push(`${prefix}:${name}`)
    }
  }
  validIcons.sort()

  console.log(pc.cyan('[Icon Scanner] 图标集分组统计:'))
  for (const [prefix, names] of Object.entries(grouped)) {
    console.log(pc.dim(`  ${prefix}: ${names.length} 个图标`))
  }
  console.log('')

  // 更新 scanned 区域
  config.scanned.icons = validIcons
  config.scanned.lastScan = new Date().toISOString()

  // 自动清理 discovered 区域
  cleanupDiscovered(config)

  // 更新 metadata
  updateMetadata(config)

  // 保存配置
  saveConfig(config)

  console.log(pc.green('[Icon Scanner] 已更新 icons.config.json'))
  console.log(pc.dim(`  manual: ${config.manual.icons.length} 个`))
  console.log(pc.dim(`  scanned: ${config.scanned.icons.length} 个`))
  console.log(pc.dim(`  discovered: ${config.discovered.icons.length} 个`))
  console.log(pc.dim(`  总计: ${config.metadata.totalIcons} 个`))

  console.log(pc.green('\n[Icon Scanner] ✅ 扫描完成!'))
  console.log(pc.dim('提示: 运行 pnpm run icons:generate 生成图标文件'))
}

main().catch((error) => {
  console.error(pc.red('[Icon Scanner] 错误:'), error)
  process.exit(1)
})
