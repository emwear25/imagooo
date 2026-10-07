<script setup lang="ts">
import type { Product } from '~/types/catalog'
import { productImages, imageUrl } from '~/utils/catalog'
import { useCartStore } from '~/stores/cart'
import { useWishlistStore } from '~/stores/wishlist'
import { useUiStore } from '~/stores/ui'

const props = withDefaults(defineProps<{ product: Product; eager?: boolean; sizes?: string; headingLevel?: 2 | 3 }>(), {
  eager: false,
  headingLevel: 3,
})

const cart = useCartStore()
const wishlist = useWishlistStore()
const ui = useUiStore()

const variantId = ref((props.product.variants.find((v) => v.available !== false) ?? props.product.variants[0]!).id)
const variant = computed(() => props.product.variants.find((v) => v.id === variantId.value)!)
const imgs = computed(() => productImages(props.product, variantId.value))
const hoverImg = computed(() => imgs.value.find((i) => i.view === 'side'))
const to = computed(() => ({
  path: `/produkti/${props.product.slug}`,
  query: variantId.value !== props.product.variants[0]!.id ? { cvyat: variantId.value } : undefined,
}))
const needsInput = computed(() => !!props.product.personalization?.required)
const saved = computed(() => wishlist.has(props.product.slug))

const badgeText: Record<string, string> = {
  new: 'Ново',
  personalizable: 'С име',
  set: 'Комплект',
  picked: 'Избрано за теб',
}
const badges = computed(() => props.product.badges.slice(0, 2))

function quickAdd() {
  cart.add(props.product.slug, variantId.value, 1)
  const img = imgs.value[0]
  ui.toast({
    title: 'Добавено в количката',
    body: `${props.product.name} · ${variant.value.name}`,
    image: img ? imageUrl(img, 480) : undefined,
    action: { label: 'Към количката', to: '/kolichka' },
    tone: 'success',
  })
}

function toggleWish() {
  const on = wishlist.toggle(props.product.slug)
  ui.toast({ title: on ? 'Запазено в любими' : 'Премахнато от любими', body: props.product.name, tone: 'info' }, 3000)
}
</script>

<template>
  <article class="card">
    <div class="card__media">
      <ProductImage
        :image="imgs[0]"
        :alt="`${product.name} в цвят ${variant.name}`"
        :eager="eager"
        :sizes="sizes"
        class="card__img"
      />
      <ProductImage
        v-if="hoverImg"
        :image="hoverImg"
        alt=""
        :sizes="sizes"
        class="card__img card__img--alt"
        aria-hidden="true"
      />
      <ul v-if="badges.length" class="card__badges" aria-label="Етикети">
        <li v-for="b in badges" :key="b" class="badge" :class="b === 'picked' ? 'badge--purple' : b === 'new' ? 'badge--coral' : ''">
          {{ badgeText[b] }}
        </li>
      </ul>
      <button
        type="button"
        class="card__wish"
        :aria-pressed="saved"
        :aria-label="saved ? `Премахни ${product.name} от любими` : `Запази ${product.name} в любими`"
        @click="toggleWish"
      >
        <AppIcon :name="saved ? 'heart-fill' : 'heart'" />
      </button>
    </div>

    <div class="card__body">
      <component :is="`h${headingLevel}`" class="card__title">
        <NuxtLink :to="to" class="card__link">{{ product.name }}</NuxtLink>
      </component>
      <p class="card__tagline">{{ product.tagline }}</p>

      <div class="card__row">
        <ColorSwatches v-model="variantId" :variants="product.variants" size="sm" :label="`Цвят за ${product.name}`" />
      </div>

      <div class="card__foot">
        <PriceTag :cents="product.priceCents" :compare-at-cents="product.compareAtCents" />
        <NuxtLink v-if="needsInput" :to="to" class="btn btn--ghost btn--sm card__action">
          <AppIcon name="pen" />
          Персонализирай
        </NuxtLink>
        <span v-else-if="variant.available === false" class="card__soldout">Изчерпан</span>
        <button v-else type="button" class="btn btn--sm card__action" @click="quickAdd">
          <AppIcon name="bag" />
          Добави
          <span class="visually-hidden">{{ product.name }}, {{ variant.name }}, в количката</span>
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.card__soldout {
  color: var(--muted);
  font-size: 0.875rem;
  font-weight: 600;
}
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--r-lg);
  background: var(--paper);
  border: 1px solid var(--line);
  overflow: hidden;
  transition: box-shadow 0.3s var(--ease), transform 0.3s var(--ease), border-color 0.3s;
  &:hover {
    border-color: var(--sand-300);
    box-shadow: var(--shadow-md);
  }
  @include motion {
    &:hover {
      transform: translateY(-3px);
    }
  }
}

.card__media {
  position: relative;
  overflow: hidden;
}

.card__img {
  @include motion {
    :deep(img) {
      transition: transform 0.6s var(--ease);
    }
  }
}

.card__img--alt {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.35s var(--ease);
}

@media (hover: hover) {
  .card:hover .card__img--alt {
    opacity: 1;
  }
  .card:hover .card__img :deep(img) {
    transform: scale(1.025);
  }
}

.card__badges {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 60px; // keep clear of the wishlist button
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
  pointer-events: none;
}

.card__wish {
  position: absolute;
  z-index: 2;
  top: 8px;
  right: 8px;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: rgb(255 253 249 / 88%);
  color: var(--purple);
  transition: transform 0.2s var(--ease), background-color 0.2s;
  svg {
    width: 21px;
    height: 21px;
  }
  &[aria-pressed='true'] {
    color: var(--coral-600);
  }
  &:hover {
    background: var(--paper);
    transform: scale(1.06);
  }
}

.card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px 16px;
}

.card__title {
  font-family: var(--font-body);
  font-size: 1.0625rem;
  font-weight: 650;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.card__link {
  text-decoration: none;
  &::after {
    // whole card is clickable; interactive controls sit above with z-index
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
  }
  &:focus-visible {
    outline: none;
    &::after {
      @include focus-ring(-3px);
      border-radius: var(--r-lg);
    }
  }
}

.card__tagline {
  color: var(--muted);
  font-size: 0.875rem;
  line-height: 1.45;
}

.card__row {
  position: relative;
  z-index: 2;
  margin-top: 4px;
}

.card__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 10px;
}

.card__action {
  position: relative;
  z-index: 2;
  min-height: 44px;
}

@include down(sm) {
  .card__badges li + li {
    display: none;
  }
  .card__body {
    padding: 12px;
  }
  .card__tagline {
    display: none;
  }
  .card__foot {
    flex-direction: column;
    align-items: stretch;
  }
  .card__action {
    width: 100%;
    padding-inline: 10px;
  }
}
</style>
