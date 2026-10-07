<script setup lang="ts">
import { store } from '~/config/store'
import { formatDays } from '~/utils/format'
useSeo({
  title: 'Доставка и плащане',
  description: 'Изработка след поръчка, доставка с Еконт и Спиди и плащане с наложен платеж или карта в Imagoo.',
  path: '/dostavka-i-plashtane',
})
const s = store.shipping
const c = store.company
</script>

<template>
  <LegalPage
    title="Доставка и плащане"
    lead="Как изработваме, изпращаме и как можеш да платиш поръчката си."
    :draft="store.site.isDemo"
  >
    <h2>Изработка</h2>
    <p>
      Повечето продукти се отпечатват след поръчка. Ориентировъчното време за изработка е
      <strong>{{ formatDays(s.productionDays.min, s.productionDays.max) }}</strong>. За персонализирани продукти добавяме
      около <strong>{{ formatDays(s.personalizedExtraDays.min, s.personalizedExtraDays.max) }}</strong>, за да проверим и
      изработим надписа. При голямо натоварване ще те уведомим, ако срокът се удължи.
    </p>

    <h2>Доставка</h2>
    <ul>
      <li>Доставяме навсякъде в България чрез <strong>{{ s.couriers.value?.join(' и ') }}</strong>.</li>
      <li>Начини на доставка: {{ s.methods.value?.join(', ') }}.</li>
      <li>
        <strong>Безплатна доставка за поръчки {{ s.freeShippingThreshold.value }}.</strong> Под тази сума цената за
        доставка се {{ s.fees.value }}.
      </li>
      <li>Точната цена виждаш при поръчка, след като избереш град и начин на доставка.</li>
      <li>Срок за доставка след изпращане: {{ formatDays(s.deliveryDays.min, s.deliveryDays.max) }}.</li>
    </ul>

    <h2>Плащане</h2>
    <ul>
      <li v-for="m in store.payments.methods.value" :key="m">{{ m }}</li>
    </ul>
    <p>
      Плащането с карта става на защитената страница на Stripe — данните на картата ти не достигат до нас. При наложен
      платеж плащаш стойността на продуктите на куриера при получаване.
    </p>

    <h2>Валута и цени</h2>
    <p>Цените са в евро ({{ store.currency.code }}) и включват ДДС.</p>

    <h2>Въпроси</h2>
    <p>
      Пиши ни на <a :href="`mailto:${c.email.value}`">{{ c.email.value }}</a> или се обади на
      <a :href="c.phoneHref">{{ c.phone.value }}</a> ({{ c.hours.value }}).
    </p>
  </LegalPage>
</template>
