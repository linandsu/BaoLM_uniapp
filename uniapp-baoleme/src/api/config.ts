// ============================================================
// API 配置文件
// 当前状态: 全部接口为 MOCK (内存数据模式)
// 对接 SSM 后端时，将 BASE_URL 改为实际服务器地址即可
// SSM 后端预期地址: http://localhost:8080/api
// ============================================================

// 🔴 当前: MOCK 模式（由前端 Express server.ts 提供，内存数据）
// ✅ 对接SSM后端时修改为: 'http://你的服务器IP:8081'
// export const BASE_URL = 'http://localhost:8081';
export const BASE_URL = 'http://192.168.1.10:8081';

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
      url: BASE_URL + API_PREFIX + options.url,
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
