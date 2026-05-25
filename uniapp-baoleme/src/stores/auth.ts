import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UserProfile } from '../types';

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false);
  const role = ref<'client' | 'merchant' | 'sandbox' | null>(null);
  const userProfile = ref<UserProfile | null>(null);
  const token = ref<string | null>(null);

  function login(userRole: 'client' | 'merchant' | 'sandbox', profile?: UserProfile, authToken?: string) {
    isLoggedIn.value = true;
    role.value = userRole;
    if (profile) userProfile.value = profile;
    if (authToken) token.value = authToken;
    // 持久化到本地存储
    uni.setStorageSync('baoleme_role', userRole);
    if (authToken) uni.setStorageSync('baoleme_token', authToken);
    if (profile) uni.setStorageSync('baoleme_profile', JSON.stringify(profile));
  }

  function logout() {
    isLoggedIn.value = false;
    role.value = null;
    userProfile.value = null;
    token.value = null;
    uni.removeStorageSync('baoleme_role');
    uni.removeStorageSync('baoleme_token');
    uni.removeStorageSync('baoleme_profile');
  }

  function restoreFromStorage() {
    const savedRole = uni.getStorageSync('baoleme_role');
    const savedToken = uni.getStorageSync('baoleme_token');
    const savedProfile = uni.getStorageSync('baoleme_profile');
    if (savedRole) {
      isLoggedIn.value = true;
      role.value = savedRole;
      if (savedToken) token.value = savedToken;
      if (savedProfile) {
        try { userProfile.value = JSON.parse(savedProfile); } catch {}
      }
    }
  }

  return { isLoggedIn, role, userProfile, token, login, logout, restoreFromStorage };
});
