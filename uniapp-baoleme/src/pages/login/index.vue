<template>
  <view class="login-page">
    <!-- 背景装饰 -->
    <view class="bg-orb bg-orb-1" />
    <view class="bg-orb bg-orb-2" />
    <view class="bg-orb bg-orb-3" />

    <view class="login-container">
      <!-- 品牌头部 -->
      <view class="brand-header">
        <view class="badge">
          <text class="badge-text">优秀毕业设计 / 课程设计联动系统</text>
        </view>
        <text class="brand-title">饱了么</text>
        <text class="brand-subtitle">智能膳食推荐 · 双端联动系统</text>
      </view>

      <!-- 吉祥物区域 -->
      <view class="mascot-area" @tap="handleMascotTap">
        <text class="mascot-emoji">🐱</text>
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

          <button class="btn-primary" @tap="handleRegister">注册账号</button>
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
          <button
            class="btn-primary"
            :class="{ loading: isLoading }"
            :disabled="isLoading"
            @tap="handleLogin"
          >
            <text v-if="isLoading">{{ loadingText }}</text>
            <text v-else>登录</text>
          </button>

          <!-- 注册入口 -->
          <view class="register-link">
            <text class="register-text">还没有账号？</text>
            <text class="register-btn" @tap="isRegisterMode = true">立即注册</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { MOCK_USER_PROFILES } from '../../data/dishes';
import type { UserProfile } from '../../types';

const authStore = useAuthStore();

const username = ref('xiaoming');
const password = ref('123456');
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
let mascotClickCount = 0;

const DEFAULT_USERS = [
  { username: 'xiaoming', password: '123456', role: 'client' },
  { username: 'admin', password: 'admin', role: 'merchant' }
];

function getAccounts() {
  const stored = uni.getStorageSync('baoleme_users');
  return stored ? JSON.parse(stored) : DEFAULT_USERS;
}

function saveAccount(u: string, p: string, r: 'client' | 'merchant') {
  const list = getAccounts();
  list.push({ username: u, password: p, role: r });
  uni.setStorageSync('baoleme_users', JSON.stringify(list));
}

function fillClient() {
  username.value = 'xiaoming';
  password.value = '123456';
}

function fillMerchant() {
  username.value = 'admin';
  password.value = 'admin';
}

function handleMascotTap() {
  mascotClickCount++;
  showBurp.value = true;
  setTimeout(() => { showBurp.value = false; }, 1800);
}

function handleLogin() {
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
  loadingText.value = '正在建立 API SSL 连接...';

  setTimeout(() => {
    loadingText.value = '查询 MySQL 用户角色中...';
    setTimeout(() => {
      isLoading.value = false;
      const normUser = username.value.trim().toLowerCase();

      const accounts = getAccounts();
      const found = accounts.find(
        (a: any) => a.username.toLowerCase() === normUser && a.password === password.value
      );

      if (!found) {
        errorMsg.value = '账号或密码错误，请重试';
        return;
      }

      if (found.role === 'client') {
        let profile: UserProfile;
        if (normUser === 'xiaoming') {
          profile = MOCK_USER_PROFILES[0];
        } else {
          profile = {
            id: 'u_' + Date.now(),
            name: found.username,
            phone: '139' + Math.floor(10000000 + Math.random() * 90000000),
            address: '北京市海淀区中关村互联网大厦C座18层研讨中心',
            favoriteCategory: '热销推荐',
            tags: ['快速干饭', '重口味辣党'],
            historyOrdersCount: 0,
          };
        }
        authStore.login('client', profile);
        uni.reLaunch({ url: '/pages/client/home' });
      } else if (found.role === 'merchant') {
        authStore.login('merchant');
        uni.reLaunch({ url: '/pages/merchant/analytics' });
      }
    }, 800);
  }, 600);
}

function handleRegister() {
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
  const accounts = getAccounts();
  if (accounts.find((a: any) => a.username.toLowerCase() === regUsername.value.toLowerCase())) {
    errorMsg.value = '该用户名已被注册';
    return;
  }
  saveAccount(regUsername.value, regPassword.value, registerRole.value);
  successMsg.value = '注册成功！请返回登录';
  setTimeout(() => {
    isRegisterMode.value = false;
    username.value = regUsername.value;
    password.value = regPassword.value;
  }, 1500);
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FFF7F2 0%, #FFF2E7 50%, #F2FAF6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 40rpx;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.bg-orb-1 {
  top: 80rpx; left: 60rpx;
  width: 400rpx; height: 400rpx;
  background: rgba(226, 92, 48, 0.05);
  filter: blur(80rpx);
}
.bg-orb-2 {
  bottom: 100rpx; right: 60rpx;
  width: 480rpx; height: 480rpx;
  background: rgba(231, 168, 75, 0.06);
  filter: blur(100rpx);
}
.bg-orb-3 {
  top: 33%; right: 25%;
  width: 360rpx; height: 360rpx;
  background: rgba(126, 168, 156, 0.05);
  filter: blur(80rpx);
}

.login-container {
  width: 100%;
  max-width: 680rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
  position: relative;
  z-index: 1;
}

.brand-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.badge {
  background: rgba(255,255,255,0.7);
  border: 1rpx solid rgba(226,92,48,0.15);
  border-radius: 100rpx;
  padding: 8rpx 24rpx;
}
.badge-text {
  font-size: 20rpx;
  color: #3C2F2B;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.brand-title {
  font-size: 72rpx;
  font-weight: 900;
  color: #FF6B35;
  letter-spacing: 4rpx;
}

.brand-subtitle {
  font-size: 24rpx;
  color: #7A6A65;
  font-weight: 500;
}

.mascot-area {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.mascot-emoji {
  font-size: 80rpx;
}
.burp-bubble {
  position: absolute;
  top: -60rpx;
  background: #FFFDF9;
  color: #FF6B35;
  font-size: 24rpx;
  font-weight: 700;
  padding: 10rpx 24rpx;
  border-radius: 20rpx;
  border: 2rpx solid #FFD0B9;
  white-space: nowrap;
}

.login-card {
  width: 100%;
  background: rgba(255,255,255,0.92);
  border-radius: 40rpx;
  padding: 48rpx 40rpx;
  box-shadow: 0 8rpx 40rpx rgba(226,92,48,0.08);
  border: 1rpx solid rgba(226,92,48,0.08);
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
  font-size: 40rpx;
  font-weight: 900;
  color: #2D3436;
  display: block;
  margin-bottom: 8rpx;
}
.card-subtitle {
  font-size: 24rpx;
  color: #94A3B8;
  display: block;
  margin-bottom: 32rpx;
}

.role-tabs {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
}
.role-tab {
  flex: 1;
  padding: 16rpx;
  border-radius: 16rpx;
  border: 2rpx solid #E2E8F0;
  text-align: center;
  font-size: 24rpx;
  font-weight: 600;
  color: #94A3B8;
  &.active {
    border-color: #FF6B35;
    background: #FFF3EF;
    color: #FF6B35;
  }
}

.form-group {
  margin-bottom: 24rpx;
}
.form-label {
  font-size: 24rpx;
  font-weight: 700;
  color: #2D3436;
  display: block;
  margin-bottom: 10rpx;
}
.form-input {
  width: 100%;
  background: #F8FAFC;
  border: 2rpx solid #E2E8F0;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: #2D3436;
  box-sizing: border-box;
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
}
.quick-fill-label {
  font-size: 22rpx;
  color: #94A3B8;
}
.quick-fill-btn {
  font-size: 22rpx;
  color: #FF6B35;
  font-weight: 600;
}
.quick-fill-sep {
  font-size: 22rpx;
  color: #CBD5E1;
}

.agreement-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
}
.checkbox {
  width: 36rpx;
  height: 36rpx;
  border-radius: 8rpx;
  border: 2rpx solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  &.checked {
    background: #FF6B35;
    border-color: #FF6B35;
  }
}
.check-icon {
  color: white;
  font-size: 22rpx;
  font-weight: 900;
}
.agreement-text {
  font-size: 22rpx;
  color: #7A8B8B;
  line-height: 1.5;
}

.error-msg {
  display: block;
  font-size: 22rpx;
  color: #EF4444;
  margin-bottom: 16rpx;
  font-weight: 600;
}
.success-msg {
  display: block;
  font-size: 22rpx;
  color: #10B981;
  margin-bottom: 16rpx;
  font-weight: 600;
}

.btn-primary {
  width: 100%;
  background: #FF6B35;
  color: white;
  font-size: 30rpx;
  font-weight: 700;
  padding: 28rpx;
  border-radius: 20rpx;
  border: none;
  margin-bottom: 24rpx;
  &.loading {
    opacity: 0.7;
  }
  &[disabled] {
    opacity: 0.7;
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
  font-size: 24rpx;
  color: #94A3B8;
}
.register-btn {
  font-size: 24rpx;
  color: #FF6B35;
  font-weight: 700;
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
  font-size: 20rpx;
  color: #A69792;
  font-weight: 700;
  letter-spacing: 2rpx;
  text-transform: uppercase;
}
.btn-sandbox {
  width: 100%;
  background: white;
  border: 2rpx solid #EFE3DB;
  border-radius: 20rpx;
  padding: 20rpx;
  font-size: 22rpx;
  color: #7A6A65;
  font-weight: 700;
  &.active {
    background: #3C2F2B;
    color: white;
    border-color: #3C2F2B;
  }
}
.sandbox-hint {
  font-size: 20rpx;
  color: #A69792;
  text-align: center;
  line-height: 1.6;
}
</style>
