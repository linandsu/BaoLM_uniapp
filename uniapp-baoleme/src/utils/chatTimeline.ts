import type { Message } from '../types';

export type ChatSystemEventType = 'switch_human' | 'switch_bot';

export interface ChatSystemEvent {
  id: string;
  type: ChatSystemEventType;
  timestamp: string;
}

export type ChatTimelineItem =
  | { kind: 'message'; data: Message }
  | { kind: 'system'; data: ChatSystemEvent };

function storageKey(sessionId: string) {
  return `baoleme_chat_events_${sessionId}`;
}

export function loadSystemEvents(sessionId: string): ChatSystemEvent[] {
  try {
    const raw = uni.getStorageSync(storageKey(sessionId));
    if (!raw) return [];
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSystemEvents(sessionId: string, events: ChatSystemEvent[]) {
  uni.setStorageSync(storageKey(sessionId), JSON.stringify(events));
}

/** 追加一条模式切换记录（同类型 30 秒内不重复） */
export function appendSystemEvent(
  sessionId: string,
  type: ChatSystemEventType
): ChatSystemEvent | null {
  const events = loadSystemEvents(sessionId);
  const now = Date.now();
  const duplicate = events.some(
    (e) => e.type === type && now - new Date(e.timestamp).getTime() < 30000
  );
  if (duplicate) return null;

  const event: ChatSystemEvent = {
    id: `sys_${now}`,
    type,
    timestamp: new Date().toISOString(),
  };
  events.push(event);
  saveSystemEvents(sessionId, events);
  return event;
}

export function buildChatTimeline(
  messages: Message[],
  events: ChatSystemEvent[]
): ChatTimelineItem[] {
  const items: ChatTimelineItem[] = [
    ...messages.map((m) => ({ kind: 'message' as const, data: m })),
    ...events.map((e) => ({ kind: 'system' as const, data: e })),
  ];
  return items.sort(
    (a, b) =>
      new Date(a.kind === 'message' ? a.data.timestamp : a.data.timestamp).getTime() -
      new Date(b.kind === 'message' ? b.data.timestamp : b.data.timestamp).getTime()
  );
}

export function systemEventCopy(
  type: ChatSystemEventType,
  side: 'client' | 'merchant' = 'client'
) {
  if (type === 'switch_human') {
    if (side === 'merchant') {
      return {
        icon: '👨‍💼',
        title: '您已接管人工客服',
        desc: '顾客端将看到「人工模式」提示，请尽快回复',
        tag: '人工接管',
      };
    }
    return {
      icon: '👨‍💼',
      title: '已为您转接人工客服',
      desc: '商家真人将查看您的留言，请耐心等待回复',
      tag: '人工服务',
    };
  }
  if (side === 'merchant') {
    return {
      icon: '🤖',
      title: '会话已切回 AI / 结束人工',
      desc: '后续将由小饱自动回复，或等待新的顾客消息',
      tag: 'AI 接待',
    };
  }
  return {
    icon: '🤖',
    title: '已切换回 AI 智能客服',
    desc: '小饱继续为您提供秒级回复与菜品推荐',
    tag: 'AI 服务',
  };
}
