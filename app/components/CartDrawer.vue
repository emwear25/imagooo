<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { useUiStore } from '~/stores/ui'
import { formatPrice, pluralItems } from '~/utils/format'

const cart = useCartStore()
const ui = useUiStore()
const route = useRoute()
watch(() => route.fullPath, () => (ui.cartOpen = false))
</script>

<template>
  <AppDrawer :open="ui.cartOpen" title="Количка" @close="ui.cartOpen = false">
    <template #head>
      <span v-if="cart.count" class="cd__count">{{ pluralItems(cart.count) }}</span>
    </template>

    <div v-if="!cart.hydrated" class="cd__loading" role="status">Зареждане на количката…</div>
    <EmptyState
      v-else-if="!cart.resolved.length"
      icon="bag"
      title="Количката е празна"
      text="Добави нещо, което ще те радва всеки ден — или подарък за някого."
      :heading-level="3"
    >
      <NuxtLink to="/produkti" class="btn" data-autofocus>Разгледай продуктите</NuxtLink>
    </EmptyState>
    <ul v-else class="cd__list">
      <CartLineItem v-for="l in cart.resolved" :key="l.key" :line="l" compact />
    </ul>

    <template v-if="cart.resolved.length" #footer>
      <div class="cd__sum">
        <span>Междинна сума</span>
        <strong class="price">{{ formatPrice(cart.subtotalCents) }}</strong>
      </div>
      <p class="cd__note">Цената за доставка ще бъде уточнена — все още не е определена.</p>
      <div class="cd__actions">
        <NuxtLink to="/kolichka" class="btn btn--ghost">Към количката</NuxtLink>
        <NuxtLink to="/porachka" class="btn btn--coral">Продължи към поръчка</NuxtLink>
      </div>
    </template>
  </AppDrawer>
</template>

<style scoped lang="scss">
.cd__count {
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--purple-100);
  color: var(--purple);
  font-size: 0.8125rem;
  font-weight: 600;
}
.cd__loading {
  padding: 40px 0;
  color: var(--muted);
  text-align: center;
}
.cd__list {
  list-style: none;
  margin-top: -18px;
}
.cd__sum {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-weight: 600;
  strong {
    font-size: 1.25rem;
  }
}
.cd__note {
  margin: 6px 0 14px;
  font-size: 0.8125rem;
  color: var(--muted);
}
.cd__actions {
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr 1.4fr;
  .btn {
    padding-inline: 12px;
    white-space: normal;
    text-align: center;
  }
}
</style>
