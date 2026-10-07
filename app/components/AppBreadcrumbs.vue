<script setup lang="ts">
defineProps<{ items: { label: string; to?: string }[] }>()
</script>

<template>
  <nav class="crumbs" aria-label="Навигационна пътека">
    <ol>
      <li>
        <NuxtLink to="/">Начало</NuxtLink>
      </li>
      <li v-for="(it, i) in items" :key="i">
        <AppIcon name="chevron-right" :size="14" />
        <NuxtLink v-if="it.to && i < items.length - 1" :to="it.to">{{ it.label }}</NuxtLink>
        <span v-else aria-current="page">{{ it.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped lang="scss">
.crumbs {
  font-size: 0.875rem;
  color: var(--muted);
  ol {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 6px;
    list-style: none;
  }
  li {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  a {
    display: inline-block;
    padding-block: 6px;
    color: var(--muted);
    text-decoration: none;
    &:hover {
      color: var(--purple);
      text-decoration: underline;
    }
  }
  [aria-current] {
    color: var(--ink);
    font-weight: 500;
  }
}
</style>
