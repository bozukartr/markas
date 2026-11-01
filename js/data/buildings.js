/* Padişah Hayatı — Yapılar
 * cost: akçe ; m: inşa süresi (ay) ; up: aylık bakım ; fx: tamamlanınca bir kerelik etkiler
 * trade: aylık ticaret geliri ; unrest: eyalette huzursuzluk etkisi ; dev: gelişmişlik artışı
 * coast: yalnız kıyı eyaletlerinde ; uniq: eyalet başına bir tane ; reqEra: en erken dönem
 */
PH.D.buildings = {
  cami: { n: 'Selâtin Camii', icon: 'mosque', cost: 38e6, m: 30, up: 60000, dev: 1, unrest: -6, uniq: 1, fx: { piety: 6, ulema: 10, prestige: 8, popularity: 6, legitimacy: 4 }, d: 'Padişah adıyla anılan muhteşem bir külliye-camii. Ulema, halk ve şöhret için en büyük yatırım.' },
  medrese: { n: 'Medrese', icon: 'book', cost: 7e6, m: 12, up: 25000, dev: 1, unrest: -2, fx: { ulema: 4, ilim: 1 }, edu: 1, d: 'İlim yuvası. Ulemayı memnun eder, şehzadelerin eğitimine katkı sağlar.' },
  darussifa: { n: 'Darüşşifa', icon: 'heart', cost: 9e6, m: 14, up: 30000, dev: 1, unrest: -3, fx: { popularity: 4, piety: 1 }, plague: 1, d: 'Hastane. Salgınların zararını azaltır, hanedanın sağlığına iyi gelir.' },
  imaret: { n: 'İmaret', icon: 'feast', cost: 4.5e6, m: 8, up: 40000, unrest: -5, fx: { popularity: 5, piety: 1 }, food: 0.15, d: 'Fakirlere sıcak çorba dağıtılan aşevi. Halkın gönlünü kazanır, kıtlıkta hayat kurtarır.' },
  kervansaray: { n: 'Kervansaray', icon: 'tent', cost: 6e6, m: 10, up: 15000, dev: 1, trade: 140000, d: 'Ticaret yolları üzerinde güvenli konak. Kervan ticaretini artırır.' },
  bedesten: { n: 'Bedesten ve Çarşı', icon: 'coin', cost: 11e6, m: 14, up: 20000, dev: 1, trade: 260000, uniq: 1, d: 'Değerli malların satıldığı kapalı çarşı. Kayda değer ticaret geliri sağlar.' },
  kopru: { n: 'Taş Köprü', icon: 'wave', cost: 6.5e6, m: 12, up: 8000, dev: 1, unrest: -3, trade: 70000, fx: { prestige: 1 }, d: 'Nehirleri aşan kalıcı bir eser. Ticareti ve eyaletin bağlılığını artırır.' },
  kale: { n: 'Kale Tahkimatı', icon: 'castle', cost: 9e6, m: 12, up: 30000, fort: 1, d: 'Surları kalınlaştırır, burçlar ekler. Eyaletin savunmasını bir kademe artırır.' },
  tersane: { n: 'Tersane', icon: 'ship', cost: 15e6, m: 18, up: 50000, coast: 1, uniq: 1, ships: 6, shipDisc: 0.3, d: 'Kadırga ve kalyon üretim merkezi. Gemi maliyetini düşürür.' },
  tophane: { n: 'Tophane', icon: 'cannon', cost: 12e6, m: 14, up: 40000, uniq: 1, cannons: 25, canDisc: 0.3, d: 'Top dökümhanesi. Top maliyetini düşürür, kuşatma gücünü artırır.' },
  kosk: { n: 'Has Köşk', icon: 'palace', cost: 8e6, m: 10, up: 70000, uniq: 1, fx: { happiness: 15, prestige: 3, popularity: -2 }, mood: 1, d: 'Padişaha mahsus bir sahil kasrı. Keyfi yükseltir ama halk israf olarak görebilir.' },
  sukemeri: { n: 'Su Kemeri ve Çeşmeler', icon: 'drop', cost: 6e6, m: 10, up: 12000, dev: 1, unrest: -3, fx: { popularity: 4 }, plague: 1, d: 'Şehre temiz su taşır. Halk sağlığını korur, salgınları azaltır.' },
  ambar: { n: 'Zahire Ambarı', icon: 'wheat', cost: 4e6, m: 6, up: 10000, food: 0.1, harvest: 4, d: 'Bereketli yılların fazlasını saklar, kıtlık yıllarında halkı korur.' },
  kutuphane: { n: 'Kütüphane', icon: 'scroll', cost: 4.5e6, m: 8, up: 12000, fx: { ulema: 2, ilim: 1 }, lib: 1, d: 'Nadir yazmaların saklandığı kütüphane. İlim faaliyetlerinizi güçlendirir.' },
  rasathane: { n: 'Rasathane', icon: 'comet', cost: 6e6, m: 10, up: 20000, uniq: 1, fx: { ilim: 2, prestige: 2, ulema: -3 }, d: 'Gökleri inceleyen gözlemevi. İlmi ilerletir; ancak bazı ulema hoş karşılamaz.' },
  kisla: { n: 'Kışla', icon: 'shield', cost: 10e6, m: 12, up: 35000, train: 1, fx: { janissary: 4, training: 8 }, d: 'Askerlerin talim ve barınma yeri. Ordunun disiplinini artırır.' },
};
PH.D.buildingOrder = ['cami', 'medrese', 'darussifa', 'imaret', 'kervansaray', 'bedesten', 'kopru', 'kale', 'tersane', 'tophane', 'kosk', 'sukemeri', 'ambar', 'kutuphane', 'rasathane', 'kisla'];
