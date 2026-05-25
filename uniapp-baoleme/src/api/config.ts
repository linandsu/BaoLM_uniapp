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

/** multipart 上传（菜品图等），返回可写入 image 字段的 URL */
export function uploadFileRequest(
  apiPath: string,
  filePath: string,
  fieldName = 'file'
): Promise<any> {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('baoleme_token');
    uni.uploadFile({
      url: getBaseUrl() + API_PREFIX + apiPath,
      filePath,
      name: fieldName,
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const body = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
            resolve(body);
          } catch {
            resolve(res.data);
          }
        } else {
          reject({ statusCode: res.statusCode, data: res.data });
        }
      },
      fail: (err) => reject(err),
    });
  });
}

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
