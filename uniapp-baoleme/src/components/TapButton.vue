<template>
  <view
    class="tap-button"
    :class="[variant, { disabled: disabled, block: block }]"
    :hover-class="disabled ? 'none' : 'tap-button--hover'"
    hover-stay-time="80"
    @tap="onTap"
  >
    <slot />
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'ghost';
    block?: boolean;
  }>(),
  { disabled: false, variant: 'primary', block: true }
);

const emit = defineEmits<{ (e: 'tap'): void }>();

function onTap() {
  if (props.disabled) return;
  emit('tap');
}
</script>

<style lang="scss" scoped>
.tap-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border-radius: 28rpx;
  font-weight: 800;
  transition: transform 0.15s ease, opacity 0.15s ease;

  &.block {
    width: 100%;
  }

  &.disabled {
    opacity: 0.55;
    pointer-events: none;
  }
}

.tap-button--hover {
  transform: scale(0.98);
  opacity: 0.92;
}

.tap-button.primary {
  background: linear-gradient(135deg, #ff7a45, #e25c30);
  color: #fff;
  padding: 26rpx 32rpx;
  font-size: 30rpx;
  box-shadow: 0 12rpx 32rpx -8rpx rgba(226, 92, 48, 0.35);
}

.tap-button.secondary {
  background: #f1f5f9;
  color: #64748b;
  padding: 20rpx 28rpx;
  font-size: 26rpx;
}

.tap-button.ghost {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 16rpx 28rpx;
  font-size: 24rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.35);
}
</style>
