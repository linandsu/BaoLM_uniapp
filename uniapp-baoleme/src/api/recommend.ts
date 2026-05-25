import { request } from './config';
import type { Recommendation } from '../types';

// ============================================================
// AI 推荐 & 智能客服 API
// 状态: 🔴 MOCK（Gemini API Key 未配置时返回预设推荐）
// SSM 对接: POST /api/gemini/recommend
//   后端将集成外部大模型 API（Gemini / 国内大模型）
// ============================================================

/** [MOCK/AI] AI 膳食推荐 - SSM 后端中转 Gemini API */
export function getAIRecommendation(data: {
  tags: string[];
  favoriteCategory?: string;
  customCraving?: string;
}): Promise<Recommendation> {
  return request({ url: '/gemini/recommend', method: 'POST', data });
}

/** 别名，供 home.vue 使用 */
export const getRecommendation = getAIRecommendation;
