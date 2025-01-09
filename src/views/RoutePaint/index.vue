<script setup lang="ts">
import Air from '@/assets/air.png'
import BaseMap from '@/components/BaseMap/index.vue'
import { along } from '@turf/along'
import { bearing } from '@turf/bearing'
import { length } from '@turf/length'
import distance from '@turf/distance'
import type { Map } from 'mapbox-gl'
import {
  featureCollection,
  isNumber,
  isObject,
  lineString,
  point as Ppoint,
  polygon,
  validateBBox,
} from '@turf/helpers'
import { useControls } from '@/hooks/controls'

const handleSource = (map: Map) => {
  fetch('https://geo.datav.aliyun.com/areas_v3/bound/440100_full.json', {
    keepalive: true,
  })
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
  const origin = [113.414, 23.776]

  // 路径图层.
  const route = {
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
  const point = {
    type: 'FeatureCollection',
    geometry: {
      type: 'Point',
      coordinates: [],
    },
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
  const line = lineString(route.features[0].geometry.coordinates)
  // 计算路径的长度
  const lineDistance = length(line, {
    units: 'kilometers',
  })
  //路径分段
  const arc = []

  // 走多少步走完
  const steps = 100

  // 把每一步的下一个点存到路径里面去，然后让飞机按个点去走
  for (let i = 0; i < lineDistance + 1; i += lineDistance / steps) {
    const segment = along(line, i, { units: 'kilometers' })
    arc.push(segment.geometry.coordinates)
  }
  route.features[0].geometry.coordinates = arc

  // 第一步.
  let counter = 0
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
  map.loadImage(Air, function (error, image) {
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
    //如果走到头了，那就重新走，无限循环
    if (counter == steps) {
      point.features[0].geometry.coordinates = origin

      // Update the source layer
      map.getSource('point')!.setData(point)
      // Reset the counter
      counter = 0

      // Restart the animation.
      animate()
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

const init = (map: Map) => {
  useControls(map)
  handleSource(map)
  route(map)
}
</script>

<template>
  <BaseMap @loaded="init"></BaseMap>
</template>

<style scoped></style>
