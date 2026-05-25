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
import { DISH_PLACEHOLDER } from '../utils/localImage';

const props = withDefaults(
  defineProps<{
    src: string;
    mode?: string;
    imgClass?: string;
  }>(),
  { mode: 'aspectFill', imgClass: '' }
);

const displaySrc = ref(props.src || DISH_PLACEHOLDER);

watch(
  () => props.src,
  (v) => {
    displaySrc.value = v || DISH_PLACEHOLDER;
  },
  { immediate: true }
);

function onError() {
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
