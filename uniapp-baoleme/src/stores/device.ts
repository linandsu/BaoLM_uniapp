import { defineStore } from 'pinia';

/** 各端状态栏高度，用于避免顶栏被系统图标遮挡 */
export const useDeviceStore = defineStore('device', {
  state: () => ({
    statusBarHeight: 44,
    /** 顶栏内容区起始 padding（rpx）= 状态栏 + 额外间距 */
    safeTopRpx: 96,
  }),
  actions: {
    init() {
      try {
        const sys = uni.getSystemInfoSync();
        const barPx = sys.statusBarHeight || 44;
        const width = sys.windowWidth || 375;
        this.statusBarHeight = barPx;
        this.safeTopRpx = Math.ceil((barPx * 750) / width) + 28;
      } catch {
        this.statusBarHeight = 44;
        this.safeTopRpx = 96;
      }
    },
  },
});
