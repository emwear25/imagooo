import type { CategorySlug, FilamentId, Product, ProductImage } from '~/types/catalog'
import { normalize, transliterate } from './text'

export const IMAGE_WIDTHS = [480, 800, 1200] as const

/** Images for a product variant: the variant's own shots first, then the remaining angles of the default colour. */
export function productImages(product: Product, variantId?: string): (ProductImage & { variantId: string })[] {
  const byVariant = product.images
  const vid = variantId && byVariant[variantId]?.length ? variantId : product.variants[0]!.id
  const own = (byVariant[vid] ?? []).map((i) => ({ ...i, variantId: vid }))
  const def = product.variants[0]!.id
  const extra =
    vid === def ? [] : (byVariant[def] ?? []).filter((i) => !own.some((o) => o.src === i.src) && i.view !== 'hero').map((i) => ({ ...i, variantId: def }))
  return [...own, ...extra]
}

export function primaryImage(product: Product, variantId?: string) {
  return productImages(product, variantId)[0]
}

/** Image for tinted tiles and thumbnails (the product's main photo). */
export function cutoutImage(product: Product): ProductImage | undefined {
  return primaryImage(product)
}

/** Cloudinary delivery URL resized to `width` (auto format/quality). */
function cloudinaryAt(url: string, width: number): string | null {
  const i = url.indexOf('/image/upload/')
  if (!url.includes('res.cloudinary.com') || i < 0) return null
  const at = i + '/image/upload/'.length
  return `${url.slice(0, at)}w_${width},c_limit,f_auto,q_auto/${url.slice(at)}`
}

/** URL of an image at (about) the given width. */
export function imageUrl(image: ProductImage, width: (typeof IMAGE_WIDTHS)[number] = 800): string {
  if (!image.remote) return `${image.src}-${width}.webp`
  return cloudinaryAt(image.src, width) ?? image.src
}

/** Responsive srcset, or undefined when the image only exists in one size. */
export function srcset(image: ProductImage): string | undefined {
  if (image.remote && !cloudinaryAt(image.src, 480)) return undefined
  return IMAGE_WIDTHS.map((w) => `${imageUrl(image, w)} ${w}w`).join(', ')
}

export function inCategory(p: Product, slug: CategorySlug): boolean {
  return p.category === slug || (p.alsoIn ?? []).includes(slug)
}

export function productFilaments(p: Product): Set<FilamentId> {
  return new Set(p.variants.flatMap((v) => v.filaments))
}

/** Lightweight relevance search across name, tagline, tags and transliterated slug. */
export function searchProducts(query: string, list: Product[]): Product[] {
  const q = normalize(query)
  if (!q) return list
  const terms = q.split(' ').filter(Boolean)
  const scored = list
    .map((p) => {
      const name = normalize(p.name)
      const hay = normalize([p.name, p.tagline, p.tags.join(' '), p.highlights.join(' ')].join(' '))
      const lat = `${p.slug} ${transliterate(p.name)} ${p.tags.map(transliterate).join(' ')}`
      let score = 0
      for (const t of terms) {
        const tl = transliterate(t)
        if (name.includes(t)) score += 6
        else if (hay.includes(t)) score += 3
        else if (lat.includes(t) || lat.includes(tl)) score += 2
        else if (t.length >= 4 && hay.includes(t.slice(0, -1))) score += 1 // simple stem: „вази“ → „ваз“
        else return { p, score: 0 }
      }
      return { p, score }
    })
    .filter((r) => r.score > 0)
  return scored.sort((a, b) => b.score - a.score || a.p.rank - b.p.rank).map((r) => r.p)
}

export type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recommended', label: 'Препоръчани' },
  { value: 'price-asc', label: 'Цена: от ниска към висока' },
  { value: 'price-desc', label: 'Цена: от висока към ниска' },
  { value: 'name-asc', label: 'Име: А–Я' },
  { value: 'name-desc', label: 'Име: Я–А' },
]

const collator = new Intl.Collator('bg')

export function sortProducts(list: Product[], key: SortKey): Product[] {
  const out = [...list]
  switch (key) {
    case 'price-asc': return out.sort((a, b) => a.priceCents - b.priceCents || collator.compare(a.name, b.name))
    case 'price-desc': return out.sort((a, b) => b.priceCents - a.priceCents || collator.compare(a.name, b.name))
    case 'name-asc': return out.sort((a, b) => collator.compare(a.name, b.name))
    case 'name-desc': return out.sort((a, b) => collator.compare(b.name, a.name))
    default: return out.sort((a, b) => a.rank - b.rank || collator.compare(a.name, b.name))
  }
}

export interface PriceBand { id: string; label: string; min: number; max: number }

export const PRICE_BANDS: PriceBand[] = [
  { id: 'do-10', label: 'До 10 €', min: 0, max: 999 },
  { id: '10-20', label: '10 – 20 €', min: 1000, max: 1999 },
  { id: '20-30', label: '20 – 30 €', min: 2000, max: 2999 },
  { id: 'nad-30', label: 'Над 30 €', min: 3000, max: Number.POSITIVE_INFINITY },
]

/** Related: same category first, then shared tags. */
export function relatedProducts(p: Product, products: Product[], limit = 4): Product[] {
  return products
    .filter((o) => o.slug !== p.slug)
    .map((o) => ({
      o,
      s: (o.category === p.category ? 5 : 0) + (inCategory(o, p.category) ? 2 : 0) + o.tags.filter((t) => p.tags.includes(t)).length,
    }))
    .sort((a, b) => b.s - a.s || a.o.rank - b.o.rank)
    .slice(0, limit)
    .map((r) => r.o)
}
