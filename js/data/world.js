/* Padişah Hayatı — Dönemler, devletler ve eyaletler */

/* ---------- Dönemler ---------- */
PH.D.eras = [
  {
    id: 0, year: 1451, n: 'Fetih Arifesi', sub: '1451 · Edirne',
    d: 'Genç bir devlet, Edirne\'de bir taht ve surları aşılmamış Kostantiniyye. Bizans son nefesini verirken Karaman, Akkoyunlu ve Macar kralı fırsat kolluyor. Dünyanın kaderi sizin ellerinizde.',
    capital: 'edirne', treasury: 22e6, food: 60,
    army: { jan: 6000, sip: 26000, azap: 6000, nizam: 0, cannons: 70, ships: 30, morale: 70, training: 60 },
    emp: { popularity: 58, stability: 55, prestige: 35, legitimacy: 60, janissary: 55, ulema: 55, corruption: 18 },
    janQ: 1.6, trade: 1.4e6, palace: 0.7e6, ecoMul: 1.7, salMul: 0.7,
    nations: ['byz', 'ven', 'hun', 'kar', 'akk', 'mam', 'trb', 'krm', 'kni'],
    laws: { devsirme: true, kardes: false },
    succession: 'tayin', brothers: 'sancak',
  },
  {
    id: 1, year: 1520, n: 'Muhteşem Yüzyıl', sub: '1520 · İstanbul',
    d: 'Mısır ve Hicaz fethedildi, halifelik İstanbul\'a geçti. Tuna\'nın ötesinde Habsburglar, doğuda Safevî Şahı, denizlerde Venedik ve İspanya. İmparatorluk zirveye uzanıyor; ya daha da yükselecek ya da ilk çatlakları verecek.',
    capital: 'istanbul', treasury: 55e6, food: 65,
    army: { jan: 12000, sip: 40000, azap: 14000, nizam: 0, cannons: 200, ships: 80, morale: 75, training: 70 },
    emp: { popularity: 62, stability: 65, prestige: 60, legitimacy: 70, janissary: 60, ulema: 60, corruption: 20 },
    janQ: 1.55, trade: 2.6e6, palace: 1.3e6, ecoMul: 1, salMul: 1,
    nations: ['hab', 'ven', 'hun', 'saf', 'pol', 'spa', 'fra', 'kni'],
    laws: { devsirme: true, kardes: true },
    succession: 'tayin', brothers: 'sancak',
  },
  {
    id: 2, year: 1603, n: 'Kafes Devri', sub: '1603 · İstanbul',
    d: 'Celâlî eşkıyası Anadolu\'yu kasıp kavuruyor, yeniçeri ocağı şişmiş, akçe değer kaybediyor. Şehzadeler artık sancağa değil kafese gönderiliyor. Hazine boş, düşmanlar güçlü. Islahat mı, kaos mu?',
    capital: 'istanbul', treasury: 14e6, food: 45,
    army: { jan: 30000, sip: 24000, azap: 8000, nizam: 0, cannons: 250, ships: 60, morale: 55, training: 50 },
    emp: { popularity: 45, stability: 42, prestige: 52, legitimacy: 55, janissary: 45, ulema: 55, corruption: 40 },
    janQ: 1.1, trade: 2.4e6, palace: 1.5e6, ecoMul: 1.05, salMul: 1,
    nations: ['hab', 'ven', 'saf', 'pol', 'rus', 'spa', 'fra', 'kni'],
    laws: { devsirme: true, kafes: true, iltizam: true },
    succession: 'ekberiyet', brothers: 'kafes',
  },
  {
    id: 3, year: 1789, n: 'Nizam-ı Cedid', sub: '1789 · İstanbul',
    d: 'Kırım elden çıktı, Rus ve Avusturya orduları kapıda. Avrupa\'da devrim rüzgârları esiyor. Yeniçeriler her yeniliğe kazan kaldırmaya hazır. Devleti yeni bir nizamla kurtarmak sizin elinizde.',
    capital: 'istanbul', treasury: 8e6, food: 50, debt: 20e6,
    army: { jan: 38000, sip: 7000, azap: 4000, nizam: 0, cannons: 300, ships: 50, morale: 45, training: 35 },
    emp: { popularity: 48, stability: 40, prestige: 35, legitimacy: 58, janissary: 40, ulema: 50, corruption: 48 },
    janQ: 0.8, trade: 2.2e6, palace: 1.4e6, ecoMul: 1.25, salMul: 1,
    nations: ['hab', 'ven', 'saf', 'pol', 'rus', 'fra', 'kni'],
    laws: { kafes: true, iltizam: true, malikane: true, kapitulasyon: true },
    succession: 'ekberiyet', brothers: 'kafes',
  },
];

/* ---------- Devletler ----------
 * n: dönemlere göre ad ; t: hükümdar unvanı ; str: dönemlere göre güç (asker eşdeğeri)
 * rel: başlangıç ilişkisi ; ships: donanma gücü ; din
 */
PH.D.nations = {
  byz: { n: ['Bizans İmparatorluğu'], short: 'Bizans', t: 'İmparator', color: '#6a4fc4', din: 'Ortodoks', str: [9000], ships: [15], rel: [-10], aggr: 0.1 },
  ven: { n: ['Venedik Cumhuriyeti', 'Venedik Cumhuriyeti', 'Venedik Cumhuriyeti', 'Venedik Cumhuriyeti'], short: 'Venedik', t: 'Doç', color: '#9b59b6', din: 'Katolik', str: [20000, 26000, 24000, 14000], ships: [90, 110, 90, 45], rel: [5, 10, 0, 15], aggr: 0.3 },
  hun: { n: ['Macaristan Krallığı', 'Macaristan Krallığı'], short: 'Macaristan', t: 'Kral', color: '#3d7a3a', din: 'Katolik', str: [34000, 36000], ships: [0, 0], rel: [-35, -40], aggr: 0.6 },
  kar: { n: ['Karamanoğulları Beyliği'], short: 'Karaman', t: 'Bey', color: '#8a6d2b', din: 'Sünni', str: [15000], ships: [0], rel: [-30], aggr: 0.5 },
  akk: { n: ['Akkoyunlu Devleti'], short: 'Akkoyunlu', t: 'Bey', color: '#c9c3b2', din: 'Sünni', str: [30000], ships: [0], rel: [-15], aggr: 0.5 },
  mam: { n: ['Memlûk Sultanlığı'], short: 'Memlûkler', t: 'Sultan', color: '#c8932e', din: 'Sünni', str: [42000], ships: [25], rel: [10], aggr: 0.3 },
  trb: { n: ['Trabzon Rum İmparatorluğu'], short: 'Trabzon', t: 'İmparator', color: '#a14f8f', din: 'Ortodoks', str: [4000], ships: [8], rel: [0], aggr: 0.05 },
  krm: { n: ['Kırım Hanlığı'], short: 'Kırım', t: 'Han', color: '#4f8fa8', din: 'Sünni', str: [16000], ships: [0], rel: [35], aggr: 0.2 },
  kni: { n: ['Rodos Şövalyeleri', 'Rodos Şövalyeleri', 'Malta Şövalyeleri', 'Malta Şövalyeleri'], short: 'Şövalyeler', t: 'Üstad-ı Azam', color: '#e8e4da', din: 'Katolik', str: [5000, 6000, 6000, 4000], ships: [30, 35, 35, 20], rel: [-60, -70, -60, -40], aggr: 0.4 },
  hab: { n: ['', 'Habsburg Arşidüklüğü', 'Kutsal Roma (Habsburg)', 'Avusturya İmparatorluğu'], short: 'Habsburg', t: 'İmparator', color: '#d6b13a', din: 'Katolik', str: [0, 60000, 82000, 120000], ships: [0, 10, 15, 25], rel: [0, -30, -35, -40], aggr: 0.6 },
  saf: { n: ['', 'Safevî Devleti', 'Safevî Devleti', 'Kaçar İran Devleti'], short: 'İran', t: 'Şah', color: '#16a39a', din: 'Şii', str: [0, 50000, 60000, 42000], ships: [0, 0, 0, 0], rel: [0, -50, -40, -20], aggr: 0.6 },
  pol: { n: ['', 'Lehistan Krallığı', 'Lehistan-Litvanya', 'Lehistan Krallığı'], short: 'Lehistan', t: 'Kral', color: '#e88fb0', din: 'Katolik', str: [0, 34000, 50000, 22000], ships: [0, 0, 0, 0], rel: [0, 0, -10, 15], aggr: 0.35 },
  rus: { n: ['', '', 'Moskova Çarlığı', 'Rusya İmparatorluğu'], short: 'Rusya', t: 'Çar', color: '#3446a8', din: 'Ortodoks', str: [0, 0, 40000, 135000], ships: [0, 0, 5, 60], rel: [0, 0, -15, -55], aggr: 0.7 },
  spa: { n: ['', 'İspanya Krallığı', 'İspanya Krallığı'], short: 'İspanya', t: 'Kral', color: '#f07c1e', din: 'Katolik', str: [0, 52000, 50000], ships: [0, 120, 100], rel: [0, -45, -35], aggr: 0.4 },
  fra: { n: ['', 'Fransa Krallığı', 'Fransa Krallığı', 'Fransa Krallığı'], short: 'Fransa', t: 'Kral', color: '#6fc3ff', din: 'Katolik', str: [0, 60000, 65000, 150000], ships: [0, 60, 70, 90], rel: [0, 35, 25, 30], aggr: 0.15 },
};

/* ---------- Eyaletler ----------
 * [id, ad, bölge, gelir(bin akçe/ay), uzaklık(ay), sahipler[e0,e1,e2,e3], seçenekler]
 * seçenekler: c=kıyı, i=ada, f=kale seviyesi, d=gelişmişlik, v=vasal(osmanlıya aitken), cap=başkent olduğu devlet, h=kutsal
 */
(function () {
  const raw = [
    ['istanbul', 'İstanbul', 'Rumeli', 900, 0, ['byz', 'osm', 'osm', 'osm'], { c: 1, f: 5, d: 7, cap: 'byz' }],
    ['edirne', 'Edirne', 'Rumeli', 420, 1, ['osm', 'osm', 'osm', 'osm'], { f: 3, d: 6 }],
    ['bursa', 'Bursa', 'Anadolu', 430, 1, ['osm', 'osm', 'osm', 'osm'], { f: 2, d: 6 }],
    ['selanik', 'Selanik', 'Rumeli', 340, 1, ['osm', 'osm', 'osm', 'osm'], { c: 1, f: 2, d: 5 }],
    ['mora', 'Mora', 'Rumeli', 230, 2, ['byz', 'osm', 'osm', 'osm'], { c: 1, f: 3, d: 4 }],
    ['egriboz', 'Eğriboz', 'Adalar', 140, 2, ['ven', 'osm', 'osm', 'osm'], { c: 1, i: 1, f: 3, d: 3 }],
    ['arnavutluk', 'Arnavutluk', 'Rumeli', 190, 2, ['osm', 'osm', 'osm', 'osm'], { c: 1, f: 2, d: 3 }],
    ['bosna', 'Bosna', 'Rumeli', 280, 2, ['hun', 'osm', 'osm', 'osm'], { f: 3, d: 4 }],
    ['semendire', 'Semendire', 'Rumeli', 240, 2, ['hun', 'osm', 'osm', 'osm'], { f: 3, d: 4 }],
    ['belgrad', 'Belgrad', 'Rumeli', 300, 2, ['hun', 'hun', 'osm', 'osm'], { f: 4, d: 4 }],
    ['budin', 'Budin', 'Avrupa', 460, 3, ['hun', 'hun', 'osm', 'hab'], { f: 4, d: 5, cap: 'hun' }],
    ['temesvar', 'Temeşvar', 'Avrupa', 290, 3, ['hun', 'hun', 'osm', 'hab'], { f: 3, d: 4 }],
    ['erdel', 'Erdel', 'Avrupa', 260, 3, ['hun', 'hun', 'osm', 'hab'], { f: 3, d: 4, v: 1 }],
    ['hirvatistan', 'Hırvatistan', 'Avrupa', 210, 3, ['hun', 'hab', 'hab', 'hab'], { c: 1, f: 3, d: 4 }],
    ['viyana', 'Viyana', 'Avrupa', 820, 4, [null, 'hab', 'hab', 'hab'], { f: 5, d: 7, cap: 'hab' }],
    ['prag', 'Bohemya', 'Avrupa', 520, 5, [null, 'hab', 'hab', 'hab'], { f: 3, d: 6 }],
    ['eflak', 'Eflak', 'Rumeli', 260, 2, ['osm', 'osm', 'osm', 'osm'], { f: 2, d: 4, v: 1 }],
    ['bogdan', 'Boğdan', 'Rumeli', 210, 2, ['osm', 'osm', 'osm', 'osm'], { f: 2, d: 3, v: 1 }],
    ['kirim', 'Kırım', 'Karadeniz', 220, 2, ['krm', 'osm', 'osm', 'rus'], { c: 1, f: 3, d: 4, v: 1, cap: 'krm' }],
    ['azak', 'Azak', 'Karadeniz', 140, 3, ['krm', 'osm', 'osm', 'rus'], { c: 1, f: 3, d: 2 }],
    ['kamanice', 'Kamaniçe', 'Avrupa', 190, 3, [null, 'pol', 'pol', 'pol'], { f: 4, d: 3 }],
    ['lviv', 'Lviv', 'Avrupa', 290, 4, [null, 'pol', 'pol', 'hab'], { f: 3, d: 5 }],
    ['krakov', 'Krakov', 'Avrupa', 480, 5, [null, 'pol', 'pol', 'pol'], { f: 4, d: 6, cap: 'pol' }],
    ['kiev', 'Kiev', 'Rusya', 300, 4, [null, 'pol', 'pol', 'rus'], { f: 3, d: 4 }],
    ['moskova', 'Moskova', 'Rusya', 700, 6, [null, null, 'rus', 'rus'], { f: 4, d: 6, cap: 'rus' }],
    ['ankara', 'Ankara', 'Anadolu', 250, 1, ['osm', 'osm', 'osm', 'osm'], { f: 2, d: 4 }],
    ['kastamonu', 'Kastamonu', 'Anadolu', 200, 1, ['osm', 'osm', 'osm', 'osm'], { c: 1, f: 2, d: 3 }],
    ['konya', 'Karaman', 'Anadolu', 340, 2, ['kar', 'osm', 'osm', 'osm'], { f: 3, d: 5, cap: 'kar' }],
    ['sivas', 'Sivas', 'Anadolu', 250, 2, ['osm', 'osm', 'osm', 'osm'], { f: 2, d: 4 }],
    ['trabzon', 'Trabzon', 'Anadolu', 240, 2, ['trb', 'osm', 'osm', 'osm'], { c: 1, f: 3, d: 4, cap: 'trb' }],
    ['maras', 'Dulkadir', 'Anadolu', 200, 2, ['mam', 'osm', 'osm', 'osm'], { f: 2, d: 3 }],
    ['diyarbekir', 'Diyarbekir', 'Anadolu', 300, 3, ['akk', 'osm', 'osm', 'osm'], { f: 4, d: 4, cap: 'akk' }],
    ['erzurum', 'Erzurum', 'Anadolu', 200, 3, ['akk', 'osm', 'osm', 'osm'], { f: 3, d: 3 }],
    ['van', 'Van', 'Anadolu', 150, 3, ['akk', 'saf', 'osm', 'osm'], { f: 3, d: 3 }],
    ['musul', 'Musul', 'Irak', 240, 3, ['akk', 'saf', 'osm', 'osm'], { f: 2, d: 3 }],
    ['bagdat', 'Bağdat', 'Irak', 500, 4, ['akk', 'saf', 'osm', 'osm'], { f: 4, d: 5 }],
    ['basra', 'Basra', 'Irak', 300, 5, ['akk', 'saf', 'osm', 'osm'], { c: 1, f: 2, d: 4 }],
    ['halep', 'Halep', 'Arap', 450, 3, ['mam', 'osm', 'osm', 'osm'], { f: 3, d: 5 }],
    ['sam', 'Şam', 'Arap', 450, 3, ['mam', 'osm', 'osm', 'osm'], { f: 3, d: 5 }],
    ['kudus', 'Kudüs', 'Arap', 200, 4, ['mam', 'osm', 'osm', 'osm'], { f: 3, d: 4, h: 1 }],
    ['misir', 'Mısır', 'Afrika', 1000, 4, ['mam', 'osm', 'osm', 'osm'], { c: 1, f: 4, d: 6, cap: 'mam' }],
    ['hicaz', 'Hicaz', 'Arap', 150, 5, ['mam', 'osm', 'osm', 'osm'], { c: 1, f: 2, d: 3, h: 1 }],
    ['yemen', 'Yemen', 'Arap', 150, 6, [null, 'osm', 'osm', 'osm'], { c: 1, f: 2, d: 2 }],
    ['trablusgarp', 'Trablusgarp', 'Afrika', 150, 5, [null, 'spa', 'osm', 'osm'], { c: 1, f: 3, d: 3 }],
    ['tunus', 'Tunus', 'Afrika', 200, 5, [null, 'spa', 'osm', 'osm'], { c: 1, f: 3, d: 3 }],
    ['cezayir', 'Cezayir', 'Afrika', 220, 5, [null, 'osm', 'osm', 'osm'], { c: 1, f: 3, d: 3 }],
    ['kibris', 'Kıbrıs', 'Adalar', 300, 3, ['ven', 'ven', 'osm', 'osm'], { c: 1, i: 1, f: 4, d: 4 }],
    ['girit', 'Girit', 'Adalar', 300, 3, ['ven', 'ven', 'ven', 'osm'], { c: 1, i: 1, f: 5, d: 4 }],
    ['rodos', 'Rodos', 'Adalar', 140, 2, ['kni', 'kni', 'osm', 'osm'], { c: 1, i: 1, f: 5, d: 3, cap: 'kni' }],
    ['malta', 'Malta', 'Adalar', 120, 5, ['kni', 'kni', 'kni', 'kni'], { c: 1, i: 1, f: 5, d: 3, cap: 'kni' }],
    ['dalmacya', 'Dalmaçya', 'Avrupa', 200, 3, ['ven', 'ven', 'ven', 'ven'], { c: 1, f: 3, d: 4 }],
    ['venedik', 'Venedik', 'Avrupa', 800, 4, ['ven', 'ven', 'ven', 'ven'], { c: 1, i: 1, f: 4, d: 7, cap: 'ven' }],
    ['napoli', 'Napoli', 'Avrupa', 600, 5, [null, 'spa', 'spa', null], { c: 1, f: 4, d: 6, cap: 'spa' }],
    ['sicilya', 'Sicilya', 'Adalar', 400, 5, [null, 'spa', 'spa', null], { c: 1, i: 1, f: 3, d: 5 }],
    ['marsilya', 'Provence', 'Avrupa', 450, 6, [null, 'fra', 'fra', 'fra'], { c: 1, f: 3, d: 6 }],
    ['paris', 'Paris', 'Avrupa', 900, 7, [null, 'fra', 'fra', 'fra'], { f: 4, d: 8, cap: 'fra' }],
    ['tiflis', 'Gürcistan', 'Kafkas', 200, 4, [null, 'saf', 'saf', 'saf'], { f: 3, d: 3 }],
    ['revan', 'Revan', 'Kafkas', 190, 4, [null, 'saf', 'saf', 'saf'], { f: 3, d: 3 }],
    ['sirvan', 'Şirvan', 'Kafkas', 240, 5, [null, 'saf', 'saf', 'saf'], { c: 1, f: 2, d: 4 }],
    ['tebriz', 'Tebriz', 'İran', 520, 5, ['akk', 'saf', 'saf', 'saf'], { f: 3, d: 6 }],
    ['isfahan', 'İsfahan', 'İran', 700, 6, [null, 'saf', 'saf', 'saf'], { f: 4, d: 7, cap: 'saf' }],
  ];
  PH.D.provList = raw.map((r) => ({
    id: r[0], n: r[1], reg: r[2], inc: r[3], dist: r[4], own: r[5],
    coast: !!r[6].c, island: !!r[6].i, fort: r[6].f || 2, dev: r[6].d || 3,
    vassal: !!r[6].v, cap: r[6].cap || null, holy: !!r[6].h,
  }));
  PH.D.prov = {};
  PH.D.provList.forEach((p) => (PH.D.prov[p.id] = p));
})();

PH.D.regions = ['Rumeli', 'Anadolu', 'Karadeniz', 'Adalar', 'Arap', 'Irak', 'Afrika', 'Kafkas', 'İran', 'Avrupa', 'Rusya'];

/** Bölgelerin dini/kültürel yapısı (isyan ve devşirme için) */
PH.D.regionInfo = {
  Rumeli: { muslim: 0.4 }, Anadolu: { muslim: 0.9 }, Karadeniz: { muslim: 0.6 }, Adalar: { muslim: 0.2 },
  Arap: { muslim: 0.9 }, Irak: { muslim: 0.9 }, Afrika: { muslim: 0.9 }, Kafkas: { muslim: 0.6 },
  İran: { muslim: 0.95 }, Avrupa: { muslim: 0.05 }, Rusya: { muslim: 0.05 },
};
