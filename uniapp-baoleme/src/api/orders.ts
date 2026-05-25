import { request } from './config';
import type { Order, CartItem } from '../types';

// ============================================================
// 订单 API
// 状态: 🔴 MOCK（由本地 Express server.ts 提供内存数据）
// SSM 对接: GET /api/orders | POST /api/orders
//           PUT /api/orders/{orderId}/status
// ============================================================

/** [MOCK] 获取所有订单（商家端全量；顾客端前端过滤 userId）*/
export function getOrders(): Promise<Order[]> {
  return request({ url: '/orders' });
}

/** [MOCK] 提交新订单 - SSM: POST /api/orders */
export function createOrder(data: {
  userId: string;
  items: CartItem[];
  totalPrice: number;
  address: string;
  phone: string;
  note: string;
}): Promise<Order> {
  return request({ url: '/orders', method: 'POST', data });
}

/** 别名，供 home.vue 使用 */
export const placeOrder = createOrder;

/** [MOCK] 更新订单状态 - SSM: PUT /api/orders/{orderId}/status */
export function updateOrderStatus(orderId: string, status: string): Promise<Order> {
  return request({ url: `/orders/${orderId}/status`, method: 'PUT', data: { status } });
}
