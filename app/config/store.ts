/**
 * Central store configuration.
 *
 * Imagoo is operated by the same company as emWear (Хас 93 ЕООД) and runs on the
 * shared emWear/Imagoo backend. Company details, couriers, payment methods and
 * the shipping rules mirror the live emwear.bg storefront (Client/ pages: terms,
 * privacy-policy, shipping, contact), confirmed by the owner on 2026-10-07.
 *
 * Settings still marked `pending` render an explicit „предстои“ placeholder.
 */

export type SettingStatus = 'confirmed' | 'pending'

export interface Setting<T> {
  value: T | null
  status: SettingStatus
  /** Internal note, never rendered to customers. */
  note?: string
}

const pending = <T>(note?: string): Setting<T> => ({ value: null, status: 'pending', note })
const confirmed = <T>(value: T, note?: string): Setting<T> => ({ value, status: 'confirmed', note })

// ---------------------------------------------------------------------------
// Imagoo storefront settings
// ---------------------------------------------------------------------------
export const store = {
  brand: {
    name: 'Imagoo',
    legalDisplayName: 'imagoo',
    tagline: 'Въображение, което влиза в ежедневието.',
  },

  site: {
    url: 'https://imagoo.bg',
    /** Demo build: keep `true` until launch. Controls banners and robots meta. */
    isDemo: true,
    locale: 'bg-BG',
    ogImage: '/images/brand/og-image.png',
  },

  /** Bulgaria uses the euro since 2026 - prices are shown in EUR only. */
  currency: {
    code: 'EUR',
    locale: 'bg-BG',
  },

  company: {
    legalName: confirmed('Хас 93 ЕООД'),
    eik: confirmed('207849969'),
    vatNumber: pending<string>('Регистрирано по ДДС (emwear.bg показва цени с 20% ДДС), но номерът не е публикуван.'),
    registeredAddress: confirmed('гр. Варна, ул. „Арх. Георги Ганев“ 37, мол „Хасан Хасанов“'),
    email: confirmed('info@imagoo.bg', 'Също подател на имейлите от сървъра (IMAGOO_FROM_EMAIL). Пощенската кутия трябва да съществува.'),
    phone: confirmed('+359 89 092 7520'),
    phoneHref: 'tel:+359890927520',
    hours: confirmed('Пон–Пет 9:00–18:00, Съб 10:00–14:00'),
    returnAddress: pending<string>('Не е публикуван и за emWear; адресът се съобщава при заявка за връщане.'),
  },

  shipping: {
    couriers: confirmed(['Еконт', 'Спиди']),
    methods: confirmed(['до офис на куриер', 'до адрес', 'до автомат на Еконт']),
    /** The courier fee is calculated by Econt/Speedy at checkout and paid to the courier on delivery. */
    fees: confirmed('изчислява се автоматично според куриера, офиса или адреса и теглото и се заплаща на куриера при получаване'),
    /** Same rule as the shared backend (orderService.calculateShipping). */
    freeShippingThresholdEur: 60,
    freeShippingThreshold: confirmed('над €60'),
    /** Indicative production time for in-stock designs, in working days. */
    productionDays: { min: 2, max: 4, status: 'pending' as SettingStatus },
    personalizedExtraDays: { min: 1, max: 2, status: 'pending' as SettingStatus },
    deliveryDays: { min: 1, max: 3, status: 'confirmed' as SettingStatus },
  },

  payments: {
    methods: confirmed([
      'наложен платеж (плащаш на куриера при получаване)',
      'онлайн с карта — Visa, Mastercard, Maestro, Apple Pay и Google Pay чрез Stripe',
    ]),
  },

  returns: {
    /** Statutory withdrawal period for distance contracts (to be confirmed by legal review). */
    withdrawalDays: 14,
  },

  storage: {
    cartKey: 'imagoo-cart-v1',
    wishlistKey: 'imagoo-wishlist-v1',
  },
} as const

export type StoreConfig = typeof store
