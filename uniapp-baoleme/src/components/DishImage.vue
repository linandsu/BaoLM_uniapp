<template>
  <image
    class="dish-image"
    :class="imgClass"
    :src="displaySrc"
    :mode="mode"
    @error="onError"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { DISH_PLACEHOLDER, isRemoteImage, isDataImage } from '../utils/localImage';

const props = withDefaults(
  defineProps<{
    src: string;
    mode?: string;
    imgClass?: string;
  }>(),
  { mode: 'aspectFill', imgClass: '' }
);

const displaySrc = ref(props.src || DISH_PLACEHOLDER);
let errorCount = 0;

watch(
  () => props.src,
  (v) => {
    errorCount = 0;
    displaySrc.value = v || DISH_PLACEHOLDER;
  },
  { immediate: true }
);

function onError() {
  if (props.src && isDataImage(props.src)) return;
  errorCount += 1;
  if (errorCount === 1 && props.src && isRemoteImage(props.src)) {
    displaySrc.value = DISH_PLACEHOLDER;
    return;
  }
  displaySrc.value = DISH_PLACEHOLDER;
}
</script>

<style scoped>
.dish-image {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
