<script setup lang="ts">
import { categories, categoryBySlug } from '~/data/categories'
import { productBySlug } from '~/data/products'
import { cutoutImage, srcset } from '~/utils/catalog'

const route = useRoute()
const category = computed(() => categoryBySlug(String(route.params.slug)))

if (!category.value) {
  throw createError({ statusCode: 404, message: 'Категорията не е намерена' })
}

const art = computed(() =>
  (category.value?.showcase ?? []).map((s) => productBySlug(s)).filter((p) => !!p).map((p) => ({ p: p!, img: cutoutImage(p!) })),
)
const others = computed(() => categories.filter((c) => c.slug !== category.value?.slug))

useSeo(() => ({
  title: category.value?.name ?? 'Категория',
  description: category.value?.seoDescription ?? '',
  path: `/kategorii/${category.value?.slug}`,
}))
</script>

<template>
  <div v-if="category" class="container">
    <div class="page-head">
      <AppBreadcrumbs :items="[{ label: 'Категории', to: '/kategorii' }, { label: category.name }]" />
    </div>

    <header class="cbanner" :style="{ '--tint': category.tint }">
      <div class="cbanner__copy">
        <p class="eyebrow">Категория</p>
        <h1>{{ category.name }}</h1>
        <p class="cbanner__intro">{{ category.intro }}</p>
      </div>
      <div class="cbanner__art" aria-hidden="true">
        <img
          v-for="(a, i) in art"
          :key="a.p.slug"
          :src="a.img ? `${a.img.src}-800.webp` : undefined"
          :srcset="a.img ? srcset(a.img.src) : undefined"
          sizes="(min-width: 1024px) 18vw, 34vw"
          alt=""
          width="1200"
          height="1500"
          :loading="i === 1 ? 'eager' : 'lazy'"
          :class="`cbanner__img cbanner__img--${i}`"
        />
      </div>
    </header>

    <CatalogView :key="category.slug" :fixed-category="category.slug" />

    <nav class="more" aria-labelledby="more-cats">
      <h2 id="more-cats">Разгледай и други категории</h2>
      <ul>
        <li v-for="c in others" :key="c.slug">
          <NuxtLink :to="`/kategorii/${c.slug}`" class="chip more__chip" :style="{ background: c.tint }">{{ c.name }}</NuxtLink>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped lang="scss">
.page-head {
  padding-bottom: 12px;
}
.cbanner {
  position: relative;
  display: grid;
  gap: 8px;
  margin-bottom: 32px;
  overflow: hidden;
  border-radius: var(--r-xl);
  background: var(--tint);
  @include up(md) {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    min-height: 320px;
    margin-bottom: 44px;
  }
}
.cbanner__copy {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 12px;
  align-content: center;
  padding: 28px 22px 0;
  @include up(md) {
    padding: 48px;
  }
  h1 {
    font-size: clamp(1.9rem, 1.2rem + 3vw, 3.2rem);
  }
}
.cbanner__intro {
  max-width: 52ch;
  color: var(--muted);
  @include up(md) {
    font-size: 1.0625rem;
  }
}
.cbanner__art {
  position: relative;
  height: 220px;
  @include up(md) {
    height: auto;
  }
}
.cbanner__img {
  position: absolute;
  bottom: -6%;
  width: 40%;
  mix-blend-mode: multiply;
  &--0 {
    left: 2%;
  }
  &--1 {
    left: 50%;
    z-index: 1;
    width: 48%;
    transform: translateX(-50%);
    bottom: -4%;
  }
  &--2 {
    right: 2%;
  }
}
.more {
  margin-top: 64px;
  h2 {
    margin-bottom: 14px;
    font-size: 1.25rem;
  }
  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    list-style: none;
  }
}
.more__chip {
  min-height: 44px;
  padding-inline: 16px;
  border-color: transparent;
  font-weight: 600;
}
</style>
