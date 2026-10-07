<script setup lang="ts">
import { store } from '~/config/store'

useSeo({
  title: 'Контакти',
  description: 'Свържи се с Imagoo за въпроси относно продуктите, персонализацията и поръчките.',
  path: '/kontakti',
})

const c = store.company
const topics = ['Въпрос за продукт', 'Персонализация', 'Идея за нов продукт', 'Друго']
const form = reactive({ name: '', email: '', topic: topics[0]!, message: '' })
const submitted = ref(false)
const attempted = ref(false)
const resultEl = ref<HTMLElement | null>(null)

const errors = computed(() => {
  const e: Record<string, string> = {}
  if (form.name.trim().length < 2) e.name = 'Въведи името си.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = 'Въведи валиден имейл адрес.'
  if (form.message.trim().length < 10) e.message = 'Съобщението трябва да е поне 10 символа.'
  return e
})
const show = (k: string) => attempted.value && !!errors.value[k]

async function onSubmit() {
  attempted.value = true
  if (Object.keys(errors.value).length) {
    await nextTick()
    const first = Object.keys(errors.value)[0]
    document.getElementById(`c-${first}`)?.focus()
    return
  }
  submitted.value = true
  await nextTick()
  resultEl.value?.focus()
}
</script>

<template>
  <div class="container">
    <div class="page-head">
      <AppBreadcrumbs :items="[{ label: 'Контакти' }]" />
      <h1>Контакти</h1>
      <p class="lead">Въпрос за продукт, идея за персонализиран подарък или нещо друго — ще се радваме да ни пишеш.</p>
    </div>

    <div class="ct">
      <section class="ct__info" aria-labelledby="ct-info">
        <h2 id="ct-info">Как да се свържеш с нас</h2>
        <ul class="ct__list">
          <li>
            <span class="ct__icon"><AppIcon name="mail" /></span>
            <span><strong>Имейл</strong><PendingValue :setting="c.email" link="mail" /></span>
          </li>
          <li>
            <span class="ct__icon"><AppIcon name="phone" /></span>
            <span><strong>Телефон</strong><PendingValue :setting="c.phone" link="tel" /></span>
          </li>
          <li>
            <span class="ct__icon"><AppIcon name="clock" /></span>
            <span><strong>Работно време</strong><PendingValue :setting="c.hours" /></span>
          </li>
        </ul>
        <h3 class="ct__sub">Данни за търговеца</h3>
        <CompanyDetails />
      </section>

      <section class="ct__form" aria-labelledby="ct-form">
        <h2 id="ct-form">Изпрати съобщение</h2>
        <div class="notice notice--purple">
          <AppIcon name="info" />
          <p><strong>Изпращането не е активно в демо версията.</strong> Формата проверява полетата, но съобщението няма да бъде изпратено.</p>
        </div>

        <div v-if="submitted" ref="resultEl" class="ct__result" tabindex="-1" role="status">
          <AppIcon name="info" :size="22" />
          <div>
            <p><strong>Съобщението не е изпратено.</strong></p>
            <p>Полетата са попълнени правилно, но в тази демо версия няма връзка с пощенска услуга и нищо не е напуснало браузъра ти.</p>
            <button type="button" class="btn btn--ghost btn--sm" @click="submitted = false">Обратно към формата</button>
          </div>
        </div>

        <form v-else class="ct__fields" novalidate @submit.prevent="onSubmit">
          <div class="field">
            <label for="c-name">Име <span class="req" aria-hidden="true">*</span></label>
            <input id="c-name" v-model="form.name" class="input" autocomplete="name" required :aria-invalid="show('name')" aria-describedby="ce-name" />
            <p v-if="show('name')" id="ce-name" class="field-error"><AppIcon name="alert" :size="16" /> {{ errors.name }}</p>
          </div>
          <div class="field">
            <label for="c-email">Имейл <span class="req" aria-hidden="true">*</span></label>
            <input id="c-email" v-model="form.email" class="input" type="email" autocomplete="email" required :aria-invalid="show('email')" aria-describedby="ce-email" />
            <p v-if="show('email')" id="ce-email" class="field-error"><AppIcon name="alert" :size="16" /> {{ errors.email }}</p>
          </div>
          <div class="field">
            <label for="c-topic">Тема</label>
            <select id="c-topic" v-model="form.topic" class="select">
              <option v-for="t in topics" :key="t">{{ t }}</option>
            </select>
          </div>
          <div class="field">
            <label for="c-message">Съобщение <span class="req" aria-hidden="true">*</span></label>
            <textarea id="c-message" v-model="form.message" class="textarea" maxlength="2000" required :aria-invalid="show('message')" aria-describedby="ch-message ce-message" />
            <p id="ch-message" class="field-hint">{{ form.message.length }}/2000 символа</p>
            <p v-if="show('message')" id="ce-message" class="field-error"><AppIcon name="alert" :size="16" /> {{ errors.message }}</p>
          </div>
          <p class="field-hint">
            Как бихме обработвали данните от формата след старта: <NuxtLink to="/poveritelnost">Политика за поверителност</NuxtLink>.
          </p>
          <button type="submit" class="btn">Провери и изпрати (демо)</button>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ct {
  display: grid;
  gap: 40px;
  @include up(lg) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
    gap: 64px;
  }
  h2 {
    margin-bottom: 18px;
    font-size: 1.35rem;
  }
}
.ct__list {
  display: grid;
  gap: 12px;
  list-style: none;
  li {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  strong {
    display: block;
    font-weight: 600;
  }
}
.ct__icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--purple-100);
  color: var(--purple);
}
.ct__note {
  margin-top: 16px;
  color: var(--muted);
  font-size: 0.9375rem;
}
.ct__sub {
  margin: 32px 0 12px;
  font-size: 1.05rem;
}
.ct__form {
  padding: 24px;
  border-radius: var(--r-xl);
  background: var(--paper);
  border: 1px solid var(--line);
  @include up(md) {
    padding: 36px;
  }
}
.ct__fields {
  display: grid;
  gap: 18px;
  margin-top: 20px;
  .btn {
    justify-self: start;
  }
}
.ct__result {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding: 20px;
  border-radius: var(--r-md);
  background: var(--butter-100);
  outline: none;
  > svg {
    flex: none;
    color: var(--purple);
  }
  div {
    display: grid;
    gap: 8px;
    justify-items: start;
  }
  &:focus-visible {
    @include focus-ring;
  }
}
</style>
