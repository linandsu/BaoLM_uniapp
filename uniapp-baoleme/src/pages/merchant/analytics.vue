<template>
  <view class="merchant-page">
    <!-- 顶部导航 -->
    <view class="merchant-header">
      <text class="header-title">💻 掌柜后台</text>
      <text class="header-subtitle">饱了么金牌自营旗舰店</text>
      <view class="header-actions">
        <text class="logout-btn" @tap="handleLogout">退出登录</text>
      </view>
    </view>

    <!-- 底部 Tab 导航 -->
    <view class="bottom-tabs">
      <view class="tab-item active" @tap="() => {}">
        <text class="tab-icon">📊</text>
        <text class="tab-label">概览</text>
      </view>
      <view class="tab-item" @tap="uni.navigateTo({ url: '/pages/merchant/orders' })">
        <text class="tab-icon">📋</text>
        <text class="tab-label">订单</text>
      </view>
      <view class="tab-item" @tap="uni.navigateTo({ url: '/pages/merchant/sku' })">
        <text class="tab-icon">🍽️</text>
        <text class="tab-label">菜品</text>
      </view>
      <view class="tab-item" @tap="uni.navigateTo({ url: '/pages/merchant/chat' })">
        <text class="tab-icon">💬</text>
        <text class="tab-label">客服</text>
      </view>
      <view class="tab-item" @tap="uni.navigateTo({ url: '/pages/merchant/database' })">
        <text class="tab-icon">🗄️</text>
        <text class="tab-label">DDL</text>
      </view>
    </view>

    <!-- 统计卡片 -->
    <scroll-view class="page-content" scroll-y>
      <view class="stats-grid">
        <view class="stat-card">
          <text class="stat-value">{{ totalOrders }}</text>
          <text class="stat-label">总订单数</text>
        </view>
        <view class="stat-card highlight">
          <text class="stat-value">¥{{ totalRevenue.toFixed(0) }}</text>
          <text class="stat-label">总营收</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ pendingOrders }}</text>
          <text class="stat-label">待处理</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ dishes.length }}</text>
          <text class="stat-label">在售菜品</text>
        </view>
      </view>

      <!-- 热销菜品 Top5 -->
      <view class="section">
        <text class="section-title">🔥 热销菜品 Top 5</text>
        <view v-for="(dish, idx) in topDishes" :key="dish.id" class="top-dish-item">
          <text class="rank-badge">{{ idx + 1 }}</text>
          <view class="dish-info">
            <text class="dish-name">{{ dish.name }}</text>
            <text class="dish-sales">月售 {{ dish.sales }} 份</text>
          </view>
          <text class="dish-price">¥{{ dish.price }}</text>
        </view>
      </view>

      <!-- 最近订单 -->
      <view class="section">
        <text class="section-title">📋 最近订单</text>
        <view v-for="order in recentOrders" :key="order.id" class="recent-order-item">
          <view class="order-info">
            <text class="order-id">#{{ order.id.slice(-6) }}</text>
            <text class="order-items-text">{{ order.items.map(i => i.dish.name).join('、') }}</text>
          </view>
          <view class="order-right">
            <text class="order-price">¥{{ order.totalPrice }}</text>
            <text class="order-status" :class="'status-' + order.status">{{ statusLabels[order.status] }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getDishes } from '../../api/dishes';
import { getOrders } from '../../api/orders';
import { useAuthStore } from '../../stores/auth';
import type { Dish, Order, OrderStatus } from '../../types';

const authStore = useAuthStore();
const dishes = ref<Dish[]>([]);
const orders = ref<Order[]>([]);
let pollTimer: ReturnType<typeof setInterval> | null = null;

const statusLabels: Record<OrderStatus, string> = {
  pending: '待接单', accepted: '已接单', cooking: '制作中',
  delivering: '配送中', completed: '已完成', cancelled: '已取消',
};

const totalOrders = computed(() => orders.value.length);
const totalRevenue = computed(() => orders.value.filter(o => o.status === 'completed').reduce((s, o) => s + o.totalPrice, 0));
const pendingOrders = computed(() => orders.value.filter(o => o.status === 'pending').length);
const topDishes = computed(() => [...dishes.value].sort((a, b) => b.sales - a.sales).slice(0, 5));
const recentOrders = computed(() => [...orders.value].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));

async function fetchData() {
  try {
    dishes.value = await getDishes();
    orders.value = await getOrders();
  } catch (e) { console.error(e); }
}

function handleLogout() {
  authStore.logout();
  uni.reLaunch({ url: '/pages/login/index' });
}

onMounted(() => {
  fetchData();
  pollTimer = setInterval(fetchData, 2500);
});
onUnmounted(() => { if (pollTimer) clearInterval(pollTimer); });
</script>

<style lang="scss" scoped>
.merchant-page {
  min-height: 100vh;
  background: #F8FAFC;
  display: flex;
  flex-direction: column;
  padding-bottom: 120rpx;
}

.merchant-header {
  background: linear-gradient(135deg, #2D3436, #636E72);
  padding: 60rpx 32rpx 24rpx;
  color: white;
}

.header-title { font-size: 40rpx; font-weight: 800; display: block; }
.header-subtitle { font-size: 24rpx; color: rgba(255,255,255,0.7); display: block; margin-top: 4rpx; }

.header-actions {
  margin-top: 16rpx;
  display: flex;
  justify-content: flex-end;
}

.logout-btn {
  background: rgba(255,255,255,0.15);
  color: white;
  font-size: 24rpx;
  padding: 8rpx 24rpx;
  border-radius: 28rpx;
}

.bottom-tabs {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1rpx solid #E2E8F0;
  display: flex;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 0;
  gap: 4rpx;
}

.tab-item.active .tab-icon,
.tab-item.active .tab-label { color: #E25C30; }

.tab-icon { font-size: 36rpx; }
.tab-label { font-size: 20rpx; color: #94A3B8; }

.page-content { flex: 1; padding: 24rpx; }

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.stat-card {
  background: white;
  border-radius: 28rpx;
  padding: 32rpx;
  text-align: center;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
}

.stat-card.highlight { background: linear-gradient(135deg, #E25C30, #EC784F); }
.stat-card.highlight .stat-value,
.stat-card.highlight .stat-label { color: white; }

.stat-value { font-size: 48rpx; font-weight: 800; color: #2D3436; display: block; }
.stat-label { font-size: 24rpx; color: #94A3B8; margin-top: 8rpx; display: block; }

.section { background: white; border-radius: 28rpx; padding: 32rpx; margin-bottom: 24rpx; }
.section-title { font-size: 30rpx; font-weight: 800; color: #2D3436; display: block; margin-bottom: 24rpx; }

.top-dish-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F1F5F9;
}

.rank-badge {
  width: 48rpx;
  height: 48rpx;
  background: #E25C30;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 800;
  flex-shrink: 0;
}

.dish-info { flex: 1; }
.dish-name { font-size: 28rpx; font-weight: 600; color: #2D3436; display: block; }
.dish-sales { font-size: 22rpx; color: #94A3B8; }
.dish-price { font-size: 28rpx; font-weight: 800; color: #E25C30; }

.recent-order-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F1F5F9;
}

.order-id { font-size: 24rpx; color: #94A3B8; font-weight: 600; display: block; }
.order-items-text { font-size: 26rpx; color: #2D3436; margin-top: 4rpx; display: block; }
.order-right { text-align: right; }
.order-price { font-size: 28rpx; font-weight: 800; color: #E25C30; display: block; }
.order-status { font-size: 22rpx; margin-top: 4rpx; display: block; }
.status-pending { color: #856404; }
.status-accepted { color: #0C5460; }
.status-cooking { color: #E25C30; }
.status-delivering { color: #155724; }
.status-completed { color: #2E7D32; }
.status-cancelled { color: #721C24; }
</style>
