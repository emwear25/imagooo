<script setup lang="ts">
const props = withDefaults(defineProps<{ min?: number; max?: number; label: string; size?: 'sm' | 'md' }>(), {
  min: 1,
  max: 20,
  size: 'md',
})
const model = defineModel<number>({ required: true })
const id = useId()

function set(v: number) {
  model.value = Math.max(props.min, Math.min(props.max, Math.round(Number.isFinite(v) ? v : props.min)))
}
</script>

<template>
  <div class="qty" :class="`qty--${size}`">
    <label :for="id" class="visually-hidden">{{ label }}</label>
    <button type="button" class="qty__btn" :disabled="model <= min" :aria-label="`Намали количеството (${label})`" @click="set(model - 1)">
      <AppIcon name="minus" />
    </button>
    <input
      :id="id"
      class="qty__input"
      type="number"
      inputmode="numeric"
      :min="min"
      :max="max"
      :value="model"
      @change="set(Number(($event.target as HTMLInputElement).value))"
    />
    <button type="button" class="qty__btn" :disabled="model >= max" :aria-label="`Увеличи количеството (${label})`" @click="set(model + 1)">
      <AppIcon name="plus" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.qty {
  display: inline-flex;
  align-items: center;
  border: 1.5px solid var(--sand-300);
  border-radius: 14px;
  background: var(--paper);
}
.qty__btn {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  svg {
    width: 18px;
    height: 18px;
  }
  &:hover:not(:disabled) {
    background: var(--purple-100);
  }
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}
.qty__input {
  width: 2.6em;
  border: 0;
  background: transparent;
  text-align: center;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  appearance: textfield;
  -moz-appearance: textfield;
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &:focus-visible {
    outline: 3px solid var(--focus);
    border-radius: 6px;
  }
}
.qty--md .qty__btn {
  width: 48px;
  height: 48px;
}
</style>
