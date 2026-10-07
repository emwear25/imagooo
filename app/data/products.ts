import type { DemoProduct } from '~/types/catalog'

/**
 * Demo catalogue. Prices, dimensions and availability are example data for the prototype.
 * Variant ids must match tools/render/products.py → VARIANTS (they name the image files).
 */

import { PLA, careDecor, careSoft, toyNotice, foodNotice } from './product-copy'
import { wave2 } from './products-wave2'
import { community } from './products-community'

const wave1: DemoProduct[] = [
  // ------------------------------------------------------------ Дом и декорация
  {
    id: 'p01', slug: 'vaza-valna', name: 'Ваза „Вълна“', tagline: 'Спирални ребра, които улавят светлината',
    description: [
      'Висока ваза с меко издут силует и ребра, които се завиват около нея като вълна. При страничната светлина всяко ребро хвърля собствена сянка и формата изглежда различно от всеки ъгъл.',
      'Подходяща за сухи цветя, клонки и декоративни треви. Стои еднакво добре сама на рафт или в група с по-ниски съдове.',
    ],
    highlights: ['Скулптурна спирална текстура', 'Стабилно широко дъно', 'За сухи цветя и декоративни клонки'],
    category: 'dom-i-dekoraciya', priceCents: 2490,
    variants: [
      { id: 'koral', name: 'Корал', filaments: ['koral'] },
      { id: 'lilav', name: 'Лилав', filaments: ['lilav'] },
      { id: 'mlechen', name: 'Млечнобял', filaments: ['mlechen'] },
      { id: 'menta', name: 'Мента', filaments: ['menta'] },
    ],
    specs: { dimensions: 'Височина 24 см, ⌀ около 12 см', material: PLA, care: careDecor },
    notice: 'Водонепропускливостта не е потвърдена — препоръчваме вазата за сухи цветя или със стъклена вложка.',
    badges: ['picked'], tags: ['ваза', 'декорация', 'цветя', 'подарък', 'дом'], featured: true, rank: 1,
  },
  {
    id: 'p02', slug: 'kashpa-oblak', name: 'Кашпа „Облак“', tagline: 'Мека форма с подложка за малки растения',
    description: [
      'Кашпа с облачни извивки и отделна подложка, която събира излишната вода. Заоблените ръбове правят формата приятна за окото и лесна за почистване.',
      'Създадена за сукуленти, кактуси и малки стайни растения на перваза или бюрото.',
    ],
    highlights: ['Включена подложка', 'Мек „облачен“ силует', 'За сукуленти и малки растения'],
    category: 'dom-i-dekoraciya', priceCents: 1990,
    variants: [
      { id: 'mlechen', name: 'Млечнобял', filaments: ['mlechen'] },
      { id: 'praskova', name: 'Праскова', filaments: ['praskova'] },
      { id: 'lavandula', name: 'Лавандула', filaments: ['lavandula'] },
    ],
    specs: { dimensions: '⌀ около 15 см, височина 12 см (с подложката)', material: PLA, includes: 'Кашпа и подложка', care: careDecor },
    propsNote: 'Растението и почвата на снимката не са включени.',
    badges: ['new'], tags: ['кашпа', 'саксия', 'растения', 'сукулент', 'дом'], featured: true, rank: 4,
  },
  {
    id: 'p03', slug: 'vaza-prizma', name: 'Ваза „Призма“', tagline: 'Геометрични плоскости с лека извивка',
    description: [
      'Фасетирана ваза, чиито плоскости се завъртат леко нагоре като сгънат лист хартия. Минималистична форма, която придава структура на всеки кът.',
      'Красива и празна, и с няколко сухи стръка.',
    ],
    highlights: ['Фасетиран силует', 'Лек усукващ ефект', 'Изглежда добре и без цветя'],
    category: 'dom-i-dekoraciya', priceCents: 2290,
    variants: [
      { id: 'lilav', name: 'Лилав', filaments: ['lilav'] },
      { id: 'pyasak', name: 'Пясък', filaments: ['pyasak'] },
      { id: 'grafit', name: 'Графит', filaments: ['grafit'] },
    ],
    specs: { dimensions: 'Височина 20 см, ширина около 12 см', material: PLA, care: careDecor },
    notice: 'Водонепропускливостта не е потвърдена — препоръчваме вазата за сухи цветя.',
    badges: [], tags: ['ваза', 'геометрична', 'декорация', 'дом'], rank: 9,
  },
  {
    id: 'p04', slug: 'kupa-listo', name: 'Купичка „Листо“', tagline: 'За ключове, бижута и дребни неща',
    description: [
      'Плитка овална купичка, която улавя всичко, което иначе се губи — ключове, пръстени, монети и слушалки. Поставена до входната врата, тя се превръща в мястото, където всичко се връща.',
    ],
    highlights: ['Ниска и широка форма', 'Подходяща за антре, нощно шкафче или бюро', 'Леко повдигнат ръб'],
    category: 'dom-i-dekoraciya', alsoIn: ['praktichni-resheniya'], priceCents: 1290,
    variants: [
      { id: 'pyasak', name: 'Пясък', filaments: ['pyasak'] },
      { id: 'koral', name: 'Корал', filaments: ['koral'] },
      { id: 'menta', name: 'Мента', filaments: ['menta'] },
    ],
    specs: { dimensions: '19 × 12,5 × 3 см', material: PLA, care: careDecor },
    propsNote: 'Халките на снимката не са включени.',
    badges: [], tags: ['купа', 'органайзер', 'ключове', 'бижута', 'антре'], everyday: true, rank: 11,
  },

  // ------------------------------------------------------------ Кухня и организация
  {
    id: 'p05', slug: 'shtipki-zahapka', name: 'Щипки за пликове „Захапка“', tagline: 'Комплект от 4 пружиниращи щипки',
    description: [
      'Отворен пакет кафе, ориз или чипс? Щипките „Захапка“ го затварят с едно движение. Гъвкавата извивка в края работи като пружина без метални части.',
      'Комплектът съдържа четири щипки, които лесно се разпознават в чекмеджето.',
    ],
    highlights: ['4 броя в комплект', 'Пружинираща извивка без метал', 'Дължина около 11 см'],
    category: 'kuhnya-i-organizaciya', priceCents: 890,
    variants: [
      { id: 'pastelen-miks', name: 'Пастелен микс', filaments: ['lavandula', 'menta', 'praskova', 'slance'] },
      { id: 'lilav-koral', name: 'Лилаво и корал', filaments: ['lilav', 'koral'] },
      { id: 'mlechen', name: 'Млечнобял', filaments: ['mlechen'] },
    ],
    specs: { dimensions: 'Дължина около 11 см, ширина 1,8 см', material: PLA, includes: '4 щипки', care: careSoft },
    notice: foodNotice,
    badges: ['set'], tags: ['щипки', 'кухня', 'пликове', 'организация', 'комплект'], everyday: true, featured: true, rank: 3,
  },
  {
    id: 'p06', slug: 'organizer-modul', name: 'Органайзер за чекмедже „Модул“', tagline: '5 тави, които се подреждат по твой начин',
    description: [
      'Пет тави в различни размери, които се допълват в квадрат от 24 × 24 см. Подреди ги в чекмеджето на кухнята, бюрото или банята и ги пренареждай, когато нуждите се променят.',
    ],
    highlights: ['5 тави в комплект', 'Модулна мрежа 8 см', 'Височина 5 см'],
    category: 'kuhnya-i-organizaciya', alsoIn: ['praktichni-resheniya'], priceCents: 2790,
    variants: [
      { id: 'mlechen', name: 'Млечнобял', filaments: ['mlechen'] },
      { id: 'grafit', name: 'Графит', filaments: ['grafit'] },
      { id: 'lavandula', name: 'Лавандула', filaments: ['lavandula'] },
    ],
    specs: { dimensions: 'Общо 24 × 24 × 5 см (тави 8×24, 16×8, 8×16 и 2 × 8×8 см)', material: PLA, includes: '5 тави', care: careSoft },
    propsNote: 'Моливите и дребните предмети на снимката не са включени.',
    badges: ['set'], tags: ['органайзер', 'чекмедже', 'тави', 'подреждане', 'модулен'], everyday: true, featured: true, rank: 2,
  },
  {
    id: 'p07', slug: 'stoyka-etazh', name: 'Стойка на нива „Етаж“', tagline: 'Три нива за буркани и подправки',
    description: [
      'Стъпаловидна стойка, която повдига задния ред буркани, за да виждаш всичко наведнъж. Подходяща за шкаф, плот или килер.',
    ],
    highlights: ['Три нива', 'Широчина 30 см', 'Подходяща за шкаф и плот'],
    category: 'kuhnya-i-organizaciya', priceCents: 2190,
    variants: [
      { id: 'mlechen', name: 'Млечнобял', filaments: ['mlechen'] },
      { id: 'maslina', name: 'Маслина', filaments: ['maslina'] },
      { id: 'grafit', name: 'Графит', filaments: ['grafit'] },
    ],
    specs: { dimensions: '30 × 21 × 9 см', material: PLA, care: careSoft },
    propsNote: 'Бурканите на снимката не са включени.',
    notice: foodNotice,
    badges: [], tags: ['подправки', 'буркани', 'кухня', 'шкаф', 'стойка'], everyday: true, rank: 10,
  },
  {
    id: 'p08', slug: 'organizer-kapka', name: 'Органайзер за мивка „Капка“', tagline: 'Две отделения и отвори за оттичане',
    description: [
      'Компактен органайзер с две отделения — за гъба и четка или за сапун и кърпичка. Процепите в дъното помагат водата да се оттича.',
    ],
    highlights: ['Две отделения', 'Процепи за оттичане', 'Нисък преден ръб'],
    category: 'kuhnya-i-organizaciya', priceCents: 1190,
    variants: [
      { id: 'mlechen', name: 'Млечнобял', filaments: ['mlechen'] },
      { id: 'menta', name: 'Мента', filaments: ['menta'] },
      { id: 'grafit', name: 'Графит', filaments: ['grafit'] },
    ],
    specs: { dimensions: '17 × 9,5 × 8 см', material: PLA, care: careSoft },
    propsNote: 'Гъбата на снимката не е включена.',
    badges: ['new'], tags: ['мивка', 'гъба', 'кухня', 'баня', 'органайзер'], everyday: true, rank: 13,
  },

  // ------------------------------------------------------------ Играчки и забавление
  {
    id: 'p09', slug: 'drakon-iskra', name: 'Подвижен дракон „Искра“', tagline: 'Ставно тяло, крила и характер',
    description: [
      'Дракон със свързани сегменти, които се извиват при всяко движение. Крилата и шипчетата са в контрастен цвят, за да изпъква на рафта или бюрото.',
      'Отпечатан като едно цяло — ставите са готови за движение веднага.',
    ],
    highlights: ['Подвижни сегменти', 'Двуцветен дизайн', 'Дължина около 24 см'],
    category: 'igrachki-i-zabavlenie', priceCents: 1890,
    variants: [
      { id: 'lilav', name: 'Лилав с корал', filaments: ['lilav', 'koral'] },
      { id: 'koral', name: 'Корал с лилаво', filaments: ['koral', 'lilav'] },
      { id: 'menta', name: 'Мента с лавандула', filaments: ['menta', 'lavandula'] },
    ],
    specs: { dimensions: 'Дължина около 24 см', material: PLA, care: careDecor },
    notice: toyNotice,
    badges: ['picked'], tags: ['дракон', 'играчка', 'фигура', 'подвижна', 'подарък'], featured: true, rank: 5,
  },
  {
    id: 'p10', slug: 'oktopod-osmi', name: 'Октопод „Осми“', tagline: 'Осем пипала, които се движат',
    description: [
      'Кръгъл, усмихнат октопод със ставни пипала. Обича да седи на ръба на монитора или да пази ключовете в антрето.',
    ],
    highlights: ['8 подвижни пипала', 'Двуцветни райета', 'Компактен размер'],
    category: 'igrachki-i-zabavlenie', priceCents: 1490,
    variants: [
      { id: 'koral', name: 'Корал', filaments: ['koral', 'praskova'] },
      { id: 'lavandula', name: 'Лавандула', filaments: ['lavandula', 'lilav'] },
      { id: 'nebe', name: 'Небесно', filaments: ['nebe', 'mlechen'] },
    ],
    specs: { dimensions: 'Около 22 × 22 × 11 см', material: PLA, care: careDecor },
    notice: toyNotice,
    badges: ['picked'], tags: ['октопод', 'играчка', 'фигура', 'подвижна', 'бюро'], featured: true, rank: 6,
  },
  {
    id: 'p11', slug: 'fidget-mehanizam', name: 'Фиджет „Механизъм“', tagline: 'Зъбни колела, които се въртят заедно',
    description: [
      'Четири зъбни колела на обща основа — завърти едното и всички тръгват. Тих и приятен начин да заемеш ръцете си по време на разговор или размисъл.',
    ],
    highlights: ['4 свързани зъбни колела', 'Тиха работа', 'Удобен размер за бюро'],
    category: 'igrachki-i-zabavlenie', alsoIn: ['praktichni-resheniya'], priceCents: 1690,
    variants: [
      { id: 'lilav-koral', name: 'Лилаво и корал', filaments: ['lilav', 'koral'] },
      { id: 'grafit-slance', name: 'Графит и слънчогледово', filaments: ['grafit', 'slance'] },
      { id: 'menta-mlechen', name: 'Мента и млечнобяло', filaments: ['menta', 'mlechen'] },
    ],
    specs: { dimensions: '16,5 × 11,5 × 2,3 см', material: PLA, care: careDecor },
    notice: toyNotice,
    badges: ['new'], tags: ['фиджет', 'зъбни колела', 'бюро', 'антистрес'], rank: 12,
  },
  {
    id: 'p12', slug: 'ribka-luna', name: 'Гъвкава рибка „Луна“', tagline: 'Райета, които се огъват',
    description: [
      'Рибка от свързани сегменти, които се огъват наляво и надясно. Малка радост в джоба, в раницата или на рафта.',
    ],
    highlights: ['Гъвкави сегменти', 'Двуцветни райета', 'Дължина около 20 см'],
    category: 'igrachki-i-zabavlenie', priceCents: 990,
    variants: [
      { id: 'koral-praskova', name: 'Корал и праскова', filaments: ['koral', 'praskova'] },
      { id: 'nebe-mlechen', name: 'Небесно и млечнобяло', filaments: ['nebe', 'mlechen'] },
      { id: 'lilav-lavandula', name: 'Лилаво и лавандула', filaments: ['lilav', 'lavandula'] },
    ],
    specs: { dimensions: 'Около 20 × 9 × 1,3 см', material: PLA, care: careDecor },
    notice: toyNotice,
    badges: [], tags: ['рибка', 'играчка', 'гъвкава', 'фиджет'], rank: 15,
  },

  // ------------------------------------------------------------ Аксесоари и ключодържатели
  {
    id: 'p13', slug: 'klyuchodarzhatel-ime', name: 'Ключодържател с име', tagline: 'Релефно име върху цветна основа',
    description: [
      'Изпиши име, прякор или кратка дума и го носи навсякъде. Буквите са релефни и в контрастен цвят, а основата следва формата на надписа.',
      'Подходящ за ключове, раница, чанта за детска градина или като малък подарък с голямо значение.',
    ],
    highlights: ['До 10 символа', 'Кирилица и латиница', 'Включена метална халка'],
    category: 'aksesoari-i-klyuchodarzhateli', alsoIn: ['personalizirani-podaraci'], priceCents: 790,
    variants: [
      { id: 'lilav', name: 'Лилав с бели букви', filaments: ['lilav', 'mlechen'] },
      { id: 'koral', name: 'Корал с бели букви', filaments: ['koral', 'mlechen'] },
      { id: 'menta', name: 'Мента с лилави букви', filaments: ['menta', 'lilav'] },
      { id: 'grafit', name: 'Графит с жълти букви', filaments: ['grafit', 'slance'] },
    ],
    personalization: {
      label: 'Надпис', placeholder: 'напр. Мила', help: 'До 10 символа — букви, цифри, интервал или тире.',
      maxLength: 10, required: true,
    },
    specs: { dimensions: 'Дължина според надписа (около 8–12 см), височина около 3 см', material: PLA, includes: 'Метална халка', care: careDecor },
    badges: ['personalizable', 'picked'], tags: ['ключодържател', 'име', 'персонализиран', 'подарък', 'деца'], featured: true, rank: 2,
  },
  {
    id: 'p14', slug: 'klyuchodarzhatel-bezkraynost', name: 'Ключодържател „Безкрайност“', tagline: 'Двуцветна примка, вдъхновена от логото ни',
    description: [
      'Плавна осмица в два цвята — същата линия, която свързва двете „о“ в нашето име. Лек, приятен на допир и лесен за намиране в чантата.',
    ],
    highlights: ['Двуцветна осмица', 'Лек и здрав', 'Включена метална халка'],
    category: 'aksesoari-i-klyuchodarzhateli', priceCents: 690,
    variants: [
      { id: 'lilav-koral', name: 'Лилаво и корал', filaments: ['lilav', 'koral'] },
      { id: 'grafit-slance', name: 'Графит и слънчогледово', filaments: ['grafit', 'slance'] },
      { id: 'lavandula-menta', name: 'Лавандула и мента', filaments: ['lavandula', 'menta'] },
    ],
    specs: { dimensions: 'Около 6,5 × 2,8 см', material: PLA, includes: 'Метална халка', care: careDecor },
    badges: ['new'], tags: ['ключодържател', 'безкрайност', 'аксесоар'], rank: 14,
  },
  {
    id: 'p15', slug: 'zheton-kolichka', name: 'Жетон за количка', tagline: 'Комплект от 2 жетона с халка',
    description: [
      'Два жетона с размер на монета, които винаги са на ключовете, когато ти трябва количка в магазина. По желание добави инициали.',
    ],
    highlights: ['2 броя в комплект', '⌀ около 23 мм', 'По желание — инициали'],
    category: 'aksesoari-i-klyuchodarzhateli', alsoIn: ['praktichni-resheniya', 'personalizirani-podaraci'], priceCents: 590,
    variants: [
      { id: 'lilav-koral', name: 'Лилаво и корал', filaments: ['lilav', 'koral'] },
      { id: 'menta-slance', name: 'Мента и слънчогледово', filaments: ['menta', 'slance'] },
      { id: 'grafit-mlechen', name: 'Графит и млечнобяло', filaments: ['grafit', 'mlechen'] },
    ],
    personalization: {
      label: 'Инициали (по желание)', placeholder: 'напр. М.П.', help: 'До 4 символа. Остави празно за жетон със сърце.',
      maxLength: 4, required: false,
    },
    specs: { dimensions: '⌀ около 23 мм, дебелина 2,3 мм', material: PLA, includes: '2 жетона и метална халка', care: careDecor },
    notice: 'Съвместимостта с конкретни колички не е гарантирана — системите в магазините се различават.',
    badges: ['set', 'personalizable'], tags: ['жетон', 'количка', 'ключодържател', 'пазаруване'], everyday: true, rank: 16,
  },

  // ------------------------------------------------------------ Практични решения
  {
    id: 'p16', slug: 'stoyka-naklon', name: 'Поставка за телефон „Наклон“', tagline: 'Удобен ъгъл за видео и рецепти',
    description: [
      'Стабилна поставка с наклон, удобен за гледане на видео, следване на рецепта или видеоразговор. Предният ръб задържа телефона, а широката основа не му позволява да се преобърне.',
    ],
    highlights: ['Удобен наклон за гледане', 'Широка стабилна основа', 'Подходяща и за телефон с калъф'],
    category: 'praktichni-resheniya', priceCents: 1290,
    variants: [
      { id: 'mlechen', name: 'Млечнобял', filaments: ['mlechen'] },
      { id: 'lilav', name: 'Лилав', filaments: ['lilav'] },
      { id: 'grafit', name: 'Графит', filaments: ['grafit'] },
      { id: 'koral', name: 'Корал', filaments: ['koral'] },
    ],
    specs: { dimensions: 'Ширина 7,5 см, дълбочина около 10 см', material: PLA, care: careDecor },
    propsNote: 'Телефонът на снимката не е включен.',
    badges: ['picked'], tags: ['телефон', 'поставка', 'бюро', 'кухня', 'видео'], everyday: true, featured: true, rank: 3,
  },
  {
    id: 'p17', slug: 'klips-kabeli', name: 'Клипсове за кабели „Ред“', tagline: 'Комплект от 2 клипса с по 3 канала',
    description: [
      'Кабелите вече не падат зад бюрото. Всеки клипс държи до три кабела на едно място — за зарядно, слушалки и лампа.',
    ],
    highlights: ['2 клипса × 3 канала', 'За кабели с ⌀ до около 7 мм', 'Стои стабилно на бюрото'],
    category: 'praktichni-resheniya', priceCents: 690,
    variants: [
      { id: 'koral', name: 'Корал', filaments: ['koral'] },
      { id: 'mlechen', name: 'Млечнобял', filaments: ['mlechen'] },
      { id: 'grafit', name: 'Графит', filaments: ['grafit'] },
    ],
    specs: { dimensions: '6,2 × 2,2 × 1,6 см', material: PLA, includes: '2 клипса (лентата за залепване — предстои уточняване)', care: careDecor },
    propsNote: 'Кабелите на снимката не са включени.',
    badges: ['set'], tags: ['кабели', 'клипс', 'бюро', 'организация'], everyday: true, rank: 8,
  },
  {
    id: 'p18', slug: 'darzhach-daga', name: 'Държач за слушалки „Дъга“', tagline: 'Място за слушалките, когато не звучат',
    description: [
      'Висок държач със закръглена дъга, която разпределя тежестта на лентата и не я притиска. Слушалките остават подредени, а бюрото — свободно.',
    ],
    highlights: ['Закръглена опорна дъга', 'Стабилна основа', 'Височина около 26 см'],
    category: 'praktichni-resheniya', priceCents: 2390,
    variants: [
      { id: 'lilav', name: 'Лилав', filaments: ['lilav'] },
      { id: 'mlechen', name: 'Млечнобял', filaments: ['mlechen'] },
      { id: 'grafit', name: 'Графит', filaments: ['grafit'] },
    ],
    specs: { dimensions: 'Основа 13 × 9 см, височина около 26 см', material: PLA, care: careDecor },
    propsNote: 'Слушалките на снимката не са включени.',
    badges: [], tags: ['слушалки', 'държач', 'бюро', 'гейминг'], everyday: true, featured: true, rank: 7,
  },
  {
    id: 'p19', slug: 'organizer-terasa', name: 'Органайзер за бюро „Тераса“', tagline: 'Моливи, бележки и дребни неща на едно място',
    description: [
      'Органайзер с чаша за моливи, отделения за бележки и плитка тава отпред. Различните височини правят всичко видимо и лесно достъпно.',
    ],
    highlights: ['Чаша за моливи', 'Три вертикални отделения', 'Предна тава за дребни неща'],
    category: 'praktichni-resheniya', alsoIn: ['kuhnya-i-organizaciya'], priceCents: 2590,
    variants: [
      { id: 'mlechen', name: 'Млечнобял', filaments: ['mlechen'] },
      { id: 'lavandula', name: 'Лавандула', filaments: ['lavandula'] },
      { id: 'grafit', name: 'Графит', filaments: ['grafit'] },
    ],
    specs: { dimensions: '22 × 13 × 11 см', material: PLA, care: careDecor },
    propsNote: 'Моливите и картите на снимката не са включени.',
    badges: [], tags: ['бюро', 'органайзер', 'моливи', 'офис', 'училище'], everyday: true, rank: 6,
  },
  {
    id: 'p20', slug: 'kuki-stena', name: 'Стенни куки „Кука“', tagline: 'Комплект от 3 куки за ключове и чанти',
    description: [
      'Три закръглени куки за антрето, гардероба или детската стая. Плавната извивка задържа халки, чанти и шалове, без да ги наранява.',
    ],
    highlights: ['3 броя в комплект', 'Закръглена извивка', 'За ключове, чанти и шалове'],
    category: 'praktichni-resheniya', alsoIn: ['dom-i-dekoraciya'], priceCents: 1390,
    variants: [
      { id: 'miks', name: 'Лилав, корал и лавандула', filaments: ['lilav', 'koral', 'lavandula'] },
      { id: 'mlechen', name: 'Млечнобял', filaments: ['mlechen'] },
      { id: 'grafit', name: 'Графит', filaments: ['grafit'] },
    ],
    specs: { dimensions: 'Всяка кука около 2 × 3,8 × 7,5 см', material: PLA, includes: '3 куки (начинът на монтаж и максималното натоварване предстои да бъдат уточнени)', care: careDecor },
    propsNote: 'Дървената основа на снимката не е включена.',
    badges: ['set'], tags: ['куки', 'стена', 'антре', 'ключове', 'закачалка'], everyday: true, rank: 17,
  },

  // ------------------------------------------------------------ Персонализирани подаръци
  {
    id: 'p21', slug: 'tabelka-ime', name: 'Табелка с име „Облаче“', tagline: 'За вратата, рафта или детската стая',
    description: [
      'Облаче с релефно име и малка звезда, което стои на собствена основа. Красив акцент за детска стая, работно място или подарък за ново начало.',
      'Изпиши име до 12 символа — ние ще подредим буквите така, че да изглеждат балансирано.',
    ],
    highlights: ['Име до 12 символа', 'Основа за стоене', 'Двуцветен релеф'],
    category: 'personalizirani-podaraci', priceCents: 1990,
    variants: [
      { id: 'mlechen', name: 'Млечнобял с лилаво', filaments: ['mlechen', 'lilav', 'koral'] },
      { id: 'lavandula', name: 'Лавандула с лилаво', filaments: ['lavandula', 'lilav', 'slance'] },
      { id: 'menta', name: 'Мента с бяло', filaments: ['menta', 'mlechen', 'koral'] },
    ],
    personalization: {
      label: 'Име', placeholder: 'напр. Алекс', help: 'До 12 символа — букви, цифри, интервал или тире.',
      maxLength: 12, required: true,
    },
    specs: { dimensions: 'Около 21 × 11 см (с основата)', material: PLA, care: careDecor },
    badges: ['personalizable'], tags: ['табелка', 'име', 'детска стая', 'подарък', 'персонализиран'], featured: true, rank: 4,
  },
  {
    id: 'p22', slug: 'molivnik-ime', name: 'Моливник с име', tagline: 'Шестоъгълна чаша за бюро',
    description: [
      'Шестоъгълен моливник с релефно име отпред. Подреден старт на учебната година, подарък за учител или лично място за химикалките в офиса.',
    ],
    highlights: ['Име до 8 символа', 'Шестоъгълна форма', 'Височина 10,5 см'],
    category: 'personalizirani-podaraci', alsoIn: ['praktichni-resheniya'], priceCents: 1690,
    variants: [
      { id: 'koral', name: 'Корал с бели букви', filaments: ['koral', 'mlechen'] },
      { id: 'lilav', name: 'Лилав с жълти букви', filaments: ['lilav', 'slance'] },
      { id: 'mlechen', name: 'Млечнобял с лилави букви', filaments: ['mlechen', 'lilav'] },
    ],
    personalization: {
      label: 'Име', placeholder: 'напр. Яна', help: 'До 8 символа, за да се събере на предната стена.',
      maxLength: 8, required: true,
    },
    specs: { dimensions: '⌀ около 8,8 см, височина 10,5 см', material: PLA, care: careDecor },
    propsNote: 'Моливите на снимката не са включени.',
    badges: ['personalizable', 'new'], tags: ['моливник', 'име', 'училище', 'бюро', 'подарък'], rank: 5,
  },
]

/** Demo catalogue, used when the backend has no Imagoo products yet (see stores/catalog.ts). */
export const demoProducts: DemoProduct[] = [...wave1, ...wave2, ...community]
