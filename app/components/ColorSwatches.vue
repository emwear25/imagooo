<script setup lang="ts">
import type { ColorVariant } from '~/types/catalog'

/** Accessible radio group of colour swatches (arrow keys move between options). */
const props = withDefaults(defineProps<{ variants: ColorVariant[]; label: string; size?: 'sm' | 'lg' }>(), { size: 'lg' })
const model = defineModel<string>({ required: true })
const name = useId()

const SHEEN = 'linear-gradient(135deg, rgb(255 255 255 / 60%) 0%, rgb(255 255 255 / 0%) 45%, rgb(0 0 0 / 0%) 60%, rgb(0 0 0 / 14%) 100%)'

function swatchStyle(v: ColorVariant) {
  const cols = v.swatches.map((s) => s.hex)
  const silk = v.swatches.some((s) => s.silk)
  const step = 100 / cols.length
  const base = cols.length === 1 ? `linear-gradient(${cols[0]}, ${cols[0]})` : `conic-gradient(${cols.map((c, i) => `${c} ${i * step}% ${(i + 1) * step}%`).join(', ')})`
  return { backgroundImage: silk ? `${SHEEN}, ${base}` : base }
}
</script>

<template>
  <fieldset class="sw" :class="`sw--${size}`">
    <legend :class="size === 'sm' ? 'visually-hidden' : 'sw__legend'">
      {{ label }}<template v-if="size === 'lg'">: <strong>{{ variants.find((v) => v.id === model)?.name }}</strong></template>
    </legend>
    <div class="sw__list">
      <label v-for="v in props.variants" :key="v.id" class="sw__opt" :class="{ 'sw__opt--off': v.available === false }" :title="v.available === false ? `${v.name} — изчерпан` : v.name">
        <input v-model="model" type="radio" :name="name" :value="v.id" class="visually-hidden" :disabled="v.available === false" />
        <span class="sw__dot" :style="swatchStyle(v)" aria-hidden="true" />
        <span class="visually-hidden">{{ v.name }}<template v-if="v.available === false"> (изчерпан)</template></span>
      </label>
    </div>
  </fieldset>
</template>

<style scoped lang="scss">
.sw {
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}
.sw__legend {
  margin-bottom: 10px;
  padding: 0;
  font-weight: 600;
  strong {
    font-weight: 500;
    color: var(--muted);
  }
}
.sw__list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.sw__opt {
  display: grid;
  place-items: center;
  border-radius: 50%;
  cursor: pointer;
}
.sw__dot {
  display: block;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgb(35 16 63 / 18%);
  outline: 2px solid transparent;
  outline-offset: 2px;
  transition: outline-color 0.15s, transform 0.15s var(--ease);
}
.sw--sm {
  .sw__opt {
    width: 30px;
    height: 30px;
  }
  .sw__dot {
    width: 18px;
    height: 18px;
  }
}
.sw--lg {
  .sw__list {
    gap: 8px;
  }
  .sw__opt {
    width: 48px;
    height: 48px;
  }
  .sw__dot {
    width: 36px;
    height: 36px;
  }
}
.sw__opt--off {
  cursor: not-allowed;
  opacity: 0.35;
}
.sw__opt:hover .sw__dot {
  transform: scale(1.08);
}
input:checked + .sw__dot {
  outline-color: var(--purple);
}
input:focus-visible + .sw__dot {
  outline: 3px solid var(--focus);
  outline-offset: 3px;
}
</style>
