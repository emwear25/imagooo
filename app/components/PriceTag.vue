<script setup lang="ts">
import { formatPrice } from '~/utils/format'

withDefaults(defineProps<{ cents: number; size?: 'md' | 'lg' }>(), { size: 'md' })
</script>

<template>
  <p class="ptag" :class="`ptag--${size}`">
    <span class="price">{{ formatPrice(cents) }}</span>
  </p>
</template>

<style scoped lang="scss">
.ptag {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  &--md .price {
    font-size: 1.0625rem;
  }
  &--lg .price {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }
}
</style>
