<script setup lang="ts">
import { reactive } from 'vue'
const pageState = reactive({
  name: 'HomeView',
})
</script>

<template>
  <main>
    {{ pageState.name }}
  </main>
</template>
