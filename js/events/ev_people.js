/* Padişah Hayatı — Halk, din, felaket ve şahsi olaylar */
(function () {
  const U = PH.U, D = PH.D, C = PH.C, St = PH.St, E = PH.E;
  const fx = PH.fx;
  const N = (c) => C.name(c);
  const off = (o) => St.officer(o);
  const cap = () => D.prov[PH.state.capital].n;

  /* ===================== FELAKETLER ===================== */
  E.reg({
    id: 'yangin', cat: 'felaket', icon: 'fire', title: 'Büyük Yangın!',
    w: 3, cd: 30,
    text: (s) => `${U.loc(cap())}, Cibali'deki bir kalafat atölyesinden çıkan yangın, poyrazın etkisiyle ahşap mahalleleri yalayıp geçiyor. Binlerce ev kül oldu, alevler Süleymaniye yokuşuna dayandı. Halk sokaklarda ağlıyor.`,
    choices: [
      { t: 'Bizzat yangın yerine gidip tulumbacıları yönetin', hint: 'Sağlık riski; halk sevgisi', run: () => { fx({ popularity: 8, legitimacy: 3, health: -U.ri(0, 8), stress: 5, food: -3 }); return 'Atınızın üzerinde alevlerin arasında emirler verirken görüldünüz. Yangın söndürüldü; halk "Padişahım çok yaşa!" diye haykırdı.'; } },
      { t: 'Evleri yananlara hazineden yardım', hint: '8 Mn akçe', req: E.req.money(8e6), run: () => { fx({ treasury: -8e6, popularity: 10, piety: 2 }); return 'Her hane için kereste ve akçe dağıtıldı. Mahalleler hızla yeniden yükseliyor.'; } },
      { t: 'Şehrin kâgir binalarla yeniden yapılmasını emredin', hint: '14 Mn akçe, kalıcı gelişme', req: E.req.money(14e6), run: (s) => { fx({ treasury: -14e6, popularity: 5, prestige: 3 }); const p = s.provs[s.capital]; p.dev = Math.min(10, p.dev + 1); return 'Yeni fermanla yanan yerlerde ahşap ev yapımı yasaklandı. Şehir daha güzel ve sağlam yükselecek.'; } },
      { t: 'Kaderdir; hazine buna yetmez', run: () => { fx({ popularity: -10, stability: -3, food: -5 }); return 'Evsiz kalan binlerce kişi camii avlularına sığındı. Kahvehanelerde padişahın umursamazlığı konuşuluyor.'; } },
    ],
  });

  E.reg({
    id: 'deprem', cat: 'felaket', icon: 'quake', title: 'Zelzele',
    w: 2, cd: 60,
    setup: (s) => { const p = U.pick(PH.Eco.ownProvs(s).filter((x) => !x.vassal)); return p ? { p: p.id } : null; },
    text: (s, ctx) => `${D.prov[ctx.p].n} şiddetli bir zelzeleyle sarsıldı. Camilerin kubbeleri çatladı, minareler yıkıldı, surların bir kısmı çöktü. Halk bunu "küçük kıyamet" olarak anıyor.`,
    choices: [
      { t: 'Mimarbaşını gönderip camii ve surları onarın', hint: '10 Mn akçe', req: E.req.money(10e6), run: (s, ctx) => { fx({ treasury: -10e6, popularity: 5, ulema: 3, piety: 2 }); return 'Onarım çalışmaları başladı. Mimarlar fırsattan istifade kubbeleri daha da sağlamlaştırıyor.'; } },
      { t: 'Halka vergi muafiyeti tanıyın', run: (s, ctx) => { const p = s.provs[ctx.p]; p.exempt = s.turn + 12; p.unrest = Math.max(0, p.unrest - 15); fx({ popularity: 4 }); return 'Bir yıllık muafiyet fermanı yayınlandı.'; } },
      { t: 'Yerel kaynaklarla halletsinler', run: (s, ctx) => { const p = s.provs[ctx.p]; p.dev = Math.max(1, p.dev - 1); p.unrest = Math.min(100, p.unrest + 20); p.fort = Math.max(1, p.fort - 1); fx({ popularity: -4 }); return 'Eyalet harabeye döndü; yıkılan surlar onarılmadı.'; } },
    ],
  });

  E.reg({
    id: 'veba', cat: 'felaket', icon: 'plague', title: 'Taun (Veba) Salgını',
    w: (s) => 2.5 - (PH.Eco.countBuilding('darussifa') + PH.Eco.countBuilding('sukemeri')) * 0.3, cd: 40,
    text: (s) => `Limana yanaşan bir gemiyle gelen taun, ${U.loc(cap())} hızla yayılıyor. Her gün yüzlerce cenaze kalkıyor. Hekimler çaresiz; halk camilerde dua ediyor. Saray içinde de ilk vakalar görüldü.`,
    choices: [
      { t: 'Saray halkıyla birlikte Edirne\'ye çekilin', hint: 'Kendinizi koruyun; halk kırgın', run: (s) => { fx({ popularity: -8, legitimacy: -3, stress: -2 }); s.flags.plagueUntil = s.turn + 6; return 'Saray kafilesi gece yola çıktı. Arkada bıraktığınız şehirde ölüm kol geziyor.'; } },
      { t: 'Karantina: limanlar ve kapılar kapatılsın', hint: 'Ticaret durur; salgın kısa sürer', run: (s) => { fx({ treasury: -3e6, popularity: -2, stability: 2 }); s.flags.plagueUntil = s.turn + 3; return 'Şehir kapıları kapandı, gemiler limana alınmadı. Salgın yavaşlıyor.'; } },
      { t: 'Şehirde kalın, dua ve sadaka ile halkın yanında olun', hint: 'Sağlık riski; büyük halk sevgisi', run: (s) => { s.flags.plagueUntil = s.turn + 6; const sick = U.chance(0.25 - (PH.Eco.hasBuilding('darussifa') ? 0.1 : 0)); fx({ popularity: 8, piety: 5, legitimacy: 4, health: sick ? -U.ri(20, 40) : 0 }); C.list((c) => c.dyn && C.age(c) < 10 && c.id !== s.sultanId).forEach((c) => { if (U.chance(0.08)) { C.kill(c, 'taundan'); PH.Turn.noteDeath(c); } }); return sick ? 'Halkın arasında dolaşırken siz de hastalandınız! Hekimler başınızda nöbet tutuyor.' : 'Padişahın şehri terk etmemesi halka büyük cesaret verdi.'; } },
    ],
  });

  E.reg({
    id: 'kitlik', cat: 'felaket', icon: 'wheat', title: 'Kıtlık',
    cd: 12,
    text: (s) => `Zahire ambarları boşaldı (%${Math.round(s.emp.food)}). Fırınların önünde uzun kuyruklar var; ekmeğin narhı iki katına çıktı. Bazı mahallelerde açlıktan ölenler olduğu haberi geliyor.`,
    choices: [
      { t: 'Mısır\'dan gemilerle buğday getirtin', hint: '7 Mn akçe', req: (s) => (s.emp.treasury < 7e6 ? 'Hazine yetersiz' : true), run: () => { fx({ treasury: -7e6, food: 30, popularity: 4 }); return 'Buğday yüklü gemiler İstanbul limanına girdi. Fırınlar yeniden tütüyor.'; } },
      { t: 'Saray ambarlarını halka açın', run: () => { fx({ food: 15, popularity: 7, happiness: -3 }); return 'Saray kilerlerindeki erzak imaretler aracılığıyla dağıtıldı.'; } },
      { t: 'Narh koyun, ihtikârcıları asın', run: (s) => { fx({ food: 6, popularity: 3, corruption: -2 }); s.reign.cruelty++; return 'Birkaç karaborsacı fırıncı dükkânının önüne asıldı. Fiyatlar hızla düştü.'; } },
      { t: 'Halk sabretmeli', run: () => { fx({ popularity: -12, stability: -6 }); return 'Aç kalabalıklar sokaklara döküldü.'; } },
    ],
  });

  E.reg({
    id: 'agir_kis', cat: 'felaket', icon: 'drop', title: 'Kara Kış',
    w: (s) => (s.month === 0 || s.month === 1 ? 6 : 0), cd: 10,
    text: () => 'Haliç dondu! Kar, şehrin sokaklarını günlerce kapadı. Odun fiyatları uçtu, yollarda kervanlar mahsur kaldı.',
    choices: [
      { t: 'Fakirlere odun ve erzak dağıtın', hint: '2 Mn akçe', req: E.req.money(2e6), run: () => { fx({ treasury: -2e6, popularity: 5, food: -2 }); return 'Mahalle imamları aracılığıyla erzak dağıtıldı.'; } },
      { t: 'Saray bahçesinde buz eğlenceleri düzenleyin', run: () => { fx({ happiness: 8, popularity: -2, food: -4 }); return 'Donmuş havuzda kızak eğlenceleri yapıldı. Dışarıda ise halk soğuktan titriyor.'; } },
      { t: 'Bekleyin, bahar gelir', run: () => { fx({ food: -6, popularity: -3 }); return 'Kış uzun ve acımasız geçti.'; } },
    ],
  });

  E.reg({
    id: 'bereket', cat: 'halk', icon: 'wheat', title: 'Bereketli Bir Yıl',
    w: (s) => (s.month >= 4 && s.month <= 8 ? 3 : 0), cd: 20,
    text: () => 'Yağmurlar zamanında yağdı, tarlalar başak doldu. Köylüler uzun zamandır böyle bir mahsul görmediklerini söylüyor.',
    choices: [
      { t: 'Fazlası ambarlara kaldırılsın', run: () => { fx({ food: 15 }); return 'Ambarlar ağzına kadar doldu.'; } },
      { t: 'Fazla buğday Venedik\'e satılsın', run: () => { fx({ food: 5, treasury: 5e6 }); return 'Venedikli tüccarlar buğdayı altın karşılığı aldı.'; } },
      { t: 'Şükür kurbanları kesilsin, halka ziyafet', run: () => { fx({ food: 8, popularity: 5, piety: 2, treasury: -1e6 }); return 'Meydanlarda kazanlar kaynadı, herkes doyasıya yedi.'; } },
    ],
  });

  E.reg({
    id: 'maden', cat: 'ekonomi', icon: 'coin', title: 'Yeni Maden',
    w: 2, cd: 60,
    setup: (s) => { const p = U.pick(PH.Eco.ownProvs(s).filter((x) => !x.vassal && ['Rumeli', 'Anadolu'].includes(D.prov[x.id].reg))); return p ? { p: p.id, kind: U.pick(['gümüş', 'bakır', 'şap', 'demir']) } : null; },
    text: (s, ctx) => `${D.prov[ctx.p].n} dağlarında zengin bir ${ctx.kind} damarı bulundu! Madenciler kazı için hazineden destek istiyor.`,
    choices: [
      { t: 'Hazine doğrudan işletsin', hint: '4 Mn yatırım; 3 yıl gelir', req: E.req.money(4e6), run: (s) => { fx({ treasury: -4e6 }); s.flags.mineUntil = s.turn + 36; s.flags.mineInc = (s.flags.mineInc || 0) + U.ri(300, 500) * 1000; return 'Madenler hazine adına işletilmeye başlandı.'; } },
      { t: 'Mültezime ihale edin', hint: 'Peşin para', run: () => { fx({ treasury: 6e6, corruption: 2 }); return 'Mültezim peşin bedeli ödedi ve madene el koydu.'; } },
    ],
  });

  /* ===================== HALK ===================== */
  E.reg({
    id: 'isyan', cat: 'halk', icon: 'flag', title: (s, ctx) => `${U.loc(D.prov[ctx.p].n)} İsyan!`,
    valid: (s, ctx) => s.provs[ctx.p] && s.provs[ctx.p].owner === 'osm' && !s.provs[ctx.p].rebel,
    text: (s, ctx) => { const p = s.provs[ctx.p]; const g = C.get(p.gov); return `${D.prov[ctx.p].n} halkı ağır vergiler, ${g ? 'valinin zulmü' : 'valisizlik ve başıboşluk'} ve eşkıyalık yüzünden ayaklandı. Asiler kaleyi kuşattı, mahkemeleri yaktı. Bölgeden haber getiren ulak bitkin.`; },
    choices: [
      { t: 'Ordu gönderip isyanı bastırın', hint: (s) => `3 Mn akçe · Başarı %${Math.round(U.clamp(0.4 + PH.Mil.power(PH.Mil.home()) / 150000, 0.2, 0.92) * 100)}`, run: (s, ctx) => {
        const p = s.provs[ctx.p];
        fx({ treasury: -3e6 });
        if (U.chance(U.clamp(0.4 + PH.Mil.power(PH.Mil.home()) / 150000, 0.2, 0.92))) { p.unrest = 30; fx({ popularity: -2, sip: -U.ri(200, 1000), stability: 2 }); s.reign.cruelty++; return 'İsyan kanlı bir şekilde bastırıldı. Elebaşlarının kelleleri kale kapısına asıldı.'; }
        p.rebel = true; p.unrest = 95; fx({ prestige: -4, stability: -5, sip: -U.ri(1000, 3000) });
        return 'Ordu dağlarda pusuya düşürüldü. Eyalet artık asilerin elinde!';
      } },
      { t: 'Taleplerini kabul edin: vergi muafiyeti ve vali azli', run: (s, ctx) => { const p = s.provs[ctx.p]; p.exempt = s.turn + 18; p.unrest = 35; const g = C.get(p.gov); if (g) PH.Court.dismiss(g); fx({ legitimacy: -4, popularity: 2 }); return 'Asiler silahlarını bıraktı. Ama başka eyaletlerde de isyanın işe yaradığı konuşuluyor.'; } },
      { t: 'Görmezden gelin', run: (s, ctx) => { const p = s.provs[ctx.p]; p.rebel = true; p.unrest = 100; fx({ stability: -6, prestige: -3 }); return 'Eyalet merkezi dinlemiyor; vergiler kesildi.'; } },
    ],
  });

  E.reg({
    id: 'asi_eyalet', cat: 'halk', icon: 'flag', title: 'Asi Eyalet',
    w: (s) => (PH.Eco.ownProvs(s).some((p) => p.rebel) ? 7 : 0), cd: 4,
    setup: (s) => { const p = U.pick(PH.Eco.ownProvs(s).filter((x) => x.rebel)); return p ? { p: p.id } : null; },
    valid: (s, ctx) => s.provs[ctx.p] && s.provs[ctx.p].rebel && s.provs[ctx.p].owner === 'osm',
    text: (s, ctx) => `${D.prov[ctx.p].n} hâlâ asilerin elinde. Vergi gelmiyor, yollar güvensiz ve isyan komşu eyaletlere sıçrayabilir.`,
    choices: [
      { t: 'Büyük bir tenkil ordusu gönderin', hint: '6 Mn akçe', req: E.req.money(6e6), run: (s, ctx) => { fx({ treasury: -6e6 }); const p = s.provs[ctx.p]; if (U.chance(0.7)) { p.rebel = false; p.unrest = 40; fx({ prestige: 3, stability: 4, sip: -U.ri(500, 1500) }); return 'İsyan nihayet bastırıldı; eyalet yeniden itaat altında.'; } fx({ prestige: -3 }); return 'Asiler dağlara çekildi; harekât sonuçsuz kaldı.'; } },
      { t: 'Asi liderine paşalık ve af teklif edin', run: (s, ctx) => { const p = s.provs[ctx.p]; if (U.chance(0.55 + C.sultan().sk.diplomasi * 0.015)) { p.rebel = false; p.unrest = 45; const g = C.statesman('pasa', { nick: U.pick(['Deli', 'Kara', 'Kalenderoğlu', 'Canbolatoğlu']), op: 10, amb: 80, traits: ['hirsli', 'cesur'] }); g.gov = p.id; p.gov = g.id; fx({ legitimacy: -3 }); return `Asi lider ${N(g)} affı kabul etti ve vali olarak tayin edildi. Kendi adamlarını yönetecek.`; } fx({ prestige: -2 }); return 'Teklif reddedildi.'; } },
      { t: 'Beklemeye devam', run: (s, ctx) => { const near = PH.Eco.ownProvs(s).filter((x) => D.prov[x.id].reg === D.prov[ctx.p].reg && !x.rebel); near.forEach((x) => (x.unrest = Math.min(100, x.unrest + 6))); fx({ stability: -2 }); return 'Komşu eyaletlerde de huzursuzluk artıyor.'; } },
    ],
  });

  E.reg({
    id: 'esnaf', cat: 'halk', icon: 'people', title: 'Esnaf Loncalarının Şikâyeti',
    w: 4, cd: 14,
    text: (s) => `Kapalıçarşı esnafı, kethüdaları önderliğinde huzurunuza bir heyet gönderdi. ${s.emp.purity < 95 ? 'Akçenin değer kaybetmesiyle fiyatların fırladığını, ' : ''}yabancı tüccarların ayrıcalıklarından ve muhtesiplerin keyfi cezalarından şikâyet ediyorlar.`,
    choices: [
      { t: 'Narh usulünü getirin, muhtesipleri denetleyin', hide: (s) => s.laws.narh, run: () => { PH.Eco.toggleLaw('narh'); fx({ popularity: 2 }); return 'Narh usulü ilan edildi.'; } },
      { t: 'Esnafa vergi indirimi', hint: 'Bir yıl ticaret geliri biraz azalır', run: (s) => { fx({ popularity: 5, treasury: -2e6 }); return 'Esnaf vergilerinde indirim yapıldı.'; } },
      { t: 'Heyeti dinleyip savuşturun', run: () => { fx({ popularity: -3 }); return 'Esnaf eli boş döndü; dükkânlarda homurtular yükseldi.'; } },
    ],
  });

  E.reg({
    id: 'kadi_zulum', cat: 'halk', icon: 'gavel', title: 'Zalim Kadı',
    w: (s) => 3 + s.emp.corruption / 20, cd: 10,
    setup: (s) => { const p = U.pick(PH.Eco.ownProvs(s).filter((x) => !x.vassal)); return p ? { p: p.id } : null; },
    text: (s, ctx) => `${D.prov[ctx.p].n} köylülerinden bir grup, yalınayak İstanbul'a kadar yürüdü. Kadının miras davalarında rüşvet aldığını, yetimlerin malını yediğini söylüyorlar. Ellerinde imzalı bir mahzar var.`,
    choices: [
      { t: 'Kadıyı azledip sürgün edin', run: (s, ctx) => { fx({ popularity: 4, corruption: -2, ulema: -1 }); s.provs[ctx.p].unrest = Math.max(0, s.provs[ctx.p].unrest - 8); s.reign.justice++; return 'Kadı azledildi; köylüler sevinçle köylerine döndü.'; } },
      { t: 'Kazaskere havale edin', run: (s, ctx) => { const k = off('kazasker'); const good = k && k.sk.ilim > 10 && !C.has(k, 'rusvetci'); fx(good ? { popularity: 2, corruption: -1 } : { popularity: -1 }); if (good) s.reign.justice++; return good ? 'Kazasker titiz bir soruşturmayla kadıyı cezalandırdı.' : 'Dava kazaskerin masasında unutuldu.'; } },
      { t: 'Köylüleri azarlayıp gönderin', run: (s, ctx) => { fx({ popularity: -4 }); s.provs[ctx.p].unrest = Math.min(100, s.provs[ctx.p].unrest + 10); return 'Köylüler gözyaşları içinde geri döndü.'; } },
    ],
  });

  E.reg({
    id: 'celali', cat: 'halk', icon: 'flag', title: 'Celâlî Eşkıyası',
    era: [2], w: (s) => (s.flags.celali ? 0 : 6), cd: 24,
    text: () => 'Anadolu\'da Kara Yazıcı ve Deli Hasan gibi Celâlî reisleri binlerce sekbanla köyleri yağmalıyor. Köylüler toprağını terk edip şehirlere kaçıyor ("büyük kaçgun"). Valiler ya çaresiz ya da eşkıyayla işbirliği içinde.',
    choices: [
      { t: 'Kuyucu usulü: hepsini kılıçtan geçirin', hint: 'Sert ve kanlı', run: (s) => { s.flags.celali = false; PH.Eco.ownProvs(s).filter((p) => D.prov[p.id].reg === 'Anadolu').forEach((p) => (p.unrest = Math.max(0, p.unrest - 20))); fx({ treasury: -6e6, popularity: -4, stability: 6, prestige: 3, sip: -3000 }); s.reign.cruelty += 2; return 'Sadrazamın orduları Anadolu\'yu karış karış taradı. Kuyular cesetlerle doldu. Eşkıya bitti, ama korku da kaldı.'; } },
      { t: 'Reislere sancakbeyliği verip düzen ordusuna katın', run: (s) => { s.flags.celali = false; fx({ legitimacy: -4, sip: 4000, corruption: 3 }); return 'Celâlî reisleri devletin hizmetine girdi. Sekbanlar artık resmi asker.'; } },
      { t: 'Şimdilik başka önceliklerimiz var', run: (s) => { s.flags.celali = true; fx({ stability: -3 }); return 'Celâlîler Anadolu\'da serbestçe dolaşıyor. (Anadolu eyaletlerinde huzursuzluk artacak.)'; } },
    ],
  });

  E.reg({
    id: 'celali_devam', cat: 'halk', icon: 'flag', title: 'Celâlîler Güçleniyor',
    w: (s) => (s.flags.celali ? 5 : 0), cd: 8,
    text: () => 'Celâlî sürüleri bu kez Bursa önlerine kadar geldi! Hanlar yağmalandı.',
    choices: [
      { t: 'Ordu gönderin', hint: '5 Mn akçe', req: E.req.money(5e6), run: (s) => { fx({ treasury: -5e6 }); if (U.chance(0.6)) { s.flags.celali = false; fx({ stability: 4, prestige: 2 }); return 'Celâlî ordusu dağıtıldı.'; } fx({ prestige: -3 }); return 'Celâlîler kaçtı, ama yeniden toplanacaklar.'; } },
      { t: 'Bursa\'ya haraç ödeyin, şehir yağmalanmasın', run: () => { fx({ treasury: -3e6, legitimacy: -4 }); return 'Eşkıyaya para verildi. Devletin itibarı yerlerde.'; } },
    ],
  });

  E.reg({
    id: 'kizilbas', cat: 'din', icon: 'flag', title: 'Kızılbaş Propagandası',
    era: [1, 2], w: (s) => (s.nations.saf && !s.flags.kizilbas ? 4 : 0), cd: 30,
    text: () => 'Safevî halifeleri Anadolu\'da dolaşarak Türkmen aşiretlerini Şah\'a bağlılığa çağırıyor. Tokat ve Sivas civarında kızıl börklü atlılar toplanmaya başladı.',
    choices: [
      { t: 'Sıkı takibat: halifeler yakalansın', run: (s) => { fx({ stability: 3, popularity: -3, ulema: 3 }); PH.Dip.relChange(s.nations.saf, -10); return 'Şah\'ın halifeleri yakalanıp cezalandırıldı.'; } },
      { t: 'Aşiret beylerine hil\'at gönderip gönüllerini alın', hint: '3 Mn akçe', req: E.req.money(3e6), run: () => { fx({ treasury: -3e6, stability: 2, popularity: 2 }); return 'Aşiret beyleri padişaha bağlılıklarını yineledi.'; } },
      { t: 'Görmezden gelin', run: (s) => { s.flags.kizilbas = true; fx({ stability: -2 }); return 'Propaganda yayılıyor. (Anadolu ve Irak\'ta huzursuzluk artacak.)'; } },
    ],
  });

  E.reg({
    id: 'kahve', cat: 'halk', icon: 'feast', title: 'Kahvehaneler',
    era: [1, 2], w: (s) => (s.laws.kahve ? 0 : 3), cd: 48, once: true,
    text: () => 'Yemen\'den gelen kahve, İstanbul\'u sardı. Tahtakale\'de açılan kahvehanelerde insanlar saatlerce oturup sohbet ediyor, şiir okuyor, tavla oynuyor... ve devlet büyüklerini eleştiriyor. Bazı vaizler kahveyi haram ilan etti.',
    choices: [
      { t: 'Kahvehaneleri kapatın', run: () => { PH.Eco.toggleLaw('kahve'); return 'Kahvehane yasağı ilan edildi.'; } },
      { t: 'Kahveye vergi koyun', run: () => { fx({ treasury: 3e6, popularity: -1 }); return 'Kahve ticareti hazineye gelir getiriyor.'; } },
      { t: 'Serbest kalsın; bir fincan da bana', run: () => { fx({ popularity: 3, happiness: 4, ulema: -2 }); return 'Saraya da kahve ocağı kuruldu. Kahvecibaşı yeni bir makam oldu!'; } },
    ],
  });

  E.reg({
    id: 'tutun', cat: 'halk', icon: 'fire', title: 'Tütün Merakı',
    era: [2, 3], w: (s) => (s.laws.tutun ? 0 : 3), cd: 48, once: true,
    text: () => 'İngiliz tüccarların getirdiği tütün, şehrin her köşesinde içiliyor. Kahvehaneler duman altı. Geçenlerde bir tütün tiryakisinin ihmali yüzünden çıkan yangın bir mahalleyi yaktı.',
    choices: [
      { t: 'Tütünü idam cezasıyla yasaklayın', run: (s) => { PH.Eco.toggleLaw('tutun'); fx({ popularity: -3 }); s.reign.cruelty++; return 'Ağır ceza içeren yasak ilan edildi. Tebdil-i kıyafetle gezip yasağı bizzat denetleyebilirsiniz.'; } },
      { t: 'Tütüne gümrük koyun', run: () => { fx({ treasury: 4e6 }); return 'Tütün gümrüğü hazineye para akıtıyor.'; } },
      { t: 'Hoş görün', run: () => { fx({ popularity: 2, ulema: -2 }); return 'Duman, şehrin semalarında süzülmeye devam ediyor.'; } },
    ],
  });

  E.reg({
    id: 'duzmece', cat: 'hanedan', icon: 'mask', title: 'Düzmece Şehzade',
    w: 1.5, cd: 120,
    text: () => 'Rumeli\'de bir adam ortaya çıktı: kendisinin yıllar önce öldüğü sanılan bir şehzade olduğunu iddia ediyor. Etrafına binlerce kişi toplandı; Venedik onu gizlice destekliyor olabilir.',
    choices: [
      { t: 'Ordu gönderin, sahtekârı yakalayın', run: (s) => { if (U.chance(0.7)) { fx({ legitimacy: 3, prestige: 2, treasury: -2e6 }); return 'Düzmece Şehzade yakalanıp idam edildi.'; } fx({ legitimacy: -5, stability: -4 }); return 'Sahtekâr Venedik gemisiyle kaçtı. Taraftarları onu beklemeye devam ediyor.'; } },
      { t: 'Ulemaya sahtekârlığı ilan ettirin', run: () => { fx({ legitimacy: 2, ulema: 1 }); return 'Camilerde okunan fetva, halkın gözünü açtı.'; } },
    ],
  });

  /* ===================== DİN ===================== */
  E.reg({
    id: 'dervis', cat: 'din', icon: 'pray', title: 'Bir Derviş',
    w: 3, cd: 20,
    text: () => 'Cuma namazı dönüşü yırtık hırkalı bir derviş yolunuzu kesti. Muhafızlar onu uzaklaştırmak istedi, ama derviş gözlerinizin içine bakarak konuştu: "Padişahım! Dünya malı sana yar olmaz. Adaletle hükmet ki, ahirette yüzün ak olsun."',
    choices: [
      { t: 'Dervişin elini öpün ve duasını isteyin', run: () => { fx({ piety: 5, popularity: 4, ulema: 1, stress: -3 }); return 'Derviş size uzun uzun dua etti. Halk bu manzarayı unutmayacak.'; } },
      { t: 'Ona bir tekke yaptırın', hint: '1,5 Mn akçe', req: E.req.money(1.5e6), run: () => { fx({ treasury: -1.5e6, piety: 4, popularity: 3 }); return 'Dervişin adına bir tekke inşa edildi.'; } },
      { t: 'Haddini bildirin', run: () => { fx({ prestige: 1, piety: -3, popularity: -3 }); return 'Derviş gülümseyerek uzaklaştı: "Gün gelir, sen de bilirsin."'; } },
    ],
  });

  E.reg({
    id: 'kadizadeli', cat: 'din', icon: 'book', title: 'Kadızâdeliler ve Sivâsîler',
    era: [2], w: 3, cd: 36,
    text: () => 'Kadızâde Mehmed Efendi\'nin takipçileri, tekkelerin bid\'at olduğunu, kahve ve tütünün haram olduğunu, semâ ve devranın yasaklanması gerektiğini vaaz ediyor. Halvetî şeyhi Sivâsî Efendi ise bunlara sert cevaplar veriyor. Camilerde kavgalar çıkıyor.',
    choices: [
      { t: 'Kadızâdelileri destekleyin, tekkeler kapatılsın', run: () => { fx({ ulema: 6, popularity: -4, piety: 3, stability: -1 }); return 'Bazı tekkeler yıkıldı. Kadızâdeliler zafer kazandı.'; } },
      { t: 'Tasavvuf ehlini koruyun', run: () => { fx({ ulema: -4, popularity: 3, piety: 1 }); return 'Tekkeler koruma altına alındı.'; } },
      { t: 'Her iki tarafın vaazlarını yasaklayın', run: () => { fx({ stability: 3, ulema: -2, legitimacy: 1 }); return 'Kürsüler bir süreliğine sustu.'; } },
    ],
  });

  E.reg({
    id: 'surre', cat: 'din', icon: 'mosque', title: 'Surre Alayı',
    w: (s) => (s.provs.hicaz && s.provs.hicaz.owner === 'osm' && s.month === 4 ? 12 : 0), cd: 11,
    text: () => 'Mekke ve Medine ahalisine gönderilecek surre (yıllık bağış) hazırlandı. Develer süslendi, alay Üsküdar\'dan yola çıkmak üzere.',
    choices: [
      { t: 'Cömert bir surre gönderin', hint: '5 Mn akçe', req: E.req.money(5e6), run: () => { fx({ treasury: -5e6, piety: 5, ulema: 4, prestige: 3, legitimacy: 3 }); return 'Hâdimü\'l-Haremeyn unvanınıza yakışır bir surre yola çıktı.'; } },
      { t: 'Mutad miktarda gönderin', hint: '2 Mn akçe', req: E.req.money(2e6), run: () => { fx({ treasury: -2e6, piety: 2, ulema: 1 }); return 'Surre alayı dualarla uğurlandı.'; } },
      { t: 'Bu yıl gönderilemez', run: () => { fx({ ulema: -6, legitimacy: -5, prestige: -3, piety: -3 }); return 'Haremeyn ahalisi bu yıl elleri boş kaldı. İslam dünyasında hayretle konuşuluyor.'; } },
    ],
  });

  E.reg({
    id: 'haciyolu', cat: 'din', icon: 'tent', title: 'Hac Kervanı Saldırıya Uğradı',
    w: (s) => (s.provs.hicaz && s.provs.hicaz.owner === 'osm' ? 2.5 : 0), cd: 36,
    text: () => 'Şam\'dan yola çıkan hac kervanı, çölde bedevi aşiretlerin saldırısına uğradı. Yüzlerce hacı öldürüldü, mallar yağmalandı.',
    choices: [
      { t: 'Şam valisine cezalandırma seferi emredin', run: () => { fx({ treasury: -3e6, prestige: 3, piety: 2 }); return 'Bedevi aşiretleri cezalandırıldı; hac yolları güvenceye alındı.'; } },
      { t: 'Aşiretlere ödenek bağlayın', run: () => { fx({ treasury: -2e6, stability: 1 }); return 'Aşiretler artık kervanları koruyacak.'; } },
      { t: 'Bir şey yapılamaz', run: () => { fx({ prestige: -5, ulema: -4, legitimacy: -3 }); return 'Halifenin hacıları koruyamaması büyük tepki çekti.'; } },
    ],
  });

  E.reg({
    id: 'bayram', cat: 'din', icon: 'moon', title: 'Bayram Alayı',
    w: 3, cd: 8,
    text: () => 'Bayram sabahı! Saray halkı, vezirler ve ulema bayramlaşma için Bâbüssaade önünde toplandı. Halk, padişahın bayram namazına çıkışını görmek için yollara döküldü.',
    choices: [
      { t: 'Görkemli bir alayla camiye gidin, halka akçe saçın', hint: '1,5 Mn akçe', req: E.req.money(1.5e6), run: () => { fx({ treasury: -1.5e6, popularity: 5, legitimacy: 2, happiness: 4 }); return 'Altın ve gümüş paralar halkın üzerine yağmur gibi yağdı.'; } },
      { t: 'Vezirlere ve ağalara bayram bahşişi verin', hint: '2 Mn akçe', req: E.req.money(2e6), run: () => { fx({ treasury: -2e6, janissary: 4 }); C.list((c) => c.office).forEach((c) => C.opinion(c, 3, true)); return 'Devlet erkânı bayram bahşişlerinden memnun.'; } },
      { t: 'Sade bir bayramlaşma', run: () => { fx({ piety: 2, happiness: 2 }); return 'Bayram huzur içinde geçti.'; } },
    ],
  });

  /* ===================== KEHANET & RÜYA ===================== */
  E.reg({
    id: 'kuyruklu', cat: 'kehanet', icon: 'comet', title: 'Kuyruklu Yıldız',
    w: 1.5, cd: 72,
    text: () => 'Gökte batıdan doğuya uzanan, kuyruklu parlak bir yıldız belirdi. Halk korku içinde; kimisi bunu büyük bir felaketin, kimisi ise büyük bir fethin habercisi sayıyor. Müneccimbaşı yorumunu bildirmek için huzura çıktı.',
    choices: [
      { t: '"Bu yıldız zaferimizin müjdecisidir!" diye ilan edin', run: () => { fx({ morale: 8, janissary: 3, popularity: 2 }); return 'Ordu bu haberle coştu.'; } },
      { t: 'Dua ve sadakalarla şerrinden korunun', run: () => { fx({ piety: 3, popularity: 3, treasury: -1e6 }); return 'Camilerde hatimler indirildi, sadakalar dağıtıldı.'; } },
      { t: 'Rasathaneye inceletin', hint: 'İlim', run: () => { fx({ ilim: 1, ulema: -1 }); return 'Gözlemler kaydedildi. Bu bir kehanet değil, gökyüzünün bir hadisesi.'; } },
    ],
  });

  E.reg({
    id: 'ruya', cat: 'kehanet', icon: 'moon', title: 'Bir Rüya',
    w: 3, cd: 14,
    setup: () => ({ kind: U.pick(['ay', 'agac', 'kilic', 'kuyu']) }),
    text: (s, ctx) => ({
      ay: 'Rüyanızda göğsünüzden bir ay doğdu ve büyüyerek dünyayı aydınlattı. Uyandığınızda içinizde garip bir huzur vardı.',
      agac: 'Rüyanızda göbeğinizden bir ağaç çıktı; dalları üç kıtaya uzandı ve altında sayısız insan gölgelendi.',
      kilic: 'Rüyanızda kılıcınız elinizden kaydı ve bir kuyuya düştü. Kuyunun dibinden babanızın sesi geliyordu.',
      kuyu: 'Rüyanızda karanlık bir kuyudan su çekiyordunuz. Kova her seferinde altın doluyordu, ama ağırlaştıkça elleriniz kanıyordu.',
    }[ctx.kind]),
    choices: [
      { t: 'Bir şeyhe tabir ettirin', run: (s, ctx) => { const good = ctx.kind === 'ay' || ctx.kind === 'agac'; fx(good ? { happiness: 6, legitimacy: 2, piety: 2 } : { stress: 4, piety: 2 }); return good ? 'Şeyh: "Devletiniz ebed-müddet olacak, hünkârım!"' : 'Şeyh başını önüne eğdi: "Kılıcını sıkı tut, hünkârım. Etrafındakilere dikkat et."'; } },
      { t: 'Rüyayı Divan\'da anlatın', run: (s, ctx) => { const good = ctx.kind === 'ay' || ctx.kind === 'agac'; fx(good ? { legitimacy: 4, prestige: 2 } : { stability: -2 }); return good ? 'Rüyanız saraydan çarşıya yayıldı; halk bunu bir müjde saydı.' : 'Vezirler birbirine endişeyle baktı.'; } },
      { t: 'Rüyaları önemsemeyin', run: () => { fx({ stress: -2 }); return 'Sabah kahvenizi içip devlet işlerine döndünüz.'; } },
    ],
  });

  /* ===================== ŞAHSİ / SAĞLIK ===================== */
  E.reg({
    id: 'hastalik', cat: 'kisisel', icon: 'heart', title: 'Padişah Hastalandı',
    w: (s) => { const sul = C.sultan(); return 1.5 + (100 - sul.hp) / 25 + (C.has(sul, 'narin') ? 2 : 0) + C.age(sul) / 30; }, cd: 8,
    setup: () => ({ kind: U.pick(['humma', 'mide', 'nikris', 'goz']) }),
    text: (s, ctx) => ({
      humma: 'Gece yarısı ateşler içinde uyandınız. Titreme nöbetleri birbirini izliyor. Hekimbaşı başınızda.',
      mide: 'Günlerdir midenizde bir sancı var. Yemek boğazınızdan geçmiyor.',
      nikris: 'Ayak başparmağınız şişti, kızardı; adım atmak işkence. Hekimler bunun "nikris" (gut) olduğunu söylüyor.',
      goz: 'Gözleriniz bulanıklaştı, okumakta zorlanıyorsunuz.',
    }[ctx.kind]),
    choices: [
      { t: 'Hekimbaşının tedavisine uyun', hint: (s) => (off('hekimbasi') ? `Hekimbaşı ilim: ${off('hekimbasi').sk.ilim}` : 'Hekimbaşı yok'), run: (s, ctx) => { const h = off('hekimbasi'); const ok = h && U.chance(0.4 + h.sk.ilim * 0.03 + (PH.Eco.hasBuilding('darussifa') ? 0.1 : 0)); fx({ health: ok ? -U.ri(2, 6) : -U.ri(8, 18), stress: 3 }); if (ctx.kind === 'nikris' && !ok) C.addTrait(C.sultan(), 'nikris'); return ok ? 'Macunlar ve perhiz işe yaradı; kısa sürede iyileştiniz.' : 'Tedavi uzun sürdü; bedeniniz yıprandı.'; } },
      { t: 'Kan aldırın, sülük yapıştırılsın', run: (s, ctx) => { fx({ health: U.chance(0.5) ? -3 : -15 }); return 'Cerrahlar işlerini yaptı...'; } },
      { t: 'Frenk hekimi çağırtın', hint: '1 Mn akçe · Ulema hoşlanmaz', req: E.req.money(1e6), run: () => { fx({ treasury: -1e6, ulema: -2, health: U.chance(0.6) ? -2 : -12 }); return 'Venedikli hekim tuhaf iksirler verdi.'; } },
      { t: 'Dua edin, Allah şifa verir', run: () => { fx({ piety: 3, health: U.chance(0.4) ? -4 : -14 }); return 'Haftalarca yatağa bağlı kaldınız.'; } },
    ],
  });

  E.reg({
    id: 'buhran', cat: 'kisisel', icon: 'stress', title: 'Ruhî Buhran',
    w: (s) => (C.sultan().stress > 70 ? 6 : 0), cd: 6,
    text: () => 'Devletin ağır yükü omuzlarınızı eziyor. Uykusuz gecelerde Has Oda\'nın penceresinden Boğaz\'ı seyrediyorsunuz. Etrafınızdakilerin yüzleri gözünüze düşman gibi görünüyor.',
    choices: [
      { t: 'Bir süre devlet işlerinden el çekin, bahçede dinlenin', run: (s) => { s.vakit = Math.max(0, s.vakit - 2); fx({ stress: -20, happiness: 5, stability: -2 }); return 'Lale bahçesinde geçen günler size iyi geldi.'; } },
      { t: 'Öfkenizi birinden çıkarın', run: () => { const c = U.pick(C.list((x) => x.office)); if (c) { C.opinion(c, -25); } fx({ stress: -12, legitimacy: -1 }); return c ? `${N(c)}, hiçbir sebep yokken huzurunuzda azarlandı.` : 'Hizmetkârlar korkudan saklandı.'; } },
      { t: 'Kendinizi ibadete verin', run: () => { fx({ stress: -14, piety: 5 }); return 'Gece namazları ve zikirler ruhunuza huzur verdi.'; } },
    ],
  });

  E.reg({
    id: 'suikast', cat: 'entrika', icon: 'dagger', title: 'Suikast Girişimi!',
    w: (s) => 1 + (100 - s.emp.stability) / 40, cd: 30,
    text: () => 'Cuma selamlığı dönüşü kalabalığın arasından bir adam fırladı ve elinde hançerle atınıza doğru koştu!',
    choices: [
      { t: 'Kılıcınızı çekip kendinizi savunun', hint: (s) => `Askerlik: ${E.pctTxt(E.checkP('askeri', 8))}`, run: () => { if (E.check('askeri', 8)) { fx({ prestige: 4, popularity: 3, legitimacy: 2 }); return 'Tek bir kılıç darbesiyle saldırganı yere serdiniz! Halk, padişahın cesaretini dilden dile anlatıyor.'; } fx({ health: -U.ri(15, 30), stress: 10 }); return 'Hançer kolunuzu yaraladı. Muhafızlar saldırganı parçaladı.'; } },
      { t: 'Muhafızlara güvenin', hint: (s) => `Bostancıbaşı: ${St.offSkill('bostancibasi')}`, run: () => { const ok = U.chance(0.55 + St.offSkill('bostancibasi') * 0.025); if (ok) { fx({ stress: 4 }); return 'Bostancılar saldırganı size ulaşamadan yakaladı. Sorguda kimin gönderdiğini söyledi mi, bilinmiyor.'; } fx({ health: -U.ri(20, 40), stress: 12 }); if (C.sultan().hp <= 0) { C.kill(C.sultan(), 'suikast sonucu'); return 'Hançer kalbinize saplandı...'; } return 'Muhafızlar geç kaldı; ağır yaralandınız!'; } },
    ],
  });

  /* ===================== SANAT ===================== */
  E.reg({
    id: 'sair_kaside', cat: 'sanat', icon: 'feather', title: 'Bir Kaside',
    w: 3, cd: 16,
    setup: () => ({ poet: U.pick(D.names.poets) }),
    text: (s, ctx) => `Devrin ünlü şairi ${ctx.poet}, adınıza yazdığı bir kasideyi sunmak için huzura çıktı. Kasidede sizi İskender\'e, Süleyman\'a ve Cem\'e benzetiyor; ama son beyitlerde ince bir sitem de var: "Şâirlere himmet edilmez oldu bu devrânda..."`,
    choices: [
      { t: 'Bir kese altın ve kürk bağışlayın', hint: '1 Mn akçe', req: E.req.money(1e6), run: () => { fx({ treasury: -1e6, prestige: 3, happiness: 3 }); return 'Şair, ağzınıza bir kese altın daha konmasına değecek bir gazelle teşekkür etti.'; } },
      { t: 'Onu saray şairi (melikü\'ş-şuarâ) yapın', hint: 'Aylık maaş bağlanır', run: () => { fx({ prestige: 4, treasury: -2e6, ilim: 1 }); return 'Şair artık sarayın himayesinde. Divanınız onun nazireleriyle süslenecek.'; } },
      { t: 'Sitemkâr beyit için azarlayın', run: () => { fx({ prestige: -2, happiness: 1 }); return 'Şair, bu hakareti bir hiciv ile ödeyecek gibi görünüyor.'; } },
    ],
  });

  E.reg({
    id: 'mimar', cat: 'sanat', icon: 'hammer', title: 'Usta Bir Mimar',
    w: (s) => (s.flags.mimarUntil > s.turn ? 0 : 2.5), cd: 60,
    setup: () => ({ m: U.pick(D.names.architects) }),
    text: (s, ctx) => `Hassa mimarları arasından ${ctx.m} adında bir usta öne çıkıyor. Yaptığı köprülerin ve camilerin hesabı, eski ustaları bile hayrete düşürüyor. Mimarbaşı olarak atanmayı arzuluyor.`,
    choices: [
      { t: 'Onu mimarbaşı tayin edin', hint: '10 yıl yapı maliyeti %20 düşer', run: (s, ctx) => { s.flags.mimarUntil = s.turn + 120; s.flags.mimar = ctx.m; fx({ prestige: 2 }); return `${ctx.m} artık Hassa Mimarları Ocağı'nın başında. Yapılarınız daha ucuz ve daha görkemli olacak.`; } },
      { t: 'Mevcut mimarbaşı yeterli', run: () => { return 'Usta, taşraya bir sancakbeyinin camisini yapmaya gitti.'; } },
    ],
  });

  E.reg({
    id: 'ressam', cat: 'sanat', icon: 'eye', title: 'Venedikli Ressam',
    era: [0, 1, 2], w: (s) => (s.nations.ven && !s.nations.ven.war ? 2 : 0), cd: 80, once: true,
    text: () => 'Venedik Doçu, ünlü bir ressamı İstanbul\'a gönderdi. Ressam, padişahın portresini yapmak ve sarayın duvarlarını süslemek istiyor. Ulema, tasvir yasağını hatırlatıyor.',
    choices: [
      { t: 'Portrenizi yaptırın', run: (s) => { fx({ prestige: 3, ulema: -5, ilim: 1 }); PH.Dip.relChange(s.nations.ven, 8); return 'Portreniz yağlı boyayla tuvale geçti. Avrupa sarayları bu tabloyu konuşacak.'; } },
      { t: 'Ressamı ödüllendirip geri gönderin', run: (s) => { fx({ treasury: -5e5, ulema: 1 }); PH.Dip.relChange(s.nations.ven, 3); return 'Ressam hediyelerle ülkesine döndü.'; } },
    ],
  });

  E.reg({
    id: 'saatci', cat: 'dunya', icon: 'clock', title: 'Mekanik Hediye',
    w: 2, cd: 60,
    setup: (s) => { const n = U.pick(PH.Dip.alive().filter((x) => !x.war && ['ven', 'hab', 'fra', 'pol'].includes(x.id))); return n ? { n: n.id } : null; },
    text: (s, ctx) => `${PH.Dip.name(ctx.n)} elçisi, içinden çalgılar çalan, kuşları öten gümüş bir mekanik saat hediye etti. Saray halkı hayret içinde. Elçi, karşılığında ticari bir ayrıcalık rica ediyor.`,
    choices: [
      { t: 'Hediyeyi kabul edin, ayrıcalık tanıyın', run: (s, ctx) => { const n = s.nations[ctx.n]; n.trade = true; PH.Dip.relChange(n, 10); fx({ happiness: 4 }); return 'Ticaret anlaşması imzalandı. Saatin tiktakları Has Oda\'yı dolduruyor.'; } },
      { t: 'Hediyeyi kabul edin ama ayrıcalık yok', run: (s, ctx) => { PH.Dip.relChange(s.nations[ctx.n], -3); fx({ happiness: 3, prestige: 1 }); return 'Elçi hayal kırıklığını gizlemeye çalıştı.'; } },
      { t: 'Oyuncaklarla işimiz yok', run: (s, ctx) => { PH.Dip.relChange(s.nations[ctx.n], -6); fx({ prestige: 1 }); return 'Elçi saatini toplayıp gitti.'; } },
    ],
  });
})();
