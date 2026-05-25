import { computed } from 'vue';
import { useDeviceStore } from '../stores/device';

/** 顶栏安全区内边距（状态栏 + 间距） */
export function useSafeTop(extraRpx = 20) {
  const device = useDeviceStore();
  if (device.safeTopRpx <= 96) {
    device.init();
  }
  return computed(() => ({
    paddingTop: `${device.safeTopRpx + extraRpx}rpx`,
  }));
}
