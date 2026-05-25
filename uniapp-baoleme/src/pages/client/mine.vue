<template>
  <view class="mine-page">
    <view class="header-bg" :style="safeTopStyle">
      <text class="page-title">个人信息</text>
      <text class="page-subtitle">账号与口味偏好</text>
    </view>

    <view class="main-content">
      <view class="info-card">
        <view class="avatar-section">
          <view class="avatar-wrap readonly">
            <image class="avatar-img" :src="displayProfile.avatar" mode="aspectFill" />
          </view>
        </view>

        <view class="form-section readonly">
          <view class="form-group">
            <text class="form-label">昵称</text>
            <view class="field-readonly">{{ displayProfile.name }}</view>
          </view>

          <view class="form-group">
            <text class="form-label">联系电话</text>
            <view class="field-readonly">{{ displayProfile.phone }}</view>
          </view>

          <view class="form-group">
            <text class="form-label">默认送餐地址</text>
            <view class="field-readonly field-multiline">{{ displayProfile.address }}</view>
          </view>

          <view class="form-group">
            <text class="form-label">口味偏好标签</text>
            <view class="tags-row">
              <view v-for="tag in displayProfile.tags" :key="tag" class="tag-item readonly-tag">
                <text>{{ tag }}</text>
              </view>
              <view v-if="displayProfile.tags.length === 0" class="field-readonly empty-tags">暂无标签</view>
            </view>
          </view>
        </view>

        <view class="btn-edit tap-target" @tap="openEditModal">修改个人信息</view>
        <view class="btn-logout tap-target" @tap="handleLogout">退出登录</view>
      </view>
    </view>

    <!-- 编辑弹窗 -->
    <view v-if="showEditModal" class="modal-overlay">
      <view class="modal-bg" @tap="closeEditModal" />
      <view class="modal-panel edit-panel" @tap.stop>
        <text class="modal-title">修改个人信息</text>

        <view class="avatar-section compact">
          <view class="avatar-wrap tap-target" @tap="chooseAvatar">
            <image class="avatar-img" :src="editProfile.avatar" mode="aspectFill" />
            <view class="avatar-edit-badge"><text>📷</text></view>
          </view>
          <text class="avatar-hint">点击更换头像</text>
        </view>

        <view class="form-group">
          <text class="form-label">昵称</text>
          <input class="form-input" v-model="editProfile.name" placeholder="请输入您的称呼" />
        </view>
        <view class="form-group">
          <text class="form-label">联系电话</text>
          <input class="form-input" v-model="editProfile.phone" type="number" placeholder="外卖员联系您的电话" />
        </view>
        <view class="form-group">
          <text class="form-label">默认送餐地址</text>
          <textarea
            class="form-textarea"
            v-model="editProfile.address"
            placeholder="请输入详细的送餐地址"
            :auto-height="true"
          />
        </view>
        <view class="form-group">
          <text class="form-label">口味偏好标签</text>
          <view class="tags-row">
            <view v-for="tag in editProfile.tags" :key="tag" class="tag-item">
              <text>{{ tag }}</text>
              <text class="tag-remove tap-target" @tap="removeTag(tag)">×</text>
            </view>
            <view class="tag-add tap-target" @tap="showAddTagModal = true"><text>+ 添加</text></view>
          </view>
        </view>

        <view class="modal-actions">
          <view class="btn-cancel tap-target" @tap="closeEditModal">取消</view>
          <view class="btn-confirm tap-target" @tap="confirmSaveProfile">保存信息</view>
        </view>
      </view>
    </view>

    <!-- 添加标签 -->
    <view v-if="showAddTagModal" class="modal-overlay tag-overlay">
      <view class="modal-bg" @tap="showAddTagModal = false" />
      <view class="modal-panel" @tap.stop>
        <text class="modal-title">添加口味标签</text>
        <input class="form-input" v-model="newTag" placeholder="如：少放辣、不要香菜" :focus="tagInputFocus" />
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
import { ref, onMounted, nextTick } from 'vue';
import { useAuthStore } from '../../stores/auth';
import CustomTabBar from '../../components/CustomTabBar.vue';
import { useSafeTop } from '../../composables/useSafeTop';
import {
  persistImage,
  resolveUserAvatar,
  setUserAvatarLocal,
  registerUserAvatar,
} from '../../utils/localImage';

const safeTopStyle = useSafeTop(24);
const authStore = useAuthStore();

const showEditModal = ref(false);
const showAddTagModal = ref(false);
const tagInputFocus = ref(false);
const newTag = ref('');

type ProfileForm = {
  name: string;
  avatar: string;
  phone: string;
  address: string;
  tags: string[];
};

const displayProfile = ref<ProfileForm>({
  name: '王小明',
  avatar: resolveUserAvatar(),
  phone: '13888888888',
  address: '北京市中关村科技园A座15层',
  tags: ['熬夜加班', '偏爱重口味', '快捷简餐'],
});

const editProfile = ref<ProfileForm>({ ...displayProfile.value });

function loadFromStore() {
  if (!authStore.userProfile) return;
  const p = authStore.userProfile;
  const data: ProfileForm = {
    name: p.name || '王小明',
    avatar: resolveUserAvatar(p.avatar),
    phone: p.phone || '13888888888',
    address: p.address || '北京市中关村科技园A座15层',
    tags: [...(p.tags || displayProfile.value.tags)],
  };
  displayProfile.value = { ...data };
  if (p.id) registerUserAvatar(p.id, data.avatar);
}

onMounted(loadFromStore);

function cloneProfile(src: ProfileForm): ProfileForm {
  return { ...src, tags: [...src.tags] };
}

function openEditModal() {
  editProfile.value = cloneProfile(displayProfile.value);
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
  showAddTagModal.value = false;
}

function chooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      if (!res.tempFilePaths?.length) return;
      try {
        const saved = await persistImage(res.tempFilePaths[0]);
        editProfile.value.avatar = saved;
        setUserAvatarLocal(saved);
      } catch {
        editProfile.value.avatar = res.tempFilePaths[0];
      }
    },
  });
}

function removeTag(tag: string) {
  editProfile.value.tags = editProfile.value.tags.filter((t) => t !== tag);
}

function addTag() {
  const t = newTag.value.trim();
  if (t && !editProfile.value.tags.includes(t)) {
    editProfile.value.tags.push(t);
  }
  newTag.value = '';
  showAddTagModal.value = false;
  tagInputFocus.value = false;
}

function confirmSaveProfile() {
  uni.showModal({
    title: '保存个人信息',
    content: '确认保存修改后的个人信息吗？',
    confirmText: '保存',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) applySave();
    },
  });
}

function applySave() {
  displayProfile.value = cloneProfile(editProfile.value);
  if (authStore.userProfile) {
    authStore.userProfile.name = displayProfile.value.name;
    authStore.userProfile.avatar = displayProfile.value.avatar;
    authStore.userProfile.phone = displayProfile.value.phone;
    authStore.userProfile.address = displayProfile.value.address;
    authStore.userProfile.tags = [...displayProfile.value.tags];
    uni.setStorageSync('baoleme_profile', JSON.stringify(authStore.userProfile));
    if (authStore.userProfile.id) {
      registerUserAvatar(authStore.userProfile.id, displayProfile.value.avatar);
    }
  }
  if (displayProfile.value.avatar) {
    setUserAvatarLocal(displayProfile.value.avatar);
  }
  showEditModal.value = false;
  uni.showToast({ title: '保存成功', icon: 'success' });
}

function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    confirmText: '退出',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        authStore.logout();
        uni.reLaunch({ url: '/pages/login/index' });
      }
    },
  });
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
  margin-bottom: 32rpx;

  &.compact {
    margin-bottom: 24rpx;
  }
}

.avatar-wrap {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  padding: 6rpx;
  background: linear-gradient(135deg, #ffd0b9, #e25c30);

  &.readonly {
    background: #e2e8f0;
  }
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
  background: #e25c30;
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
  color: #94a3b8;
  margin-top: 12rpx;
}

.form-group {
  margin-bottom: 28rpx;
}

.form-label {
  font-size: 24rpx;
  font-weight: 800;
  color: #64748b;
  display: block;
  margin-bottom: 10rpx;
}

.field-readonly {
  background: #f1f5f9;
  border: 1rpx solid #e2e8f0;
  border-radius: 20rpx;
  padding: 22rpx 24rpx;
  font-size: 28rpx;
  color: #64748b;
  font-weight: 600;
  line-height: 1.5;
}

.field-multiline {
  min-height: 100rpx;
}

.empty-tags {
  font-size: 24rpx;
  padding: 16rpx 20rpx;
}

.form-input,
.form-textarea {
  width: 100%;
  min-height: 80rpx;
  background: #fff;
  border: 2rpx solid #e2e8f0;
  border-radius: 20rpx;
  padding: 22rpx 24rpx;
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
  gap: 12rpx;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: #fff3ef;
  color: #e25c30;
  padding: 10rpx 20rpx;
  border-radius: 100rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.readonly-tag {
  background: #f1f5f9;
  color: #64748b;
  border: 1rpx solid #e2e8f0;
}

.tag-remove {
  font-size: 24rpx;
  color: rgba(226, 92, 48, 0.6);
}

.tag-add {
  padding: 10rpx 24rpx;
  border-radius: 100rpx;
  background: #f1f5f9;
  color: #64748b;
  font-size: 22rpx;
  font-weight: 600;
}

.btn-edit {
  width: 100%;
  background: linear-gradient(135deg, #e25c30, #ec784f);
  color: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  font-size: 28rpx;
  font-weight: 800;
  margin-top: 16rpx;
  text-align: center;
  box-shadow: 0 8rpx 24rpx rgba(226, 92, 48, 0.28);
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
}

.tag-overlay {
  z-index: 1100;
}

.modal-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.55);
}

.modal-panel {
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 32rpx;
  padding: 36rpx 32rpx;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
}

.edit-panel {
  max-width: 640rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 900;
  color: #1e293b;
  margin-bottom: 24rpx;
  display: block;
}

.modal-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 28rpx;
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
  background: linear-gradient(135deg, #e25c30, #ec784f);
  color: #fff;
  border-radius: 20rpx;
  font-size: 26rpx;
  font-weight: 800;
  text-align: center;
  padding: 24rpx 0;
}
</style>
