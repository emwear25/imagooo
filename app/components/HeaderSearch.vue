<script setup lang="ts">
import { searchProducts, primaryImage, imageUrl } from '~/utils/catalog'
import { formatPrice } from '~/utils/format'

const props = withDefaults(defineProps<{ autofocus?: boolean; compact?: boolean }>(), { autofocus: false, compact: false })
const emit = defineEmits<{ done: [] }>()

const route = useRoute()
const q = ref(typeof route.query.q === 'string' ? route.query.q : '')
const open = ref(false)
const active = ref(-1)
const input = ref<HTMLInputElement | null>(null)
const root = ref<HTMLElement | null>(null)
const id = useId()
const listId = `${id}-list`

const { products } = useCatalog()
const results = computed(() => (q.value.trim().length >= 2 ? searchProducts(q.value, products.value).slice(0, 5) : []))
const showList = computed(() => open.value && q.value.trim().length >= 2)
const optionCount = computed(() => results.value.length + 1)

watch(q, () => {
  active.value = -1
  open.value = true
})
watch(
  () => route.fullPath,
  () => {
    open.value = false
  },
)

onMounted(() => {
  if (props.autofocus) input.value?.focus()
})

function goAll() {
  const term = q.value.trim()
  open.value = false
  emit('done')
  navigateTo({ path: '/produkti', query: term ? { q: term } : {} })
}

function choose(i: number) {
  if (i >= 0 && i < results.value.length) {
    open.value = false
    emit('done')
    navigateTo(`/produkti/${results.value[i]!.slug}`)
  } else {
    goAll()
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    open.value = true
    active.value = (active.value + 1) % optionCount.value
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    active.value = active.value <= 0 ? optionCount.value - 1 : active.value - 1
  } else if (e.key === 'Escape') {
    if (open.value && q.value) {
      e.stopPropagation()
      open.value = false
    }
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (showList.value && active.value >= 0) choose(active.value)
    else goAll()
  }
}

function onFocusOut(e: FocusEvent) {
  if (!root.value?.contains(e.relatedTarget as Node)) open.value = false
}
</script>

<template>
  <div ref="root" class="hs" :class="{ 'hs--compact': compact }" @focusout="onFocusOut">
    <form role="search" class="hs__form" @submit.prevent="goAll">
      <label :for="id" class="visually-hidden">Търси продукти</label>
      <AppIcon name="search" class="hs__icon" />
      <input
        :id="id"
        ref="input"
        v-model="q"
        class="hs__input"
        type="search"
        placeholder="Търси ваза, ключодържател, органайзер…"
        autocomplete="off"
        enterkeyhint="search"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="showList"
        :aria-controls="listId"
        :aria-activedescendant="showList && active >= 0 ? `${listId}-${active}` : undefined"
        @keydown="onKey"
        @focus="open = true"
      />
      <button v-if="q" type="button" class="hs__clear" aria-label="Изчисти търсенето" @click="q = ''; input?.focus()">
        <AppIcon name="close" :size="18" />
      </button>
    </form>

    <div v-show="showList" class="hs__panel">
      <ul :id="listId" role="listbox" aria-label="Предложения">
        <li
          v-for="(p, i) in results"
          :id="`${listId}-${i}`"
          :key="p.slug"
          role="option"
          :aria-selected="active === i"
          class="hs__opt"
          :class="{ 'is-active': active === i }"
          @mousedown.prevent="choose(i)"
          @mousemove="active = i"
        >
          <img
            v-if="primaryImage(p)"
            :src="imageUrl(primaryImage(p)!, 480)"
            alt=""
            width="44"
            height="55"
            loading="lazy"
          />
          <span class="hs__name">{{ p.name }}</span>
          <span class="hs__price price">{{ formatPrice(p.priceCents) }}</span>
        </li>
        <li
          :id="`${listId}-${results.length}`"
          role="option"
          :aria-selected="active === results.length"
          class="hs__opt hs__all"
          :class="{ 'is-active': active === results.length }"
          @mousedown.prevent="goAll"
          @mousemove="active = results.length"
        >
          <AppIcon name="search" :size="18" />
          <span v-if="results.length">Всички резултати за „{{ q.trim() }}“</span>
          <span v-else>Няма точни съвпадения — виж целия каталог</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.hs {
  position: relative;
  width: 100%;
}
.hs__form {
  position: relative;
  display: flex;
  align-items: center;
}
.hs__icon {
  position: absolute;
  left: 14px;
  width: 20px;
  height: 20px;
  color: var(--muted);
  pointer-events: none;
}
.hs__input {
  width: 100%;
  min-height: 46px;
  padding: 10px 44px 10px 44px;
  border: 1.5px solid transparent;
  border-radius: 14px;
  background: var(--sand);
  font-size: 1rem;
  transition: border-color 0.15s, background-color 0.15s;
  &::placeholder {
    color: #7d7189;
  }
  &::-webkit-search-cancel-button {
    display: none;
  }
  &:hover {
    border-color: var(--sand-300);
  }
  &:focus {
    outline: none;
    background: var(--paper);
    border-color: var(--purple-600);
    box-shadow: 0 0 0 3px rgb(75 42 134 / 15%);
  }
}
.hs__clear {
  position: absolute;
  right: 4px;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--muted);
  &:hover {
    background: var(--purple-100);
  }
}
.hs__panel {
  position: absolute;
  z-index: 40;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  padding: 8px;
  border-radius: var(--r-md);
  background: var(--paper);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-lg);
  ul {
    list-style: none;
  }
}
.hs__opt {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 6px 10px;
  border-radius: 12px;
  cursor: pointer;
  img {
    flex: none;
    width: 44px;
    height: 55px;
    border-radius: 8px;
    object-fit: cover;
  }
  &.is-active {
    background: var(--purple-100);
  }
}
.hs__name {
  flex: 1;
  font-weight: 500;
  line-height: 1.3;
}
.hs__price {
  font-size: 0.9375rem;
}
.hs__all {
  margin-top: 4px;
  border-top: 1px solid var(--line);
  border-radius: 0 0 12px 12px;
  color: var(--purple);
  font-weight: 600;
  font-size: 0.9375rem;
}
</style>
