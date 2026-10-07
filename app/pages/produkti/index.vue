<script setup lang="ts">
const route = useRoute()
const q = computed(() => (typeof route.query.q === 'string' ? route.query.q.trim() : ''))

useSeo(() => ({
  title: q.value ? `Търсене: „${q.value}“` : 'Всички продукти',
  description:
    'Разгледай всички продукти на Imagoo — вази, кашпи, органайзери, подвижни фигурки, ключодържатели и персонализирани подаръци, създадени с 3D печат.',
  path: '/produkti',
}))
</script>

<template>
  <div class="container">
    <div class="page-head">
      <AppBreadcrumbs :items="[{ label: 'Продукти' }]" />
      <h1>{{ q ? `Резултати за „${q}“` : 'Всички продукти' }}</h1>
      <p class="lead">Форми за дома, помощници за всеки ден и подаръци с име — филтрирай по категория, цвят и цена.</p>
    </div>
    <CatalogView show-search />
  </div>
</template>
