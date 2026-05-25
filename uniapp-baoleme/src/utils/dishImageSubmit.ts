import { uploadDishImage } from '../api/dishes';
import { formatApiError } from './apiError';
import { compressImagePath, isDataImage, isRemoteImage } from './localImage';

/** 后端 image 字段建议长度（对接规格书 VARCHAR(500)） */
export const MAX_API_IMAGE_LEN = 500;

export type DishImageSubmitResult = {
  /** 提交给 POST/PUT 的 image 字段 */
  apiImage: string;
  /** 本机展示缓存（真实图） */
  localCache: string;
  /** 图片是否仅本机可见（上传接口未配置时） */
  localOnly: boolean;
};

function clampApiImage(url: string): string {
  if (!url) return '';
  if (url.length <= MAX_API_IMAGE_LEN) return url;
  return url.slice(0, MAX_API_IMAGE_LEN);
}

/** 新选的本地图片：必须先上传成功，再写入 dish.image */
export async function prepareNewDishImage(tempPath: string): Promise<DishImageSubmitResult> {
  const compressed = await compressImagePath(tempPath, 52);
  try {
    const url = await uploadDishImage(compressed);
    const apiImage = clampApiImage(url);
    return { apiImage, localCache: url, localOnly: false };
  } catch (e) {
    throw new Error(
      formatApiError(e, '图片上传失败，请确认后端已实现 POST /api/upload/image')
    );
  }
}

/** 编辑保存：未换图则沿用服务端原值；换图走 prepareNewDishImage */
export async function prepareDishImageForSave(options: {
  newTempPath?: string;
  imageKeep?: string;
}): Promise<DishImageSubmitResult> {
  if (options.newTempPath && !isDataImage(options.newTempPath)) {
    return prepareNewDishImage(options.newTempPath);
  }
  if (options.newTempPath && isDataImage(options.newTempPath)) {
    throw new Error('不支持直接提交 Base64 图片，请重新从相册选择');
  }

  const keep = options.imageKeep || '';
  if (isRemoteImage(keep) && keep.length <= MAX_API_IMAGE_LEN) {
    return { apiImage: keep, localCache: keep, localOnly: false };
  }
  if (isDataImage(keep)) {
    throw new Error('原图为本地格式，请重新选择图片以上传');
  }
  if (keep && isRemoteImage(keep)) {
    return { apiImage: clampApiImage(keep), localCache: keep, localOnly: false };
  }
  return { apiImage: '', localCache: '', localOnly: false };
}
