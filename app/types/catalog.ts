/** Category slug. Categories come from the backend, so any slug is possible. */
export type CategorySlug = string

/** Filament colours used across the catalogue (ids shared with the render pipeline). */
export type FilamentId =
  | 'lilav' | 'lavandula' | 'koral' | 'praskova' | 'mlechen' | 'pyasak'
  | 'menta' | 'maslina' | 'grafit' | 'slance' | 'nebe'
  | 'cherven' | 'zlato' | 'med' | 'sedef'

export interface Filament {
  id: FilamentId
  name: string
  hex: string
  /** Satin ("silk") filaments get a sheen in swatches. */
  finish?: 'silk'
}

export interface Category {
  slug: CategorySlug
  name: string
  short: string
  intro: string
  /** Light background accent for tiles and headers. */
  tint: string
  /** Product slugs used to compose the category artwork. */
  showcase: string[]
  seoDescription: string
}

export interface ProductImage {
  view: string
  /**
   * Local storefront image: path without size suffix, files exist as `${src}-{480|800|1200}.webp`.
   * Remote image (`remote: true`, e.g. Cloudinary upload from the dashboard): the full URL.
   */
  src: string
  width: number
  height: number
  remote?: boolean
}

/** One colour in a swatch; satin filaments get a sheen. */
export interface Swatch {
  hex: string
  silk?: boolean
}

export interface ColorVariant {
  /** Stable id: the colour name in the backend (also used in the cart). */
  id: string
  name: string
  /** Colours shown in the swatch (multi-colour prints have several). */
  swatches: Swatch[]
  /** Palette filaments matching the swatch colours (used by the colour filter). */
  filaments: FilamentId[]
  /** Backend size of this colour's variant (orders need size + colour). */
  size?: string
  /** False when the backend variant is out of stock. */
  available?: boolean
}

/** A size the customer chooses (e.g. small / medium / large vase), with its own price. */
export interface SizeOption {
  /** Backend size name (orders need size + colour). */
  id: string
  name: string
  /** Price in euro cents for this size. */
  priceCents: number
}

export interface PersonalizationField {
  label: string
  placeholder: string
  help: string
  maxLength: number
  required: boolean
}

export interface ProductSpecs {
  dimensions?: string
  material?: string
  weight?: string
  includes?: string
  care?: string[]
}

/** Third-party design used under a licence that permits selling prints (CC0 / CC BY / CC BY-SA). */
export interface DesignSource {
  title: string
  designer: string
  platform: 'MakerWorld' | 'Printables' | 'Thingiverse' | 'Cults3D' | 'MyMiniFactory' | 'Thangs'
  url: string
  /** Licence exactly as shown on the source page. */
  license: string
  licenseUrl: string
  /** Date the licence was checked (YYYY-MM-DD). */
  checkedOn: string
  /** Extra credit lines, e.g. original designer of a remix. */
  note?: string
}

export type ProductBadge = 'new' | 'personalizable' | 'set' | 'picked'

export interface Product {
  /** Backend product id (used for orders). */
  id: string
  slug: string
  name: string
  /** Short line under the name. */
  tagline: string
  description: string[]
  highlights: string[]
  category: CategorySlug
  /** Additional categories the product is also listed in. */
  alsoIn?: CategorySlug[]
  /** Price in euro cents (after any active discount). */
  priceCents: number
  /** Price before discount, when the product is on sale. */
  compareAtCents?: number
  variants: ColorVariant[]
  /**
   * Sizes to choose from, when the product comes in several (each with its own
   * price). `priceCents` is then the lowest of them ("from" price in listings).
   */
  sizes?: SizeOption[]
  personalization?: PersonalizationField
  specs: ProductSpecs
  /** Customer-facing caveat (e.g. not tested for food contact). */
  notice?: string
  /** What the photo shows that is not part of the product. */
  propsNote?: string
  badges: ProductBadge[]
  tags: string[]
  featured?: boolean
  everyday?: boolean
  /** Lower = earlier in the "recommended" sort. */
  rank: number
  /** Set when the design comes from a community designer (attribution shown on the product page). */
  design?: DesignSource
  /** Images per variant id. */
  images: Record<string, ProductImage[]>
}

export interface CartLine {
  /** Stable key: product + variant + size + personalization. */
  key: string
  slug: string
  variantId: string
  /** Chosen size id, for products with several sizes. */
  size?: string
  quantity: number
  personalization?: string
  addedAt: number
}

