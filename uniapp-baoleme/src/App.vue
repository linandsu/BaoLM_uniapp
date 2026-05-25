<script setup lang="ts">
import { onLaunch, onShow } from '@dcloudio/uni-app';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();

onLaunch(() => {
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
