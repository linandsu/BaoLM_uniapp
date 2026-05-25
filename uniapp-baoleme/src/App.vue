<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app';
import { useAuthStore } from './stores/auth';
import { useDeviceStore } from './stores/device';

const authStore = useAuthStore();
const deviceStore = useDeviceStore();

onLaunch(() => {
  deviceStore.init();
  authStore.restoreFromStorage();
  console.log('饱了么 App 启动');
});

onShow(() => {
  // App 恢复前台
});
</script>

<template>
  <view>
    <router-view v-if="false" />
  </view>
</template>

<style lang="scss">
@import './styles/mobile-touch.scss';

page {
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  background-color: #fcfaf9;
  font-family: 'PingFang SC', 'Helvetica Neue', 'Microsoft YaHei', sans-serif;
}

view,
scroll-view,
text,
input,
textarea,
button,
image {
  box-sizing: border-box;
  max-width: 100%;
}

input,
textarea {
  position: relative;
  z-index: 2;
}
</style>
