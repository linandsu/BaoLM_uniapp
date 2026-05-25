<template>
  <view class="merchant-page">
    <view class="merchant-header" :style="safeTopStyle">
      <text class="back-btn tap-target" @tap="onHeaderBack">←</text>
      <view class="header-text">
        <text class="header-title">💬 客服工作台</text>
        <text class="header-subtitle">
          {{ selectedSessionId ? '会话详情' : '选择用户开始接待' }}
        </text>
      </view>
      <view v-if="pendingHumanSessions > 0" class="header-badge">
        <text>{{ pendingHumanSessions }} 待接入</text>
      </view>
    </view>

    <!-- 会话列表（全屏） -->
    <scroll-view v-if="!selectedSessionId" class="session-page" scroll-y>
      <view class="list-hint">
        <text class="hint-title">待处理会话优先接入</text>
        <text class="hint-desc">人工接管后会话将高亮显示</text>
      </view>

      <view
        v-for="session in sortedSessions"
        :key="session.id"
        class="session-card tap-target"
        :class="{ human: session.mode === 'human', urgent: session.mode === 'human' && session.status === 'active' }"
        @tap="selectSession(session.id)"
      >
        <view class="session-avatar" :class="session.mode">
          <text>{{ session.userEmail?.charAt(0)?.toUpperCase() || 'U' }}</text>
        </view>
        <view class="session-body">
          <view class="session-top">
            <text class="session-user">{{ session.userEmail }}</text>
            <text class="session-status" :class="session.status">
              {{ session.status === 'active' ? '进行中' : '已结束' }}
            </text>
          </view>
          <view class="session-tags">
            <text class="mode-tag" :class="session.mode">
              {{ session.mode === 'human' ? '人工接管' : 'AI 接待中' }}
            </text>
          </view>
        </view>
        <text class="session-arrow">›</text>
      </view>

      <view v-if="sessions.length === 0" class="empty-sessions">
        <text class="empty-icon">💬</text>
        <text>暂无用户会话</text>
      </view>
    </scroll-view>

    <!-- 聊天详情（全屏） -->
    <view v-else class="chat-detail">
      <view class="chat-toolbar">
        <view class="toolbar-user">
          <text class="chat-user-name">{{ currentSession?.userEmail }}</text>
          <text class="mode-tag toolbar" :class="currentSession?.mode">
            {{ currentSession?.mode === 'human' ? '人工服务' : 'AI 自动回复' }}
          </text>
        </view>
        <view class="toolbar-actions">
          <view
            v-if="currentSession?.mode === 'bot'"
            class="takeover-btn tap-target"
            @tap="takeoverSession"
          >
            <text>接管人工</text>
          </view>
          <view
            v-if="currentSession?.mode === 'human'"
            class="resolve-btn tap-target"
            @tap="resolveSession"
          >
            <text>结束会话</text>
          </view>
        </view>
      </view>

      <scroll-view
        class="chat-messages"
        scroll-y
        :scroll-into-view="scrollIntoView"
        scroll-with-animation
      >
        <template
          v-for="item in timeline"
          :key="item.kind === 'message' ? item.data.id : item.data.id"
        >
          <ChatSystemNotice
            v-if="item.kind === 'system'"
            :type="item.data.type"
            :timestamp="item.data.timestamp"
            :animate="item.data.id === latestSystemEventId"
            side="merchant"
          />
          <view
            v-else
            class="message-row"
            :class="item.data.role"
          >
            <view class="msg-avatar">
              <text>{{ roleIcon(item.data.role) }}</text>
            </view>
            <view class="msg-bubble">
              <text class="msg-role-label">{{ roleLabel(item.data.role) }}</text>
              <text class="msg-content">{{ item.data.content }}</text>
              <text class="msg-time">{{ formatTime(item.data.timestamp) }}</text>
            </view>
          </view>
        </template>
        <view id="merchant-chat-anchor" class="scroll-anchor" />
      </scroll-view>

      <view v-if="currentSession?.mode === 'human'" class="reply-bar">
        <input
          class="reply-input"
          v-model="replyText"
          placeholder="输入回复，顾客会实时看到..."
          @confirm="sendReply"
        />
        <view class="send-btn tap-target" @tap="sendReply">
          <text>发送</text>
        </view>
      </view>
      <view v-else class="bot-mode-hint">
        <text class="hint-icon">🤖</text>
        <text>当前由 AI 小饱自动回复。如需真人接待，请点击「接管人工」</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import {
  getAllSessions,
  getSessionMessages,
  sendMerchantMessage,
  takeoverSession as apiTakeover,
  resolveSession as apiResolve,
} from '../../api/chat';
import type { Message } from '../../types';
import { goBack } from '../../utils/nav';
import { useSafeTop } from '../../composables/useSafeTop';
import ChatSystemNotice from '../../components/ChatSystemNotice.vue';
import {
  loadSystemEvents,
  appendSystemEvent,
  buildChatTimeline,
  type ChatSystemEventType,
} from '../../utils/chatTimeline';

const safeTopStyle = useSafeTop(12);
const sessions = ref<any[]>([]);
const selectedSessionId = ref<string | null>(null);
const chatMessages = ref<Message[]>([]);
const systemEvents = ref<ReturnType<typeof loadSystemEvents>>([]);
const replyText = ref('');
const scrollIntoView = ref('');
const latestSystemEventId = ref('');
let pollTimer: ReturnType<typeof setInterval> | null = null;
let lastSessionMode: Record<string, 'bot' | 'human'> = {};

const currentSession = computed(() =>
  sessions.value.find(s => s.id === selectedSessionId.value)
);

const pendingHumanSessions = computed(() =>
  sessions.value.filter(s => s.mode === 'human' && s.status === 'active').length
);

const sortedSessions = computed(() => {
  return [...sessions.value].sort((a, b) => {
    const score = (s: any) => {
      let v = 0;
      if (s.mode === 'human' && s.status === 'active') v += 100;
      if (s.status === 'active') v += 10;
      return v;
    };
    return score(b) - score(a);
  });
});

const timeline = computed(() => buildChatTimeline(chatMessages.value, systemEvents.value));

function recordModeSwitch(type: ChatSystemEventType) {
  if (!selectedSessionId.value) return;
  const event = appendSystemEvent(selectedSessionId.value, type);
  if (event) {
    systemEvents.value = loadSystemEvents(selectedSessionId.value);
    latestSystemEventId.value = event.id;
    scrollToBottom();
  }
}

function scrollToBottom() {
  scrollIntoView.value = '';
  nextTick(() => {
    setTimeout(() => {
      scrollIntoView.value = 'merchant-chat-anchor';
    }, 80);
  });
}

function roleIcon(role: string) {
  if (role === 'user') return '👤';
  if (role === 'merchant') return '👨‍💼';
  return '🤖';
}

function roleLabel(role: string) {
  if (role === 'user') return '顾客';
  if (role === 'merchant') return '商家客服';
  return 'AI 小饱';
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function onHeaderBack() {
  if (selectedSessionId.value) {
    selectedSessionId.value = null;
    chatMessages.value = [];
    return;
  }
  goBack('/pages/merchant/analytics');
}

async function fetchSessions() {
  try {
    const list = await getAllSessions();
    sessions.value = list;
    for (const s of list) {
      const prev = lastSessionMode[s.id];
      if (prev && prev !== s.mode && selectedSessionId.value === s.id) {
        recordModeSwitch(s.mode === 'human' ? 'switch_human' : 'switch_bot');
      }
      lastSessionMode[s.id] = s.mode;
    }
  } catch (e) {
    console.error(e);
  }
}

async function selectSession(id: string) {
  selectedSessionId.value = id;
  systemEvents.value = loadSystemEvents(id);
  const session = sessions.value.find((s) => s.id === id);
  if (session) lastSessionMode[id] = session.mode;
  await fetchMessages();
  scrollToBottom();
}

async function fetchMessages() {
  if (!selectedSessionId.value) return;
  try {
    const prevLen = chatMessages.value.length;
    chatMessages.value = await getSessionMessages(selectedSessionId.value);
    if (chatMessages.value.length !== prevLen) {
      scrollToBottom();
    }
  } catch (e) {
    console.error(e);
  }
}

async function sendReply() {
  if (!replyText.value.trim() || !selectedSessionId.value) return;
  try {
    await sendMerchantMessage(selectedSessionId.value, replyText.value.trim());
    replyText.value = '';
    await fetchMessages();
    scrollToBottom();
  } catch (e) {
    uni.showToast({ title: '发送失败', icon: 'none' });
  }
}

async function takeoverSession() {
  if (!selectedSessionId.value) return;
  try {
    await apiTakeover(selectedSessionId.value);
    recordModeSwitch('switch_human');
    lastSessionMode[selectedSessionId.value] = 'human';
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
    recordModeSwitch('switch_bot');
    selectedSessionId.value = null;
    chatMessages.value = [];
    systemEvents.value = [];
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

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<style lang="scss" scoped>
.merchant-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: #f1f5f9;
  display: flex;
  flex-direction: column;
}

.merchant-header {
  background: linear-gradient(135deg, #2d3436, #636e72);
  padding-left: 28rpx;
  padding-right: 28rpx;
  padding-bottom: 24rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-shrink: 0;
}

.back-btn {
  color: white;
  font-size: 40rpx;
  font-weight: bold;
  padding: 8rpx;
}

.header-text {
  flex: 1;
  min-width: 0;
}

.header-title {
  color: white;
  font-size: 34rpx;
  font-weight: 800;
  display: block;
}

.header-subtitle {
  color: rgba(255, 255, 255, 0.72);
  font-size: 22rpx;
  display: block;
  margin-top: 4rpx;
}

.header-badge {
  background: #e25c30;
  color: white;
  font-size: 20rpx;
  padding: 8rpx 16rpx;
  border-radius: 100rpx;
  font-weight: 800;
  flex-shrink: 0;
}

.session-page {
  flex: 1;
  height: 0;
  padding: 20rpx 24rpx calc(env(safe-area-inset-bottom, 0px) + 24rpx);
}

.list-hint {
  background: linear-gradient(135deg, #fff7ed, #fff);
  border: 1rpx solid rgba(226, 92, 48, 0.12);
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 20rpx;
}

.hint-title {
  font-size: 26rpx;
  font-weight: 800;
  color: #9a3412;
  display: block;
}

.hint-desc {
  font-size: 22rpx;
  color: #94a3b8;
  margin-top: 6rpx;
  display: block;
}

.session-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: white;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.06);

  &.human {
    border-left: 6rpx solid #059669;
  }

  &.urgent {
    background: linear-gradient(90deg, #ecfdf5 0%, #fff 40%);
    box-shadow: 0 6rpx 20rpx rgba(5, 150, 105, 0.12);
  }
}

.session-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 800;
  color: white;
  flex-shrink: 0;

  &.bot {
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
  }

  &.human {
    background: linear-gradient(135deg, #34d399, #059669);
  }
}

.session-body {
  flex: 1;
  min-width: 0;
}

.session-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12rpx;
}

.session-user {
  font-size: 28rpx;
  font-weight: 800;
  color: #1e293b;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-status {
  font-size: 20rpx;
  font-weight: 700;
  flex-shrink: 0;

  &.active {
    color: #059669;
  }

  &.resolved {
    color: #94a3b8;
  }
}

.session-tags {
  margin-top: 10rpx;
}

.mode-tag {
  font-size: 20rpx;
  font-weight: 800;
  padding: 6rpx 14rpx;
  border-radius: 100rpx;
  display: inline-block;

  &.bot {
    background: #eff6ff;
    color: #2563eb;
  }

  &.human {
    background: #ecfdf5;
    color: #047857;
  }

  &.toolbar {
    margin-top: 8rpx;
  }
}

.session-arrow {
  font-size: 40rpx;
  color: #cbd5e1;
  font-weight: 300;
}

.empty-sessions {
  padding: 120rpx 0;
  text-align: center;
  color: #94a3b8;
  font-size: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  align-items: center;
}

.empty-icon {
  font-size: 80rpx;
}

.chat-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.chat-toolbar {
  background: white;
  padding: 20rpx 24rpx;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
  border-bottom: 1rpx solid #e2e8f0;
  flex-shrink: 0;
}

.chat-user-name {
  font-size: 30rpx;
  font-weight: 900;
  color: #1e293b;
  display: block;
}

.toolbar-actions {
  flex-shrink: 0;
}

.takeover-btn {
  background: linear-gradient(135deg, #e25c30, #ec784f);
  color: white;
  font-size: 24rpx;
  padding: 14rpx 28rpx;
  border-radius: 100rpx;
  font-weight: 800;
  box-shadow: 0 4rpx 12rpx rgba(226, 92, 48, 0.25);
}

.resolve-btn {
  background: #f1f5f9;
  color: #64748b;
  font-size: 24rpx;
  padding: 14rpx 28rpx;
  border-radius: 100rpx;
  font-weight: 800;
}

.chat-messages {
  flex: 1;
  height: 0;
  padding: 24rpx;
  background: #f8fafc;
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

  &.user {
    flex-direction: row;
  }

  &.assistant,
  &.merchant {
    flex-direction: row-reverse;
  }
}

.msg-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  flex-shrink: 0;
}

.message-row.assistant .msg-avatar {
  background: #dbeafe;
}

.message-row.merchant .msg-avatar {
  background: #d1fae5;
}

.msg-bubble {
  max-width: 78%;
  border-radius: 24rpx;
  padding: 18rpx 22rpx;
  box-shadow: 0 2rpx 10rpx rgba(15, 23, 42, 0.05);
}

.message-row.user .msg-bubble {
  background: white;
  border: 1rpx solid #e2e8f0;
}

.message-row.assistant .msg-bubble {
  background: #eff6ff;
  border: 1rpx solid #bfdbfe;
}

.message-row.merchant .msg-bubble {
  background: linear-gradient(135deg, #059669, #10b981);
}

.msg-role-label {
  font-size: 20rpx;
  font-weight: 800;
  display: block;
  margin-bottom: 8rpx;
}

.message-row.user .msg-role-label {
  color: #64748b;
}

.message-row.assistant .msg-role-label {
  color: #2563eb;
}

.message-row.merchant .msg-role-label {
  color: rgba(255, 255, 255, 0.85);
}

.msg-content {
  font-size: 28rpx;
  line-height: 1.65;
  display: block;
  color: #1e293b;
}

.message-row.merchant .msg-content {
  color: white;
}

.msg-time {
  font-size: 20rpx;
  color: #94a3b8;
  display: block;
  margin-top: 8rpx;
  text-align: right;
}

.message-row.merchant .msg-time {
  color: rgba(255, 255, 255, 0.75);
}

.reply-bar {
  background: white;
  border-top: 1rpx solid #e2e8f0;
  padding: 16rpx 24rpx calc(env(safe-area-inset-bottom, 0px) + 16rpx);
  display: flex;
  gap: 16rpx;
  align-items: center;
  flex-shrink: 0;
}

.reply-input {
  flex: 1;
  min-height: 76rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 40rpx;
  padding: 18rpx 24rpx;
  font-size: 28rpx;
}

.send-btn {
  min-height: 76rpx;
  min-width: 128rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  font-size: 28rpx;
  font-weight: 800;
  border-radius: 40rpx;
}

.bot-mode-hint {
  background: #eff6ff;
  border-top: 1rpx solid #bfdbfe;
  padding: 24rpx 32rpx calc(env(safe-area-inset-bottom, 0px) + 24rpx);
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  flex-shrink: 0;
}

.hint-icon {
  font-size: 32rpx;
}

.bot-mode-hint text:last-child {
  flex: 1;
  color: #1e40af;
  font-size: 24rpx;
  line-height: 1.6;
  font-weight: 600;
}
</style>
