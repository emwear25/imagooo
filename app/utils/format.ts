import { store } from '~/config/store'

const primary = new Intl.NumberFormat(store.currency.locale, {
  style: 'currency',
  currency: store.currency.code,
  minimumFractionDigits: 2,
})

/** Format a price in cents using the configured base currency (e.g. „24,90 €“). */
export function formatPrice(cents: number): string {
  return primary.format(cents / 100)
}

/** Bulgarian plural for product counts: 1 продукт, 2 продукта. */
export function pluralProducts(n: number): string {
  return `${n} ${n === 1 ? 'продукт' : 'продукта'}`
}

export function pluralItems(n: number): string {
  return `${n} ${n === 1 ? 'артикул' : 'артикула'}`
}

/** Days range, e.g. „2–4 работни дни“. */
export function formatDays(min: number, max: number): string {
  return min === max ? `${min} работни дни` : `${min}–${max} работни дни`
}
