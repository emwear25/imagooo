<script setup lang="ts">
import type { NuxtError } from '#app'
import { sortProducts } from '~/utils/catalog'

const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error?.statusCode === 404)
const { products } = useCatalog()
const picks = computed(() => sortProducts(products.value.filter((p) => p.featured), 'recommended').slice(0, 4))

useHead({
  title: is404.value ? 'Страницата не е намерена' : 'Възникна грешка',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const q = ref('')
function search() {
  clearError({ redirect: q.value.trim() ? `/produkti?q=${encodeURIComponent(q.value.trim())}` : '/produkti' })
}
</script>

<template>
  <NuxtLayout>
    <div class="container err">
      <section class="err__hero" aria-labelledby="err-title">
        <svg class="err__loop" viewBox="0 0 600 300" aria-hidden="true">
          <path
            d="M150 52C80 52 30 96 30 150s50 98 120 98c112 0 188-196 300-196 70 0 120 44 120 98s-50 98-120 98C338 248 262 52 150 52Z"
            fill="none"
            stroke="currentColor"
            stroke-width="30"
            stroke-linecap="round"
            stroke-dasharray="900 120"
          />
        </svg>
        <p class="err__code">{{ is404 ? '404' : error?.statusCode ?? 'Грешка' }}</p>
        <h1 id="err-title">{{ is404 ? 'Тази страница се изгуби някъде по линията.' : 'Нещо се обърка.' }}</h1>
        <p class="lead">
          {{
            is404
              ? 'Може адресът да е променен или продуктът вече да не е в каталога. Опитай с търсене или започни отначало.'
              : 'Опитай отново след малко. Ако проблемът продължава, върни се към началната страница.'
          }}
        </p>
        <form class="err__search" role="search" @submit.prevent="search">
          <label for="err-q" class="visually-hidden">Търси продукти</label>
          <input id="err-q" v-model="q" class="input" type="search" placeholder="Какво търсиш?" />
          <button class="btn" type="submit"><AppIcon name="search" /> Търси</button>
        </form>
        <div class="err__links">
          <button type="button" class="btn btn--ghost" @click="clearError({ redirect: '/' })">Към началото</button>
          <button type="button" class="btn btn--ghost" @click="clearError({ redirect: '/produkti' })">Всички продукти</button>
        </div>
      </section>

      <section v-if="is404" class="err__picks" aria-labelledby="picks-title">
        <h2 id="picks-title">Или започни от тук</h2>
        <ul>
          <li v-for="p in picks" :key="p.slug"><ProductCard :product="p" /></li>
        </ul>
      </section>
    </div>
  </NuxtLayout>
</template>

<style scoped lang="scss">
.err__hero {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 16px;
  padding: 56px 0 40px;
  text-align: center;
  h1 {
    max-width: 18ch;
    font-size: clamp(1.8rem, 1.2rem + 2.6vw, 3rem);
  }
  .lead {
    max-width: 52ch;
  }
}
.err__loop {
  width: min(360px, 80vw);
  color: var(--coral);
}
.err__code {
  margin-top: -8px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.25rem;
  letter-spacing: 0.2em;
  color: var(--purple);
}
.err__search {
  display: flex;
  gap: 8px;
  width: min(480px, 100%);
  margin-top: 8px;
  .input {
    flex: 1;
    min-width: 0;
  }
}
.err__links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}
.err__picks {
  margin-top: 32px;
  h2 {
    margin-bottom: 18px;
    font-size: 1.35rem;
  }
  ul {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    list-style: none;
    @include up(md) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 20px;
    }
  }
}
</style>
