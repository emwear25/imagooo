import type { DesignSource, DemoProduct } from '~/types/catalog'
import { PLA, SILK_PLA, careDecor, playSetNotice, toyNotice } from './product-copy'

/**
 * Community designs whose licence permits selling prints (CC0 / CC BY / CC BY-SA).
 * Licences were read from the platforms on 2026-10-07; records kept in
 * tools/render/community/<platform>-<id>/licence.json and docs/COMMUNITY-DESIGNS.md.
 * Images are our own studio renders of the original, unmodified geometry.
 */

const BY = 'https://creativecommons.org/licenses/by/4.0/'
const BY_SA = 'https://creativecommons.org/licenses/by-sa/4.0/'
const CC0 = 'https://creativecommons.org/publicdomain/zero/1.0/'
const checkedOn = '2026-10-07'

const printables = (id: string, title: string, designer: string, license: string, licenseUrl: string, note?: string): DesignSource => ({
  title, designer, platform: 'Printables', url: `https://www.printables.com/model/${id}`, license, licenseUrl, checkedOn, note,
})

export const community: DemoProduct[] = [
  // ------------------------------------------------------------ decor
  {
    id: 'c01', slug: 'vaza-roza', name: 'Ваза „Роза“', tagline: 'Спирални листенца, които се разтварят нагоре',
    description: [
      'Ваза, оформена като разтваряща се роза — всяко листенце се извива около центъра. Красив подарък сама по себе си или с няколко сухи стръка.',
    ],
    highlights: ['Скулптурна форма на роза', 'Три размера (5, 7 см и голям)', 'Перлени и плътни цветове'],
    category: 'dom-i-dekoraciya', alsoIn: ['skulpturi-i-art'], priceCents: 1990,
    variants: [
      { id: 'cherven', name: 'Червен', filaments: ['cherven'] },
      { id: 'praskova', name: 'Праскова', filaments: ['praskova'] },
      { id: 'sedef', name: 'Седеф (сатен)', filaments: ['sedef'] },
    ],
    specs: { dimensions: 'Голям размер около 8 см височина (предлагат се и 5 и 7 см)', material: PLA, care: careDecor },
    notice: 'Водонепропускливостта не е потвърдена — препоръчваме вазата за сухи цветя.',
    badges: ['new', 'picked'], tags: ['ваза', 'роза', 'цвете', 'подарък', 'декорация', 'св. валентин'], featured: true, rank: 2,
    design: printables('131488', 'Spiral Vase Rose', 'lytta', 'Creative Commons — Attribution', BY),
  },
  {
    id: 'c02', slug: 'vaza-tetrahex', name: 'Ваза „Тетрахекс“', tagline: 'Геометричен релеф от вълнообразни шестоъгълници',
    description: [
      'Висока ваза с плътен геометричен релеф, който хвърля различни сенки при всяка промяна на светлината. Особено ефектна в сатенено злато.',
    ],
    highlights: ['Височина около 24 см', 'Сложен геометричен релеф', 'Сатенено злато или плътни цветове'],
    category: 'skulpturi-i-art', alsoIn: ['dom-i-dekoraciya'], priceCents: 3490,
    variants: [
      { id: 'zlato', name: 'Злато (сатен)', filaments: ['zlato'] },
      { id: 'lilav', name: 'Лилав', filaments: ['lilav'] },
      { id: 'mlechen', name: 'Млечнобял', filaments: ['mlechen'] },
    ],
    specs: { dimensions: 'Около 19,5 × 19,5 × 24 см', material: SILK_PLA, care: careDecor },
    notice: 'Водонепропускливостта не е потвърдена — препоръчваме вазата за сухи цветя.',
    badges: ['new'], tags: ['ваза', 'геометрична', 'релеф', 'декорация', 'арт'], featured: true, rank: 3,
    design: printables('228303', 'Tetrahex Ripple Vase', 'ChrisTheViolaNerd', 'Creative Commons — Attribution — Share Alike', BY_SA),
  },
  {
    id: 'c03', slug: 'ogranichiteli-kristal', name: 'Ограничители „Кристали“', tagline: 'Кристални клъстери, които държат книгите',
    description: [
      'Двойка ограничители във формата на кристални клъстери — като минерали, израснали направо на рафта.',
    ],
    highlights: ['Комплект от 2 броя', 'Фасетирани кристали', 'Сатенен седеф, лавандула или графит'],
    category: 'skulpturi-i-art', alsoIn: ['dom-i-dekoraciya'], priceCents: 2690,
    variants: [
      { id: 'lavandula', name: 'Лавандула', filaments: ['lavandula'] },
      { id: 'sedef', name: 'Седеф (сатен)', filaments: ['sedef'] },
      { id: 'grafit', name: 'Графит', filaments: ['grafit'] },
    ],
    specs: { dimensions: 'Всеки около 11,5 × 11 × 10 см', material: PLA, includes: '2 ограничителя', care: careDecor },
    propsNote: 'Книгите на снимката не са включени.',
    badges: ['set'], tags: ['ограничители', 'книги', 'кристали', 'рафт', 'декорация'], rank: 9,
    design: printables('447388', 'Crystal Cluster Bookends', 'Triple G Workshop', 'Creative Commons — Attribution — Share Alike', BY_SA),
  },
  {
    id: 'c04', slug: 'pano-bonsai', name: 'Силует „Бонсай“', tagline: 'Графично дърво в кръг, на стойка',
    description: [
      'Деликатен силует на бонсай, вписан в кръг — като графика с туш, превърната в обект. Стои на ниска основа на рафт или скрин.',
    ],
    highlights: ['Около 23 см диаметър', 'Фин графичен силует', 'Включена основа'],
    category: 'skulpturi-i-art', alsoIn: ['dom-i-dekoraciya'], priceCents: 2490,
    variants: [
      { id: 'grafit', name: 'Графит', filaments: ['grafit', 'pyasak'] },
      { id: 'maslina', name: 'Маслина', filaments: ['maslina', 'mlechen'] },
      { id: 'zlato', name: 'Злато (сатен)', filaments: ['zlato', 'grafit'] },
    ],
    specs: { dimensions: 'Около 23 × 23 см, дебелина 2 мм', material: PLA, includes: 'Силует и основа', care: careDecor },
    badges: ['new'], tags: ['бонсай', 'арт', 'силует', 'декорация', 'стена'], rank: 12,
    design: printables('764562', 'Bonsai wall art', 'IG Akadmy', 'Creative Commons — Public Domain', CC0),
  },

  // ------------------------------------------------------------ toys
  {
    id: 'c05', slug: 'drakon-kristal', name: 'Подвижен дракон „Кристал“', tagline: 'Фасетирано тяло с кристални шипове',
    description: [
      'Изящен ставен дракон с фасетирани сегменти и кристални шипове по гърба. Отпечатва се като едно цяло и веднага се извива.',
    ],
    highlights: ['Около 24 см навит', 'Отпечатан като едно цяло', 'Сатенено злато или пастелни цветове'],
    category: 'igrachki-i-zabavlenie', priceCents: 2690,
    variants: [
      { id: 'lavandula', name: 'Лавандула', filaments: ['lavandula'] },
      { id: 'zlato', name: 'Злато (сатен)', filaments: ['zlato'] },
      { id: 'menta', name: 'Мента', filaments: ['menta'] },
    ],
    specs: { dimensions: 'Около 24 × 23 × 5 см (навит)', material: PLA, care: careDecor },
    notice: toyNotice,
    badges: ['new'], tags: ['дракон', 'кристал', 'подвижна', 'фигура', 'играчка', 'подарък'], rank: 6,
    design: printables('831762', 'Articulated crystal dragon', 'Martin', 'Creative Commons — Attribution — Share Alike', BY_SA),
  },
  {
    id: 'c06', slug: 'yaytse-drakon', name: 'Драконово яйце с тайник', tagline: 'Люспесто яйце, което се отваря',
    description: [
      'Яйце с релефни люспи, което се развива на две половини — за малка изненада, бижу или съкровище вътре. Ефектно в мед или седеф.',
    ],
    highlights: ['Отваря се с резба', 'Тайник за малък подарък', 'Сатенени цветове'],
    category: 'igrachki-i-zabavlenie', alsoIn: ['skulpturi-i-art'], priceCents: 1990,
    variants: [
      { id: 'med', name: 'Мед (сатен)', filaments: ['med'] },
      { id: 'sedef', name: 'Седеф (сатен)', filaments: ['sedef'] },
      { id: 'lilav-koral', name: 'Лилаво и корал', filaments: ['lilav', 'koral'] },
    ],
    specs: { dimensions: 'Около 6,3 × 6,3 × 9 см (затворено)', material: SILK_PLA, care: careDecor },
    badges: ['new', 'picked'], tags: ['яйце', 'дракон', 'тайник', 'подарък', 'кутийка'], featured: true, rank: 4,
    design: printables('159912', 'The Original Dragon Egg', 'YBlood (Tony Youngblood)', 'Creative Commons — Attribution — Share Alike', BY_SA),
  },
  {
    id: 'c07', slug: 'flexi-reks', name: 'Гъвкав динозавър „Рекс“', tagline: 'Класическият гъвкав T-rex',
    description: [
      'Любимият гъвкав тиранозавър със здрави връзки между сегментите. Огъва се, разклаща се и не се разпада.',
    ],
    highlights: ['Подвижни сегменти', 'Здрави връзки', 'Около 8 см дължина'],
    category: 'igrachki-i-zabavlenie', priceCents: 690,
    variants: [
      { id: 'menta', name: 'Мента', filaments: ['menta'] },
      { id: 'koral', name: 'Корал', filaments: ['koral'] },
      { id: 'nebe', name: 'Небесно', filaments: ['nebe'] },
    ],
    specs: { dimensions: 'Около 8 × 6,8 × 1,3 см', material: PLA, care: careDecor },
    notice: toyNotice,
    badges: [], tags: ['динозавър', 'рекс', 'гъвкав', 'играчка', 'фиджет'], rank: 14,
    design: {
      title: 'Flexi Rex with stronger links', designer: 'DrLex', platform: 'Thingiverse',
      url: 'https://www.thingiverse.com/thing:2738211', license: 'Creative Commons — Attribution — Share Alike', licenseUrl: BY_SA, checkedOn,
      note: 'Авторът изрично разрешава продажба на отпечатъци при посочване на авторство.',
    },
  },

  // ------------------------------------------------------------ games
  {
    id: 'c08', slug: 'kutiya-pazel', name: 'Кутия-пъзел „Тайна“', tagline: 'Лесна за отпечатване, трудна за отваряне',
    description: [
      'Кутия с таен механизъм — отвън изглежда проста, но за да я отвориш, трябва да откриеш трика. Идеална опаковка за подарък, който трябва да бъде заслужен.',
    ],
    highlights: ['Скрит механизъм', 'Подходяща за подаръчна опаковка', 'Двуцветна'],
    category: 'komplekti-za-igra', priceCents: 1890,
    variants: [
      { id: 'pyasak-grafit', name: 'Пясък и графит', filaments: ['pyasak', 'grafit'] },
      { id: 'lilav-koral', name: 'Лилаво и корал', filaments: ['lilav', 'koral'] },
    ],
    specs: { dimensions: 'Около 11 × 6 × 6 см', material: PLA, includes: 'Кутия с механизъм (2 малки магнита — предстои уточняване)', care: careDecor },
    notice: playSetNotice,
    badges: ['new'], tags: ['пъзел', 'кутия', 'загадка', 'подарък', 'игра'], rank: 8,
    design: printables('40017', 'Puzzle Box — Easy to Print, Hard to Solve', 'TOASTYMO', 'Creative Commons — Attribution', BY),
  },
  {
    id: 'c09', slug: 'shah-heksagon', name: 'Шах „Хексагон“ с магнити', tagline: 'Шестоъгълни фигури с магнитна основа',
    description: [
      'Модерен комплект шах с шестоъгълни фигури, които се отпечатват без подпори и могат да получат магнити в основата за игра в движение.',
    ],
    highlights: ['32 фигури', 'Шестоъгълен дизайн', 'Цар около 8 см'],
    category: 'komplekti-za-igra', alsoIn: ['skulpturi-i-art'], priceCents: 3990,
    variants: [
      { id: 'klasik', name: 'Класически', filaments: ['mlechen', 'grafit'] },
      { id: 'imagoo', name: 'Imagoo', filaments: ['mlechen', 'lilav'] },
    ],
    specs: { dimensions: 'Цар около 8 см височина', material: PLA, includes: '32 фигури (магнитите и дъската — предстои уточняване)', care: careDecor },
    notice: toyNotice,
    propsNote: 'На снимката е показан по един комплект фигури на основа.',
    badges: ['set'], tags: ['шах', 'игра', 'настолна игра', 'магнитен', 'подарък'], rank: 10,
    design: printables('979308', 'Hexagon Chess Set — magnetic, no support', 'vmLOGIC', 'Creative Commons — Attribution — Share Alike', BY_SA),
  },

  // ------------------------------------------------------------ personalised
  {
    id: 'c10', slug: 'ornament-ime', name: 'Коледна топка „Снежинки“ с име', tagline: 'Ажурна топка с вплетено име',
    description: [
      'Ажурна коледна играчка със снежинки и име, изписано с ръкописен шрифт през средата. Лека, ефирна и красива на светлината на елхата.',
    ],
    highlights: ['Име по избор', 'Ажурни снежинки', 'Включена стойка за подарък'],
    category: 'praznici-i-sezoni', alsoIn: ['personalizirani-podaraci'], priceCents: 890,
    variants: [
      { id: 'cherven', name: 'Червен', filaments: ['cherven'] },
      { id: 'zlato', name: 'Злато (сатен)', filaments: ['zlato'] },
      { id: 'nebe', name: 'Небесно', filaments: ['nebe'] },
    ],
    personalization: {
      label: 'Име', placeholder: 'напр. Ема', help: 'До 10 символа. Ще го изпишем с ръкописен шрифт.',
      maxLength: 10, required: true,
    },
    specs: { dimensions: '⌀ около 7,9 см', material: PLA, includes: 'Играчка и малка стойка', care: careDecor },
    badges: ['personalizable'], tags: ['коледа', 'топка', 'елха', 'име', 'подарък', 'персонализиран'], rank: 7,
    design: printables('253402', 'Customizable Christmas Name Ornament', 'Lyl3', 'Creative Commons — Attribution — Share Alike', BY_SA),
  },
  {
    id: 'c11', slug: 'medalion-sarce', name: 'Медальон-сърце за любимец', tagline: 'Сърце с място за име',
    description: [
      'Изчистен медальон във формата на сърце за котка, куче или папагал. По желание добавяме име на гърба или отпред.',
    ],
    highlights: ['Форма на сърце', 'По желание — име', 'Включена метална халка'],
    category: 'personalizirani-podaraci', alsoIn: ['aksesoari-i-klyuchodarzhateli'], priceCents: 690,
    variants: [
      { id: 'koral', name: 'Корал', filaments: ['koral', 'mlechen'] },
      { id: 'lavandula', name: 'Лавандула', filaments: ['lavandula', 'lilav'] },
      { id: 'zlato', name: 'Злато (сатен)', filaments: ['zlato', 'grafit'] },
    ],
    personalization: {
      label: 'Име (по желание)', placeholder: 'напр. Луна', help: 'До 8 символа. Остави празно за медальон без надпис.',
      maxLength: 8, required: false,
    },
    specs: { dimensions: 'Около 3,6 × 3,6 см', material: PLA, includes: 'Метална халка', care: careDecor },
    notice: 'Проверявай медальона редовно за износване. Издръжливостта при активна употреба не е тествана.',
    badges: ['personalizable'], tags: ['медальон', 'сърце', 'куче', 'котка', 'любимец', 'персонализиран'], rank: 11,
    design: printables('1122023', 'Customizable heart shaped pet tag', 'Jagoda Polinierska', 'Creative Commons — Public Domain', CC0),
  },
  {
    id: 'c12', slug: 'klyuchodarzhatel-skript', name: 'Ключодържател „Ръкописно име“', tagline: 'Име с елегантен ръкописен шрифт',
    description: [
      'Ключодържател с име, изписано със заоблен ръкописен шрифт върху двуцветна основа. Елегантен вариант за възрастни и тийнейджъри.',
    ],
    highlights: ['Ръкописен шрифт', 'Двуцветен', 'Включена метална халка'],
    category: 'aksesoari-i-klyuchodarzhateli', alsoIn: ['personalizirani-podaraci'], priceCents: 890,
    variants: [
      { id: 'lilav', name: 'Лилав с бяло', filaments: ['lilav', 'mlechen'] },
      { id: 'praskova', name: 'Праскова с червено', filaments: ['praskova', 'cherven'] },
      { id: 'grafit', name: 'Графит със злато', filaments: ['grafit', 'zlato'] },
    ],
    personalization: {
      label: 'Име', placeholder: 'напр. Alice', help: 'До 10 символа — латиница или кирилица.',
      maxLength: 10, required: true,
    },
    specs: { dimensions: 'Около 7 × 3,2 см (според името)', material: PLA, includes: 'Метална халка', care: careDecor },
    badges: ['personalizable', 'new'], tags: ['ключодържател', 'име', 'ръкописен', 'подарък', 'персонализиран'], rank: 8,
    design: printables('820622', 'Customizable name keychain / tag', 'rmfms', 'Creative Commons — Attribution', BY),
  },
]
