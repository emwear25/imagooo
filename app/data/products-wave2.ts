import type { DemoProduct } from '~/types/catalog'
import { PLA, SILK_PLA, careDecor, careSoft, playSetNotice, toyNotice } from './product-copy'

/**
 * Second wave: play sets, premium decor, seasonal and personalised items.
 * Original designs inspired by popular product genres (see docs/ASSET-SOURCES.md). Demo data.
 */
export const wave2: DemoProduct[] = [
  // ------------------------------------------------------------ Комплекти за игра
  {
    id: 'p23', slug: 'komplekt-pasta', name: 'Комплект за игра „Паста“', tagline: 'Кутия, купичка, вилица и паста в четири форми',
    description: [
      'Пълен комплект за игра на ресторант: кутия паста с прозорче, дълбока купичка, голяма игрална вилица и цяла шепа паста — спирали, пенне, фарфале и дълги спагети.',
      'Формите се хващат лесно с малки ръце, а цветовете са подбрани да изглеждат апетитно и спокойно в детската стая.',
    ],
    highlights: ['Над 20 части в комплекта', 'Четири форми паста', 'Кутия, купичка и вилица'],
    category: 'komplekti-za-igra', alsoIn: ['igrachki-i-zabavlenie'], priceCents: 3490,
    variants: [
      { id: 'koral', name: 'Корал', filaments: ['koral', 'mlechen'] },
      { id: 'menta', name: 'Мента', filaments: ['menta', 'mlechen'] },
      { id: 'lavandula', name: 'Лавандула', filaments: ['lavandula', 'mlechen'] },
    ],
    specs: { dimensions: 'Кутия 7,5 × 4,2 × 13 см, купичка ⌀ 9 см', material: PLA, includes: 'Кутия, купичка, вилица и паста (броят може да варира)', care: careSoft },
    notice: playSetNotice,
    badges: ['new', 'set'], tags: ['паста', 'комплект', 'игра', 'кухня', 'ресторант', 'играчка', 'подарък', 'деца'], featured: true, rank: 1,
  },
  {
    id: 'p24', slug: 'komplekt-burger', name: 'Комплект за игра „Бургер“', tagline: 'Сглоби бургер на етажи',
    description: [
      'Хлебче със сусам, кюфте, сирене, маруля и домати — всеки етаж е отделна част, така че бургерът се сглобява и разглобява отново и отново.',
      'Комплектът включва и втори набор части за още един бургер.',
    ],
    highlights: ['Два бургера', 'Отделни етажи за сглобяване', 'Класически или пастелни цветове'],
    category: 'komplekti-za-igra', priceCents: 2490,
    variants: [
      { id: 'klasik', name: 'Класически', filaments: ['praskova', 'slance', 'cherven'] },
      { id: 'pastelen', name: 'Пастелен', filaments: ['praskova', 'lavandula', 'menta'] },
    ],
    specs: { dimensions: 'Бургер ⌀ около 7 см, височина около 6 см', material: PLA, includes: 'Части за два бургера', care: careSoft },
    notice: playSetNotice,
    badges: ['set'], tags: ['бургер', 'комплект', 'игра', 'кухня', 'играчка'], rank: 9,
  },
  {
    id: 'p25', slug: 'komplekt-otvari', name: 'Комплект „Магически отвари“', tagline: 'Казан, шишенца и съставки за заклинания',
    description: [
      'Казан на три крачета, шишенца с тапи и тайни съставки — гъбка, кристали и звезда. Комплект за въображаеми отвари, приказки и цели следобеди игра.',
    ],
    highlights: ['Казан и три шишенца', 'Гъбка, кристали и звезда', 'Две цветови магии'],
    category: 'komplekti-za-igra', alsoIn: ['igrachki-i-zabavlenie'], priceCents: 3290,
    variants: [
      { id: 'magiya', name: 'Магия', filaments: ['grafit', 'lavandula', 'menta'] },
      { id: 'gora', name: 'Гора', filaments: ['maslina', 'menta', 'slance'] },
    ],
    specs: { dimensions: 'Казан ⌀ около 9 см, шишенца 5–8 см', material: PLA, includes: 'Казан, 3 шишенца с тапи и съставки', care: careSoft },
    notice: playSetNotice,
    badges: ['new', 'set'], tags: ['отвари', 'магия', 'комплект', 'игра', 'играчка', 'подарък'], featured: true, rank: 6,
  },
  {
    id: 'p26', slug: 'chaen-komplekt', name: 'Чаен комплект за игра', tagline: 'Чайник, две чаши и чинийки',
    description: [
      'Малък чаен сервиз за кукленски следобеди и игра на гости: чайник с капаче, две чаши с дръжки и две чинийки.',
    ],
    highlights: ['Чайник с капаче', '2 чаши и 2 чинийки', 'Пастелни цветове'],
    category: 'komplekti-za-igra', priceCents: 2990,
    variants: [
      { id: 'mlechen-koral', name: 'Млечнобял с корал', filaments: ['mlechen', 'koral'] },
      { id: 'lavandula', name: 'Лавандула', filaments: ['lavandula', 'mlechen'] },
      { id: 'menta', name: 'Мента', filaments: ['menta', 'mlechen'] },
    ],
    specs: { dimensions: 'Чайник около 13 × 7 × 7 см', material: PLA, includes: 'Чайник с капаче, 2 чаши, 2 чинийки', care: careSoft },
    notice: playSetNotice,
    badges: ['set'], tags: ['чай', 'сервиз', 'комплект', 'игра', 'играчка'], rank: 12,
  },
  {
    id: 'p27', slug: 'shah-prizma', name: 'Шах „Призма“', tagline: 'Минималистичен шах с дъска',
    description: [
      'Пълен комплект шах с дъска и 32 фигури в чисти, геометрични форми. Красив на масата в хола и удобен за първите партии.',
    ],
    highlights: ['Дъска и 32 фигури', 'Геометричен дизайн', 'Класически или цветове imagoo'],
    category: 'komplekti-za-igra', alsoIn: ['skulpturi-i-art'], priceCents: 4990,
    variants: [
      { id: 'klasik', name: 'Класически', filaments: ['mlechen', 'grafit', 'pyasak'] },
      { id: 'imagoo', name: 'Imagoo', filaments: ['lilav', 'koral', 'lavandula'] },
    ],
    specs: { dimensions: 'Дъска около 20 × 20 см, фигури 2–4,5 см', material: PLA, includes: 'Дъска и 32 фигури', care: careDecor },
    notice: toyNotice,
    badges: ['set', 'picked'], tags: ['шах', 'игра', 'настолна игра', 'подарък', 'семейство'], featured: true, rank: 4,
  },
  {
    id: 'p28', slug: 'pista-topcheta', name: 'Писта за топчета „Спирала“', tagline: 'Спирална кула с тава за финал',
    description: [
      'Топчето тръгва от върха и се спуска по три и повече спирални завоя до тавата в основата. Хипнотизиращо за деца и възрастни.',
    ],
    highlights: ['Височина около 26 см', 'Три спирални завоя', 'Тава за финала'],
    category: 'komplekti-za-igra', alsoIn: ['igrachki-i-zabavlenie'], priceCents: 3990,
    variants: [
      { id: 'duga', name: 'Дъга', filaments: ['koral', 'lilav', 'slance'] },
      { id: 'nebe', name: 'Небесно', filaments: ['nebe', 'grafit', 'koral'] },
    ],
    specs: { dimensions: '⌀ основа 15 см, височина около 26 см', material: PLA, includes: 'Кула с писта и тава (топчетата — предстои уточняване)', care: careDecor },
    notice: 'Топчетата са малки части. Комплектацията, възрастовата група и съответствието с изискванията за играчки предстои да бъдат потвърдени преди продажба.',
    badges: ['new'], tags: ['писта', 'топчета', 'играчка', 'игра', 'спирала'], rank: 7,
  },

  // ------------------------------------------------------------ Играчки
  {
    id: 'p29', slug: 'drakon-vihar', name: 'Голям подвижен дракон „Вихър“', tagline: 'Около 40 см ставно тяло и широки крила',
    description: [
      'Нашият най-голям дракон: 24 свързани сегмента, рогата глава и широки крила с ребра. Отпечатан в сатенен филамент с перлен блясък, който се променя със светлината.',
      'Впечатляващ на рафта, в колекцията или като подарък за любител на драконите.',
    ],
    highlights: ['Около 40 см дължина', 'Сатенен филамент с блясък', '24 подвижни сегмента'],
    category: 'igrachki-i-zabavlenie', alsoIn: ['skulpturi-i-art'], priceCents: 4490,
    variants: [
      { id: 'zlato', name: 'Злато със седеф', filaments: ['zlato', 'sedef'] },
      { id: 'med', name: 'Мед с графит', filaments: ['med', 'grafit'] },
      { id: 'sedef-lilav', name: 'Седеф с лилаво', filaments: ['sedef', 'lilav'] },
    ],
    specs: { dimensions: 'Дължина около 40 см, размах на крилата около 26 см', material: SILK_PLA, care: careDecor },
    notice: toyNotice,
    badges: ['new', 'picked'], tags: ['дракон', 'голям', 'фигура', 'подвижна', 'играчка', 'подарък', 'колекция'], featured: true, rank: 2,
  },

  // ------------------------------------------------------------ Скулптури и арт
  {
    id: 'p30', slug: 'skulptura-bezkraynost', name: 'Скулптура „Безкрайност“', tagline: 'Усукана лента без начало и край',
    description: [
      'Лента с едно усукване, която образува безкрайна осмица — същата линия, която свързва двете „о“ в името ни. Издигната на тънка стойка, тя сякаш се носи над масата.',
      'Сатененият филамент подчертава всяка извивка, когато светлината се плъзга по повърхността.',
    ],
    highlights: ['Лента на Мьобиус', 'Стойка с основа', 'Сатенен или плътен цвят'],
    category: 'skulpturi-i-art', alsoIn: ['dom-i-dekoraciya'], priceCents: 3990,
    variants: [
      { id: 'zlato', name: 'Злато с графит', filaments: ['zlato', 'grafit'] },
      { id: 'koral', name: 'Корал с лилаво', filaments: ['koral', 'lilav'] },
      { id: 'sedef', name: 'Седеф', filaments: ['sedef', 'mlechen'] },
    ],
    specs: { dimensions: 'Около 20 × 6 × 17 см', material: SILK_PLA, care: careDecor },
    badges: ['new', 'picked'], tags: ['скулптура', 'безкрайност', 'декорация', 'арт', 'подарък', 'дом'], featured: true, rank: 3,
  },
  {
    id: 'p31', slug: 'slon-poligon', name: 'Слон „Полигон“', tagline: 'Нисък полигонен силует',
    description: [
      'Слон, изграден от плоски фасети, които улавят светлината като скулптура от сгънат лист. Спокоен акцент за рафт, бюро или детска стая.',
    ],
    highlights: ['Фасетиран дизайн', 'Около 20 см дължина', 'Сатенено злато или плътни цветове'],
    category: 'skulpturi-i-art', alsoIn: ['dom-i-dekoraciya'], priceCents: 2990,
    variants: [
      { id: 'mlechen', name: 'Млечнобял', filaments: ['mlechen'] },
      { id: 'zlato', name: 'Злато (сатен)', filaments: ['zlato'] },
      { id: 'grafit', name: 'Графит', filaments: ['grafit'] },
      { id: 'menta', name: 'Мента', filaments: ['menta'] },
    ],
    specs: { dimensions: 'Около 20 × 9 × 13 см', material: PLA, care: careDecor },
    badges: [], tags: ['слон', 'скулптура', 'полигон', 'декорация', 'детска стая'], rank: 10,
  },
  {
    id: 'p32', slug: 'ogranichiteli-arka', name: 'Ограничители за книги „Арка“', tagline: 'Две дъги на три цвята',
    description: [
      'Двойка ограничители във формата на дъга от три ленти. Държат книгите изправени и добавят цвят на рафта дори когато е полупразен.',
    ],
    highlights: ['Комплект от 2 броя', 'Три цветни ленти', 'Широка, стабилна основа'],
    category: 'skulpturi-i-art', alsoIn: ['dom-i-dekoraciya', 'praktichni-resheniya'], priceCents: 2790,
    variants: [
      { id: 'zalez', name: 'Залез', filaments: ['koral', 'praskova', 'slance'] },
      { id: 'zemya', name: 'Земя', filaments: ['maslina', 'pyasak', 'mlechen'] },
      { id: 'lilav', name: 'Лилаво', filaments: ['lilav', 'lavandula', 'mlechen'] },
    ],
    specs: { dimensions: 'Всеки около 18 × 3 × 9 см', material: PLA, includes: '2 ограничителя', care: careDecor },
    propsNote: 'Книгите на снимката не са включени.',
    badges: ['set'], tags: ['книги', 'ограничители', 'дъга', 'рафт', 'декорация'], everyday: true, rank: 8,
  },
  {
    id: 'p33', slug: 'pano-vulni', name: 'Стенно пано „Пчелна пита“', tagline: '7 релефни шестоъгълника',
    description: [
      'Седем шестоъгълни плочки с терасиран релеф в три близки нюанса. Подреди ги като пчелна пита или по свой начин върху стената.',
    ],
    highlights: ['7 плочки', 'Терасиран релеф', 'Три цветови гами'],
    category: 'skulpturi-i-art', alsoIn: ['dom-i-dekoraciya'], priceCents: 3490,
    variants: [
      { id: 'zalez', name: 'Залез', filaments: ['koral', 'praskova', 'slance'] },
      { id: 'okean', name: 'Океан', filaments: ['nebe', 'menta', 'mlechen'] },
      { id: 'lilav', name: 'Лилаво', filaments: ['lilav', 'lavandula', 'mlechen'] },
    ],
    specs: { dimensions: 'Всяка плочка около 10 × 8,7 см; общо около 27 × 26 см', material: PLA, includes: '7 плочки (начинът на монтаж предстои да бъде уточнен)', care: careDecor },
    badges: ['set'], tags: ['пано', 'стена', 'шестоъгълник', 'декорация', 'арт'], rank: 13,
  },

  // ------------------------------------------------------------ Празници и сезони
  {
    id: 'p34', slug: 'svetilnik-korona', name: 'Светилник „Корона“ за LED свещ', tagline: 'Усукани ребра, които разпръскват светлината',
    description: [
      'Светилник от усукани ребра, които хвърлят мека, ритмична светлина около себе си. Създаден за LED свещичка, а не за открит пламък.',
    ],
    highlights: ['За LED свещичка', 'Усукан ажурен дизайн', 'Височина около 11 см'],
    category: 'praznici-i-sezoni', alsoIn: ['dom-i-dekoraciya'], priceCents: 2290,
    variants: [
      { id: 'mlechen', name: 'Млечнобял', filaments: ['mlechen'] },
      { id: 'zlato', name: 'Злато (сатен)', filaments: ['zlato'] },
      { id: 'grafit', name: 'Графит', filaments: ['grafit'] },
    ],
    specs: { dimensions: '⌀ около 10 см, височина около 11 см', material: PLA, care: careDecor },
    notice: 'Само за LED свещички — никога не използвай с открит пламък. LED свещичката не е включена.',
    propsNote: 'LED свещичката на снимката не е включена.',
    badges: ['new'], tags: ['светилник', 'свещ', 'led', 'декорация', 'празници', 'дом'], rank: 11,
  },
  {
    id: 'p35', slug: 'tikva-rebro', name: 'Декоративна тиква „Ребро“', tagline: 'Фини ребра за есенната маса',
    description: [
      'Ниска, широка тиква с меки сегменти и фини ребра по цялата повърхност. Красив есенен акцент, който не се разваля и остава за следващата година.',
    ],
    highlights: ['Фини ребра', 'Около 14 см ширина', 'Сатенен седеф или плътни цветове'],
    category: 'praznici-i-sezoni', alsoIn: ['dom-i-dekoraciya'], priceCents: 1890,
    variants: [
      { id: 'pyasak', name: 'Пясък', filaments: ['pyasak'] },
      { id: 'praskova', name: 'Праскова', filaments: ['praskova'] },
      { id: 'sedef', name: 'Седеф (сатен)', filaments: ['sedef'] },
      { id: 'grafit', name: 'Графит', filaments: ['grafit'] },
    ],
    specs: { dimensions: '⌀ около 14 см, височина около 11 см', material: PLA, care: careDecor },
    badges: ['new'], tags: ['тиква', 'есен', 'декорация', 'сезонни', 'маса'], rank: 5,
  },
  {
    id: 'p36', slug: 'koledna-igrachka-ime', name: 'Коледна играчка с име', tagline: 'Снежинки и име върху празнична топка',
    description: [
      'Плоска коледна играчка с релефни снежинки и име по твой избор. Окачи я на елхата или я подари заедно с подаръка — включена е и малка стойка.',
    ],
    highlights: ['Име до 10 символа', 'Релефни снежинки', 'Стойка и лента за окачване'],
    category: 'praznici-i-sezoni', alsoIn: ['personalizirani-podaraci'], priceCents: 990,
    variants: [
      { id: 'cherven', name: 'Червен със злато', filaments: ['cherven', 'zlato'] },
      { id: 'zlato', name: 'Злато (сатен)', filaments: ['zlato', 'mlechen'] },
      { id: 'sedef', name: 'Седеф с небесно', filaments: ['sedef', 'nebe'] },
    ],
    personalization: {
      label: 'Име', placeholder: 'напр. Мила', help: 'До 10 символа — букви, цифри, интервал или тире.',
      maxLength: 10, required: true,
    },
    specs: { dimensions: '⌀ около 8,4 см', material: PLA, includes: 'Играчка, лента за окачване и стойка', care: careDecor },
    badges: ['personalizable', 'new'], tags: ['коледа', 'играчка', 'елха', 'име', 'подарък', 'празници', 'персонализиран'], featured: true, rank: 3,
  },

  // ------------------------------------------------------------ Персонализирани
  {
    id: 'p37', slug: 'klyuchodarzhatel-geroi', name: 'Ключодържател „Герой с име“', tagline: 'Многоцветен герой и релефно име',
    description: [
      'Нашият премиум ключодържател: многослоен, многоцветен герой — мече, коте или ракета — и релефно име под него. Всеки слой е в собствен цвят, без боядисване.',
      'Перфектен за раница, ключове за първа самостоятелност или като малък подарък с голямо значение.',
    ],
    highlights: ['Три героя по избор', 'Многоцветен релеф', 'Име до 8 символа', 'Включена метална халка'],
    category: 'personalizirani-podaraci', alsoIn: ['aksesoari-i-klyuchodarzhateli'], priceCents: 1190,
    variants: [
      { id: 'meche', name: 'Мече', filaments: ['menta', 'pyasak', 'mlechen'] },
      { id: 'kote', name: 'Коте', filaments: ['lavandula', 'grafit', 'praskova'] },
      { id: 'raketa', name: 'Ракета', filaments: ['lilav', 'cherven', 'slance'] },
    ],
    personalization: {
      label: 'Име', placeholder: 'напр. Дани', help: 'До 8 символа — букви, цифри, интервал или тире.',
      maxLength: 8, required: true,
    },
    specs: { dimensions: 'Около 5 × 7 см', material: PLA, includes: 'Метална халка', care: careDecor },
    badges: ['personalizable', 'picked'], tags: ['ключодържател', 'име', 'герой', 'мече', 'коте', 'ракета', 'деца', 'подарък', 'персонализиран'], featured: true, rank: 1,
  },
  {
    id: 'p38', slug: 'tabela-semeystvo', name: 'Табела „Семейство“ с име', tagline: 'Къщичка с покрив, сърце и фамилия',
    description: [
      'Табела-къщичка с надпис „Семейство“ и вашата фамилия. Стои на собствена основа в антрето или на рафта — топъл подарък за нов дом или сватба.',
    ],
    highlights: ['Фамилия до 12 символа', 'Основа за стоене', 'Три цветови комбинации'],
    category: 'personalizirani-podaraci', alsoIn: ['dom-i-dekoraciya'], priceCents: 2490,
    variants: [
      { id: 'mlechen', name: 'Млечнобял с корал', filaments: ['mlechen', 'koral', 'lilav'] },
      { id: 'maslina', name: 'Пясък с маслина', filaments: ['pyasak', 'maslina'] },
      { id: 'grafit', name: 'Графит със злато', filaments: ['grafit', 'zlato'] },
    ],
    personalization: {
      label: 'Фамилия', placeholder: 'напр. Петрови', help: 'До 12 символа. Надписът „Семейство“ е включен.',
      maxLength: 12, required: true,
    },
    specs: { dimensions: 'Около 19 × 16 см', material: PLA, care: careDecor },
    badges: ['personalizable', 'new'], tags: ['табела', 'семейство', 'дом', 'сватба', 'нов дом', 'подарък', 'персонализиран'], featured: true, rank: 2,
  },
  {
    id: 'p39', slug: 'etiket-lyubimets', name: 'Медальон за любимец с име', tagline: 'Кокалче с име и лапичка',
    description: [
      'Медальон-кокалче с релефно име и малка лапичка — за нашийника на кучето или котката. Включена е метална халка.',
    ],
    highlights: ['Име до 8 символа', 'Релефна лапичка', 'Включена метална халка'],
    category: 'personalizirani-podaraci', alsoIn: ['aksesoari-i-klyuchodarzhateli'], priceCents: 890,
    variants: [
      { id: 'koral', name: 'Корал', filaments: ['koral', 'mlechen'] },
      { id: 'nebe', name: 'Небесно', filaments: ['nebe', 'lilav'] },
      { id: 'zlato', name: 'Злато (сатен)', filaments: ['zlato', 'grafit'] },
    ],
    personalization: {
      label: 'Име на любимеца', placeholder: 'напр. Рекс', help: 'До 8 символа.',
      maxLength: 8, required: true,
    },
    specs: { dimensions: 'Около 8 × 3,2 см', material: PLA, includes: 'Метална халка', care: careDecor },
    notice: 'Проверявай медальона редовно за износване. Издръжливостта при активна употреба не е тествана.',
    badges: ['personalizable'], tags: ['куче', 'котка', 'любимец', 'медальон', 'нашийник', 'име', 'персонализиран'], rank: 6,
  },
  {
    id: 'p40', slug: 'obemni-bukvi', name: 'Обемни букви с име', tagline: 'Свободно стоящи букви и звезда',
    description: [
      'Дебели, закръглени букви, които стоят самостоятелно на рафта или скрина. Изпиши име до 6 букви — всяка буква е в различен цвят или в един общ тон.',
    ],
    highlights: ['До 6 букви', 'Височина около 12 см', 'Включена декоративна звезда'],
    category: 'personalizirani-podaraci', alsoIn: ['dom-i-dekoraciya'], priceCents: 2490,
    variants: [
      { id: 'pastelni', name: 'Пастелни', filaments: ['lavandula', 'praskova', 'menta', 'slance'] },
      { id: 'lilav', name: 'Лилав', filaments: ['lilav', 'koral'] },
      { id: 'mlechen', name: 'Млечнобял със злато', filaments: ['mlechen', 'zlato'] },
    ],
    personalization: {
      label: 'Име', placeholder: 'напр. Ема', help: 'До 6 букви. Ще ги изработим с главни букви.',
      maxLength: 6, required: true,
    },
    specs: { dimensions: 'Букви около 12 см височина и 3 см дебелина', material: PLA, includes: 'Буквите на името и звезда', care: careDecor },
    badges: ['personalizable'], tags: ['букви', 'име', 'детска стая', 'декорация', 'подарък', 'персонализиран'], rank: 4,
  },
]
