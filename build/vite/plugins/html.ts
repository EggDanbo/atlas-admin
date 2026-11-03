import { createHtmlPlugin } from 'vite-plugin-html'
import { projectConfig } from '../../../src/config/index.ts'

export function htmlPlugin() {
  return createHtmlPlugin({
    /**
     * 压缩 html
     */
    minify: true,
    /**
     * 注入数据
     */
    inject: {
      data: {
        title: projectConfig.app.title,
        description: projectConfig.app.description,
        keywords: projectConfig.app.keywords,
      },
    },
  })
}
