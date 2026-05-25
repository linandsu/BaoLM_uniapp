/** 页面内返回；无历史时回到登录页 */
export function goBack(fallbackUrl = '/pages/login/index') {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
    return;
  }
  uni.reLaunch({ url: fallbackUrl });
}

export function navigateTo(url: string) {
  uni.navigateTo({ url });
}

export type MerchantOrdersFilter = 'all' | 'pending' | 'active' | 'completed';

/** 跳转商家订单页并带上筛选 Tab */
export function openMerchantOrders(filter: MerchantOrdersFilter = 'all') {
  navigateTo(`/pages/merchant/orders?filter=${filter}`);
}

export function openMerchantSku() {
  navigateTo('/pages/merchant/sku');
}
