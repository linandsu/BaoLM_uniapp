<template>
  <view class="merchant-page">
    <view class="merchant-header">
      <text class="back-btn" @tap="uni.navigateBack()">←</text>
      <text class="header-title">💬 客服工作台</text>
      <text class="header-badge" v-if="pendingHumanSessions > 0">{{ pendingHumanSessions }} 待接入</text>
    </view>

    <view class="chat-layout">
      <!-- 会话列表 -->
      <scroll-view class="session-list" scroll-y>
        <text class="list-title">用户会话</text>
        <view
          v-for="session in sessions"
          :key="session.id"
          class="session-item"
          :class="{ active: selectedSessionId === session.id, human: session.mode === 'human' }"
          @tap="selectSession(session.id)"
        >
          <view class="session-avatar">
            <text>{{ session.userEmail?.charAt(0)?.toUpperCase() || 'U' }}</text>
          </view>
          <view class="session-info">
            <text class="session-user">{{ session.userEmail }}</text>
            <text class="session-mode" :class="session.mode">
              {{ session.mode === 'human' ? '🔴 人工接管' : '🤖 AI客服' }}
            </text>
          </view>
          <text class="session-status" :class="session.status">
            {{ session.status === 'active' ? '进行中' : '已结束' }}
          </text>
        </view>

        <view v-if="sessions.length === 0" class="empty-sessions">
          <text>暂无活跃会话</text>
        </view>
      </scroll-view>

      <!-- 聊天区域 -->
      <view class="chat-area" v-if="selectedSessionId">
        <view class="chat-toolbar">
          <text class="chat-user-name">{{ currentSession?.userEmail }}</text>
          <view class="toolbar-actions">
            <text
              v-if="currentSession?.mode === 'bot'"
              class="takeover-btn"
              @tap="takeoverSession"
            >接管人工</text>
            <text
              v-if="currentSession?.mode === 'human'"
              class="resolve-btn"
              @tap="resolveSession"
            >结束会话</text>
          </view>
        </view>

        <scroll-view class="chat-messages" scroll-y :scroll-into-view="'msg-' + lastMsgId">
          <view
            v-for="msg in chatMessages"
            :key="msg.id"
            class="message-row"
            :class="msg.role"
            :id="'msg-' + msg.id"
          >
            <view class="msg-bubble">
              <text class="msg-role-label">
                {{ msg.role === 'user' ? '顾客' : msg.role === 'assistant' ? '🤖 AI' : '👨‍💼 商家' }}
              </text>
              <text class="msg-content">{{ msg.content }}</text>
              <text class="msg-time">{{ formatTime(msg.timestamp) }}</text>
            </view>
          </view>
        </scroll-view>

        <!-- 回复输入框（仅人工模式可用） -->
        <view class="reply-bar" v-if="currentSession?.mode === 'human'">
          <input
            class="reply-input"
            v-model="replyText"
            placeholder="输入回复内容..."
            @confirm="sendReply"
          />
          <button class="send-btn" @tap="sendReply">发送</button>
        </view>
        <view class="bot-mode-hint" v-else>
          <text>当前由 AI 自动回复，点击「接管人工」切换为真人服务</text>
        </view>
      </view>

      <!-- 未选中状态 -->
      <view class="no-session" v-else>
        <text class="no-session-icon">💬</text>
        <text class="no-session-text">请从左侧选择一个会话</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  getAllSessions,
  getSessionMessages,
  sendMerchantMessage,
  takeoverSession as apiTakeover,
  resolveSession as apiResolve,
} from '../../api/chat';
import type { ChatSession, Message } from '../../types';

const sessions = ref<any[]>([]);
const selectedSessionId = ref<string | null>(null);
const chatMessages = ref<Message[]>([]);
const replyText = ref('');
let pollTimer: ReturnType<typeof setInterval> | null = null;

const currentSession = computed(() =>
  sessions.value.find(s => s.id === selectedSessionId.value)
);

const pendingHumanSessions = computed(() =>
  sessions.value.filter(s => s.mode === 'human' && s.status === 'active').length
);

const lastMsgId = computed(() =>
  chatMessages.value.length > 0 ? chatMessages.value[chatMessages.value.length - 1].id : ''
);

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

async function fetchSessions() {
  try {
    sessions.value = await getAllSessions();
  } catch (e) { console.error(e); }
}

async function selectSession(id: string) {
  selectedSessionId.value = id;
  await fetchMessages();
}

async function fetchMessages() {
  if (!selectedSessionId.value) return;
  try {
    chatMessages.value = await getSessionMessages(selectedSessionId.value);
  } catch (e) { console.error(e); }
}

async function sendReply() {
  if (!replyText.value.trim() || !selectedSessionId.value) return;
  try {
    await sendMerchantMessage(selectedSessionId.value, replyText.value.trim());
    replyText.value = '';
    await fetchMessages();
  } catch (e) {
    uni.showToast({ title: '发送失败', icon: 'none' });
  }
}

async function takeoverSession() {
  if (!selectedSessionId.value) return;
  try {
    await apiTakeover(selectedSessionId.value);
    await fetchSessions();
    uni.showToast({ title: '已接管为人工服务', icon: 'success' });
  } catch (e) {
    uni.showToast({ title: '操作失败', icon: 'none' });
  }
}

async function resolveSession() {
  if (!selectedSessionId.value) return;
  try {
    await apiResolve(selectedSessionId.value);
    selectedSessionId.value = null;
    chatMessages.value = [];
    await fetchSessions();
    uni.showToast({ title: '会话已结束', icon: 'success' });
  } catch (e) {
    uni.showToast({ title: '操作失败', icon: 'none' });
  }
}

onMounted(() => {
  fetchSessions();
  pollTimer = setInterval(async () => {
    await fetchSessions();
    if (selectedSessionId.value) await fetchMessages();
  }, 2500);
});

onUnmounted(() => { if (pollTimer) clearInterval(pollTimer); });
</script>

<style lang="scss" scoped>
.merchant-page {
  min-height: 100vh; min-height: 100dvh;
  background: #F8FAFC;
  display: flex;
  flex-direction: column;
}

.merchant-header {
  background: linear-gradient(135deg, #2D3436, #636E72);
  padding: calc(env(safe-area-inset-top, 50rpx) + 20rpx) 32rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.back-btn { color: white; font-size: 40rpx; font-weight: bold; }
.header-title { color: white; font-size: 36rpx; font-weight: 800; flex: 1; }
.header-badge {
  background: #E25C30;
  color: white;
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 28rpx;
  font-weight: 800;
}

.chat-layout {
  flex: 1;
  display: flex;
  height: calc(100vh - 160rpx);
}

.session-list {
  width: 280rpx;
  background: white;
  border-right: 1rpx solid #E2E8F0;
  padding: 16rpx 0;
}

.list-title {
  font-size: 22rpx;
  color: #94A3B8;
  font-weight: 800;
  padding: 8rpx 24rpx 16rpx;
  display: block;
  text-transform: uppercase;
  letter-spacing: 2rpx;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  gap: 16rpx;
  border-bottom: 1rpx solid #F1F5F9;
  cursor: pointer;

  &.active { background: #FFF3EF; }
  &.human { border-left: 4rpx solid #E25C30; }
}

.session-avatar {
  width: 64rpx;
  height: 64rpx;
  background: #E25C30;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28rpx;
  font-weight: 800;
  flex-shrink: 0;
}

.session-info { flex: 1; min-width: 0; }
.session-user { font-size: 24rpx; font-weight: 600; color: #2D3436; display: block; }
.session-mode {
  font-size: 20rpx;
  display: block;
  margin-top: 4rpx;
  &.human { color: #E25C30; }
  &.bot { color: #94A3B8; }
}

.session-status {
  font-size: 20rpx;
  &.active { color: #22C55E; }
  &.resolved { color: #94A3B8; }
}

.empty-sessions {
  padding: 60rpx 24rpx;
  text-align: center;
  color: #94A3B8;
  font-size: 24rpx;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-toolbar {
  background: white;
  border-bottom: 1rpx solid #E2E8F0;
  padding: 20rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-user-name { font-size: 28rpx; font-weight: 800; color: #2D3436; }

.toolbar-actions { display: flex; gap: 16rpx; }

.takeover-btn {
  background: #E25C30;
  color: white;
  font-size: 24rpx;
  padding: 8rpx 24rpx;
  border-radius: 28rpx;
  font-weight: 800;
}

.resolve-btn {
  background: #E2E8F0;
  color: #64748B;
  font-size: 24rpx;
  padding: 8rpx 24rpx;
  border-radius: 28rpx;
  font-weight: 800;
}

.chat-messages {
  flex: 1;
  padding: 24rpx;
  background: #F8FAFC;
}

.message-row {
  margin-bottom: 24rpx;
  display: flex;

  &.user { justify-content: flex-start; }
  &.assistant, &.merchant { justify-content: flex-end; }
}

.msg-bubble {
  max-width: 70%;
  background: white;
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}

.message-row.user .msg-bubble { background: white; }
.message-row.assistant .msg-bubble { background: #FFF3EF; }
.message-row.merchant .msg-bubble { background: #E25C30; color: white; }

.msg-role-label {
  font-size: 20rpx;
  color: #94A3B8;
  display: block;
  margin-bottom: 6rpx;
  font-weight: 600;
}

.message-row.merchant .msg-role-label { color: rgba(255,255,255,0.7); }

.msg-content { font-size: 28rpx; line-height: 1.6; display: block; }
.msg-time { font-size: 20rpx; color: #94A3B8; display: block; margin-top: 6rpx; text-align: right; }
.message-row.merchant .msg-time { color: rgba(255,255,255,0.6); }

.reply-bar {
  background: white;
  border-top: 1rpx solid #E2E8F0;
  padding: 16rpx 24rpx;
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.reply-input {
  flex: 1;
  background: #F8FAFC;
  border: 1rpx solid #E2E8F0;
  border-radius: 40rpx;
  padding: 16rpx 24rpx;
  font-size: 28rpx;
}

.send-btn {
  background: #E25C30;
  color: white;
  font-size: 28rpx;
  padding: 16rpx 32rpx;
  border-radius: 40rpx;
  font-weight: 800;
  border: none;
}

.bot-mode-hint {
  background: #F8FAFC;
  border-top: 1rpx solid #E2E8F0;
  padding: 20rpx 32rpx;
  text-align: center;
  color: #94A3B8;
  font-size: 24rpx;
}

.no-session {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.no-session-icon { font-size: 80rpx; }
.no-session-text { color: #94A3B8; font-size: 28rpx; }
</style>
