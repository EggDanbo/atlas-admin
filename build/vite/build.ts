import type { BuildOptions } from 'vite'

// 静态正则表达式 - 用于代码分割匹配
// 注意：@vue/* 必须与 vue 同组，naive-ui 的卫星包必须与 naive-ui 同组——
// 漏掉会把这些模块留给自动分 chunk，曾产生 vendor→helper→lodash-es→naive-ui→vendor
// 的循环 chunk 依赖，浏览器按特定顺序加载即抛 "e is not a function"
const VENDOR_REGEX = /node_modules[\\/](@vue|vue|vue-router|pinia)[\\/]/
const NAIVE_UI_REGEX = /node_modules[\\/](naive-ui|vueuc|vooks|vdirs|seemly|evtd|css-render|@css-render|treeshaking|async-validator)[\\/]/
const ECHARTS_REGEX = /node_modules[\\/]echarts[\\/]/
// lodash-es 不再单独分组（见下方 groups 内注释），正则一并停用
// const LODASH_ES_REGEX = /node_modules[\\/]lodash-es[\\/]/
const VUEUSE_REGEX = /node_modules[\\/]@vueuse[\\/]/
const ICONIFY_REGEX = /node_modules[\\/]@iconify[\\/]/
const VUE_DRAGGABLE_REGEX = /node_modules[\\/]vue-draggable-plus[\\/]/
const UNO_STYLES_REGEX = /virtual:uno\.css/

/**
 * 创建 Vite 构建配置对象
 * 该函数无参数，返回一个符合 Vite 构建需求的配置对象。
 * 配置对象包括了诸如目标环境设置、输出目录、CSS 相关配置、source map 设置等。
 * @returns {BuildOptions} 返回一个包含构建配置的对象。
 */
export function createBuild(_viteEnv?: ViteEnv): BuildOptions {
  // const { VITE_DROP_CONSOLE } = _viteEnv

  return {
    // 输出目录
    outDir: 'dist',
    // 启用/禁用 CSS 代码拆分
    cssCodeSplit: true,
    // 构建生成 source map 文件。
    sourcemap: false,
    // Vite 8 使用 rolldown，配置从 rollupOptions 改为 rolldownOptions
    rolldownOptions: {
      output: {
        minify: {
          compress: {
            dropConsole: Boolean(import.meta.env?.VITE_DROP_CONSOLE),
            dropDebugger: true,
          },
        },
        codeSplitting: {
          groups: [
            // Vue 核心库
            {
              name: 'vendor',
              test: VENDOR_REGEX,
              priority: 20,
            },
            // UI 组件库
            {
              name: 'naive-ui',
              test: NAIVE_UI_REGEX,
              priority: 15,
            },
            // 图表库
            {
              name: 'echarts',
              test: ECHARTS_REGEX,
              priority: 15,
            },
            // 工具库
            // lodash-es 不单独分组：rolldown 1.2.4 会把 lodash 拆进 naive-ui chunk，
            // 制造 lodash-es→naive-ui→vendor→helper→lodash-es 的循环 chunk 依赖，
            // 浏览器按特定顺序加载即抛 "e is not a function"（vendor-BP6eXYTB.js:4）
            // {
            //   name: 'lodash-es',
            //   test: LODASH_ES_REGEX,
            //   priority: 10,
            // },
            {
              name: 'vueuse',
              test: VUEUSE_REGEX,
              priority: 10,
            },
            // 图标库
            {
              name: 'iconify',
              test: ICONIFY_REGEX,
              priority: 10,
            },
            // 拖拽库
            {
              name: 'vue-draggable-plus',
              test: VUE_DRAGGABLE_REGEX,
              priority: 10,
            },
            {
              name: 'uno-styles',
              test: UNO_STYLES_REGEX,
              priority: 10,
            },
          ],
        },
      },
    },
    reportCompressedSize: false,
    // chunk 大小警告的限制（以 kbs 为单位）
    chunkSizeWarningLimit: 2000,
  }
}
