<script setup lang="ts">
import type { FaqItem } from '~/data/faq'

defineProps<{ items: FaqItem[]; headingLevel?: 2 | 3 }>()
</script>

<template>
  <div class="faq">
    <details v-for="(it, i) in items" :key="i" class="faq__item">
      <summary>
        <component :is="`h${headingLevel ?? 3}`" class="faq__q">{{ it.q }}</component>
        <span class="faq__icon" aria-hidden="true"><AppIcon name="plus" :size="20" /></span>
      </summary>
      <div class="faq__a">
        <p v-for="(p, j) in it.a" :key="j">{{ p }}</p>
        <NuxtLink v-if="it.link" :to="it.link.to" class="link-arrow">
          {{ it.link.label }}
          <AppIcon name="arrow-right" />
        </NuxtLink>
      </div>
    </details>
  </div>
</template>

<style scoped lang="scss">
.faq {
  display: grid;
  gap: 10px;
}
.faq__item {
  border-radius: var(--r-md);
  background: var(--paper);
  border: 1px solid var(--line);
  transition: border-color 0.2s;
  &[open] {
    border-color: var(--purple-200);
    .faq__icon {
      transform: rotate(45deg);
      background: var(--purple);
      color: var(--paper);
    }
  }
}
summary {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 60px;
  padding: 14px 16px 14px 20px;
  cursor: pointer;
  list-style: none;
  &::-webkit-details-marker {
    display: none;
  }
  &:focus-visible {
    border-radius: var(--r-md);
  }
}
.faq__q {
  flex: 1;
  font-family: var(--font-body);
  font-size: 1.0625rem;
  font-weight: 600;
  letter-spacing: 0;
}
.faq__icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--purple-100);
  color: var(--purple);
  transition: transform 0.25s var(--ease), background-color 0.2s;
}
.faq__a {
  display: grid;
  gap: 10px;
  padding: 0 20px 20px;
  color: var(--muted);
  max-width: 70ch;
}
</style>
