<template>
  <view class="custom-tab-bar">
    <view class="tab-bg">
      <view class="tab-item" :class="{ active: active === 'home' }" @tap="navTo('/pages/client/home')">
        <text class="tab-icon">🍴</text>
        <text class="tab-text">点外卖</text>
      </view>

      <view class="tab-item center-item" :class="{ active: active === 'chat' }" @tap="navTo('/pages/client/chat')">
        <view class="center-btn">
          <text class="center-icon">🤖</text>
        </view>
        <text class="tab-text">客服</text>
      </view>

      <view class="tab-item" :class="{ active: active === 'orders' }" @tap="navTo('/pages/client/orders')">
        <text class="tab-icon">📋</text>
        <text class="tab-text">订单</text>
      </view>

      <view class="tab-item" :class="{ active: active === 'mine' }" @tap="navTo('/pages/client/mine')">
        <text class="tab-icon">👤</text>
        <text class="tab-text">我的</text>
      </view>
    </view>
    <view class="safe-area-bottom" />
  </view>
</template>

<script setup lang="ts">
defineProps<{
  active: 'home' | 'chat' | 'orders' | 'mine';
}>();

function navTo(url: string) {
  const pages = getCurrentPages();
  const currentUrl = '/' + pages[pages.length - 1].route;
  if (currentUrl === url) return;
  uni.reLaunch({ url });
}
</script>

<style lang="scss" scoped>
.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  pointer-events: none;
}

.tab-bg {
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20rpx);
  border-radius: 40rpx 40rpx 0 0;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding: 12rpx 8rpx 8rpx;
  box-shadow: 0 -4rpx 32rpx rgba(226, 92, 48, 0.08);
  border: 1rpx solid rgba(255, 255, 255, 1);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  flex: 1;
  min-width: 0;
  padding: 8rpx 0;
  transition: all 0.2s;

  &.active {
    .tab-icon,
    .center-icon {
      color: #e25c30;
      transform: scale(1.05);
    }
    .tab-text {
      color: #e25c30;
      font-weight: 800;
    }
    .center-btn {
      box-shadow: 0 10rpx 28rpx rgba(226, 92, 48, 0.45);
    }
  }
}

.tab-icon {
  font-size: 36rpx;
  color: #94a3b8;
  transition: all 0.2s;
}

.tab-text {
  font-size: 20rpx;
  color: #94a3b8;
  font-weight: 600;
  transition: all 0.2s;
}

.center-item {
  position: relative;
  margin-top: -36rpx;
}

.center-btn {
  width: 96rpx;
  height: 96rpx;
  background: linear-gradient(135deg, #ff895d, #e25c30);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(226, 92, 48, 0.35);
  border: 6rpx solid #ffffff;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.92);
  }
}

.center-icon {
  font-size: 42rpx;
  color: #ffffff;
}

.safe-area-bottom {
  background: #ffffff;
  height: env(safe-area-inset-bottom);
  width: 100%;
  pointer-events: none;
}
</style>
