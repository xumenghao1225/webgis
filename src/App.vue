<script setup lang="ts">
// import { onMounted, nextTick, reactive, defineAsyncComponent, h } from 'vue'
import AppStyle from '@/styles/App.module.scss'
// import Form from '@/components/Form/index.vue'
// import { AuthComponents } from './utils/Auth'
// import BaseMap from '@/components/BaseMap/index.vue'
// import Loading from '@/components/Loading/index.vue'
// import NotFund from '@/components/ErrorPage/404.vue'
import RoutePlan from '@/views/RoutePaint/index.vue'
// const pageState = reactive({
//   height: 0,
// })

// const authMap = defineAsyncComponent(() =>
//   AuthComponents('user', () => import('./components/BaseMap/index.vue')),
// )
// const meth = defineAsyncComponent({
//   loader: () => AuthComponents('admin', BaseMap as unknown),
//   loadingComponent: Loading,
//   errorComponent: NotFund,
//   delay: 2000,
//   timeout: 3000,
// })
</script>

<template>
  <el-container :class="AppStyle.container">
    <el-header
      ><el-menu mode="horizontal">
        <el-menu-item index="MAP_PATH_PLANNING">地图路径规划</el-menu-item>
      </el-menu></el-header
    >
    <el-main :class="AppStyle.main">
      <component :is="RoutePlan"></component>
    </el-main>
  </el-container>
</template>
