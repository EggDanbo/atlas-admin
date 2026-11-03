/**
 * 预加载基础数据
 * 确保应用启动时所需数据已就绪
 */
export async function setupPreloadData() {
  const { useAppInfoStoreWithOut } = await import('@/store/modules/appinfo')

  // 并行加载基础数据
  await Promise.all([
    useAppInfoStoreWithOut().asyncAppInfo(),
  ])
}
