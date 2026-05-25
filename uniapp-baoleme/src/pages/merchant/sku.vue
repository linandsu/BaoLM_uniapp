<template>
  <view class="merchant-page">
    <view class="merchant-header">
      <text class="back-btn" @tap="uni.navigateBack()">←</text>
      <text class="header-title">🍽️ 菜品管理</text>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar">
      <input class="search-input" v-model="searchQuery" placeholder="搜索菜品名称..." />
      <button class="btn-add" @tap="showAddModal = true">+ 新增菜品</button>
    </view>

    <!-- 分类筛选 -->
    <scroll-view class="cat-filter" scroll-x>
      <view
        class="cat-chip"
        :class="{ active: filterCat === 'all' }"
        @tap="filterCat = 'all'"
      >全部</view>
      <view
        v-for="cat in categories"
        :key="cat.id"
        class="cat-chip"
        :class="{ active: filterCat === cat.name }"
        @tap="filterCat = cat.name"
      >{{ cat.name }}</view>
    </scroll-view>

    <!-- 菜品列表 -->
    <scroll-view class="dish-list" scroll-y>
      <view v-for="dish in filteredDishes" :key="dish.id" class="dish-row">
        <image class="dish-thumb" :src="dish.image" mode="aspectFill" />
        <view class="dish-info">
          <text class="dish-name">{{ dish.name }}</text>
          <text class="dish-cat">{{ dish.category }}</text>
          <view class="dish-meta">
            <text class="dish-price">¥{{ dish.price }}</text>
            <text class="dish-stock">库存: {{ dish.stock }}</text>
            <text class="dish-sales">销量: {{ dish.sales }}</text>
          </view>
        </view>
        <view class="dish-actions">
          <text
            class="toggle-btn"
            :class="dish.status === 'active' ? 'active' : 'inactive'"
            @tap="toggleDishStatus(dish)"
          >{{ dish.status === 'active' ? '上架' : '下架' }}</text>
          <text class="delete-btn" @tap="deleteDish(dish.id)">删除</text>
        </view>
      </view>

      <view v-if="filteredDishes.length === 0" class="empty-state">
        <text>暂无菜品</text>
      </view>
    </scroll-view>

    <!-- 新增菜品弹窗 -->
    <view v-if="showAddModal" class="modal-overlay" @tap.self="showAddModal = false">
      <view class="modal-panel">
        <view class="modal-header">
          <text class="modal-title">新增菜品</text>
          <text class="modal-close" @tap="showAddModal = false">×</text>
        </view>

        <scroll-view class="modal-body" scroll-y>
          <view class="form-group">
            <text class="form-label">菜品名称 *</text>
            <input class="form-input" v-model="form.name" placeholder="请输入菜品名称" />
          </view>
          <view class="form-group">
            <text class="form-label">价格 (元) *</text>
            <input class="form-input" v-model="form.price" type="digit" placeholder="如: 22.00" />
          </view>
          <view class="form-group">
            <text class="form-label">所属分类</text>
            <picker :range="categoryNames" :value="catIndex" @change="onCatChange">
              <view class="picker-display">
                <text>{{ form.category }}</text>
                <text>▼</text>
              </view>
            </picker>
          </view>
          <view class="form-group">
            <text class="form-label">菜品描述</text>
            <textarea class="form-textarea" v-model="form.description" placeholder="描述这道菜的特色..." />
          </view>
          <view class="form-group">
            <text class="form-label">初始库存</text>
            <input class="form-input" v-model="form.stock" type="number" placeholder="99" />
          </view>
          <view class="form-group">
            <text class="form-label">图片地址 (选填)</text>
            <input class="form-input" v-model="form.image" placeholder="Unsplash 图片链接" />
          </view>

          <button class="btn-submit" @tap="handleAddDish">确认上架入库</button>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getDishes, getCategories, addDish, deleteDish as apiDeleteDish, updateDishStatus } from '../../api/dishes';
import type { Dish, Category } from '../../types';

const dishes = ref<Dish[]>([]);
const categories = ref<Category[]>([]);
const searchQuery = ref('');
const filterCat = ref('all');
const showAddModal = ref(false);

const form = ref({
  name: '',
  price: '',
  category: '热销推荐',
  description: '',
  stock: '99',
  image: '',
});

const catIndex = computed(() => {
  const idx = categories.value.findIndex(c => c.name === form.value.category);
  return idx >= 0 ? idx : 0;
});

const categoryNames = computed(() => categories.value.map(c => c.name));

const filteredDishes = computed(() => {
  return dishes.value.filter(d => {
    const matchCat = filterCat.value === 'all' || d.category === filterCat.value;
    const matchSearch = !searchQuery.value || d.name.includes(searchQuery.value);
    return matchCat && matchSearch;
  });
});

function onCatChange(e: any) {
  form.value.category = categories.value[e.detail.value]?.name || '热销推荐';
}

async function fetchData() {
  try {
    dishes.value = await getDishes();
    categories.value = await getCategories();
  } catch (e) { console.error(e); }
}

async function toggleDishStatus(dish: Dish) {
  const newStatus = dish.status === 'active' ? 'inactive' : 'active';
  try {
    await updateDishStatus(dish.id, newStatus);
    await fetchData();
  } catch (e) {
    uni.showToast({ title: '操作失败', icon: 'none' });
  }
}

async function deleteDish(id: string) {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，确认吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await apiDeleteDish(id);
          await fetchData();
          uni.showToast({ title: '已删除', icon: 'success' });
        } catch (e) {
          uni.showToast({ title: '删除失败', icon: 'none' });
        }
      }
    }
  });
}

async function handleAddDish() {
  if (!form.value.name || !form.value.price) {
    uni.showToast({ title: '请填写菜品名称和价格', icon: 'none' });
    return;
  }
  try {
    await addDish({
      id: 'd_' + Date.now(),
      name: form.value.name,
      price: parseFloat(form.value.price),
      category: form.value.category,
      description: form.value.description,
      stock: parseInt(form.value.stock) || 99,
      image: form.value.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      sales: 0,
      status: 'active',
    });
    showAddModal.value = false;
    form.value = { name: '', price: '', category: '热销推荐', description: '', stock: '99', image: '' };
    await fetchData();
    uni.showToast({ title: '上架成功', icon: 'success' });
  } catch (e) {
    uni.showToast({ title: '上架失败', icon: 'none' });
  }
}

onMounted(fetchData);
</script>

<style lang="scss" scoped>
.merchant-page {
  min-height: 100vh;
  background: #F8FAFC;
  display: flex;
  flex-direction: column;
}

.merchant-header {
  background: linear-gradient(135deg, #2D3436, #636E72);
  padding: 60rpx 32rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.back-btn { color: white; font-size: 40rpx; font-weight: bold; padding: 8rpx 16rpx; }
.header-title { color: white; font-size: 36rpx; font-weight: 800; }

.search-bar {
  display: flex;
  gap: 16rpx;
  padding: 24rpx;
  background: white;
  border-bottom: 1rpx solid #E2E8F0;
}

.search-input {
  flex: 1;
  background: #F1F5F9;
  border-radius: 28rpx;
  padding: 16rpx 24rpx;
  font-size: 28rpx;
}

.btn-add {
  background: #E25C30;
  color: white;
  font-size: 26rpx;
  font-weight: 800;
  padding: 0 28rpx;
  border-radius: 28rpx;
  white-space: nowrap;
}

.cat-filter {
  white-space: nowrap;
  padding: 16rpx 24rpx;
  background: white;
  border-bottom: 1rpx solid #E2E8F0;
}

.cat-chip {
  display: inline-block;
  padding: 10rpx 24rpx;
  border-radius: 28rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: #64748B;
  background: #F1F5F9;
  margin-right: 12rpx;

  &.active {
    background: #E25C30;
    color: white;
  }
}

.dish-list { flex: 1; padding: 16rpx 24rpx; }

.dish-row {
  display: flex;
  gap: 20rpx;
  background: white;
  border-radius: 28rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.05);
  align-items: center;
}

.dish-thumb {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
}

.dish-info { flex: 1; }
.dish-name { font-size: 30rpx; font-weight: 800; color: #2D3436; display: block; }
.dish-cat { font-size: 22rpx; color: #94A3B8; display: block; margin-top: 4rpx; }

.dish-meta {
  display: flex;
  gap: 16rpx;
  margin-top: 8rpx;
}

.dish-price { font-size: 28rpx; font-weight: 800; color: #E25C30; }
.dish-stock, .dish-sales { font-size: 22rpx; color: #94A3B8; }

.dish-actions {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  align-items: center;
}

.toggle-btn {
  font-size: 22rpx;
  font-weight: 800;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;

  &.active { background: #D1FAE5; color: #065F46; }
  &.inactive { background: #FEE2E2; color: #991B1B; }
}

.delete-btn {
  font-size: 22rpx;
  color: #EF4444;
  padding: 8rpx 16rpx;
  background: #FEF2F2;
  border-radius: 12rpx;
}

.empty-state {
  text-align: center;
  padding: 80rpx 0;
  color: #94A3B8;
  font-size: 28rpx;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.modal-panel {
  background: white;
  border-radius: 32rpx 32rpx 0 0;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #E2E8F0;
}

.modal-title { font-size: 34rpx; font-weight: 800; color: #2D3436; }
.modal-close { font-size: 48rpx; color: #94A3B8; line-height: 1; }

.modal-body { padding: 24rpx 32rpx; }

.form-group { margin-bottom: 24rpx; }
.form-label { font-size: 26rpx; font-weight: 800; color: #475569; display: block; margin-bottom: 8rpx; }

.form-input {
  width: 100%;
  background: #F8FAFC;
  border: 1rpx solid #E2E8F0;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  background: #F8FAFC;
  border: 1rpx solid #E2E8F0;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  min-height: 120rpx;
  box-sizing: border-box;
}

.picker-display {
  display: flex;
  justify-content: space-between;
  background: #F8FAFC;
  border: 1rpx solid #E2E8F0;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
}

.btn-submit {
  width: 100%;
  background: #E25C30;
  color: white;
  font-size: 30rpx;
  font-weight: 800;
  padding: 28rpx 0;
  border-radius: 28rpx;
  margin-top: 16rpx;
}
</style>
