import type { Filament, FilamentId } from '~/types/catalog'

/** Display names and swatch colours (kept in sync with tools/render/lib.py → FILAMENT). */
export const filaments: Record<FilamentId, Filament> = {
  lilav: { id: 'lilav', name: 'Лилав', hex: '#4b2a86' },
  lavandula: { id: 'lavandula', name: 'Лавандула', hex: '#b8a4e3' },
  koral: { id: 'koral', name: 'Корал', hex: '#ee6b62' },
  praskova: { id: 'praskova', name: 'Праскова', hex: '#f6b49a' },
  mlechen: { id: 'mlechen', name: 'Млечнобял', hex: '#efe8dc' },
  pyasak: { id: 'pyasak', name: 'Пясък', hex: '#d9c3a1' },
  menta: { id: 'menta', name: 'Мента', hex: '#9ed2bf' },
  maslina: { id: 'maslina', name: 'Маслина', hex: '#7d8a5a' },
  grafit: { id: 'grafit', name: 'Графит', hex: '#3a3a40' },
  slance: { id: 'slance', name: 'Слънчев', hex: '#f2c14e' },
  nebe: { id: 'nebe', name: 'Небесно', hex: '#8fb8e6' },
  cherven: { id: 'cherven', name: 'Червен', hex: '#c8323a' },
  zlato: { id: 'zlato', name: 'Злато (сатен)', hex: '#c9a03a', finish: 'silk' },
  med: { id: 'med', name: 'Мед (сатен)', hex: '#b8693d', finish: 'silk' },
  sedef: { id: 'sedef', name: 'Седеф (сатен)', hex: '#efe9df', finish: 'silk' },
}

export const filamentOrder: FilamentId[] = [
  'lilav', 'lavandula', 'koral', 'praskova', 'cherven', 'slance', 'menta', 'nebe', 'maslina', 'pyasak', 'mlechen', 'grafit',
  'zlato', 'med', 'sedef',
]
