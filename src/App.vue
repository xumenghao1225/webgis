<script setup lang="ts">
import { onMounted, nextTick, reactive } from 'vue'
import BaseMap from './components/BaseMap/index.vue'
const pageState = reactive({
  height: 0,
})
onMounted(() => {
  nextTick(() => {
    pageState.height = window.innerHeight
  })
})
</script>

<template>
  <BaseMap :height="pageState.height" :mapClickable="true"></BaseMap>
</template>

<style scoped></style>
