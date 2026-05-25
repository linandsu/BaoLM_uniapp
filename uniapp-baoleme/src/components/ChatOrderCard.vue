<template>
  <view class="order-msg-card">
    <view class="order-msg-head">
      <text class="order-msg-title">📦 订单信息</text>
      <text class="order-msg-status" :class="'st-' + order.status">{{ statusLabel }}</text>
    </view>
    <text class="order-msg-id">订单号 {{ shortId }}</text>
    <text class="order-msg-time">{{ formatOrderCardTime(order.createdAt) }}</text>
    <view class="order-msg-items">
      <text v-for="(line, idx) in itemLines" :key="idx" class="order-msg-line">{{ line }}</text>
    </view>
    <text class="order-msg-total">合计 ¥{{ order.totalPrice.toFixed(2) }}</text>
    <text class="order-msg-addr">📍 {{ order.address }}</text>
    <text v-if="order.note" class="order-msg-note">备注：{{ order.note }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { OrderCardPayload } from '../utils/orderCard';
import { ORDER_STATUS_LABELS, formatOrderCardTime } from '../utils/orderCard';

const props = defineProps<{ order: OrderCardPayload }>();

const statusLabel = computed(() => ORDER_STATUS_LABELS[props.order.status] || props.order.status);
const shortId = computed(() =>
  props.order.id.length > 8 ? props.order.id.slice(-8) : props.order.id
);
const itemLines = computed(() =>
  props.order.items.map(
    (i) => `${i.name} ×${i.qty}  ¥${(i.price * i.qty).toFixed(2)}`
  )
);
</script>

<style scoped lang="scss">
.order-msg-card {
  background: linear-gradient(135deg, #fff7ed 0%, #fff 100%);
  border: 1rpx solid rgba(226, 92, 48, 0.22);
  border-radius: 20rpx;
  padding: 20rpx 22rpx;
  min-width: 360rpx;
  max-width: 100%;
}

.order-msg-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
  margin-bottom: 10rpx;
}

.order-msg-title {
  font-size: 26rpx;
  font-weight: 900;
  color: #9a3412;
}

.order-msg-status {
  font-size: 20rpx;
  font-weight: 800;
  padding: 4rpx 14rpx;
  border-radius: 100rpx;
  background: #f1f5f9;
  color: #64748b;

  &.st-pending { background: #fef3c7; color: #b45309; }
  &.st-accepted,
  &.st-cooking { background: #dbeafe; color: #1d4ed8; }
  &.st-delivering { background: #e0e7ff; color: #4338ca; }
  &.st-completed { background: #d1fae5; color: #047857; }
  &.st-cancelled { background: #f1f5f9; color: #94a3b8; }
}

.order-msg-id,
.order-msg-time {
  display: block;
  font-size: 22rpx;
  color: #64748b;
  margin-bottom: 6rpx;
}

.order-msg-items {
  margin: 12rpx 0;
  padding: 12rpx 0;
  border-top: 1rpx dashed rgba(226, 92, 48, 0.15);
  border-bottom: 1rpx dashed rgba(226, 92, 48, 0.15);
}

.order-msg-line {
  display: block;
  font-size: 24rpx;
  color: #334155;
  line-height: 1.55;
  font-weight: 600;
}

.order-msg-total {
  display: block;
  font-size: 28rpx;
  font-weight: 900;
  color: #e25c30;
  margin-top: 8rpx;
}

.order-msg-addr,
.order-msg-note {
  display: block;
  font-size: 22rpx;
  color: #64748b;
  margin-top: 8rpx;
  line-height: 1.5;
}
</style>
