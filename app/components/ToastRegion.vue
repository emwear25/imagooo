<script setup lang="ts">
import { useUiStore } from '~/stores/ui'

const ui = useUiStore()
</script>

<template>
  <div class="toasts" role="status" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div v-for="t in ui.toasts" :key="t.id" class="toast" :class="`toast--${t.tone ?? 'info'}`">
        <img v-if="t.image" :src="t.image" alt="" width="48" height="60" class="toast__img" />
        <span v-else class="toast__icon"><AppIcon :name="t.tone === 'success' ? 'check' : 'heart'" :size="20" /></span>
        <div class="toast__body">
          <p class="toast__title">{{ t.title }}</p>
          <p v-if="t.body" class="toast__text">{{ t.body }}</p>
        </div>
        <NuxtLink v-if="t.action" :to="t.action.to" class="toast__action" @click="ui.dismiss(t.id)">{{ t.action.label }}</NuxtLink>
        <button type="button" class="toast__close" aria-label="Затвори известието" @click="ui.dismiss(t.id)">
          <AppIcon name="close" :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped lang="scss">
.toasts {
  position: fixed;
  z-index: 90;
  left: 12px;
  right: 12px;
  bottom: calc(12px + env(safe-area-inset-bottom));
  display: grid;
  gap: 8px;
  pointer-events: none;
  @include up(sm) {
    left: auto;
    right: 24px;
    bottom: 24px;
    width: 400px;
  }
}
.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px 10px 10px;
  border-radius: var(--r-md);
  background: var(--ink);
  color: var(--paper);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
}
.toast__img {
  flex: none;
  width: 44px;
  height: 55px;
  object-fit: cover;
  border-radius: 10px;
}
.toast__icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--coral);
  color: var(--ink);
}
.toast__body {
  flex: 1;
  min-width: 0;
}
.toast__title {
  font-weight: 600;
  font-size: 0.9375rem;
}
.toast__text {
  font-size: 0.8125rem;
  color: #d9d0e8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.toast__action {
  flex: none;
  padding: 10px 10px;
  border-radius: 10px;
  color: var(--coral);
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
  text-decoration: none;
  &:hover {
    background: rgb(255 255 255 / 8%);
  }
}
.toast__close {
  display: grid;
  flex: none;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #d9d0e8;
  &:hover {
    background: rgb(255 255 255 / 10%);
  }
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s var(--ease), transform 0.3s var(--ease);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
