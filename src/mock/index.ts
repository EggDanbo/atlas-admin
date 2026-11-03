/**
 * 本地 mock 数据服务
 *
 * 该目录替代了原有的远程接口层：
 * - adapter.ts  拦截请求并返回本地数据
 * - engine.ts   请求分发与响应组装
 * - schema/     由视图代码提取的字段结构，用于生成表格列
 * - data/       中文词库与字段取值规则
 */
export { createLocalMockAdapter, localMockAdapter } from './adapter'
export { handleMockRequest } from './engine'
export { SYSTEM_ENUMS } from './data/enums'
export { buildColumns, resolveFields, resolveModuleDir } from './schema/columns'
