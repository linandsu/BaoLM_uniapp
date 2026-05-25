<template>
  <view class="baobao-mascot">
    <view class="baobao-svg-host" v-html="BAOBAO_MASCOT_SVG" />
  </view>
</template>

<script setup lang="ts">
import { BAOBAO_MASCOT_SVG } from '../assets/baobaoMascotSvg';
</script>

<style scoped lang="scss">
.baobao-mascot {
  width: 280rpx;
  height: 280rpx;
  max-width: 52vw;
  max-height: 52vw;
  margin: 0 auto;
  flex-shrink: 0;
  overflow: visible;
}

.baobao-svg-host {
  width: 100%;
  height: 100%;
  line-height: 0;
  font-size: 0;
}

/* 穿透到内联 SVG */
.baobao-svg-host :deep(svg) {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
</style>
