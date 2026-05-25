<template>
  <view class="login-root">
  <scroll-view class="login-page" scroll-y :enable-back-to-top="true">
    <!-- 背景装饰 -->
    <view class="bg-orb bg-orb-1" />
    <view class="bg-orb bg-orb-2" />
    <view class="bg-orb bg-orb-3" />

    <view class="login-container">
      <!-- 品牌头部 -->
      <view class="brand-header">
        <text class="brand-title">饱了么</text>
        <text class="brand-subtitle">智能膳食推荐 · 双端联动系统</text>
      </view>

      <!-- 吉祥物：饱饱 SVG -->
      <view class="mascot-area" @tap="handleMascotTap">
        <BaobaoMascot />
        <text v-if="showBurp" class="burp-bubble">嗝~ 好饱呀 喵~</text>
      </view>

      <!-- 登录卡片 -->
      <view class="login-card">
        <!-- 注册模式 -->
        <view v-if="isRegisterMode">
          <view class="card-header">
            <view class="back-btn" @tap="isRegisterMode = false">
              <text class="back-icon">←</text>
              <text class="back-text">返回登录</text>
            </view>
            <text class="card-title">创建新账号</text>
          </view>

          <!-- 角色选择 -->
          <view class="role-tabs">
            <view
              class="role-tab"
              :class="{ active: registerRole === 'client' }"
              @tap="registerRole = 'client'"
            >
              <text>📱 顾客端</text>
            </view>
            <view
              class="role-tab"
              :class="{ active: registerRole === 'merchant' }"
              @tap="registerRole = 'merchant'"
            >
              <text>💻 商家端</text>
            </view>
          </view>

          <view class="form-group">
            <text class="form-label">用户名</text>
            <input class="form-input" v-model="regUsername" placeholder="请输入用户名" />
          </view>
          <view class="form-group">
            <text class="form-label">密码</text>
            <input class="form-input" v-model="regPassword" :password="true" placeholder="请输入密码" />
          </view>
          <view class="form-group">
            <text class="form-label">确认密码</text>
            <input class="form-input" v-model="regConfirmPassword" :password="true" placeholder="请再次输入密码" />
          </view>

          <text v-if="successMsg" class="success-msg">{{ successMsg }}</text>
          <text v-if="errorMsg" class="error-msg">{{ errorMsg }}</text>

          <TapButton variant="primary" @tap="handleRegister">注册账号</TapButton>
        </view>

        <!-- 登录模式 -->
        <view v-else>
          <text class="card-title">欢迎回来</text>
          <text class="card-subtitle">登录您的饱了么账号</text>

          <view class="form-group">
            <text class="form-label">账号</text>
            <input
              class="form-input"
              v-model="username"
              placeholder="请输入用户名"
            />
          </view>

          <view class="form-group">
            <text class="form-label">密码</text>
            <view class="password-wrap">
              <input
                class="form-input password-input"
                v-model="password"
                :password="!showPassword"
                placeholder="请输入密码"
              />
              <text class="eye-btn" @tap="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </text>
            </view>
          </view>

          <!-- 快速填充提示 -->
          <view class="quick-fill">
            <text class="quick-fill-label">快速填充：</text>
            <text class="quick-fill-btn" @tap="fillClient">顾客(xiaoming)</text>
            <text class="quick-fill-sep">·</text>
            <text class="quick-fill-btn" @tap="fillMerchant">商家(admin)</text>
          </view>

          <!-- 协议勾选 -->
          <view class="agreement-row">
            <view
              class="checkbox"
              :class="{ checked: isAgreed }"
              @tap="isAgreed = !isAgreed"
            >
              <text v-if="isAgreed" class="check-icon">✓</text>
            </view>
            <text class="agreement-text">我已阅读并同意《用户协议》和《隐私政策》</text>
          </view>

          <text v-if="errorMsg" class="error-msg">{{ errorMsg }}</text>

          <!-- 登录按钮 -->
          <TapButton variant="primary" :disabled="isLoading" @tap="handleLogin">
            <text v-if="isLoading">{{ loadingText }}</text>
            <text v-else>登录</text>
          </TapButton>

          <!-- 注册入口 -->
          <view class="register-link">
            <text class="register-text">还没有账号？</text>
            <text class="register-btn" @tap="isRegisterMode = true">立即注册</text>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>

  <!-- 设置按钮与弹窗须在 scroll-view 外，否则 App 端输入框无法聚焦 -->
  <view class="settings-btn tap-target" :style="settingsBtnStyle" @tap.stop="openSettings">
    <text>⚙️</text>
  </view>

  <view v-if="showSettings" class="settings-overlay" @touchmove.stop.prevent>
    <view class="settings-backdrop" @tap="closeSettings" />
    <view class="settings-panel" @tap.stop>
      <text class="settings-title">后端连接设置</text>
      <text class="settings-desc">当前连接地址：</text>
      <input
        class="settings-input"
        v-model="backendUrl"
        type="text"
        placeholder="http://192.168.1.10:8081"
        :focus="settingsFocus"
        :adjust-position="true"
        :hold-keyboard="true"
        confirm-type="done"
      />
      <view class="settings-actions">
        <view class="settings-btn-cancel tap-target" @tap="closeSettings">
          <text>取消</text>
        </view>
        <view class="settings-btn-save tap-target" @tap="saveBackendUrl">
          <text>保存</text>
        </view>
      </view>
      <text class="settings-hint">提示：修改后需要重新登录生效</text>
    </view>
  </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import TapButton from '../../components/TapButton.vue';
import BaobaoMascot from '../../components/BaobaoMascot.vue';
import { useDeviceStore } from '../../stores/device';

const deviceStore = useDeviceStore();
const settingsBtnStyle = computed(() => ({
  top: `${(deviceStore.statusBarHeight || 44) + 8}px`,
}));
import { useAuthStore } from '../../stores/auth';
import { loginApi, registerApi } from '../../api/auth';
import { getBaseUrl, setBaseUrl } from '../../api/config';
import { registerUserAvatar, resolveUserAvatar } from '../../utils/localImage';

onMounted(() => deviceStore.init());

const showSettings = ref(false);
const settingsFocus = ref(false);
const backendUrl = ref(getBaseUrl());

function openSettings() {
  backendUrl.value = getBaseUrl();
  showSettings.value = true;
  settingsFocus.value = false;
  nextTick(() => {
    setTimeout(() => {
      settingsFocus.value = true;
    }, 350);
  });
}

function closeSettings() {
  showSettings.value = false;
  settingsFocus.value = false;
}

function saveBackendUrl() {
  const url = backendUrl.value.trim();
  if (url) {
    setBaseUrl(url);
    uni.showToast({ title: '已保存', icon: 'success' });
    closeSettings();
  }
}

const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const isAgreed = ref(true);
const isLoading = ref(false);
const loadingText = ref('');
const errorMsg = ref('');

const isRegisterMode = ref(false);
const registerRole = ref<'client' | 'merchant'>('client');
const regUsername = ref('');
const regPassword = ref('');
const regConfirmPassword = ref('');
const successMsg = ref('');

const showBurp = ref(false);

function fillClient() {
  username.value = 'xiaoming';
  password.value = '123456';
}

function fillMerchant() {
  username.value = 'admin';
  password.value = 'admin';
}

function handleMascotTap() {
  showBurp.value = true;
  setTimeout(() => { showBurp.value = false; }, 1800);
}

async function handleLogin() {
  errorMsg.value = '';
  if (!isAgreed.value) {
    errorMsg.value = '请阅读并勾选同意《用户协议》和《隐私政策》';
    return;
  }
  if (!username.value.trim() || !password.value.trim()) {
    errorMsg.value = '请填写账号与密码';
    return;
  }

  isLoading.value = true;
  loadingText.value = '正在登录...';

  try {
    const res = await loginApi(username.value.trim(), password.value);
    let profile = res.profile || null;
    if (profile && res.userId) {
      profile = { ...profile, id: profile.id || res.userId };
      const avatar = resolveUserAvatar(profile.avatar);
      if (avatar) registerUserAvatar(res.userId, avatar);
    }
    authStore.login(res.role, profile, res.token);
    uni.setStorageSync('baoleme_token', res.token);

    if (res.role === 'client') {
      uni.reLaunch({ url: '/pages/client/home' });
    } else {
      uni.reLaunch({ url: '/pages/merchant/analytics' });
    }
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || '登录失败，请检查网络';
    errorMsg.value = msg;
  } finally {
    isLoading.value = false;
  }
}

async function handleRegister() {
  errorMsg.value = '';
  successMsg.value = '';
  if (!regUsername.value.trim() || !regPassword.value.trim()) {
    errorMsg.value = '请填写用户名和密码';
    return;
  }
  if (regPassword.value !== regConfirmPassword.value) {
    errorMsg.value = '两次密码不一致';
    return;
  }
  try {
    await registerApi({
      username: regUsername.value.trim(),
      password: regPassword.value,
      role: registerRole.value,
    });
    successMsg.value = '注册成功！请返回登录';
    setTimeout(() => {
      isRegisterMode.value = false;
      username.value = regUsername.value;
      password.value = regPassword.value;
    }, 1500);
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || '注册失败';
    errorMsg.value = msg;
  }
}
</script>

<style lang="scss" scoped>
.login-root {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
}

.login-page {
  min-height: 100vh;
  min-height: 100dvh;
  height: 100vh;
  height: 100dvh;
  background: linear-gradient(160deg, #fff7f2 0%, #fff2e7 40%, #ffebe0 100%);
  box-sizing: border-box;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.bg-orb-1 {
  top: 60rpx; left: 40rpx;
  width: 500rpx; height: 500rpx;
  background: rgba(226, 92, 48, 0.06);
  filter: blur(100rpx);
  animation: floatOrb1 20s ease-in-out infinite;
}
.bg-orb-2 {
  bottom: 80rpx; right: 40rpx;
  width: 560rpx; height: 560rpx;
  background: rgba(231, 168, 75, 0.07);
  filter: blur(120rpx);
  animation: floatOrb2 24s ease-in-out infinite;
}
.bg-orb-3 {
  top: 30%; right: 20%;
  width: 400rpx; height: 400rpx;
  background: rgba(126, 168, 156, 0.06);
  filter: blur(90rpx);
  animation: floatOrb3 28s ease-in-out infinite;
}

@keyframes floatOrb1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40rpx, -35rpx) scale(1.08); }
  66% { transform: translate(-15rpx, 25rpx) scale(0.97); }
}
@keyframes floatOrb2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30rpx, 40rpx) scale(1.12); }
}
@keyframes floatOrb3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(25rpx, -25rpx) scale(0.95); }
}

.login-container {
  width: 90%;
  max-width: 680rpx;
  margin: 0 auto;
  padding: calc(env(safe-area-inset-top, 24rpx) + 72rpx) 5vw calc(env(safe-area-inset-bottom, 24rpx) + 40rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  position: relative;
  z-index: 1;
}

.brand-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.brand-title {
  font-size: 12vw;
  font-weight: 900;
  color: #E25C30;
  letter-spacing: 6rpx;
  text-shadow: 0 4rpx 16rpx rgba(226, 92, 48, 0.15);
}

.brand-subtitle {
  font-size: 22rpx;
  color: #7A6A65;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.mascot-area {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 0;
  animation: mascotBreath 4s ease-in-out infinite;
}

.burp-bubble {
  position: absolute;
  top: -48rpx;
  background: rgba(255, 253, 249, 0.95);
  color: #E25C30;
  font-size: 22rpx;
  font-weight: 800;
  padding: 10rpx 24rpx;
  border-radius: 20rpx;
  border: 2rpx solid #FFD0B9;
  white-space: nowrap;
  backdrop-filter: blur(8rpx);
  box-shadow: 0 4rpx 16rpx rgba(226, 92, 48, 0.1);
}

@keyframes mascotBreath {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-6rpx) scale(1.015); }
}

.login-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(40rpx) saturate(190%);
  border-radius: 8vw;
  padding: 6vw 5vw;
  border: 2rpx solid rgba(255, 255, 255, 0.95);
  box-shadow:
    0 12rpx 48rpx -12rpx rgba(226, 92, 48, 0.15),
    inset 0 2rpx 4rpx rgba(255, 255, 255, 0.8);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 32rpx;
}
.back-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  cursor: pointer;
}
.back-icon, .back-text {
  font-size: 24rpx;
  color: #FF6B35;
}

.card-title {
  font-size: 38rpx;
  font-weight: 900;
  color: #2D3436;
  display: block;
  margin-bottom: 8rpx;
}
.card-subtitle {
  font-size: 22rpx;
  color: #8C7B76;
  display: block;
  margin-bottom: 32rpx;
  font-weight: 500;
}

.role-tabs {
  display: flex;
  gap: 12rpx;
  margin-bottom: 32rpx;
  background: rgba(245, 245, 245, 0.6);
  border: 1rpx solid rgba(0,0,0,0.05);
  border-radius: 24rpx;
  padding: 8rpx;
}
.role-tab {
  flex: 1;
  padding: 16rpx;
  border-radius: 20rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  color: #94A3B8;
  transition: all 0.2s;
  &.active {
    background: white;
    color: #E25C30;
    box-shadow: 0 2rpx 12rpx rgba(226, 92, 48, 0.08);
    font-weight: 800;
  }
}

.form-group {
  margin-bottom: 24rpx;
}
.form-label {
  font-size: 20rpx;
  font-weight: 800;
  color: #8C7B76;
  display: block;
  margin-bottom: 10rpx;
  text-transform: uppercase;
  letter-spacing: 1rpx;
}
.form-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(4rpx);
  border: 2rpx solid rgba(226, 218, 211, 0.75);
  border-radius: 24rpx;
  padding: 22rpx 28rpx;
  font-size: 28rpx;
  color: #3B2E2A;
  font-weight: 600;
  box-sizing: border-box;
  min-height: 76rpx;
  position: relative;
  z-index: 2;
  transition: all 0.2s;
  &:focus {
    background: rgba(255, 255, 255, 0.95);
    border-color: #E25C30;
    box-shadow: 0 0 0 2rpx rgba(226, 92, 48, 0.15), 0 4rpx 12rpx rgba(226, 92, 48, 0.05);
  }
}

.password-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.password-input {
  flex: 1;
  padding-right: 80rpx;
}
.eye-btn {
  position: absolute;
  right: 20rpx;
  font-size: 32rpx;
}

.quick-fill {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
  background: #FAF7F5;
  border: 1rpx solid rgba(226, 92, 48, 0.1);
  padding: 16rpx 20rpx;
  border-radius: 20rpx;
}
.quick-fill-label {
  font-size: 20rpx;
  color: #A69792;
  font-weight: 700;
}
.quick-fill-btn {
  font-size: 22rpx;
  color: #E25C30;
  font-weight: 800;
  background: #FFF5F1;
  padding: 6rpx 14rpx;
  border-radius: 10rpx;
  border: 1rpx solid rgba(226, 92, 48, 0.1);
}
.quick-fill-sep {
  font-size: 22rpx;
  color: #CBD5E1;
}

.agreement-row {
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
  margin-bottom: 24rpx;
  background: #FAF7F5;
  border: 1rpx solid rgba(226, 92, 48, 0.1);
  padding: 20rpx;
  border-radius: 24rpx;
}
.checkbox {
  width: 36rpx;
  height: 36rpx;
  border-radius: 8rpx;
  border: 2rpx solid rgba(226, 92, 48, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2rpx;
  &.checked {
    background: #E25C30;
    border-color: #E25C30;
  }
}
.check-icon {
  color: white;
  font-size: 22rpx;
  font-weight: 900;
}
.agreement-text {
  font-size: 20rpx;
  color: #7A6A65;
  line-height: 1.6;
  font-weight: 500;
}

.error-msg {
  display: block;
  font-size: 20rpx;
  color: #DC2626;
  margin-bottom: 16rpx;
  font-weight: 700;
  background: rgba(254, 242, 242, 0.7);
  border: 1rpx solid rgba(220, 38, 38, 0.15);
  padding: 16rpx 20rpx;
  border-radius: 20rpx;
}
.success-msg {
  display: block;
  font-size: 20rpx;
  color: #059669;
  margin-bottom: 16rpx;
  font-weight: 700;
  background: rgba(236, 253, 245, 0.7);
  border: 1rpx solid rgba(5, 150, 105, 0.15);
  padding: 16rpx 20rpx;
  border-radius: 20rpx;
}

.btn-primary {
  width: 100%;
  background: linear-gradient(135deg, #FF7A45, #E25C30);
  color: white;
  font-size: 30rpx;
  font-weight: 900;
  padding: 26rpx;
  border-radius: 28rpx;
  border: none;
  margin-bottom: 24rpx;
  box-shadow: 0 12rpx 32rpx -8rpx rgba(226, 92, 48, 0.4);
  transition: all 0.2s;
  &.loading {
    opacity: 0.7;
    background: #D1D5DB;
    box-shadow: none;
  }
  &[disabled] {
    opacity: 0.7;
  }
  &:active {
    transform: scale(0.98);
  }
}

.register-link {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 8rpx;
}
.register-text {
  font-size: 22rpx;
  color: #94A3B8;
  font-weight: 500;
}
.register-btn {
  font-size: 22rpx;
  color: #E25C30;
  font-weight: 800;
}

.sandbox-section {
  margin-top: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}
.divider-line {
  width: 100%;
  height: 1rpx;
  background: #EFE3DB;
}
.sandbox-label {
  font-size: 18rpx;
  color: #A69792;
  font-weight: 800;
  letter-spacing: 3rpx;
  text-transform: uppercase;
}
.btn-sandbox {
  width: 100%;
  background: white;
  border: 2rpx solid #EFE3DB;
  border-radius: 24rpx;
  padding: 20rpx;
  font-size: 22rpx;
  color: #7A6A65;
  font-weight: 700;
  transition: all 0.2s;
  &.active {
    background: #3C2F2B;
    color: white;
    border-color: #3C2F2B;
    box-shadow: 0 4rpx 12rpx rgba(60, 47, 43, 0.22);
  }
}
.sandbox-hint {
  font-size: 18rpx;
  color: #A69792;
  text-align: center;
  line-height: 1.6;
  font-weight: 500;
}

.settings-btn {
  position: fixed;
  right: 4vw;
  width: 9vw;
  height: 9vw;
  border-radius: 50%;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(8rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5vw;
  z-index: 100;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
}

.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10vw;
}

.settings-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.settings-panel {
  background: white;
  border-radius: 6vw;
  padding: 6vw;
  width: 100%;
  max-width: 600rpx;
  box-shadow: 0 16rpx 48rpx rgba(0,0,0,0.15);
  position: relative;
  z-index: 1000;
}

.settings-title {
  font-size: 32rpx;
  font-weight: 900;
  color: #2D3436;
  display: block;
  margin-bottom: 16rpx;
}

.settings-desc {
  font-size: 22rpx;
  color: #8C7B76;
  display: block;
  margin-bottom: 12rpx;
}

.settings-input {
  width: 100%;
  height: 88rpx;
  line-height: 48rpx;
  background: #FCFAF9;
  border: 2rpx solid rgba(226, 218, 211, 0.75);
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
  font-size: 26rpx;
  color: #3B2E2A;
  font-weight: 600;
  box-sizing: border-box;
  margin-bottom: 24rpx;
}

.settings-actions {
  display: flex;
  gap: 16rpx;
}

.settings-btn-cancel {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 20rpx;
  background: #F1F5F9;
  color: #7A8B8B;
  font-size: 26rpx;
  font-weight: 700;
}

.settings-btn-save {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #E25C30, #EC784F);
  color: white;
  font-size: 26rpx;
  font-weight: 800;
}

.settings-hint {
  display: block;
  margin-top: 16rpx;
  font-size: 20rpx;
  color: #A69792;
  text-align: center;
}
</style>
