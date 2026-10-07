<script setup lang="ts">
import type { Courier, CourierOffice } from '~/composables/useCourier'
import { normalize, transliterate } from '~/utils/text'

/** Searchable list of courier offices and lockers (combobox pattern). */
const props = defineProps<{ courier: Courier; invalid?: boolean; describedby?: string }>()
const model = defineModel<CourierOffice | null>({ required: true })

const { offices } = useCourier()
const all = ref<CourierOffice[]>([])
const loading = ref(false)
const failed = ref(false)
const query = ref('')
const open = ref(false)
const active = ref(0)
const listId = useId()
const inputId = useId()

async function load() {
  loading.value = true
  failed.value = false
  try {
    all.value = await offices(props.courier)
  } catch {
    failed.value = true
    all.value = []
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(
  () => props.courier,
  () => {
    model.value = null
    query.value = ''
    load()
  },
)

const matches = computed(() => {
  const q = normalize(query.value)
  if (q.length < 2) return []
  const terms = q.split(' ').filter(Boolean)
  return all.value
    .filter((o) => {
      const hay = normalize(`${o.city} ${o.name} ${o.address} ${o.postCode}`)
      const lat = transliterate(hay)
      return terms.every((t) => hay.includes(t) || lat.includes(transliterate(t)))
    })
    .slice(0, 40)
})

function choose(o: CourierOffice) {
  model.value = o
  query.value = ''
  open.value = false
}
function onKey(e: KeyboardEvent) {
  if (!matches.value.length) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    open.value = true
    active.value = (active.value + 1) % matches.value.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    active.value = (active.value - 1 + matches.value.length) % matches.value.length
  } else if (e.key === 'Enter' && open.value) {
    e.preventDefault()
    choose(matches.value[active.value]!)
  } else if (e.key === 'Escape') {
    open.value = false
  }
}
watch(query, () => {
  active.value = 0
  open.value = true
})
</script>

<template>
  <div class="op">
    <div v-if="model" class="op__chosen">
      <AppIcon :name="model.locker ? 'package' : 'home'" />
      <span>
        <strong>{{ model.name }}</strong>
        <small>{{ model.address || model.city }}<template v-if="model.locker"> · автомат</template></small>
      </span>
      <button type="button" class="btn btn--ghost btn--sm" @click="model = null">Смени</button>
    </div>
    <template v-else>
      <label :for="inputId" class="op__label">Търси офис или автомат <span class="req" aria-hidden="true">*</span></label>
      <input
        :id="inputId"
        v-model="query"
        class="input"
        type="search"
        role="combobox"
        autocomplete="off"
        placeholder="Град, квартал или име на офис"
        :aria-expanded="open && matches.length > 0"
        :aria-controls="listId"
        :aria-activedescendant="open && matches.length ? `${listId}-${active}` : undefined"
        :aria-invalid="invalid"
        :aria-describedby="describedby"
        @keydown="onKey"
        @focus="open = true"
      />
      <p v-if="loading" class="op__hint" role="status">Зареждане на офисите…</p>
      <p v-else-if="failed" class="op__hint" role="alert">
        Офисите не се заредиха. <button type="button" class="op__retry" @click="load">Опитай пак</button>
      </p>
      <p v-else-if="query.trim().length >= 2 && !matches.length" class="op__hint">Няма намерени офиси за „{{ query }}“.</p>
      <ul v-show="open && matches.length" :id="listId" class="op__list" role="listbox">
        <li
          v-for="(o, i) in matches"
          :id="`${listId}-${i}`"
          :key="o.id"
          role="option"
          :aria-selected="i === active"
          :class="{ 'is-active': i === active }"
          @mousedown.prevent="choose(o)"
        >
          <strong>{{ o.city }} — {{ o.name }}</strong>
          <small>{{ o.address }}<template v-if="o.locker"> · автомат</template></small>
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped lang="scss">
.op {
  position: relative;
  display: grid;
  gap: 8px;
}
.op__label {
  font-weight: 600;
}
.op__hint {
  font-size: 0.875rem;
  color: var(--muted);
}
.op__retry {
  padding: 0;
  border: 0;
  background: none;
  color: var(--purple-600);
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}
.op__list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 20;
  max-height: 320px;
  overflow-y: auto;
  margin: 0;
  padding: 6px;
  list-style: none;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--paper);
  box-shadow: 0 16px 40px rgb(35 16 63 / 14%);
  li {
    display: grid;
    gap: 2px;
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
    &.is-active,
    &:hover {
      background: var(--purple-100);
    }
  }
  small {
    color: var(--muted);
    font-size: 0.8125rem;
  }
}
.op__chosen {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1.5px solid var(--purple);
  border-radius: var(--r-md);
  background: var(--purple-100);
  svg {
    flex: none;
    color: var(--purple);
  }
  span {
    display: grid;
    flex: 1;
    min-width: 0;
  }
  small {
    color: var(--muted);
    font-size: 0.8125rem;
  }
}
</style>
