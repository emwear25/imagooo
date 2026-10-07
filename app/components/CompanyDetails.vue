<script setup lang="ts">
import { store } from '~/config/store'

const c = store.company
</script>

<template>
  <dl class="cd">
    <div><dt>Търговец</dt><dd><PendingValue :setting="c.legalName" placeholder="наименование — предстои" /></dd></div>
    <div><dt>ЕИК</dt><dd><PendingValue :setting="c.eik" placeholder="предстои" /></dd></div>
    <div><dt>ДДС номер</dt><dd><PendingValue :setting="c.vatNumber" placeholder="предстои / при приложимост" /></dd></div>
    <div><dt>Седалище и адрес</dt><dd><PendingValue :setting="c.registeredAddress" placeholder="предстои" /></dd></div>
    <div><dt>Имейл</dt><dd><PendingValue :setting="c.email" link="mail" placeholder="предстои" /></dd></div>
    <div><dt>Телефон</dt><dd><PendingValue :setting="c.phone" link="tel" placeholder="предстои" /></dd></div>
  </dl>
</template>

<style scoped lang="scss">
.cd {
  display: grid;
  margin: 0;
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--paper);
  div {
    display: grid;
    gap: 2px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--line);
    &:last-child {
      border-bottom: 0;
    }
    @include up(sm) {
      grid-template-columns: 180px 1fr;
      gap: 16px;
    }
  }
  dt {
    font-weight: 600;
  }
  dd {
    margin: 0;
  }
}
</style>
