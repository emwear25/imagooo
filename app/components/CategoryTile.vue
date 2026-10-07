<script setup lang="ts">
import type { Category } from '~/types/catalog'
import { productBySlug, products } from '~/data/products'
import { inCategory, cutoutImage, srcset } from '~/utils/catalog'
import { pluralProducts } from '~/utils/format'

const props = defineProps<{ category: Category; headingLevel?: 2 | 3 }>()
const imgs = computed(() =>
  props.category.showcase
    .slice(0, 3)
    .map((s) => productBySlug(s))
    .map((p) => (p ? cutoutImage(p) : undefined))
    .filter((i) => !!i),
)
const count = computed(() => products.filter((p) => inCategory(p, props.category.slug)).length)
</script>

<template>
  <article class="ctile" :style="{ '--tint': category.tint }">
    <div class="ctile__art" aria-hidden="true">
      <img
        v-for="(img, i) in imgs"
        :key="img!.src"
        :src="`${img!.src}-480.webp`"
        :srcset="srcset(img!.src)"
        sizes="(min-width: 1024px) 14vw, 30vw"
        alt=""
        width="480"
        height="600"
        loading="lazy"
        :class="`ctile__img ctile__img--${i}`"
      />
    </div>
    <div class="ctile__body">
      <component :is="`h${headingLevel ?? 3}`" class="ctile__title">
        <NuxtLink :to="`/kategorii/${category.slug}`">{{ category.name }}</NuxtLink>
      </component>
      <p class="ctile__short">{{ category.short }}</p>
      <p class="ctile__count">
        {{ pluralProducts(count) }}
        <AppIcon name="arrow-right" :size="18" />
      </p>
    </div>
  </article>
</template>

<style scoped lang="scss">
.ctile {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--r-lg);
  background: var(--tint);
  isolation: isolate;
  transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease);
  &:hover {
    box-shadow: var(--shadow-md);
  }
  @include motion {
    &:hover {
      transform: translateY(-3px);
      .ctile__img--1 {
        transform: translate(-50%, -4%) scale(1.04);
      }
      .ctile__img--0 {
        transform: translateX(-6%) rotate(-3deg);
      }
      .ctile__img--2 {
        transform: translateX(6%) rotate(3deg);
      }
    }
  }
}
.ctile__art {
  position: relative;
  height: 200px;
  @include up(md) {
    height: 230px;
  }
}
.ctile__img {
  position: absolute;
  bottom: -8px;
  width: 46%;
  height: auto;
  mix-blend-mode: multiply;
  transition: transform 0.5s var(--ease);
  &--0 {
    left: 2%;
    width: 40%;
  }
  &--1 {
    left: 50%;
    z-index: 1;
    width: 52%;
    transform: translateX(-50%);
  }
  &--2 {
    right: 2%;
    width: 40%;
  }
}
.ctile__body {
  position: relative;
  z-index: 2;
  display: grid;
  gap: 4px;
  padding: 16px 20px 20px;
  background: linear-gradient(to bottom, transparent, rgb(255 255 255 / 35%));
}
.ctile__title {
  font-size: 1.125rem;
  a {
    text-decoration: none;
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 3;
    }
    &:focus-visible {
      outline: none;
      &::after {
        @include focus-ring(-4px);
        border-radius: var(--r-lg);
      }
    }
  }
}
.ctile__short {
  color: var(--muted);
  font-size: 0.9375rem;
  line-height: 1.45;
}
.ctile__count {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--purple);
}
</style>
