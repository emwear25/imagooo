export type CategorySlug =
  | 'dom-i-dekoraciya'
  | 'kuhnya-i-organizaciya'
  | 'igrachki-i-zabavlenie'
  | 'aksesoari-i-klyuchodarzhateli'
  | 'praktichni-resheniya'
  | 'personalizirani-podaraci'
  | 'komplekti-za-igra'
  | 'skulpturi-i-art'
  | 'praznici-i-sezoni'

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
  view: 'hero' | 'side' | 'top'
  /** Path without size suffix; files exist as `${src}-{480|800|1200}.webp`. */
  src: string
  width: number
  height: number
}

export interface ColorVariant {
  id: string
  name: string
  /** One or more filament ids shown as the swatch. */
  filaments: FilamentId[]
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
  /** Demo price in euro cents. */
  priceCents: number
  variants: ColorVariant[]
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
}

export interface CartLine {
  /** Stable key: product + variant + personalization. */
  key: string
  slug: string
  variantId: string
  quantity: number
  personalization?: string
  addedAt: number
}
