const LAT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'sht', ъ: 'a', ь: 'y', ю: 'yu', я: 'ya',
}

/** Lowercase, strip quotes/punctuation; used for search matching. */
export function normalize(s: string): string {
  return s
    .toLocaleLowerCase('bg')
    .replace(/[„“"'’«»().,!?:;]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Bulgarian → Latin (streamlined system) so "vaza" also finds „ваза“. */
export function transliterate(s: string): string {
  return [...normalize(s)].map((ch) => LAT[ch] ?? ch).join('')
}

/** Allowed characters for personalisation: Cyrillic, Latin, digits, space, hyphen, dot. */
export const PERSONALIZATION_PATTERN = /^[\p{Script=Cyrillic}A-Za-z0-9 .\-]*$/u
