<template>
  <view class="merchant-page">
    <view class="merchant-header" :style="safeTopStyle">
      <text class="back-btn tap-target" @tap="goBack">←</text>
      <text class="header-title">🍽️ 菜品管理</text>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar">
      <input class="search-input" v-model="searchQuery" placeholder="搜索菜品名称..." />
      <view class="btn-add tap-target" @tap="showAddModal = true">+ 新增菜品</view>
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
        <DishImage class="dish-thumb-wrap" :src="dish.image" img-class="dish-thumb" />
        <view class="dish-info">
          <view class="dish-title-row">
            <text class="dish-name">{{ dish.name }}</text>
            <text class="status-pill" :class="dish.status">
              {{ dish.status === 'active' ? '在售' : '已下架' }}
            </text>
          </view>
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
          >{{ dish.status === 'active' ? '下架' : '上架' }}</text>
          <text class="delete-btn" @tap="deleteDish(dish.id)">删除</text>
        </view>
      </view>

      <view v-if="filteredDishes.length === 0" class="empty-state">
        <text>暂无菜品</text>
      </view>
    </scroll-view>

    <!-- 新增菜品弹窗 -->
    <view v-if="showAddModal" class="modal-overlay">
      <view class="modal-bg" @tap="showAddModal = false"></view>
      <view class="modal-panel" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">新增菜品</text>
          <text class="modal-close" @tap="showAddModal = false">×</text>
        </view>

        <view class="modal-body">
          <view class="form-group">
            <text class="form-label">菜品名称 *</text>
            <input class="form-input" v-model="form.name" placeholder="请输入菜品名称" :adjust-position="true" />
          </view>
          <view class="form-group">
            <text class="form-label">价格 (元) *</text>
            <input class="form-input" v-model="form.price" type="digit" placeholder="如: 22.00" :adjust-position="true" />
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
            <input class="form-input" v-model="form.stock" type="number" placeholder="99" :adjust-position="true" />
          </view>
          <view class="form-group">
            <text class="form-label">菜品图片</text>
            <view class="image-picker tap-target" @tap="pickDishImage">
              <DishImage v-if="form.imagePreview" class="picker-preview" :src="form.imagePreview" />
              <view v-else class="picker-placeholder">
                <text class="picker-icon">📷</text>
                <text>从相册选择图片（保存到本机）</text>
              </view>
            </view>
            <text class="picker-hint">不再使用网络图片，加载更快</text>
          </view>

          <view class="btn-submit tap-target" @tap="handleAddDish">确认上架入库</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getDishes, getCategories, addDish, deleteDish as apiDeleteDish, updateDishStatus } from '../../api/dishes';
import type { Dish, Category } from '../../types';
import { goBack } from '../../utils/nav';
import { useSafeTop } from '../../composables/useSafeTop';
import DishImage from '../../components/DishImage.vue';
import {
  persistImage,
  resolveDishImage,
  setDishLocalImage,
  DISH_PLACEHOLDER,
} from '../../utils/localImage';

const safeTopStyle = useSafeTop(12);

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
  imagePreview: '' as string,
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
    const list = await getDishes();
    dishes.value = list.map((d) => ({
      ...d,
      image: resolveDishImage(d.id, d.image),
    }));
    categories.value = await getCategories();
  } catch (e) {
    console.error(e);
  }
}

function pickDishImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      if (!res.tempFilePaths?.length) return;
      try {
        const saved = await persistImage(res.tempFilePaths[0]);
        form.value.image = saved;
        form.value.imagePreview = saved;
        uni.showToast({ title: '图片已保存到本机', icon: 'success' });
      } catch {
        form.value.imagePreview = res.tempFilePaths[0];
        form.value.image = res.tempFilePaths[0];
      }
    },
  });
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
    const newId = 'd_' + Date.now();
    const imagePath = form.value.image || DISH_PLACEHOLDER;
    await addDish({
      id: newId,
      name: form.value.name,
      price: parseFloat(form.value.price),
      category: form.value.category,
      description: form.value.description,
      stock: parseInt(form.value.stock) || 99,
      image: imagePath,
      sales: 0,
      status: 'active',
    });
    if (form.value.image) {
      setDishLocalImage(newId, form.value.image);
    }
    showAddModal.value = false;
    form.value = {
      name: '',
      price: '',
      category: '热销推荐',
      description: '',
      stock: '99',
      image: '',
      imagePreview: '',
    };
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
  min-height: 100vh; min-height: 100dvh;
  background: #F8FAFC;
  display: flex;
  flex-direction: column;
}

.merchant-header {
  background: linear-gradient(135deg, #2d3436, #636e72);
  padding-left: 32rpx;
  padding-right: 32rpx;
  padding-bottom: 24rpx;
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
  min-height: 72rpx;
  background: #f1f5f9;
  border-radius: 28rpx;
  padding: 18rpx 24rpx;
  font-size: 28rpx;
}

.btn-add {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e25c30;
  color: white;
  font-size: 26rpx;
  font-weight: 800;
  padding: 0 28rpx;
  min-height: 72rpx;
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

.dish-thumb-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
  overflow: hidden;
}

.dish-thumb {
  width: 100%;
  height: 100%;
}

.image-picker {
  border: 2rpx dashed #cbd5e1;
  border-radius: 20rpx;
  overflow: hidden;
  min-height: 200rpx;
  background: #f8fafc;
}

.picker-preview {
  width: 100%;
  height: 200rpx;
}

.picker-placeholder {
  padding: 48rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  color: #64748b;
  font-size: 24rpx;
  font-weight: 600;
}

.picker-icon {
  font-size: 48rpx;
}

.picker-hint {
  font-size: 20rpx;
  color: #94a3b8;
  margin-top: 8rpx;
  display: block;
}

.dish-info { flex: 1; }
.dish-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}

.dish-name { font-size: 30rpx; font-weight: 800; color: #2D3436; }

.status-pill {
  font-size: 20rpx;
  font-weight: 800;
  padding: 4rpx 12rpx;
  border-radius: 100rpx;

  &.active {
    background: #d1fae5;
    color: #047857;
  }

  &.inactive {
    background: #f1f5f9;
    color: #64748b;
  }
}
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.modal-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 0;
}

.modal-panel {
  background: white;
  border-radius: 32rpx 32rpx 0 0;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
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

.modal-body {
  padding: 24rpx 32rpx;
  overflow-y: auto;
  max-height: 60vh;
  -webkit-overflow-scrolling: touch;
}

.form-group { margin-bottom: 24rpx; }
.form-label { font-size: 26rpx; font-weight: 800; color: #475569; display: block; margin-bottom: 8rpx; }

.form-input {
  width: 100%;
  min-height: 80rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 16rpx;
  padding: 22rpx 24rpx;
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
  background: #e25c30;
  color: white;
  font-size: 30rpx;
  font-weight: 800;
  padding: 28rpx 0;
  border-radius: 28rpx;
  margin-top: 16rpx;
  text-align: center;
}
</style>
