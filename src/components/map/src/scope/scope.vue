<script lang="ts" setup>
import { useTimeoutFn } from '@vueuse/core'
import { Collection, Feature } from 'ol'
import { defaults as defaultControls, ScaleLine, Zoom } from 'ol/control'
import { Circle, Point } from 'ol/geom'
import { Select, Translate } from 'ol/interaction'
import { Vector as VectorLayer } from 'ol/layer'
import Map from 'ol/Map'
import { fromLonLat, toLonLat } from 'ol/proj'
import { Vector as VectorSource } from 'ol/source'
import { Fill, Icon, Stroke, Style } from 'ol/style'
import View from 'ol/View'
import { getApiBaseUrl } from '@/hooks/setting'
import { geocode } from '@/service/api/map'
import { tencentTileLayer } from '@/utils/map'
import toast from '@/utils/toast'

const emit = defineEmits(['confirm', 'register'])

const baseUrl = getApiBaseUrl()

const modalRef = ref<any>(null)
const mapRef = ref()
// 地图瓦片
const mapLayer = tencentTileLayer()

const locationSource = new VectorSource<any>({ features: [] })
const locationLayer = new VectorLayer({
  source: locationSource,
  style: new Style({
    stroke: new Stroke({
      width: 2,
      color: '#4e98f444',
    }),
    fill: new Fill({
      color: '#4e98f444',
    }),
    image: new Icon({
      width: 25,
      height: 41,
      anchor: [0.5, 1],
      src: `${baseUrl}/map/marker-icon.png`,
    }),
  }),
})
const featurePoint = new Feature({})
const featureCircle = new Feature({})
locationSource.addFeature(featurePoint)
locationSource.addFeature(featureCircle)

// 地图实例
const map = new Map({
  controls: defaultControls().extend([
    new Zoom({
      zoomInTipLabel: '放大',
      zoomOutTipLabel: '放小',
    }),
    new ScaleLine({
      units: 'metric',
    }),
  ]),
  layers: [mapLayer, locationLayer],
  view: new View({
    projection: 'EPSG:3857',
    zoom: 15,
    maxZoom: 18,
    minZoom: 4,
  }),
})

// 坐标初始值
const lnglat = ref([114.06394893658384, 22.685673267419105])
const radius = ref(300)

const filterName = ref()
const filterAddress = ref()
const filterValue = ref()
const filterLoading = ref(false)
const filterOptions = ref([])
const addressInfo = ref<any>({
  name: null,
  detail: null,
})
let suppressSelect = false

async function handleSearch() {
  if (!filterName.value && !filterAddress.value) {
    toast.info('请输入名称或地址进行搜索')
    return
  }
  filterValue.value = ''
  filterLoading.value = true
  filterOptions.value = []
  const { isSuccess, data } = await geocode
    .geo({ name: filterName.value, address: filterAddress.value, cityname: '深圳市', limit: 20 })
    .finally(() => (filterLoading.value = false))
  if (isSuccess) {
    const options: any = []
    for (const item of data) {
      options.push({
        label: `${item.name}[${item.cityname}${item.address}]`,
        value: `${item.lng},${item.lat}`,
      })
    }
    if (options.length > 0) {
      filterValue.value = options[0].value
      addressInfo.value.name = options[0].name
      addressInfo.value.detail = options[0].address
      handleSelect(filterValue.value)
    }
    filterOptions.value = options
  }
}

function handleSelect(item) {
  if (suppressSelect)
    return
  if (item) {
    lnglat.value = item.split(',')
    const coord = fromLonLat(lnglat.value)
    map.getView().setCenter(coord)
    featureCircle.setGeometry(new Circle(coord, getRadius(radius.value)))
    featurePoint.setGeometry(new Point(coord))
  }
}

// 半径计算
function getRadius(radius) {
  const metersPerUnit = map.getView().getProjection().getMetersPerUnit() || 0
  const circleRadius = radius / metersPerUnit
  return circleRadius
}

map.on('click', (event) => {
  if (event.dragging) {
    return
  }
  featureCircle.setGeometry(new Circle(event.coordinate, getRadius(radius.value)))
  featurePoint.setGeometry(new Point(event.coordinate))
  lnglat.value = toLonLat(event.coordinate)
  filterValue.value = null
  loadRegeo(lnglat.value[0], lnglat.value[1])
})

// 标记地图是否已初始化完成
let isInitMapView = false

function initMapView(target) {
  if (isInitMapView)
    return
  map.setTarget(target)

  const select = new Select({
    multi: true,
    layers: [locationLayer],
    style: new Style({
      stroke: new Stroke({
        width: 2,
        color: '#4e98f444',
      }),
      fill: new Fill({
        color: '#4e98f444',
      }),
      image: new Icon({
        width: 25,
        height: 41,
        anchor: [0.5, 1],
        src: `${baseUrl}/map/marker-icon.png`,
      }),
    }),
    features: new Collection([featurePoint, featureCircle]),
  })

  const translate = new Translate({
    features: select.getFeatures(),
  })

  translate.on('translateend', () => {
    const point = featurePoint.getGeometry() as Point
    // console.log(point.getCoordinates());
    lnglat.value = toLonLat(point.getCoordinates())
    // console.log(lnglat);
  })

  map.addInteraction(select)
  map.addInteraction(translate)

  select.setActive(true)

  isInitMapView = true
}

function initialize() {
  initMapView(mapRef.value)
  redoMap()
}

function redoMap() {
  useTimeoutFn(() => map.updateSize(), 120)
}

function onClose() {
  clearMap()
}

/** 清空地图数据 */
function clearMap() {}

function confirm() {
  emit('confirm', {
    radius: radius.value,
    lng: lnglat.value[0],
    lat: lnglat.value[1],
    ...addressInfo.value,
  })
  modalRef.value?.close()
}

function show(params: any = {}) {
  modalRef.value?.open()

  radius.value = params.radius || 300
  // 默认中心点
  lnglat.value = [params.lng || 114.06394893658384, params.lat || 22.685673267419105]

  map.getView().setCenter(fromLonLat(lnglat.value))

  featureCircle.setGeometry(new Circle(fromLonLat(lnglat.value), getRadius(radius.value)))
  featurePoint.setGeometry(new Point(fromLonLat(lnglat.value)))
}

function radiusChange(value: null | number) {
  const circle = featureCircle.getGeometry() as Circle
  circle.setRadius(value || 10)
}

async function loadRegeo(lng: number, lat: number) {
  suppressSelect = true
  filterLoading.value = true
  filterOptions.value = []
  try {
    const { isSuccess, data } = await geocode.regeo({ lng, lat })
    if (isSuccess) {
      const options: any = []
      for (const item of data) {
        options.push({
          label: `${item.name}[${item.cityname}${item.address}]`,
          value: `${item.lng},${item.lat}`,
          name: item.name,
          address: item.address,
        })
      }
      filterOptions.value = options
      if (options.length > 0) {
        filterValue.value = options[0].value
        addressInfo.value.name = options[0].name
        addressInfo.value.detail = options[0].address
      }
    }
  }
  finally {
    filterLoading.value = false
    suppressSelect = false
  }
}

defineExpose({ show })
</script>

<template>
  <SpModal
    ref="modalRef"
    title="打卡地点"
    width="90vw"
    height="90vh"
    :mask="true"
    :draggable="true"
    :show-ok="false"
    :show-footer="false"
    :lock-scroll="true"
    :fullscreen="false"
    class-name="full-modal"
    @show="initialize"
    @close="onClose"
  >
    <template #default>
      <div style="margin: 15px">
        <n-space>
          <n-button type="primary" @click="confirm">
            确定
          </n-button>
          <n-input-number
            v-model:value="radius"
            :min="100"
            :max="1000000"
            :precision="0"
            :step="100"
            style="width: 160px"
            @update:value="radiusChange"
          >
            <template #prefix>
              范围
            </template>
            <template #suffix>
              米
            </template>
          </n-input-number>

          <p style="margin-top: 5px">
            经纬度:{{ lnglat[0] }},{{ lnglat[1] }}
          </p>
        </n-space>
      </div>
      <div style="margin: 15px">
        <n-space>
          <n-input
            v-model:value="filterName"
            placeholder="搜索名称"
            style="width: 160px"
            clearable
          />

          <n-input
            v-model:value="filterAddress"
            placeholder="搜索地址"
            style="width: 160px"
            clearable
          />

          <n-button type="success" @click="handleSearch">
            搜索
          </n-button>

          <n-select
            v-model:value="filterValue"
            style="width: 300px"
            :consistent-menu-width="false"
            placeholder=""
            :options="filterOptions"
            :loading="filterLoading"
            clearable
            @update:value="handleSelect"
          />
        </n-space>
      </div>
      <div
        ref="mapRef"
        style="position: relative; width: 100%; height: calc(100vh - 320px)"
      />
    </template>
  </SpModal>
</template>

<style lang="less" scoped>
</style>
