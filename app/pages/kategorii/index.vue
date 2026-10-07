<script setup lang="ts">
import { categories } from '~/data/categories'

useSeo({
  title: 'Категории',
  description: 'Разгледай категориите на Imagoo: дом и декорация, кухня, играчки, ключодържатели, практични решения и персонализирани подаръци.',
  path: '/kategorii',
})
</script>

<template>
  <div class="container">
    <div class="page-head">
      <AppBreadcrumbs :items="[{ label: 'Категории' }]" />
      <h1>Категории</h1>
      <p class="lead">Започни от това, което ти трябва — или от това, което просто ще те зарадва.</p>
    </div>
    <ul class="cats">
      <li v-for="c in categories" :key="c.slug">
        <CategoryTile :category="c" :heading-level="2" />
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.cats {
  display: grid;
  gap: 16px;
  margin-top: 16px;
  list-style: none;
  @include up(sm) {
    grid-template-columns: repeat(2, 1fr);
  }
  @include up(lg) {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  > li {
    display: grid;
  }
}
</style>
