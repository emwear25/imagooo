<script setup lang="ts">
import type { ResolvedLine } from '~/stores/cart'
import { useCartStore, MAX_QTY } from '~/stores/cart'
import { productImages } from '~/utils/catalog'
import { formatPrice } from '~/utils/format'

const props = withDefaults(defineProps<{ line: ResolvedLine; compact?: boolean }>(), { compact: false })
const cart = useCartStore()
const img = computed(() => productImages(props.line.product, props.line.variantId)[0])
const qty = computed({
  get: () => props.line.quantity,
  set: (v: number) => cart.setQuantity(props.line.key, v),
})
const to = computed(() => ({ path: `/produkti/${props.line.slug}`, query: { cvyat: props.line.variantId } }))
</script>

<template>
  <li class="line" :class="{ 'line--compact': compact }">
    <NuxtLink :to="to" class="line__img" tabindex="-1" aria-hidden="true">
      <ProductImage :image="img" alt="" sizes="120px" />
    </NuxtLink>
    <div class="line__info">
      <h3 class="line__name">
        <NuxtLink :to="to">{{ line.product.name }}</NuxtLink>
      </h3>
      <dl class="line__opts">
        <div>
          <dt>Цвят:</dt>
          <dd>{{ line.variantName }}</dd>
        </div>
        <div v-if="line.personalization">
          <dt>{{ line.product.personalization?.label ?? 'Надпис' }}:</dt>
          <dd class="line__text">„{{ line.personalization }}“</dd>
        </div>
      </dl>
      <p class="line__unit">{{ formatPrice(line.product.priceCents) }} / бр.</p>
      <div class="line__controls">
        <QtyStepper v-model="qty" :max="MAX_QTY" :label="line.product.name" size="sm" />
        <button type="button" class="line__remove" @click="cart.remove(line.key)">
          <AppIcon name="trash" :size="18" />
          <span>Премахни<span class="visually-hidden"> {{ line.product.name }}</span></span>
        </button>
      </div>
    </div>
    <p class="line__total price">{{ formatPrice(line.lineTotalCents) }}</p>
  </li>
</template>

<style scoped lang="scss">
.line {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 4px 16px;
  padding-block: 18px;
  border-bottom: 1px solid var(--line);
  @include up(sm) {
    grid-template-columns: 112px 1fr auto;
  }
}
.line--compact {
  grid-template-columns: 76px 1fr auto;
}
.line__img {
  grid-row: span 2;
  overflow: hidden;
  border-radius: var(--r-sm);
}
.line__name {
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0;
  a {
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
}
.line__opts {
  margin: 4px 0 0;
  font-size: 0.875rem;
  color: var(--muted);
  div {
    display: flex;
    gap: 4px;
  }
  dd {
    margin: 0;
    color: var(--ink);
  }
}
.line__text {
  font-weight: 600;
  word-break: break-word;
}
.line__unit {
  font-size: 0.8125rem;
  color: var(--muted);
}
.line__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 12px;
  margin-top: 10px;
}
.line__remove {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 6px 8px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--muted);
  font-size: 0.875rem;
  font-weight: 500;
  &:hover {
    color: var(--danger);
    background: var(--danger-100);
  }
}
.line__total {
  grid-column: 2;
  @include up(sm) {
    grid-column: 3;
    grid-row: 1;
    text-align: right;
  }
}
.line--compact .line__total {
  grid-column: 3;
  grid-row: 1;
}
</style>
