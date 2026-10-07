<script setup lang="ts">
import type { CatalogFilters } from '~/composables/useCatalogFilters'

const props = defineProps<{ filters: CatalogFilters; hideCategory?: boolean }>()
const f = props.filters
const uid = useId()
</script>

<template>
  <div class="fp">
    <fieldset v-if="!hideCategory" class="fp__group">
      <legend>Категория</legend>
      <label v-for="c in f.facets.value.categories" :key="c.slug" class="check fp__opt">
        <input type="checkbox" :checked="f.cats.value.includes(c.slug)" @change="f.toggleCategory(c.slug)" />
        <span class="fp__name">{{ c.name }}</span>
        <span class="fp__count">{{ c.count }}</span>
      </label>
    </fieldset>

    <fieldset class="fp__group">
      <legend>Цена</legend>
      <label v-for="b in f.facets.value.prices" :key="b.id" class="check fp__opt" :class="{ 'is-empty': !b.count && !f.prices.value.includes(b.id) }">
        <input type="checkbox" :checked="f.prices.value.includes(b.id)" @change="f.togglePrice(b.id)" />
        <span class="fp__name">{{ b.label }}</span>
        <span class="fp__count">{{ b.count }}</span>
      </label>
    </fieldset>

    <fieldset class="fp__group">
      <legend>Цвят</legend>
      <div class="fp__colors">
        <label
          v-for="c in f.facets.value.colors"
          :key="c.id"
          class="fp__color"
          :class="{ 'is-empty': !c.count && !f.colors.value.includes(c.id) }"
        >
          <input type="checkbox" class="visually-hidden" :checked="f.colors.value.includes(c.id)" @change="f.toggleColor(c.id)" />
          <span class="fp__dot" :style="{ background: c.finish === 'silk' ? `linear-gradient(135deg, rgb(255 255 255 / 60%), rgb(255 255 255 / 0%) 50%, rgb(0 0 0 / 14%)), ${c.hex}` : c.hex }" aria-hidden="true">
            <AppIcon name="check" :size="14" />
          </span>
          <span class="fp__cname">{{ c.name }}</span>
          <span class="visually-hidden">, {{ c.count }} продукта</span>
        </label>
      </div>
    </fieldset>

    <fieldset class="fp__group">
      <legend>Персонализация</legend>
      <label class="check fp__opt" :for="`${uid}-p`">
        <input :id="`${uid}-p`" type="checkbox" :checked="f.personal.value" @change="f.setPersonal(($event.target as HTMLInputElement).checked)" />
        <span class="fp__name">Само с име или надпис</span>
        <span class="fp__count">{{ f.facets.value.personal }}</span>
      </label>
    </fieldset>
  </div>
</template>

<style scoped lang="scss">
.fp {
  display: grid;
  gap: 8px;
}
.fp__group {
  margin: 0;
  padding: 0 0 16px;
  border: 0;
  border-bottom: 1px solid var(--line);
  min-width: 0;
  &:last-child {
    border-bottom: 0;
  }
  legend {
    padding: 12px 0 6px;
    font-family: var(--font-display);
    font-size: 0.9375rem;
    font-weight: 600;
  }
}
.fp__opt {
  align-items: center;
  min-height: 40px;
  padding-block: 6px;
  input {
    margin: 0;
  }
  &.is-empty {
    color: var(--muted);
  }
}
.fp__name {
  flex: 1;
  font-size: 0.9375rem;
}
.fp__count {
  min-width: 28px;
  padding: 1px 8px;
  border-radius: 999px;
  background: var(--sand);
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  color: var(--muted);
}
.fp__colors {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2px 8px;
}
.fp__color {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  min-height: 44px;
  padding: 4px 6px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.875rem;
  &:hover {
    background: var(--sand);
  }
  &.is-empty {
    color: var(--muted);
    .fp__dot {
      opacity: 0.4;
    }
  }
}
.fp__dot {
  display: grid;
  flex: none;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgb(35 16 63 / 18%);
  color: transparent;
  outline: 2px solid transparent;
  outline-offset: 2px;
  transition: outline-color 0.15s;
}
input:checked + .fp__dot {
  outline-color: var(--purple);
  color: #fff;
  filter: drop-shadow(0 0 0 rgb(0 0 0 / 0));
  svg {
    filter: drop-shadow(0 0 1.5px rgb(0 0 0 / 70%));
  }
}
input:focus-visible + .fp__dot {
  outline: 3px solid var(--focus);
}
</style>
