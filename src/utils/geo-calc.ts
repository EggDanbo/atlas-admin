/** 两点间的近似距离（米）：小范围下平面近似足够 */
export function distanceInMeters(aLng: number, aLat: number, bLng: number, bLat: number) {
  const rad = Math.PI / 180
  const x = (bLng - aLng) * rad * 6378137 * Math.cos(((aLat + bLat) / 2) * rad)
  const y = (bLat - aLat) * rad * 6378137
  return Math.sqrt(x * x + y * y)
}

/** 320 米 / 1.2 公里 */
export function formatDistance(meters: number) {
  if (meters < 1000)
    return `${meters} 米`
  return `${(meters / 1000).toFixed(1)} 公里`
}
