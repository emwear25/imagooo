<script setup lang="ts">
defineProps<{ eyebrow?: string; title: string; text?: string; link?: { label: string; to: string }; id?: string }>()
</script>

<template>
  <div class="shead">
    <div class="shead__main">
      <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
      <h2 :id="id" class="shead__title">{{ title }}</h2>
      <p v-if="text" class="shead__text">{{ text }}</p>
    </div>
    <NuxtLink v-if="link" :to="link.to" class="link-arrow shead__link">
      {{ link.label }}
      <AppIcon name="arrow-right" />
    </NuxtLink>
  </div>
</template>

<style scoped lang="scss">
.shead {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px 32px;
  margin-bottom: 28px;
  @include up(md) {
    margin-bottom: 40px;
  }
}
.shead__main {
  max-width: 680px;
}
.shead__title {
  margin-top: 10px;
  font-size: clamp(1.6rem, 1.1rem + 2vw, 2.6rem);
}
.shead__text {
  margin-top: 12px;
  color: var(--muted);
  @include up(md) {
    font-size: 1.125rem;
  }
}
.shead__link {
  padding-block: 8px;
}
</style>
