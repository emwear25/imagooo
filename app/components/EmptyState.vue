<script setup lang="ts">
import type { IconName } from '~/utils/icons'

defineProps<{ icon?: IconName; title: string; text?: string; headingLevel?: 2 | 3 }>()
</script>

<template>
  <div class="empty">
    <div class="empty__art" aria-hidden="true">
      <svg viewBox="0 0 200 90" class="empty__loop">
        <path
          d="M52 18C30 18 14 30 14 45s16 27 38 27c34 0 62-54 96-54 22 0 38 12 38 27s-16 27-38 27c-34 0-62-54-96-54Z"
          fill="none"
          stroke="currentColor"
          stroke-width="12"
          stroke-linecap="round"
        />
      </svg>
      <span class="empty__icon"><AppIcon :name="icon ?? 'sparkle'" :size="28" /></span>
    </div>
    <component :is="`h${headingLevel ?? 2}`" class="empty__title">{{ title }}</component>
    <p v-if="text" class="empty__text">{{ text }}</p>
    <div v-if="$slots.default" class="empty__actions">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.empty {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding: 48px 20px 56px;
  text-align: center;
  border-radius: var(--r-xl);
  background: var(--paper);
  border: 1px dashed var(--sand-300);
}
.empty__art {
  position: relative;
  width: 160px;
  margin-bottom: 8px;
}
.empty__loop {
  width: 100%;
  color: var(--purple-100);
}
.empty__icon {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--coral-600);
}
.empty__title {
  font-size: 1.35rem;
}
.empty__text {
  max-width: 46ch;
  color: var(--muted);
}
.empty__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 8px;
}
</style>
