<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { pluralItems } from '~/utils/format'

const cart = useCartStore()
const confirmClear = ref(false)

useSeo({
  title: 'Количка',
  description: 'Прегледай продуктите в количката си в Imagoo.',
  path: '/kolichka',
})
</script>

<template>
  <div class="container">
    <div class="page-head">
      <AppBreadcrumbs :items="[{ label: 'Количка' }]" />
      <h1>Количка</h1>
    </div>

    <div v-if="!cart.hydrated" class="loading" role="status">Зареждане на количката…</div>

    <EmptyState
      v-else-if="!cart.resolved.length"
      icon="bag"
      title="Количката е празна"
      text="Разгледай каталога и добави нещо, което ще те радва всеки ден."
    >
      <NuxtLink to="/produkti" class="btn">Разгледай продуктите</NuxtLink>
      <NuxtLink to="/lyubimi" class="btn btn--ghost">Към любими</NuxtLink>
    </EmptyState>

    <div v-else class="cart">
      <section class="cart__lines" aria-labelledby="lines-title">
        <div class="cart__head">
          <h2 id="lines-title">{{ pluralItems(cart.count) }}</h2>
          <div v-if="!confirmClear">
            <button type="button" class="btn btn--ghost btn--sm" @click="confirmClear = true">
              <AppIcon name="trash" /> Изпразни
            </button>
          </div>
          <div v-else class="cart__confirm" role="group" aria-label="Потвърди изпразването">
            <span>Сигурен ли си?</span>
            <button type="button" class="btn btn--sm" @click="cart.clear(); confirmClear = false">Да, изпразни</button>
            <button type="button" class="btn btn--ghost btn--sm" @click="confirmClear = false">Отказ</button>
          </div>
        </div>
        <ul class="cart__list">
          <CartLineItem v-for="l in cart.resolved" :key="l.key" :line="l" />
        </ul>
        <NuxtLink to="/produkti" class="link-arrow cart__more">
          Продължи с пазаруването <AppIcon name="arrow-right" />
        </NuxtLink>
      </section>

      <aside class="cart__side">
        <OrderSummary>
          <NuxtLink to="/porachka" class="btn btn--coral btn--block">
            Продължи към поръчка
            <AppIcon name="arrow-right" />
          </NuxtLink>
          <div class="notice notice--purple">
            <AppIcon name="info" />
            <p><strong>Демо версия.</strong> Можеш да разгледаш стъпката за поръчка, но поръчки и плащания не се изпращат.</p>
          </div>
        </OrderSummary>
      </aside>
    </div>
  </div>
</template>

<style scoped lang="scss">
.loading {
  padding: 60px 0;
  text-align: center;
  color: var(--muted);
}
.cart {
  display: grid;
  gap: 32px;
  @include up(lg) {
    grid-template-columns: minmax(0, 1fr) 400px;
    gap: 48px;
    align-items: start;
  }
}
.cart__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--line);
  h2 {
    font-size: 1.125rem;
  }
}
.cart__confirm {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  span {
    font-weight: 600;
    font-size: 0.9375rem;
  }
}
.cart__list {
  list-style: none;
}
.cart__more {
  margin-top: 20px;
}
.cart__side {
  @include up(lg) {
    position: sticky;
    top: calc(var(--header-h) + 20px);
  }
}
</style>
