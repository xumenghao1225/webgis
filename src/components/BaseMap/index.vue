<script setup lang="ts">
import { onMounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import type { Map, MapMouseEvent , MapboxEvent} from 'mapbox-gl'
import { TK, STYLE } from '@/utils/constant'

import 'mapbox-gl/dist/mapbox-gl.css'

interface Props {
  mapOptions?: Omit<mapboxgl.MapOptions, 'container'>
  mapClickable?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  height: 520,
  mapClickable: true,
})
const emit = defineEmits<{
  (e: 'loaded', map: Map): void
  (e: 'mapClick', map: Map): void
}>()

const mapContainer = Math.random().toString(16).substring(2)
let map: Map

onMounted(() => {
  const mapDefaultOptions: mapboxgl.MapOptions = {
    container: mapContainer,
    style: STYLE.DEFAULT,
    center: [113.335367, 23.13559],
    zoom: 8.6,
    minZoom: 5,
    maxZoom: 22,
    scrollZoom: true,
    fadeDuration: 0, // 减少图层切换时的动画时间
    pitch: 0,
    bearing: 0,
    antialias: false,
    attributionControl: false,
  }
  const options = Object.assign({}, mapDefaultOptions, props.mapOptions)
  initMap(options)
})

const initMap = (options: mapboxgl.MapOptions) => {
  mapboxgl.accessToken = TK
  map = new mapboxgl.Map(options)

  map.on('style.load', (e: MapboxEvent) => {
    emit('loaded', e.target)
  })
  if (props.mapClickable) {
    map.on('click', (e: MapMouseEvent) => {
      emit('mapClick', e.target)
    })
  } else {
    map.off('click', () => {})
  }
  return Promise.resolve(map)
}
</script>
<template>
  <div class="map-wrapper">
    <div :id="mapContainer" class="map-container"></div>
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

<style lang="scss" scoped>
@mixin wh100 {
  width: 100%;
  height: 100%;
}

.map-wrapper {
  @include wh100;
}

.map-container {
  @include wh100;
}
</style>
