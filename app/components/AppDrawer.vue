<script setup lang="ts">
const props = withDefaults(
  defineProps<{ open: boolean; title: string; side?: 'left' | 'right'; labelHidden?: boolean; width?: string }>(),
  { side: 'right', labelHidden: false, width: '440px' },
)
const emit = defineEmits<{ close: [] }>()

const panel = ref<HTMLElement | null>(null)
const isOpen = computed(() => props.open)
useDialog(isOpen, panel, () => emit('close'))
const titleId = useId()
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="drawer" :class="`drawer--${side}`">
        <div class="drawer__scrim" aria-hidden="true" @click="emit('close')" />
        <div
          ref="panel"
          class="drawer__panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
          :style="{ '--w': width }"
        >
          <header class="drawer__head">
            <h2 :id="titleId" :class="{ 'visually-hidden': labelHidden }">{{ title }}</h2>
            <slot name="head" />
            <button type="button" class="icon-btn drawer__close" @click="emit('close')">
              <AppIcon name="close" />
              <span class="visually-hidden">Затвори</span>
            </button>
          </header>
          <div class="drawer__body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="drawer__foot">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.drawer {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  &--right {
    justify-content: flex-end;
  }
}

.drawer__scrim {
  position: absolute;
  inset: 0;
  background: rgb(35 16 63 / 42%);
}

.drawer__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(var(--w), 100vw);
  height: 100%;
  height: 100dvh;
  background: var(--cream);
  box-shadow: var(--shadow-lg);
  outline: none;
}

.drawer--right .drawer__panel {
  border-radius: var(--r-lg) 0 0 var(--r-lg);
  @include down(sm) {
    border-radius: 0;
  }
}
.drawer--left .drawer__panel {
  border-radius: 0 var(--r-lg) var(--r-lg) 0;
}

.drawer__head {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 68px;
  padding: 12px 12px 12px 22px;
  border-bottom: 1px solid var(--line);
  h2 {
    flex: 1;
    font-size: 1.125rem;
  }
}

.drawer__close {
  margin-left: auto;
}

.drawer__body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 18px 22px;
}

.drawer__foot {
  padding: 16px 22px calc(16px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--line);
  background: var(--paper);
}

// transitions
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.28s var(--ease);
  .drawer__panel {
    transition: transform 0.34s var(--ease);
  }
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  &.drawer--right .drawer__panel {
    transform: translateX(40px);
  }
  &.drawer--left .drawer__panel {
    transform: translateX(-40px);
  }
}
</style>
