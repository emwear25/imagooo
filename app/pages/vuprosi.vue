<script setup lang="ts">
import { faq, faqGroups } from '~/data/faq'

useSeo({
  title: 'Често задавани въпроси',
  description: 'Отговори на най-честите въпроси за продуктите на Imagoo, персонализацията, изработката, доставката и връщането.',
  path: '/vuprosi',
})
</script>

<template>
  <div class="container">
    <div class="page-head">
      <AppBreadcrumbs :items="[{ label: 'Въпроси' }]" />
      <h1>Често задавани въпроси</h1>
      <p class="lead">Не намираш отговор? <NuxtLink to="/kontakti">Пиши ни</NuxtLink>.</p>
    </div>
    <nav class="jump" aria-label="Теми">
      <a v-for="g in faqGroups" :key="g.id" :href="`#${g.id}`" class="chip">{{ g.title }}</a>
    </nav>
    <div class="groups">
      <section v-for="g in faqGroups" :id="g.id" :key="g.id" :aria-labelledby="`${g.id}-t`" class="group">
        <h2 :id="`${g.id}-t`">{{ g.title }}</h2>
        <FaqList :items="faq.filter((f) => f.group === g.id)" />
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.lead a {
  color: var(--purple-600);
  font-weight: 600;
}
.jump {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0 40px;
  .chip {
    min-height: 44px;
    padding-inline: 16px;
  }
}
.groups {
  display: grid;
  gap: 48px;
  max-width: 900px;
}
.group h2 {
  margin-bottom: 18px;
  font-size: 1.4rem;
}
</style>
