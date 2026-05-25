<template>
  <view class="chat-page" :class="'mode-' + chatMode">
    <!-- 顶部：随模式变色 -->
    <view class="chat-header" :style="safeTopStyle">
      <view class="header-info header-full">
        <view class="mode-pill" :class="chatMode">
          <text class="mode-dot" />
          <text>{{ chatMode === 'bot' ? 'AI 模式' : '人工模式' }}</text>
        </view>
        <text class="header-title">
          {{ chatMode === 'bot' ? '🤖 小饱 · 智能客服' : '👨‍💼 商家真人客服' }}
        </text>
        <text class="header-subtitle">
          {{ chatMode === 'bot' ? '7×24 秒回 · 催单退款推荐菜品' : '真人商家在线 · 回复可能稍慢' }}
        </text>
      </view>
      <view
        v-if="chatMode === 'bot'"
        class="switch-btn switch-to-human tap-target"
        @tap="switchToHuman"
      >
        <text class="switch-icon">👨‍💼</text>
        <text>转人工</text>
      </view>
      <view v-else class="switch-btn switch-to-bot tap-target" @tap="switchToBot">
        <text>转 AI</text>
      </view>
    </view>

    <!-- 模式提示条 -->
    <view class="mode-banner" :class="[chatMode, { pulse: modeBannerPulse, spotlight: chatMode === 'human' }]">
      <view v-if="chatMode === 'human'" class="banner-live">
        <text class="live-dot" />
        <text>人工在线</text>
      </view>
      <text class="banner-icon">{{ chatMode === 'bot' ? '🤖' : '👨‍💼' }}</text>
      <view class="banner-copy">
        <text class="banner-title">
          {{ chatMode === 'bot' ? 'AI 小饱接待中' : '商家真人接待中' }}
        </text>
        <text class="banner-text">
          {{
            chatMode === 'bot'
              ? '智能秒回 · 可随时转接人工'
              : '您的消息已同步至商家工作台'
          }}
        </text>
      </view>
    </view>

    <scroll-view
      class="messages-area"
      scroll-y
      :scroll-into-view="scrollIntoView"
      scroll-with-animation
    >
      <template v-for="item in timeline" :key="item.kind === 'message' ? item.data.id : item.data.id">
        <ChatSystemNotice
          v-if="item.kind === 'system'"
          :type="item.data.type"
          :timestamp="item.data.timestamp"
          :animate="item.data.id === latestSystemEventId"
        />

        <view
          v-else
          class="message-row"
          :class="'role-' + item.data.role"
        >
          <view class="msg-avatar" :class="item.data.role">
            <text>{{ avatarForRole(item.data.role) }}</text>
          </view>
          <view class="msg-bubble">
            <text class="msg-role-label">{{ labelForRole(item.data.role) }}</text>
            <text class="msg-content">{{ item.data.content }}</text>
            <text class="msg-time">{{ formatTime(item.data.timestamp) }}</text>
          </view>
        </view>
      </template>

      <view v-if="isAiTyping" class="message-row role-assistant">
        <view class="msg-avatar assistant"><text>🤖</text></view>
        <view class="msg-bubble typing">
          <text class="dot">●</text>
          <text class="dot">●</text>
          <text class="dot">●</text>
        </view>
      </view>
      <view id="chat-bottom-anchor" class="scroll-anchor" />
    </scroll-view>

    <view class="input-bar" :class="chatMode">
      <input
        class="msg-input"
        v-model="typedMessage"
        :placeholder="
          chatMode === 'bot'
            ? '问小饱：催单、退款、推荐好吃的...'
            : '向商家真人提问，请描述清楚问题...'
        "
        @confirm="handleSend"
      />
      <view class="send-btn tap-target" @tap="handleSend">
        <text>发送</text>
      </view>
    </view>
    <CustomTabBar active="chat" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { getChatSession, getChatMessages, sendChatMessage, switchToHumanService, switchChatMode } from '../../api/chat';
import { useAuthStore } from '../../stores/auth';
import CustomTabBar from '../../components/CustomTabBar.vue';
import ChatSystemNotice from '../../components/ChatSystemNotice.vue';
import { useSafeTop } from '../../composables/useSafeTop';
import {
  loadSystemEvents,
  appendSystemEvent,
  buildChatTimeline,
  type ChatSystemEventType,
} from '../../utils/chatTimeline';
import type { Message } from '../../types';

const authStore = useAuthStore();
const messages = ref<Message[]>([]);
const systemEvents = ref(loadSystemEvents(''));
const typedMessage = ref('');
const isAiTyping = ref(false);
const chatMode = ref<'bot' | 'human'>('bot');
const sessionId = ref('');
const scrollIntoView = ref('');
const safeTopStyle = useSafeTop(12);
const modeBannerPulse = ref(false);
const latestSystemEventId = ref('');
let pollTimer: ReturnType<typeof setInterval> | null = null;
let bannerPulseTimer: ReturnType<typeof setTimeout> | null = null;

const timeline = computed(() => buildChatTimeline(messages.value, systemEvents.value));

function flashModeBanner() {
  modeBannerPulse.value = true;
  if (bannerPulseTimer) clearTimeout(bannerPulseTimer);
  bannerPulseTimer = setTimeout(() => {
    modeBannerPulse.value = false;
  }, 3200);
}

function recordModeSwitch(type: ChatSystemEventType) {
  if (!sessionId.value) return;
  const event = appendSystemEvent(sessionId.value, type);
  if (event) {
    systemEvents.value = loadSystemEvents(sessionId.value);
    latestSystemEventId.value = event.id;
    flashModeBanner();
    scrollToBottom();
  }
}

function avatarForRole(role: string) {
  if (role === 'user') return '👤';
  if (role === 'merchant') return '👨‍💼';
  return '🤖';
}

function labelForRole(role: string) {
  if (role === 'user') return '我';
  if (role === 'merchant') return '商家客服';
  return 'AI 小饱';
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

async function loadSession() {
  try {
    const userId = authStore.userProfile?.id || 'u1';
    sessionId.value = `session_${userId}`;
    systemEvents.value = loadSystemEvents(sessionId.value);
    const session = await getChatSession(userId);
    chatMode.value = session.mode;
    messages.value = await getChatMessages(sessionId.value);
    if (
      session.mode === 'human' &&
      !systemEvents.value.some((e) => e.type === 'switch_human')
    ) {
      appendSystemEvent(sessionId.value, 'switch_human');
      systemEvents.value = loadSystemEvents(sessionId.value);
    }
    scrollToBottom();
  } catch (e) {
    console.error('Failed to load chat session', e);
  }
}

async function syncMessages() {
  try {
    if (!sessionId.value) return;
    const msgs = await getChatMessages(sessionId.value);
    if (msgs.length !== messages.value.length) {
      messages.value = msgs;
      scrollToBottom();
    }
    const userId = authStore.userProfile?.id || 'u1';
    const session = await getChatSession(userId);
    if (session.mode !== chatMode.value) {
      const prev = chatMode.value;
      chatMode.value = session.mode;
      recordModeSwitch(session.mode === 'human' ? 'switch_human' : 'switch_bot');
      if (prev === 'bot' && session.mode === 'human') {
        uni.showToast({ title: '商家已接入人工', icon: 'none' });
      }
    }
  } catch (e) {}
}

async function handleSend() {
  const content = typedMessage.value.trim();
  if (!content) return;
  typedMessage.value = '';

  const userId = authStore.userProfile?.id || 'u1';
  const userMsg: Message = {
    id: 'tmp_' + Date.now(),
    role: 'user',
    content,
    timestamp: new Date().toISOString(),
  };
  messages.value.push(userMsg);
  scrollToBottom();

  if (chatMode.value === 'bot') {
    isAiTyping.value = true;
    try {
      await sendChatMessage({ sessionId: `session_${userId}`, role: 'user', content });
      const updated = await getChatMessages(`session_${userId}`);
      messages.value = updated;
    } catch (e) {
      console.error('Send failed', e);
    } finally {
      isAiTyping.value = false;
      scrollToBottom();
    }
  } else {
    try {
      await sendChatMessage({ sessionId: `session_${userId}`, role: 'user', content });
    } catch (e) {}
  }
}

async function switchToHuman() {
  try {
    if (!sessionId.value) return;
    await switchToHumanService(sessionId.value);
    chatMode.value = 'human';
    recordModeSwitch('switch_human');
    uni.showToast({ title: '已转接人工客服', icon: 'success' });
  } catch (e) {
    uni.showToast({ title: '转接失败，请重试', icon: 'none' });
  }
}

async function switchToBot() {
  try {
    if (!sessionId.value) return;
    await switchChatMode(sessionId.value, 'bot');
    chatMode.value = 'bot';
    recordModeSwitch('switch_bot');
    uni.showToast({ title: '已切换 AI 客服', icon: 'success' });
  } catch (e) {
    uni.showToast({ title: '切换失败，请重试', icon: 'none' });
  }
}

function scrollToBottom() {
  scrollIntoView.value = '';
  nextTick(() => {
    setTimeout(() => {
      scrollIntoView.value = 'chat-bottom-anchor';
    }, 80);
  });
}

onMounted(() => {
  loadSession();
  pollTimer = setInterval(syncMessages, 2500);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
  if (bannerPulseTimer) clearTimeout(bannerPulseTimer);
});
</script>

<style lang="scss" scoped>
.chat-page {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8fafc;

  &.mode-bot {
    --header-bg: linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #93c5fd 100%);
    --banner-bg: #eff6ff;
    --banner-text: #1e40af;
    --send-bg: linear-gradient(135deg, #3b82f6, #2563eb);
  }

  &.mode-human {
    --header-bg: linear-gradient(135deg, #047857 0%, #059669 50%, #34d399 100%);
    --banner-bg: #ecfdf5;
    --banner-text: #065f46;
    --send-bg: linear-gradient(135deg, #059669, #10b981);
  }
}

.chat-header {
  background: var(--header-bg);
  padding-left: 28rpx;
  padding-right: 28rpx;
  padding-bottom: 20rpx;
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  flex-shrink: 0;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.header-full {
  width: 100%;
}

.mode-pill {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 6rpx 14rpx;
  border-radius: 100rpx;
  margin-bottom: 10rpx;
  font-size: 20rpx;
  font-weight: 800;

  &.bot {
    background: rgba(255, 255, 255, 0.25);
    color: white;
  }

  &.human {
    background: rgba(255, 255, 255, 0.28);
    color: white;
  }
}

.mode-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 0 4rpx rgba(74, 222, 128, 0.35);
}

.header-title {
  color: white;
  font-size: 32rpx;
  font-weight: 900;
  display: block;
  line-height: 1.3;
}

.header-subtitle {
  color: rgba(255, 255, 255, 0.88);
  font-size: 20rpx;
  display: block;
  margin-top: 6rpx;
  font-weight: 500;
}

.switch-btn {
  border-radius: 100rpx;
  padding: 12rpx 22rpx;
  font-size: 22rpx;
  font-weight: 800;
  flex-shrink: 0;
  margin-top: 8rpx;
}

.switch-to-human {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: white;
  color: #047857;
  box-shadow: 0 6rpx 20rpx rgba(5, 150, 105, 0.28);
  border: 2rpx solid rgba(255, 255, 255, 0.9);
  animation: humanBtnGlow 2s ease-in-out infinite;
}

.switch-icon {
  font-size: 24rpx;
}

@keyframes humanBtnGlow {
  0%,
  100% {
    box-shadow: 0 6rpx 20rpx rgba(5, 150, 105, 0.28);
  }
  50% {
    box-shadow: 0 8rpx 28rpx rgba(5, 150, 105, 0.45);
  }
}

.switch-to-bot {
  background: rgba(255, 255, 255, 0.22);
  color: white;
  border: 2rpx solid rgba(255, 255, 255, 0.5);
}

.mode-banner {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 16rpx 28rpx;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  transition: background 0.35s ease;

  &.bot {
    background: var(--banner-bg);
  }

  &.human {
    background: linear-gradient(90deg, #ecfdf5 0%, #d1fae5 50%, #ecfdf5 100%);
    border-bottom: 2rpx solid rgba(5, 150, 105, 0.15);
  }

  &.pulse {
    animation: bannerPulse 0.9s ease-in-out 2;
  }

  &.spotlight::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 60%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
    animation: bannerShine 1.2s ease-out 1;
  }
}

.banner-live {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: #059669;
  color: white;
  font-size: 18rpx;
  font-weight: 800;
  padding: 6rpx 12rpx;
  border-radius: 100rpx;
  flex-shrink: 0;
}

.live-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #4ade80;
  animation: liveBlink 1.2s ease-in-out infinite;
}

.banner-icon {
  font-size: 36rpx;
  flex-shrink: 0;
}

.banner-copy {
  flex: 1;
  min-width: 0;
}

.banner-title {
  display: block;
  font-size: 24rpx;
  font-weight: 900;
  color: var(--banner-text);
  line-height: 1.3;
}

.banner-text {
  display: block;
  font-size: 20rpx;
  font-weight: 600;
  color: var(--banner-text);
  opacity: 0.85;
  line-height: 1.45;
  margin-top: 4rpx;
}

@keyframes bannerPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.01);
  }
}

@keyframes bannerShine {
  0% {
    left: -100%;
  }
  100% {
    left: 140%;
  }
}

@keyframes liveBlink {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.85);
  }
}

.messages-area {
  flex: 1;
  height: 0;
  padding: 20rpx 24rpx;
}

.scroll-anchor {
  height: 2rpx;
  width: 100%;
}

.message-row {
  display: flex;
  gap: 14rpx;
  margin-bottom: 28rpx;
  align-items: flex-start;
}

.role-user {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  flex-shrink: 0;
  background: #e2e8f0;

  &.assistant {
    background: #dbeafe;
  }

  &.merchant {
    background: #d1fae5;
  }

  &.user {
    background: #ffedd5;
  }
}

.msg-bubble {
  max-width: 72%;
  border-radius: 24rpx;
  padding: 18rpx 22rpx;
  box-shadow: 0 2rpx 12rpx rgba(15, 23, 42, 0.05);
}

.role-user .msg-bubble {
  background: linear-gradient(135deg, #e25c30, #ec784f);
  border: none;
}

.role-assistant .msg-bubble {
  background: white;
  border: 2rpx solid #bfdbfe;
}

.role-merchant .msg-bubble {
  background: linear-gradient(135deg, #047857, #10b981);
}

.msg-role-label {
  font-size: 20rpx;
  font-weight: 800;
  display: block;
  margin-bottom: 8rpx;
}

.role-user .msg-role-label {
  color: rgba(255, 255, 255, 0.85);
}

.role-assistant .msg-role-label {
  color: #2563eb;
}

.role-merchant .msg-role-label {
  color: rgba(255, 255, 255, 0.9);
}

.msg-content {
  font-size: 28rpx;
  line-height: 1.65;
  display: block;
  color: #1e293b;
}

.role-user .msg-content,
.role-merchant .msg-content {
  color: white;
}

.msg-time {
  font-size: 20rpx;
  display: block;
  margin-top: 8rpx;
}

.role-user .msg-time {
  color: rgba(255, 255, 255, 0.75);
  text-align: right;
}

.role-assistant .msg-time {
  color: #94a3b8;
}

.role-merchant .msg-time {
  color: rgba(255, 255, 255, 0.7);
  text-align: right;
}

.typing {
  display: flex;
  gap: 8rpx;
  align-items: center;
}

.dot {
  font-size: 20rpx;
  color: #60a5fa;
  animation: blink 1.2s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}
.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%,
  80%,
  100% {
    opacity: 0.3;
  }
  40% {
    opacity: 1;
  }
}

.input-bar {
  background: white;
  border-top: 1rpx solid #e2e8f0;
  padding: 16rpx 24rpx;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom, 0px));
  display: flex;
  gap: 16rpx;
  align-items: center;
  flex-shrink: 0;

  &.bot .msg-input:focus {
    border-color: #3b82f6;
  }

  &.human .msg-input:focus {
    border-color: #059669;
  }
}

.msg-input {
  flex: 1;
  min-height: 76rpx;
  background: #f8fafc;
  border: 2rpx solid #e2e8f0;
  border-radius: 40rpx;
  padding: 18rpx 24rpx;
  font-size: 28rpx;
  color: #1e293b;
  font-weight: 600;
}

.send-btn {
  min-height: 76rpx;
  min-width: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--send-bg);
  border-radius: 40rpx;
  padding: 16rpx 28rpx;
  color: white;
  font-size: 26rpx;
  font-weight: 800;
  box-shadow: 0 4rpx 12rpx rgba(15, 23, 42, 0.12);
}
</style>
