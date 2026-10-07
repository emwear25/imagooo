import { store } from '~/config/store'

interface SeoInput {
  title: string
  description: string
  image?: string
  /** Override canonical path (defaults to current route path without query). */
  path?: string
  type?: 'website' | 'article' | 'product'
}

/**
 * Page metadata with canonical URLs prepared for imagoo.bg.
 * Robots stay `noindex` while `store.site.isDemo` is true.
 * No structured data is emitted for demo prices/availability on purpose.
 */
export function useSeo(input: SeoInput | (() => SeoInput)) {
  const route = useRoute()
  const data = computed(() => (typeof input === 'function' ? input() : input))
  const canonical = computed(() => store.site.url + (data.value.path ?? route.path).replace(/\/$/, ''))
  const image = computed(() => store.site.url + (data.value.image ?? store.site.ogImage))

  useSeoMeta({
    title: () => data.value.title,
    description: () => data.value.description,
    ogTitle: () => `${data.value.title} · ${store.brand.name}`,
    ogDescription: () => data.value.description,
    ogType: () => (data.value.type === 'product' ? 'website' : data.value.type ?? 'website'),
    ogUrl: () => canonical.value,
    ogImage: () => image.value,
    ogLocale: 'bg_BG',
    ogSiteName: store.brand.name,
    twitterCard: 'summary_large_image',
    robots: store.site.isDemo ? 'noindex, nofollow' : 'index, follow',
  })
  useHead({
    link: [{ rel: 'canonical', href: () => canonical.value }],
  })
}
