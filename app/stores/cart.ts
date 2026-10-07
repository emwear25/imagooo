import { defineStore } from 'pinia'
import { store as config } from '~/config/store'
import { productBySlug } from '~/data/products'
import type { CartLine, Product } from '~/types/catalog'

export const MAX_QTY = 20

export function lineKey(slug: string, variantId: string, personalization?: string): string {
  return [slug, variantId, (personalization ?? '').trim()].join('|')
}

export interface ResolvedLine extends CartLine {
  product: Product
  variantName: string
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
      return state.lines.flatMap((l) => {
        const product = productBySlug(l.slug)
        const variant = product?.variants.find((v) => v.id === l.variantId)
        if (!product || !variant) return []
        return [{ ...l, product, variantName: variant.name, lineTotalCents: product.priceCents * l.quantity }]
      })
    },
    count(): number {
      return this.resolved.reduce((n, l) => n + l.quantity, 0)
    },
    subtotalCents(): number {
      return this.resolved.reduce((n, l) => n + l.lineTotalCents, 0)
    },
  },

  actions: {
    add(slug: string, variantId: string, quantity = 1, personalization?: string) {
      if (!this.hydrated) this.load() // never overwrite a stored cart with an early click
      const text = personalization?.trim() || undefined
      const key = lineKey(slug, variantId, text)
      const existing = this.lines.find((l) => l.key === key)
      if (existing) {
        existing.quantity = Math.min(MAX_QTY, existing.quantity + quantity)
      } else {
        this.lines.push({ key, slug, variantId, quantity: Math.min(MAX_QTY, quantity), personalization: text, addedAt: Date.now() })
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
        this.lines = Array.isArray(parsed)
          ? parsed.filter((l) => productBySlug(l.slug)?.variants.some((v) => v.id === l.variantId))
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
