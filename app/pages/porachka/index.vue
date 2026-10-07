<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { formatPrice } from '~/utils/format'
import { store } from '~/config/store'
import type { Courier, CourierOffice } from '~/composables/useCourier'

const cart = useCartStore()
const api = useApi()
const { canOrder } = useCatalog()
const { estimate } = useCourier()

useSeo({
  title: 'Поръчка',
  description: 'Завършване на поръчката в Imagoo — доставка с Еконт или Спиди, плащане с наложен платеж или карта.',
  path: '/porachka',
})

type Delivery = 'address' | 'office'
type Payment = 'cod' | 'card'
const form = reactive({
  name: '',
  email: '',
  phone: '',
  courier: 'econt' as Courier,
  delivery: 'office' as Delivery,
  office: null as CourierOffice | null,
  city: '',
  postcode: '',
  address: '',
  payment: 'cod' as Payment,
  coupon: '',
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
  office: 'Офис или автомат',
  city: 'Населено място',
  postcode: 'Пощенски код',
  address: 'Адрес',
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
  if (form.delivery === 'office') {
    if (!form.office) e.office = 'Избери офис или автомат от списъка.'
  } else {
    if (t(form.city).length < 2) e.city = 'Въведи населено място.'
    if (!/^\d{4}$/.test(t(form.postcode))) e.postcode = 'Пощенският код е от 4 цифри.'
    if (t(form.address).length < 5) e.address = 'Въведи улица, номер и при нужда блок, вход, етаж.'
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

// ---- coupon (validated by the backend; the discount itself is applied server-side)
const coupon = reactive({ applied: '', percent: 0, error: '', checking: false })
async function applyCoupon() {
  const code = form.coupon.trim().toUpperCase()
  coupon.error = ''
  if (!code) return
  coupon.checking = true
  try {
    const res = await api<{ data: { code: string; discountPercentage: number } }>(`/api/coupons/validate/${encodeURIComponent(code)}`)
    coupon.applied = res.data.code
    coupon.percent = res.data.discountPercentage
  } catch (err) {
    coupon.applied = ''
    coupon.percent = 0
    coupon.error = apiMessage(err, 'Кодът не е валиден.')
  } finally {
    coupon.checking = false
  }
}
function removeCoupon() {
  coupon.applied = ''
  coupon.percent = 0
  form.coupon = ''
}
const discountCents = computed(() => Math.round((cart.subtotalCents * coupon.percent) / 100))
const totalCents = computed(() => cart.subtotalCents - discountCents.value)

// ---- delivery estimate (paid to the courier; free over the threshold)
const freeShipping = computed(() => totalCents.value >= store.shipping.freeShippingThresholdEur * 100)
const shipping = reactive({ eur: null as number | null, loading: false, failed: false })
const estimateKey = computed(() =>
  JSON.stringify([form.courier, form.delivery, form.office?.id, form.city, form.postcode, form.address, form.payment, totalCents.value]),
)
let estimateTimer: ReturnType<typeof setTimeout> | undefined
watch(estimateKey, () => {
  clearTimeout(estimateTimer)
  shipping.eur = null
  shipping.failed = false
  if (!import.meta.client || freeShipping.value || !canOrder.value) return
  const ready = form.delivery === 'office' ? !!form.office : form.city.trim().length > 1 && form.address.trim().length > 4
  if (!ready) return
  estimateTimer = setTimeout(async () => {
    shipping.loading = true
    const eur = await estimate({
      courier: form.courier,
      office: form.delivery === 'office' ? form.office : null,
      city: form.city.trim(),
      postCode: form.postcode.trim(),
      street: form.address.trim(),
      receiverName: form.name.trim(),
      receiverPhone: form.phone.trim(),
      codEur: form.payment === 'cod' ? totalCents.value / 100 : 0,
      weightKg: Math.max(0.5, cart.count * 0.3),
    })
    shipping.loading = false
    shipping.eur = eur
    shipping.failed = eur === null
  }, 500)
})
watch(() => form.courier, () => (form.office = null))

// ---- submit
const submitted = ref(false)
const sending = ref(false)
const serverError = ref('')
const summaryEl = ref<HTMLElement | null>(null)
const show = (k: string) => submitted.value && !!errors.value[k]
const errorList = computed(() => Object.entries(errors.value))

function apiMessage(err: unknown, fallback: string): string {
  const data = (err as { data?: { message?: string } })?.data
  return data?.message || fallback
}

function deliveryMethod(): string {
  if (form.delivery === 'address') return 'courier_address'
  if (form.courier === 'econt') return form.office?.locker ? 'econt_automat' : 'econt_office'
  return form.office?.locker ? 'speedy_apt' : 'speedy_office'
}

function orderNotes(): string | null {
  const parts: string[] = []
  if (form.note.trim()) parts.push(form.note.trim())
  if (form.invoice) {
    parts.push(
      [
        'ФАКТУРА:',
        `Фирма: ${form.company.trim()}`,
        `ЕИК: ${form.eik.trim()}`,
        form.vat.trim() ? `ДДС №: ${form.vat.trim().toUpperCase()}` : '',
        `МОЛ: ${form.mol.trim()}`,
        `Адрес: ${form.companyAddress.trim()}`,
      ]
        .filter(Boolean)
        .join('\n'),
    )
  }
  return parts.length ? parts.join('\n\n') : null
}

function orderPayload() {
  const [firstName, ...rest] = form.name.trim().split(/\s+/)
  const lastName = rest.join(' ')
  const office = form.delivery === 'office' ? form.office : null
  const contact = { firstName: firstName!, lastName, email: form.email.trim(), phone: form.phone.trim() }
  return {
    items: cart.resolved.map((l) => ({
      product: l.product.id,
      quantity: l.quantity,
      size: l.variant.size,
      color: l.variant.id,
      customization: l.personalization ?? null,
    })),
    isGuest: true,
    guestInfo: contact,
    shippingAddress: {
      ...contact,
      street: office ? `${form.courier === 'econt' ? 'Еконт' : 'Спиди'}: ${office.name}, ${office.address}`.slice(0, 200) : form.address.trim(),
      city: office ? office.city : form.city.trim(),
      postalCode: office ? office.postCode || '0000' : form.postcode.trim(),
      country: 'България',
    },
    deliveryProvider: form.courier,
    deliveryMethod: deliveryMethod(),
    econtOfficeCode: office && form.courier === 'econt' ? office.id : null,
    econtOfficeName: office && form.courier === 'econt' ? office.name : null,
    speedyOfficeId: office && form.courier === 'speedy' ? office.id : null,
    speedyOfficeName: office && form.courier === 'speedy' ? office.name : null,
    paymentMethod: form.payment === 'card' ? 'stripe_card' : 'cash_on_delivery',
    shippingCost: freeShipping.value ? 0 : (shipping.eur ?? undefined),
    couponCode: coupon.applied || null,
    notes: orderNotes(),
  }
}

async function onSubmit() {
  submitted.value = true
  serverError.value = ''
  await nextTick()
  if (errorList.value.length) {
    summaryEl.value?.focus()
    return
  }
  if (!canOrder.value || cart.unavailable.length) return
  sending.value = true
  try {
    if (form.payment === 'card') {
      const res = await api<{ data: { sessionUrl: string } }>('/api/payments/create-checkout-session', {
        method: 'POST',
        body: orderPayload(),
      })
      // The cart is cleared on the success page, so a cancelled payment keeps it
      window.location.href = res.data.sessionUrl
      return
    }
    const res = await api<{ data: { successToken: string } }>('/api/orders', { method: 'POST', body: orderPayload() })
    cart.clear()
    await navigateTo({ path: '/porachka/uspeshna', query: { token: res.data.successToken } })
  } catch (err) {
    serverError.value = apiMessage(err, 'Поръчката не можа да бъде изпратена. Опитай отново или се свържи с нас.')
    await nextTick()
    summaryEl.value?.focus()
  } finally {
    sending.value = false
  }
}

function focusField(id: string) {
  const el = document.getElementById(`f-${id}`) ?? document.querySelector<HTMLElement>(`[data-field="${id}"] input`)
  el?.focus()
}
</script>

<template>
  <div class="container">
    <div class="page-head">
      <AppBreadcrumbs :items="[{ label: 'Количка', to: '/kolichka' }, { label: 'Поръчка' }]" />
      <h1>Поръчка</h1>
    </div>

    <div v-if="!canOrder" class="notice notice--purple demo">
      <AppIcon name="info" />
      <p>
        <strong>Магазинът все още не приема поръчки.</strong> Показваме демонстрационен каталог. Ще можеш да поръчаш веднага
        щом продуктите бъдат публикувани.
      </p>
    </div>

    <div v-if="!cart.hydrated" class="loading" role="status">Зареждане…</div>

    <EmptyState v-else-if="!cart.resolved.length" icon="bag" title="Няма продукти за поръчка" text="Количката ти е празна.">
      <NuxtLink to="/produkti" class="btn">Разгледай продуктите</NuxtLink>
    </EmptyState>

    <div v-else class="co">
      <form class="co__form" novalidate @submit.prevent="onSubmit">
        <div
          v-if="(submitted && errorList.length) || serverError"
          ref="summaryEl"
          class="errsum"
          tabindex="-1"
          role="alert"
          aria-labelledby="errsum-title"
        >
          <template v-if="errorList.length">
            <h2 id="errsum-title">Провери {{ errorList.length === 1 ? '1 поле' : `${errorList.length} полета` }}</h2>
            <ul>
              <li v-for="[k, msg] in errorList" :key="k">
                <a :href="`#f-${k}`" @click.prevent="focusField(k)">{{ labels[k] }}: {{ msg }}</a>
              </li>
            </ul>
          </template>
          <template v-else>
            <h2 id="errsum-title">Поръчката не е изпратена</h2>
            <p>{{ serverError }}</p>
          </template>
        </div>

        <div v-if="cart.unavailable.length" class="notice notice--danger" role="alert">
          <AppIcon name="alert" />
          <p>
            Изчерпани в момента:
            <strong>{{ cart.unavailable.map((l) => `${l.product.name} (${l.variantName})`).join(', ') }}</strong>.
            Премахни ги от <NuxtLink to="/kolichka">количката</NuxtLink>, за да продължиш.
          </p>
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
              <input id="f-email" v-model="form.email" class="input" type="email" autocomplete="email" inputmode="email" required :aria-invalid="show('email')" aria-describedby="h-email e-email" />
              <p id="h-email" class="field-hint">Тук ще получиш потвърждение на поръчката.</p>
              <p v-if="show('email')" id="e-email" class="field-error"><AppIcon name="alert" :size="16" /> {{ errors.email }}</p>
            </div>
            <div class="field">
              <label for="f-phone">Телефон <span class="req" aria-hidden="true">*</span></label>
              <input id="f-phone" v-model="form.phone" class="input" type="tel" autocomplete="tel" inputmode="tel" placeholder="0888 123 456" required :aria-invalid="show('phone')" aria-describedby="h-phone e-phone" />
              <p id="h-phone" class="field-hint">За връзка с куриера.</p>
              <p v-if="show('phone')" id="e-phone" class="field-error"><AppIcon name="alert" :size="16" /> {{ errors.phone }}</p>
            </div>
          </div>
        </fieldset>

        <fieldset class="co__group">
          <legend><span class="co__step">2</span> Доставка</legend>
          <div class="co__options" role="radiogroup" aria-label="Куриер">
            <label class="opt" :class="{ 'is-on': form.courier === 'econt' }">
              <input v-model="form.courier" type="radio" name="courier" value="econt" />
              <AppIcon name="truck" />
              <span><strong>Еконт</strong><small>Офис, Еконтомат или адрес</small></span>
            </label>
            <label class="opt" :class="{ 'is-on': form.courier === 'speedy' }">
              <input v-model="form.courier" type="radio" name="courier" value="speedy" />
              <AppIcon name="truck" />
              <span><strong>Спиди</strong><small>Офис, автомат или адрес</small></span>
            </label>
          </div>
          <div class="co__options" role="radiogroup" aria-label="Начин на доставка">
            <label class="opt" :class="{ 'is-on': form.delivery === 'office' }">
              <input v-model="form.delivery" type="radio" name="delivery" value="office" />
              <AppIcon name="package" />
              <span><strong>До офис или автомат</strong><small>Вземаш пратката, когато ти е удобно</small></span>
            </label>
            <label class="opt" :class="{ 'is-on': form.delivery === 'address' }">
              <input v-model="form.delivery" type="radio" name="delivery" value="address" />
              <AppIcon name="home" />
              <span><strong>До адрес</strong><small>Куриерът доставя до врата</small></span>
            </label>
          </div>

          <div v-if="form.delivery === 'office'" data-field="office">
            <OfficePicker v-model="form.office" :courier="form.courier" :invalid="show('office')" describedby="e-office" />
            <p v-if="show('office')" id="e-office" class="field-error"><AppIcon name="alert" :size="16" /> {{ errors.office }}</p>
          </div>
          <div v-else class="co__fields">
            <div class="field">
              <label for="f-city">Населено място <span class="req" aria-hidden="true">*</span></label>
              <input id="f-city" v-model="form.city" class="input" autocomplete="address-level2" required :aria-invalid="show('city')" aria-describedby="e-city" />
              <p v-if="show('city')" id="e-city" class="field-error"><AppIcon name="alert" :size="16" /> {{ errors.city }}</p>
            </div>
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
          </div>

          <p class="co__courier" aria-live="polite">
            <template v-if="freeShipping"><strong>Безплатна доставка</strong> — поръчката е {{ store.shipping.freeShippingThreshold.value }}.</template>
            <template v-else-if="shipping.loading">Изчисляваме цената за доставка…</template>
            <template v-else-if="shipping.eur !== null">
              Доставка: <strong>~{{ formatPrice(Math.round(shipping.eur * 100)) }}</strong>, плаща се на куриера при получаване.
            </template>
            <template v-else-if="shipping.failed">Цената за доставка ще бъде изчислена от куриера и се плаща при получаване.</template>
            <template v-else>Цената за доставка се показва след избор на офис или адрес. Безплатна {{ store.shipping.freeShippingThreshold.value }}.</template>
          </p>
        </fieldset>

        <fieldset class="co__group">
          <legend><span class="co__step">3</span> Плащане</legend>
          <div class="co__options" role="radiogroup" aria-label="Начин на плащане">
            <label class="opt" :class="{ 'is-on': form.payment === 'cod' }">
              <input v-model="form.payment" type="radio" name="payment" value="cod" />
              <AppIcon name="cash" />
              <span><strong>Наложен платеж</strong><small>Плащаш на куриера при получаване</small></span>
            </label>
            <label class="opt" :class="{ 'is-on': form.payment === 'card' }">
              <input v-model="form.payment" type="radio" name="payment" value="card" />
              <AppIcon name="card" />
              <span><strong>С карта онлайн</strong><small>Visa, Mastercard, Apple Pay, Google Pay</small></span>
            </label>
          </div>
          <p v-if="form.payment === 'card'" class="field-hint">
            След потвърждение ще бъдеш пренасочен към защитената страница на Stripe. Данните на картата не достигат до нас.
          </p>

          <div class="field">
            <label for="f-coupon">Код за отстъпка (по избор)</label>
            <div v-if="coupon.applied" class="co__coupon is-on">
              <span><AppIcon name="check" :size="18" /> <strong>{{ coupon.applied }}</strong> — {{ coupon.percent }}% отстъпка</span>
              <button type="button" class="btn btn--ghost btn--sm" @click="removeCoupon">Премахни</button>
            </div>
            <div v-else class="co__coupon">
              <input id="f-coupon" v-model="form.coupon" class="input" autocomplete="off" maxlength="40" aria-describedby="e-coupon" @keydown.enter.prevent="applyCoupon" />
              <button type="button" class="btn btn--ghost" :disabled="coupon.checking || !form.coupon.trim()" @click="applyCoupon">
                {{ coupon.checking ? 'Проверка…' : 'Приложи' }}
              </button>
            </div>
            <p v-if="coupon.error" id="e-coupon" class="field-error" role="alert"><AppIcon name="alert" :size="16" /> {{ coupon.error }}</p>
          </div>
        </fieldset>

        <fieldset class="co__group">
          <legend><span class="co__step">4</span> Фактура и бележка</legend>
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
          <div class="field">
            <label for="f-note">Бележка към поръчката (по избор)</label>
            <textarea id="f-note" v-model="form.note" class="textarea" maxlength="500" rows="3" />
          </div>
          <label class="check co__terms">
            <input id="f-terms" v-model="form.terms" type="checkbox" :aria-invalid="show('terms')" aria-describedby="e-terms" />
            <span>
              Прочетох и приемам <NuxtLink to="/obshti-usloviya" target="_blank">Общите условия</NuxtLink> и
              <NuxtLink to="/poveritelnost" target="_blank">Политиката за поверителност</NuxtLink>.
              <span class="req" aria-hidden="true">*</span>
            </span>
          </label>
          <p v-if="show('terms')" id="e-terms" class="field-error"><AppIcon name="alert" :size="16" /> {{ errors.terms }}</p>
        </fieldset>

        <button type="submit" class="btn btn--coral btn--block co__submit" :disabled="sending || !canOrder || cart.unavailable.length > 0">
          <template v-if="sending">Изпращане…</template>
          <template v-else-if="form.payment === 'card'">Продължи към плащане · {{ formatPrice(totalCents) }}</template>
          <template v-else>Поръчай с наложен платеж · {{ formatPrice(totalCents) }}</template>
        </button>
        <p class="co__fine">
          С натискането потвърждаваш поръчката със задължение за плащане. Доставката се плаща на куриера при получаване.
        </p>
      </form>

      <aside class="co__side">
        <OrderSummary
          show-items
          title="Твоята поръчка"
          :discount-cents="discountCents"
          :discount-label="coupon.applied ? `Отстъпка (${coupon.applied})` : undefined"
          :shipping-eur="shipping.eur"
          :free-shipping="freeShipping"
        >
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
  padding: 12px 14px;
  border-radius: var(--r-md);
  background: var(--sand);
  font-size: 0.9375rem;
  color: var(--muted);
  strong {
    color: var(--ink);
  }
}
.co__coupon {
  display: flex;
  gap: 8px;
  .input {
    flex: 1;
  }
  &.is-on {
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-radius: var(--r-md);
    background: var(--success-100);
    color: var(--success);
    span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
  }
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
