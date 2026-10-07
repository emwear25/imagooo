<script setup lang="ts">
import { iconPaths, type IconName } from '~/utils/icons'

/** Inline SVG icon. Decorative (aria-hidden) unless a label is given. */
const props = withDefaults(defineProps<{ name: IconName; label?: string; size?: number }>(), { size: 24 })
const svg = computed(() => iconPaths[props.name])
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    focusable="false"
    v-html="svg"
  />
</template>
