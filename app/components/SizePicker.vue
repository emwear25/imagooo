<script setup lang="ts">
import type { SizeOption } from '~/types/catalog'
import { formatPrice } from '~/utils/format'

/** Radio group of sizes, each with its own price (arrow keys move between options). */
defineProps<{ sizes: SizeOption[]; label: string }>()
const model = defineModel<string>({ required: true })
const name = useId()
</script>

<template>
  <fieldset class="sz">
    <legend class="sz__legend">{{ label }}</legend>
    <div class="sz__list">
      <label v-for="s in sizes" :key="s.id" class="sz__opt">
        <input v-model="model" type="radio" :name="name" :value="s.id" class="visually-hidden" />
        <span class="sz__box">
          <span class="sz__name">{{ s.name }}</span>
          <span class="sz__price">{{ formatPrice(s.priceCents) }}</span>
        </span>
      </label>
    </div>
  </fieldset>
</template>

<style scoped lang="scss">
.sz {
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}
.sz__legend {
  margin-bottom: 10px;
  padding: 0;
  font-weight: 600;
}
.sz__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.sz__opt {
  cursor: pointer;
}
.sz__box {
  display: grid;
  gap: 2px;
  min-width: 96px;
  min-height: 44px;
  padding: 8px 14px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--paper);
  transition: border-color 0.15s, box-shadow 0.15s, background-color 0.15s;
}
.sz__name {
  font-weight: 600;
  font-size: 0.9375rem;
}
.sz__price {
  color: var(--muted);
  font-size: 0.8125rem;
}
.sz__opt:hover .sz__box {
  border-color: var(--sand-300);
}
input:checked + .sz__box {
  border-color: var(--purple);
  box-shadow: inset 0 0 0 1px var(--purple);
  .sz__price {
    color: var(--purple);
  }
}
input:focus-visible + .sz__box {
  @include focus-ring(2px);
}
</style>
