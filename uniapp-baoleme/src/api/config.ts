// ============================================================
// API 配置文件
// BASE_URL 优先从本地存储读取（用户可在登录页设置中修改）
// ============================================================

const DEFAULT_BASE_URL = 'http://192.168.1.10:8081';

export function getBaseUrl(): string {
  const saved = uni.getStorageSync('baoleme_backend_url');
  return saved || DEFAULT_BASE_URL;
}

export function setBaseUrl(url: string) {
  uni.setStorageSync('baoleme_backend_url', url);
}

export const API_PREFIX = '/api';

export function request<T = any>(options: {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: Record<string, string>;
}): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('baoleme_token');
    uni.request({
      url: getBaseUrl() + API_PREFIX + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header,
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T);
        } else {
          reject({ statusCode: res.statusCode, data: res.data });
        }
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}
