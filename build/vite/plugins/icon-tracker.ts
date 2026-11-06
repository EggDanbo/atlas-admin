import type { Plugin } from 'vite'
import fs from 'node:fs'

/**
 * 图标监察中间件插件
 * 提供两个 API：
 * - GET /api/icons/config - 读取图标配置文件
 * - POST /api/icons/discovered - 记录运行时发现的新图标
 */
export function iconTrackerPlugin(): Plugin {
  return {
    name: 'icon-tracker-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // GET /api/icons/config - 读取配置文件
        if (req.url === '/api/icons/config' && req.method === 'GET') {
          try {
            const configPath = 'icons.config.json'
            if (!fs.existsSync(configPath)) {
              res.statusCode = 404
              res.end(JSON.stringify({ error: 'Config file not found' }))
              return
            }

            const config = fs.readFileSync(configPath, 'utf-8')
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(config)
          }
          catch (error) {
            console.error('[Icon Config] 读取错误:', error)
            res.statusCode = 500
            res.end(JSON.stringify({ error: String(error) }))
          }
        }
        // POST /api/icons/discovered - 记录新发现的图标
        else if (req.url === '/api/icons/discovered' && req.method === 'POST') {
          try {
            // 读取请求体
            let body = ''
            req.on('data', (chunk) => {
              body += chunk.toString()
            })
            req.on('end', () => {
              try {
                const { icon } = JSON.parse(body)

                // 读取配置文件
                const configPath = 'icons.config.json'
                if (!fs.existsSync(configPath)) {
                  res.statusCode = 500
                  res.end(JSON.stringify({ success: false, error: 'Config file not found' }))
                  return
                }

                const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

                // 添加到 discovered 区域（去重）
                if (!config.discovered.icons.includes(icon)) {
                  config.discovered.icons.push(icon)
                  config.discovered.icons.sort()
                  config.discovered.lastUpdate = new Date().toISOString()

                  // 更新 metadata
                  const allIcons = new Set([
                    ...config.manual.icons,
                    ...config.scanned.icons,
                    ...config.discovered.icons,
                  ])
                  config.metadata.totalIcons = allIcons.size

                  // 保存配置
                  // 末尾补换行：这个文件被 git 跟踪，缺 eol 每次都会让 lint 报错
                  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf-8')
                  console.log(`[Icon Discovery] 记录新图标: ${icon}`)
                }

                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true }))
              }
              catch (error) {
                console.error('[Icon Discovery] 处理错误:', error)
                res.statusCode = 500
                res.end(JSON.stringify({ success: false, error: String(error) }))
              }
            })
          }
          catch (error) {
            console.error('[Icon Discovery] 中间件错误:', error)
            res.statusCode = 500
            res.end(JSON.stringify({ success: false, error: String(error) }))
          }
        }
        else {
          next()
        }
      })
    },
  }
}
