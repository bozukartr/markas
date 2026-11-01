/* Padişah Hayatı — Kişilik özellikleri
 * kind: pos | neg | nötr ; sk: yetenek etkileri ; sultan: padişah seçebilir mi ; npc: NPC'lerde görülebilir mi
 */
PH.D.traits = {
  adil: { n: 'Adil', kind: 'pos', d: 'Hakkaniyetle hükmeder. Halk ve ulema sever.', sk: { idare: 1 }, sultan: 1, npc: 1, opp: 'zalim' },
  zalim: { n: 'Zalim', kind: 'neg', d: 'Korku ile yönetir. Komplolar azalır, halk sevgisi düşer.', sk: { entrika: 2 }, sultan: 1, npc: 1, opp: 'adil' },
  cesur: { n: 'Cesur', kind: 'pos', d: 'Savaş meydanında önde gider. Ordu morali artar.', sk: { askeri: 3 }, sultan: 1, npc: 1, opp: 'korkak' },
  korkak: { n: 'Korkak', kind: 'neg', d: 'Tehlikeden kaçınır.', sk: { askeri: -3 }, sultan: 0, npc: 1, opp: 'cesur' },
  temkinli: { n: 'Temkinli', kind: 'pos', d: 'Her adımı ölçüp tartar. Kazalar ve ağır kayıplar azalır.', sk: { diplomasi: 1, idare: 1 }, sultan: 1, npc: 1 },
  dindar: { n: 'Dindar', kind: 'pos', d: 'İbadetine düşkündür. Ulema desteği ve takva artar.', sk: { ilim: 1 }, sultan: 1, npc: 1 },
  sair: { n: 'Şair Ruhlu', kind: 'pos', d: 'Divan şiirine yatkındır. Sanat faaliyetleri daha verimli olur.', sk: { ilim: 2 }, sultan: 1, npc: 1 },
  musrif: { n: 'Müsrif', kind: 'neg', d: 'Lüksü sever. Saray masrafları artar, keyfi kolay yükselir.', sk: {}, sultan: 1, npc: 1, opp: 'tutumlu' },
  tutumlu: { n: 'Tutumlu', kind: 'pos', d: 'Hazineyi gözetir. Saray masrafları azalır.', sk: { idare: 1 }, sultan: 1, npc: 1, opp: 'musrif' },
  zeki: { n: 'Zeki', kind: 'pos', d: 'Keskin bir zihne sahiptir. Her alanda daha hızlı öğrenir.', sk: { ilim: 2, idare: 1, entrika: 1 }, sultan: 1, npc: 1, opp: 'kalinkafa' },
  kalinkafa: { n: 'Kalın Kafalı', kind: 'neg', d: 'Öğrenmekte zorlanır.', sk: { ilim: -3, idare: -1 }, sultan: 0, npc: 1, opp: 'zeki' },
  entrikaci: { n: 'Entrikacı', kind: 'nötr', d: 'Sarayın gizli oyunlarını iyi bilir.', sk: { entrika: 4 }, sultan: 1, npc: 1 },
  heybetli: { n: 'Heybetli', kind: 'pos', d: 'Görenleri etkiler. Meşruiyet ve diplomasi güçlenir.', sk: { diplomasi: 2 }, sultan: 1, npc: 1 },
  ofkeli: { n: 'Öfkeli', kind: 'neg', d: 'Çabuk parlar. Stres hızlı birikir, ani kararlar verir.', sk: { askeri: 1, diplomasi: -2 }, sultan: 1, npc: 1, opp: 'sabirli' },
  sabirli: { n: 'Sabırlı', kind: 'pos', d: 'Soğukkanlıdır. Stres yavaş birikir.', sk: { diplomasi: 1 }, sultan: 1, npc: 1, opp: 'ofkeli' },
  narin: { n: 'Narin Bünyeli', kind: 'neg', d: 'Sık hastalanır, sağlığı çabuk bozulur.', sk: {}, sultan: 1, npc: 1, opp: 'pehlivan' },
  pehlivan: { n: 'Pehlivan', kind: 'pos', d: 'Güçlü bir bedene sahiptir. Sağlığı dayanıklıdır.', sk: { askeri: 1 }, sultan: 1, npc: 1, opp: 'narin' },
  tembel: { n: 'Tembel', kind: 'neg', d: 'Devlet işlerinden çabuk sıkılır. Aylık vakit 1 azalır.', sk: { idare: -1 }, sultan: 1, npc: 1, opp: 'caliskan' },
  caliskan: { n: 'Çalışkan', kind: 'pos', d: 'Gece gündüz çalışır. Aylık vakit 1 artar.', sk: { idare: 1 }, sultan: 1, npc: 1, opp: 'tembel' },
  melankolik: { n: 'Hüzünlü', kind: 'neg', d: 'Keyfi kolay kaçar.', sk: { ilim: 1 }, sultan: 1, npc: 1 },
  kuskucu: { n: 'Kuşkucu', kind: 'nötr', d: 'Kimseye güvenmez. Komplolar daha kolay sezilir; maiyeti soğuk durur.', sk: { entrika: 2 }, sultan: 1, npc: 1 },
  comert: { n: 'Cömert', kind: 'pos', d: 'Eli açıktır. Hediyeleri daha çok etki bırakır.', sk: { diplomasi: 1 }, sultan: 1, npc: 1, opp: 'hasis' },
  hasis: { n: 'Hasis', kind: 'neg', d: 'Akçeye düşkündür.', sk: {}, sultan: 0, npc: 1, opp: 'comert' },
  avci: { n: 'Avcı', kind: 'nötr', d: 'Ava tutkundur. Av daha keyif verir.', sk: { askeri: 1 }, sultan: 1, npc: 1 },
  // NPC'ye özgü
  sadik: { n: 'Sadık', kind: 'pos', d: 'Efendisine bağlıdır. Kolay ihanet etmez.', sk: {}, sultan: 0, npc: 1, opp: 'hain' },
  hain: { n: 'Dönek', kind: 'neg', d: 'Rüzgâr nereden eserse oradan yanadır.', sk: { entrika: 2 }, sultan: 0, npc: 1, opp: 'sadik' },
  hirsli: { n: 'Hırslı', kind: 'nötr', d: 'Daha yüksek makamlara göz dikmiştir.', sk: { idare: 1 }, sultan: 0, npc: 1 },
  rusvetci: { n: 'Rüşvetçi', kind: 'neg', d: 'Menfaate açıktır. Görevinde yolsuzluğu artırır.', sk: {}, sultan: 0, npc: 1, opp: 'durust' },
  durust: { n: 'Dürüst', kind: 'pos', d: 'Haram lokmaya el sürmez.', sk: {}, sultan: 0, npc: 1, opp: 'rusvetci' },
  ehil: { n: 'Ehil', kind: 'pos', d: 'İşini bilir.', sk: { idare: 2, askeri: 1 }, sultan: 0, npc: 1 },
  guzel: { n: 'Güzel', kind: 'pos', d: 'Güzelliği dillere destandır.', sk: {}, sultan: 0, npc: 1, harem: 1 },
  zarif: { n: 'Zarif', kind: 'pos', d: 'Musiki ve edebe vâkıftır.', sk: { diplomasi: 1 }, sultan: 0, npc: 1, harem: 1 },
  kiskanc: { n: 'Kıskanç', kind: 'neg', d: 'Rakiplerine tahammül edemez.', sk: { entrika: 1 }, sultan: 0, npc: 1, harem: 1 },
  merhametli: { n: 'Merhametli', kind: 'pos', d: 'Yumuşak kalplidir.', sk: {}, sultan: 1, npc: 1 },
  // olaylarla kazanılan
  yarali: { n: 'Yaralı', kind: 'neg', d: 'Eski bir yaranın izi hâlâ sızlar.', sk: { askeri: -1 }, sultan: 0, npc: 0 },
  kafesli: { n: 'Kafes Yorgunu', kind: 'neg', d: 'Yıllarca kafeste yaşamış, dünyadan habersiz büyümüştür.', sk: { idare: -2, diplomasi: -2 }, sultan: 0, npc: 0 },
  gazi: { n: 'Gazi', kind: 'pos', d: 'Bizzat savaşa katılmış ve zafer kazanmıştır.', sk: { askeri: 2 }, sultan: 0, npc: 0 },
  hattat: { n: 'Hattat', kind: 'pos', d: 'Güzel yazı sanatında ustadır.', sk: { ilim: 1 }, sultan: 0, npc: 0 },
  nikris: { n: 'Nikris', kind: 'neg', d: 'Gut hastalığı ağrıları çeker.', sk: {}, sultan: 0, npc: 0 },
};

/** Padişahın yetişme tarzı (yeni oyunda seçilir) */
PH.D.upbringing = [
  { id: 'sancak', n: 'Sancakta İdareci', d: 'Manisa sancağında devlet idaresini öğrendiniz.', sk: { idare: 4, askeri: 2, diplomasi: 1 } },
  { id: 'medrese', n: 'İlim Ehli', d: 'Devrin en büyük hocalarından ders aldınız.', sk: { ilim: 5, diplomasi: 2 } },
  { id: 'ordu', n: 'Sınır Gazisi', d: 'Gençliğiniz akıncılar ve sipahiler arasında geçti.', sk: { askeri: 5, idare: 1, entrika: 1 } },
  { id: 'saray', n: 'Saray Çocuğu', d: 'Harem ve Enderun koridorlarının fısıltılarıyla büyüdünüz.', sk: { entrika: 4, diplomasi: 3 } },
];
