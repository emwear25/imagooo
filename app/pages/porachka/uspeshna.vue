<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { formatPrice } from '~/utils/format'
import { store } from '~/config/store'

/**
 * Order confirmation. Reached with ?token= (cash on delivery, also used by the
 * confirmation email) or ?orderId=<Stripe session>&stripe=true (card payment).
 */
useSeo({ title: 'Поръчката е приета', description: 'Потвърждение на поръчка в Imagoo.', path: '/porachka/uspeshna' })

interface OrderItem {
  _id: string
  name: string
  price: number
  quantity: number
  color?: string | null
  customization?: string | null
  image?: string | null
}
interface Order {
  orderNumber: string
  createdAt: string
  items: OrderItem[]
  subtotal: number
  discountTotal?: number
  couponCode?: string | null
  total: number
  shippingCost?: number
  paymentMethod: string
  paymentStatus: string
  deliveryProvider: 'econt' | 'speedy'
  deliveryMethod: string
  econtOfficeName?: string | null
  speedyOfficeName?: string | null
  shippingAddress: { firstName: string; lastName: string; email: string; street: string; city: string }
}

const route = useRoute()
const api = useApi()
const cart = useCartStore()
const token = typeof route.query.token === 'string' ? route.query.token : ''
const sessionId = typeof route.query.orderId === 'string' ? route.query.orderId : ''

const { data: order, error, refresh } = await useAsyncData(`order-${token || sessionId}`, async () => {
  if (token) return (await api<{ data: Order }>(`/api/orders/success/${encodeURIComponent(token)}`)).data
  if (sessionId) return (await api<{ data: { order: Order } }>(`/api/payments/checkout-session/${encodeURIComponent(sessionId)}`)).data.order
  return null
})

// The card flow leaves the cart filled until payment succeeded
onMounted(() => {
  if (order.value) cart.clear()
})

// Card payments are confirmed by the Stripe webhook - poll briefly until it lands
const paid = computed(() => order.value?.paymentStatus === 'paid')
const awaitingPayment = computed(() => order.value?.paymentMethod === 'stripe_card' && !paid.value)
let polls = 0
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  if (!awaitingPayment.value) return
  timer = setInterval(async () => {
    polls++
    await refresh()
    if (!awaitingPayment.value || polls >= 10) clearInterval(timer)
  }, 3000)
})
onBeforeUnmount(() => clearInterval(timer))

const delivery = computed(() => {
  const o = order.value
  if (!o) return ''
  const courier = o.deliveryProvider === 'speedy' ? 'Спиди' : 'Еконт'
  if (o.deliveryMethod === 'courier_address') return `${courier}, до адрес: ${o.shippingAddress.street}, ${o.shippingAddress.city}`
  return `${courier}, ${o.econtOfficeName || o.speedyOfficeName || o.shippingAddress.street}`
})
const cents = (eur: number | undefined) => Math.round((eur ?? 0) * 100)
</script>

<template>
  <div class="container done">
    <section v-if="order" class="done__card" aria-labelledby="done-title">
      <span class="done__icon"><AppIcon name="check" :size="30" /></span>
      <h1 id="done-title">Благодарим ти, {{ order.shippingAddress.firstName }}!</h1>
      <p class="done__lead">
        Поръчка <strong>№ {{ order.orderNumber }}</strong> е приета. Изпратихме потвърждение на
        <strong>{{ order.shippingAddress.email }}</strong>.
      </p>
      <div v-if="awaitingPayment" class="notice" role="status">
        <AppIcon name="clock" />
        <p>Потвърждаваме плащането с картата… Това отнема няколко секунди.</p>
      </div>

      <ul class="done__items">
        <li v-for="item in order.items" :key="item._id">
          <img v-if="item.image" :src="item.image" alt="" width="56" height="70" loading="lazy" />
          <span>
            <strong>{{ item.name }}</strong>
            <small>{{ item.color }}<template v-if="item.customization"> · „{{ item.customization }}“</template> × {{ item.quantity }}</small>
          </span>
          <span class="price">{{ formatPrice(cents(item.price * item.quantity)) }}</span>
        </li>
      </ul>

      <dl class="done__rows">
        <div v-if="(order.discountTotal ?? 0) > 0">
          <dt>Отстъпка<template v-if="order.couponCode"> ({{ order.couponCode }})</template></dt>
          <dd>−{{ formatPrice(cents(order.discountTotal)) }}</dd>
        </div>
        <div class="done__total">
          <dt>Общо за продуктите</dt>
          <dd>{{ formatPrice(cents(order.total)) }}</dd>
        </div>
        <div>
          <dt>Плащане</dt>
          <dd>
            <template v-if="order.paymentMethod === 'stripe_card'">С карта — {{ paid ? 'платено' : 'потвърждава се' }}</template>
            <template v-else>Наложен платеж при получаване</template>
          </dd>
        </div>
        <div>
          <dt>Доставка</dt>
          <dd>
            {{ delivery }}<br />
            <small v-if="(order.shippingCost ?? 0) > 0">~{{ formatPrice(cents(order.shippingCost)) }}, плаща се на куриера</small>
            <small v-else>Безплатна</small>
          </dd>
        </div>
      </dl>

      <p class="done__next">
        Ще изработим поръчката и ще ти изпратим номер за проследяване, когато бъде предадена на куриера. Въпроси? Пиши ни на
        <a :href="`mailto:${store.company.email.value}`">{{ store.company.email.value }}</a>.
      </p>
      <NuxtLink to="/produkti" class="btn">Разгледай още продукти</NuxtLink>
    </section>

    <EmptyState
      v-else
      icon="alert"
      title="Не намерихме поръчката"
      :text="error ? 'Връзката е изтекла или е невалидна. Потвърждението на поръчката е изпратено и на имейла ти.' : 'Липсва номер на поръчка.'"
    >
      <NuxtLink to="/kontakti" class="btn btn--ghost">Свържи се с нас</NuxtLink>
      <NuxtLink to="/produkti" class="btn">Към продуктите</NuxtLink>
    </EmptyState>
  </div>
</template>

<style scoped lang="scss">
.done {
  padding-block: 40px 80px;
}
.done__card {
  display: grid;
  gap: 18px;
  max-width: 720px;
  margin-inline: auto;
  padding: 32px;
  border-radius: var(--r-xl);
  background: var(--paper);
  border: 1px solid var(--line);
  h1 {
    font-size: clamp(1.6rem, 4vw, 2.2rem);
  }
}
.done__icon {
  display: grid;
  place-items: center;
  width: 60px;
  height: 60px;
  border-radius: 20px;
  background: var(--success-100);
  color: var(--success);
}
.done__lead {
  color: var(--muted);
  strong {
    color: var(--ink);
  }
}
.done__items {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 16px 0;
  list-style: none;
  border-block: 1px solid var(--line);
  li {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  img {
    flex: none;
    border-radius: 10px;
    object-fit: cover;
    background: var(--sand);
  }
  span:not(.price) {
    display: grid;
    flex: 1;
    min-width: 0;
  }
  small {
    color: var(--muted);
  }
}
.done__rows {
  display: grid;
  gap: 10px;
  margin: 0;
  div {
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }
  dt {
    color: var(--muted);
  }
  dd {
    margin: 0;
    text-align: right;
    small {
      color: var(--muted);
    }
  }
}
.done__total {
  font-weight: 700;
  dt {
    color: var(--ink) !important;
  }
}
.done__next {
  color: var(--muted);
  a {
    color: var(--purple-600);
    font-weight: 600;
  }
}
</style>
