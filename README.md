# Padişah Hayatı

Yazı tabanlı, mobil uygulama hissi veren bir **Osmanlı padişahı yaşam ve devlet simülasyonu**.
Saf HTML, CSS ve JavaScript ile yazılmıştır; derleme, sunucu ya da kütüphane gerektirmez.

## Çalıştırma

- `index.html` dosyasını bir tarayıcıda açmanız yeterli (klasik `<script>` etiketleri kullanıldığı için `file://` ile de çalışır).
- Ya da bir yerel sunucu ile: `python3 -m http.server` → `http://localhost:8000`
- Telefonda tarayıcı menüsünden **"Ana ekrana ekle"** derseniz tam ekran, uygulama gibi açılır (PWA manifest'i hazır).
- Oyun her ay otomatik kaydedilir (`localStorage`); ayrıca 3 elle kayıt yuvası vardır.

## Oynanış

Her tur bir aydır. Her ay sınırlı **vakit**iniz (genelde 4) vardır; şahsi faaliyetler vakit harcar, devlet kararları ise para ve sonuçlarla ödenir.

| Ekran | Neler yapılır |
|---|---|
| **Saray** | Padişahın sağlığı, keyfi, stresi, takvası ve 5 yeteneği (İdare, Askerlik, Diplomasi, Entrika, İlim). 16 şahsi faaliyet: av, tebdil-i kıyafet, arzuhal dinleme, Cuma selamlığı, kütüphane, şiir/hat/musiki, idman, hamam, ziyafet, eyalet teftişi, müneccimbaşı, hekimbaşı… |
| **Divan** | 12 makam (Sadrazam, vezirler, Defterdar, Şeyhülislam, Kaptan-ı Derya, Yeniçeri Ağası, Bostancıbaşı…). Atama, azil, müsadere, sürgün, Yedikule, siyaseten katl. Divan toplantısı ve gündem. Vergi oranı, akçe tağşişi/ıslahı, Galata sarraflarından borç. 19 kanun, 8 ferman, veraset usulü. 16 yapı türüyle inşaat. |
| **Harem** | Valide Sultan, haseki ve cariyeler; ziyaret, mertebe, nikâh, azat. Doğan çocuklara isim koyma, eğitim (odak + hoca), sancağa çıkarma, kafes, veliaht ilanı, kızları paşalarla evlendirme. Hanedan silsilesi. |
| **Ordu** | Yeniçeri, sipahi, azap, Nizam-ı Cedid, top ve gemi. Asker toplama/terhis, talim, bahşiş, esame yoklaması. Sefer planlama (hedef, kuvvet kaydırıcıları, serdar), meydan muharebesinde taktik seçimi, kuşatmada hücum/aman/sabır. Kış yıpratması. |
| **Dünya** | Dönemine göre 7–9 devlet: elçi, hediye, ticaret ahdi, ittifak, haraç talebi, tehdit, casus, savaş ilanı, şartlı barış teklifi. Eyaletler: vali, yatırım, muafiyet, tenkil, müfettiş. Şematik harita. |

Ayrıca: 100'ü aşkın olay (felaketler, isyanlar, entrikalar, harem çekişmeleri, döneme özgü tarihi durumlar), komplo sistemi (darbe, zehir, isyan), padişahın ölümünde veraset ile oyunun yeni padişahla sürmesi, yaptıklarınıza göre kazanılan lakaplar (Fâtih, Kanunî, Yavuz, Âdil, Deli…), vakanüvis (kronik) ve istatistikler.

### Dönemler
1. **Fetih Arifesi (1451)** – Edirne'den Kostantiniyye'ye
2. **Muhteşem Yüzyıl (1520)** – zirvedeki imparatorluk
3. **Kafes Devri (1603)** – Celâlîler, şişmiş ocak, boş hazine
4. **Nizam-ı Cedid (1789)** – ıslahat ya da çöküş

## Dosya yapısı

```
index.html               Uygulama kabuğu, betik sırası
manifest.webmanifest     PWA ayarları
assets/icon.svg          Uygulama simgesi
css/
  base.css               Değişkenler, sıfırlama, düğmeler
  layout.css             Üst çubuk, sekmeler, alt sayfa, pencereler
  components.css         Kartlar, listeler, çubuklar, olay parşömeni
  screens.css            Ekranlara özgü stiller
js/
  core/   util.js (yardımcılar, Türkçe ek uyumu), icons.js (SVG ikonlar), fx.js (etki sistemi)
  data/   names, traits, offices, world (dönem/devlet/eyalet), buildings, laws
  systems/
    chars.js       Karakter oluşturma, yaşlanma, ölüm, eğitim
    state.js       Yeni oyun kurulumu, makam atama
    economy.js     Bütçe, eyaletler, kanunlar, inşaat, gösterge sürüklenmesi
    court.js       Atama/azil/idam, komplolar, Divan gündemi
    harem.js       Harem, doğum, hanedan, veraset, lakap
    military.js    Ordu gücü, sefer, muharebe, kuşatma, düşman saldırıları
    diplomacy.js   İlişkiler, savaş/barış, yapay zekâ
    events.js      Olay motoru
    activities.js  Şahsi faaliyetler ve karşılaşma olayları
    turn.js        Ay sonu işleyişi, kronik
    save.js        Kayıt/yükleme, ayarlar
  events/  ev_court, ev_people, ev_harem, ev_war, ev_world, ev_era (olay tanımları)
  ui/
    ui.js          Kabuk, sekmeler, alt sayfa/pencere, olay akışı, ay raporu
    portrait.js    Prosedürel SVG portreler, armalar, tuğra
    charsheet.js   Kişi sayfası ve tüm kişi etkileşimleri
    screens/       palace, divan, harem, army, world, chronicle
    menu.js, newgame.js
  main.js          Başlangıç
```

## Geliştirici notları

- Tüm modüller `window.PH` ad alanında toplanır; betik sırası `index.html` içindedir.
- **Stat değişiklikleri** her zaman `PH.fx({ popularity: 5, treasury: -1e6 })` ile yapılır; `PH.FX.run(fn)` bu değişiklikleri toplayıp oyuncuya "etki çipleri" olarak gösterir.
- **Yeni olay eklemek** için ilgili `js/events/ev_*.js` dosyasına `E.reg({...})` ekleyin:
  ```js
  E.reg({
    id: 'ornek', cat: 'halk', icon: 'people', title: 'Başlık',
    w: 3, cd: 12,                       // w varsa rastgele olaydır; cd = bekleme (ay)
    cond: (s) => s.emp.popularity < 50, // isteğe bağlı koşul
    setup: (s) => ({ p: 'bursa' }),     // isteğe bağlı bağlam (yalnızca kimlikler)
    text: (s, ctx) => `Metin...`,
    choices: [
      { t: 'Seçenek', hint: 'İpucu', req: E.req.money(1e6), run: (s, ctx) => { PH.fx({ treasury: -1e6, popularity: 4 }); return 'Sonuç metni'; } },
    ],
  });
  ```
- Arayüz eylemleri `data-act="eylemAdi"` öznitelikleriyle tek bir tıklama dağıtıcısından `PH.A.eylemAdi(dataset)` fonksiyonuna gider.
- İsimlere ek getirirken `U.gen / U.acc / U.dat / U.loc / U.abl` yardımcılarını kullanın (ör. `U.gen('Ahmed Paşa')` → `Ahmed Paşa'nın`).

> Tarihî dönemlerden esinlenen kurgusal bir simülasyondur; oynadığınız padişah ve olayların sonuçları hayal ürünüdür.
