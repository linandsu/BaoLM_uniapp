import { uploadFileRequest, getBaseUrl } from './config';

/** 与后端约定的唯一上传路径（见 doc/菜品图片上传-后端对接说明.md） */
export const DISH_IMAGE_UPLOAD_PATH = '/upload/image';

export type UploadImageResponse = {
  url: string;
  filename?: string;
  size?: number;
};

function normalizeUploadUrl(raw: string): string {
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = getBaseUrl().replace(/\/$/, '');
  return raw.startsWith('/') ? `${base}${raw}` : `${base}/${raw}`;
}

function extractUrlFromUploadBody(body: any): string | null {
  if (!body) return null;
  if (typeof body === 'string' && /^https?:\/\//i.test(body)) return body;
  const candidates = [
    body.url,
    body.data?.url,
    body.path,
    body.data?.path,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.length > 0 && c.length <= 512) {
      return normalizeUploadUrl(c);
    }
  }
  return null;
}

/**
 * 上传图片（multipart/form-data）
 * @param filePath 本地临时路径（相册选择后）
 * @param fieldName 表单字段名，默认 file，与后端 @RequestParam("file") 一致
 */
export async function uploadImage(
  filePath: string,
  fieldName = 'file'
): Promise<string> {
  const body = await uploadFileRequest(DISH_IMAGE_UPLOAD_PATH, filePath, fieldName);
  const url = extractUrlFromUploadBody(body);
  if (!url) {
    throw new Error('上传成功但响应中缺少 url 字段');
  }
  return url;
}
