<template>
  <view class="system-notice" :class="type">
    <view class="notice-line" />
    <view class="notice-card" :class="{ pop: animate }">
      <view class="notice-glow" />
      <view class="notice-icon-wrap">
        <text class="notice-icon">{{ copy.icon }}</text>
      </view>
      <text class="notice-tag">{{ copy.tag }}</text>
      <text class="notice-title">{{ copy.title }}</text>
      <text class="notice-desc">{{ copy.desc }}</text>
      <text class="notice-time">{{ timeText }}</text>
    </view>
    <view class="notice-line" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ChatSystemEventType } from '../utils/chatTimeline';
import { systemEventCopy } from '../utils/chatTimeline';

const props = withDefaults(
  defineProps<{
    type: ChatSystemEventType;
    timestamp: string;
    animate?: boolean;
    side?: 'client' | 'merchant';
  }>(),
  { animate: true, side: 'client' }
);

const copy = computed(() => systemEventCopy(props.type, props.side));

const timeText = computed(() => {
  const d = new Date(props.timestamp);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
});
</script>

<style lang="scss" scoped>
.system-notice {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin: 12rpx 0 32rpx;
  padding: 0 8rpx;

  &.switch_human .notice-card {
    border-color: rgba(5, 150, 105, 0.35);
    background: linear-gradient(160deg, #ecfdf5 0%, #fff 55%, #f0fdf4 100%);
  }

  &.switch_human .notice-glow {
    background: radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%);
  }

  &.switch_human .notice-icon-wrap {
    background: linear-gradient(135deg, #34d399, #059669);
    box-shadow: 0 8rpx 24rpx rgba(5, 150, 105, 0.35);
  }

  &.switch_human .notice-tag {
    background: #d1fae5;
    color: #047857;
  }

  &.switch_bot .notice-card {
    border-color: rgba(59, 130, 246, 0.35);
    background: linear-gradient(160deg, #eff6ff 0%, #fff 55%, #f8fafc 100%);
  }

  &.switch_bot .notice-glow {
    background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
  }

  &.switch_bot .notice-icon-wrap {
    background: linear-gradient(135deg, #60a5fa, #2563eb);
    box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.3);
  }

  &.switch_bot .notice-tag {
    background: #dbeafe;
    color: #1d4ed8;
  }
}

.notice-line {
  flex: 1;
  height: 2rpx;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
}

.notice-card {
  position: relative;
  width: 88%;
  max-width: 560rpx;
  border-radius: 28rpx;
  border: 2rpx solid #e2e8f0;
  padding: 28rpx 24rpx 22rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  overflow: hidden;
  box-shadow: 0 12rpx 36rpx rgba(15, 23, 42, 0.08);

  &.pop {
    animation: noticePop 0.55s cubic-bezier(0.34, 1.4, 0.64, 1) both;
  }
}

.notice-glow {
  position: absolute;
  top: -40rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 280rpx;
  height: 140rpx;
  pointer-events: none;
}

.notice-icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14rpx;
  border: 6rpx solid rgba(255, 255, 255, 0.9);
}

.notice-icon {
  font-size: 48rpx;
}

.notice-tag {
  font-size: 20rpx;
  font-weight: 800;
  padding: 6rpx 16rpx;
  border-radius: 100rpx;
  margin-bottom: 10rpx;
  letter-spacing: 1rpx;
}

.notice-title {
  font-size: 30rpx;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.35;
  margin-bottom: 8rpx;
}

.notice-desc {
  font-size: 22rpx;
  color: #64748b;
  line-height: 1.55;
  font-weight: 600;
  max-width: 420rpx;
}

.notice-time {
  font-size: 20rpx;
  color: #94a3b8;
  margin-top: 14rpx;
  font-weight: 600;
}

@keyframes noticePop {
  0% {
    opacity: 0;
    transform: scale(0.88) translateY(16rpx);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
