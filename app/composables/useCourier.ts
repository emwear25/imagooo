/**
 * Couriers (Еконт / Спиди) through the shared backend: office lists and
 * delivery price estimates. The courier fee is paid to the courier on delivery,
 * so the estimate is informational and not part of the order total.
 */
export type Courier = 'econt' | 'speedy'

export interface CourierOffice {
  /** Econt office code or Speedy office id. */
  id: string
  name: string
  city: string
  postCode: string
  address: string
  /** Parcel locker (Еконтомат / Speedy APT) instead of a staffed office. */
  locker: boolean
}

interface EcontOffice {
  code?: string
  id?: number
  name?: string
  isAPS?: boolean
  address?: { city?: { name?: string; postCode?: string }; fullAddress?: string }
}
interface SpeedyOffice {
  id: number
  name?: string
  type?: string
  address?: { siteName?: string; postCode?: string; fullAddressString?: string; localAddressString?: string }
}

const officeCache = new Map<Courier, Promise<CourierOffice[]>>()

function normalizeEcont(list: EcontOffice[]): CourierOffice[] {
  return list
    .filter((o) => o.code)
    .map((o) => ({
      id: String(o.code),
      name: o.name ?? `Офис ${o.code}`,
      city: o.address?.city?.name ?? '',
      postCode: o.address?.city?.postCode ?? '',
      address: o.address?.fullAddress ?? '',
      locker: !!o.isAPS,
    }))
}

function normalizeSpeedy(list: SpeedyOffice[]): CourierOffice[] {
  return list.map((o) => ({
    id: String(o.id),
    name: o.name ?? `Офис ${o.id}`,
    city: o.address?.siteName ?? '',
    postCode: o.address?.postCode ?? '',
    address: o.address?.fullAddressString ?? o.address?.localAddressString ?? '',
    locker: o.type === 'APT',
  }))
}

export interface EstimateInput {
  courier: Courier
  office?: CourierOffice | null
  city: string
  postCode: string
  street: string
  receiverName: string
  receiverPhone: string
  /** Amount collected by the courier (cash on delivery); 0 for card payments. */
  codEur: number
  weightKg: number
}

export function useCourier() {
  const api = useApi()

  function offices(courier: Courier): Promise<CourierOffice[]> {
    if (!officeCache.has(courier)) {
      const request =
        courier === 'econt'
          ? api<{ data: EcontOffice[] }>('/api/econt/offices').then((r) => normalizeEcont(r.data ?? []))
          : api<{ data: { all?: SpeedyOffice[] } }>('/api/speedy/offices').then((r) => normalizeSpeedy(r.data?.all ?? []))
      // a failed request is retried next time
      officeCache.set(courier, request.catch((e) => (officeCache.delete(courier), Promise.reject(e))))
    }
    return officeCache.get(courier)!
  }

  /** Delivery price in EUR, or null when the courier could not price it. */
  async function estimate(input: EstimateInput): Promise<number | null> {
    const dimensions = { length: 30, width: 20, height: 15 }
    try {
      if (input.courier === 'econt') {
        const body: Record<string, unknown> = {
          weight: input.weightKg,
          dimensions,
          receiverCityName: input.office?.city || input.city,
          receiverPostCode: input.office?.postCode || input.postCode || '1000',
          receiverName: input.receiverName || 'Клиент',
          receiverPhone: input.receiverPhone || '0888000000',
          ...(input.office ? { officeCode: input.office.id } : { receiverStreet: input.street }),
          ...(input.codEur > 0 ? { services: [{ type: 'CD', amount: input.codEur, currency: 'EUR' }] } : {}),
        }
        const res = await api<{ success: boolean; data?: { totalPrice?: number | string } }>('/api/econt/calculate-price', { method: 'POST', body })
        return res.success && res.data?.totalPrice ? Number(res.data.totalPrice) : null
      }
      const body: Record<string, unknown> = {
        weight: input.weightKg,
        dimensions,
        receiverCityName: input.office?.city || input.city,
        receiverPostCode: input.office?.postCode || input.postCode || '1000',
        receiverName: input.receiverName || 'Клиент',
        receiverPhone: input.receiverPhone || '0888000000',
        paymentSide: input.codEur > 0 ? 'RECEIVER' : 'SENDER',
        codAmount: input.codEur,
        ...(input.office ? { officeId: Number(input.office.id) } : { receiverStreet: input.street }),
      }
      const res = await api<{ success: boolean; price?: { total?: number | string } }>('/api/speedy/calculate', { method: 'POST', body })
      return res.success && res.price?.total ? Number(res.price.total) : null
    } catch {
      return null
    }
  }

  return { offices, estimate }
}
