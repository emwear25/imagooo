<script setup lang="ts">
useSeo({ title: 'Плащането е прекъснато', description: 'Плащането с карта не беше завършено.', path: '/porachka/otkazana' })
</script>

<template>
  <div class="container">
    <EmptyState
      icon="info"
      title="Плащането не беше завършено"
      text="Не сме изтеглили сума от картата ти. Продуктите са все още в количката — можеш да опиташ отново или да избереш наложен платеж."
    >
      <NuxtLink to="/porachka" class="btn">Обратно към поръчката</NuxtLink>
      <NuxtLink to="/kolichka" class="btn btn--ghost">Към количката</NuxtLink>
    </EmptyState>
  </div>
</template>
