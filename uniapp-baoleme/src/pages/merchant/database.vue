<template>
  <view class="merchant-page">
    <view class="merchant-header">
      <text class="back-btn" @tap="uni.navigateBack()">←</text>
      <text class="header-title">🗄️ 数据库 DDL</text>
    </view>

    <view class="ddl-toolbar">
      <text class="ddl-hint">MySQL 建表语句 · 可向评委老师展示实体外键关系</text>
      <button class="copy-btn" @tap="copyDDL">
        {{ copied ? '✅ 已复制' : '📋 复制全部' }}
      </button>
    </view>

    <scroll-view class="ddl-content" scroll-y>
      <view class="code-block">
        <text class="code-text" selectable>{{ MYSQL_DDL_SCHEMA }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MYSQL_DDL_SCHEMA } from '../../data/dishes';

const copied = ref(false);

function copyDDL() {
  uni.setClipboardData({
    data: MYSQL_DDL_SCHEMA,
    success: () => {
      copied.value = true;
      uni.showToast({ title: '已复制到剪贴板', icon: 'success' });
      setTimeout(() => { copied.value = false; }, 2000);
    }
  });
}
</script>

<style lang="scss" scoped>
.merchant-page {
  min-height: 100vh; min-height: 100dvh;
  background: #1E293B;
  display: flex;
  flex-direction: column;
}

.merchant-header {
  background: #0F172A;
  padding: calc(env(safe-area-inset-top, 50rpx) + 20rpx) 32rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.back-btn {
  color: #94A3B8;
  font-size: 40rpx;
  font-weight: bold;
  padding: 8rpx 16rpx;
}

.header-title {
  color: white;
  font-size: 36rpx;
  font-weight: 800;
}

.ddl-toolbar {
  background: #0F172A;
  padding: 16rpx 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #334155;
}

.ddl-hint {
  color: #64748B;
  font-size: 22rpx;
  flex: 1;
}

.copy-btn {
  background: #E25C30;
  color: white;
  font-size: 24rpx;
  font-weight: 800;
  padding: 12rpx 28rpx;
  border-radius: 16rpx;
  border: none;
  line-height: 1;
}

.ddl-content {
  flex: 1;
  padding: 24rpx;
}

.code-block {
  background: #0F172A;
  border-radius: 16rpx;
  padding: 32rpx;
  border: 1rpx solid #334155;
}

.code-text {
  color: #7DD3FC;
  font-size: 22rpx;
  line-height: 1.8;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
