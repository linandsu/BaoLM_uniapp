import { request } from './config';

// ============================================================
// 认证 API
// 状态: 🔴 MOCK（当前在前端本地 localStorage 验证）
// SSM 对接预留接口（目前 SSM 后端尚未实现，需后端同学开发）:
//   POST /api/auth/login    { username, password } -> { token, role, userId }
//   POST /api/auth/register { username, password, role }
//   POST /api/auth/logout
// ============================================================

export interface LoginResult {
  token: string;
  role: 'client' | 'merchant';
  userId: string;
  username: string;
}

/**
 * [MOCK → 预留 SSM 接口] 用户登录
 * 当前: 前端 localStorage 本地校验
 * SSM 对接后: 调用 POST /api/auth/login，后端返回 JWT Token
 */
export async function loginApi(username: string, password: string): Promise<LoginResult> {
  // TODO: 对接 SSM 后端后，取消注释以下代码并删除本地 mock 逻辑
  // return request({ url: '/auth/login', method: 'POST', data: { username, password } });

  // 🔴 MOCK: 本地前端校验逻辑（用于演示）
  return new Promise((resolve, reject) => {
    const stored = uni.getStorageSync('baoleme_users');
    const DEFAULT_USERS = [
      { username: 'xiaoming', password: '123456', role: 'client' as const, userId: 'u1' },
      { username: 'admin', password: 'admin', role: 'merchant' as const, userId: 'admin_1' }
    ];
    const accounts = stored ? JSON.parse(stored) : DEFAULT_USERS;
    const found = accounts.find((a: any) =>
      a.username.toLowerCase() === username.toLowerCase()
    );
    if (!found) {
      reject(new Error('账号不存在'));
    } else if (found.password !== password) {
      reject(new Error('密码不正确'));
    } else {
      resolve({
        token: 'mock_token_' + Date.now(),
        role: found.role,
        userId: found.userId || 'u1',
        username: found.username,
      });
    }
  });
}

/**
 * [MOCK → 预留 SSM 接口] 用户注册
 * SSM 对接后: 调用 POST /api/auth/register
 */
export async function registerApi(data: {
  username: string;
  password: string;
  role: 'client' | 'merchant';
}): Promise<void> {
  // TODO: return request({ url: '/auth/register', method: 'POST', data });

  // 🔴 MOCK: 本地存储注册
  return new Promise((resolve, reject) => {
    const stored = uni.getStorageSync('baoleme_users');
    const DEFAULT_USERS = [
      { username: 'xiaoming', password: '123456', role: 'client' },
      { username: 'admin', password: 'admin', role: 'merchant' }
    ];
    const accounts = stored ? JSON.parse(stored) : DEFAULT_USERS;
    if (accounts.some((a: any) => a.username.toLowerCase() === data.username.toLowerCase())) {
      reject(new Error('该账号已存在'));
      return;
    }
    accounts.push({ username: data.username, password: data.password, role: data.role, userId: 'u_' + Date.now() });
    uni.setStorageSync('baoleme_users', JSON.stringify(accounts));
    resolve();
  });
}
