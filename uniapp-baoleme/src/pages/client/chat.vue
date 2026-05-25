<template>
  <view class="chat-page">
    <!-- 顶部导航 -->
    <view class="chat-header">
      <text class="back-btn" @tap="uni.navigateBack()">←</text>
      <view class="header-info">
        <text class="header-title">
          {{ chatMode === 'bot' ? '🤖 AI 智能客服' : '👨‍💼 人工客服' }}
        </text>
        <text class="header-subtitle">
          {{ chatMode === 'bot' ? '饱了么智能助手' : '商家真人服务中' }}
        </text>
      </view>
      <view
        v-if="chatMode === 'bot'"
        class="switch-human-btn"
        @tap="switchToHuman"
      >
        <text>转人工</text>
      </view>
      <view
        v-else
        class="switch-human-btn"
        @tap="switchToBot"
      >
        <text>转AI</text>
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view
      class="messages-area"
      scroll-y
      :scroll-top="scrollTop"
      :scroll-with-animation="true"
    >
      <view v-for="msg in messages" :key="msg.id" class="message-row" :class="'role-' + msg.role">
        <!-- 头像 -->
        <view class="msg-avatar">
          <text>{{ msg.role === 'user' ? '👤' : msg.role === 'merchant' ? '👨‍💼' : '🤖' }}</text>
        </view>
        <view class="msg-bubble">
          <text class="msg-content">{{ msg.content }}</text>
          <text class="msg-time">{{ formatTime(msg.timestamp) }}</text>
        </view>
      </view>

      <!-- AI 打字中 -->
      <view v-if="isAiTyping" class="message-row role-assistant">
        <view class="msg-avatar"><text>🤖</text></view>
        <view class="msg-bubble typing">
          <text class="dot">●</text>
          <text class="dot">●</text>
          <text class="dot">●</text>
        </view>
      </view>
    </scroll-view>

    <!-- 输入栏 -->
    <view class="input-bar">
      <input
        class="msg-input"
        v-model="typedMessage"
        :placeholder="chatMode === 'bot' ? '问点什么: 催单, 退款或推荐好吃...' : '说点什么，向商家直接提问...'"
        @confirm="handleSend"
      />
      <view class="send-btn" @tap="handleSend">
        <text>发送</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { getChatSession, getChatMessages, sendChatMessage, switchToHumanService, switchChatMode } from '../../api/chat';
import { useAuthStore } from '../../stores/auth';
import type { Message } from '../../types';

const authStore = useAuthStore();
const messages = ref<Message[]>([]);
const typedMessage = ref('');
const isAiTyping = ref(false);
const chatMode = ref<'bot' | 'human'>('bot');
const scrollTop = ref(0);
let pollTimer: ReturnType<typeof setInterval> | null = null;

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

async function loadSession() {
  try {
    const userId = authStore.userProfile?.id || 'u1';
    const session = await getChatSession(userId);
    chatMode.value = session.mode;
    const msgs = await getChatMessages(`session_${userId}`);
    messages.value = msgs;
    scrollToBottom();
  } catch (e) {
    console.error('Failed to load chat session', e);
  }
}

async function syncMessages() {
  try {
    const userId = authStore.userProfile?.id || 'u1';
    const msgs = await getChatMessages(`session_${userId}`);
    if (msgs.length !== messages.value.length) {
      messages.value = msgs;
      scrollToBottom();
    }
    const session = await getChatSession(userId);
    if (session.mode !== chatMode.value) {
      chatMode.value = session.mode;
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
    const userId = authStore.userProfile?.id || 'u1';
    await switchToHumanService(`session_${userId}`);
    chatMode.value = 'human';
    uni.showToast({ title: '已转接人工客服', icon: 'success' });
  } catch (e) {
    uni.showToast({ title: '转接失败，请重试', icon: 'none' });
  }
}

async function switchToBot() {
  try {
    const userId = authStore.userProfile?.id || 'u1';
    await switchChatMode(`session_${userId}`, 'bot');
    chatMode.value = 'bot';
    uni.showToast({ title: '已切换AI客服', icon: 'success' });
  } catch (e) {
    uni.showToast({ title: '切换失败，请重试', icon: 'none' });
  }
}

function scrollToBottom() {
  scrollTop.value = 0;
  nextTick(() => {
    scrollTop.value = 99999;
  });
}

onMounted(() => {
  loadSession();
  pollTimer = setInterval(syncMessages, 2500);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<style lang="scss" scoped>
.chat-page {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #F8FAFC;
  overflow: hidden;
}

.chat-header {
  background: linear-gradient(135deg, #E25C30 0%, #EC784F 50%, #EFA888 100%);
  padding: calc(env(safe-area-inset-top, 40rpx) + 20rpx) 32rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    top: -40rpx; right: -40rpx;
    width: 200rpx; height: 200rpx;
    background: rgba(255,255,255,0.08);
    border-radius: 50%;
  }
}

.back-btn {
  color: white;
  font-size: 40rpx;
  font-weight: bold;
  padding: 8rpx 16rpx;
}

.header-info { flex: 1; }
.header-title { color: white; font-size: 30rpx; font-weight: 900; display: block; text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1); }
.header-subtitle { color: rgba(255,255,255,0.8); font-size: 20rpx; display: block; font-weight: 500; }

.switch-human-btn {
  background: rgba(255,255,255,0.2);
  border: 1rpx solid rgba(255,255,255,0.4);
  border-radius: 24rpx;
  padding: 10rpx 24rpx;
  color: white;
  font-size: 22rpx;
  font-weight: 800;
  backdrop-filter: blur(8rpx);
}

.mode-badge.human {
  background: #4CAF50;
  border-radius: 20rpx;
  padding: 8rpx 20rpx;
  color: white;
  font-size: 24rpx;
  font-weight: 700;
}

.messages-area {
  flex: 1;
  padding: 24rpx;
  overflow-y: auto;
}

.message-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
  align-items: flex-start;
}

.role-user {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  flex-shrink: 0;
}

.msg-bubble {
  max-width: 70%;
  background: white;
  border-radius: 24rpx;
  padding: 20rpx 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
  border: 1rpx solid rgba(0,0,0,0.03);
}

.role-user .msg-bubble {
  background: linear-gradient(135deg, #E25C30, #EC784F);
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(226, 92, 48, 0.2);
}

.msg-content {
  font-size: 28rpx;
  color: #2D3436;
  line-height: 1.6;
  display: block;
}

.role-user .msg-content { color: white; }

.msg-time {
  font-size: 20rpx;
  color: #94A3B8;
  display: block;
  margin-top: 8rpx;
}

.role-user .msg-time { color: rgba(255,255,255,0.7); text-align: right; }

.typing {
  display: flex;
  gap: 8rpx;
  align-items: center;
  padding: 20rpx 24rpx;
}

.dot {
  font-size: 20rpx;
  color: #94A3B8;
  animation: blink 1.2s infinite;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes blink {
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}

.input-bar {
  background: white;
  border-top: 1rpx solid #F1F5F9;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom, 0px));
  display: flex;
  gap: 16rpx;
  align-items: center;
  flex-shrink: 0;
  box-shadow: 0 -2rpx 12rpx rgba(0,0,0,0.03);
}

.msg-input {
  flex: 1;
  background: #FCFAF9;
  border: 1rpx solid rgba(0,0,0,0.06);
  border-radius: 40rpx;
  padding: 16rpx 24rpx;
  font-size: 26rpx;
  color: #2D3436;
  font-weight: 600;
  &:focus {
    background: white;
    border-color: #E25C30;
    box-shadow: 0 0 0 2rpx rgba(226, 92, 48, 0.1);
  }
}

.send-btn {
  background: linear-gradient(135deg, #E25C30, #EC784F);
  border-radius: 40rpx;
  padding: 16rpx 32rpx;
  color: white;
  font-size: 26rpx;
  font-weight: 800;
  box-shadow: 0 4rpx 12rpx rgba(226, 92, 48, 0.2);
}
</style>
