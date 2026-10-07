<script setup lang="ts">
import { faq } from '~/data/faq'
import { cutoutImage, imageUrl, inCategory, sortProducts, srcset } from '~/utils/catalog'
import type { Product } from '~/types/catalog'
import { formatPrice } from '~/utils/format'
import { PERSONALIZATION_PATTERN } from '~/utils/text'

useSeo({
  title: 'Предмети с въображение, създадени с 3D печат',
  description:
    'Imagoo — декорации, играчки, персонализирани подаръци и практични решения, създадени с 3D печат. За дома, за подарък и за теб.',
  path: '/',
})

const { products, categories } = useCatalog()

/** Top products by the dashboard flags ("featured" etc.), filled up by rank. */
function pick(fallback: (p: Product) => boolean, count: number): Product[] {
  const chosen = sortProducts(products.value.filter(fallback), 'recommended')
  const rest = sortProducts(products.value.filter((p) => !chosen.includes(p)), 'recommended')
  return [...chosen, ...rest].slice(0, count)
}

const HERO_STYLE = [
  { tint: '#fde4dc', label: 'Ново' },
  { tint: '#e6f2ec', label: 'За дома' },
  { tint: '#ece4fb', label: 'За подарък' },
]
const heroTiles = computed(() =>
  pick((p) => !!p.featured, 3).map((p, i) => ({
    ...HERO_STYLE[i]!,
    slug: p.slug,
    product: p,
    img: cutoutImage(p),
  })),
)

const featured = computed(() => sortProducts(products.value.filter((p) => p.featured), 'recommended').slice(0, 8))
const everyday = computed(() =>
  sortProducts(products.value.filter((p) => p.everyday), 'recommended').slice(0, 4),
)
const playSets = computed(() => sortProducts(products.value.filter((p) => inCategory(p, 'komplekti-za-igra')), 'recommended').slice(0, 4))
const playHero = computed(() => (playSets.value[0] ? cutoutImage(playSets.value[0]) : undefined))

const homeFaq = faq.filter((f) => [0, 4, 6, 8].includes(faq.indexOf(f)))

// personalisation teaser
const name = ref('')
const preview = computed(() => name.value.trim() || 'Мила')
const nameValid = computed(() => PERSONALIZATION_PATTERN.test(name.value))
const personalised = computed(() => sortProducts(products.value.filter((p) => !!p.personalization), 'recommended'))
const keychain = computed(() => personalised.value[0])
const gifts = computed(() => personalised.value.slice(0, 3))

const quick = [
  { label: 'Подаръци с име', to: '/kategorii/personalizirani-podaraci' },
  { label: 'Комплекти за игра', to: '/kategorii/komplekti-za-igra' },
  { label: 'Скулптури и арт', to: '/kategorii/skulpturi-i-art' },
  { label: 'За бюрото', to: '/kategorii/praktichni-resheniya' },
]
</script>

<template>
  <div>
    <!-- ============================================================ HERO -->
    <section class="hero" aria-labelledby="hero-title">
      <div class="container hero__grid">
        <div class="hero__copy">
          <p class="eyebrow hero__eyebrow"><AppIcon name="loop" :size="20" /> Предмети с въображение</p>
          <h1 id="hero-title" class="hero__title">
            Въображение, което <span class="hero__mark">влиза</span> в&nbsp;ежедневието.
          </h1>
          <p class="hero__lead">
            Открий декорации, играчки и практични решения, създадени с 3D печат — за дома, за подарък и за теб.
          </p>
          <div class="hero__ctas">
            <NuxtLink to="/produkti" class="btn">
              Разгледай продуктите
              <AppIcon name="arrow-right" />
            </NuxtLink>
            <a href="#kategorii" class="btn btn--ghost">Избери категория</a>
          </div>
          <div class="hero__quick">
            <p class="hero__quickLabel">Бърз старт:</p>
            <ul>
              <li v-for="q in quick" :key="q.to">
                <NuxtLink :to="q.to" class="chip">{{ q.label }}</NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <div class="hero__stage">
          <svg class="hero__ribbon" viewBox="0 0 600 300" aria-hidden="true">
            <path
              d="M150 52C80 52 30 96 30 150s50 98 120 98c112 0 188-196 300-196 70 0 120 44 120 98s-50 98-120 98C338 248 262 52 150 52Z"
              fill="none"
              stroke="currentColor"
              stroke-width="34"
              stroke-linecap="round"
            />
          </svg>
          <ul class="bento">
            <li v-for="(t, i) in heroTiles" :key="t.slug" class="bento__tile" :class="`bento__tile--${i}`" :style="{ '--tint': t.tint }">
              <NuxtLink :to="`/produkti/${t.slug}`" class="bento__link">
                <img
                  v-if="t.img"
                  :src="imageUrl(t.img)"
                  :srcset="srcset(t.img)"
                  :sizes="i === 0 ? '(min-width: 1024px) 26vw, 50vw' : '(min-width: 1024px) 24vw, 50vw'"
                  :width="t.img.width"
                  :height="t.img.height"
                  :alt="`${t.product.name} — ${t.product.tagline.toLowerCase()}`"
                  :loading="i === 0 ? 'eager' : 'lazy'"
                  :fetchpriority="i === 0 ? 'high' : undefined"
                  class="bento__img"
                />
                <span class="bento__label">{{ t.label }}</span>
                <span class="bento__tag">
                  <span class="bento__name">{{ t.product.name }}</span>
                  <span class="bento__price price">{{ t.product.sizes ? 'от ' : '' }}{{ formatPrice(t.product.priceCents) }}</span>
                  <span class="bento__go" aria-hidden="true"><AppIcon name="arrow-right" :size="18" /></span>
                </span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ============================================================ CATEGORIES -->
    <section v-if="categories.length" id="kategorii" class="section section--tight-top" aria-labelledby="cats-title">
      <div class="container">
        <SectionHead
          id="cats-title"
          eyebrow="Категории"
          title="Какво търсиш днес?"
          text="От скулптури и комплекти за игра до малки решения, които правят деня по-подреден."
          :link="{ label: 'Всички продукти', to: '/produkti' }"
        />
        <ul class="cats">
          <li v-for="c in categories" :key="c.slug">
            <CategoryTile :category="c" />
          </li>
        </ul>
      </div>
    </section>

    <!-- ============================================================ FEATURED -->
    <section v-if="featured.length" class="section section--tight-top" aria-labelledby="featured-title">
      <div class="container">
        <SectionHead
          id="featured-title"
          eyebrow="Избрано за теб"
          title="Любими форми от нашия каталог"
          :link="{ label: 'Виж всички', to: '/produkti' }"
        />
        <ul class="grid">
          <li v-for="p in featured" :key="p.slug">
            <ProductCard :product="p" />
          </li>
        </ul>
      </div>
    </section>

    <!-- ============================================================ PLAY SETS -->
    <section v-if="playSets.length" class="section section--tight-top" aria-labelledby="play-title">
      <div class="container">
        <div class="play">
          <NuxtLink :to="`/produkti/${playSets[0]!.slug}`" class="play__visual" :aria-label="playSets[0]!.name">
            <img
              v-if="playHero"
              :src="imageUrl(playHero, 1200)"
              :srcset="srcset(playHero)"
              sizes="(min-width: 1024px) 45vw, 100vw"
              :width="playHero.width"
              :height="playHero.height"
              alt=""
              loading="lazy"
            />
          </NuxtLink>
          <div class="play__copy">
            <p class="eyebrow">Ново · Комплекти за игра</p>
            <h2 id="play-title">Големи комплекти за дълга игра.</h2>
            <p>
              Паста с купичка и вилица, казан с магически отвари, шах с геометрични фигури и спирална писта за топчета.
              Комплекти, около които се събира цялото семейство.
            </p>
            <ul class="play__list">
              <li v-for="p in playSets" :key="p.slug">
                <NuxtLink :to="`/produkti/${p.slug}`">
                  <span>{{ p.name }}</span>
                  <span class="price">{{ p.sizes ? 'от ' : '' }}{{ formatPrice(p.priceCents) }}</span>
                  <AppIcon name="arrow-right" :size="18" />
                </NuxtLink>
              </li>
            </ul>
            <NuxtLink to="/kategorii/komplekti-za-igra" class="btn">Всички комплекти <AppIcon name="arrow-right" /></NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================ EVERYDAY -->
    <section v-if="everyday.length" class="everyday" aria-labelledby="everyday-title">
      <div class="container everyday__grid">
        <div class="everyday__intro">
          <p class="eyebrow everyday__eyebrow">Полезни всеки ден</p>
          <h2 id="everyday-title">Малки предмети, които решават малки проблеми.</h2>
          <p>
            Щипка за отворения пакет, клипс за кабела, който все пада, място за ключовете до вратата. Направихме ги
            така, че да ги ползваш с удоволствие — и да изглеждат добре, докато го правиш.
          </p>
          <ul class="everyday__points">
            <li><AppIcon name="check" :size="20" /> Цветове, които пасват на дома ти</li>
            <li><AppIcon name="check" :size="20" /> Ясни размери за всеки продукт</li>
            <li><AppIcon name="check" :size="20" /> Изработка след поръчка</li>
          </ul>
          <NuxtLink to="/kategorii/praktichni-resheniya" class="btn btn--coral">
            Практични решения
            <AppIcon name="arrow-right" />
          </NuxtLink>
        </div>
        <ul class="everyday__list">
          <li v-for="p in everyday" :key="p.slug">
            <ProductCard :product="p" sizes="(min-width: 1024px) 30vw, 45vw" />
          </li>
        </ul>
      </div>
    </section>

    <!-- ============================================================ PERSONALISED -->
    <section v-if="gifts.length" class="section" aria-labelledby="gift-title">
      <div class="container">
        <div class="gift">
          <div class="gift__copy">
            <p class="eyebrow">Персонализирани подаръци</p>
            <h2 id="gift-title">Подарък, който носи нечие име.</h2>
            <p class="gift__text">
              Ключодържател за първия ключ, табелка за детската стая или моливник за новата учебна година. Избери цвят,
              впиши надписа — и го създаваме специално за теб.
            </p>

            <form v-if="keychain" class="gift__try" @submit.prevent="navigateTo({ path: `/produkti/${keychain.slug}`, query: name.trim() && nameValid ? { nadpis: name.trim() } : {} })">
              <div class="field">
                <label for="gift-name">Опитай с име</label>
                <div class="gift__row">
                  <input
                    id="gift-name"
                    v-model="name"
                    class="input"
                    type="text"
                    maxlength="10"
                    placeholder="напр. Мила"
                    autocomplete="off"
                    :aria-invalid="!nameValid"
                    aria-describedby="gift-hint"
                  />
                  <button class="btn" type="submit" :disabled="!nameValid">Създай</button>
                </div>
                <p v-if="!nameValid" id="gift-hint" class="field-error" role="alert">
                  <AppIcon name="alert" :size="16" /> Използвай букви, цифри, интервал или тире.
                </p>
                <p v-else id="gift-hint" class="field-hint">До 10 символа. Ще продължиш към ключодържателя с име.</p>
              </div>
            </form>
          </div>

          <div class="gift__visual">
            <figure class="gift__preview" aria-label="Примерна визуализация на ключодържател">
              <div class="kc" aria-hidden="true">
                <span class="kc__ring" />
                <span class="kc__plate"><span class="kc__text">{{ preview }}</span></span>
              </div>
              <figcaption>Примерна визуализация — не е точен макет на продукта.</figcaption>
            </figure>
            <ul class="gift__products">
              <li v-for="g in gifts" :key="g.slug">
                <NuxtLink :to="`/produkti/${g.slug}`" class="gift__mini">
                  <img
                    v-if="cutoutImage(g)"
                    :src="imageUrl(cutoutImage(g)!, 480)"
                    alt=""
                    width="480"
                    height="600"
                    loading="lazy"
                  />
                  <span>
                    <strong>{{ g.name }}</strong>
                    <span class="price">{{ g.sizes ? 'от ' : '' }}{{ formatPrice(g.priceCents) }}</span>
                  </span>
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================ BRAND -->
    <section class="section section--tight-top" aria-labelledby="brand-title">
      <div class="container brand">
        <div class="brand__statement">
          <p class="eyebrow">Това е Imagoo</p>
          <h2 id="brand-title">Вярваме, че полезното може да бъде и красиво — а красивото може да бъде и забавно.</h2>
        </div>
        <div class="brand__body">
          <p>
            Imagoo е български бранд за предмети, създадени с 3D печат. Събираме на едно място форми за дома, малки
            помощници за всеки ден, подвижни фигурки и подаръци с име. Всеки продукт се изгражда слой по слой — затова
            можем да предложим цветове по избор и надписи, които иначе не биха били възможни.
          </p>
          <ol class="steps">
            <li>
              <span class="steps__n">1</span>
              <div>
                <h3>Избери форма</h3>
                <p>Разгледай каталога по категория или потърси конкретна идея.</p>
              </div>
            </li>
            <li>
              <span class="steps__n">2</span>
              <div>
                <h3>Избери цвят и надпис</h3>
                <p>При персонализираните продукти впиши име, инициали или кратка дума.</p>
              </div>
            </li>
            <li>
              <span class="steps__n">3</span>
              <div>
                <h3>Ние го отпечатваме</h3>
                <p>Продуктът се изработва след поръчка и се изпраща до теб.</p>
              </div>
            </li>
          </ol>
          <NuxtLink to="/za-nas" class="link-arrow">Повече за нас <AppIcon name="arrow-right" /></NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============================================================ FAQ -->
    <section class="section section--tight-top" aria-labelledby="faq-title">
      <div class="container faqwrap">
        <SectionHead
          id="faq-title"
          eyebrow="Въпроси"
          title="Кратко и ясно"
          text="Най-важното за продуктите, персонализацията и доставката."
          :link="{ label: 'Всички въпроси', to: '/vuprosi' }"
        />
        <FaqList :items="homeFaq" />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.section--tight-top {
  padding-top: 24px;
  @include up(md) {
    padding-top: 40px;
  }
}

// ---------------------------------------------------------------- hero
.hero {
  position: relative;
  padding-block: 28px 40px;
  overflow: hidden;
  @include up(lg) {
    padding-block: 48px 72px;
  }
}
.hero__grid {
  display: grid;
  gap: 32px;
  align-items: center;
  @include up(lg) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 40px;
  }
  @include up(xl) {
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    gap: 48px;
  }
}
.hero__copy {
  position: relative;
  z-index: 2;
  container-type: inline-size;
}
.hero__eyebrow svg {
  color: var(--coral);
}
.hero__title {
  margin-top: 14px;
  // The display face is wide: size it against its own column (container units),
  // so the longest line („в ежедневието.“) always fits.
  font-size: clamp(1.9rem, 9.4cqi, 4rem);
  font-weight: 750;
  line-height: 1.04;
  letter-spacing: -0.035em;
}
.hero__mark {
  position: relative;
  white-space: nowrap;
  color: var(--purple);
  &::after {
    // ribbon underline echoing the logo's coral loop
    content: '';
    position: absolute;
    left: -2%;
    right: -2%;
    bottom: -0.02em;
    height: 0.2em;
    z-index: -1;
    border-radius: 999px;
    background: var(--coral);
    transform: rotate(-1.5deg);
  }
}
.hero__lead {
  margin-top: 20px;
  max-width: 38ch;
  font-size: 1.0625rem;
  color: var(--muted);
  @include up(md) {
    font-size: 1.1875rem;
  }
}
.hero__ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 28px;
  @include down(sm) {
    .btn {
      flex: 1 1 100%;
    }
  }
}
.hero__quick {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
  margin-top: 28px;
  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    list-style: none;
  }
}
.hero__quickLabel {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--muted);
}

.hero__stage {
  position: relative;
}
.hero__ribbon {
  position: absolute;
  z-index: 0;
  left: -6%;
  top: 50%;
  width: 112%;
  color: var(--coral);
  opacity: 0.9;
  transform: translateY(-50%) rotate(-8deg);
  @include down(lg) {
    display: none;
  }
}

.bento {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 12px;
  height: clamp(380px, 92vw, 520px);
  list-style: none;
  @include up(lg) {
    gap: 18px;
    height: 600px;
  }
}
.bento__tile {
  position: relative;
  overflow: hidden;
  border-radius: var(--r-lg);
  background: var(--tint);
  @include up(lg) {
    border-radius: var(--r-xl);
  }
  &--0 {
    grid-row: span 2;
  }
  &--1 {
    @include up(lg) {
      margin-left: 36px;
    }
  }
  &--2 {
    @include up(lg) {
      margin-right: 36px;
    }
  }
}
.bento__link {
  display: block;
  height: 100%;
  text-decoration: none;
  &:focus-visible {
    outline-offset: -4px;
    border-radius: inherit;
  }
}
.bento__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 62%;
  mix-blend-mode: multiply;
  transition: transform 0.7s var(--ease);
  .bento__tile--0 & {
    object-position: 50% 50%;
    transform: scale(1.06);
  }
}
@include motion {
  .bento__link:hover .bento__img {
    transform: scale(1.07);
  }
  .bento__tile--0 .bento__link:hover .bento__img {
    transform: scale(1.12);
  }
}
.bento__label {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 5px 10px;
  border-radius: 8px;
  background: rgb(255 253 249 / 80%);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--purple);
}
.bento__tag {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 8px 8px 14px;
  border-radius: 14px;
  background: var(--paper);
  box-shadow: var(--shadow-sm);
  @include up(lg) {
    left: 16px;
    right: auto;
    bottom: 16px;
    max-width: calc(100% - 32px);
  }
}
.bento__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
  @include down(sm) {
    display: none;
  }
}
.bento__price {
  font-size: 0.9375rem;
  @include down(sm) {
    flex: 1;
  }
}
.bento__go {
  display: grid;
  flex: none;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--purple);
  color: var(--paper);
  transition: background-color 0.2s;
  .bento__link:hover & {
    background: var(--coral);
    color: var(--ink);
  }
}

// ---------------------------------------------------------------- categories
.cats {
  display: grid;
  gap: 14px;
  list-style: none;
  grid-template-columns: 1fr;
  @include up(sm) {
    grid-template-columns: repeat(2, 1fr);
  }
  @include up(lg) {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  > li {
    display: grid;
  }
}

// ---------------------------------------------------------------- product grid
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  list-style: none;
  @include up(md) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }
  @include up(xl) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  > li {
    display: grid;
  }
}


// ---------------------------------------------------------------- play sets
.play {
  display: grid;
  overflow: hidden;
  border-radius: var(--r-xl);
  background: #e6f2ec;
  @include up(lg) {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  }
}
.play__visual {
  display: block;
  min-height: 280px;
  img {
    width: 100%;
    height: 100%;
    max-height: 560px;
    object-fit: cover;
    object-position: 50% 60%;
    mix-blend-mode: multiply;
    transition: transform 0.7s var(--ease);
  }
  &:hover img {
    transform: scale(1.03);
  }
}
.play__copy {
  display: grid;
  gap: 16px;
  align-content: center;
  justify-items: start;
  padding: 28px 22px 32px;
  @include up(md) {
    padding: 48px;
  }
  h2 {
    font-size: clamp(1.6rem, 1.1rem + 2vw, 2.4rem);
  }
  > p {
    color: var(--muted);
    max-width: 46ch;
  }
}
.play__list {
  display: grid;
  width: 100%;
  list-style: none;
  border-top: 1px solid rgb(35 16 63 / 10%);
  a {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 52px;
    padding: 8px 4px;
    border-bottom: 1px solid rgb(35 16 63 / 10%);
    font-weight: 600;
    text-decoration: none;
    span:first-child {
      flex: 1;
    }
    &:hover {
      color: var(--purple);
      svg {
        transform: translateX(3px);
      }
    }
    svg {
      transition: transform 0.2s var(--ease);
    }
  }
}

// ---------------------------------------------------------------- everyday
.everyday {
  position: relative;
  margin-block: 24px;
  padding-block: 56px;
  background: var(--purple);
  color: var(--paper);
  overflow: hidden;
  @include up(md) {
    padding-block: 88px;
  }
  &::before {
    // big soft loop from the logo, very subtle
    content: '';
    position: absolute;
    right: -180px;
    top: -140px;
    width: 520px;
    height: 520px;
    border: 70px solid rgb(255 255 255 / 4%);
    border-radius: 50%;
  }
}
.everyday__grid {
  position: relative;
  display: grid;
  gap: 32px;
  @include up(lg) {
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    gap: 56px;
    align-items: center;
  }
}
.everyday__eyebrow {
  color: var(--coral);
}
.everyday__intro {
  display: grid;
  gap: 18px;
  justify-items: start;
  h2 {
    font-size: clamp(1.6rem, 1.1rem + 2vw, 2.4rem);
  }
  p {
    color: #ded4ef;
  }
}
.everyday__points {
  display: grid;
  gap: 8px;
  list-style: none;
  li {
    display: flex;
    gap: 10px;
    align-items: center;
    font-weight: 500;
  }
  svg {
    color: var(--coral);
  }
}
.everyday__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  list-style: none;
  color: var(--ink);
  @include up(md) {
    gap: 18px;
  }
  > li {
    display: grid;
  }
  :deep(.card) {
    border-color: transparent;
  }
}
.everyday :deep(:focus-visible) {
  outline-color: var(--coral);
}

// ---------------------------------------------------------------- gifts
.gift {
  display: grid;
  gap: 32px;
  padding: 28px 20px;
  border-radius: var(--r-xl);
  background: var(--peach-100);
  @include up(md) {
    padding: 48px;
  }
  @include up(lg) {
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    gap: 56px;
    padding: 64px;
    align-items: center;
  }
}
.gift__copy {
  display: grid;
  gap: 16px;
  h2 {
    font-size: clamp(1.6rem, 1.1rem + 2vw, 2.5rem);
  }
}
.gift__text {
  color: var(--muted);
  max-width: 48ch;
}
.gift__try {
  margin-top: 8px;
  max-width: 440px;
}
.gift__row {
  display: flex;
  gap: 8px;
  .input {
    flex: 1;
    min-width: 0;
  }
}
.gift__visual {
  display: grid;
  gap: 16px;
}
.gift__preview {
  display: grid;
  justify-items: center;
  gap: 12px;
  margin: 0;
  padding: 36px 16px 18px;
  border-radius: var(--r-lg);
  background: var(--paper);
  figcaption {
    font-size: 0.8125rem;
    color: var(--muted);
  }
}

// CSS keychain mock: rounded plate + ring, text in the display face
.kc {
  display: flex;
  align-items: center;
  max-width: 100%;
  transform: rotate(-4deg);
}
.kc__ring {
  flex: none;
  width: 52px;
  height: 52px;
  margin-right: -20px;
  border: 5px solid #c9c9d1;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 8%);
}
.kc__plate {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-width: 0;
  padding: 14px 26px 14px 34px;
  border-radius: 999px;
  background: var(--purple-600);
  box-shadow: 0 6px 0 #2f1660, 0 14px 24px rgb(35 16 63 / 25%);
  &::before {
    // hole for the ring
    content: '';
    position: absolute;
    left: 12px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--paper);
    box-shadow: inset 0 2px 2px rgb(0 0 0 / 25%);
  }
}
.kc__text {
  overflow: hidden;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.6rem, 1rem + 3vw, 2.6rem);
  letter-spacing: -0.01em;
  line-height: 1.1;
  color: #f6efe4;
  text-shadow: 0 3px 0 #c9bfae;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.gift__products {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  list-style: none;
}
.gift__mini {
  display: grid;
  gap: 6px;
  height: 100%;
  padding: 8px 8px 12px;
  border-radius: var(--r-md);
  background: var(--paper);
  text-decoration: none;
  transition: box-shadow 0.2s;
  img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 12px;
  }
  strong {
    display: block;
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.3;
  }
  .price {
    font-size: 0.875rem;
    color: var(--purple);
  }
  &:hover {
    box-shadow: var(--shadow-md);
  }
}

// ---------------------------------------------------------------- brand
.brand {
  display: grid;
  gap: 28px;
  @include up(lg) {
    grid-template-columns: 1fr 1fr;
    gap: 72px;
  }
}
.brand__statement h2 {
  margin-top: 12px;
  font-size: clamp(1.5rem, 1rem + 2vw, 2.35rem);
  line-height: 1.18;
}
.brand__body {
  display: grid;
  gap: 24px;
  align-content: start;
  justify-items: start;
  > p {
    color: var(--muted);
    font-size: 1.0625rem;
  }
}
.steps {
  display: grid;
  gap: 16px;
  list-style: none;
  li {
    display: flex;
    gap: 16px;
  }
  h3 {
    font-family: var(--font-body);
    font-size: 1.0625rem;
    font-weight: 700;
    letter-spacing: 0;
  }
  p {
    color: var(--muted);
    font-size: 0.9375rem;
  }
}
.steps__n {
  display: grid;
  flex: none;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--purple-100);
  color: var(--purple);
  font-family: var(--font-display);
  font-weight: 700;
}

.faqwrap {
  max-width: 960px;
}
</style>
