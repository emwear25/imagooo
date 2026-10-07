<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { formatPrice, pluralItems } from '~/utils/format'
import { productImages } from '~/utils/catalog'

withDefaults(defineProps<{ showItems?: boolean; title?: string }>(), { showItems: false, title: 'Обобщение' })
const cart = useCartStore()
</script>

<template>
  <div class="sum">
    <h2 class="sum__title">{{ title }}</h2>
    <ul v-if="showItems" class="sum__items">
      <li v-for="l in cart.resolved" :key="l.key">
        <span class="sum__thumb">
          <img
            v-if="productImages(l.product, l.variantId)[0]"
            :src="`${productImages(l.product, l.variantId)[0]!.src}-480.webp`"
            alt=""
            width="56"
            height="70"
          />
          <span class="sum__qty" aria-hidden="true">{{ l.quantity }}</span>
        </span>
        <span class="sum__info">
          <strong>{{ l.product.name }}</strong>
          <span>{{ l.variantName }}<template v-if="l.personalization"> · „{{ l.personalization }}“</template></span>
          <span class="visually-hidden">Количество: {{ l.quantity }}</span>
        </span>
        <span class="price">{{ formatPrice(l.lineTotalCents) }}</span>
      </li>
    </ul>
    <dl class="sum__rows">
      <div>
        <dt>Продукти ({{ pluralItems(cart.count) }})</dt>
        <dd class="price">{{ formatPrice(cart.subtotalCents) }}</dd>
      </div>
      <div>
        <dt>Доставка</dt>
        <dd class="sum__pending">предстои уточняване</dd>
      </div>
      <div class="sum__total">
        <dt>Общо без доставка</dt>
        <dd class="price">{{ formatPrice(cart.subtotalCents) }}</dd>
      </div>
    </dl>
    <p class="sum__note">
      Цените са демонстрационни. Цената за доставка не е определена и не е включена в сумата.
    </p>
    <slot />
  </div>
</template>

<style scoped lang="scss">
.sum {
  display: grid;
  gap: 16px;
  padding: 22px;
  border-radius: var(--r-lg);
  background: var(--paper);
  border: 1px solid var(--line);
}
.sum__title {
  font-size: 1.25rem;
}
.sum__items {
  display: grid;
  gap: 12px;
  list-style: none;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
  li {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
.sum__thumb {
  position: relative;
  flex: none;
  img {
    width: 52px;
    height: 65px;
    object-fit: cover;
    border-radius: 10px;
  }
}
.sum__qty {
  position: absolute;
  top: -6px;
  right: -6px;
  display: grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  padding-inline: 5px;
  border-radius: 999px;
  background: var(--purple);
  color: var(--paper);
  font-size: 0.75rem;
  font-weight: 700;
}
.sum__info {
  display: grid;
  flex: 1;
  min-width: 0;
  font-size: 0.875rem;
  strong {
    font-weight: 600;
  }
  span {
    color: var(--muted);
    overflow-wrap: anywhere;
  }
}
.sum__rows {
  display: grid;
  gap: 10px;
  margin: 0;
  div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }
  dt {
    color: var(--muted);
  }
  dd {
    margin: 0;
  }
}
.sum__pending {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--purple);
}
.sum__total {
  padding-top: 12px;
  border-top: 1px solid var(--line);
  dt {
    color: var(--ink);
    font-weight: 600;
  }
  dd {
    font-size: 1.25rem;
  }
}
.sum__note {
  font-size: 0.8125rem;
  color: var(--muted);
}
</style>
