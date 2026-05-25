export interface Dish {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  sales: number;
  stock: number;
  status: 'active' | 'inactive';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
}

export type OrderStatus = 'pending' | 'accepted' | 'cooking' | 'delivering' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  address: string;
  phone: string;
  note: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'merchant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  userEmail: string;
  mode: 'bot' | 'human';
  status: 'active' | 'resolved';
  lastUpdated: string;
}

export interface UserProfile {
  id: string;
  name: string;
  tags: string[];
  historyOrdersCount: number;
  favoriteCategory: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

export interface RecommendationItem {
  dishId: string;
  dishName: string;
  specialReason: string;
}

export interface Recommendation {
  recommendationTitle: string;
  reason: string;
  items: RecommendationItem[];
}
