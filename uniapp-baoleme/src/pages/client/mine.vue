<template>
  <view class="mine-page">
    <view class="header-bg" :style="safeTopStyle">
      <text class="page-title">个人信息</text>
      <text class="page-subtitle">账号与口味偏好</text>
    </view>
    
    <view class="main-content">
      <view class="info-card">
        <!-- 头像区域 -->
        <view class="avatar-section">
          <view class="avatar-wrap" @tap="chooseAvatar">
            <image class="avatar-img" :src="profile.avatar" mode="aspectFill" />
            <view class="avatar-edit-badge">
              <text>📷</text>
            </view>
          </view>
          <text class="avatar-hint">点击修改头像</text>
        </view>
        
        <!-- 表单区域 -->
        <view class="form-section">
          <view class="form-group">
            <text class="form-label">昵称</text>
            <input class="form-input" v-model="profile.name" placeholder="请输入您的称呼" />
          </view>
          
          <view class="form-group">
            <text class="form-label">联系电话</text>
            <input class="form-input" v-model="profile.phone" type="number" placeholder="外卖员联系您的电话" />
          </view>
          
          <view class="form-group">
            <text class="form-label">默认送餐地址</text>
            <textarea class="form-textarea" v-model="profile.address" placeholder="请输入详细的送餐地址" :auto-height="true" />
          </view>
          
          <view class="form-group">
            <text class="form-label">口味偏好标签</text>
            <view class="tags-row">
              <view v-for="tag in profile.tags" :key="tag" class="tag-item">
                <text>{{ tag }}</text>
                <text class="tag-remove" @tap="removeTag(tag)">×</text>
              </view>
              <view class="tag-add" @tap="showAddTagModal = true">
                <text>+ 添加</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="btn-save tap-target" @tap="saveProfile">保存信息</view>
        <view class="btn-logout tap-target" @tap="handleLogout">退出登录</view>
      </view>
    </view>

    <!-- 添加标签弹窗 -->
    <view v-if="showAddTagModal" class="modal-overlay">
      <view class="modal-bg" @tap="showAddTagModal = false"></view>
      <view class="modal-panel" @tap.stop>
        <text class="modal-title">添加新口味标签</text>
        <input class="form-input" v-model="newTag" placeholder="如：少放辣、不要香菜" :focus="showAddTagModal" />
        <view class="modal-actions">
          <view class="btn-cancel tap-target" @tap="showAddTagModal = false">取消</view>
          <view class="btn-confirm tap-target" @tap="addTag">确定</view>
        </view>
      </view>
    </view>
    <CustomTabBar active="mine" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import CustomTabBar from '../../components/CustomTabBar.vue';
import { useSafeTop } from '../../composables/useSafeTop';
import { persistImage, resolveUserAvatar, setUserAvatarLocal } from '../../utils/localImage';

const safeTopStyle = useSafeTop(24);

const authStore = useAuthStore();
const showAddTagModal = ref(false);
const newTag = ref('');

const profile = ref({
  name: '王小明',
  avatar: resolveUserAvatar(),
  phone: '13888888888',
  address: '北京市中关村科技园A座15层',
  tags: ['热夜加班', '偏爱重口味', '快捷简餐']
});

onMounted(() => {
  if (authStore.userProfile) {
    profile.value.name = authStore.userProfile.name || '王小明';
    profile.value.avatar = authStore.userProfile.avatar || profile.value.avatar;
    profile.value.phone = authStore.userProfile.phone || profile.value.phone;
    profile.value.address = authStore.userProfile.address || profile.value.address;
    profile.value.tags = [...(authStore.userProfile.tags || profile.value.tags)];
  }
});

function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      if (!res.tempFilePaths?.length) return;
      try {
        const saved = await persistImage(res.tempFilePaths[0]);
        profile.value.avatar = saved;
        setUserAvatarLocal(saved);
        uni.showToast({ title: '头像已保存到本机', icon: 'success' });
      } catch {
        profile.value.avatar = res.tempFilePaths[0];
      }
    },
  });
}

function removeTag(tag: string) {
  profile.value.tags = profile.value.tags.filter(t => t !== tag);
}

function addTag() {
  if (newTag.value.trim() && !profile.value.tags.includes(newTag.value.trim())) {
    profile.value.tags.push(newTag.value.trim());
  }
  newTag.value = '';
  showAddTagModal.value = false;
}

function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    success: (res) => {
      if (res.confirm) {
        authStore.logout();
        uni.reLaunch({ url: '/pages/login/index' });
      }
    },
  });
}

function saveProfile() {
  if (authStore.userProfile) {
    authStore.userProfile.name = profile.value.name;
    authStore.userProfile.avatar = profile.value.avatar;
    authStore.userProfile.phone = profile.value.phone;
    authStore.userProfile.address = profile.value.address;
    authStore.userProfile.tags = [...profile.value.tags];
    if (profile.value.avatar) {
      setUserAvatarLocal(profile.value.avatar);
      authStore.userProfile.avatar = profile.value.avatar;
    }
  }
  uni.showToast({ title: '保存成功', icon: 'success' });
}
</script>

<style lang="scss" scoped>
.mine-page {
  min-height: 100vh;
  background: #fcfaf9;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom, 0px));
}

.header-bg {
  background: linear-gradient(135deg, #e25c30, #ec784f);
  padding-left: 32rpx;
  padding-right: 32rpx;
  padding-bottom: 56rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.page-title {
  font-size: 36rpx;
  color: #fff;
  font-weight: 900;
}

.page-subtitle {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 600;
}

.main-content {
  padding: 0 32rpx;
  margin-top: -30rpx;
  position: relative;
  z-index: 2;
}

.info-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 10rpx 30rpx rgba(226, 92, 48, 0.08);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
}

.avatar-wrap {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  padding: 6rpx;
  background: linear-gradient(135deg, #FFD0B9, #E25C30);
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4rpx solid #fff;
  box-sizing: border-box;
}

.avatar-edit-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #E25C30;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid #fff;
  font-size: 22rpx;
}

.avatar-hint {
  font-size: 20rpx;
  color: #94A3B8;
  margin-top: 16rpx;
}

.form-group {
  margin-bottom: 32rpx;
}

.form-label {
  font-size: 24rpx;
  font-weight: 800;
  color: #475569;
  display: block;
  margin-bottom: 12rpx;
}

.form-input,
.form-textarea {
  width: 100%;
  min-height: 80rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 20rpx;
  padding: 24rpx;
  font-size: 28rpx;
  color: #1e293b;
  font-weight: 600;
  box-sizing: border-box;
}

.form-textarea {
  min-height: 120rpx;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: #FFF3EF;
  color: #E25C30;
  padding: 10rpx 20rpx;
  border-radius: 100rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.tag-remove {
  font-size: 24rpx;
  color: rgba(226, 92, 48, 0.6);
  padding: 0 4rpx;
}

.tag-add {
  display: flex;
  align-items: center;
  padding: 10rpx 24rpx;
  border-radius: 100rpx;
  background: #F1F5F9;
  color: #64748B;
  font-size: 22rpx;
  font-weight: 600;
}

.btn-save {
  width: 100%;
  background: linear-gradient(135deg, #e25c30, #ec784f);
  color: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  font-size: 28rpx;
  font-weight: 800;
  margin-top: 40rpx;
  text-align: center;
  box-shadow: 0 8rpx 24rpx rgba(226, 92, 48, 0.3);
}

.btn-logout {
  width: 100%;
  background: #fff;
  color: #64748b;
  border: 2rpx solid #e2e8f0;
  border-radius: 24rpx;
  padding: 26rpx;
  font-size: 28rpx;
  font-weight: 700;
  margin-top: 20rpx;
  text-align: center;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
}
.modal-panel {
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 32rpx;
  padding: 40rpx;
  width: 80%;
}
.modal-title {
  font-size: 32rpx;
  font-weight: 900;
  color: #2D3436;
  margin-bottom: 24rpx;
  display: block;
}
.modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 32rpx;
}
.btn-cancel {
  flex: 1;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 20rpx;
  font-size: 26rpx;
  font-weight: 700;
  text-align: center;
  padding: 24rpx 0;
}
.btn-confirm {
  flex: 1;
  background: #e25c30;
  color: #fff;
  border-radius: 20rpx;
  font-size: 26rpx;
  font-weight: 700;
  text-align: center;
  padding: 24rpx 0;
}
</style>
