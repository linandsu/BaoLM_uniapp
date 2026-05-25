<template>
  <view class="orders-page">
    <!-- 顶部导航 -->
    <view class="page-header" :style="safeTopStyle">
      <text class="page-title">我的订单</text>
    </view>

    <scroll-view class="orders-list" scroll-y>
      <view v-if="orders.length === 0" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无订单记录</text>
      </view>

      <view v-for="order in orders" :key="order.id" class="order-card">
        <view class="order-header">
          <text class="order-id">订单 #{{ order.id.slice(-8) }}</text>
          <text class="order-status" :class="'status-' + order.status">
            {{ statusLabels[order.status] }}
          </text>
        </view>

        <view class="order-items">
          <view v-for="item in order.items" :key="item.dish.id" class="order-item">
            <text class="item-name">{{ item.dish.name }}</text>
            <text class="item-qty">x{{ item.quantity }}</text>
            <text class="item-price">¥{{ (item.dish.price * item.quantity).toFixed(2) }}</text>
          </view>
        </view>

        <view class="order-footer">
          <view class="order-meta">
            <text class="order-time">{{ formatTime(order.createdAt) }}</text>
            <text class="order-address">📍 {{ order.address }}</text>
          </view>
          <text class="order-total">合计 ¥{{ order.totalPrice.toFixed(2) }}</text>
        </view>

        <view v-if="order.note" class="order-note">
          <text class="note-label">备注：</text>
          <text class="note-text">{{ order.note }}</text>
        </view>

        <!-- 进度条 -->
        <view class="order-progress">
          <view
            v-for="(step, idx) in progressSteps"
            :key="step.key"
            class="progress-step"
            :class="{
              active: isStepActive(order.status, step.key),
              done: isStepDone(order.status, step.key)
            }"
          >
            <view class="step-dot" />
            <text class="step-label">{{ step.label }}</text>
            <view v-if="idx < progressSteps.length - 1" class="step-line" />
          </view>
        </view>
      </view>
    </scroll-view>
    <CustomTabBar active="orders" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getOrders } from '../../api/orders';
import { useAuthStore } from '../../stores/auth';
import CustomTabBar from '../../components/CustomTabBar.vue';
import { useSafeTop } from '../../composables/useSafeTop';

const safeTopStyle = useSafeTop(16);
import type { Order, OrderStatus } from '../../types';

const authStore = useAuthStore();
const orders = ref<Order[]>([]);
let pollTimer: ReturnType<typeof setInterval> | null = null;

const statusLabels: Record<OrderStatus, string> = {
  pending: '⏳ 待接单',
  accepted: '✅ 已接单',
  cooking: '👨‍🍳 制作中',
  delivering: '🛵 配送中',
  completed: '🎉 已完成',
  cancelled: '❌ 已取消',
};

const progressSteps = [
  { key: 'pending', label: '下单' },
  { key: 'accepted', label: '接单' },
  { key: 'cooking', label: '制作' },
  { key: 'delivering', label: '配送' },
  { key: 'completed', label: '完成' },
];

const statusOrder: OrderStatus[] = ['pending', 'accepted', 'cooking', 'delivering', 'completed'];

function isStepDone(orderStatus: OrderStatus, stepKey: string): boolean {
  if (orderStatus === 'cancelled') return false;
  const orderIdx = statusOrder.indexOf(orderStatus);
  const stepIdx = statusOrder.indexOf(stepKey as OrderStatus);
  return stepIdx < orderIdx;
}

function isStepActive(orderStatus: OrderStatus, stepKey: string): boolean {
  return orderStatus === stepKey;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

async function fetchOrders() {
  try {
    const userId = authStore.userProfile?.id || 'u1';
    const all = await getOrders();
    orders.value = all
      .filter((o: Order) => o.userId === userId)
      .sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    console.error('Failed to fetch orders', e);
  }
}

onMounted(() => {
  fetchOrders();
  pollTimer = setInterval(fetchOrders, 2500);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<style lang="scss" scoped>
.orders-page {
  min-height: 100vh; min-height: 100dvh;
  background: #FCFAF9;
  display: flex;
  flex-direction: column;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom, 0px));
}

.page-header {
  background: linear-gradient(135deg, #e25c30 0%, #ec784f 50%, #efa888 100%);
  padding-left: 32rpx;
  padding-right: 32rpx;
  padding-bottom: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.page-title {
  color: white;
  font-size: 34rpx;
  font-weight: 900;
  text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.orders-list {
  flex: 1;
  padding: 24rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
  gap: 16rpx;
}

.empty-icon { font-size: 80rpx; }
.empty-text { color: #94A3B8; font-size: 26rpx; font-weight: 500; }

.order-card {
  background: white;
  border-radius: 28rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.04);
  border: 1rpx solid rgba(0,0,0,0.03);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #F1F5F9;
}

.order-id { font-size: 20rpx; color: #94A3B8; font-weight: 600; font-family: monospace; }

.order-status {
  font-size: 20rpx;
  font-weight: 800;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.status-pending { background: #FEF3C7; color: #92400E; }
.status-accepted { background: #DBEAFE; color: #1E40AF; }
.status-cooking { background: #FFF3EF; color: #E25C30; }
.status-delivering { background: #D1FAE5; color: #065F46; }
.status-completed { background: #E8F5E9; color: #2E7D32; }
.status-cancelled { background: #FEE2E2; color: #991B1B; }

.order-items { margin-bottom: 16rpx; }

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 0;
  border-bottom: 1rpx solid #F8FAFC;
}

.item-name { flex: 1; font-size: 24rpx; color: #2D3436; font-weight: 600; }
.item-qty { font-size: 22rpx; color: #94A3B8; margin: 0 16rpx; }
.item-price { font-size: 24rpx; color: #2D3436; font-weight: 700; }

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #F1F5F9;
}

.order-meta { display: flex; flex-direction: column; gap: 4rpx; }
.order-time { font-size: 20rpx; color: #94A3B8; }
.order-address { font-size: 20rpx; color: #7A8B8B; }
.order-total { font-size: 30rpx; font-weight: 900; color: #DC2626; }

.order-note {
  margin-top: 12rpx;
  padding: 12rpx 16rpx;
  background: #FFF8F5;
  border-radius: 16rpx;
  border: 1rpx solid rgba(226, 92, 48, 0.08);
  display: flex;
  gap: 8rpx;
}

.note-label { font-size: 20rpx; color: #E25C30; font-weight: 700; }
.note-text { font-size: 20rpx; color: #2D3436; flex: 1; }

.order-progress {
  display: flex;
  align-items: center;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #F1F5F9;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.step-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #E2E8F0;
  margin-bottom: 8rpx;
}

.progress-step.active .step-dot { background: #E25C30; box-shadow: 0 0 0 4rpx rgba(226, 92, 48, 0.2); }
.progress-step.done .step-dot { background: #059669; }

.step-label { font-size: 18rpx; color: #94A3B8; font-weight: 600; }
.progress-step.active .step-label { color: #E25C30; font-weight: 800; }
.progress-step.done .step-label { color: #059669; }

.step-line {
  position: absolute;
  top: 8rpx;
  left: 50%;
  width: 100%;
  height: 2rpx;
  background: #E2E8F0;
}

.progress-step.done .step-line { background: #059669; }
</style>
