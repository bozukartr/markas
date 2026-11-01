/* Padişah Hayatı — Döneme özgü olaylar */
(function () {
  const U = PH.U, D = PH.D, C = PH.C, St = PH.St, E = PH.E, Dp = PH.Dip;
  const fx = PH.fx;
  const N = (c) => C.name(c);

  /* ===================== FETİH ARİFESİ (1451) ===================== */
  E.reg({
    id: 'era0_intro', cat: 'dunya', icon: 'castle', title: 'Kızıl Elma: Kostantiniyye',
    text: () => 'Edirne Sarayı\'nda ilk divan toplandı. Sadrazam Çandarlı Halil Paşa temkinli: "Hünkârım, Bizans\'a dokunmak bütün Hristiyan âlemini üzerimize çeker. Haraç almak yeter." Zağanos Paşa ise ayağa kalktı: "Kostantiniyye fethedilmedikçe bu devlet tam bir devlet olamaz! Hadis-i şerif müjdeliyor: ne güzel komutan, ne güzel asker!"\n\nGözler size çevrildi.',
    choices: [
      { t: 'Zağanos haklı: hazırlıklara başlayın!', hint: 'Bizans\'a savaş ilan edilir', run: (s) => { const n = s.nations.byz; Dp.declareWar(n); fx({ janissary: 6, ulema: 5, prestige: 3 }); n.tribute = 0; return 'Boğaz\'ın Avrupa yakasında Rumeli Hisarı\'nın temelleri atıldı. Ordu ekranından İstanbul seferini başlatabilirsiniz. Kale çok güçlü (5); çok sayıda topa ihtiyacınız olacak!'; } },
      { t: 'Halil Paşa\'yı dinleyin: önce Anadolu\'yu toparlayın', run: (s) => { fx({ stability: 4, treasury: 2e6 }); return 'Bizans haraç ödemeye devam edecek. Karaman ve Akkoyunlu sizi bekliyor.'; } },
      { t: 'Önce Rumeli Hisarı ve büyük toplar yapılsın, sonra karar veririz', run: (s) => { fx({ treasury: -6e6, cannons: 40, prestige: 2 }); s.provs.istanbul && (s.provs.istanbul.fort = Math.max(3, s.provs.istanbul.fort - 1)); return 'Boğazkesen hisarı yükseldi; Bizans\'ın Karadeniz bağlantısı kesildi. Kostantiniyye\'nin savunması zayıfladı.'; } },
    ],
  });

  E.reg({
    id: 'orban', cat: 'ordu', icon: 'cannon', title: 'Macar Dökümcü Urban',
    era: [0], w: 5, once: true,
    text: () => 'Urban adında Macar bir top dökümcüsü huzura çıktı. Bizans İmparatoru ona istediği parayı ödeyemediği için size gelmiş. "Bana malzeme ve altın verin," diyor, "Babil surlarını bile yıkacak bir top dökeyim!"',
    choices: [
      { t: 'İstediği her şeyi verin', hint: '6 Mn akçe', req: E.req.money(6e6), run: (s) => { fx({ treasury: -6e6, cannons: 30, prestige: 3 }); s.flags.sahiTopu = true; return 'Edirne\'de dökülen dev "Şâhî" topu, denendiğinde gürültüsü kilometrelerce öteden duyuldu. (Kuşatmalarda büyük avantaj.)'; } },
      { t: 'Bir Frenk\'e güvenilmez', run: () => 'Urban başka kapılara gitti.' },
    ],
  });

  E.reg({
    id: 'karaman_kiskirt', cat: 'dunya', icon: 'flag', title: 'Karamanoğlu\'nun Kışkırtması',
    era: [0], w: (s) => (s.nations.kar && !s.nations.kar.dead && !s.nations.kar.war ? 4 : 0), cd: 30,
    text: () => 'Karamanoğlu İbrahim Bey, Venedik\'le gizli bir anlaşma yaparak Anadolu\'daki Türkmen beylerini Osmanlı aleyhine kışkırtıyor. Hamid ve Teke sancaklarında huzursuzluk baş gösterdi.',
    choices: [
      { t: 'Karaman\'a savaş ilan edin', run: (s) => { Dp.declareWar(s.nations.kar); return 'Ordu Anadolu\'ya geçmeye hazırlanıyor.'; } },
      { t: 'Bir Osmanlı prensesi ile evlilik ittifakı teklif edin', run: (s) => { Dp.relChange(s.nations.kar, 25); fx({ prestige: -1 }); return 'Karamanoğlu teklifi memnuniyetle karşıladı.'; } },
      { t: 'Sınır kalelerini güçlendirin', run: (s) => { fx({ treasury: -3e6 }); if (s.provs.ankara) s.provs.ankara.fort++; return 'Sınır tahkim edildi.'; } },
    ],
  });

  /* ===================== MUHTEŞEM YÜZYIL (1520) ===================== */
  E.reg({
    id: 'macar_zaaf', cat: 'dunya', icon: 'crown', title: 'Macar Tahtı Sarsılıyor',
    era: [1], w: (s) => (s.nations.hun && !s.nations.hun.dead && !s.nations.hun.war ? 4 : 0), once: true,
    text: () => 'Budin\'den gelen haberlere göre genç Macar kralı Lajos, asilzadeleriyle kavgalı. Hazinesi boş, ordusu dağınık. Belgrad kalesi zayıf bir garnizonla korunuyor. Eflak voyvodası, "Macaristan\'ın kapısı açık" diye yazıyor.',
    choices: [
      { t: 'Macaristan\'a savaş ilan edin', run: (s) => { Dp.declareWar(s.nations.hun); s.nations.hun.str = Math.round(s.nations.hun.str * 0.8); return 'Tuğlar Belgrad\'a çevrildi. Macar ordusu zayıfladı.'; } },
      { t: 'Haraç talep edin', run: (s) => { const n = s.nations.hun; if (U.chance(0.4)) { n.tribute = 400000; return 'Macar kralı haraç ödemeyi kabul etti!'; } Dp.relChange(n, -20); return 'Lajos elçinizi idam ettirdi! Bu bir savaş sebebidir.'; } },
    ],
  });

  E.reg({
    id: 'fransa_yardim', cat: 'dunya', icon: 'letter', title: 'Fransa Kralının Mektubu',
    era: [1], w: (s) => (s.nations.fra && s.nations.hab ? 3 : 0), once: true,
    text: () => 'Pavia\'da Habsburg imparatoruna yenilip esir düşen Fransa kralının annesi, gizli bir elçiyle mektup gönderdi: "Oğlumu kurtarın; Habsburg\'a karşı sizinle birlikte olalım."',
    choices: [
      { t: 'Fransa ile ittifak kurun', run: (s) => { s.nations.fra.ally = true; s.nations.fra.trade = true; Dp.relChange(s.nations.fra, 30); Dp.relChange(s.nations.hab, -20); fx({ prestige: 5 }); return 'Cevabınız tarihe geçti: "Ben ki sultanlar sultanı... Sen ki Fransa vilayetinin kralı Fransuva\'sın..." Fransa artık müttefikiniz.'; } },
      { t: 'Kâfirlerin kavgasına karışmayın', run: () => { fx({ ulema: 2 }); return 'Mektup cevapsız kaldı.'; } },
    ],
  });

  E.reg({
    id: 'hint_seferi', cat: 'ordu', icon: 'ship', title: 'Hint Denizlerinden Yardım Çağrısı',
    era: [1], w: (s) => (s.provs.misir && s.provs.misir.owner === 'osm' ? 2 : 0), once: true,
    text: () => 'Gücerat sultanı ve Açe hükümdarı, Portekizlilerin Hint Okyanusu\'nda Müslüman tüccarlara zulmettiğini, hacı gemilerini batırdığını bildiriyor. Süveyş\'ten bir donanma gönderilmesini istiyorlar.',
    choices: [
      { t: 'Süveyş\'ten donanma gönderin', hint: '12 Mn akçe', req: E.req.money(12e6), run: (s) => { fx({ treasury: -12e6, ships: -5 }); if (U.chance(0.5)) { fx({ prestige: 8, ulema: 5, legitimacy: 4 }); s.flags.mineUntil = s.turn + 60; s.flags.mineInc = (s.flags.mineInc || 0) + 400000; return 'Seydi Ali Reis\'in donanması Portekizlileri Aden\'de dağıttı! Baharat yolu yeniden açılıyor.'; } fx({ prestige: -3 }); return 'Donanma Hürmüz önlerinde ağır kayıplar verdi.'; } },
      { t: 'Topçu ve tüfekçi ustaları gönderin', hint: '3 Mn akçe', req: E.req.money(3e6), run: () => { fx({ treasury: -3e6, prestige: 4, ulema: 2 }); return 'Osmanlı topçuları Açe\'de kale surlarına yerleşti.'; } },
      { t: 'Uzak denizler bizim işimiz değil', run: () => { fx({ prestige: -2, ulema: -2 }); return 'Hint Müslümanları hayal kırıklığına uğradı.'; } },
    ],
  });

  E.reg({
    id: 'safevi_tehdit', cat: 'dunya', icon: 'flag', title: 'Şah\'ın Tehdidi',
    era: [1, 2], w: (s) => (s.nations.saf && !s.nations.saf.war && s.nations.saf.rel < -20 ? 3 : 0), cd: 40,
    text: (s) => `${Dp.ruler('saf')}, Bağdat ve Tebriz üzerinde hak iddia ediyor ve sınırdaki Türkmen aşiretlerini ayaklandırıyor. Doğu sınırındaki valiler acil yardım istiyor.`,
    choices: [
      { t: 'İran seferine hazırlanın', run: (s) => { Dp.declareWar(s.nations.saf); return 'Ordu doğuya yürümeye hazır.'; } },
      { t: 'Doğu kalelerini tahkim edin', run: (s) => { fx({ treasury: -4e6 }); ['van', 'erzurum', 'bagdat'].forEach((id) => s.provs[id] && s.provs[id].owner === 'osm' && (s.provs[id].fort = Math.min(6, s.provs[id].fort + 1))); return 'Doğu kaleleri güçlendirildi.'; } },
      { t: 'Şah\'a barış elçisi gönderin', run: (s) => { Dp.relChange(s.nations.saf, 15); return 'Gerginlik bir süreliğine azaldı.'; } },
    ],
  });

  /* ===================== KAFES DEVRİ (1603) ===================== */
  E.reg({
    id: 'ocak_islah', cat: 'ordu', icon: 'jan', title: 'Ocağı Islah Fikri',
    era: [2], w: (s) => (s.army.jan > 25000 ? 3 : 0), once: true,
    text: () => 'Hocanız Ömer Efendi gizlice size bir layiha sundu: Yeniçeri ocağı kalabalıklaşmış, disiplini bozulmuş, çoğu esnaflık yapıyor. "Anadolu\'dan ve Suriye\'den yeni bir ordu toplayıp ocağı lağvedelim," diyor. Bu, çok tehlikeli bir oyundur.',
    choices: [
      { t: 'Ocaktaki sahte kayıtları temizleyin', hint: 'Yeniçeri sayısı azalır, masraf düşer', run: (s) => { const l = Math.round(s.army.jan * 0.2); fx({ jan: -l, janissary: -12, corruption: -3 }); return `Yoklama yapıldı; ${U.num(l)} sahte esame defterden silindi.`; } },
      { t: 'Gizlice yeni bir ordu toplamaya başlayın', hint: 'Çok riskli', run: (s) => { fx({ treasury: -8e6, sip: 6000, azap: 6000, janissary: -18 }); if (U.chance(0.35)) E.push('yeniceri_isyan', {}); return 'Anadolu\'dan sekbanlar toplanıyor. Ocak ağaları bir şeylerin döndüğünü sezmeye başladı.'; } },
      { t: 'Layihayı yakın', run: () => { fx({ janissary: 2 }); return 'Ocağa dokunmak, aslanın kuyruğuna basmaktır.'; } },
    ],
  });

  E.reg({
    id: 'koprulu', cat: 'divan', icon: 'seal', title: 'Mutlak Yetki İsteyen Vezir',
    era: [2], w: (s) => (s.emp.stability < 45 ? 3 : 0.5), once: true,
    text: () => 'Seksenine merdiven dayamış, sert yüzlü bir paşa huzurunuza çıktı. "Sadrazamlığı kabul ederim," diyor, "ama şartlarım var: tayinlerime kimse karışmayacak, kimsenin sözüyle azledilmeyeceğim, verdiğim kararlara itiraz edilmeyecek."',
    choices: [
      { t: 'Şartlarını kabul edin', run: (s) => { const c = C.statesman('pasa', { nick: 'Köprülü', age: 78, traits: ['ehil', 'zalim', 'durust'], op: 40, amb: 30 }); c.sk.idare = 22; c.sk.askeri = 14; St.assign('sadrazam', c); fx({ stability: 10, corruption: -10, legitimacy: -3, popularity: -2 }); s.flags.koprulu = c.id; return `${N(c)} mühr-i hümâyunu aldı. İlk icraatı, otuz kadar zorba ve rüşvetçinin idamı oldu. Devlet bir anda toparlanıyor.`; } },
      { t: 'Hiçbir kul padişahın yetkisini sınırlayamaz', run: () => { fx({ legitimacy: 2 }); return 'Yaşlı paşa başını eğip çekildi.'; } },
    ],
  });

  E.reg({
    id: 'lale_devri', cat: 'sanat', icon: 'tulip', title: 'Lale Merakı',
    era: [2, 3], w: (s) => (s.year >= 1700 ? 3 : 0), once: true,
    text: () => 'Sadâbâd köşkünde düzenlenen helva sohbetleri, kağıthane eğlenceleri ve lale bahçeleri İstanbul\'un yüksek tabakasını sardı. Bir tek lale soğanı, bir konak fiyatına satılıyor! Bu zevk ve sefa, Avrupa ile yeni bir barış döneminin ürünü.',
    choices: [
      { t: 'Siz de bu zevk ve sefaya katılın', run: () => { fx({ happiness: 15, prestige: 4, popularity: -5, treasury: -5e6, ilim: 1 }); return 'Saray bahçeleri kaplumbağaların sırtına konmuş mumlarla aydınlanıyor. Şiir ve musiki altın çağını yaşıyor.'; } },
      { t: 'Lale fiyatlarına narh koyun', run: () => { fx({ popularity: 2, prestige: 1 }); return 'Lale soğanlarına tavan fiyat kondu.'; } },
      { t: 'İsrafı yasaklayın', run: () => { fx({ popularity: 3, ulema: 3, happiness: -4 }); return 'Eğlenceler yasaklandı; ulema memnun.'; } },
    ],
  });

  E.reg({
    id: 'matbaa_teklif', cat: 'sanat', icon: 'book', title: 'Matbaa',
    era: [2, 3], w: (s) => (s.year >= 1700 && !s.laws.matbaa ? 3 : 0), once: true,
    text: () => 'Macar asıllı bir müteferrika, Arap harfleriyle kitap basacak bir matbaa kurmak için izin istiyor. Lügatler, tarih ve coğrafya kitapları basılabilir. Hattatlar ise ekmeklerinin elinden gideceğinden korkuyor; bazı ulema da itiraz edecek.',
    choices: [
      { t: 'Dinî olmayan kitaplar için izin verin', run: () => { PH.Eco.toggleLaw('matbaa'); return 'İlk kitap basıldı: "Vankulu Lügati". Yeni bir çağ başlıyor.'; } },
      { t: 'Reddedin', run: () => { fx({ ulema: 3 }); return 'Hattatlar rahat bir nefes aldı.'; } },
    ],
  });

  /* ===================== NİZAM-I CEDİD (1789) ===================== */
  E.reg({
    id: 'era3_intro', cat: 'dunya', icon: 'scroll', title: 'Islahat Layihaları',
    text: () => 'Tahta çıkar çıkmaz devletin ileri gelenlerinden "devletin kurtuluşu için ne yapılmalı?" sorusuna cevap istediniz. Yirmiden fazla layiha önünüzde. Hepsinde ortak bir fikir var: Avrupa usulü talimli, yeni bir ordu. Rusya ile savaş hâlâ sürüyor ve ordu bozgun üstüne bozgun yaşıyor.',
    choices: [
      { t: 'Nizam-ı Cedid ordusunu kurun!', hint: 'Yeniçeriler hoşnutsuz olur', run: (s) => { PH.Eco.toggleLaw('nizam'); fx({ nizam: 3000, treasury: -6e6, prestige: 3 }); return 'Levent çiftliğinde Avrupa usulü talimli ilk taburlar kuruldu. Ordu ekranından Nizam-ı Cedid askeri toplayabilirsiniz.'; } },
      { t: 'Önce Rusya ile barış yapılmalı', run: (s) => { const n = s.nations.rus; n.weary += 30; fx({ stability: 2 }); return 'Barış arayışları hızlandı. (Dünya ekranından barış teklif edebilirsiniz.)'; } },
      { t: 'Avrupa başkentlerine daimî elçiler gönderin', hint: '4 Mn akçe', run: (s) => { fx({ treasury: -4e6, diplomasi: 2, prestige: 2 }); Object.values(s.nations).filter((n) => !n.war).forEach((n) => Dp.relChange(n, 6)); s.flags.daimiElci = true; return 'Londra, Paris ve Viyana\'da ilk Osmanlı daimî elçilikleri açıldı.'; } },
    ],
  });

  E.reg({
    id: 'fransiz_ihtilali', cat: 'dunya', icon: 'fire', title: 'Fransa\'da İhtilal',
    era: [3], w: 4, once: true,
    text: () => 'Paris\'te halk Bastil zindanını bastı! Fransa kralı tahtını kaybetmek üzere. "Hürriyet, eşitlik, kardeşlik" sözleri Avrupa\'yı sarsıyor. Bu fikirler Rum ve Sırp tebaanın kulağına da çalınıyor.',
    choices: [
      { t: 'Avrupa\'nın meşguliyetinden faydalanın', run: (s) => { if (s.nations.hab) s.nations.hab.str = Math.round(s.nations.hab.str * 0.9); fx({ prestige: 1 }); return 'Avusturya batıya odaklandı; Osmanlı sınırlarında baskı azaldı.'; } },
      { t: 'İhtilal fikirlerine karşı sansür', run: (s) => { fx({ stability: 3, popularity: -1 }); PH.Eco.ownProvs(s).filter((p) => D.prov[p.id].reg === 'Rumeli').forEach((p) => (p.unrest = Math.max(0, p.unrest - 5))); return 'Frenk gazeteleri yasaklandı.'; } },
    ],
  });

  E.reg({
    id: 'misir_isgal', cat: 'dunya', icon: 'alert', title: 'Mısır\'a Çıkarma!',
    era: [3], w: (s) => (s.year >= 1797 && s.provs.misir && s.provs.misir.owner === 'osm' ? 6 : 0), once: true,
    text: () => 'Fransız generali Bonapart, büyük bir donanmayla İskenderiye\'ye çıktı! Memlük beyleri Piramitler önünde bozguna uğradı. Mısır elden gidiyor.',
    choices: [
      { t: 'İngiltere ve Rusya ile ittifak kurup Fransa\'ya savaş açın', run: (s) => { const f = s.nations.fra; Dp.declareWar(f); if (s.nations.rus) { s.nations.rus.ally = true; Dp.relChange(s.nations.rus, 30); } s.provs.misir.unrest = 90; return 'Tarihin cilvesi: asırlık düşman Rusya ile müttefik oldunuz. Mısır\'ı kurtarmak için sefer düzenleyin!'; } },
      { t: 'Mısır\'ı Fransa\'ya bırakın', run: (s) => { const p = s.provs.misir; p.owner = 'fra'; p.gov = null; fx({ prestige: -15, legitimacy: -8, ulema: -10 }); s.stats.lost++; s.reign.lost++; return 'Mısır kaybedildi. İslam âleminde büyük bir infial var.'; } },
    ],
  });

  E.reg({
    id: 'ayan', cat: 'divan', icon: 'people', title: 'Âyanlar',
    era: [3], w: 3, cd: 36,
    setup: (s) => { const p = U.pick(PH.Eco.ownProvs(s).filter((x) => !x.vassal && x.id !== s.capital)); return p ? { p: p.id, name: U.pick(['Tepedelenli Ali', 'Pazvantoğlu Osman', 'Alemdar Mustafa', 'Kavalalı Mehmed Ali', 'Çapanoğlu Süleyman', 'Karaosmanoğlu Hacı Mehmed']) } : null; },
    text: (s, ctx) => `${U.loc(D.prov[ctx.p].n)} ${ctx.name} adında bir âyan, kendi ordusunu kurmuş, vergileri kendi topluyor. Merkeze gönderdiği para giderek azalıyor. Ama aynı zamanda bölgede asayişi sağlıyor ve gerekirse binlerce askerle sefere katılabilir.`,
    choices: [
      { t: 'Âyanı vali olarak tanıyın', run: (s, ctx) => { const p = s.provs[ctx.p]; const c = C.statesman('pasa', { name: ctx.name.split(' ')[1] || ctx.name, nick: ctx.name.split(' ')[0], op: 20, amb: 85, traits: ['hirsli', 'ehil'] }); c.sk.askeri += 4; if (p.gov) { const g = C.get(p.gov); if (g) g.gov = null; } c.gov = p.id; p.gov = c.id; fx({ sip: 5000, legitimacy: -2 }); return `${N(c)} artık ${D.prov[ctx.p].n} valisi. Askerleri ordunuza katıldı.`; } },
      { t: 'Üzerine ordu gönderin', run: (s, ctx) => { fx({ treasury: -5e6 }); if (U.chance(0.55)) { fx({ prestige: 3, stability: 2 }); return 'Âyan yakalandı ve idam edildi.'; } s.provs[ctx.p].rebel = true; fx({ prestige: -4 }); return 'Âyanın kuvvetleri devlet ordusunu yendi! Eyalet isyanda.'; } },
      { t: 'Sened-i İttifak: âyanlarla bir antlaşma yapın', run: (s, ctx) => { fx({ stability: 5, legitimacy: -5, prestige: -2 }); PH.Eco.ownProvs(s).forEach((p) => (p.unrest = Math.max(0, p.unrest - 8))); return 'Âyanlar padişaha bağlılık yemini etti, padişah da onların haklarını tanıdı.'; } },
    ],
  });
})();
