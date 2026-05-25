/** 菜品/头像本地图：避免每次加载远程 Unsplash */

const DISH_IMAGE_MAP_KEY = 'baoleme_dish_local_images';
const AVATAR_KEY = 'baoleme_user_avatar_local';
const USER_AVATAR_MAP_KEY = 'baoleme_user_avatar_map';

/** 内置占位图（SVG data URI，无需网络） */
export const DISH_PLACEHOLDER =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFF3EF"/><stop offset="100%" stop-color="#FFD0B9"/>
      </linearGradient></defs>
      <rect width="240" height="240" rx="32" fill="url(#g)"/>
      <text x="120" y="132" text-anchor="middle" font-size="72">🍜</text>
    </svg>`
  );

function readDishMap(): Record<string, string> {
  try {
    const raw = uni.getStorageSync(DISH_IMAGE_MAP_KEY);
    if (!raw) return {};
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return {};
  }
}

function writeDishMap(map: Record<string, string>) {
  uni.setStorageSync(DISH_IMAGE_MAP_KEY, JSON.stringify(map));
}

export function isRemoteImage(url: string) {
  return /^https?:\/\//i.test(url || '');
}

export function isLocalImage(url: string) {
  if (!url) return false;
  return (
    url.startsWith('file://') ||
    url.startsWith('_doc') ||
    url.startsWith('_www') ||
    url.startsWith('wxfile://') ||
    url.startsWith('data:') ||
    url.startsWith('/static/')
  );
}

/** 将相册临时路径持久化到应用沙盒 */
export function persistImage(tempPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.saveFile({
      tempFilePath: tempPath,
      success: (res) => resolve(res.savedFilePath),
      fail: (err) => reject(err),
    });
  });
}

export function setDishLocalImage(dishId: string, savedPath: string) {
  const map = readDishMap();
  map[dishId] = savedPath;
  writeDishMap(map);
}

export function getDishLocalImage(dishId: string): string | null {
  return readDishMap()[dishId] || null;
}

/**
 * 解析菜品展示图：
 * 1. 本机已缓存的商家上传图
 * 2. 已是本地路径
 * 3. 后端/默认远程 URL（保证能看见菜品）
 * 4. 内置占位图
 */
export function resolveDishImage(dishId: string, remoteOrPath?: string): string {
  const local = getDishLocalImage(dishId);
  if (local) return local;
  if (remoteOrPath && isLocalImage(remoteOrPath)) return remoteOrPath;
  if (remoteOrPath && isRemoteImage(remoteOrPath)) return remoteOrPath;
  return DISH_PLACEHOLDER;
}

export function setUserAvatarLocal(path: string) {
  uni.setStorageSync(AVATAR_KEY, path);
}

export function getUserAvatarLocal(): string | null {
  return uni.getStorageSync(AVATAR_KEY) || null;
}

export function resolveUserAvatar(remote?: string): string {
  const local = getUserAvatarLocal();
  if (local) return local;
  if (remote && isLocalImage(remote)) return remote;
  if (remote && isRemoteImage(remote)) return remote;
  return DISH_PLACEHOLDER;
}

function readUserAvatarMap(): Record<string, string> {
  try {
    const raw = uni.getStorageSync(USER_AVATAR_MAP_KEY);
    if (!raw) return {};
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return {};
  }
}

/** 按用户 ID 登记头像（客服页、会话列表展示顾客真实头像） */
export function registerUserAvatar(userId: string, avatarPath: string) {
  if (!userId || !avatarPath) return;
  const map = readUserAvatarMap();
  map[userId] = avatarPath;
  uni.setStorageSync(USER_AVATAR_MAP_KEY, JSON.stringify(map));
}

export function getUserAvatarById(userId: string): string | null {
  return readUserAvatarMap()[userId] || null;
}

export function resolveUserAvatarById(userId: string, fallbackRemote?: string): string {
  const byId = getUserAvatarById(userId);
  if (byId) return byId;
  return resolveUserAvatar(fallbackRemote);
}
