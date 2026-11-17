/**
 * 预置地点库
 *
 * 演示项目没有后端逆地理编码服务，点击地图后按「最近地标」给结果：
 * 每个地点带一句介绍，点完就能看出选的是哪儿，不用再去查。
 * 坐标是各地点大致的经纬度（GCJ-02，与高德瓦片一致）。
 */
export interface Landmark {
  id: string
  name: string
  address: string
  intro: string
  category: string
  lng: number
  lat: number
}

export const LANDMARKS: Landmark[] = [
  {
    id: 'gugong',
    name: '故宫博物院',
    address: '北京市东城区景山前街 4 号',
    intro: '明清两代皇家宫殿建筑群，现存规模最大的木质结构古建筑群，馆藏文物逾 186 万件。',
    category: '景区',
    lng: 116.397,
    lat: 39.9163,
  },
  {
    id: 'tiananmen',
    name: '天安门广场',
    address: '北京市东城区东长安街',
    intro: '南北长 880 米、东西宽 500 米，是世界上最大的城市广场之一，周边为国家级礼仪场所。',
    category: '地标',
    lng: 116.3975,
    lat: 39.9087,
  },
  {
    id: 'wangfujing',
    name: '王府井大街',
    address: '北京市东城区王府井大街',
    intro: '百年商业街，百货、老字号与写字楼混布，工作日午间人流集中。',
    category: '商圈',
    lng: 116.4109,
    lat: 39.915,
  },
  {
    id: 'nanluoguxiang',
    name: '南锣鼓巷',
    address: '北京市东城区南锣鼓巷',
    intro: '元代格局保留完整的胡同街区，两侧多为四合院院落。',
    category: '街区',
    lng: 116.4033,
    lat: 39.9375,
  },
  {
    id: 'sanlitun',
    name: '三里屯太古里',
    address: '北京市朝阳区三里屯路 19 号',
    intro: '开放式商业街区，餐饮与零售密度高，夜间人流明显高于白天。',
    category: '商圈',
    lng: 116.4551,
    lat: 39.9337,
  },
  {
    id: 'guomao',
    name: '国贸 CBD',
    address: '北京市朝阳区建国门外大街 1 号',
    intro: '中央商务区核心，甲级写字楼与跨国企业总部集中，早高峰 8:30—9:30 最拥挤。',
    category: '商务区',
    lng: 116.4605,
    lat: 39.9087,
  },
  {
    id: 'zhongguancun',
    name: '中关村',
    address: '北京市海淀区中关村大街',
    intro: '科技创新园区发源地，互联网与硬件企业聚集，周边高校密集。',
    category: '园区',
    lng: 116.3167,
    lat: 39.9836,
  },
  {
    id: 'yiheyuan',
    name: '颐和园',
    address: '北京市海淀区新建宫门路 19 号',
    intro: '清代皇家园林，以昆明湖与万寿山为主体，占地约 297 公顷。',
    category: '景区',
    lng: 116.2755,
    lat: 39.9999,
  },
  {
    id: 'niaochao',
    name: '国家体育场（鸟巢）',
    address: '北京市朝阳区国家体育场南路 1 号',
    intro: '2008 年奥运会主体育场，钢结构编织造型，可容纳约 9 万名观众。',
    category: '场馆',
    lng: 116.3975,
    lat: 39.9928,
  },
  {
    id: '798',
    name: '798 艺术区',
    address: '北京市朝阳区酒仙桥路 4 号',
    intro: '由老厂房改造的艺术园区，画廊、设计工作室与展演空间集中。',
    category: '园区',
    lng: 116.4957,
    lat: 39.9843,
  },
  {
    id: 'beijingnan',
    name: '北京南站',
    address: '北京市丰台区永外大街 12 号',
    intro: '京沪、京津城际主要始发站，日均到发旅客量位居全市前列。',
    category: '交通枢纽',
    lng: 116.3786,
    lat: 39.8652,
  },
  {
    id: 'beijingxi',
    name: '北京西站',
    address: '北京市丰台区莲花池东路 118 号',
    intro: '京广、京九方向主要客运站，站前广场与地铁 7 / 9 号线接驳。',
    category: '交通枢纽',
    lng: 116.3219,
    lat: 39.8949,
  },
  {
    id: 'shoudujichang',
    name: '首都机场 T3',
    address: '北京市顺义区首都机场',
    intro: '3 号航站楼为国内国际航班主运营区，距市区约 25 公里。',
    category: '交通枢纽',
    lng: 116.6158,
    lat: 40.0525,
  },
  {
    id: 'daxingjichang',
    name: '大兴国际机场',
    address: '北京市大兴区榆垡镇',
    intro: '2019 年投运的大型枢纽机场，五指廊构型，航站楼步行距离最短约 8 分钟。',
    category: '交通枢纽',
    lng: 116.4108,
    lat: 39.5095,
  },
  {
    id: 'wangjing',
    name: '望京 SOHO',
    address: '北京市朝阳区望京街 10 号',
    intro: '望京片区地标写字楼群，互联网公司分部集中，通勤潮汐明显。',
    category: '商务区',
    lng: 116.4809,
    lat: 40.0025,
  },
  {
    id: 'jinrongjie',
    name: '金融街',
    address: '北京市西城区金融大街',
    intro: '金融机构总部聚集区，一行三会与大型银行总部多在此办公。',
    category: '商务区',
    lng: 116.3575,
    lat: 39.9155,
  },
  {
    id: 'shichahai',
    name: '什刹海',
    address: '北京市西城区羊房胡同',
    intro: '由前海、后海、西海组成的水域及周边历史街区，酒吧与胡同院落交织。',
    category: '街区',
    lng: 116.3833,
    lat: 39.9403,
  },
  {
    id: 'qianmen',
    name: '前门大街',
    address: '北京市东城区前门大街',
    intro: '中轴线南段传统商业街，老字号集中，步行街全长约 840 米。',
    category: '商圈',
    lng: 116.3975,
    lat: 39.8994,
  },
  {
    id: 'wudaokou',
    name: '五道口',
    address: '北京市海淀区成府路',
    intro: '高校与科技公司交汇的商圈，年轻人密度高，餐饮营业至深夜。',
    category: '商圈',
    lng: 116.3375,
    lat: 39.9928,
  },
  {
    id: 'yizhuang',
    name: '亦庄经开区',
    address: '北京市大兴区荣华中路',
    intro: '北京经济技术开发区，高端制造与生物医药企业集中，厂区与研发楼混布。',
    category: '园区',
    lng: 116.5069,
    lat: 39.7952,
  },
  {
    id: 'tongzhou',
    name: '通州副中心',
    address: '北京市通州区运河东大街',
    intro: '城市副中心行政办公区，市政机构集中迁入，周边配套仍在完善。',
    category: '园区',
    lng: 116.6564,
    lat: 39.9097,
  },
  {
    id: 'aolin',
    name: '奥林匹克森林公园',
    address: '北京市朝阳区科荟路 33 号',
    intro: '城区内最大的城市公园，约 680 公顷，跑步与骑行路线成熟。',
    category: '景区',
    lng: 116.3925,
    lat: 40.0203,
  },
]

/** 两点间的近似距离（米）：小范围下用平面近似足够 */
export function distanceInMeters(aLng: number, aLat: number, bLng: number, bLat: number) {
  const rad = Math.PI / 180
  const x = (bLng - aLng) * rad * 6378137 * Math.cos(((aLat + bLat) / 2) * rad)
  const y = (bLat - aLat) * rad * 6378137
  return Math.sqrt(x * x + y * y)
}

/** 找离点击点最近的地标，顺带把距离带出来 */
export function nearestLandmark(lng: number, lat: number) {
  let nearest = LANDMARKS[0]!
  let min = Number.POSITIVE_INFINITY

  for (const item of LANDMARKS) {
    const distance = distanceInMeters(lng, lat, item.lng, item.lat)
    if (distance < min) {
      min = distance
      nearest = item
    }
  }

  return { landmark: nearest, distance: Math.round(min) }
}

/** 320 米 / 1.2 公里 */
export function formatDistance(meters: number) {
  if (meters < 1000)
    return `${meters} 米`
  return `${(meters / 1000).toFixed(1)} 公里`
}
