import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CartItem, Dish } from '../types';

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);

  const totalCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0));
  const totalPrice = computed(() => items.value.reduce((sum, item) => sum + item.dish.price * item.quantity, 0));

  function addItem(dish: Dish) {
    const existing = items.value.find(i => i.dish.id === dish.id);
    if (existing) {
      existing.quantity++;
    } else {
      items.value.push({ dish, quantity: 1 });
    }
  }

  function removeItem(dishId: string) {
    const idx = items.value.findIndex(i => i.dish.id === dishId);
    if (idx === -1) return;
    if (items.value[idx].quantity > 1) {
      items.value[idx].quantity--;
    } else {
      items.value.splice(idx, 1);
    }
  }

  function clearCart() {
    items.value = [];
  }

  function getQuantity(dishId: string): number {
    return items.value.find(i => i.dish.id === dishId)?.quantity ?? 0;
  }

  return { items, totalCount, totalPrice, addItem, removeItem, clearCart, getQuantity };
});
