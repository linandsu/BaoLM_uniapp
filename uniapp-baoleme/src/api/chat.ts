import { request } from './config';
import type { ChatSession, Message } from '../types';

// ============================================================
// 客服聊天 API
// 状态: 🔴 MOCK（由本地 Express server.ts 提供内存数据）
// SSM 对接:
//   GET  /api/chat/session?userId={userId}
//   GET  /api/chat/sessions/all
//   POST /api/chat/session/mode   (切换 bot/human)
//   GET  /api/chat/messages/{sessionId}
//   POST /api/chat/messages       (发消息)
// ============================================================

/** [MOCK] 获取或创建用户会话 */
export function getChatSession(userId: string): Promise<ChatSession> {
  return request({ url: `/chat/session?userId=${userId}` });
}

/** [MOCK] 获取所有会话列表（商家端使用）*/
export function getAllChatSessions(): Promise<any[]> {
  return request({ url: '/chat/sessions/all' });
}

/** [MOCK] 获取所有会话列表（别名，供商家端 chat.vue 使用）*/
export const getAllSessions = getAllChatSessions;

/** [MOCK] 切换客服模式 bot <-> human */
export function switchChatMode(sessionId: string, mode: 'bot' | 'human'): Promise<{ success: boolean; mode: string }> {
  return request({ url: '/chat/session/mode', method: 'POST', data: { sessionId, mode } });
}

/** [MOCK] 获取会话消息列表 */
export function getChatMessages(sessionId: string): Promise<Message[]> {
  return request({ url: `/chat/messages/${sessionId}` });
}

/** [MOCK] 获取会话消息列表（别名）*/
export const getSessionMessages = getChatMessages;

/** [MOCK] 发送消息（C端用户 或 B端商家）*/
export function sendChatMessage(data: {
  sessionId: string;
  role: 'user' | 'merchant';
  content: string;
}): Promise<{ status: string; message?: Message }> {
  return request({ url: '/chat/messages', method: 'POST', data });
}

/** [MOCK] 商家发送回复消息 */
export function sendMerchantMessage(sessionId: string, content: string) {
  return sendChatMessage({ sessionId, role: 'merchant', content });
}

/** [MOCK] 商家接管会话（切换为人工模式）*/
export function takeoverSession(sessionId: string) {
  return switchChatMode(sessionId, 'human');
}

/** 切换到人工客服（C端用户请求转人工）*/
export function switchToHumanService(sessionId: string) {
  return switchChatMode(sessionId, 'human');
}

/** [MOCK] 结束会话 - SSM: PUT /api/chat/session/{sessionId}/resolve */
export function resolveSession(sessionId: string): Promise<any> {
  return request({ url: `/chat/session/${sessionId}/resolve`, method: 'PUT' });
}
