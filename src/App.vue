<script setup lang="ts">
import { computed, reactive } from 'vue'
import AppStyle from '@/styles/App.module.scss'
// import Form from '@/components/Form/index.vue'
// import { AuthComponents } from './utils/Auth'
// import BaseMap from '@/components/BaseMap/index.vue'
// import Loading from '@/components/Loading/index.vue'
import NotFund from '@/components/ErrorPage/404.vue'
import cssScoped from '@/views/CssScoped/index.vue'
import RoutePlan from '@/views/RoutePaint/index.vue'

const tablist = ['MAP_PATH_PLANNING', 'CSS_PATH_SCOPED'] as const
type tabType = (typeof tablist)[number]
const pageStore = reactive<{
  tabs: tabType
}>({
  tabs: 'MAP_PATH_PLANNING',
})
const currentComponent = computed(() => {
  switch (pageStore.tabs) {
    case 'MAP_PATH_PLANNING':
      return RoutePlan
    case 'CSS_PATH_SCOPED':
      return cssScoped
    default:
      return NotFund
  }
})

const handleSelect = (tab: tabType) => {
  pageStore.tabs = tab
}
</script>

<template>
  <el-container :class="AppStyle.container">
    <el-header
      ><el-menu
        mode="horizontal"
        :default-active="pageStore.tabs"
        @select="handleSelect"
      >
        <el-menu-item index="MAP_PATH_PLANNING">地图路径规划</el-menu-item>
        <el-menu-item index="CSS_PATH_SCOPED">CSS Scoped</el-menu-item>
      </el-menu></el-header
    >
    <el-main :class="AppStyle.main">
      <transition name="fade" mode="out-in">
        <component :key="pageStore.tabs" :is="currentComponent"></component>
      </transition>
    </el-main>
  </el-container>
</template>
