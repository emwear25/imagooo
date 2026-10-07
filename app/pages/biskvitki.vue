<script setup lang="ts">
import { store } from '~/config/store'
import { useCartStore } from '~/stores/cart'
import { useWishlistStore } from '~/stores/wishlist'

useSeo({
  title: 'Политика за бисквитки',
  description: 'Imagoo не използва бисквитки за анализ или реклама. Количката и любимите се пазят само в браузъра ти.',
  path: '/biskvitki',
})

const cart = useCartStore()
const wishlist = useWishlistStore()
const stage = ref<'idle' | 'confirm' | 'done'>('idle')

function clearAll() {
  cart.clear()
  wishlist.clear()
  try {
    localStorage.removeItem(store.storage.cartKey)
    localStorage.removeItem(store.storage.wishlistKey)
  } catch {
    /* storage unavailable */
  }
  stage.value = 'done'
}
</script>

<template>
  <LegalPage title="Политика за бисквитки" crumb="Бисквитки" lead="Описваме само технологиите, които сайтът наистина използва.">
    <h2>Бисквитки</h2>
    <p>
      <strong>Сайтът не поставя бисквитки</strong> — нито собствени, нито от трети страни. Не използваме инструменти за
      анализ на посещаемостта, реклама, социални приставки или проследяване. Шрифтовете и изображенията се зареждат от
      същия сървър.
    </p>
    <p>Затова не показваме банер за съгласие — няма какво да одобряваш или отказваш.</p>

    <h2>Локално хранилище (localStorage)</h2>
    <p>За да работят количката и любимите, сайтът записва данни в браузъра ти. Те не се изпращат към сървър.</p>
    <div class="tbl" role="region" aria-label="Записи в локалното хранилище" tabindex="0">
      <table>
        <thead>
          <tr><th scope="col">Ключ</th><th scope="col">Съдържание</th><th scope="col">Срок</th></tr>
        </thead>
        <tbody>
          <tr><td><code>{{ store.storage.cartKey }}</code></td><td>Продукти в количката: продукт, цвят, количество, надпис</td><td>Докато не го изтриеш</td></tr>
          <tr><td><code>{{ store.storage.wishlistKey }}</code></td><td>Списък с любими продукти</td><td>Докато не го изтриеш</td></tr>
        </tbody>
      </table>
    </div>
    <p>Тези записи са необходими за функциите, които сам избираш да ползваш, и не служат за проследяване.</p>

    <h2>Изтрий запазените данни</h2>
    <div class="clear">
      <template v-if="stage === 'idle'">
        <p>Изтрива количката и любимите от този браузър.</p>
        <button type="button" class="btn btn--ghost" @click="stage = 'confirm'"><AppIcon name="trash" /> Изтрий данните</button>
      </template>
      <template v-else-if="stage === 'confirm'">
        <p><strong>Сигурен ли си?</strong> Количката и любимите ще бъдат изпразнени.</p>
        <div class="clear__actions">
          <button type="button" class="btn" @click="clearAll">Да, изтрий</button>
          <button type="button" class="btn btn--ghost" @click="stage = 'idle'">Отказ</button>
        </div>
      </template>
      <p v-else role="status"><AppIcon name="check" :size="18" /> Данните са изтрити от този браузър.</p>
    </div>

    <h2>Промени</h2>
    <p>
      Ако в бъдеще добавим услуги, които използват бисквитки (например плащане или анализ), ще обновим тази страница и
      при нужда ще поискаме съгласието ти, преди да ги активираме.
    </p>
  </LegalPage>
</template>

<style scoped lang="scss">
.tbl {
  overflow-x: auto;
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--paper);
}
table {
  width: 100%;
  min-width: 520px;
  border-collapse: collapse;
  font-size: 0.9375rem;
}
th,
td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--line);
  text-align: left;
  vertical-align: top;
}
tbody tr:last-child td {
  border-bottom: 0;
}
code {
  padding: 2px 6px;
  border-radius: 6px;
  background: var(--sand);
  font-size: 0.875em;
}
.clear {
  display: grid;
  gap: 12px;
  justify-items: start;
  padding: 20px;
  border-radius: var(--r-md);
  background: var(--paper);
  border: 1px solid var(--line);
  p {
    display: flex;
    gap: 8px;
    align-items: center;
  }
}
.clear__actions {
  display: flex;
  gap: 8px;
}
</style>
