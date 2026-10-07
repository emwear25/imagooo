<script setup lang="ts">
defineProps<{ title: string; lead?: string; draft?: boolean; crumb?: string }>()
</script>

<template>
  <div class="container legal">
    <div class="page-head">
      <AppBreadcrumbs :items="[{ label: crumb ?? title }]" />
      <h1>{{ title }}</h1>
      <p v-if="lead" class="lead">{{ lead }}</p>
    </div>
    <div v-if="draft" class="notice notice--danger legal__draft" role="note">
      <AppIcon name="alert" />
      <p>
        <strong>Чернова — предстои преглед от юрист.</strong> Полетата, отбелязани с „предстои“, все още не са
        потвърдени.
      </p>
    </div>
    <div class="legal__body prose">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.legal__draft {
  max-width: 72ch;
  margin-bottom: 32px;
}
.legal__body {
  :deep(h2) {
    padding-top: 0.4em;
  }
  :deep(.pending) {
    white-space: nowrap;
  }
}
</style>
