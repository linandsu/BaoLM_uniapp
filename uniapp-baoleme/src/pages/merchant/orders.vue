<template>
  <view class="merchant-page">
    <view class="merchant-header">
      <text class="back-btn" @tap="uni.navigateBack()">←</text>
      <text class="header-title">📋 订单管理</text>
    </view>

    <!-- 筛选 Tab -->
    <view class="filter-tabs">
      <view
        v-for="tab in filterTabs" :key="tab.key"
        class="filter-tab"
        :class="{ active: activeFilter === tab.key }"
        @tap="activeFilter = tab.key"
      >
        <text>{{ tab.label }}</text>
        <text v-if="tab.count > 0" class="tab-count">{{ tab.count }}</text>
      </view>
    </view>

    <scroll-view class="orders-list" scroll-y>
      <view v-if="filteredOrders.length === 0" class="empty-state">
        <text>暂无订单</text>
      </view>

      <view v-for="order in filteredOrders" :key="order.id" class="order-card">
        <view class="order-header">
          <text class="order-id">#{{ order.id.slice(-8) }}</text>
          <text class="order-time">{{ formatTime(order.createdAt) }}</text>
          <text class="order-status" :class="'status-' + order.status">{{ statusLabels[order.status] }}</text>
        </view>

        <view class="order-items">
          <view v-for="item in order.items" :key="item.dish.id" class="order-item">
            <text class="item-name">{{ item.dish.name }} x{{ item.quantity }}</text>
            <text class="item-price">¥{{ (item.dish.price * item.quantity).toFixed(2) }}</text>
          </view>
        </view>

        <view class="order-info">
          <text class="info-row">📍 {{ order.address }}</text>
          <text class="info-row">📞 {{ order.phone }}</text>
          <text v-if="order.note" class="info-row">📝 {{ order.note }}</text>
        </view>

        <view class="order-footer">
          <text class="order-total">合计 ¥{{ order.totalPrice.toFixed(2) }}</text>
          <view class="action-btns">
            <button
              v-if="order.status === 'pending'"
              class="btn-action btn-accept"
              @tap="updateOrderStatus(order.id, 'accepted')"
            >接单</button>
            <button
              v-if="order.status === 'accepted'"
              class="btn-action btn-cook"
              @tap="updateOrderStatus(order.id, 'cooking')"
            >开始制作</button>
            <button
              v-if="order.status === 'cooking'"
              class="btn-action btn-deliver"
              @tap="updateOrderStatus(order.id, 'delivering')"
            >派送</button>
            <button
              v-if="order.status === 'delivering'"
              class="btn-action btn-complete"
              @tap="updateOrderStatus(order.id, 'completed')"
            >完成</button>
            <button
              v-if="['pending', 'accepted'].includes(order.status)"
              class="btn-action btn-cancel"
              @tap="updateOrderStatus(order.id, 'cancelled')"
            >取消</button>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getOrders, updateOrder } from '../../api/orders';
import type { Order, OrderStatus } from '../../types';

const orders = ref<Order[]>([]);
const activeFilter = ref<'all' | 'pending' | 'active' | 'completed'>('all');
let pollTimer: ReturnType<typeof setInterval> | null = null;

const statusLabels: Record<OrderStatus, string> = {
  pending: '待接单', accepted: '已接单', cooking: '制作中',
  delivering: '配送中', completed: '已完成', cancelled: '已取消',
};

const filterTabs = computed(() => [
  { key: 'all', label: '全部', count: orders.value.length },
  { key: 'pending', label: '待处理', count: orders.value.filter(o => o.status === 'pending').length },
  { key: 'active', label: '进行中', count: orders.value.filter(o => ['accepted','cooking','delivering'].includes(o.status)).length },
  { key: 'completed', label: '已完成', count: orders.value.filter(o => ['completed','cancelled'].includes(o.status)).length },
]);

const filteredOrders = computed(() => {
  const sorted = [...orders.value].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  if (activeFilter.value === 'all') return sorted;
  if (activeFilter.value === 'pending') return sorted.filter(o => o.status === 'pending');
  if (activeFilter.value === 'active') return sorted.filter(o => ['accepted','cooking','delivering'].includes(o.status));
  return sorted.filter(o => ['completed','cancelled'].includes(o.status));
});

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth()+1}/${d.getDate()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
}

async function fetchOrders() {
  try { orders.value = await getOrders(); } catch (e) { console.error(e); }
}

async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    await updateOrder(orderId, { status });
    await fetchOrders();
    uni.showToast({ title: '状态已更新', icon: 'success' });
  } catch (e) {
    uni.showToast({ title: '操作失败', icon: 'error' });
  }
}

onMounted(() => { fetchOrders(); pollTimer = setInterval(fetchOrders, 2500); });
onUnmounted(() => { if (pollTimer) clearInterval(pollTimer); });
</script>

<style lang="scss" scoped>
.merchant-page { min-height: 100vh; background: #F8FAFC; display: flex; flex-direction: column; }

.merchant-header {
  background: linear-gradient(135deg, #2D3436, #636E72);
  padding: 60rpx 32rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.back-btn { color: white; font-size: 40rpx; font-weight: bold; padding: 8rpx 16rpx; }
.header-title { color: white; font-size: 36rpx; font-weight: 800; }

.filter-tabs {
  display: flex;
  background: white;
  border-bottom: 1rpx solid #E2E8F0;
  padding: 0 16rpx;
}

.filter-tab {
  flex: 1;
  text-align: center;
  padding: 24rpx 8rpx;
  font-size: 26rpx;
  color: #94A3B8;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.filter-tab.active { color: #FF6B35; border-bottom: 4rpx solid #FF6B35; font-weight: 700; }
.tab-count { background: #FF6B35; color: white; border-radius: 20rpx; padding: 2rpx 10rpx; font-size: 20rpx; }

.orders-list { flex: 1; padding: 24rpx; }

.empty-state { text-align: center; padding: 120rpx 0; color: #94A3B8; font-size: 28rpx; }

.order-card {
  background: white;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
}

.order-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
  flex-wrap: wrap;
}

.order-id { font-size: 24rpx; color: #94A3B8; font-weight: 600; }
.order-time { font-size: 22rpx; color: #94A3B8; flex: 1; }
.order-status { font-size: 22rpx; font-weight: 700; padding: 4rpx 12rpx; border-radius: 12rpx; }
.status-pending { background: #FFF3CD; color: #856404; }
.status-accepted { background: #D1ECF1; color: #0C5460; }
.status-cooking { background: #FFE5D0; color: #FF6B35; }
.status-delivering { background: #D4EDDA; color: #155724; }
.status-completed { background: #E8F5E9; color: #2E7D32; }
.status-cancelled { background: #F8D7DA; color: #721C24; }

.order-items { margin-bottom: 16rpx; }
.order-item { display: flex; justify-content: space-between; padding: 8rpx 0; border-bottom: 1rpx solid #F1F5F9; }
.item-name { font-size: 26rpx; color: #2D3436; }
.item-price { font-size: 26rpx; color: #FF6B35; font-weight: 600; }

.order-info { margin-bottom: 16rpx; }
.info-row { font-size: 24rpx; color: #64748B; display: block; margin-bottom: 6rpx; }

.order-footer { display: flex; justify-content: space-between; align-items: center; }
.order-total { font-size: 32rpx; font-weight: 800; color: #FF6B35; }

.action-btns { display: flex; gap: 12rpx; flex-wrap: wrap; }
.btn-action { font-size: 24rpx; font-weight: 700; padding: 12rpx 24rpx; border-radius: 16rpx; border: none; }
.btn-accept { background: #FF6B35; color: white; }
.btn-cook { background: #F59E0B; color: white; }
.btn-deliver { background: #10B981; color: white; }
.btn-complete { background: #3B82F6; color: white; }
.btn-cancel { background: #EF4444; color: white; }
</style>
