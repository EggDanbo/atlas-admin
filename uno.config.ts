import { presetWind3 } from '@unocss/preset-wind3'
import { defineConfig } from 'unocss'

export default defineConfig({
  // 预设：提供常用原子类，避免每次从零生成
  presets: [
    presetWind3(),
  ],
  content: {
    pipeline: {
      include: [
        /\.(vue|[jt]sx|[jt]s|html)($|\?)/,
      ],
      exclude: [
        // 系统和依赖目录（带特殊前缀，不会误匹配）
        /(^|[/\\])node_modules([/\\]|$)/,
        /(^|[/\\])\.git([/\\]|$)/,
        /(^|[/\\])\.claude([/\\]|$)/,
        /(^|[/\\])\.vscode([/\\]|$)/,
        /(^|[/\\])docs([/\\]|$)/,
        /(^|[/\\])dist([/\\]|$)/,
        /(^|[/\\])openspec([/\\]|$)/,
        /(^|[/\\])scripts([/\\]|$)/,
        /(^|[/\\])public([/\\]|$)/,
        /(^|[/\\])typings([/\\]|$)/,
        // 项目子目录（不含组件和页面的源码目录）
        /src[/\\]utils[/\\]/,
        /src[/\\]store[/\\]/,
        /src[/\\]directives[/\\]/,
        /src[/\\]config[/\\]/,
        /src[/\\]api[/\\]/,
        /src[/\\]assets[/\\]/,
        /src[/\\]hooks[/\\]/,
        /src[/\\]locales[/\\]/,
        /src[/\\]mock[/\\]/,
        /src[/\\]setups[/\\]/,
        // 构建产物和缓存
        /[/\\]\.output([/\\]|$)/,
        /[/\\]\.nuxt([/\\]|$)/,
        /[/\\]\.cache([/\\]|$)/,
        // 排除测试文件
        /\.(test|spec)\.(js|ts|vue)$/,
        // 排除样式文件本身
        /\.(css|scss|sass|less|stylus|postcss)($|\?)/,
        // 类型声明文件（用 $ 锚定结尾，安全）
        /\.d\.ts$/,
      ],
    },
  },
})
