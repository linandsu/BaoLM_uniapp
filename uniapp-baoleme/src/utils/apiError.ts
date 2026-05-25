/** 从 uni.request / uploadFile 失败对象提取可读错误信息 */
export function formatApiError(err: any, fallback = '请求失败'): string {
  if (!err) return fallback;
  const data = err.data;
  if (typeof data === 'string' && data.length < 200) {
    try {
      const parsed = JSON.parse(data);
      if (parsed?.message) return String(parsed.message);
      if (parsed?.msg) return String(parsed.msg);
    } catch {
      if (data.trim()) return data;
    }
  }
  if (data && typeof data === 'object') {
    if (data.message) return String(data.message);
    if (data.msg) return String(data.msg);
    if (data.error) return String(data.error);
  }
  if (err.message) return String(err.message);
  if (err.statusCode === 413) return '请求体过大（图片请走上传接口）';
  if (err.statusCode === 404) return '接口不存在，请检查后端地址';
  if (err.statusCode === 401) return '未登录或登录已过期';
  if (err.statusCode) return `服务器错误 (${err.statusCode})`;
  return fallback;
}
