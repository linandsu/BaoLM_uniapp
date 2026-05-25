<template>
  <view class="client-home">
    <!-- 顶部导航 -->
    <view class="top-nav">
      <view class="nav-location">
        <text class="location-icon">📍</text>
        <text class="location-text">{{ address }}</text>
        <text class="shop-badge">自营店</text>
      </view>

      <!-- 用户画像切换 -->
      <view class="profile-row">
        <text class="profile-label">测试画像：</text>
        <picker
          :range="profileNames"
          :value="activeProfileIndex"
          @change="onProfileChange"
        >
          <view class="profile-picker">
            <text class="profile-name">{{ activeProfile.name }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>

      <!-- 首页/订单 Tab -->
      <view class="nav-tabs">
        <view
          class="nav-tab"
          :class="{ active: activeTab === 'home' }"
          @tap="activeTab = 'home'"
        >
          <text>🍽️ 点餐</text>
        </view>
        <view
          class="nav-tab"
          :class="{ active: activeTab === 'orders' }"
          @tap="goToOrders"
        >
          <text>📋 我的订单</text>
        </view>
      </view>
    </view>

    <!-- 主内容区 -->
    <view class="main-content">
      <!-- AI 推荐区域 -->
      <view class="ai-recommend-section">
        <view class="ai-header">
          <text class="ai-title">✨ AI 智能推荐</text>
          <text class="ai-subtitle">基于您的口味偏好，为您精选今日美食</text>
        </view>

        <!-- 标签编辑 -->
        <view class="tags-row">
          <view v-for="tag in customTags" :key="tag" class="tag-item">
            <text class="tag-text">{{ tag }}</text>
            <text class="tag-remove" @tap="removeTag(tag)">×</text>
          </view>
        </view>

        <view class="craving-row">
          <input
            class="craving-input"
            v-model="customCraving"
            placeholder="今天想吃什么？（可选）"
          />
          <button
            class="btn-recommend"
            :disabled="isRecommending"
            @tap="handleAIRecommend"
          >
            <text>{{ isRecommending ? '推荐中...' : '🤖 AI推荐' }}</text>
          </button>
        </view>

        <!-- 推荐结果 -->
        <view v-if="recommendation" class="recommend-result">
          <text class="recommend-title">{{ recommendation.recommendationTitle }}</text>
          <text class="recommend-reason">{{ recommendation.reason }}</text>
          <view v-for="item in recommendation.items" :key="item.dishId" class="recommend-item">
            <text class="recommend-dish-name">🍴 {{ item.dishName }}</text>
            <text class="recommend-dish-reason">{{ item.specialReason }}</text>
          </view>
        </view>
      </view>

      <!-- 分类 + 菜品区域 -->
      <view class="catalog-area">
        <!-- 分类侧边栏 -->
        <scroll-view class="category-sidebar" scroll-y>
          <view
            class="cat-item"
            :class="{ active: selectedCategory === 'all' }"
            @tap="selectedCategory = 'all'"
          >
            <text>全部</text>
          </view>
          <view
            v-for="cat in categories"
            :key="cat.id"
            class="cat-item"
            :class="{ active: selectedCategory === cat.name }"
            @tap="selectedCategory = cat.name"
          >
            <text>{{ cat.name }}</text>
          </view>
        </scroll-view>

        <!-- 菜品列表 -->
        <scroll-view class="dish-list" scroll-y>
          <view v-for="dish in filteredDishes" :key="dish.id" class="dish-card">
            <image class="dish-image" :src="dish.image" mode="aspectFill" />
            <view class="dish-info">
              <text class="dish-name">{{ dish.name }}</text>
              <text class="dish-desc">{{ dish.description }}</text>
              <view class="dish-meta">
                <text class="dish-sales">月售 {{ dish.sales }}</text>
                <text v-if="dish.stock <= 10" class="dish-stock-warn">仅剩 {{ dish.stock }}</text>
              </view>
              <view class="dish-bottom">
                <text class="dish-price">¥{{ dish.price }}</text>
                <view class="qty-control">
                  <text
                    v-if="cartStore.getQuantity(dish.id) > 0"
                    class="qty-btn qty-minus"
                    @tap="cartStore.removeItem(dish.id)"
                  >−</text>
                  <text
                    v-if="cartStore.getQuantity(dish.id) > 0"
                    class="qty-num"
                  >{{ cartStore.getQuantity(dish.id) }}</text>
                  <text
                    class="qty-btn qty-plus"
                    @tap="cartStore.addItem(dish)"
                  >+</text>
                </view>
              </view>
            </view>
          </view>

          <view v-if="filteredDishes.length === 0" class="empty-state">
            <text>该分类暂无菜品</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 购物车浮动按钮 -->
    <view
      v-if="cartStore.totalCount > 0"
      class="cart-fab"
      @tap="isCartOpen = true"
    >
      <text class="cart-icon">🛒</text>
      <text class="cart-count-badge">{{ cartStore.totalCount }}</text>
      <text class="cart-price">¥{{ cartStore.totalPrice.toFixed(2) }}</text>
      <text class="cart-checkout-text">去结算</text>
    </view>

    <!-- 购物车弹窗 -->
    <view v-if="isCartOpen" class="cart-overlay" @tap.self="isCartOpen = false">
      <view class="cart-panel">
        <view class="cart-header">
          <text class="cart-title">购物车</text>
          <text class="cart-clear" @tap="cartStore.clearCart(); isCartOpen = false">清空</text>
        </view>

        <scroll-view class="cart-items" scroll-y>
          <view v-for="item in cartStore.items" :key="item.dish.id" class="cart-item">
            <text class="cart-item-name">{{ item.dish.name }}</text>
            <view class="cart-item-right">
              <text class="cart-item-price">¥{{ (item.dish.price * item.quantity).toFixed(2) }}</text>
              <view class="qty-control">
                <text class="qty-btn qty-minus" @tap="cartStore.removeItem(item.dish.id)">−</text>
                <text class="qty-num">{{ item.quantity }}</text>
                <text class="qty-btn qty-plus" @tap="cartStore.addItem(item.dish)">+</text>
              </view>
            </view>
          </view>
        </scroll-view>

        <!-- 结算表单 -->
        <view class="checkout-form">
          <view class="form-row">
            <text class="form-label">📍 地址</text>
            <input class="form-input" v-model="address" placeholder="请输入送餐地址" />
          </view>
          <view class="form-row">
            <text class="form-label">📞 电话</text>
            <input class="form-input" v-model="phone" placeholder="请输入联系电话" />
          </view>
          <view class="form-row">
            <text class="form-label">📝 备注</text>
            <input class="form-input" v-model="note" placeholder="口味要求、特殊备注..." />
          </view>

          <view class="checkout-total">
            <text class="total-label">合计</text>
            <text class="total-price">¥{{ cartStore.totalPrice.toFixed(2) }}</text>
          </view>

          <button
            class="btn-place-order"
            :disabled="isCheckingOut"
            @tap="handlePlaceOrder"
          >
            <text>{{ isCheckingOut ? '提交中...' : '立即下单' }}</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 客服悬浮按钮 -->
    <view class="chat-fab" @tap="goToChat">
      <text class="chat-fab-icon">💬</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useCartStore } from '../../stores/cart';
import { useAuthStore } from '../../stores/auth';
import { getDishes, getCategories } from '../../api/dishes';
import { getOrders, placeOrder } from '../../api/orders';
import { getRecommendation } from '../../api/recommend';
import { MOCK_USER_PROFILES } from '../../data/dishes';
import type { Dish, Category, Order, Recommendation } from '../../types';

const cartStore = useCartStore();
const authStore = useAuthStore();

const activeTab = ref<'home' | 'orders'>('home');
const categories = ref<Category[]>([]);
const dishes = ref<Dish[]>([]);
const selectedCategory = ref('all');
const address = ref('北京市中关村科技园A座15层');
const phone = ref('13888888888');
const note = ref('');
const isCartOpen = ref(false);
const isCheckingOut = ref(false);

// AI 推荐
const recommendation = ref<Recommendation | null>(null);
const isRecommending = ref(false);
const customCraving = ref('');
const customTags = ref<string[]>([]);

// 用户画像
const activeProfile = ref(MOCK_USER_PROFILES[0]);
const profileNames = computed(() => MOCK_USER_PROFILES.map(p => p.name));
const activeProfileIndex = computed(() => MOCK_USER_PROFILES.findIndex(p => p.id === activeProfile.value.id));

const filteredDishes = computed(() => {
  if (selectedCategory.value === 'all') return dishes.value.filter(d => d.status === 'active');
  return dishes.value.filter(d => d.category === selectedCategory.value && d.status === 'active');
});

let pollTimer: ReturnType<typeof setInterval> | null = null;

onMounted(async () => {
  // 从 auth store 恢复用户画像
  if (authStore.userProfile) {
    const matched = MOCK_USER_PROFILES.find(p => p.id === authStore.userProfile!.id);
    if (matched) activeProfile.value = matched;
    customTags.value = authStore.userProfile.tags || [];
    address.value = authStore.userProfile.address || address.value;
    phone.value = authStore.userProfile.phone || phone.value;
  } else {
    customTags.value = activeProfile.value.tags || [];
  }

  await loadData();

  // 轮询刷新
  pollTimer = setInterval(() => {
    loadData();
  }, 2500);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});

async function loadData() {
  try {
    const [dishData, catData] = await Promise.all([getDishes(), getCategories()]);
    dishes.value = dishData;
    categories.value = catData;
  } catch (e) {
    console.error('加载数据失败', e);
  }
}

function onProfileChange(e: any) {
  const idx = e.detail.value;
  activeProfile.value = MOCK_USER_PROFILES[idx];
  customTags.value = activeProfile.value.tags || [];
}

function removeTag(tag: string) {
  customTags.value = customTags.value.filter(t => t !== tag);
}

async function handleAIRecommend() {
  isRecommending.value = true;
  recommendation.value = null;
  try {
    const result = await getRecommendation({
      tags: customTags.value,
      favoriteCategory: activeProfile.value.favoriteCategory,
      customCraving: customCraving.value,
    });
    recommendation.value = result;
  } catch (e) {
    uni.showToast({ title: '推荐失败，请重试', icon: 'none' });
  } finally {
    isRecommending.value = false;
  }
}

async function handlePlaceOrder() {
  if (cartStore.items.length === 0) {
    uni.showToast({ title: '购物车为空', icon: 'none' });
    return;
  }
  if (!address.value.trim()) {
    uni.showToast({ title: '请填写送餐地址', icon: 'none' });
    return;
  }

  isCheckingOut.value = true;
  try {
    await placeOrder({
      userId: authStore.userProfile?.id || 'u1',
      items: cartStore.items,
      totalPrice: cartStore.totalPrice,
      address: address.value,
      phone: phone.value,
      note: note.value,
    });
    cartStore.clearCart();
    isCartOpen.value = false;
    note.value = '';
    uni.showToast({ title: '下单成功！', icon: 'success' });
  } catch (e) {
    uni.showToast({ title: '下单失败，请重试', icon: 'none' });
  } finally {
    isCheckingOut.value = false;
  }
}

function goToOrders() {
  uni.navigateTo({ url: '/pages/client/orders' });
}

function goToChat() {
  uni.navigateTo({ url: '/pages/client/chat' });
}
</script>

<style lang="scss">
.client-home {
  min-height: 100vh;
  background: #FCFAF9;
  padding-bottom: 120rpx;
}

.top-nav {
  background: linear-gradient(135deg, #E25C30 0%, #EC784F 50%, #EFA888 100%);
  padding: calc(env(safe-area-inset-top, 40rpx) + 20rpx) 32rpx 24rpx;
  color: #fff;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    top: -40rpx; right: -40rpx;
    width: 240rpx; height: 240rpx;
    background: rgba(255,255,255,0.08);
    border-radius: 50%;
    filter: blur(40rpx);
  }
}

.nav-location {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.location-icon { font-size: 28rpx; }
.location-text { font-size: 24rpx; font-weight: 600; flex: 1; }
.shop-badge {
  background: rgba(255,255,255,0.2);
  padding: 4rpx 14rpx;
  border-radius: 20rpx;
  font-size: 18rpx;
  font-weight: 700;
}

.profile-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}
.profile-label { font-size: 20rpx; color: rgba(255,255,255,0.75); font-weight: 500; }
.profile-picker {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(255,90,32,0.5);
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
}
.profile-name { font-size: 22rpx; font-weight: 800; color: #fff; }
.picker-arrow { font-size: 18rpx; color: rgba(255,255,255,0.7); }

.nav-tabs {
  display: flex;
  background: rgba(255,90,32,0.4);
  border-radius: 20rpx;
  padding: 6rpx;
  gap: 6rpx;
}
.nav-tab {
  flex: 1;
  text-align: center;
  padding: 14rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  font-weight: 700;
  color: rgba(255,255,255,0.7);
  transition: all 0.2s;

  &.active {
    background: #fff;
    color: #E25C30;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
  }
}

.main-content {
  padding: 24rpx;
}

.ai-recommend-section {
  background: white;
  border-radius: 28rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(226, 92, 48, 0.05);
  border: 1rpx solid #FFF3EF;
  position: relative;
  overflow: hidden;
}

.ai-header { margin-bottom: 20rpx; }
.ai-title { font-size: 28rpx; font-weight: 800; color: #2D3436; display: block; }
.ai-subtitle { font-size: 20rpx; color: #94A3B8; display: block; margin-top: 4rpx; }

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 16rpx;
}
.tag-item {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: #FFF3EF;
  border: 1rpx solid rgba(226, 92, 48, 0.15);
  border-radius: 100rpx;
  padding: 6rpx 16rpx;
}
.tag-text { font-size: 20rpx; color: #E25C30; font-weight: 700; }
.tag-remove { font-size: 22rpx; color: rgba(226, 92, 48, 0.7); }

.craving-row {
  display: flex;
  gap: 16rpx;
  align-items: center;
}
.craving-input {
  flex: 1;
  background: #FCFAF9;
  border: 1rpx solid rgba(0,0,0,0.06);
  border-radius: 20rpx;
  padding: 16rpx 20rpx;
  font-size: 22rpx;
  font-weight: 600;
  &:focus {
    background: white;
    border-color: #E25C30;
  }
}
.btn-recommend {
  background: linear-gradient(135deg, #E25C30, #EC784F);
  color: #fff;
  border: none;
  border-radius: 20rpx;
  padding: 16rpx 24rpx;
  font-size: 22rpx;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 4rpx 12rpx rgba(226, 92, 48, 0.2);
}

.recommend-result {
  margin-top: 20rpx;
  background: #FFF8F5;
  border-radius: 20rpx;
  padding: 20rpx;
  border: 1rpx solid rgba(226, 92, 48, 0.12);
}
.recommend-title { font-size: 24rpx; font-weight: 800; color: #E25C30; display: block; margin-bottom: 8rpx; }
.recommend-reason { font-size: 20rpx; color: #7A8B8B; display: block; margin-bottom: 12rpx; }
.recommend-item { margin-bottom: 12rpx; }
.recommend-dish-name { font-size: 22rpx; font-weight: 700; color: #2D3436; display: block; }
.recommend-dish-reason { font-size: 20rpx; color: #94A3B8; display: block; }

.catalog-area {
  display: flex;
  gap: 0;
  background: white;
  border-radius: 28rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.03);
  border: 1rpx solid rgba(0,0,0,0.04);
  height: 900rpx;
}

.category-sidebar {
  width: 160rpx;
  background: #FAFAFA;
  border-right: 1rpx solid #F1F5F9;
}
.cat-item {
  padding: 28rpx 16rpx;
  font-size: 22rpx;
  color: #7A8B8B;
  text-align: center;
  border-bottom: 1rpx solid #F1F5F9;
  font-weight: 600;

  &.active {
    background: #fff;
    color: #E25C30;
    font-weight: 800;
    border-left: 4rpx solid #E25C30;
  }
}

.dish-list {
  flex: 1;
  padding: 16rpx;
}
.dish-card {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F1F5F9;
  transition: transform 0.15s;
  &:active { transform: translateY(-2rpx); }
}
.dish-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
  background: #F1F5F9;
}
.dish-info { flex: 1; }
.dish-name { font-size: 26rpx; font-weight: 800; color: #2D3436; display: block; }
.dish-desc { font-size: 18rpx; color: #94A3B8; display: block; margin: 6rpx 0; line-height: 1.5; }
.dish-meta { display: flex; gap: 12rpx; margin-bottom: 8rpx; }
.dish-sales { font-size: 18rpx; color: #94A3B8; }
.dish-stock-warn { font-size: 18rpx; color: #E25C30; font-weight: 700; }
.dish-bottom { display: flex; align-items: center; justify-content: space-between; }
.dish-price { font-size: 28rpx; font-weight: 900; color: #DC2626; }

.qty-control {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.qty-btn {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 700;
  transition: all 0.15s;

  &.qty-plus {
    background: #E25C30;
    color: #fff;
    box-shadow: 0 2rpx 8rpx rgba(226, 92, 48, 0.2);
    &:active { transform: scale(0.9); }
  }
  &.qty-minus { background: #F1F5F9; color: #2D3436; }
}
.qty-num { font-size: 26rpx; font-weight: 700; color: #2D3436; min-width: 32rpx; text-align: center; }

.empty-state {
  text-align: center;
  padding: 80rpx;
  color: #94A3B8;
  font-size: 24rpx;
}

.cart-fab {
  position: fixed;
  bottom: 40rpx;
  left: 32rpx;
  right: 32rpx;
  background: rgba(45, 52, 54, 0.95);
  backdrop-filter: blur(16rpx);
  border-radius: 60rpx;
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.25);
  z-index: 100;
}
.cart-icon { font-size: 36rpx; }
.cart-count-badge {
  background: #E25C30;
  color: #fff;
  border-radius: 50%;
  width: 40rpx;
  height: 40rpx;
  font-size: 20rpx;
  font-weight: 800;
  text-align: center;
  line-height: 40rpx;
  box-shadow: 0 0 0 4rpx rgba(45, 52, 54, 0.95);
}
.cart-price { font-size: 28rpx; font-weight: 900; color: #fff; flex: 1; }
.cart-checkout-text {
  background: #E25C30;
  color: #fff;
  padding: 12rpx 28rpx;
  border-radius: 40rpx;
  font-size: 22rpx;
  font-weight: 800;
  box-shadow: 0 4rpx 12rpx rgba(226, 92, 48, 0.25);
}

.cart-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}
.cart-panel {
  background: #fff;
  border-radius: 40rpx 40rpx 0 0;
  width: 100%;
  max-height: 80vh;
  padding: 36rpx;
  box-shadow: 0 -8rpx 32rpx rgba(0,0,0,0.1);
}
.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}
.cart-title { font-size: 30rpx; font-weight: 900; color: #2D3436; }
.cart-clear { font-size: 22rpx; color: #94A3B8; font-weight: 600; }
.cart-items { max-height: 400rpx; }
.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F1F5F9;
}
.cart-item-name { font-size: 24rpx; font-weight: 700; color: #2D3436; flex: 1; }
.cart-item-right { display: flex; align-items: center; gap: 16rpx; }
.cart-item-price { font-size: 24rpx; font-weight: 800; color: #DC2626; }

.checkout-form { margin-top: 24rpx; }
.form-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}
.form-label { font-size: 22rpx; color: #7A8B8B; white-space: nowrap; font-weight: 600; }
.form-input {
  flex: 1;
  background: #FCFAF9;
  border: 1rpx solid rgba(0,0,0,0.06);
  border-radius: 16rpx;
  padding: 14rpx 18rpx;
  font-size: 22rpx;
  font-weight: 600;
}
.checkout-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-top: 1rpx solid #F1F5F9;
  margin-bottom: 16rpx;
}
.total-label { font-size: 24rpx; color: #7A8B8B; }
.total-price { font-size: 36rpx; font-weight: 900; color: #DC2626; }
.btn-place-order {
  width: 100%;
  background: linear-gradient(135deg, #E25C30, #EC784F);
  color: #fff;
  border: none;
  border-radius: 24rpx;
  padding: 28rpx;
  font-size: 26rpx;
  font-weight: 800;
  text-align: center;
  box-shadow: 0 8rpx 20rpx rgba(226, 92, 48, 0.25);
}

.chat-fab {
  position: fixed;
  bottom: 160rpx;
  right: 32rpx;
  width: 96rpx;
  height: 96rpx;
  background: linear-gradient(135deg, #E25C30, #EC784F);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 24rpx rgba(226, 92, 48, 0.35);
  z-index: 100;
  border: 4rpx solid white;
}
.chat-fab-icon { font-size: 40rpx; }
</style>
