<script setup lang="ts">
import { useWishlistStore } from '~/stores/wishlist'
import { sortProducts } from '~/utils/catalog'
import { pluralProducts } from '~/utils/format'
const { products } = useCatalog()

const wishlist = useWishlistStore()
const suggestions = computed(() =>
  sortProducts(products.value.filter((p) => p.featured && !wishlist.has(p.slug)), 'recommended').slice(0, 4),
)

useSeo({
  title: 'Любими',
  description: 'Продуктите, които си запазил в Imagoo.',
  path: '/lyubimi',
})
</script>

<template>
  <div class="container">
    <div class="page-head">
      <AppBreadcrumbs :items="[{ label: 'Любими' }]" />
      <h1>Любими</h1>
      <p class="lead">
        Запазените продукти остават само в този браузър — не е нужен профил.
      </p>
    </div>

    <div v-if="!wishlist.hydrated" class="loading" role="status">Зареждане…</div>

    <template v-else-if="wishlist.products.length">
      <div class="bar">
        <p>
          <strong>{{ pluralProducts(wishlist.count) }}</strong>
        </p>
        <button type="button" class="btn btn--ghost btn--sm" @click="wishlist.clear()">
          <AppIcon name="trash" /> Изчисти списъка
        </button>
      </div>
      <ul class="grid">
        <li v-for="p in wishlist.products" :key="p!.slug">
          <ProductCard :product="p!" :heading-level="2" />
        </li>
      </ul>
    </template>

    <EmptyState
      v-else
      icon="heart"
      title="Все още нямаш любими"
      text="Натисни сърцето на всеки продукт, който ти хареса, и ще го намериш тук по-късно."
    >
      <NuxtLink to="/produkti" class="btn">Разгледай продуктите</NuxtLink>
      <NuxtLink to="/kategorii/personalizirani-podaraci" class="btn btn--ghost">Идеи за подарък</NuxtLink>
    </EmptyState>

    <section v-if="wishlist.hydrated && suggestions.length" class="suggest" aria-labelledby="sug-title">
      <SectionHead id="sug-title" eyebrow="Избрано за теб" title="Може да ти хареса" />
      <ul class="grid">
        <li v-for="p in suggestions" :key="p.slug">
          <ProductCard :product="p" />
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped lang="scss">
.loading {
  padding: 60px 0;
  text-align: center;
  color: var(--muted);
}
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  list-style: none;
  @include up(md) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }
  @include up(xl) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  > li {
    display: grid;
  }
}
.suggest {
  margin-top: 72px;
}
</style>
