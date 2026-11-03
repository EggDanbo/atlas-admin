// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    '.claude/**',
    '.vscode/**',
    'openspec/**',
    'dist/**',
    '**/*.md',
    // 由 scripts/mock/extract-schema.mjs 生成的产物，不做风格约束
    'src/mock/schema/schema.generated.ts',
  ],
  // 禁用编辑器检测，确保所有规则都生效
  isInEditor: false,
  stylistic: {
    indent: 2, // 4, or 'tab'
    quotes: 'single', // or 'double'
  },
  vue: {
    overrides: {
      // enforce order of component top-level elements 自定义 Vue 文件中标签的顺序，脚本  -> 模板 -> 样式
      'vue/block-order': [
        'error',
        {
          order: ['script', 'template', 'style'],
        },
      ],
      // 强制执行每个组件都应该在自己的文件中
      'vue/one-component-per-file': 'off',
      'vue/custom-event-name-casing': 'off',
    },
  },
  typescript: true,
  jsonc: true,
  yaml: false,
  unocss: true,
  formatters: {
    css: true,
    html: true,
    markdown: 'prettier',
  },
  rules: {
    'dot-notation': 'off',
    'no-console': 'off',
    'no-useless-call': 'off',
    'perfectionist/sort-exports': 'off',
    // 仅在 .vue 文件中启用此规则，避免在 .md 等文件中报错
    'vue/operator-linebreak': 'off',
    'max-lines': 'off',
    'max-lines-per-function': 'off',
    'max-statements': 'off',
  },
}, {
  // mock 引擎以「接口路径正则分发」为核心，捕获组仅用于匹配、不取分组值，
  // 这里关闭两条只影响书写风格的 regexp 规则
  files: ['src/mock/**/*.ts'],
  rules: {
    'regexp/no-unused-capturing-group': 'off',
    'regexp/no-useless-assertions': 'off',
  },
})
