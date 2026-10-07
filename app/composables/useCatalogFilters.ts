import { filaments, filamentOrder } from '~/data/filaments'
import type { CategorySlug, FilamentId, Product } from '~/types/catalog'
import {
  PRICE_BANDS,
  SORT_OPTIONS,
  inCategory,
  productFilaments,
  searchProducts,
  sortProducts,
  type SortKey,
} from '~/utils/catalog'

type Group = 'category' | 'price' | 'color' | 'personal' | 'q'

export interface ActiveChip {
  key: string
  label: string
  remove: () => void
}

const list = (v: unknown): string[] =>
  (Array.isArray(v) ? v.join(',') : typeof v === 'string' ? v : '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

/**
 * Catalogue filter state backed by the URL query (shareable, back-button friendly).
 * Query keys: q, kategoriya, cena, cvyat, ime=1, sort.
 */
export function useCatalogFilters(fixedCategory?: CategorySlug) {
  const route = useRoute()
  const router = useRouter()
  const { products, categories } = useCatalog()

  const q = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))
  const cats = computed(() => list(route.query.kategoriya).filter((c) => categories.value.some((x) => x.slug === c)) as CategorySlug[])
  const prices = computed(() => list(route.query.cena).filter((c) => PRICE_BANDS.some((b) => b.id === c)))
  const colors = computed(() => list(route.query.cvyat).filter((c) => c in filaments) as FilamentId[])
  const personal = computed(() => route.query.ime === '1')
  const sort = computed<SortKey>(() => {
    const s = route.query.sort
    return SORT_OPTIONS.some((o) => o.value === s) ? (s as SortKey) : 'recommended'
  })

  function update(patch: Record<string, string | string[] | null>) {
    const next: Record<string, string> = {}
    for (const [k, v] of Object.entries({ ...route.query })) if (typeof v === 'string') next[k] = v
    for (const [k, v] of Object.entries(patch)) {
      const val = Array.isArray(v) ? v.join(',') : v
      if (val) next[k] = val
      else delete next[k]
    }
    router.replace({ query: next })
  }

  const toggleIn = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  function apply(list: Product[], skip?: Group): Product[] {
    let out = fixedCategory ? list.filter((p) => inCategory(p, fixedCategory)) : list
    if (skip !== 'q' && q.value.trim()) out = searchProducts(q.value, out)
    if (skip !== 'category' && cats.value.length) out = out.filter((p) => cats.value.some((c) => inCategory(p, c)))
    if (skip !== 'price' && prices.value.length) {
      const bands = PRICE_BANDS.filter((b) => prices.value.includes(b.id))
      out = out.filter((p) => bands.some((b) => p.priceCents >= b.min && p.priceCents <= b.max))
    }
    if (skip !== 'color' && colors.value.length) {
      out = out.filter((p) => {
        const f = productFilaments(p)
        return colors.value.some((c) => f.has(c))
      })
    }
    if (skip !== 'personal' && personal.value) out = out.filter((p) => !!p.personalization)
    return out
  }

  const results = computed(() => {
    const filtered = apply(products.value)
    // keep search relevance order unless the user picked a sort
    return q.value.trim() && sort.value === 'recommended' ? filtered : sortProducts(filtered, sort.value)
  })

  const facets = computed(() => {
    const byCat = apply(products.value, 'category')
    const byPrice = apply(products.value, 'price')
    const byColor = apply(products.value, 'color')
    const byPersonal = apply(products.value, 'personal')
    return {
      categories: categories.value
        .filter((c) => !fixedCategory || c.slug === fixedCategory)
        .map((c) => ({ ...c, count: byCat.filter((p) => inCategory(p, c.slug)).length })),
      prices: PRICE_BANDS.map((b) => ({ ...b, count: byPrice.filter((p) => p.priceCents >= b.min && p.priceCents <= b.max).length })),
      // Only palette colours that exist in the catalogue
      colors: filamentOrder
        .map((id) => ({ ...filaments[id], count: byColor.filter((p) => productFilaments(p).has(id)).length }))
        .filter((c) => c.count > 0 || colors.value.includes(c.id)),
      personal: byPersonal.filter((p) => !!p.personalization).length,
    }
  })

  const chips = computed<ActiveChip[]>(() => {
    const out: ActiveChip[] = []
    if (q.value.trim()) out.push({ key: 'q', label: `„${q.value.trim()}“`, remove: () => update({ q: null }) })
    for (const c of cats.value)
      out.push({ key: `c-${c}`, label: categories.value.find((x) => x.slug === c)?.name ?? c, remove: () => update({ kategoriya: cats.value.filter((x) => x !== c) }) })
    for (const p of prices.value)
      out.push({ key: `p-${p}`, label: PRICE_BANDS.find((b) => b.id === p)!.label, remove: () => update({ cena: prices.value.filter((x) => x !== p) }) })
    for (const c of colors.value)
      out.push({ key: `col-${c}`, label: filaments[c].name, remove: () => update({ cvyat: colors.value.filter((x) => x !== c) }) })
    if (personal.value) out.push({ key: 'ime', label: 'С персонализация', remove: () => update({ ime: null }) })
    return out
  })

  const filterCount = computed(() => cats.value.length + prices.value.length + colors.value.length + (personal.value ? 1 : 0))

  return {
    q,
    cats,
    prices,
    colors,
    personal,
    sort,
    results,
    facets,
    chips,
    filterCount,
    setQuery: (v: string) => update({ q: v.trim() || null }),
    toggleCategory: (c: string) => update({ kategoriya: toggleIn(cats.value, c) }),
    togglePrice: (b: string) => update({ cena: toggleIn(prices.value, b) }),
    toggleColor: (c: string) => update({ cvyat: toggleIn(colors.value, c) }),
    setPersonal: (on: boolean) => update({ ime: on ? '1' : null }),
    setSort: (s: SortKey) => update({ sort: s === 'recommended' ? null : s }),
    clearAll: () => update({ q: null, kategoriya: null, cena: null, cvyat: null, ime: null }),
  }
}

export type CatalogFilters = ReturnType<typeof useCatalogFilters>
