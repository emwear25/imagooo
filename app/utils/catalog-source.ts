/**
 * Turn backend data (shared emWear/Imagoo API, store "imagoo") into the
 * storefront's catalogue types. All products come from the backend.
 */
import { categoryPresets } from '~/data/categories'
import { filaments } from '~/data/filaments'
import type { Category, ColorVariant, FilamentId, Product, ProductBadge, ProductImage, Swatch } from '~/types/catalog'

export interface Catalog {
  products: Product[]
  categories: Category[]
}

const LOCAL_IMAGE = /\/images\/products\/(.+)-(?:480|800|1200)\.webp$/
const RENDER_SIZE = { width: 1200, height: 1500 }

const NEUTRAL_TINTS = ['#efe9fa', '#fde9e4', '#e7f3ee', '#fdf3dc', '#e6f0fb']

const filamentByHex = new Map(Object.values(filaments).map((f) => [f.hex.toLowerCase(), f.id]))

/** Swatch strings from the backend: "#hex" or "silk:#hex". */
function parseSwatch(raw: string): Swatch {
  const silk = raw.startsWith('silk:')
  return { hex: silk ? raw.slice(5) : raw, silk }
}

function swatchFilaments(swatches: Swatch[]): FilamentId[] {
  return swatches.map((s) => filamentByHex.get(s.hex.toLowerCase())).filter((f): f is FilamentId => !!f)
}

// ---------------------------------------------------------------- API

interface ApiImage {
  url: string
  publicId?: string
}
interface ApiCategory {
  _id: string
  name: string
  slug: string
  displayName?: string
  order?: number
  isActive?: boolean
  imageUrl?: string | null
}
interface ApiVariant {
  size: string
  color: string
  stock: number
  reserved?: number
}
export interface ApiProduct {
  _id: string
  slug?: string
  name: string
  description: string
  price: number
  originalPrice?: number
  compareAt?: number | null
  category: ApiCategory | string
  sizes?: string[]
  colors?: { name: string; hex?: string }[]
  variants?: ApiVariant[]
  stock?: number
  images?: ApiImage[]
  colorImages?: { color: string; images: ApiImage[] }[]
  isActive?: boolean
  storefront?: {
    tagline?: string
    highlights?: string[]
    specs?: { dimensions?: string; material?: string; weight?: string; includes?: string; care?: string[] }
    notice?: string
    propsNote?: string
    badges?: string[]
    tags?: string[]
    featured?: boolean
    everyday?: boolean
    rank?: number
    alsoIn?: string[]
    personalization?: Product['personalization'] | null
    design?: Product['design'] | null
    colorSwatches?: { color: string; swatches: string[] }[]
  }
  createdAt?: string
}

const VIEWS = ['hero', 'side', 'top']

/** Backend image → storefront image (local renders get a responsive srcset). */
export function toProductImage(img: ApiImage, index: number): ProductImage {
  const local = img.url.match(LOCAL_IMAGE)
  const view = VIEWS[index] ?? `view-${index}`
  if (local) return { view, src: `/images/products/${local[1]}`, ...RENDER_SIZE }
  return { view, src: img.url, ...RENDER_SIZE, remote: true }
}

const cents = (eur: number | null | undefined) => Math.round((eur ?? 0) * 100)

export function mapApiCatalog(apiCategories: ApiCategory[], apiProducts: ApiProduct[]): Catalog {
  const presetBySlug = new Map(categoryPresets.map((c) => [c.slug, c]))
  const slugById = new Map(apiCategories.map((c) => [c._id, c.slug]))

  const products: Product[] = apiProducts
    .filter((p) => p.slug && p.isActive !== false && typeof p.category === 'object')
    .map((p, index) => {
      const sf = p.storefront ?? {}
      const category = p.category as ApiCategory
      const swatchesByColor = new Map((sf.colorSwatches ?? []).map((c) => [c.color, c.swatches]))
      const colors = p.colors?.length ? p.colors : [{ name: 'Стандартен', hex: '#efe8dc' }]

      const variants: ColorVariant[] = colors.map((c) => {
        const swatches = (swatchesByColor.get(c.name) ?? [c.hex ?? '#9ca3af']).map(parseSwatch)
        const backendVariant = p.variants?.find((v) => v.color === c.name)
        const available = backendVariant
          ? backendVariant.stock - (backendVariant.reserved ?? 0) > 0
          : (p.variants?.length ?? 0) === 0 && (p.stock ?? 0) > 0
        return {
          id: c.name,
          name: c.name,
          swatches,
          filaments: swatchFilaments(swatches),
          size: backendVariant?.size ?? p.sizes?.[0],
          available,
        }
      })

      const shared = (p.images ?? []).map(toProductImage)
      const images: Record<string, ProductImage[]> = {}
      for (const v of variants) {
        const own = p.colorImages?.find((c) => c.color === v.id)?.images ?? []
        images[v.id] = own.length ? own.map(toProductImage) : shared
      }

      const original = p.originalPrice && p.originalPrice > p.price ? p.originalPrice : undefined

      return {
        id: p._id,
        slug: p.slug!,
        name: p.name,
        tagline: sf.tagline ?? '',
        description: p.description.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean),
        highlights: sf.highlights ?? [],
        category: category.slug,
        alsoIn: (sf.alsoIn ?? []).map((id) => slugById.get(id)).filter((s): s is string => !!s),
        priceCents: cents(p.price),
        compareAtCents: original ? cents(original) : undefined,
        variants,
        personalization: sf.personalization ?? undefined,
        specs: { ...sf.specs, care: sf.specs?.care?.length ? sf.specs.care : undefined },
        notice: sf.notice || undefined,
        propsNote: sf.propsNote || undefined,
        badges: (sf.badges ?? []) as ProductBadge[],
        tags: sf.tags ?? [],
        featured: sf.featured,
        everyday: sf.everyday,
        rank: sf.rank ?? 100 + index,
        design: sf.design ?? undefined,
        images,
      }
    })

  const usedSlugs = new Set(products.flatMap((p) => [p.category, ...(p.alsoIn ?? [])]))
  const categories: Category[] = apiCategories
    .filter((c) => c.isActive !== false && usedSlugs.has(c.slug))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((c, i) => {
      const preset = presetBySlug.get(c.slug)
      const name = c.displayName || c.name
      const inCat = products.filter((p) => p.category === c.slug).sort((a, b) => a.rank - b.rank)
      return {
        slug: c.slug,
        name,
        short: preset?.short ?? `Продукти от категория „${name}“.`,
        intro: preset?.intro ?? `Разгледай продуктите от категория „${name}“, изработени с 3D печат.`,
        tint: preset?.tint ?? NEUTRAL_TINTS[i % NEUTRAL_TINTS.length]!,
        showcase: inCat.slice(0, 3).map((p) => p.slug),
        seoDescription: preset?.seoDescription ?? `${name} — 3D принтирани продукти от Imagoo.`,
      }
    })

  return { products, categories }
}
