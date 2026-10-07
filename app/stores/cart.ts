import { defineStore } from 'pinia'
import { store as config } from '~/config/store'
import { useCatalogStore } from '~/stores/catalog'
import type { CartLine, ColorVariant, Product, SizeOption } from '~/types/catalog'

export const MAX_QTY = 20

export function lineKey(slug: string, variantId: string, personalization?: string, size?: string): string {
  return [slug, variantId, (personalization ?? '').trim(), ...(size ? [size] : [])].join('|')
}

/** The size a line refers to; lines without one (or with a stale one) get the first size. */
function lineSize(product: Product, size?: string): SizeOption | undefined {
  return product.sizes && (product.sizes.find((s) => s.id === size) ?? product.sizes[0])
}

export interface ResolvedLine extends CartLine {
  product: Product
  variant: ColorVariant
  /** Colour, plus the size for products with several sizes. */
  variantName: string
  /** Backend size for the order, and its display name. */
  sizeId?: string
  sizeName?: string
  unitCents: number
  lineTotalCents: number
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    lines: [] as CartLine[],
    /** False until browser storage has been read (avoids hydration mismatches). */
    hydrated: false,
  }),

  getters: {
    resolved(state): ResolvedLine[] {
      const catalog = useCatalogStore()
      return state.lines.flatMap((l) => {
        const product = catalog.bySlug(l.slug)
        const variant = product?.variants.find((v) => v.id === l.variantId)
        if (!product || !variant) return []
        const size = lineSize(product, l.size)
        const unitCents = size?.priceCents ?? product.priceCents
        return [{
          ...l,
          product,
          variant,
          variantName: size ? `${size.name} · ${variant.name}` : variant.name,
          sizeId: size?.id,
          sizeName: size?.name,
          unitCents,
          lineTotalCents: unitCents * l.quantity,
        }]
      })
    },
    /** Lines whose colour is out of stock in the backend. */
    unavailable(): ResolvedLine[] {
      return this.resolved.filter((l) => l.variant.available === false)
    },
    count(): number {
      return this.resolved.reduce((n, l) => n + l.quantity, 0)
    },
    subtotalCents(): number {
      return this.resolved.reduce((n, l) => n + l.lineTotalCents, 0)
    },
  },

  actions: {
    add(slug: string, variantId: string, quantity = 1, personalization?: string, size?: string) {
      if (!this.hydrated) this.load() // never overwrite a stored cart with an early click
      const text = personalization?.trim() || undefined
      const key = lineKey(slug, variantId, text, size)
      const existing = this.lines.find((l) => l.key === key)
      if (existing) {
        existing.quantity = Math.min(MAX_QTY, existing.quantity + quantity)
      } else {
        this.lines.push({ key, slug, variantId, size, quantity: Math.min(MAX_QTY, quantity), personalization: text, addedAt: Date.now() })
      }
      this.persist()
    },
    setQuantity(key: string, quantity: number) {
      const line = this.lines.find((l) => l.key === key)
      if (!line) return
      line.quantity = Math.max(1, Math.min(MAX_QTY, Math.round(quantity) || 1))
      this.persist()
    },
    remove(key: string) {
      this.lines = this.lines.filter((l) => l.key !== key)
      this.persist()
    },
    clear() {
      this.lines = []
      this.persist()
    },
    load() {
      if (!import.meta.client) return
      try {
        const raw = localStorage.getItem(config.storage.cartKey)
        const parsed = raw ? (JSON.parse(raw) as CartLine[]) : []
        // keep only lines that still match the catalogue
        const catalog = useCatalogStore()
        this.lines = Array.isArray(parsed)
          ? parsed.filter((l) => catalog.bySlug(l.slug)?.variants.some((v) => v.id === l.variantId))
          : []
      } catch {
        this.lines = []
      }
      this.hydrated = true
    },
    persist() {
      if (!import.meta.client) return
      try {
        localStorage.setItem(config.storage.cartKey, JSON.stringify(this.lines))
      } catch {
        /* storage full or blocked: cart still works for this session */
      }
    },
  },
})
