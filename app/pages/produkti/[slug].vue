<script setup lang="ts">
import { imageUrl, productImages, relatedProducts } from '~/utils/catalog'
import { formatDays, formatPrice } from '~/utils/format'
import { PERSONALIZATION_PATTERN } from '~/utils/text'
import { store } from '~/config/store'
import { useCartStore, MAX_QTY } from '~/stores/cart'
import { useWishlistStore } from '~/stores/wishlist'
import { useUiStore } from '~/stores/ui'

definePageMeta({ key: (r) => r.path })

const route = useRoute()
const router = useRouter()
const { products, productBySlug, categoryBySlug, canOrder } = useCatalog()
const product = computed(() => productBySlug(String(route.params.slug)))
if (!product.value) {
  throw createError({ statusCode: 404, message: 'Продуктът не е намерен' })
}
const p = computed(() => product.value!)
const category = computed(() => categoryBySlug(p.value.category) ?? { slug: p.value.category, name: 'Категория' })

const cart = useCartStore()
const wishlist = useWishlistStore()
const ui = useUiStore()

// ---- variant (synced with ?cvyat=)
const initialVariant = () => {
  const q = route.query.cvyat
  if (typeof q === 'string' && p.value.variants.some((v) => v.id === q)) return q
  // first colour that is in stock
  return (p.value.variants.find((v) => v.available !== false) ?? p.value.variants[0]!).id
}
const variantId = ref(initialVariant())
const variant = computed(() => p.value.variants.find((v) => v.id === variantId.value)!)
watch(variantId, (v) => {
  activeImg.value = 0
  router.replace({ query: { ...route.query, cvyat: v === p.value.variants[0]!.id ? undefined : v } })
})

// ---- gallery
const images = computed(() => productImages(p.value, variantId.value))
const activeImg = ref(0)
const current = computed(() => images.value[activeImg.value] ?? images.value[0])
const viewName: Record<string, string> = { hero: 'основен изглед', side: 'страничен изглед', top: 'изглед отгоре' }
const altFor = (i: { view: string; variantId: string }) => {
  const vn = p.value.variants.find((v) => v.id === i.variantId)?.name ?? ''
  return `${p.value.name}, ${vn.toLowerCase()} — ${viewName[i.view] ?? 'изглед'}`
}
function onThumbKey(e: KeyboardEvent, i: number) {
  const n = images.value.length
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    e.preventDefault()
    activeImg.value = (i + 1) % n
    focusThumb(activeImg.value)
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault()
    activeImg.value = (i - 1 + n) % n
    focusThumb(activeImg.value)
  }
}
const thumbs = ref<HTMLButtonElement[]>([])
const focusThumb = (i: number) => nextTick(() => thumbs.value[i]?.focus())

// ---- personalisation
const pz = computed(() => p.value.personalization)
const text = ref(typeof route.query.nadpis === 'string' ? route.query.nadpis.slice(0, pz.value?.maxLength ?? 0) : '')
const touched = ref(false)
const textError = computed(() => {
  if (!pz.value) return ''
  const t = text.value.trim()
  if (pz.value.required && !t) return `Моля, въведи ${pz.value.label.toLowerCase()} за персонализацията.`
  if (t.length > pz.value.maxLength) return `Максимум ${pz.value.maxLength} символа.`
  if (!PERSONALIZATION_PATTERN.test(t)) return 'Използвай само букви (кирилица или латиница), цифри, интервал, точка или тире.'
  return ''
})
const showError = computed(() => touched.value && !!textError.value)
const textInput = ref<HTMLInputElement | null>(null)

// ---- quantity & add
const qty = ref(1)
const justAdded = ref(false)
const soldOut = computed(() => variant.value.available === false)
function addToCart() {
  if (soldOut.value) return
  touched.value = true
  if (textError.value) {
    textInput.value?.focus()
    return
  }
  cart.add(p.value.slug, variantId.value, qty.value, pz.value ? text.value : undefined)
  justAdded.value = true
  setTimeout(() => (justAdded.value = false), 2400)
  ui.toast({
    title: 'Добавено в количката',
    body: `${p.value.name} · ${variant.value.name}${text.value.trim() ? ` · „${text.value.trim()}“` : ''} × ${qty.value}`,
    image: images.value[0] ? imageUrl(images.value[0], 480) : undefined,
    action: { label: 'Към количката', to: '/kolichka' },
    tone: 'success',
  })
}
const saved = computed(() => wishlist.has(p.value.slug))
function toggleWish() {
  const on = wishlist.toggle(p.value.slug)
  ui.toast({ title: on ? 'Запазено в любими' : 'Премахнато от любими', body: p.value.name, tone: 'info' }, 3000)
}

// ---- sticky mobile bar
const buyBox = ref<HTMLElement | null>(null)
const showSticky = ref(false)
let io: IntersectionObserver | undefined
onMounted(() => {
  if (!buyBox.value || !('IntersectionObserver' in window)) return
  io = new IntersectionObserver(([e]) => (showSticky.value = !e!.isIntersecting && e!.boundingClientRect.top < 0))
  io.observe(buyBox.value)
})
onBeforeUnmount(() => io?.disconnect())

const related = computed(() => relatedProducts(p.value, products.value, 4))
const sh = store.shipping
const clip = (t: string, n: number) => (t.length <= n ? t : `${t.slice(0, t.lastIndexOf(' ', n - 1))}…`)

useSeo(() => ({
  title: p.value.name,
  description: clip(`${p.value.name} — ${p.value.tagline}. ${p.value.description[0]}`, 158),
  path: `/produkti/${p.value.slug}`,
  image: images.value[0] ? imageUrl(images.value[0], 1200) : undefined,
  type: 'product',
}))
</script>

<template>
  <div v-if="product" class="container pdp">
    <div class="page-head">
      <AppBreadcrumbs
        :items="[
          { label: 'Продукти', to: '/produkti' },
          { label: category.name, to: `/kategorii/${category.slug}` },
          { label: p.name },
        ]"
      />
    </div>

    <div class="pdp__grid">
      <!-- gallery -->
      <section class="gal" aria-label="Изображения на продукта">
        <div class="gal__main">
          <ProductImage
            :key="current?.src"
            :image="current"
            :alt="current ? altFor(current) : p.name"
            eager
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
          <p v-if="current && current.variantId !== variantId" class="gal__note">
            Показан в цвят „{{ p.variants.find((v) => v.id === current!.variantId)?.name }}“
          </p>
        </div>
        <div v-if="images.length > 1" class="gal__thumbs" role="group" aria-label="Избери изображение">
          <button
            v-for="(img, i) in images"
            :key="img.src"
            ref="thumbs"
            type="button"
            class="gal__thumb"
            :class="{ 'is-active': i === activeImg }"
            :aria-pressed="i === activeImg"
            :aria-label="`Покажи ${viewName[img.view]}`"
            :tabindex="i === activeImg ? 0 : -1"
            @click="activeImg = i"
            @keydown="onThumbKey($event, i)"
          >
            <img :src="imageUrl(img, 480)" alt="" width="96" height="120" loading="lazy" />
          </button>
        </div>
        <p v-if="current && !current.remote" class="gal__disclaimer">
          <AppIcon name="info" :size="16" /> Изображенията са концептуални визуализации. Реалният нюанс може леко да се различава.
        </p>
      </section>

      <!-- buy box -->
      <section ref="buyBox" class="buy" aria-labelledby="pdp-title">
        <ul v-if="p.badges.length" class="buy__badges" aria-label="Етикети">
          <li v-if="p.badges.includes('new')" class="badge badge--coral">Ново</li>
          <li v-if="p.badges.includes('personalizable')" class="badge badge--soft">С персонализация</li>
          <li v-if="p.badges.includes('set')" class="badge badge--soft">Комплект</li>
        </ul>
        <h1 id="pdp-title" class="buy__title">{{ p.name }}</h1>
        <p class="buy__tagline">{{ p.tagline }}</p>
        <PriceTag :cents="p.priceCents" :compare-at-cents="p.compareAtCents" size="lg" class="buy__price" />
        <p class="buy__vat">
          <template v-if="canOrder">Цената включва ДДС.</template>
          <template v-else>Демо цена — магазинът все още не приема поръчки.</template>
        </p>

        <form class="buy__form" novalidate @submit.prevent="addToCart">
          <ColorSwatches v-model="variantId" :variants="p.variants" label="Цвят" />

          <div v-if="pz" class="field buy__pz">
            <label for="pz-input">
              {{ pz.label }} <span v-if="pz.required" class="req" aria-hidden="true">*</span>
              <span v-if="pz.required" class="visually-hidden">(задължително)</span>
            </label>
            <div class="buy__pzRow">
              <input
                id="pz-input"
                ref="textInput"
                v-model="text"
                class="input"
                type="text"
                :maxlength="pz.maxLength"
                :placeholder="pz.placeholder"
                autocomplete="off"
                spellcheck="false"
                :required="pz.required"
                :aria-invalid="showError"
                aria-describedby="pz-help pz-count pz-error"
                @blur="touched = true"
              />
              <span id="pz-count" class="buy__count" :class="{ 'is-full': text.length >= pz.maxLength }">
                {{ text.length }}/{{ pz.maxLength }}<span class="visually-hidden"> символа</span>
              </span>
            </div>
            <p id="pz-help" class="field-hint">{{ pz.help }} Провери правописа — изработваме надписа точно както е въведен.</p>
            <p v-if="showError" id="pz-error" class="field-error" role="alert">
              <AppIcon name="alert" :size="16" /> {{ textError }}
            </p>
          </div>

          <div class="buy__row">
            <QtyStepper v-model="qty" :max="MAX_QTY" label="Количество" />
            <button type="submit" class="btn btn--coral buy__add" :disabled="soldOut">
              <AppIcon :name="justAdded ? 'check' : 'bag'" />
              {{ soldOut ? 'Изчерпан' : justAdded ? 'Добавено' : 'Добави в количката' }}
            </button>
            <button
              type="button"
              class="icon-btn buy__wish"
              :aria-pressed="saved"
              :aria-label="saved ? 'Премахни от любими' : 'Запази в любими'"
              @click="toggleWish"
            >
              <AppIcon :name="saved ? 'heart-fill' : 'heart'" />
            </button>
          </div>
        </form>

        <div class="buy__ship">
          <div class="buy__shipItem">
            <AppIcon name="layers" />
            <div>
              <strong>Изработка след поръчка</strong>
              <p>
                Ориентировъчно {{ formatDays(sh.productionDays.min, sh.productionDays.max) }}<template v-if="pz">
                  + {{ formatDays(sh.personalizedExtraDays.min, sh.personalizedExtraDays.max) }} за персонализация</template>.
              </p>
            </div>
          </div>
          <div class="buy__shipItem">
            <AppIcon name="truck" />
            <div>
              <strong>Доставка</strong>
              <p>
                {{ sh.couriers.value?.join(' или ') }} за {{ formatDays(sh.deliveryDays.min, sh.deliveryDays.max) }}.
                Безплатна {{ sh.freeShippingThreshold.value }}.
              </p>
            </div>
          </div>
          <p class="buy__shipNote">Сроковете за изработка са ориентировъчни.</p>
        </div>

        <div v-if="p.notice" class="notice">
          <AppIcon name="info" />
          <p>{{ p.notice }}</p>
        </div>
      </section>
    </div>

    <!-- details -->
    <section class="details" aria-labelledby="details-title">
      <h2 id="details-title" class="visually-hidden">Подробности за продукта</h2>
      <div class="details__desc">
        <h3>Описание</h3>
        <p v-for="(d, i) in p.description" :key="i">{{ d }}</p>
        <ul class="details__hl">
          <li v-for="h in p.highlights" :key="h"><AppIcon name="check" :size="18" /> {{ h }}</li>
        </ul>
        <p v-if="p.propsNote" class="details__props"><AppIcon name="info" :size="16" /> {{ p.propsNote }}</p>
      </div>
      <div class="details__specs">
        <h3>Характеристики</h3>
        <dl>
          <div v-if="p.specs.dimensions">
            <dt><AppIcon name="ruler" :size="18" /> Размери</dt>
            <dd>{{ p.specs.dimensions }}</dd>
          </div>
          <div v-if="p.specs.material">
            <dt><AppIcon name="layers" :size="18" /> Материал</dt>
            <dd>{{ p.specs.material }}</dd>
          </div>
          <div v-if="p.specs.includes">
            <dt><AppIcon name="package" :size="18" /> В комплекта</dt>
            <dd>{{ p.specs.includes }}</dd>
          </div>
          <div v-if="p.specs.care?.length">
            <dt><AppIcon name="droplet" :size="18" /> Грижа</dt>
            <dd>
              <ul>
                <li v-for="c in p.specs.care" :key="c">{{ c }}</li>
              </ul>
            </dd>
          </div>
        </dl>
        <p v-if="!canOrder" class="details__demo">Размерите и материалите са демонстрационни данни.</p>
        <div v-if="p.design" class="credit">
          <h3>Дизайн</h3>
          <p>
            „<a :href="p.design.url" target="_blank" rel="noopener noreferrer">{{ p.design.title }}</a>“ от
            <strong>{{ p.design.designer }}</strong> ({{ p.design.platform }}), използван под лиценз
            <a :href="p.design.licenseUrl" target="_blank" rel="noopener noreferrer">{{ p.design.license }}</a>.
          </p>
          <p v-if="p.design.note" class="credit__note">{{ p.design.note }}</p>
          <p class="credit__note">Imagoo изработва и продава отпечатъци; авторските права върху дизайна остават за автора.</p>
        </div>
      </div>
    </section>

    <section class="related" aria-labelledby="rel-title">
      <SectionHead id="rel-title" title="Може да харесаш и" :link="{ label: category.name, to: `/kategorii/${category.slug}` }" />
      <ul class="related__grid">
        <li v-for="r in related" :key="r.slug">
          <ProductCard :product="r" />
        </li>
      </ul>
    </section>

    <Transition name="sticky">
      <div v-if="showSticky" class="sticky">
        <div class="sticky__info">
          <strong>{{ p.name }}</strong>
          <span class="price">{{ formatPrice(p.priceCents) }}</span>
        </div>
        <button type="button" class="btn btn--coral btn--sm" @click="pz ? (buyBox?.scrollIntoView({ block: 'start' }), textInput?.focus({ preventScroll: true })) : addToCart()">
          {{ pz ? 'Персонализирай' : 'Добави' }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.pdp__grid {
  display: grid;
  gap: 28px;
  @include up(lg) {
    grid-template-columns: minmax(0, 1.08fr) minmax(0, 1fr);
    gap: 56px;
    align-items: start;
  }
}

// gallery
.gal {
  display: grid;
  gap: 12px;
  @include up(lg) {
    position: sticky;
    top: calc(var(--header-h) + 20px);
    grid-template-columns: 84px minmax(0, 1fr);
    .gal__main {
      order: 2;
    }
    .gal__thumbs {
      order: 1;
      flex-direction: column;
    }
    .gal__disclaimer {
      order: 3;
      grid-column: 2;
    }
  }
}
.gal__main {
  position: relative;
  overflow: hidden;
  border-radius: var(--r-lg);
  @include down(md) {
    margin-inline: calc(var(--gutter) * -1);
    border-radius: 0;
  }
}
.gal__note {
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 6px 10px;
  border-radius: 10px;
  background: rgb(255 253 249 / 90%);
  font-size: 0.8125rem;
  font-weight: 500;
}
.gal__thumbs {
  display: flex;
  gap: 8px;
}
.gal__thumb {
  flex: none;
  width: 72px;
  padding: 0;
  overflow: hidden;
  border: 2px solid transparent;
  border-radius: 14px;
  background: none;
  @include up(lg) {
    width: 84px;
  }
  img {
    width: 100%;
    aspect-ratio: 4 / 5;
    object-fit: cover;
  }
  &.is-active {
    border-color: var(--purple);
  }
  &:hover:not(.is-active) {
    border-color: var(--purple-200);
  }
}
.gal__disclaimer {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  font-size: 0.8125rem;
  color: var(--muted);
  svg {
    flex: none;
    margin-top: 3px;
  }
}

// buy box
.buy {
  display: grid;
  gap: 14px;
  align-content: start;
}
.buy__badges {
  display: flex;
  gap: 6px;
  list-style: none;
}
.buy__title {
  font-size: clamp(1.75rem, 1.2rem + 2vw, 2.6rem);
}
.buy__tagline {
  color: var(--muted);
  font-size: 1.0625rem;
}
.buy__price {
  margin-top: 4px;
}
.buy__vat {
  margin-top: -8px;
  font-size: 0.8125rem;
  color: var(--muted);
}
.buy__form {
  display: grid;
  gap: 22px;
  margin-top: 8px;
  padding: 22px 0;
  border-block: 1px solid var(--line);
}
.buy__pz {
  gap: 8px;
}
.buy__pzRow {
  position: relative;
  .input {
    padding-right: 70px;
    font-weight: 600;
    font-size: 1.125rem;
  }
}
.buy__count {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8125rem;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  &.is-full {
    color: var(--coral-text);
    font-weight: 600;
  }
}
.buy__row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.buy__add {
  flex: 1;
  min-width: 200px;
  min-height: 52px;
}
.buy__wish {
  width: 52px;
  height: 52px;
  border: 1.5px solid var(--sand-300);
  border-radius: 14px;
  color: var(--purple);
  &[aria-pressed='true'] {
    color: var(--coral-600);
    border-color: var(--coral);
  }
}
.buy__ship {
  display: grid;
  gap: 14px;
  padding: 18px;
  border-radius: var(--r-md);
  background: var(--paper);
  border: 1px solid var(--line);
}
.buy__shipItem {
  display: flex;
  gap: 12px;
  > svg {
    flex: none;
    color: var(--purple);
    margin-top: 2px;
  }
  strong {
    font-weight: 600;
  }
  p {
    color: var(--muted);
    font-size: 0.9375rem;
  }
}
.buy__shipNote {
  font-size: 0.8125rem;
  color: var(--muted);
}

// details
.details {
  display: grid;
  gap: 32px;
  margin-top: 56px;
  padding-top: 40px;
  border-top: 1px solid var(--line);
  @include up(lg) {
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    gap: 64px;
  }
  h3 {
    margin-bottom: 14px;
    font-size: 1.25rem;
  }
}
.details__desc {
  display: grid;
  gap: 12px;
  align-content: start;
  max-width: 68ch;
  > p {
    color: #3d2f52;
  }
}
.details__hl {
  display: grid;
  gap: 8px;
  margin-top: 8px;
  list-style: none;
  li {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }
  svg {
    flex: none;
    margin-top: 4px;
    color: var(--coral-600);
  }
}
.details__props {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-top: 4px;
  font-size: 0.9375rem;
  color: var(--muted);
  svg {
    flex: none;
    margin-top: 4px;
  }
}
.details__specs {
  dl {
    margin: 0;
    border-radius: var(--r-md);
    background: var(--paper);
    border: 1px solid var(--line);
  }
  dl > div {
    display: grid;
    gap: 4px;
    padding: 14px 18px;
    border-bottom: 1px solid var(--line);
    &:last-child {
      border-bottom: 0;
    }
    @include up(sm) {
      grid-template-columns: 150px 1fr;
      gap: 16px;
    }
  }
  dt {
    display: flex;
    gap: 8px;
    align-items: center;
    font-weight: 600;
    svg {
      color: var(--purple-400);
    }
  }
  dd {
    margin: 0;
    color: #3d2f52;
    ul {
      padding-left: 1.1em;
    }
  }
}
.details__demo {
  margin-top: 10px;
  font-size: 0.8125rem;
  color: var(--muted);
}

.credit {
  display: grid;
  gap: 6px;
  margin-top: 24px;
  padding: 16px 18px;
  border-radius: var(--r-md);
  background: var(--purple-100);
  h3 {
    margin: 0;
    font-size: 1rem;
  }
  a {
    color: var(--purple-600);
    font-weight: 600;
  }
}
.credit__note {
  font-size: 0.8125rem;
  color: var(--muted);
}
.related {
  margin-top: 72px;
}
.related__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  list-style: none;
  @include up(md) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;
  }
  > li {
    display: grid;
  }
}

// sticky mobile purchase bar
.sticky {
  position: fixed;
  z-index: 40;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px var(--gutter) calc(10px + env(safe-area-inset-bottom));
  background: var(--paper);
  border-top: 1px solid var(--line);
  box-shadow: 0 -8px 24px rgb(35 16 63 / 8%);
  @include up(lg) {
    display: none;
  }
}
.sticky__info {
  display: grid;
  flex: 1;
  min-width: 0;
  strong {
    overflow: hidden;
    font-size: 0.875rem;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
.sticky-enter-active,
.sticky-leave-active {
  transition: transform 0.3s var(--ease);
}
.sticky-enter-from,
.sticky-leave-to {
  transform: translateY(100%);
}
</style>
