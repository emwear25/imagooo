<script setup lang="ts">
import { categories } from '~/data/categories'
import { store } from '~/config/store'

const year = new Date().getFullYear()
const c = store.company
</script>

<template>
  <footer class="ftr">
    <svg class="ftr__curve" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 80V40C240 0 480 0 720 40s480 40 720 0v40Z" fill="currentColor" />
    </svg>
    <div class="ftr__inner">
      <div class="container">
        <div class="ftr__top">
          <div class="ftr__brand">
            <AppLogo variant="light" :height="36" />
            <p>{{ store.brand.tagline }} Декорации, играчки и практични предмети, създадени с 3D печат.</p>
          </div>

          <nav class="ftr__col" aria-labelledby="ftr-shop">
            <h2 id="ftr-shop">Магазин</h2>
            <ul>
              <li><NuxtLink to="/produkti">Всички продукти</NuxtLink></li>
              <li v-for="cat in categories" :key="cat.slug">
                <NuxtLink :to="`/kategorii/${cat.slug}`">{{ cat.name }}</NuxtLink>
              </li>
            </ul>
          </nav>

          <nav class="ftr__col" aria-labelledby="ftr-help">
            <h2 id="ftr-help">Помощ</h2>
            <ul>
              <li><NuxtLink to="/vuprosi">Често задавани въпроси</NuxtLink></li>
              <li><NuxtLink to="/dostavka-i-plashtane">Доставка и плащане</NuxtLink></li>
              <li><NuxtLink to="/vrashtane-i-reklamacii">Връщане и рекламации</NuxtLink></li>
              <li><NuxtLink to="/za-nas">За нас</NuxtLink></li>
              <li><NuxtLink to="/kontakti">Контакти</NuxtLink></li>
            </ul>
          </nav>

          <div class="ftr__col">
            <h2>Контакти</h2>
            <ul class="ftr__contact">
              <li>
                <AppIcon name="mail" :size="18" />
                <PendingValue :setting="c.email" link="mail" placeholder="имейл — предстои" />
              </li>
              <li>
                <AppIcon name="phone" :size="18" />
                <PendingValue :setting="c.phone" link="tel" placeholder="телефон — предстои" />
              </li>
              <li>
                <AppIcon name="clock" :size="18" />
                <PendingValue :setting="c.hours" placeholder="работно време — предстои" />
              </li>
            </ul>
            <NuxtLink to="/kontakti" class="ftr__more">Форма за контакт</NuxtLink>
          </div>
        </div>

        <div class="ftr__bottom">
          <p>© {{ year }} {{ store.brand.legalDisplayName }}. Демонстрационна версия — цените и наличностите са примерни.</p>
          <ul>
            <li><NuxtLink to="/obshti-usloviya">Общи условия</NuxtLink></li>
            <li><NuxtLink to="/poveritelnost">Поверителност</NuxtLink></li>
            <li><NuxtLink to="/biskvitki">Бисквитки и съхранение</NuxtLink></li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.ftr {
  margin-top: 40px;
  color: var(--purple-800);
}
.ftr__curve {
  display: block;
  width: 100%;
  height: 40px;
  @include up(md) {
    height: 72px;
  }
}
.ftr__inner {
  background: var(--purple-800);
  color: #e9e1f7;
  padding: 24px 0 calc(28px + env(safe-area-inset-bottom));
}
.ftr__top {
  display: grid;
  gap: 36px;
  padding-bottom: 40px;
  @include up(md) {
    grid-template-columns: 1fr 1fr;
  }
  @include up(lg) {
    grid-template-columns: 1.4fr 1fr 1fr 1fr;
    gap: 48px;
  }
}
.ftr__brand {
  display: grid;
  gap: 18px;
  align-content: start;
  p {
    max-width: 34ch;
    color: #cfc3e6;
  }
}
.ftr__col {
  h2 {
    margin-bottom: 14px;
    font-size: 0.8125rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--coral);
    font-family: var(--font-body);
    font-weight: 700;
  }
  ul {
    display: grid;
    gap: 2px;
    list-style: none;
  }
  a {
    display: inline-block;
    padding-block: 6px;
    color: #f3eefb;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
      color: #fff;
    }
  }
}
.ftr__contact {
  li {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 36px;
    svg {
      color: var(--coral);
      flex: none;
    }
  }
  :deep(.pending) {
    svg {
      display: none; // the row already has an icon
    }
    background: rgb(255 255 255 / 8%);
    border-color: rgb(255 255 255 / 30%);
    color: #e9e1f7;
  }
}
.ftr__col .ftr__more {
  margin-top: 10px;
  font-weight: 600;
  text-decoration: underline;
}
.ftr__bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px 24px;
  padding-top: 22px;
  border-top: 1px solid rgb(255 255 255 / 14%);
  font-size: 0.875rem;
  color: #bfb2d8;
  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 18px;
    list-style: none;
  }
  a {
    display: inline-block;
    padding-block: 6px;
    color: #e9e1f7;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
}
:deep(:focus-visible) {
  outline-color: var(--coral);
}
</style>
