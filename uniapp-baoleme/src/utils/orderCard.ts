import type { Order, OrderStatus } from '../types';

export const ORDER_CARD_PREFIX = '[ORDER_CARD]';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '待接单',
  accepted: '已接单',
  cooking: '制作中',
  delivering: '配送中',
  completed: '已完成',
  cancelled: '已取消',
};

export interface OrderCardPayload {
  id: string;
  status: OrderStatus;
  createdAt: string;
  items: { name: string; qty: number; price: number }[];
  totalPrice: number;
  address: string;
  phone: string;
  note?: string;
}

export function isOrderCardMessage(content: string): boolean {
  return !!content && content.startsWith(ORDER_CARD_PREFIX);
}

export function buildOrderCardMessage(order: Order): string {
  const payload: OrderCardPayload = {
    id: order.id,
    status: order.status,
    createdAt: order.createdAt,
    items: order.items.map((i) => ({
      name: i.dish.name,
      qty: i.quantity,
      price: i.dish.price,
    })),
    totalPrice: order.totalPrice,
    address: order.address,
    phone: order.phone,
    note: order.note,
  };
  return `${ORDER_CARD_PREFIX}${JSON.stringify(payload)}`;
}

export function parseOrderCardMessage(content: string): OrderCardPayload | null {
  if (!isOrderCardMessage(content)) return null;
  try {
    return JSON.parse(content.slice(ORDER_CARD_PREFIX.length)) as OrderCardPayload;
  } catch {
    return null;
  }
}

export function formatOrderCardTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
