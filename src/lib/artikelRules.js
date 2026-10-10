// Artikel (der/die/das) rules and a matcher that returns tips for a given noun.
//
// Rule kinds:
//  - form rules   : suffix / prefix patterns. Only the FIRST matching form rule is used
//                   (the list is ordered from most to least specific).
//  - word rules   : semantic groups (weekdays, weather, metals, ...)
//
// Reliability:
//  - 'always'   : (almost) no exceptions
//  - 'mostly'   : strong tendency; if the real article differs we show it as an exception
//  - 'tendency' : weak tendency; only shown when it agrees with the real article

const lw = (s) => s.toLowerCase();

const suffix = (suffixes, { minLength = 0, exclude = [] } = {}) => (word) =>
  word.length >= minLength &&
  !exclude.some((ex) => word.endsWith(ex)) &&
  suffixes.some((s) => word.endsWith(s) && word.length > s.length + 1);

const wordList = (words, { exact = false } = {}) => {
  const list = words.map(lw);
  return (word) => list.some((w) => (exact || w.length < 4 ? word === w : word === w || word.endsWith(w)));
};

const N_DEKLINATION_WORDS = [
  'junge', 'kollege', 'kunde', 'name', 'gedanke', 'glaube', 'buchstabe', 'friede', 'wille',
  'löwe', 'affe', 'hase', 'neffe', 'experte', 'franzose', 'türke', 'pole', 'russe', 'grieche',
  'chinese', 'zeuge', 'bote', 'laie', 'riese', 'käse', 'kommilitone', 'sklave', 'bulle', 'rabe',
];

// Words ending in -chen that are NOT diminutives
const NON_DIMINUTIVE_CHEN = ['kuchen', 'zeichen', 'rachen', 'drachen', 'knochen', 'bücher'];

// ---------------------------------------------------------------------------
// FORM RULES (ordered: most specific first)
// ---------------------------------------------------------------------------
export const FORM_RULES = [
  {
    id: 'ge-e',
    article: 'das',
    reliability: 'mostly',
    title: 'Ge- … -e',
    text: '"Ge-" ile başlayıp "-e" ile biten isimler genellikle "das" alır.',
    examples: ['das Gebäude', 'das Gebirge', 'das Gemüse', 'das Getränke'],
    test: (w) => w.startsWith('ge') && w.endsWith('e') && w.length > 5,
  },
  {
    id: 'diminutive',
    article: 'das',
    reliability: 'always',
    title: '-chen / -lein',
    text: 'Küçültme ekleri "-chen" ve "-lein" ile biten isimler her zaman "das" alır – canlı olsa bile.',
    examples: ['das Mädchen', 'das Brötchen', 'das Fräulein'],
    test: (w) =>
      suffix(['lein'])(w) ||
      (suffix(['chen'])(w) && !NON_DIMINUTIVE_CHEN.some((x) => w.endsWith(x))),
  },
  {
    id: 'n-deklination',
    article: 'der',
    reliability: 'mostly',
    title: 'Erkek canlılar -e (n-Deklination)',
    text: '"-e" ile biten erkek kişi/hayvan isimleri ve "-loge/-oge" meslekleri "der" alır (n-Deklination). Bazı soyut kelimeler de bu gruba girer: der Name, der Gedanke, der Glaube.',
    examples: ['der Junge', 'der Kollege', 'der Biologe', 'der Löwe'],
    test: (w) => wordList(N_DEKLINATION_WORDS)(w) || suffix(['loge', 'oge'])(w),
  },
  {
    id: 'ling',
    article: 'der',
    reliability: 'always',
    title: '-ling',
    text: '"-ling" ile biten isimler "der" alır.',
    examples: ['der Frühling', 'der Lehrling', 'der Schmetterling'],
    test: suffix(['ling']),
  },
  {
    id: 'ung',
    article: 'die',
    reliability: 'always',
    title: '-ung',
    text: '"-ung" ile biten isimler her zaman "die" alır.',
    examples: ['die Zeitung', 'die Wohnung', 'die Meinung'],
    test: suffix(['ung'], { exclude: ['sprung', 'schwung', 'dung'] }),
  },
  {
    id: 'heit-keit',
    article: 'die',
    reliability: 'always',
    title: '-heit / -keit',
    text: '"-heit" ve "-keit" ile biten soyut isimler her zaman "die" alır.',
    examples: ['die Freiheit', 'die Gesundheit', 'die Möglichkeit'],
    test: suffix(['heit', 'keit']),
  },
  {
    id: 'schaft',
    article: 'die',
    reliability: 'always',
    title: '-schaft',
    text: '"-schaft" ile biten isimler her zaman "die" alır.',
    examples: ['die Freundschaft', 'die Mannschaft', 'die Wirtschaft'],
    test: suffix(['schaft']),
  },
  {
    id: 'kunft-fahrt',
    article: 'die',
    reliability: 'always',
    title: '-kunft / -fahrt',
    text: '"-kunft" ve "-fahrt" ile biten isimler "die" alır.',
    examples: ['die Ankunft', 'die Zukunft', 'die Abfahrt'],
    test: suffix(['kunft', 'fahrt']),
  },
  {
    id: 'tum',
    article: 'das',
    reliability: 'mostly',
    title: '-tum',
    text: '"-tum" ile biten isimler genellikle "das" alır. İstisnalar: der Irrtum, der Reichtum.',
    examples: ['das Eigentum', 'das Wachstum', 'das Christentum'],
    test: suffix(['tum']),
  },
  {
    id: 'ment',
    article: 'das',
    reliability: 'mostly',
    title: '-ment',
    text: 'Yabancı kökenli "-ment" ile biten isimler genellikle "das" alır. İstisna: der Moment, der Zement.',
    examples: ['das Dokument', 'das Medikament', 'das Instrument'],
    test: suffix(['ment']),
  },
  {
    id: 'ion',
    article: 'die',
    reliability: 'always',
    title: '-ion',
    text: '"-ion" (-tion, -sion) ile biten isimler "die" alır.',
    examples: ['die Station', 'die Information', 'die Diskussion'],
    test: suffix(['ion']),
  },
  {
    id: 'taet',
    article: 'die',
    reliability: 'always',
    title: '-tät / -ität',
    text: '"-tät" ile biten isimler "die" alır.',
    examples: ['die Universität', 'die Qualität', 'die Realität'],
    test: suffix(['tät']),
  },
  {
    id: 'ismus',
    article: 'der',
    reliability: 'always',
    title: '-ismus',
    text: '"-ismus" ile biten isimler "der" alır.',
    examples: ['der Tourismus', 'der Journalismus', 'der Optimismus'],
    test: suffix(['ismus']),
  },
  {
    id: 'female-in',
    article: 'die',
    reliability: 'always',
    title: '-in (kadın)',
    text: 'Kadın kişi/meslek bildiren "-in" ekli isimler "die" alır.',
    examples: ['die Lehrerin', 'die Ärztin', 'die Kollegin'],
    test: suffix(['erin', 'arin', 'ärin', 'orin', 'istin', 'antin', 'entin', 'ztin', 'gin', 'ndin', 'öwin', 'nin']),
  },
  {
    id: 'anz-enz',
    article: 'die',
    reliability: 'always',
    title: '-anz / -enz',
    text: '"-anz" ve "-enz" ile biten isimler "die" alır.',
    examples: ['die Toleranz', 'die Distanz', 'die Konferenz'],
    test: suffix(['anz', 'enz']),
  },
  {
    id: 'ik',
    article: 'die',
    reliability: 'mostly',
    title: '-ik',
    text: '"-ik" ile biten isimler genellikle "die" alır.',
    examples: ['die Musik', 'die Politik', 'die Technik'],
    test: suffix(['ik']),
  },
  {
    id: 'ade',
    article: 'die',
    reliability: 'always',
    title: '-ade',
    text: '"-ade" ile biten isimler her zaman "die" alır.',
    examples: ['die Schokolade', 'die Marmelade', 'die Limonade'],
    test: suffix(['ade']),
  },
  {
    id: 'age',
    article: 'die',
    reliability: 'always',
    title: '-age',
    text: 'Fransızca kökenli "-age" ile biten isimler "die" alır.',
    examples: ['die Garage', 'die Reportage', 'die Massage'],
    test: suffix(['age']),
  },
  {
    id: 'ette',
    article: 'die',
    reliability: 'always',
    title: '-ette',
    text: '"-ette" ile biten isimler her zaman "die" alır.',
    examples: ['die Zigarette', 'die Serviette', 'die Marionette'],
    test: suffix(['ette']),
  },
  {
    id: 'ine',
    article: 'die',
    reliability: 'always',
    title: '-ine',
    text: '"-ine" ile biten isimler "die" alır.',
    examples: ['die Maschine', 'die Praline', 'die Kabine'],
    test: suffix(['ine']),
  },
  {
    id: 'thek',
    article: 'die',
    reliability: 'always',
    title: '-thek / -theke',
    text: '"-thek" veya "-theke" ile biten isimler "die" alır.',
    examples: ['die Bibliothek', 'die Diskothek', 'die Apotheke'],
    test: suffix(['thek', 'theke', 'teke']),
  },
  {
    id: 'ose-se',
    article: 'die',
    reliability: 'mostly',
    title: '-ose / -se',
    text: 'Yunanca kökenli "-ose" ve "-se" ile biten soyut kavramlar genellikle "die" alır.',
    examples: ['die Diagnose', 'die Krise', 'die Analyse', 'die Phase'],
    test: suffix(['ose', 'yse', 'ase', 'ise']),
  },
  {
    id: 'ie',
    article: 'die',
    reliability: 'mostly',
    title: '-ie',
    text: '"-ie" ile biten isimler genellikle "die" alır. İstisna: das Knie.',
    examples: ['die Familie', 'die Biologie', 'die Energie'],
    test: suffix(['ie']),
  },
  {
    id: 'ei',
    article: 'die',
    reliability: 'mostly',
    title: '-ei',
    text: '"-ei" ile biten isimler genellikle "die" alır. İstisna: das Ei, der Papagei.',
    examples: ['die Bäckerei', 'die Polizei', 'die Türkei'],
    test: suffix(['ei']),
  },
  {
    id: 'ur',
    article: 'die',
    reliability: 'mostly',
    title: '-ur',
    text: 'Yabancı kökenli "-ur" ile biten isimler genellikle "die" alır. İstisna: das Abitur.',
    examples: ['die Natur', 'die Kultur', 'die Reparatur'],
    test: suffix(['ur'], { minLength: 5 }),
  },
  {
    id: 'eur-ant-ent',
    article: 'der',
    reliability: 'mostly',
    title: '-eur / -ant / -ent / -ist',
    text: 'Kişi bildiren yabancı kökenli "-eur, -ant, -ent, -ist" ekleri genellikle "der" alır.',
    examples: ['der Friseur', 'der Praktikant', 'der Student', 'der Tourist'],
    test: suffix(['eur', 'ant', 'ent', 'ist'], { minLength: 5 }),
  },
  {
    id: 'or',
    article: 'der',
    reliability: 'mostly',
    title: '-or',
    text: '"-or" ile biten isimler genellikle "der" alır. İstisna: das Labor, das Tor.',
    examples: ['der Motor', 'der Autor', 'der Monitor'],
    test: suffix(['or'], { minLength: 4 }),
  },
  {
    id: 'ich-ig',
    article: 'der',
    reliability: 'mostly',
    title: '-ich / -ig',
    text: '"-ich" ve "-ig" ile biten isimler genellikle "der" alır.',
    examples: ['der Teppich', 'der Honig', 'der König'],
    test: suffix(['ich', 'ig']),
  },
  {
    id: 'um',
    article: 'das',
    reliability: 'mostly',
    title: '-um (Latince)',
    text: 'Latince kökenli "-um" ile biten isimler genellikle "das" alır.',
    examples: ['das Museum', 'das Zentrum', 'das Studium'],
    test: suffix(['eum', 'ium', 'um'], { minLength: 6 }),
  },
  {
    id: 'ma',
    article: 'das',
    reliability: 'mostly',
    title: '-ma',
    text: 'Yunanca kökenli "-ma" ile biten isimler genellikle "das" alır. İstisna: die Firma.',
    examples: ['das Thema', 'das Klima', 'das Drama'],
    test: suffix(['ma'], { minLength: 5 }),
  },
  {
    id: 'ett',
    article: 'das',
    reliability: 'mostly',
    title: '-ett',
    text: '"-ett" ile biten isimler genellikle "das" alır.',
    examples: ['das Bett', 'das Kabinett', 'das Tablett'],
    test: suffix(['ett']),
  },
  {
    id: 'phon',
    article: 'das',
    reliability: 'always',
    title: '-phon / -fon',
    text: '"-phon" veya "-fon" ile biten alet ve cihaz isimleri "das" alır.',
    examples: ['das Telefon', 'das Smartphone', 'das Mikrofon'],
    test: suffix(['phon', 'fon']),
  },
  {
    id: 'at-latin',
    article: 'das',
    reliability: 'mostly',
    title: '-at (Latince)',
    text: 'Yabancı kökenli "-at" ile biten soyut/resmi isimler genellikle "das" alır. İstisna: der Salat, der Soldat.',
    examples: ['das Referat', 'das Diktat', 'das Resultat', 'das Plakat'],
    test: suffix(['at'], { minLength: 5, exclude: ['salat', 'soldat', 'senat', 'apparat', 'privat'] }),
  },
  {
    id: 'iv-suffix',
    article: 'das',
    reliability: 'mostly',
    title: '-iv',
    text: 'Latince/Fransızca kökenli "-iv" ile biten isimler çoğunlukla "das" alır.',
    examples: ['das Substantiv', 'das Adjektiv', 'das Motiv', 'das Archiv'],
    test: suffix(['tiv', 'siv', 'chiv'], { minLength: 5 }),
  },
  {
    id: 'il-suffix',
    article: 'das',
    reliability: 'mostly',
    title: '-il',
    text: '"-il" ile biten isimler çoğunlukla "das" alır.',
    examples: ['das Profil', 'das Ventil', 'das Fossil', 'das Krokodil'],
    test: suffix(['fil', 'til', 'sil', 'dil'], { minLength: 5 }),
  },
  {
    id: 'nis',
    article: 'das',
    reliability: 'mostly',
    title: '-nis',
    text: '"-nis" ile biten isimlerin çoğu "das" alır. Ama bazıları "die": die Erlaubnis, die Kenntnis.',
    examples: ['das Ergebnis', 'das Zeugnis', 'das Erlebnis'],
    test: suffix(['nis']),
  },
  {
    id: 'ing-english',
    article: 'das',
    reliability: 'mostly',
    title: '-ing (İngilizce)',
    text: 'İngilizce kökenli "-ing" isimleri genellikle "das" alır.',
    examples: ['das Training', 'das Meeting', 'das Marketing'],
    test: suffix(['ing'], { exclude: ['ling'] }),
  },
  {
    id: 'o',
    article: 'das',
    reliability: 'mostly',
    title: '-o',
    text: '"-o" ile biten (çoğunlukla kısaltılmış/yabancı) isimler genellikle "das" alır. İstisna: der Euro, die Disco.',
    examples: ['das Auto', 'das Radio', 'das Büro', 'das Foto'],
    test: suffix(['o'], { minLength: 3 }),
  },
  {
    id: 'e',
    article: 'die',
    reliability: 'mostly',
    title: '-e',
    text: '"-e" ile biten isimlerin yaklaşık %90\'ı "die" alır. İstisnalar: das Auge, das Ende, der Käse.',
    examples: ['die Lampe', 'die Straße', 'die Sprache'],
    test: suffix(['e'], { exclude: ['ee'] }),
  },
  {
    id: 'ge-prefix',
    article: 'das',
    reliability: 'tendency',
    title: 'Ge-',
    text: '"Ge-" ile başlayan ve fiilden/toplu anlamdan türeyen isimler çoğunlukla "das" alır.',
    examples: ['das Gespräch', 'das Geschenk', 'das Gesetz'],
    test: (w) => w.startsWith('ge') && w.length > 5,
  },
  {
    id: 'infinitive',
    article: 'das',
    reliability: 'tendency',
    title: 'İsim olmuş mastar',
    text: 'Fiillerin mastar hâli isim olarak kullanıldığında her zaman "das" alır.',
    examples: ['das Essen', 'das Schwimmen', 'das Leben'],
    test: suffix(['en'], { minLength: 5 }),
  },
  {
    id: 'er-agent',
    article: 'der',
    reliability: 'tendency',
    title: '-er (kişi / alet)',
    text: 'Fiilden türeyen ve kişi ya da alet bildiren "-er" ekli isimler genellikle "der" alır.',
    examples: ['der Lehrer', 'der Fahrer', 'der Computer'],
    test: suffix(['er'], { minLength: 5 }),
  },
  {
    id: 'verb-stem-masculine',
    article: 'der',
    reliability: 'tendency',
    title: 'Fiil kökünden tek heceli isimler',
    text: 'Fiil kökünden ek almadan türetilen tek heceli isimlerin büyük çoğunluğu "der" alır.',
    examples: ['der Flug (fliegen)', 'der Lauf (laufen)', 'der Beginn', 'der Gang', 'der Blick'],
    test: wordList([
      'flug', 'lauf', 'gang', 'schnitt', 'schritt', 'sprung', 'blick', 'fall', 'ruf', 'traum',
      'schlaf', 'streit', 'wunsch', 'kauf', 'griff', 'start', 'sitz', 'zug', 'druck', 'drucker',
      'brand', 'gruß', 'schlag', 'stoß', 'wurf', 'sieg', 'fang', 'knall', 'bau',
    ], { exact: true }),
  },
];

// ---------------------------------------------------------------------------
// WORD / MEANING RULES
// ---------------------------------------------------------------------------
export const WORD_RULES = [
  {
    id: 'weekdays-months-seasons',
    article: 'der',
    reliability: 'always',
    title: 'Günler, aylar, mevsimler',
    text: 'Haftanın günleri, aylar ve mevsimler "der" alır.',
    examples: ['der Montag', 'der Januar', 'der Sommer'],
    test: wordList([
      'montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonnabend', 'sonntag',
      'januar', 'februar', 'märz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober',
      'november', 'dezember', 'frühling', 'sommer', 'herbst', 'winter',
    ]),
  },
  {
    id: 'times-of-day',
    article: 'der',
    reliability: 'mostly',
    title: 'Günün bölümleri',
    text: 'Günün bölümleri "der" alır – istisna: die Nacht.',
    examples: ['der Morgen', 'der Mittag', 'der Abend'],
    test: wordList(['morgen', 'vormittag', 'mittag', 'nachmittag', 'abend', 'nacht'], { exact: true }),
  },
  {
    id: 'directions-weather',
    article: 'der',
    reliability: 'always',
    title: 'Yönler ve hava olayları',
    text: 'Yönler ve hava olayları "der" alır.',
    examples: ['der Norden', 'der Regen', 'der Schnee', 'der Wind'],
    test: wordList([
      'norden', 'süden', 'osten', 'westen', 'regen', 'schnee', 'wind', 'nebel', 'hagel', 'sturm',
      'frost', 'donner', 'blitz', 'tau', 'taifun', 'tornado', 'orkan',
    ]),
  },
  {
    id: 'alcohol',
    article: 'der',
    reliability: 'mostly',
    title: 'Alkollü içkiler',
    text: 'Alkollü içkiler genellikle "der" alır – istisna: das Bier.',
    examples: ['der Wein', 'der Sekt', 'der Schnaps'],
    test: wordList(['wein', 'sekt', 'schnaps', 'whisky', 'wodka', 'rum', 'likör', 'cognac', 'gin', 'bier'], { exact: true }),
  },
  {
    id: 'metals',
    article: 'das',
    reliability: 'mostly',
    title: 'Metaller',
    text: 'Metallerin çoğu "das" alır – istisna: der Stahl, die Bronze.',
    examples: ['das Gold', 'das Silber', 'das Eisen'],
    test: wordList(['gold', 'silber', 'eisen', 'kupfer', 'blei', 'metall', 'zinn', 'aluminium', 'platin', 'stahl']),
  },
  {
    id: 'colors',
    article: 'das',
    reliability: 'always',
    title: 'Renkler (isim olarak)',
    text: 'İsim olarak kullanılan renkler "das" alır.',
    examples: ['das Rot', 'das Blau', 'das Grün'],
    test: wordList(['rot', 'blau', 'grün', 'gelb', 'schwarz', 'weiß', 'grau', 'braun', 'rosa', 'lila', 'orange'], { exact: true }),
  },
  {
    id: 'young-beings',
    article: 'das',
    reliability: 'always',
    title: 'Yavrular / bebekler',
    text: 'Bebek ve hayvan yavruları "das" alır.',
    examples: ['das Baby', 'das Kind', 'das Kalb', 'das Lamm'],
    test: wordList(['baby', 'kind', 'kalb', 'lamm', 'ferkel', 'küken', 'fohlen', 'kitz'], { exact: true }),
  },
  {
    id: 'hotel-cinema',
    article: 'das',
    reliability: 'always',
    title: 'Hotel, Kino, Café, Restaurant',
    text: 'Hotel, Kino, Café, Restaurant, Theater, Museum gibi mekânlar "das" alır.',
    examples: ['das Hotel', 'das Kino', 'das Café', 'das Restaurant'],
    test: wordList(['hotel', 'kino', 'café', 'cafe', 'restaurant', 'theater', 'museum', 'casino']),
  },
  {
    id: 'numbers',
    article: 'die',
    reliability: 'mostly',
    title: 'Sayılar (isim olarak)',
    text: 'İsim olarak kullanılan sayılar "die" alır (die Eins, die Million). İstisna: das Hundert, das Tausend.',
    examples: ['die Eins', 'die Zehn', 'die Million'],
    test: wordList(['eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'million', 'milliarde', 'hundert', 'tausend'], { exact: true }),
  },
  {
    id: 'car-brands',
    article: 'der',
    reliability: 'always',
    title: 'Araba markaları',
    text: 'Otomobil markaları her zaman "der" alır (der Wagen anlamında).',
    examples: ['der VW', 'der BMW', 'der Mercedes', 'der Audi', 'der Porsche'],
    test: wordList(['vw', 'volkswagen', 'bmw', 'mercedes', 'audi', 'porsche', 'ford', 'opel', 'fiat', 'tesla'], { exact: true }),
  },
  {
    id: 'hot-drinks',
    article: 'der',
    reliability: 'mostly',
    title: 'Kahve, çay, meyve suyu',
    text: 'Sıcak içecekler ve meyve suları genellikle "der" alır.',
    examples: ['der Kaffee', 'der Tee', 'der Saft', 'der Kakao', 'der Espresso'],
    test: wordList(['kaffee', 'tee', 'saft', 'kakao', 'espresso', 'cappuccino'], { exact: true }),
  },
  {
    id: 'languages',
    article: 'das',
    reliability: 'always',
    title: 'Diller (isim olarak)',
    text: 'Diller isim olarak kullanıldığında her zaman "das" alır.',
    examples: ['das Deutsch', 'das Türkisch', 'das Englisch', 'das Französisch'],
    test: (w) => ['deutsch', 'türkisch', 'englisch', 'französisch', 'spanisch', 'italienisch', 'russisch', 'arabisch'].includes(w),
  },
];

// ---------------------------------------------------------------------------
// Noun index (for compound-noun tips)
// ---------------------------------------------------------------------------
let nounIndex = []; // [{ lower, display, articles }] sorted by length desc

export const setArtikelNounIndex = (artikelCards = []) => {
  const map = new Map();
  artikelCards.forEach((card) => {
    const word = cleanNoun(card.noun);
    if (!word || word.includes(' ') || word.length < 4) return;
    const key = lw(word);
    if (!map.has(key)) map.set(key, { lower: key, display: word, articles: card.articles });
  });
  nounIndex = [...map.values()].sort((a, b) => b.lower.length - a.lower.length);
};

const cleanNoun = (noun = '') => noun.replace(/\(.*?\)/g, '').trim();

const findCompoundHead = (word, articles) => {
  const lower = lw(word);
  for (const entry of nounIndex) {
    if (lower.length - entry.lower.length < 3) continue;
    if (lower.endsWith(entry.lower) && entry.articles.some((a) => articles.includes(a))) {
      return entry;
    }
  }
  return null;
};

// ---------------------------------------------------------------------------
// Main matcher
// ---------------------------------------------------------------------------
const toTip = (rule, articles) => {
  const agrees = articles.includes(rule.article);
  if (!agrees && rule.reliability === 'tendency') return null;
  return {
    id: rule.id,
    article: rule.article,
    title: rule.title,
    text: rule.text,
    examples: rule.examples || [],
    reliability: rule.reliability,
    status: agrees ? 'match' : 'exception',
  };
};

/**
 * Returns a list of tips for an Artikel card.
 * Each tip: { id, article, title, text, examples, reliability, status: 'match'|'exception'|'info' }
 */
export const getArtikelTips = (card) => {
  if (!card || !card.noun) return [];
  const articles = card.articles || [];
  const rawNoun = card.noun;
  const tips = [];

  // Plural-only nouns
  if (/\(\s*pl\.?\s*\)/i.test(rawNoun) || /\(\s*plural\s*\)/i.test(rawNoun)) {
    tips.push({
      id: 'plural',
      article: 'die',
      title: 'Çoğul (Plural)',
      text: 'Çoğul isimler her zaman "die" alır – tekilde artikeli ne olursa olsun.',
      examples: ['die Leute', 'die Eltern', 'die Ferien'],
      reliability: 'always',
      status: articles.includes('die') ? 'match' : 'exception',
    });
    return tips;
  }

  const word = cleanNoun(rawNoun).split(/[\s-]+/).pop() || '';
  const lower = lw(word);
  if (!lower) return tips;

  // Compound nouns – the last part decides the article
  const head = findCompoundHead(word, articles);
  if (head) {
    tips.push({
      id: 'compound',
      article: head.articles[0],
      title: 'Bileşik isim',
      text: `Bileşik isimlerde artikeli her zaman son kelime belirler: ${head.articles.join('/')} ${head.display} → ${articles.join('/')} ${word}.`,
      examples: ['das Haus → das Krankenhaus', 'die Tür → die Haustür'],
      reliability: 'always',
      status: 'match',
    });
  }

  // Meaning-based rules
  WORD_RULES.forEach((rule) => {
    if (rule.test(lower)) {
      const tip = toTip(rule, articles);
      if (tip) tips.push(tip);
    }
  });

  // First matching form rule (most specific)
  const formRule = FORM_RULES.find((rule) => rule.test(lower));
  if (formRule) {
    const tip = toTip(formRule, articles);
    // If a compound/meaning rule already explains the article, don't show a misleading "exception"
    const alreadyExplained = tips.some((t) => t.status === 'match');
    if (tip && !(alreadyExplained && tip.status === 'exception')) tips.push(tip);
  }

  return tips;
};
