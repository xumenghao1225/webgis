<script setup lang="ts">
import { onMounted, ref } from 'vue'
import mapboxgl, {
  NavigationControl,
  FullscreenControl,
  AttributionControl,
} from 'mapbox-gl'
import type {
  MapOptions,
  Map,
  MapMouseEvent,
  MapEvent,
  GeoJSONFeature,
} from 'mapbox-gl'
// import HomeControl from '../control/HomeControl'
import { TK, STYLE } from '../../utils/constant'
// import turf from '@turf/turf'
import { along } from '@turf/along'
import { bearing } from '@turf/bearing'
import { length } from '@turf/length'
import distance from '@turf/distance'
import {
  featureCollection,
  isNumber,
  isObject,
  lineString,
  point as Ppoint,
  polygon,
  validateBBox,
} from '@turf/helpers'
import { createPropHtml } from '../../utils'
import 'mapbox-gl/dist/mapbox-gl.css'

interface Props {
  height?: number
  mapOptions?: Omit<MapOptions, 'container'>
  mapClickable?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  height: 520,
  mapClickable: true,
})
const emit = defineEmits<{
  (e: 'load', map: Map): void
}>()

const mapContainer = Math.random().toString(16).substring(2)
let map: Map
const mapLoaded = ref(false)

onMounted(() => {
  const mapDefaultOptions: MapOptions = {
    container: mapContainer,
    style: STYLE.SATELLITE,
    center: [113.335367, 23.13559],
    zoom: 8.6,
    minZoom: 5,
    maxZoom: 22,
    scrollZoom: true,
    pitch: 0,
    bearing: 0,
    antialias: false,
    attributionControl: false,
  }
  const options = Object.assign({}, mapDefaultOptions, props.mapOptions)
  setTimeout(() => {
    initMap(options)
  }, 100)
})

const initMap = (options: MapOptions) => {
  mapboxgl.accessToken = TK
  map = new mapboxgl.Map(options)
  map.addControl(
    new AttributionControl({
      customAttribution: `v${mapboxgl.version}`,
    }),
  )
  map.addControl(new NavigationControl(), 'top-left')
  map.addControl(new FullscreenControl(), 'top-left')
  map.on('load', (e: MapEvent) => {
    mapLoaded.value = true
    emit('load', e.target)
    handleSource(map)
    route(map)
  })

  if (props.mapClickable) {
    map.on('click', (e: MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point)
      if (features.length > 0) {
        const feature = features[0]
        const { layer, properties, geometry } = feature
        let lngLat: mapboxgl.LngLatLike = e.lngLat
        if (geometry.type === 'Point') {
          lngLat = geometry.coordinates as [number, number]
        }

        if (properties) {
          new mapboxgl.Popup()
            .setLngLat(lngLat)
            .setHTML(createPropHtml(layer!.id, properties))
            .addTo(map)
        }
      }
    })
  }
}

const handleSource = (map: Map) => {
  fetch('https://geo.datav.aliyun.com/areas_v3/bound/440100_full.json')
    .then(res => res.json())
    .then(res => {
      map.addSource('source', {
        type: 'geojson',
        data: res,
      })
      map.addLayer({
        id: 'layer',
        type: 'fill',
        source: 'source',
        paint: {
          'fill-color': '#088',
          'fill-opacity': 0.5,
        },
      })
    })
}

const route = (map: Map) => {
  // 起点
  var origin = [113.414, 23.776]

  // 路径图层.
  var route = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            origin,
            [113.032, 23.113],
            [113.032, 23.923],
            [113.032, 23.913],
          ],
        },
      },
    ],
  }

  //飞机图层，初始点设置为上面路径的起点
  var point = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: origin,
        },
      },
    ],
  }

  // 计算路径的长度
  var lineDistance = length(route.features[0], {
    units: 'kilometers',
  })
  console.log(lineDistance)
  //路径分段
  var arc = []

  // 走多少步走完
  var steps = 200

  // 把每一步的下一个点存到路径里面去，然后让飞机按个点去走
  for (var i = 0; i < lineDistance + 1; i += lineDistance / steps) {
    var segment = along(route.features[0], i, 'kilometers')
    arc.push(segment.geometry.coordinates)
  }
  route.features[0].geometry.coordinates = arc

  // 第一步.
  var counter = 0
  //加载图层

  // 加载路径数据源
  map.addSource('route', {
    type: 'geojson',
    data: route,
  })
  //加载飞机数据源
  map.addSource('point', {
    type: 'geojson',
    data: point,
  })
  //加载路径图层
  map.addLayer({
    id: 'route',
    source: 'route',
    type: 'line',
    paint: {
      'line-width': 10,
      'line-blur': 3,
      'line-opacity': 0.4,

      'line-color': '#007cbf',
    },
  })
  //加载图标
  //汽车https://s1.aigei.com/src/img/png/b8/b8ecfe6b72f541539e9c55f941bbb699.png?e=1735488000&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:ewd2XgpFmt8ceN5KxKPDBdzNefk=
  //火箭https://s1.chu0.com/src/img/png/c5/c5cf6e9b53ab4477b1d865a6131af8db.png?imageMogr2/auto-orient/thumbnail/!129x132r/gravity/Center/crop/129x132/quality/85/%7Cwatermark/3/image/aHR0cHM6Ly9zMS5haWdlaS5jb20vd2F0ZXJtYXJrLzYwLTIucG5nP2U9MTczNTQ4ODAwMCZ0b2tlbj1QN1MyWHB6ZnoxMXZBa0FTTFRrZkhON0Z3LW9PWkJlY3FlSmF4eXBMOnpYaVVCU1Y3SmNxRUUtUTZmTkdGOHVLZ3l2bz0=/dissolve/20/gravity/NorthWest/dx/43/dy/63/ws/0.0/wst/0&e=1735488000&token=1srnZGLKZ0Aqlz6dk7yF4SkiYf4eP-YrEOdM1sob:svzOrMFOkiRaefwmKAICn6J8kHU=
  let runIcon =
    'https://s1.chu0.com/src/img/png/c5/c5cf6e9b53ab4477b1d865a6131af8db.png?imageMogr2/auto-orient/thumbnail/!129x132r/gravity/Center/crop/129x132/quality/85/%7Cwatermark/3/image/aHR0cHM6Ly9zMS5haWdlaS5jb20vd2F0ZXJtYXJrLzYwLTIucG5nP2U9MTczNTQ4ODAwMCZ0b2tlbj1QN1MyWHB6ZnoxMXZBa0FTTFRrZkhON0Z3LW9PWkJlY3FlSmF4eXBMOnpYaVVCU1Y3SmNxRUUtUTZmTkdGOHVLZ3l2bz0=/dissolve/20/gravity/NorthWest/dx/43/dy/63/ws/0.0/wst/0&e=1735488000&token=1srnZGLKZ0Aqlz6dk7yF4SkiYf4eP-YrEOdM1sob:svzOrMFOkiRaefwmKAICn6J8kHU='
  map.loadImage(runIcon, function (error, image) {
    if (error) throw error
    if (!map.hasImage('airport-15')) {
      map.addImage('airport-15', image as ImageBitmap)
    }
  })
  //加载飞机图层，这里设置了一下在缩放范围到达7之后，才会显示
  map.addLayer({
    id: 'point',
    source: 'point',
    type: 'symbol',
    layout: {
      'icon-image': 'airport-15',
      'icon-rotate': ['get', 'bearing'],
      'icon-rotation-alignment': 'map',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-size': {
        type: 'interval',
        stops: [
          [0, 0],
          [6, 0],
          [7, 0.4],
        ],
      },
      'icon-offset': [0, -10],
    },
  })
  // 动画函数 从路径上挨个去点，将点setdata进飞机图层中
  function animate() {
    //乳沟走到头了，那就重新走，无限循环
    if (counter == steps) {
      point.features[0].geometry.coordinates = origin

      // Update the source layer
      map.getSource('point')!.setData(point)

      // Reset the counter
      counter = 0

      // Restart the animation.
      animate(counter)
      return
    }

    // 更新飞机图层的坐标
    point.features[0].geometry.coordinates =
      route.features[0].geometry.coordinates[counter]
    // 设置角度
    point.features[0].properties.bearing = bearing(
      Ppoint(
        route.features[0].geometry.coordinates[
          counter >= steps ? counter - 1 : counter
        ],
      ),
      Ppoint(
        route.features[0].geometry.coordinates[
          counter >= steps ? counter : counter + 1
        ],
      ),
    )

    // 更新飞机图层的数据，主要是坐标和角度
    map.getSource('point')!.setData(point)

    // 循环动画 一直到走完.
    if (counter < steps) {
      requestAnimationFrame(animate)
    }
    counter = counter + 1
  }

  // 调用动画
  animate()
}
</script>
<template>
  <div class="map-wrapper">
    <div
      :id="mapContainer"
      :style="{ width: '100%', height: `${props.height}px` }"
    ></div>
    <slot v-if="mapLoaded"></slot>
  </div>
</template>
<style lang="scss">
.mapboxgl-popup {
  &-content {
    padding: 0;
    .title {
      padding: 0 30px 0 10px;
      line-height: 32px;
      font-size: 14px;
      color: #fff;
      background-color: #3eaf7c;
    }

    .content {
      padding: 10px;
      max-height: 200px;
      overflow-x: hidden;
      overflow-y: auto;
      background-color: #fff;

      p {
        margin: 0;
        line-height: 24px;
      }
    }
  }

  &-close-button {
    outline: none;
    color: #fff;
    font-size: 24px;
    line-height: 32px;
    padding: 0 6px;
    font-family: inherit;
  }
}
</style>
