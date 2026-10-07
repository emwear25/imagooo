<script setup lang="ts">
import { cutoutImage, imageUrl } from '~/utils/catalog'
import { useCartStore } from '~/stores/cart'
import { useWishlistStore } from '~/stores/wishlist'
import { useUiStore } from '~/stores/ui'

const { categories, productBySlug, canOrder } = useCatalog()
const cart = useCartStore()
const wishlist = useWishlistStore()
const ui = useUiStore()
const route = useRoute()

const catOpen = ref(false)
const searchOpen = ref(false)
const catRoot = ref<HTMLElement | null>(null)
const catBtn = ref<HTMLButtonElement | null>(null)
const catPanelId = useId()

const thumb = (slug: string) => {
  const p = productBySlug(slug)
  const img = p && cutoutImage(p)
  return img ? imageUrl(img, 480) : undefined
}

watch(
  () => route.fullPath,
  () => {
    catOpen.value = false
    ui.menuOpen = false
    searchOpen.value = false
  },
)

function onCatKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && catOpen.value) {
    catOpen.value = false
    catBtn.value?.focus()
  }
}
function onCatFocusOut(e: FocusEvent) {
  if (!catRoot.value?.contains(e.relatedTarget as Node)) catOpen.value = false
}
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (catOpen.value && !catRoot.value?.contains(e.target as Node)) catOpen.value = false
  })
})

const isActive = (prefix: string) => route.path === prefix || route.path.startsWith(prefix + '/')
const badge = (n: number) => (n > 99 ? '99+' : String(n))
</script>

<template>
  <div class="demo-bar" v-if="!canOrder">
    <div class="container demo-bar__inner">
      <AppIcon name="info" :size="16" />
      <p>
        <strong>Магазинът се подготвя.</strong> Скоро тук ще намериш първите ни продукти.
      </p>
    </div>
  </div>

  <header class="hdr">
    <div class="container hdr__bar">
      <button type="button" class="icon-btn hdr__menu" aria-label="Отвори менюто" :aria-expanded="ui.menuOpen" @click="ui.menuOpen = true">
        <AppIcon name="menu" />
      </button>

      <NuxtLink to="/" class="hdr__logo" aria-label="imagoo — начало">
        <AppLogo :height="30" />
      </NuxtLink>

      <nav class="hdr__nav" aria-label="Основна навигация">
        <ul>
          <li>
            <NuxtLink to="/produkti" :class="{ 'is-active': isActive('/produkti') }">Продукти</NuxtLink>
          </li>
          <li ref="catRoot" class="hdr__cat" @keydown="onCatKey" @focusout="onCatFocusOut">
            <button
              ref="catBtn"
              type="button"
              :aria-expanded="catOpen"
              :aria-controls="catPanelId"
              :class="{ 'is-active': isActive('/kategorii') }"
              @click="catOpen = !catOpen"
            >
              Категории
              <AppIcon name="chevron-down" :size="18" class="hdr__chev" />
            </button>
            <div v-show="catOpen" :id="catPanelId" class="hdr__mega">
              <ul>
                <li v-for="c in categories" :key="c.slug">
                  <NuxtLink :to="`/kategorii/${c.slug}`" class="hdr__megaLink">
                    <span class="hdr__megaImg" :style="{ background: c.tint }">
                      <img v-if="c.showcase[0] && thumb(c.showcase[0])" :src="thumb(c.showcase[0])" alt="" width="64" height="80" loading="lazy" />
                    </span>
                    <span>
                      <strong>{{ c.name }}</strong>
                      <small>{{ c.short }}</small>
                    </span>
                  </NuxtLink>
                </li>
              </ul>
              <NuxtLink to="/kategorii" class="link-arrow hdr__megaAll">
                Всички категории <AppIcon name="arrow-right" />
              </NuxtLink>
            </div>
          </li>
          <li>
            <NuxtLink to="/kategorii/personalizirani-podaraci">Подаръци с име</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/za-nas" :class="{ 'is-active': isActive('/za-nas') }">За нас</NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="hdr__search">
        <HeaderSearch />
      </div>

      <div class="hdr__actions">
        <button
          type="button"
          class="icon-btn hdr__searchBtn"
          :aria-expanded="searchOpen"
          aria-controls="mobile-search"
          @click="searchOpen = !searchOpen"
        >
          <AppIcon :name="searchOpen ? 'close' : 'search'" />
          <span class="visually-hidden">{{ searchOpen ? 'Затвори търсенето' : 'Търси' }}</span>
        </button>
        <NuxtLink to="/lyubimi" class="icon-btn hdr__wish">
          <AppIcon name="heart" />
          <span class="visually-hidden">Любими</span>
          <ClientOnly>
            <span v-if="wishlist.count" class="hdr__count" aria-hidden="true">{{ badge(wishlist.count) }}</span>
            <span v-if="wishlist.count" class="visually-hidden">({{ wishlist.count }})</span>
          </ClientOnly>
        </NuxtLink>
        <button type="button" class="icon-btn hdr__cart" :aria-expanded="ui.cartOpen" @click="ui.cartOpen = true">
          <AppIcon name="bag" />
          <span class="visually-hidden">Количка</span>
          <ClientOnly>
            <span v-if="cart.count" class="hdr__count hdr__count--coral" aria-hidden="true">{{ badge(cart.count) }}</span>
            <span class="visually-hidden">, {{ cart.count }} {{ cart.count === 1 ? 'артикул' : 'артикула' }}</span>
          </ClientOnly>
        </button>
      </div>
    </div>

    <div v-if="searchOpen" id="mobile-search" class="hdr__mobileSearch">
      <div class="container">
        <HeaderSearch autofocus @done="searchOpen = false" />
      </div>
    </div>
  </header>

  <AppDrawer :open="ui.menuOpen" title="Меню" side="left" width="380px" @close="ui.menuOpen = false">
    <nav aria-label="Мобилна навигация" class="mnav">
      <NuxtLink to="/produkti" class="mnav__big">Всички продукти <AppIcon name="arrow-right" /></NuxtLink>
      <p class="mnav__label">Категории</p>
      <ul class="mnav__cats">
        <li v-for="c in categories" :key="c.slug">
          <NuxtLink :to="`/kategorii/${c.slug}`">
            <span class="mnav__thumb" :style="{ background: c.tint }">
              <img v-if="c.showcase[0] && thumb(c.showcase[0])" :src="thumb(c.showcase[0])" alt="" width="40" height="50" loading="lazy" />
            </span>
            {{ c.name }}
          </NuxtLink>
        </li>
      </ul>
      <p class="mnav__label">Магазин</p>
      <ul class="mnav__links">
        <li><NuxtLink to="/lyubimi">Любими</NuxtLink></li>
        <li><NuxtLink to="/kolichka">Количка</NuxtLink></li>
        <li><NuxtLink to="/za-nas">За нас</NuxtLink></li>
        <li><NuxtLink to="/vuprosi">Често задавани въпроси</NuxtLink></li>
        <li><NuxtLink to="/dostavka-i-plashtane">Доставка и плащане</NuxtLink></li>
        <li><NuxtLink to="/kontakti">Контакти</NuxtLink></li>
      </ul>
    </nav>
  </AppDrawer>
</template>

<style scoped lang="scss">
.demo-bar {
  background: var(--purple);
  color: var(--paper);
  font-size: 0.8125rem;
  &__inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 34px;
    padding-block: 6px;
    text-align: center;
    svg {
      flex: none;
      color: var(--coral);
    }
  }
}

.hdr {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgb(251 247 241 / 94%);
  backdrop-filter: saturate(1.4) blur(10px);
  border-bottom: 1px solid var(--line);
}

.hdr__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: var(--header-h);
  @include up(lg) {
    gap: 28px;
  }
}

.hdr__menu {
  margin-left: -10px;
  @include up(lg) {
    display: none;
  }
}

.hdr__logo {
  display: inline-flex;
  padding: 6px 4px;
  border-radius: 10px;
  @include down(lg) {
    margin-inline: auto;
    padding-left: 44px; // balances action icons so the logo sits centered
  }
  @include down(sm) {
    padding-left: 0;
    margin-inline: 4px auto;
    :deep(img) {
      height: 26px;
    }
  }
}

.hdr__nav {
  display: none;
  @include up(lg) {
    display: block;
  }
  > ul {
    display: flex;
    gap: 2px;
    list-style: none;
  }
  a,
  button {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    min-height: 44px;
    padding: 8px 12px;
    border: 0;
    border-radius: 12px;
    background: transparent;
    font-weight: 500;
    font-size: 0.975rem;
    text-decoration: none;
    white-space: nowrap;
    &:hover,
    &[aria-expanded='true'] {
      background: var(--purple-100);
      color: var(--purple);
    }
    &.is-active {
      color: var(--purple);
      box-shadow: inset 0 -2px 0 var(--coral);
      border-radius: 12px 12px 4px 4px;
    }
  }
}

.hdr__cat {
  position: relative;
  button[aria-expanded='true'] .hdr__chev {
    transform: rotate(180deg);
  }
}
.hdr__chev {
  transition: transform 0.2s var(--ease);
}

.hdr__mega {
  position: absolute;
  top: calc(100% + 12px);
  left: -20px;
  width: 640px;
  padding: 14px;
  border-radius: var(--r-lg);
  background: var(--paper);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-lg);
  ul {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    list-style: none;
  }
}
.hdr__nav .hdr__megaLink {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 8px;
  white-space: normal;
  strong {
    display: block;
    font-weight: 600;
    color: var(--ink);
  }
  small {
    display: block;
    color: var(--muted);
    font-size: 0.8125rem;
    line-height: 1.35;
    font-weight: 400;
  }
}
.hdr__megaImg {
  flex: none;
  width: 56px;
  height: 70px;
  overflow: hidden;
  border-radius: 12px;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    mix-blend-mode: multiply;
  }
}
.hdr__nav .hdr__megaAll {
  margin: 8px 0 0 8px;
  color: var(--purple);
  font-weight: 600;
}

.hdr__search {
  flex: 1;
  max-width: 420px;
  margin-left: auto;
  @include down(lg) {
    display: none;
  }
}

.hdr__actions {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-right: -8px;
}

.hdr__searchBtn {
  @include up(lg) {
    display: none;
  }
}

.hdr__wish {
  @include down(sm) {
    display: none;
  }
}

.hdr__count {
  position: absolute;
  top: 3px;
  right: 1px;
  display: grid;
  place-items: center;
  min-width: 19px;
  height: 19px;
  padding-inline: 5px;
  border-radius: 999px;
  background: var(--purple);
  color: var(--paper);
  font-size: 0.6875rem;
  font-weight: 700;
  line-height: 1;
  &--coral {
    background: var(--coral);
    color: var(--ink);
  }
}

.hdr__mobileSearch {
  padding-block: 0 12px;
  @include up(lg) {
    display: none;
  }
}

// mobile drawer nav
.mnav {
  display: grid;
  gap: 6px;
}
.mnav__big {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-radius: var(--r-md);
  background: var(--purple);
  color: var(--paper);
  font-family: var(--font-display);
  font-weight: 600;
  text-decoration: none;
}
.mnav__label {
  margin-top: 18px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.mnav__cats,
.mnav__links {
  list-style: none;
  a {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 48px;
    padding: 6px 8px;
    border-radius: 12px;
    font-weight: 500;
    text-decoration: none;
    &:hover {
      background: var(--purple-100);
    }
  }
}
.mnav__thumb {
  flex: none;
  width: 40px;
  height: 50px;
  overflow: hidden;
  border-radius: 10px;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    mix-blend-mode: multiply;
  }
}
</style>
