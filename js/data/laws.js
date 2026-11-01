/* Padişah Hayatı — Kanunlar ve fermanlar
 * m: her ay uygulanan küçük etkiler ; on: ilan edilince ; off: kaldırılınca
 * incMul: vergi geliri çarpanı ; tradeMul: ticaret çarpanı ; cost: aylık masraf
 * era: [en erken, en geç] dönem ; cat: kategori
 */
PH.D.laws = {
  devsirme: { n: 'Devşirme Kanunu', cat: 'Ordu', era: [0, 2], d: 'Rumeli\'nin Hristiyan köylerinden erkek çocuklar toplanarak Enderun ve Ocak için yetiştirilir. Her yıl yeniçeri saflarına taze kan katar, ancak Rumeli\'de huzursuzluk yaratır.', m: { janissary: 0.05 }, on: { janissary: 3 }, off: { janissary: -6, popularity: 2 } },
  kardes: { n: 'Nizam-ı Âlem Kanunu', cat: 'Hanedan', era: [0, 3], d: '"Nizam-ı âlem için" tahta çıkan padişahın kardeşlerini katledebileceği kanun. Taht kavgalarını önler; ancak vicdanlar kanar.', m: { stability: 0.05 }, on: { legitimacy: 2, ulema: -2 }, off: { piety: 2 } },
  kafes: { n: 'Kafes Usulü', cat: 'Hanedan', era: [1, 3], d: 'Şehzadeler sancağa çıkarılmaz, sarayın kafes dairesinde tutulur. İsyan riski azalır, fakat şehzadeler devlet tecrübesinden mahrum büyür.', m: { stability: 0.05 }, on: { stability: 3 }, off: { stability: -3 } },
  icki: { n: 'İçki Yasağı', cat: 'Ahlak', era: [0, 3], d: 'Meyhaneler kapatılır, şarap satışı yasaklanır.', m: { popularity: -0.25, ulema: 0.15 }, incMul: 0.98, on: { ulema: 5, piety: 3, popularity: -4 }, off: { ulema: -4, popularity: 3 } },
  kahve: { n: 'Kahvehane Yasağı', cat: 'Ahlak', era: [1, 3], d: 'Fitne yuvası sayılan kahvehaneler kapatılır. Devlet aleyhine dedikodu azalır ama halk hoşnutsuzdur.', m: { popularity: -0.2, stability: 0.1 }, tradeMul: 0.97, on: { ulema: 3, popularity: -3 }, off: { popularity: 2 } },
  tutun: { n: 'Tütün Yasağı', cat: 'Ahlak', era: [2, 3], d: 'Tütün içmek ağır cezalara bağlanır.', m: { popularity: -0.3, ulema: 0.1 }, tradeMul: 0.97, on: { ulema: 4, popularity: -4, piety: 2 }, off: { popularity: 3, ulema: -2 } },
  kiyafet: { n: 'Kıyafet Kanunnamesi', cat: 'Ahlak', era: [0, 3], d: 'Her zümrenin giyimi kanunla belirlenir. Toplumsal düzen sağlamlaşır.', m: { legitimacy: 0.05, popularity: -0.05 }, on: { stability: 2 }, off: {} },
  narh: { n: 'Narh Usulü', cat: 'İktisat', era: [0, 3], d: 'Temel gıda fiyatlarına tavan konur, muhtesipler sıkı denetim yapar.', m: { popularity: 0.25 }, tradeMul: 0.94, on: { popularity: 3 }, off: { popularity: -3 } },
  vakif: { n: 'Vakıflara Hazine Desteği', cat: 'Din', era: [0, 3], d: 'Camii, medrese ve imaret vakıflarına düzenli yardım yapılır.', m: { ulema: 0.2, popularity: 0.15, piety: 0.05 }, cost: 500000, on: { ulema: 3 }, off: { ulema: -4 } },
  iltizam: { n: 'İltizam Usulü', cat: 'İktisat', era: [1, 3], d: 'Vergi toplama hakkı mültezimlere ihale edilir. Gelir artar, fakat yolsuzluk ve köylü üzerindeki baskı da artar.', incMul: 1.12, m: { corruption: 0.15, popularity: -0.1 }, on: { corruption: 4 }, off: { corruption: -3, popularity: 2 } },
  malikane: { n: 'Malikâne Sistemi', cat: 'İktisat', era: [2, 3], d: 'Vergi kaynakları ömür boyu peşin bedelle satılır. Bir kerelik büyük gelir sağlar, uzun vadede vergi tabanını aşındırır.', incMul: 0.9, m: { corruption: 0.05 }, on: { treasury: 30e6, corruption: 3 }, off: { prestige: 1 } },
  timar: { n: 'Tımar Islahatı', cat: 'Ordu', era: [1, 3], d: 'Boşalan tımarlar savaşçılara dağıtılır, sahte kayıtlar temizlenir.', m: { corruption: -0.1 }, cost: 300000, on: { sip: 4000, corruption: -3 }, off: {} },
  adalet: { n: 'Adaletnâme', cat: 'Adalet', era: [0, 3], d: 'Kadı ve beylerin zulmünü yasaklayan ferman, her köyde okunur. Teftişler sıklaşır.', m: { popularity: 0.25, corruption: -0.12 }, cost: 250000, on: { popularity: 4, legitimacy: 2 }, off: { popularity: -2 } },
  menzil: { n: 'Menzilhane Teşkilatı', cat: 'İdare', era: [0, 3], d: 'Ana yollarda ulak ve konak istasyonları kurulur. Haberleşme hızlanır, taşra merkeze bağlanır.', m: { stability: 0.15 }, cost: 300000, tradeMul: 1.03, on: {}, off: {} },
  kapitulasyon: { n: 'Ticari İmtiyazlar (Ahidnâme)', cat: 'Dış', era: [1, 3], d: 'Avrupalı tüccarlara gümrük ve ticaret ayrıcalıkları tanınır. Ticaret canlanır, yerli esnaf ise rekabetten şikâyetçi olur.', tradeMul: 1.18, m: { popularity: -0.05 }, on: { prestige: -1 }, off: { prestige: 1 } },
  zimmi: { n: 'Zimmîlere Hoşgörü', cat: 'Din', era: [0, 3], d: 'Gayrimüslim tebaaya cizye indirimi ve kilise onarım izni verilir. Rumeli ve adalar sakinleşir, bazı ulema hoşnutsuzdur.', incMul: 0.97, m: { ulema: -0.08 }, unrestChristian: -6, on: { ulema: -3 }, off: { ulema: 2 } },
  matbaa: { n: 'Matbaa İzni', cat: 'İlim', era: [2, 3], d: 'Dinî olmayan eserlerin basımına izin verilir. Bilgi yayılır, hattatlar ve bazı ulema karşı çıkar.', m: { ulema: -0.08 }, on: { ulema: -5, prestige: 3, ilim: 1 }, off: { ulema: 2 }, eduBonus: 1 },
  nizam: { n: 'Nizam-ı Cedid Ordusu', cat: 'Ordu', era: [2, 3], d: 'Avrupa usulü talim gören yeni bir ordu kurulur. Yeniçeriler bunu ocaklarına bir tehdit olarak görür.', m: { janissary: -0.35 }, on: { janissary: -12, prestige: 2 }, off: { janissary: 8 } },
  ikta: { n: 'Seferberlik Ferman', cat: 'Ordu', era: [0, 3], d: 'Ülke savaş düzenine geçer; avarız vergileri savaşa aktarılır. Ordunun morali yükselir, halk sıkıntı çeker.', m: { popularity: -0.3, morale: 0.4 }, incMul: 1.05, on: { morale: 6, popularity: -3 }, off: { popularity: 2 } },
};
PH.D.lawOrder = ['adalet', 'narh', 'vakif', 'menzil', 'kiyafet', 'icki', 'kahve', 'tutun', 'zimmi', 'iltizam', 'malikane', 'kapitulasyon', 'timar', 'devsirme', 'ikta', 'nizam', 'kardes', 'kafes', 'matbaa'];

/** Vergi seviyeleri */
PH.D.taxLevels = [
  { n: 'Çok Hafif', mul: 0.6, pop: 14, unrest: -10 },
  { n: 'Hafif', mul: 0.8, pop: 7, unrest: -5 },
  { n: 'Âdil', mul: 1.0, pop: 0, unrest: 0 },
  { n: 'Ağır', mul: 1.25, pop: -10, unrest: 8 },
  { n: 'Zalimane', mul: 1.5, pop: -22, unrest: 18 },
];
