<script setup lang="ts">
import { cutoutImage, imageUrl } from '~/utils/catalog'

useSeo({
  title: 'За нас',
  description: 'Imagoo е български бранд за предмети с въображение, създадени с 3D печат — за дома, за подарък и за всеки ден.',
  path: '/za-nas',
})

const { products } = useCatalog()
// Collage: featured products first, then the rest
const pics = computed(() =>
  [...products.value.filter((p) => p.featured), ...products.value.filter((p) => !p.featured)]
    .slice(0, 3)
    .map((p) => ({ p, img: cutoutImage(p) })),
)
</script>

<template>
  <div>
    <div class="container">
      <div class="page-head">
        <AppBreadcrumbs :items="[{ label: 'За нас' }]" />
      </div>
      <section class="intro" aria-labelledby="about-title">
        <div class="intro__copy">
          <p class="eyebrow">За нас</p>
          <h1 id="about-title">Правим предмети, които имат идея — и място в ежедневието.</h1>
          <p class="lead">
            Imagoo е български бранд за декорации, играчки, подаръци и практични решения, създадени с 3D печат. Искаме
            всеки предмет да тръгва от идея и да стига до нечий дом, бюро или ключове.
          </p>
        </div>
        <div class="intro__art" aria-hidden="true">
          <span v-for="(x, i) in pics" :key="x.p.slug" class="intro__tile" :class="`intro__tile--${i}`">
            <img v-if="x.img" :src="imageUrl(x.img)" alt="" width="1200" height="1500" loading="lazy" />
          </span>
        </div>
      </section>
    </div>

    <section class="section">
      <div class="container values">
        <article>
          <AppIcon name="sparkle" :size="28" />
          <h2>Форма с характер</h2>
          <p>Търсим форми, които се забелязват — спирала, облак, безкрайна линия — но остават удобни за употреба.</p>
        </article>
        <article>
          <AppIcon name="layers" :size="28" />
          <h2>Слой по слой</h2>
          <p>3D печатът ни позволява да изработваме продукти след поръчка, в избран цвят и с надпис, без големи складови наличности.</p>
        </article>
        <article>
          <AppIcon name="check" :size="28" />
          <h2>Честно описание</h2>
          <p>Посочваме размери, материал и грижа. Не обещаваме свойства, които не сме проверили — например контакт с храни.</p>
        </article>
      </div>
    </section>

    <div class="container">
      <section class="story prose" aria-labelledby="story-title">
        <h2 id="story-title">Как работим</h2>
        <p>
          Всеки продукт започва като цифров модел, който след това се отпечатва от пластмасова нишка. Затова по
          повърхността могат да се видят фини хоризонтални линии — следа от начина, по който предметът е изграден. За нас
          това е част от характера му.
        </p>
        <p>
          Много от продуктите в каталога се изработват след поръчка. Това ни позволява да предложим повече цветове и
          персонализация — от ключодържател с име до табелка за детската стая.
        </p>
        <h2>Дизайни от общността</h2>
        <p>
          Част от продуктите са създадени от дизайнери от световната общност за 3D печат и са публикувани под
          лицензи, които позволяват продажба на отпечатъци (Creative Commons CC0, CC BY и CC BY-SA). На страницата на
          всеки такъв продукт посочваме автора, оригиналния модел и лиценза. Авторските права върху дизайна остават за
          автора — ние изработваме и продаваме физическите отпечатъци.
        </p>
        <p>
          <NuxtLink to="/produkti">Разгледай каталога</NuxtLink> или <NuxtLink to="/kontakti">пиши ни</NuxtLink>, ако имаш
          идея за продукт.
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.intro {
  display: grid;
  gap: 32px;
  align-items: center;
  padding-top: 12px;
  @include up(lg) {
    grid-template-columns: 1fr 1fr;
    gap: 64px;
  }
  h1 {
    margin: 12px 0 18px;
    font-size: clamp(1.9rem, 1.2rem + 3vw, 3.3rem);
  }
}
.intro__art {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 200px 200px;
  gap: 12px;
  @include up(md) {
    grid-template-rows: 240px 240px;
  }
}
.intro__tile {
  overflow: hidden;
  border-radius: var(--r-lg);
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    mix-blend-mode: multiply;
  }
  &--0 {
    grid-row: span 2;
    background: var(--peach-100);
  }
  &--1 {
    background: var(--purple-100);
  }
  &--2 {
    background: var(--mint-100);
  }
}
.values {
  display: grid;
  gap: 16px;
  @include up(md) {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  article {
    display: grid;
    gap: 10px;
    align-content: start;
    padding: 28px;
    border-radius: var(--r-lg);
    background: var(--paper);
    border: 1px solid var(--line);
    svg {
      color: var(--coral-600);
    }
  }
  h2 {
    font-size: 1.2rem;
  }
  p {
    color: var(--muted);
  }
}
.story {
  margin-inline: auto;
}
</style>
