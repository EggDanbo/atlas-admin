import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import pc from 'picocolors'

/**
 * 构建报告插件
 */
export default function buildReporterPlugin(): Plugin {
  let startTime: Date | null = null
  return {
    name: 'vite-build-reporter',
    apply: 'build',
    // 记录构建开始时间
    buildStart() {
      startTime = new Date()
      console.log(pc.cyan(pc.bold('🚀 开始构建...')))
    },
    // 在构建结束时生成报告
    async closeBundle() {
      if (!startTime)
        return
      const endTime = new Date()
      console.log()
      console.log(pc.bgBlue(pc.white('📊 构建报告')))
      console.log()
      console.log(`  ${pc.blue('🕒 开始时间:')} ${pc.cyan(formatDateTime(startTime))}`)
      console.log(`  ${pc.blue('🏁 结束时间:')} ${pc.cyan(formatDateTime(endTime))}`)
      console.log(`  ${pc.blue('📁 输出目录:')} ${pc.cyan('dist/')}`)
      try {
        // 获取构建统计信息
        const stats = await getBuildStats()
        console.log(`  ${pc.blue('📦 打包文件:')} ${pc.cyan(`${stats.fileCount} 个文件`)}`)
        console.log(`  ${pc.blue('📏 总大小:')}   ${pc.cyan(stats.totalSize)}`)
      }
      catch (error: any) {
        // 处理统计失败的情况
        console.log(`  ${pc.red('⚠️ 文件统计失败:')} ${pc.yellow(error.message)}`)
      }
      // 分隔线
      console.log()
      console.log(pc.gray('─'.repeat(40)))
      // 完成提示
      console.log()
      console.log(pc.bgGreen(pc.white('✅ 构建完成')))
      console.log()
    },
  }
}

// 安全获取构建统计信息
async function getBuildStats() {
  const distPath = path.resolve('./dist')
  // 检查目录是否存在
  if (!fs.existsSync(distPath)) {
    throw new Error('构建目录不存在')
  }
  return calculateDirectoryStats(distPath)
}

// 修正递归统计函数
async function calculateDirectoryStats(dirPath: string): Promise<{
  fileCount: number
  totalSize: string
}> {
  let fileCount = 0
  let totalBytes = 0
  try {
    // 读取目录内容
    const items = fs.readdirSync(dirPath)
    for (const item of items) {
      const fullPath = path.join(dirPath, item)
      try {
        const stats = fs.statSync(fullPath)
        if (stats.isDirectory()) {
          // 递归统计子目录
          const subStats = await calculateDirectoryStats(fullPath)
          fileCount += subStats.fileCount
          // 直接使用子目录的总字节数（从文件大小中获取）
          totalBytes += Number.parseFloat(subStats.totalSize) * 1024 * 1024
        }
        else {
          // 统计文件
          fileCount++
          totalBytes += stats.size
        }
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (accessError) {
        // 跳过无法访问的文件
      }
    }
  }
  catch (readDirError) {
    // 处理目录读取错误
    throw new Error(`无法读取构建目录: ${(readDirError as Error).message}`)
  }
  return {
    fileCount,
    totalSize: `${(totalBytes / 1024 / 1024).toFixed(2)} MB`,
  }
}

// 简化日期时间格式化
function formatDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
