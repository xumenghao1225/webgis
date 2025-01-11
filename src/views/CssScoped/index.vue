<script setup lang="ts">
import styleModule from './scoped.module.scss'
import Card from './card.vue'
</script>

<template>
  <div :class="styleModule.about">this is css scoped</div>
  <Card></Card>
</template>

<style scoped></style>
