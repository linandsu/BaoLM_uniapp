import { request } from './config';
import type { Dish, Category } from '../types';

// ============================================================
// 菜品 & 分类 API
// 状态: 🔴 MOCK（由本地 Express server.ts 提供内存数据）
// SSM 对接: GET /api/categories | GET /api/dishes
//           POST /api/dishes | PUT /api/dishes/{id}
// ============================================================

/** [MOCK] 获取所有菜品分类 */
export function getCategories(): Promise<Category[]> {
  return request({ url: '/categories' });
}

/** [MOCK] 获取所有上架菜品 */
export function getDishes(): Promise<Dish[]> {
  return request({ url: '/dishes' });
}

/** [MOCK] 新增菜品 - SSM: POST /api/dishes */
export function createDish(data: Partial<Dish>): Promise<Dish> {
  return request({ url: '/dishes', method: 'POST', data });
}

/** [MOCK] 新增菜品（别名，供 sku.vue 使用）*/
export const addDish = createDish;

/** [MOCK] 更新菜品（含上下架、改价、改库存）- SSM: PUT /api/dishes/{id} */
export function updateDish(id: string, data: Partial<Dish>): Promise<Dish> {
  return request({ url: `/dishes/${id}`, method: 'PUT', data });
}

/** [MOCK] 更新菜品上下架状态 */
export function updateDishStatus(id: string, status: 'active' | 'inactive'): Promise<Dish> {
  return updateDish(id, { status });
}

/** [MOCK] 删除菜品 - SSM: DELETE /api/dishes/{id} */
export function deleteDish(id: string): Promise<void> {
  return request({ url: `/dishes/${id}`, method: 'DELETE' });
}

/** [MOCK] 新增分类 - SSM: POST /api/categories */
export function createCategory(name: string, icon?: string): Promise<Category> {
  return request({ url: '/categories', method: 'POST', data: { name, icon: icon || 'Utensils' } });
}
