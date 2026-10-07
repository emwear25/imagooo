<script setup lang="ts">
import { formatPrice } from '~/utils/format'

withDefaults(defineProps<{ cents: number; compareAtCents?: number; size?: 'md' | 'lg'; from?: boolean }>(), { size: 'md' })
</script>

<template>
  <p class="ptag" :class="`ptag--${size}`">
    <span v-if="from" class="ptag__from">от</span>
    <span class="price" :class="{ 'price--sale': compareAtCents }">{{ formatPrice(cents) }}</span>
    <s v-if="compareAtCents" class="ptag__was"><span class="visually-hidden">Предишна цена: </span>{{ formatPrice(compareAtCents) }}</s>
  </p>
</template>

<style scoped lang="scss">
.price--sale {
  color: var(--coral-600, #e0564d);
}
.ptag__from {
  color: var(--muted);
  font-size: 0.875rem;
}
.ptag__was {
  color: var(--muted);
  font-size: 0.875rem;
}
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
