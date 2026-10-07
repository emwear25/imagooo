<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { formatPrice } from '~/utils/format'

const cart = useCartStore()

useSeo({
  title: 'Поръчка (демо)',
  description: 'Демонстрационна стъпка за поръчка в Imagoo. Поръчки и плащания не се обработват.',
  path: '/porachka',
})

type Delivery = 'address' | 'office'
const form = reactive({
  name: '',
  email: '',
  phone: '',
  delivery: 'address' as Delivery,
  city: '',
  postcode: '',
  address: '',
  office: '',
  invoice: false,
  company: '',
  eik: '',
  mol: '',
  companyAddress: '',
  vat: '',
  note: '',
  terms: false,
})

const labels: Record<string, string> = {
  name: 'Име и фамилия',
  email: 'Имейл',
  phone: 'Телефон',
  city: 'Населено място',
  postcode: 'Пощенски код',
  address: 'Адрес',
  office: 'Офис на куриер',
  company: 'Фирма',
  eik: 'ЕИК',
  mol: 'МОЛ',
  companyAddress: 'Адрес на регистрация',
  vat: 'ДДС номер',
  terms: 'Съгласие с условията',
}

const errors = computed<Record<string, string>>(() => {
  const e: Record<string, string> = {}
  const t = (s: string) => s.trim()
  if (t(form.name).length < 3 || !/\s/.test(t(form.name))) e.name = 'Въведи име и фамилия.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t(form.email))) e.email = 'Въведи валиден имейл, напр. ime@primer.bg.'
  const digits = form.phone.replace(/[\s\-()]/g, '')
  if (!/^(\+359|0)\d{8,9}$/.test(digits)) e.phone = 'Въведи български телефонен номер, напр. 0888 123 456.'
  if (t(form.city).length < 2) e.city = 'Въведи населено място.'
  if (form.delivery === 'address') {
    if (!/^\d{4}$/.test(t(form.postcode))) e.postcode = 'Пощенският код е от 4 цифри.'
    if (t(form.address).length < 5) e.address = 'Въведи улица, номер и при нужда блок, вход, етаж.'
  } else if (t(form.office).length < 3) {
    e.office = 'Опиши офиса — например адрес или име на офиса.'
  }
  if (form.invoice) {
    if (t(form.company).length < 2) e.company = 'Въведи наименование на фирмата.'
    if (!/^(\d{9}|\d{13})$/.test(t(form.eik))) e.eik = 'ЕИК е 9 или 13 цифри.'
    if (t(form.mol).length < 3) e.mol = 'Въведи материално отговорно лице.'
    if (t(form.companyAddress).length < 5) e.companyAddress = 'Въведи адрес на регистрация.'
    if (t(form.vat) && !/^BG\d{9,10}$/i.test(t(form.vat).replace(/\s/g, ''))) e.vat = 'Форматът е BG и 9 или 10 цифри.'
  }
  if (!form.terms) e.terms = 'Нужно е да потвърдиш, че си прочел условията.'
  return e
})

const submitted = ref(false)
const done = ref(false)
const summaryEl = ref<HTMLElement | null>(null)
const resultEl = ref<HTMLElement | null>(null)
const show = (k: string) => submitted.value && !!errors.value[k]
const errorList = computed(() => Object.entries(errors.value))

async function onSubmit() {
  submitted.value = true
  await nextTick()
  if (errorList.value.length) {
    summaryEl.value?.focus()
    return
  }
  // Demo: nothing is sent or stored. We only confirm that validation passed.
  done.value = true
  await nextTick()
  resultEl.value?.focus()
}

function focusField(id: string) {
  const el = document.getElementById(`f-${id}`)
  el?.focus()
}

const deliveryLabel = computed(() => (form.delivery === 'address' ? 'До адрес' : 'До офис на куриер'))
</script>

<template>
  <div class="container">
    <div class="page-head">
      <AppBreadcrumbs :items="[{ label: 'Количка', to: '/kolichka' }, { label: 'Поръчка' }]" />
      <h1>Поръчка</h1>
    </div>

    <div class="notice notice--purple demo">
      <AppIcon name="info" />
      <p>
        <strong>Това е демонстрация.</strong> Формата проверява въведените данни само в твоя браузър. Поръчката няма да бъде
        изпратена, няма да бъде извършено плащане и данните ти не се записват и не се изпращат никъде.
      </p>
    </div>

    <div v-if="!cart.hydrated" class="loading" role="status">Зареждане…</div>

    <EmptyState v-else-if="!cart.resolved.length" icon="bag" title="Няма продукти за поръчка" text="Количката ти е празна.">
      <NuxtLink to="/produkti" class="btn">Разгледай продуктите</NuxtLink>
    </EmptyState>

    <!-- result after successful validation: deliberately NOT an order confirmation -->
    <section v-else-if="done" ref="resultEl" class="result" tabindex="-1" aria-labelledby="result-title">
      <span class="result__icon"><AppIcon name="check" :size="28" /></span>
      <h2 id="result-title">Данните са попълнени правилно</h2>
      <p>
        Демонстрацията приключва тук. <strong>Поръчката не е изпратена</strong> и не е създадена — в тази версия няма
        връзка със система за поръчки, плащания или куриер. Нищо от въведеното не е напуснало браузъра ти.
      </p>
      <dl class="result__review">
        <div><dt>Получател</dt><dd>{{ form.name }}</dd></div>
        <div><dt>Доставка</dt><dd>{{ deliveryLabel }}, {{ form.city }}</dd></div>
        <div><dt>Продукти</dt><dd>{{ cart.count }} бр. · {{ formatPrice(cart.subtotalCents) }} без доставка</dd></div>
      </dl>
      <div class="result__actions">
        <button type="button" class="btn btn--ghost" @click="done = false">Редактирай данните</button>
        <NuxtLink to="/kolichka" class="btn">Обратно към количката</NuxtLink>
      </div>
    </section>

    <div v-else class="co">
      <form class="co__form" novalidate @submit.prevent="onSubmit">
        <div
          v-if="submitted && errorList.length"
          ref="summaryEl"
          class="errsum"
          tabindex="-1"
          role="alert"
          aria-labelledby="errsum-title"
        >
          <h2 id="errsum-title">Провери {{ errorList.length === 1 ? '1 поле' : `${errorList.length} полета` }}</h2>
          <ul>
            <li v-for="[k, msg] in errorList" :key="k">
              <a :href="`#f-${k}`" @click.prevent="focusField(k)">{{ labels[k] }}: {{ msg }}</a>
            </li>
          </ul>
        </div>

        <fieldset class="co__group">
          <legend><span class="co__step">1</span> Контакт</legend>
          <div class="co__fields">
            <div class="field co__full">
              <label for="f-name">Име и фамилия <span class="req" aria-hidden="true">*</span></label>
              <input id="f-name" v-model="form.name" class="input" autocomplete="name" required :aria-invalid="show('name')" aria-describedby="e-name" />
              <p v-if="show('name')" id="e-name" class="field-error"><AppIcon name="alert" :size="16" /> {{ errors.name }}</p>
            </div>
            <div class="field">
              <label for="f-email">Имейл <span class="req" aria-hidden="true">*</span></label>
              <input id="f-email" v-model="form.email" class="input" type="email" autocomplete="email" inputmode="email" required :aria-invalid="show('email')" aria-describedby="e-email" />
              <p v-if="show('email')" id="e-email" class="field-error"><AppIcon name="alert" :size="16" /> {{ errors.email }}</p>
            </div>
            <div class="field">
              <label for="f-phone">Телефон <span class="req" aria-hidden="true">*</span></label>
              <input id="f-phone" v-model="form.phone" class="input" type="tel" autocomplete="tel" inputmode="tel" placeholder="0888 123 456" required :aria-invalid="show('phone')" aria-describedby="h-phone e-phone" />
              <p id="h-phone" class="field-hint">За връзка относно доставката.</p>
              <p v-if="show('phone')" id="e-phone" class="field-error"><AppIcon name="alert" :size="16" /> {{ errors.phone }}</p>
            </div>
          </div>
        </fieldset>

        <fieldset class="co__group">
          <legend><span class="co__step">2</span> Доставка</legend>
          <div class="co__options" role="radiogroup" aria-label="Начин на доставка">
            <label class="opt" :class="{ 'is-on': form.delivery === 'address' }">
              <input v-model="form.delivery" type="radio" name="delivery" value="address" />
              <AppIcon name="home" />
              <span><strong>До адрес</strong><small>Куриерът доставя до врата</small></span>
            </label>
            <label class="opt" :class="{ 'is-on': form.delivery === 'office' }">
              <input v-model="form.delivery" type="radio" name="delivery" value="office" />
              <AppIcon name="package" />
              <span><strong>До офис на куриер</strong><small>Вземаш пратката от офис</small></span>
            </label>
          </div>
          <p class="co__courier">
            Куриер и цена за доставка: <span class="pending"><AppIcon name="clock" :size="14" /> предстои уточняване</span>
          </p>

          <div class="co__fields">
            <div class="field">
              <label for="f-city">Населено място <span class="req" aria-hidden="true">*</span></label>
              <input id="f-city" v-model="form.city" class="input" autocomplete="address-level2" required :aria-invalid="show('city')" aria-describedby="e-city" />
              <p v-if="show('city')" id="e-city" class="field-error"><AppIcon name="alert" :size="16" /> {{ errors.city }}</p>
            </div>
            <template v-if="form.delivery === 'address'">
              <div class="field">
                <label for="f-postcode">Пощенски код <span class="req" aria-hidden="true">*</span></label>
                <input id="f-postcode" v-model="form.postcode" class="input" inputmode="numeric" autocomplete="postal-code" maxlength="4" required :aria-invalid="show('postcode')" aria-describedby="e-postcode" />
                <p v-if="show('postcode')" id="e-postcode" class="field-error"><AppIcon name="alert" :size="16" /> {{ errors.postcode }}</p>
              </div>
              <div class="field co__full">
                <label for="f-address">Адрес <span class="req" aria-hidden="true">*</span></label>
                <input id="f-address" v-model="form.address" class="input" autocomplete="street-address" placeholder="ул., №, бл., вх., ет., ап." required :aria-invalid="show('address')" aria-describedby="e-address" />
                <p v-if="show('address')" id="e-address" class="field-error"><AppIcon name="alert" :size="16" /> {{ errors.address }}</p>
              </div>
            </template>
            <div v-else class="field co__full">
              <label for="f-office">Офис на куриер <span class="req" aria-hidden="true">*</span></label>
              <input id="f-office" v-model="form.office" class="input" placeholder="Адрес или име на офиса" required :aria-invalid="show('office')" aria-describedby="h-office e-office" />
              <p id="h-office" class="field-hint">
                Търсенето на офиси ще бъде свързано с избрания куриер след старта. Засега въведи офиса свободно.
              </p>
              <p v-if="show('office')" id="e-office" class="field-error"><AppIcon name="alert" :size="16" /> {{ errors.office }}</p>
            </div>
          </div>
        </fieldset>

        <fieldset class="co__group">
          <legend><span class="co__step">3</span> Фактура</legend>
          <label class="check">
            <input v-model="form.invoice" type="checkbox" />
            <span>Желая фактура на фирма</span>
          </label>
          <div v-if="form.invoice" class="co__fields">
            <div class="field co__full">
              <label for="f-company">Фирма <span class="req" aria-hidden="true">*</span></label>
              <input id="f-company" v-model="form.company" class="input" autocomplete="organization" :aria-invalid="show('company')" aria-describedby="e-company" />
              <p v-if="show('company')" id="e-company" class="field-error"><AppIcon name="alert" :size="16" /> {{ errors.company }}</p>
            </div>
            <div class="field">
              <label for="f-eik">ЕИК <span class="req" aria-hidden="true">*</span></label>
              <input id="f-eik" v-model="form.eik" class="input" inputmode="numeric" maxlength="13" :aria-invalid="show('eik')" aria-describedby="e-eik" />
              <p v-if="show('eik')" id="e-eik" class="field-error"><AppIcon name="alert" :size="16" /> {{ errors.eik }}</p>
            </div>
            <div class="field">
              <label for="f-vat">ДДС номер (по избор)</label>
              <input id="f-vat" v-model="form.vat" class="input" placeholder="BG123456789" :aria-invalid="show('vat')" aria-describedby="e-vat" />
              <p v-if="show('vat')" id="e-vat" class="field-error"><AppIcon name="alert" :size="16" /> {{ errors.vat }}</p>
            </div>
            <div class="field">
              <label for="f-mol">МОЛ <span class="req" aria-hidden="true">*</span></label>
              <input id="f-mol" v-model="form.mol" class="input" :aria-invalid="show('mol')" aria-describedby="e-mol" />
              <p v-if="show('mol')" id="e-mol" class="field-error"><AppIcon name="alert" :size="16" /> {{ errors.mol }}</p>
            </div>
            <div class="field">
              <label for="f-companyAddress">Адрес на регистрация <span class="req" aria-hidden="true">*</span></label>
              <input id="f-companyAddress" v-model="form.companyAddress" class="input" :aria-invalid="show('companyAddress')" aria-describedby="e-companyAddress" />
              <p v-if="show('companyAddress')" id="e-companyAddress" class="field-error"><AppIcon name="alert" :size="16" /> {{ errors.companyAddress }}</p>
            </div>
          </div>
        </fieldset>

        <fieldset class="co__group">
          <legend><span class="co__step">4</span> Плащане и бележка</legend>
          <div class="notice">
            <AppIcon name="info" />
            <p>Методите за плащане предстои да бъдат уточнени. В тази демо версия не се извършват плащания.</p>
          </div>
          <div class="field">
            <label for="f-note">Бележка към поръчката (по избор)</label>
            <textarea id="f-note" v-model="form.note" class="textarea" maxlength="500" rows="3" />
          </div>
          <label class="check co__terms">
            <input id="f-terms" v-model="form.terms" type="checkbox" :aria-invalid="show('terms')" aria-describedby="e-terms" />
            <span>
              Прочетох <NuxtLink to="/obshti-usloviya" target="_blank">Общите условия</NuxtLink> и
              <NuxtLink to="/poveritelnost" target="_blank">Политиката за поверителност</NuxtLink>.
              <span class="req" aria-hidden="true">*</span>
            </span>
          </label>
          <p v-if="show('terms')" id="e-terms" class="field-error"><AppIcon name="alert" :size="16" /> {{ errors.terms }}</p>
        </fieldset>

        <button type="submit" class="btn btn--coral btn--block co__submit">Провери данните (демо)</button>
        <p class="co__fine">Бутонът само проверява формата. Поръчка няма да бъде изпратена.</p>
      </form>

      <aside class="co__side">
        <OrderSummary show-items title="Твоята поръчка">
          <NuxtLink to="/kolichka" class="link-arrow">Промени количката <AppIcon name="arrow-right" /></NuxtLink>
        </OrderSummary>
      </aside>
    </div>
  </div>
</template>

<style scoped lang="scss">
.demo {
  margin-bottom: 28px;
}
.loading {
  padding: 60px 0;
  text-align: center;
  color: var(--muted);
}
.co {
  display: grid;
  gap: 32px;
  @include up(lg) {
    grid-template-columns: minmax(0, 1fr) 400px;
    gap: 48px;
    align-items: start;
  }
}
.co__form {
  display: grid;
  gap: 20px;
}
.co__group {
  display: grid;
  gap: 16px;
  margin: 0;
  padding: 22px;
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  background: var(--paper);
  min-width: 0;
  @include up(md) {
    padding: 28px;
  }
  legend {
    display: flex;
    align-items: center;
    gap: 10px;
    float: left;
    width: 100%;
    margin-bottom: 4px;
    font-family: var(--font-display);
    font-size: 1.125rem;
    font-weight: 600;
    + * {
      clear: both;
    }
  }
}
.co__step {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: var(--purple);
  color: var(--paper);
  font-size: 0.875rem;
}
.co__fields {
  display: grid;
  gap: 16px;
  @include up(sm) {
    grid-template-columns: 1fr 1fr;
  }
}
.co__full {
  @include up(sm) {
    grid-column: 1 / -1;
  }
}
.co__options {
  display: grid;
  gap: 10px;
  @include up(sm) {
    grid-template-columns: 1fr 1fr;
  }
}
.opt {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 64px;
  padding: 12px 16px;
  border: 1.5px solid var(--sand-300);
  border-radius: var(--r-md);
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
  input {
    width: 20px;
    height: 20px;
    margin: 0;
    accent-color: var(--purple);
  }
  svg {
    flex: none;
    color: var(--purple);
  }
  strong {
    display: block;
    font-weight: 600;
  }
  small {
    color: var(--muted);
    font-size: 0.8125rem;
  }
  &.is-on {
    border-color: var(--purple);
    background: var(--purple-100);
  }
  &:has(input:focus-visible) {
    @include focus-ring(2px);
  }
}
.co__courier {
  font-size: 0.9375rem;
  color: var(--muted);
}
.co__terms a {
  color: var(--purple-600);
  font-weight: 600;
}
.co__submit {
  min-height: 56px;
  font-size: 1.0625rem;
}
.co__fine {
  margin-top: -8px;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--muted);
}
.co__side {
  @include up(lg) {
    position: sticky;
    top: calc(var(--header-h) + 20px);
  }
}
.errsum {
  padding: 18px 20px;
  border: 2px solid var(--danger);
  border-radius: var(--r-md);
  background: var(--danger-100);
  outline: none;
  h2 {
    margin-bottom: 8px;
    font-size: 1.0625rem;
    color: var(--danger);
  }
  ul {
    padding-left: 1.2em;
  }
  a {
    color: var(--danger);
    font-weight: 500;
  }
  &:focus-visible {
    @include focus-ring;
  }
}
.result {
  display: grid;
  gap: 16px;
  justify-items: start;
  max-width: 720px;
  padding: 32px;
  border-radius: var(--r-xl);
  background: var(--paper);
  border: 1px solid var(--line);
  outline: none;
  h2 {
    font-size: 1.6rem;
  }
  p {
    color: var(--muted);
    strong {
      color: var(--ink);
    }
  }
}
.result__icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: var(--success-100);
  color: var(--success);
}
.result__review {
  display: grid;
  gap: 8px;
  width: 100%;
  margin: 0;
  padding: 16px;
  border-radius: var(--r-md);
  background: var(--sand);
  div {
    display: flex;
    gap: 12px;
  }
  dt {
    width: 110px;
    flex: none;
    color: var(--muted);
  }
  dd {
    margin: 0;
    font-weight: 500;
    overflow-wrap: anywhere;
  }
}
.result__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
