<script setup lang="ts">
/** Newsletter sign-up (shared backend, store "imagoo"). */
const api = useApi()
const email = ref('')
const state = ref<'idle' | 'sending' | 'done' | 'error'>('idle')
const message = ref('')
const inputId = useId()

async function subscribe() {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
    state.value = 'error'
    message.value = 'Въведи валиден имейл адрес.'
    return
  }
  state.value = 'sending'
  try {
    await api('/api/subscriptions', { method: 'POST', body: { email: email.value.trim() } })
    state.value = 'done'
    message.value = 'Готово! Изпратихме ти потвърждение.'
    email.value = ''
  } catch (err) {
    state.value = 'error'
    message.value = (err as { data?: { message?: string } })?.data?.message ?? 'Не успяхме да те абонираме. Опитай отново.'
  }
}
</script>

<template>
  <form class="nl" novalidate @submit.prevent="subscribe">
    <label :for="inputId" class="nl__label">Новини и нови продукти</label>
    <div class="nl__row">
      <input
        :id="inputId"
        v-model="email"
        class="input nl__input"
        type="email"
        autocomplete="email"
        placeholder="твоят@имейл.bg"
        :aria-invalid="state === 'error'"
        :aria-describedby="`${inputId}-msg`"
      />
      <button type="submit" class="btn btn--sm nl__btn" :disabled="state === 'sending'">
        {{ state === 'sending' ? '…' : 'Абонирай се' }}
      </button>
    </div>
    <p :id="`${inputId}-msg`" class="nl__msg" :class="`nl__msg--${state}`" aria-live="polite">{{ message }}</p>
  </form>
</template>

<style scoped lang="scss">
.nl {
  display: grid;
  gap: 8px;
}
.nl__label {
  font-weight: 600;
}
.nl__row {
  display: flex;
  gap: 8px;
}
.nl__input {
  flex: 1;
  min-width: 0;
}
.nl__btn {
  flex: none;
}
.nl__msg {
  min-height: 1.2em;
  font-size: 0.8125rem;
  &--error {
    color: var(--coral-600, #e0564d);
  }
}
</style>
