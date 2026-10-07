<script setup lang="ts">
import type { ProductImage } from '~/types/catalog'
import { imageUrl, srcset } from '~/utils/catalog'

/** Responsive product image with reserved aspect ratio and a graceful fallback. */
const props = withDefaults(
  defineProps<{ image?: ProductImage; alt: string; sizes?: string; eager?: boolean; fit?: 'cover' | 'contain' }>(),
  { sizes: '(min-width: 1024px) 25vw, (min-width: 560px) 45vw, 90vw', eager: false, fit: 'cover' },
)
const failed = ref(false)
watch(() => props.image?.src, () => (failed.value = false))
</script>

<template>
  <div class="pimg" :style="{ aspectRatio: image ? `${image.width} / ${image.height}` : '4 / 5' }">
    <img
      v-if="image && !failed"
      :src="imageUrl(image)"
      :srcset="srcset(image)"
      :sizes="sizes"
      :width="image.width"
      :height="image.height"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : undefined"
      decoding="async"
      :style="{ objectFit: fit }"
      @error="failed = true"
    />
    <div v-else class="pimg__fallback" role="img" :aria-label="`${alt} — изображението се подготвя`">
      <AppIcon name="loop" :size="40" />
      <span>Изображението се подготвя</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pimg {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(180deg, #f1e7da 0%, #fbf5ea 100%);
  img {
    width: 100%;
    height: 100%;
  }
}
.pimg__fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 8px;
  color: var(--purple-400);
  font-size: 0.8125rem;
  font-weight: 500;
}
</style>
