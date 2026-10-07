<script setup lang="ts">
/** The original imagoo logo artwork (raster, transparent). Never re-typeset. */
withDefaults(defineProps<{ variant?: 'color' | 'light'; height?: number }>(), { variant: 'color', height: 34 })
</script>

<template>
  <img
    :src="variant === 'light' ? '/images/brand/imagoo-logo-light-480.webp' : '/images/brand/imagoo-logo-480.webp'"
    :srcset="
      variant === 'light'
        ? '/images/brand/imagoo-logo-light-480.webp 480w, /images/brand/imagoo-logo-light-960.webp 960w'
        : '/images/brand/imagoo-logo-480.webp 480w, /images/brand/imagoo-logo-960.webp 960w'
    "
    :sizes="`${Math.round(height * 3.39)}px`"
    :width="Math.round(height * 3.39)"
    :height="height"
    alt="imagoo"
    class="logo"
    decoding="async"
  />
</template>

<style scoped>
.logo {
  width: auto;
  object-fit: contain;
}
</style>
