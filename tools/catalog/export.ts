/**
 * Export the Imagoo demo catalogue (app/data) as a seed file for the shared
 * backend: server/scripts/seed-imagoo-catalog.js imports it into the
 * "imagoo" store.
 *
 *   npx tsx tools/catalog/export.ts            # writes tools/catalog/catalog.json
 *
 * Images stay as static files of the storefront (public/images/products); the
 * seed stores their absolute URLs (--image-base, default https://imagoo.bg).
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { categories } from '../../app/data/categories'
import { filaments } from '../../app/data/filaments'
import { products } from '../../app/data/products'
import manifest from '../../app/data/generated/product-images.json'
import type { ProductImage } from '../../app/types/catalog'

const images = manifest as Record<string, Record<string, ProductImage[]>>
const STANDARD_SIZE = 'Стандартен'
const MADE_TO_ORDER_STOCK = 999

const swatchFor = (id: keyof typeof filaments) => {
  const f = filaments[id]
  return f.finish === 'silk' ? `silk:${f.hex}` : f.hex
}

// Product images: the variant's own shots, file pattern <src>-1200.webp
const imageRefs = (slug: string, variantId: string) =>
  (images[slug]?.[variantId] ?? []).map((img) => ({
    path: `${img.src}-1200.webp`,
    publicId: `imagoo-static:${img.src.replace('/images/products/', '')}`,
  }))

const out = {
  exportedAt: new Date().toISOString(),
  categories: categories.map((c, i) => ({
    slug: c.slug,
    name: c.name,
    displayName: c.name,
    order: i,
  })),
  products: products.map((p) => {
    const def = p.variants[0]!
    return {
      slug: p.slug,
      name: p.name,
      description: p.description.join('\n\n'),
      price: p.priceCents / 100,
      categorySlug: p.category,
      sizes: [STANDARD_SIZE],
      colors: p.variants.map((v) => ({ name: v.name, hex: filaments[v.filaments[0]!].hex })),
      variants: p.variants.map((v) => ({ size: STANDARD_SIZE, color: v.name, stock: MADE_TO_ORDER_STOCK })),
      images: imageRefs(p.slug, def.id),
      colorImages: p.variants
        .map((v) => ({ color: v.name, images: imageRefs(p.slug, v.id) }))
        .filter((c) => c.images.length > 0),
      storefront: {
        tagline: p.tagline,
        highlights: p.highlights,
        specs: { ...p.specs, care: p.specs.care ?? [] },
        notice: p.notice ?? '',
        propsNote: p.propsNote ?? '',
        badges: p.badges,
        tags: p.tags,
        featured: !!p.featured,
        everyday: !!p.everyday,
        rank: p.rank,
        alsoInSlugs: p.alsoIn ?? [],
        personalization: p.personalization ?? null,
        design: p.design ?? null,
        colorSwatches: p.variants.map((v) => ({ color: v.name, swatches: v.filaments.map(swatchFor) })),
      },
    }
  }),
}

const target = join(dirname(fileURLToPath(import.meta.url)), 'catalog.json')
writeFileSync(target, JSON.stringify(out, null, 1))
console.log(`Exported ${out.categories.length} categories and ${out.products.length} products → ${target}`)
