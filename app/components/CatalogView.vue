<script setup lang="ts">
import type { CategorySlug } from '~/types/catalog'
import { SORT_OPTIONS, type SortKey } from '~/utils/catalog'
import { pluralProducts } from '~/utils/format'

const props = defineProps<{ fixedCategory?: CategorySlug; showSearch?: boolean }>()
const f = useCatalogFilters(props.fixedCategory)
const drawer = ref(false)
const searchText = ref(f.q.value)
watch(f.q, (v) => (searchText.value = v))
const sortId = useId()
const searchId = useId()

let t: ReturnType<typeof setTimeout> | undefined
function onSearchInput() {
  clearTimeout(t)
  t = setTimeout(() => f.setQuery(searchText.value), 250)
}
</script>

<template>
  <div class="cat">
    <aside class="cat__side" aria-label="Филтри">
      <div class="cat__sideInner">
        <div class="cat__sideHead">
          <h2>Филтри</h2>
          <button v-if="f.filterCount.value" type="button" class="cat__clearLink" @click="f.clearAll">Изчисти</button>
        </div>
        <FilterPanel :filters="f" :hide-category="!!fixedCategory" />
      </div>
    </aside>

    <div class="cat__main">
      <div class="cat__toolbar">
        <form v-if="showSearch" class="cat__search" role="search" @submit.prevent="f.setQuery(searchText)">
          <label :for="searchId" class="visually-hidden">Търси в каталога</label>
          <AppIcon name="search" :size="20" class="cat__searchIcon" />
          <input
            :id="searchId"
            v-model="searchText"
            type="search"
            class="input cat__searchInput"
            placeholder="Търси в каталога"
            enterkeyhint="search"
            @input="onSearchInput"
          />
        </form>
        <div class="cat__bar">
          <p class="cat__count" role="status" aria-live="polite">
            <strong>{{ pluralProducts(f.results.value.length) }}</strong>
          </p>
          <button type="button" class="btn btn--ghost btn--sm cat__filterBtn" :aria-expanded="drawer" @click="drawer = true">
            <AppIcon name="sliders" />
            Филтри<span v-if="f.filterCount.value" class="cat__badge">{{ f.filterCount.value }}</span>
          </button>
          <div class="cat__sort">
            <label :for="sortId">Подреди по</label>
            <select :id="sortId" class="select" :value="f.sort.value" @change="f.setSort(($event.target as HTMLSelectElement).value as SortKey)">
              <option v-for="o in SORT_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="f.chips.value.length" class="cat__chips">
        <p class="visually-hidden">Активни филтри:</p>
        <ul>
          <li v-for="c in f.chips.value" :key="c.key">
            <button type="button" class="chip cat__chip" @click="c.remove()">
              {{ c.label }}
              <AppIcon name="close" :size="16" />
              <span class="visually-hidden">— премахни филтъра</span>
            </button>
          </li>
        </ul>
        <button type="button" class="cat__clearLink" @click="f.clearAll(); searchText = ''">Изчисти всички</button>
      </div>

      <ul v-if="f.results.value.length" class="cat__grid">
        <li v-for="(p, i) in f.results.value" :key="p.slug">
          <ProductCard :product="p" :eager="i < 3" :heading-level="2" sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw" />
        </li>
      </ul>
      <EmptyState
        v-else
        icon="search"
        title="Няма продукти по тези критерии"
        text="Опитай с по-малко филтри или друга дума. Можеш да търсиш и на латиница — например „vaza“."
      >
        <button type="button" class="btn" @click="f.clearAll(); searchText = ''">Изчисти филтрите</button>
        <NuxtLink to="/produkti" class="btn btn--ghost">Всички продукти</NuxtLink>
      </EmptyState>
    </div>

    <AppDrawer :open="drawer" title="Филтри" side="left" width="400px" @close="drawer = false">
      <FilterPanel :filters="f" :hide-category="!!fixedCategory" />
      <template #footer>
        <div class="cat__drawerActions">
          <button type="button" class="btn btn--ghost" :disabled="!f.filterCount.value" @click="f.clearAll">Изчисти</button>
          <button type="button" class="btn" @click="drawer = false">Покажи {{ pluralProducts(f.results.value.length) }}</button>
        </div>
      </template>
    </AppDrawer>
  </div>
</template>

<style scoped lang="scss">
.cat {
  display: grid;
  gap: 32px;
  @include up(lg) {
    grid-template-columns: 260px minmax(0, 1fr);
    gap: 40px;
  }
}
.cat__side {
  display: none;
  @include up(lg) {
    display: block;
  }
}
.cat__sideInner {
  position: sticky;
  top: calc(var(--header-h) + 20px);
  max-height: calc(100vh - var(--header-h) - 40px);
  overflow-y: auto;
  padding-right: 6px;
}
.cat__sideHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  h2 {
    font-size: 1.125rem;
  }
}
.cat__clearLink {
  min-height: 40px;
  padding: 6px 8px;
  border: 0;
  background: transparent;
  color: var(--purple);
  font-weight: 600;
  font-size: 0.9375rem;
  text-decoration: underline;
  text-underline-offset: 0.2em;
}
.cat__toolbar {
  display: grid;
  gap: 12px;
  margin-bottom: 14px;
}
.cat__search {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 560px;
}
.cat__searchIcon {
  position: absolute;
  left: 14px;
  color: var(--muted);
  pointer-events: none;
}
.cat__searchInput {
  padding-left: 44px;
}
.cat__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 16px;
}
.cat__count {
  margin-right: auto;
  color: var(--muted);
  strong {
    color: var(--ink);
  }
}
.cat__filterBtn {
  @include up(lg) {
    display: none;
  }
}
.cat__badge {
  display: grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  margin-left: 4px;
  padding-inline: 6px;
  border-radius: 999px;
  background: var(--purple);
  color: var(--paper);
  font-size: 0.75rem;
}
.cat__sort {
  display: flex;
  align-items: center;
  gap: 8px;
  label {
    font-size: 0.875rem;
    color: var(--muted);
    white-space: nowrap;
    @include down(sm) {
      @include visually-hidden;
    }
  }
  .select {
    min-height: 40px;
    padding-block: 8px;
    width: auto;
    max-width: 230px;
    font-size: 0.9375rem;
  }
}
.cat__chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    list-style: none;
  }
}
.cat__chip {
  background: var(--purple-100);
  border-color: transparent;
  color: var(--purple);
  min-height: 40px;
  &:hover {
    border-color: var(--purple-400);
  }
}
.cat__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  list-style: none;
  @include up(md) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }
  > li {
    display: grid;
  }
}
.cat__drawerActions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 10px;
}
</style>
