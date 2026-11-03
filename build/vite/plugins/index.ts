import type { ConfigEnv, Plugin, PluginOption } from 'vite'
import type { ViteEnv } from '../../../typings/config'
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileViewerRenderers } from '@file-viewer/vite-plugin'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { ProNaiveUIResolver } from 'pro-naive-ui-resolver'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'

import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

import Components from 'unplugin-vue-components/vite'
import removeNoMatch from 'vite-plugin-router-warn'

import buildReporter from './build-reporter.ts'

import { compressPlugin } from './compress.ts'
import { htmlPlugin } from './html.ts'
import { iconTrackerPlugin } from './icon-tracker.ts'
import { configVisualizerPlugin } from './visualizer.ts'
import { configVxeTableStyleImportPlugin } from './vxeTable.ts'

// 静态正则表达式 - 用于 AutoImport 的文件匹配
const AUTO_IMPORT_INCLUDE_REGEX = /\.[tj]sx?$/

/** file-viewer 插件生成的产物目录/文件（gitignore 已覆盖），dev 重拷前、build 收尾时清理 */
const FILE_VIEWER_GENERATED_TARGETS = ['vendor', 'wasm', 'flyfish-viewer-assets.json', 'flyfish-viewer-manifest.json']

/**
 * 构建后清理：dev 模式下 file-viewer 插件会向 public/ 写入 worker/wasm 运行时资源，
 * publicDir 复制会把它们带进构建产物；生产预览走独立 file-viewer 服务，产物不需要这些。
 */
function cleanFileViewerPublicAssets(): Plugin {
  let outDir = 'dist'
  let root = '.'
  return {
    name: 'clean-file-viewer-public-assets',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
      root = config.root
    },
    closeBundle() {
      // 清理属于收尾优化：失败不应中断构建（某些沙箱/只读文件系统会拒绝批量删除）
      for (const target of FILE_VIEWER_GENERATED_TARGETS) {
        try {
          rmSync(resolve(root, outDir, target), { recursive: true, force: true })
        }
        catch (error) {
          console.warn(`[clean-file-viewer-public-assets] 跳过清理 ${target}:`, (error as Error)?.message)
        }
      }
    },
  }
}
const AUTO_IMPORT_VUE_REGEX = /\.vue$/
const AUTO_IMPORT_VUE_QUERY_REGEX = /\.vue\?vue/
const AUTO_IMPORT_MD_REGEX = /\.md$/

/**
 * dev 启动前清理上次生成的 file-viewer 资源：@file-viewer/assets-* 资源包升级后文件内容变化，
 * 插件对已存在且内容不同的目标会报 "Asset owners conflict"，必须先清掉旧产物再重新拷贝。
 */
function cleanStaleFileViewerDevAssets(): Plugin {
  return {
    name: 'clean-stale-file-viewer-dev-assets',
    apply: 'serve',
    configResolved(config) {
      for (const target of FILE_VIEWER_GENERATED_TARGETS) {
        // 清理失败不应中断 dev / preview 启动（某些沙箱或只读文件系统会拒绝批量删除）
        try {
          rmSync(resolve(config.root, config.publicDir, target), { recursive: true, force: true })
        }
        catch (error) {
          console.warn(`[clean-stale-file-viewer-dev-assets] 跳过清理 ${target}:`, (error as Error)?.message)
        }
      }
    },
  }
}

export function createPlugins(_viteEnv: ViteEnv, isBuild: boolean, _configEnv: ConfigEnv) {
  const { VITE_BUILD_COMPRESS, VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE } = _viteEnv

  const vitePlugins: (PluginOption | PluginOption[])[] = [
    // DevTools
    // devTools(),
    // Vue
    vue({
      script: {
        defineModel: true,
      },
      template: {
        compilerOptions: {
          // 告诉 Vue 这些是自定义元素（Web Components），不需要编译
          isCustomElement: tag => tag.startsWith('cropper-'),
        },
      },
    }),
    // html
    htmlPlugin(),
    // UnoCss
    UnoCSS(),
    // Jsx
    vueJsx(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core',
        {
          'naive-ui': [
            'useDialog',
            'useMessage',
            'useNotification',
            'useLoadingBar',
          ],
        },
      ],
      include: [
        AUTO_IMPORT_INCLUDE_REGEX,
        AUTO_IMPORT_VUE_REGEX,
        AUTO_IMPORT_VUE_QUERY_REGEX,
        AUTO_IMPORT_MD_REGEX,
      ],
      dts: 'src/typings/auto-imports.d.ts',
    }),
    Components({
      resolvers: [NaiveUiResolver(), ProNaiveUIResolver()],
      dirs: [],
      dts: 'typings/components.d.ts',
    }),
    // 移除非必要的vue-router动态路由警告: No match found for location with path
    removeNoMatch(),
    // 构建报告
    buildReporter(),
    // 清理被 publicDir 复制进产物的 file-viewer dev 资源（vendor/wasm）
    cleanFileViewerPublicAssets(),
  ]

  // 图标监察中间件（仅开发模式）
  if (!isBuild) {
    vitePlugins.push(iconTrackerPlugin())
    // 先清掉上次 dev 拷贝的旧资源，避免资源包升级后 "Asset owners conflict"
    vitePlugins.push(cleanStaleFileViewerDevAssets())
    // file-viewer：复制 worker/wasm 离线资源，renderer 由预览页显式装配
    // 仅开发模式需要（内置预览页只在 dev 启用）；生产走独立 file-viewer 服务，产物不携带这些资源
    // formats 显式收敛拷贝范围（pdf/docx/pptx/xlsx），资源来自 @file-viewer/assets-standard；
    // 不给 formats 会自动发现 office preset，连带要求 assets-ppt/iwork/wordperfect/hangul 等资源包
    vitePlugins.push(fileViewerRenderers({ copyAssets: true, formats: ['pdf', 'docx', 'pptx', 'xlsx'] }))
  }

  // 打包分析报告
  vitePlugins.push(configVisualizerPlugin())
  // VxeTable 样式按需导入
  vitePlugins.push(configVxeTableStyleImportPlugin())

  if (isBuild) {
    // 压缩插件
    vitePlugins.push(
      compressPlugin(VITE_BUILD_COMPRESS, VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE),
    )
  }

  return vitePlugins
}
