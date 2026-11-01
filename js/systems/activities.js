/* Padişah Hayatı — Padişahın şahsi faaliyetleri ve karşılaşmalar */
PH.Act = (function () {
  const U = PH.U, D = PH.D, C = PH.C, St = PH.St, E = PH.E;
  const fx = PH.fx;
  const N = (c) => C.name(c);
  const A = {};

  const sul = () => C.sultan();
  const skillUp = (k, p) => { if (U.chance(p)) { fx({ [k]: 1 }); return true; } return false; };

  /* ---------- Faaliyet tanımları ---------- */
  A.list = [
    {
      id: 'av', n: 'Ava Çık', icon: 'bow', cost: 1, grp: 'Keyif',
      d: 'Ormanlarda sürek avı ya da doğan avı. Keyif verir, askerî yeteneği geliştirir; kazalar olabilir.',
      opts: () => [
        { id: 'belgrad', n: 'Belgrad Ormanı', d: 'Geyik ve yaban domuzu sürek avı' },
        { id: 'edirne', n: 'Edirne Av Sahası', d: 'Padişahların gözde avlağı; uzun yolculuk', extra: 1 },
        { id: 'dogan', n: 'Kâğıthane\'de Doğan Avı', d: 'Şahin ve doğanlarla zarif bir av' },
        { id: 'uludag', n: 'Uludağ\'da Ayı Avı', d: 'Tehlikeli ama şanlı' },
      ],
      run: (s, o) => {
        const sl = sul();
        s.stats.hunts++; s.reign.hunts++;
        const avci = C.has(sl, 'avci') ? 1.4 : 1;
        const danger = { belgrad: 0.06, edirne: 0.05, dogan: 0.02, uludag: 0.15 }[o];
        if (o === 'edirne') s.vakit = Math.max(0, s.vakit - 1);
        const prey = { belgrad: U.pick(['heybetli bir geyik', 'iri bir yaban domuzu', 'bir çift karaca']), edirne: U.pick(['on dört geyik', 'bir kurt sürüsü', 'yirmi tavşan']), dogan: U.pick(['bir turna', 'üç keklik', 'bir balıkçıl']), uludag: 'koca bir boz ayı' }[o];
        fx({ happiness: Math.round(U.ri(8, 14) * avci), stress: -U.ri(6, 12), health: 1 });
        skillUp('askeri', 0.25);
        if (U.chance(danger * (C.has(sl, 'temkinli') ? 0.5 : 1))) {
          fx({ health: -U.ri(8, 20) });
          return `Av sırasında atınız ürktü ve sizi yere fırlattı! Yaralandınız; hekimler birkaç hafta istirahat öneriyor.`;
        }
        if (o === 'uludag' && U.chance(0.5)) { fx({ prestige: 3, askeri: 1 }); }
        if (U.chance(0.28)) E.pushFront(U.pick(['enc_av_koylu', 'enc_av_ayi', 'enc_av_cesme']), {});
        return `Av başarılı geçti: ${prey} avlandı. Avcıbaşı, padişahın nişancılığını övüyor.`;
      },
    },
    {
      id: 'tebdil', n: 'Tebdil-i Kıyafet', icon: 'mask', cost: 1, grp: 'Halk',
      d: 'Kılık değiştirip halkın arasına karışın. Halkın gerçek nabzını öğrenin, haksızlıkları yerinde görün.',
      opts: () => [
        { id: 'carsi', n: 'Kapalıçarşı', d: 'Esnaf ve tüccarlar' },
        { id: 'iskele', n: 'Eminönü İskelesi', d: 'Hamallar, kayıkçılar, yabancılar' },
        { id: 'kahve', n: 'Tahtakale Kahvehaneleri', d: 'Dedikodu ve siyaset' },
        { id: 'cami', n: 'Fatih Camii Avlusu', d: 'Medrese talebeleri ve fakirler' },
        { id: 'galata', n: 'Galata Meyhaneleri', d: 'Tehlikeli ama ilginç' },
      ],
      run: (s, o) => {
        const pool = { carsi: ['enc_firinci', 'enc_dul', 'enc_hirsiz'], iskele: ['enc_hirsiz', 'enc_yabanci', 'enc_dul'], kahve: ['enc_kahvehane', 'enc_tutun', 'enc_kahvehane'], cami: ['enc_alim', 'enc_dul', 'enc_alim'], galata: ['enc_yeniceri_meyhane', 'enc_yabanci', 'enc_hirsiz'] }[o];
        const mood = s.emp.popularity;
        const word = mood > 70 ? 'Halk sizi seviyor; her köşede padişaha dua ediliyor.' : mood > 50 ? 'Halk genel olarak memnun, ama pahalılıktan yakınanlar var.' : mood > 30 ? 'Homurtular yüksek; vergiler ve vezirlerin zulmü konuşuluyor.' : 'Halk öfkeli! Sokaklarda açıkça padişaha beddua edenler var.';
        fx({ happiness: 3, stress: -2 });
        if (U.chance(0.06 * (o === 'galata' ? 3 : 1))) { fx({ health: -U.ri(5, 15) }); return `${word}\n\nAma bir kavgaya karıştınız ve tanınmadan hafif yaralandınız!`; }
        if (U.chance(0.75)) E.pushFront(U.pick(pool), {});
        return `Kaba bir aba ve sarıkla saraydan çıktınız. ${word}\n\n(Halk memnuniyeti: %${Math.round(mood)} · Rüşvet: %${Math.round(s.emp.corruption)})`;
      },
    },
    {
      id: 'arz', n: 'Arzuhalleri Dinle', icon: 'gavel', cost: 1, grp: 'Halk',
      d: 'Arz Odası\'nda tebaanın şikâyetlerini bizzat dinleyip hüküm verin. Adaletinizle nam salın.',
      run: (s) => { E.pushFront('arzuhal', A.petition()); E.push('arzuhal', A.petition()); return 'Arz Odası\'nın kapıları açıldı. Kapıcılar arzuhal sahiplerini sırayla huzura alıyor.'; },
    },
    {
      id: 'cuma', n: 'Cuma Selamlığı', icon: 'mosque', cost: 1, grp: 'Halk',
      d: 'Görkemli bir alayla Cuma namazına gidin. Halk sizi görür; meşruiyetiniz ve takvanız artar.',
      opts: () => [
        { id: 'aya', n: 'Ayasofya', d: 'Geleneksel, kalabalık' },
        { id: 'fatih', n: 'Fatih Camii', d: 'Ulemanın gözdesi' },
        { id: 'eyup', n: 'Eyüp Sultan', d: 'Kayıkla Haliç üzerinden; manevi' },
        { id: 'kendi', n: 'Kendi Camiiniz', d: 'Yaptırdığınız selâtin camii', req: () => (PH.Eco.hasBuilding('cami') ? true : 'Henüz bir selâtin camiiniz yok') },
      ],
      run: (s, o) => {
        const fxo = { popularity: 3, piety: 3, legitimacy: 2, stress: -2 };
        if (o === 'fatih') fxo.ulema = 3;
        if (o === 'eyup') { fxo.piety = 5; fxo.stress = -5; }
        if (o === 'kendi') { fxo.prestige = 2; fxo.popularity = 5; }
        fx(fxo);
        s.reign.piousActs = (s.reign.piousActs || 0) + 1;
        if (U.chance(0.4)) E.pushFront('arzuhal', A.petition());
        return 'Halk yol boyunca dizilmişti. "Mağrur olma padişahım, senden büyük Allah var!" nidaları arasında namaza gittiniz.';
      },
    },
    {
      id: 'kutuphane', n: 'Kütüphanede Mütalaa', icon: 'book', cost: 1, grp: 'Gelişim',
      d: 'Okuyarak kendinizi geliştirin. Seçtiğiniz konuya göre yetenekleriniz artabilir.',
      opts: () => [
        { id: 'idare', n: 'Siyasetnâmeler', d: 'Nizâmülmülk\'ten Kınalızâde\'ye (İdare)' },
        { id: 'askeri', n: 'Gazavatnâmeler ve harp sanatı', d: 'Seferlerin tarihi (Askerlik)' },
        { id: 'diplomasi', n: 'Sefaretnâmeler ve diller', d: 'Farsça, Arapça, İtalyanca (Diplomasi)' },
        { id: 'entrika', n: 'Saray tarihleri ve hafiye raporları', d: 'Geçmiş darbeler ve komplolar (Entrika)' },
        { id: 'ilim', n: 'Riyaziye, hey\'et ve felsefe', d: 'Gök ilmi ve hikmet (İlim)' },
        { id: 'din', n: 'Tefsir ve hadis', d: 'Kur\'an ve sünnet (Takva)' },
      ],
      run: (s, o) => {
        const sl = sul();
        let p = 0.35 + (C.has(sl, 'zeki') ? 0.15 : 0) + (PH.Eco.hasBuilding('kutuphane') ? 0.15 : 0) - (C.has(sl, 'kalinkafa') ? 0.15 : 0);
        fx({ stress: -3 });
        if (o === 'din') { fx({ piety: U.ri(3, 6), ulema: 1 }); return 'Tefsir sayfaları arasında saatler geçirdiniz. Kalbinize huzur doldu.'; }
        const up = skillUp(o, p);
        return up ? `Okuduklarınız ufkunuzu açtı. ${C.SKN[o]} yeteneğiniz gelişti!` : 'Saatlerce okudunuz; bazı bölümler zihninizde yer etti, ama henüz ustalaşmış sayılmazsınız.';
      },
    },
    {
      id: 'sanat', n: 'Sanatla Meşgul Ol', icon: 'feather', cost: 1, grp: 'Gelişim',
      d: 'Şiir yazın, hat çalışın, musiki meşk edin. Keyif ve şöhret kazandırır.',
      opts: () => [
        { id: 'siir', n: 'Şiir yaz', d: 'Mahlasınızla bir gazel' },
        { id: 'hat', n: 'Hat meşki', d: 'Sülüs ve nesih' },
        { id: 'musiki', n: 'Tanbur ve ney meşki', d: 'Saz heyetiyle fasıl' },
        { id: 'kuyum', n: 'Kuyumculuk ve oymacılık', d: 'Mücevher ve sedef işi' },
      ],
      run: (s, o) => {
        const sl = sul();
        const sair = C.has(sl, 'sair') ? 1.5 : 1;
        if (o === 'siir') { s.stats.poems++; s.reign.poems++; E.pushFront('enc_siir', A.poem()); fx({ happiness: Math.round(5 * sair), stress: -4 }); return 'Kalemi mürekkebe batırdınız...'; }
        if (o === 'hat') { fx({ happiness: 4, stress: -5, piety: 1 }); if (U.chance(0.12) && !C.has(sl, 'hattat')) { C.addTrait(sl, 'hattat'); return 'Yazdığınız levha, hocanızı bile hayrete düşürdü. Artık bir hattat olarak anılıyorsunuz!'; } skillUp('ilim', 0.15); return 'Kamış kalemle saatlerce harf çalıştınız. Elif\'iniz giderek düzgünleşiyor.'; }
        if (o === 'musiki') { fx({ happiness: Math.round(8 * sair), stress: -8 }); return 'Bestelediğiniz peşrev, saray musikişinasları tarafından ezberlendi.'; }
        fx({ happiness: 6, stress: -6 }); if (U.chance(0.3)) { fx({ prestige: 1 }); return 'Yaptığınız mücevherli hançer, bir elçiye hediye edilecek kadar güzel oldu.'; } return 'Sedef kakma bir çekmece üzerinde çalıştınız.';
      },
    },
    {
      id: 'idman', n: 'İdman', icon: 'sword', cost: 1, grp: 'Gelişim',
      d: 'Ok atma, cirit, kılıç ya da güreş. Askerî yetenek ve sağlık; sakatlanma riski.',
      opts: () => [
        { id: 'ok', n: 'Okmeydanı\'nda kemankeşlik', d: 'Nişan ve menzil atışları' },
        { id: 'cirit', n: 'Cirit oyunu', d: 'Enderun ağalarıyla atlı oyun' },
        { id: 'kilic', n: 'Kılıç talimi', d: 'Silahdar ağa ile' },
        { id: 'gures', n: 'Güreş', d: 'Saray pehlivanlarıyla' },
      ],
      run: (s, o) => {
        const sl = sul();
        const a = C.age(sl);
        const risk = (o === 'cirit' ? 0.1 : o === 'gures' ? 0.08 : 0.04) * (a > 45 ? 2 : 1);
        fx({ health: a < 50 ? 2 : 0, stress: -4, happiness: 3 });
        if (U.chance(risk)) { fx({ health: -U.ri(6, 15) }); return 'Talim sırasında sakatlandınız! Birkaç gün yataktan çıkamayacaksınız.'; }
        const up = skillUp('askeri', 0.3 + (C.has(sl, 'pehlivan') ? 0.1 : 0));
        if (o === 'ok' && U.chance(0.15)) { fx({ prestige: 2 }); return 'Attığınız ok, Okmeydanı\'nın rekor taşını geçti! Yerine bir menzil taşı dikilecek.'; }
        return up ? 'Talimler meyvesini verdi; kılıcınız ve atınız elinizin bir uzantısı gibi.' : 'Terlediniz ve yoruldunuz; bedeniniz zinde.';
      },
    },
    {
      id: 'hamam', n: 'Hamam ve İstirahat', icon: 'bath', cost: 1, grp: 'Keyif',
      d: 'Has hamamda dinlenin, natırlar ve tellaklar hizmet etsin. Stres azalır, sağlık iyileşir.',
      run: () => { fx({ stress: -U.ri(12, 18), health: U.ri(2, 4), happiness: 5 }); return 'Göbek taşında uzun uzun terlediniz; kese, köpük ve gül suyu... Devletin dertleri buharla birlikte uçup gitti.'; },
    },
    {
      id: 'bahce', n: 'Has Bahçede Gezinti', icon: 'tulip', cost: 1, grp: 'Keyif',
      d: 'Lale bahçelerinde, havuz başında yürüyün. Keyif ve huzur.',
      run: (s) => {
        fx({ happiness: U.ri(6, 10), stress: -6 });
        if (U.chance(0.3)) {
          const w = U.pick(PH.Harem.women());
          if (w) { w.favor = Math.min(100, w.favor + 6); C.opinion(w, 4, true); return `Havuz başında ${N(w)} ile karşılaştınız. Lalelerin arasında uzun bir sohbet ettiniz.`; }
        }
        if (PH.Eco.hasBuilding('kosk')) fx({ happiness: 4 });
        return U.pick(['Bostancılar yeni bir lale cinsi yetiştirmiş: "Nûr-ı Âdem". Hayranlıkla seyrettiniz.', 'Servilerin gölgesinde Boğaz\'ı seyrettiniz. Martılar, Kız Kulesi ve uzakta Üsküdar...', 'Bülbül sesleri arasında havuzun etrafında dolaştınız.']);
      },
    },
    {
      id: 'ziyafet', n: 'Ziyafet Ver', icon: 'feast', cost: 1, grp: 'Siyaset',
      d: 'Seçtiğiniz zümreyi ağırlayın. Görüşlerini kazanın; ama hazineye yük olur.',
      opts: () => [
        { id: 'vezir', n: 'Vezirler ve paşalar', d: '2 Mn akçe · Divan sadakati', req: E.req.money(2e6) },
        { id: 'ulema', n: 'Ulema ve meşayih', d: '1,5 Mn akçe · Ulema desteği', req: E.req.money(1.5e6) },
        { id: 'ocak', n: 'Ocak ağaları', d: '2,5 Mn akçe · Yeniçeri sadakati', req: E.req.money(2.5e6) },
        { id: 'elci', n: 'Yabancı elçiler', d: '2 Mn akçe · Tüm ilişkiler', req: E.req.money(2e6) },
        { id: 'halk', n: 'Atmeydanı\'nda halk ziyafeti', d: '4 Mn akçe · Halk sevgisi', req: E.req.money(4e6) },
      ],
      run: (s, o) => {
        fx({ happiness: 4 });
        if (o === 'vezir') { fx({ treasury: -2e6 }); C.list((c) => c.office && c.role === 'devlet').forEach((c) => C.opinion(c, U.ri(4, 9), true)); fx({ stability: 2 }); return 'Vezirlere kaftanlar giydirildi, altın tabaklarda yemekler sunuldu. Divan erkânı memnun.'; }
        if (o === 'ulema') { fx({ treasury: -1.5e6, ulema: 6, piety: 1 }); C.opinion(St.officer('seyhulislam'), 6); return 'Ulema ile ilmî bir sohbet ve ziyafet... Şeyhülislam dualarını eksik etmedi.'; }
        if (o === 'ocak') { fx({ treasury: -2.5e6, janissary: 8 }); C.opinion(St.officer('yeniceri'), 8); return 'Ocak ağaları sofrada "Padişahım çok yaşa!" diye bağırdı.'; }
        if (o === 'elci') { fx({ treasury: -2e6, prestige: 2 }); PH.Dip.alive().filter((n) => !n.war).forEach((n) => PH.Dip.relChange(n, U.ri(2, 5))); return 'Elçiler, Osmanlı sofrasının ihtişamını ülkelerine yazacak.'; }
        fx({ treasury: -4e6, popularity: 8, legitimacy: 2 }); return 'Atmeydanı\'nda kazanlar kaynadı, pilavlar ve zerdeler dağıtıldı. Halk padişaha dua ediyor.';
      },
    },
    {
      id: 'teftis', n: 'Eyalet Teftişi', icon: 'map', cost: 2, grp: 'Siyaset',
      d: 'Bir eyaleti bizzat ziyaret edin. Huzursuzluk azalır, vali hakkında gerçekleri öğrenirsiniz. (2 vakit)',
      opts: (s) => PH.Eco.ownProvs(s).filter((p) => !p.vassal && !p.rebel && D.prov[p.id].dist <= 2).sort((a, b) => b.unrest - a.unrest).slice(0, 8).map((p) => ({ id: p.id, n: D.prov[p.id].n, d: `Huzursuzluk %${Math.round(p.unrest)} · ${C.get(p.gov) ? N(C.get(p.gov)) : 'Valisiz'}` })),
      run: (s, o) => {
        const p = s.provs[o];
        const g = C.get(p.gov);
        p.unrest = Math.max(0, p.unrest - U.ri(15, 25));
        fx({ popularity: 2, stress: 3, idare: U.chance(0.2) ? 1 : 0 });
        if (g) {
          g.known = true;
          if (C.has(g, 'rusvetci') || C.has(g, 'zalim')) { E.pushFront('enc_vali', { c: g.id, p: o }); return `${U.dat(D.prov[o].n)} vardınız. Halk yollarda sizi karşıladı; ama valinin konağı bir saray kadar gösterişli...`; }
          C.opinion(g, 5);
          return `${U.acc(D.prov[o].n)} teftiş ettiniz. Vali ${N(g)} işini düzgün yapıyor görünüyor. Halk, padişahın gelişiyle umutlandı.`;
        }
        return `${U.acc(D.prov[o].n)} teftiş ettiniz. Eyaletin bir valiye ihtiyacı var!`;
      },
    },
    {
      id: 'kisla', n: 'Kışla ve Tersane Ziyareti', icon: 'jan', cost: 1, grp: 'Siyaset',
      d: 'Askerleri denetleyin, talimleri izleyin. Ordu morali ve talim artar.',
      run: () => { fx({ morale: 5, training: 3, janissary: 3 }); skillUp('askeri', 0.1); return 'Yeniçeri kışlalarında çorbaya kaşık salladınız; ocak ağaları gururlandı. Tersanede inşa edilen kadırgaları gezdiniz.'; },
    },
    {
      id: 'muneccim', n: 'Müneccimbaşına Danış', icon: 'comet', cost: 1, grp: 'Siyaset',
      d: 'Yıldızlara bakılsın; eşref saatler belirlensin, gelecekten haberler alınsın.',
      run: (s) => {
        const hints = [];
        const knownPlots = s.plots.filter((p) => !p.known);
        if (knownPlots.length) hints.push('"Hünkârım, yakınlarınızdan birinin kalbinde karanlık var. Sırtınızı kollayın."');
        const enemies = Object.values(s.nations).filter((n) => !n.war && n.rel < -40 && n.truce <= s.turn);
        if (enemies.length) hints.push(`"${PH.Dip.short(U.pick(enemies).id)} tarafından kara bulutlar geliyor."`);
        if (s.emp.food < 35) hints.push('"Ambarlar boşalırsa, açlık kapıyı çalar."');
        if (s.emp.janissary < 40) hints.push('"Kazanların sesi kulağıma geliyor... Ocak huzursuz."');
        if (sul().hp < 45) hints.push('"Bedeninize iyi bakın, hünkârım. Yıldızlar sağlığınız için uyarıyor."');
        if (!hints.length) hints.push('"Yıldızlar uğurlu. Bu yıl devletiniz için hayırlı geçecek."');
        s.flags.esrefUntil = s.turn + 3;
        fx({ stress: -2 });
        return `Müneccimbaşı usturlabını göğe çevirdi:\n\n${U.sample(hints, 2).join('\n\n')}\n\n(Önümüzdeki 3 ay içinde yapılacak savaşlarda eşref saat avantajı.)`;
      },
    },
    {
      id: 'dua', n: 'Türbe Ziyareti ve İbadet', icon: 'pray', cost: 1, grp: 'Keyif',
      d: 'Ecdadınızın türbelerini ziyaret edin, gece ibadetiyle huzur bulun.',
      run: () => { fx({ piety: U.ri(4, 7), stress: -8, legitimacy: 1 }); return 'Ecdadınızın türbesinde Fatiha okudunuz. Kandillerin titrek ışığında, saltanatın gelip geçiciliğini düşündünüz.'; },
    },
    {
      id: 'hekim', n: 'Hekimbaşına Muayene', icon: 'heart', cost: 1, grp: 'Keyif',
      d: 'Hekimbaşı sağlığınızı kontrol etsin, macunlar ve perhiz önersin.',
      run: () => {
        const h = St.officer('hekimbasi');
        if (!h) { fx({ health: 1 }); return 'Hekimbaşı makamı boş! Sıradan bir saray hekimi nabzınızı tuttu.'; }
        const g = Math.round(2 + h.sk.ilim * 0.4 + (PH.Eco.hasBuilding('darussifa') ? 2 : 0));
        fx({ health: g, stress: -2 });
        return `${N(h)} nabzınızı tuttu, dilinize baktı, idrarınızı inceledi. Mesir macunu ve perhiz önerdi.`;
      },
    },
  ];
  A.byId = (id) => A.list.find((a) => a.id === id);

  /* ---------- Arzuhal üretici ---------- */
  A.petition = () => {
    const who = U.pick(['Bir dul kadın', 'Yaşlı bir köylü', 'Bir Rum tüccar', 'Bir Yahudi sarraf', 'Bir esnaf kethüdası', 'Genç bir medrese talebesi', 'Bir tımarlı sipahi', 'Bir Ermeni kuyumcu', 'Bir yetim çocuk', 'Bir Arnavut çoban', 'Bir Türkmen yörük', 'Bir hamal']);
    const against = U.pick(['köyünün sipahisi', 'kasabanın kadısı', 'bir yeniçeri çorbacısı', 'mahallenin imamı', 'zengin bir komşusu', 'vergi mültezimi', 'bir paşanın kethüdası', 'kendi öz kardeşi', 'bir vakıf mütevellisi']);
    const issue = U.pick(['tarlasına haksız yere el koyduğunu', 'miras payını gasp ettiğini', 'kanunda yazandan fazla vergi aldığını', 'dükkânını kundakladığını', 'borcunu yıllardır ödemediğini', 'sahte bir hüccetle evini sattığını', 'değirmen suyunu kestiğini', 'oğlunu haksız yere zindana attırdığını', 'koyunlarını gasp ettiğini']);
    return { who, against, issue, honest: U.chance(0.65) };
  };

  /* ---------- Şiir üretici ---------- */
  const M1 = ['Gönül bir şehr-i vîrândır', 'Felek bir câm-ı zehr sundu', 'Gül-i ruhsârını gördüm', 'Bu dünyâ bir harâbâttır', 'Sabâ yeli getirdi bûy-ı yâri', 'Aşkın âteşi düştü cânıma', 'Şeb-i hicrânda yandı bu dil', 'Ne taht kalır ne de tâc', 'Kadeh sun sâkiyâ ey dilber', 'Lâle-hadler bezm kurmuş', 'Göz yaşım derya olup aktı', 'Bir nigâhın bin hayâta değer'];
  const M2 = ['ki her köşesi yâr ister', 'içip mest oldu cânım', 'kararmış bu cihân gözümde', 'gelen konar giden göçer', 'açıldı gonca-i dil', 'ne mümkündür söndürmek', 'sabâha dek ağladım', 'kalır bir hoş sadâ ancak', 'gül bahçesi oldu meclis', 'hasretinle geçti ömrüm', 'dil-i şûrîdeyi yaktı', 'cihân mülkü bir hiç oldu'];
  const MK = ['bu fânî mülkte bâkî kalan aşktır', 'yâr yolunda cân vermek ne hoştur', 'sabr ile koruk helvâ olur', 'devlet-i dünyâ bir nefes imiş', 'gönül yapmak Kâbe yapmaktan yeğdir', 'âşıkın tahtı dâr olur, tâcı dert'];
  A.poem = () => {
    const sl = sul();
    const q = sl.sk.ilim + (C.has(sl, 'sair') ? 6 : 0) + U.ri(-4, 6);
    const lines = [U.pick(M1) + ',', U.pick(M2) + '.', U.pick(M1) + ',', `${sl.mahlas || 'Muhibbî'}, ${U.pick(MK)}.`];
    return { lines, q };
  };

  /* ---------- Karşılaşma olayları ---------- */
  E.reg(
    {
      id: 'arzuhal', cat: 'halk', icon: 'gavel', title: 'Bir Arzuhal',
      text: (s, ctx) => `${ctx.who} huzurunuzda diz çöktü. Elindeki arzuhalde, ${ctx.against} ${ctx.issue} yazıyor. Gözyaşları içinde adalet istiyor.\n\nKarşı taraf ise iddiaları reddediyor ve davacının iftira attığını söylüyor.`,
      choices: [
        { t: 'Davacıyı haklı bulun', run: (s, ctx) => { if (ctx.honest) { fx({ popularity: 2, legitimacy: 1 }); s.reign.justice++; s.stats.justice++; return 'Hükmünüz yerindeydi. Sonradan anlaşıldı ki davacı haklıymış; halk adaletinizi övüyor.'; } fx({ popularity: -1, legitimacy: -1 }); return 'Sonradan davacının yalan söylediği anlaşıldı. Haksız yere ceza verilen taraf şikâyetçi.'; } },
        { t: 'Davalıyı haklı bulun', run: (s, ctx) => { if (!ctx.honest) { fx({ popularity: 1, legitimacy: 1 }); s.reign.justice++; s.stats.justice++; return 'Yerinde bir hüküm: iftiracı ortaya çıktı ve cezasını buldu.'; } fx({ popularity: -2 }); return 'Davacı gözyaşları içinde Arz Odası\'ndan çıkarıldı. Sonradan haklı olduğu anlaşıldı; bu haksızlık halk arasında konuşuluyor.'; } },
        { t: 'Bizzat derinlemesine soruşturun', hint: (s) => `İlim+Entrika sınaması: %${Math.round(U.clamp(0.45 + (C.sultan().sk.ilim + C.sultan().sk.entrika) / 60, 0.2, 0.95) * 100)}`, run: (s, ctx) => { fx({ stress: 2 }); if (U.chance(U.clamp(0.45 + (C.sultan().sk.ilim + C.sultan().sk.entrika) / 60, 0.2, 0.95))) { fx({ popularity: 3, legitimacy: 2 }); s.reign.justice += 2; s.stats.justice++; return `Şahitleri tek tek dinlediniz, belgeleri inceletip mühürleri karşılaştırdınız. Gerçek ortaya çıktı: ${ctx.honest ? 'davacı haklıydı' : 'davacı iftira atıyordu'}. Hükmünüz dillere destan oldu.`; } fx({ popularity: 1 }); return 'Soruşturma çetrefilli çıktı; davayı kadıya havale etmek zorunda kaldınız.'; } },
        { t: 'Kadıya havale edin', run: () => { fx({ corruption: 0.5 }); return 'Dava mahkemeye gönderildi. Sonucu belki yıllar sürecek.'; } },
      ],
    },
    {
      id: 'enc_siir', cat: 'sanat', icon: 'feather', title: 'Bir Gazel',
      text: (s, ctx) => `Kâğıda şu satırlar döküldü:\n\n${ctx.lines.map((l) => '  ' + l).join('\n')}\n\n${ctx.q >= 16 ? 'Bu, gerçekten parlak bir şiir!' : ctx.q >= 9 ? 'Fena değil; ama ustalara nazire yazacak kadar değil.' : 'Vezin biraz aksıyor, kafiyeler zorlama...'}`,
      choices: [
        { t: 'Meclis-i şuarâda okuyun', hint: 'İyi ise şöhret, kötü ise alay', run: (s, ctx) => { if (ctx.q >= 12) { fx({ prestige: 3, happiness: 5 }); return 'Şairler hayranlıkla dinledi; gazeliniz dilden dile dolaşıyor. Birkaçı nazire bile yazdı.'; } if (ctx.q >= 7) { fx({ happiness: 2 }); return 'Şairler nezaketle övdü. Kimse padişaha "kötü" demeye cesaret edemez.'; } fx({ prestige: -1, happiness: -2 }); return 'Şairler övdü, ama bir kahvehanede gazelinizle alay eden bir hiciv okunduğu kulağınıza geldi.'; } },
        { t: 'Divanınıza ekleyin', run: () => { fx({ happiness: 3, ilim: U.chance(0.2) ? 1 : 0 }); return 'Gazel, saray nakkaşlarının tezhip ettiği divanınıza eklendi.'; } },
        { t: 'Kâğıdı yırtın', run: () => { fx({ stress: -1 }); return 'Bazen en güzel şiir, yazılmayandır.'; } },
      ],
    },
    {
      id: 'enc_firinci', cat: 'halk', icon: 'wheat', title: 'Hileli Fırıncı',
      text: () => 'Kılık değiştirmiş halde bir fırından ekmek aldınız. Elinizde tarttığınızda ekmeğin narhta belirlenen ağırlıktan çok daha hafif olduğunu fark ettiniz. Fırıncı kasada keyifle para sayıyor.',
      choices: [
        { t: 'Kimliğinizi açıklayıp fırıncıyı cezalandırın', run: (s) => { fx({ popularity: 4, corruption: -1 }); s.reign.justice++; return 'Fırıncının kulağı dükkânının kapısına çivilendi. Ertesi sabah bütün fırınlarda ekmekler tam ağırlıktaydı.'; } },
        { t: 'Muhtesibi çağırtıp denetim emredin', run: (s) => { fx({ popularity: 2 }); s.reign.justice++; return 'Muhtesip, bütün çarşıyı tek tek denetledi.'; } },
        { t: 'Bir şey demeden çıkın', run: () => 'Ekmeği bir dilenciye verip yolunuza devam ettiniz.' },
      ],
    },
    {
      id: 'enc_dul', cat: 'halk', icon: 'people', title: 'Çaresiz Bir Kadın',
      text: () => 'Bir caminin kapısında, kucağında bebeğiyle dilenen genç bir kadın gördünüz. Kocası seferde şehit düşmüş; tımarı başkasına verilmiş, ona hiçbir şey kalmamış.',
      choices: [
        { t: 'Bir kese altın verin ve kocasının tımarından maaş bağlayın', run: () => { fx({ treasury: -2e5, popularity: 2, piety: 3 }); return 'Kadın kim olduğunuzu bilmeden size dua etti. Bu dua, size bir saltanattan daha değerli geldi.'; } },
        { t: 'Şehit ailelerine yardım fermanı çıkarın', hint: 'Kalıcı masraf', run: (s) => { fx({ popularity: 5, janissary: 3, treasury: -3e6 }); return 'Şehit aileleri için yeni bir vakıf kuruldu.'; } },
        { t: 'Yanından geçip gidin', run: () => { fx({ piety: -1 }); return 'Kadının bakışları gece rüyalarınıza girdi.'; } },
      ],
    },
    {
      id: 'enc_hirsiz', cat: 'halk', icon: 'mask', title: 'Yankesici',
      text: () => 'Kalabalığın içinde birinin elinin kesenize uzandığını hissettiniz! On iki-on üç yaşlarında, sıska bir çocuk.',
      choices: [
        { t: 'Kolundan yakalayıp subaşına teslim edin', run: () => { fx({ stability: 1 }); return 'Çocuk subaşına teslim edildi.'; } },
        { t: 'Ona para verip Enderun\'a almayı teklif edin', run: () => { fx({ popularity: 1, happiness: 3 }); return 'Çocuğun gözleri parladı. Kim bilir, belki bir gün büyük bir paşa olur.'; } },
        { t: 'Bırakın kaçsın', run: () => { fx({ treasury: -5e4 }); return 'Keseniz gitti; ama içiniz rahat.'; } },
      ],
    },
    {
      id: 'enc_kahvehane', cat: 'halk', icon: 'talk', title: 'Kahvehane Sohbeti',
      setup: () => null,
      text: (s, ctx) => {
        if (!ctx.c) { const c = U.pick(C.list((x) => x.office && x.role === 'devlet')); ctx.c = c ? c.id : null; ctx.good = U.chance(0.4); }
        const c = C.get(ctx.c);
        return c ? `Kahvehanede ihtiyarlar ${N(c)} hakkında konuşuyor: "${ctx.good ? 'Allah ondan razı olsun, adil bir adam.' : 'Rüşvetsiz iş görmez, yediği haram!'}" Sohbet padişaha geldiğinde ise ses kesildi; herkes etrafına bakındı.` : 'Kahvehanede herkes savaş ve fiyatları konuşuyor.';
      },
      choices: [
        { t: 'Bu bilgiyi aklınızda tutun', run: (s, ctx) => { const c = C.get(ctx.c); if (c) { c.known = true; } fx({ entrika: U.chance(0.15) ? 1 : 0 }); return 'Bilgiler zihninize kazındı.'; } },
        { t: 'Bir kahve ısmarlayıp sohbete katılın', run: () => { fx({ happiness: 4, popularity: 1 }); return 'Sizi tanımayan ihtiyarlar, sohbetinizden pek memnun kaldı.'; } },
      ],
    },
    {
      id: 'enc_tutun', cat: 'halk', icon: 'fire', title: 'Yasağı Çiğneyenler',
      valid: (s) => s.laws.tutun || s.laws.kahve || s.laws.icki,
      text: (s) => `Bir arka sokaktaki gizli bir mekânda birkaç kişinin ${s.laws.tutun ? 'tütün içtiğini' : s.laws.kahve ? 'kahve içtiğini' : 'şarap içtiğini'} gördünüz. Fermanınızı açıkça çiğniyorlar.`,
      choices: [
        { t: 'Yerinde idam (Murad usulü)', run: (s) => { fx({ stability: 2, popularity: -3, ulema: 2 }); s.reign.cruelty++; return 'Cellat çağırıldı. Yasağın ciddiyeti şehrin her köşesinde anlaşıldı.'; } },
        { t: 'Kimliğinizi açıklayıp uyarın', run: () => { fx({ popularity: 2, legitimacy: 1 }); return 'Adamlar korkudan titreyerek yere kapandı. Bir daha yapmayacaklarına yemin ettiler.'; } },
        { t: 'Görmezden gelin', run: () => { fx({ stability: -1 }); return 'Yasaklar ne kadar etkili, siz de sorgulamaya başladınız.'; } },
      ],
    },
    {
      id: 'enc_yeniceri_meyhane', cat: 'ordu', icon: 'jan', title: 'Sarhoş Yeniçeriler',
      text: () => 'Galata\'da bir meyhaneden çıkan sarhoş yeniçeriler, yoldan geçen bir Rum tüccarı dövüyor ve "Padişah da kim oluyor! Bizim sayemizde tahtta!" diye bağırıyorlar.',
      choices: [
        { t: 'Kılıcınızı çekin!', hint: (s) => `Askerlik: ${E.pctTxt(E.checkP('askeri', 9))}`, run: () => { if (E.check('askeri', 9)) { fx({ prestige: 3, janissary: -2, popularity: 3 }); return 'İki yeniçeri yere serildi, diğerleri kaçtı. Kimliğinizi öğrendiklerinde ocakta şaşkınlık yaşandı.'; } fx({ health: -U.ri(8, 18) }); return 'Sizi tanımadılar ve dövdüler! Bostancılar yetiştiğinde yaralanmıştınız.'; } },
        { t: 'Ertesi gün Yeniçeri Ağası\'na hesap sorun', run: () => { fx({ janissary: -3, stability: 2 }); C.opinion(St.officer('yeniceri'), -8); return 'Ağa, suçluları falakaya yatırdı; ama ocakta homurtular var.'; } },
        { t: 'Tüccara yardım edip uzaklaşın', run: () => { fx({ popularity: 1 }); return 'Tüccar size minnettar.'; } },
      ],
    },
    {
      id: 'enc_yabanci', cat: 'dunya', icon: 'globe', title: 'Bir Frenk Seyyah',
      setup: () => null,
      text: (s, ctx) => { if (!ctx.n) { const n = U.pick(PH.Dip.alive()); ctx.n = n ? n.id : 'ven'; } return `${U.abl(PH.Dip.short(ctx.n))} gelmiş bir seyyah, sizi sıradan bir efendi sanarak sohbete başladı. Ülkesinin ordusundan, kralının dertlerinden bahsediyor.`; },
      choices: [
        { t: 'Ağzını arayın', hint: 'İstihbarat', run: (s, ctx) => { const n = s.nations[ctx.n]; if (n) n.intel = s.turn + 6; fx({ diplomasi: U.chance(0.15) ? 1 : 0 }); return 'Öğrendikleriniz paha biçilmez: o devletin gerçek askerî gücü artık biliniyor.'; } },
        { t: 'İstanbul\'u ona övün', run: (s, ctx) => { const n = s.nations[ctx.n]; if (n) PH.Dip.relChange(n, 2); fx({ prestige: 1 }); return 'Seyyah, seyahatnamesine "Osmanlıların misafirperverliği" diye bir bölüm yazacak.'; } },
      ],
    },
    {
      id: 'enc_alim', cat: 'sanat', icon: 'book', title: 'Genç Bir Âlim',
      text: () => 'Medrese avlusunda bir talebenin hocasıyla tartıştığını duydunuz. Delilleri o kadar keskin, bilgisi o kadar derin ki etrafına kalabalık toplanmış.',
      choices: [
        { t: 'Onu saray hizmetine alın', run: () => { const c = C.statesman(U.chance(0.5) ? 'ulema' : 'kalem', { age: U.ri(24, 32), op: 50, traits: ['zeki', U.pick(['durust', 'hirsli', 'sair'])] }); c.sk.ilim = Math.max(c.sk.ilim, 14); c.sk.idare = Math.max(c.sk.idare, 9); return `${N(c)} saray hizmetine alındı. Divan ekranından ona bir makam verebilirsiniz.`; } },
        { t: 'Medresesine bağış yapın', run: () => { fx({ treasury: -1e6, ulema: 3 }); return 'Medreseye yeni kitaplar ve burslar bağışlandı.'; } },
      ],
    },
    {
      id: 'enc_vali', cat: 'divan', icon: 'bribe', title: 'Valinin Zulmü',
      valid: (s, ctx) => { const c = C.get(ctx.c); return c && c.alive && c.gov === ctx.p; },
      text: (s, ctx) => `Köylüler gizlice size ulaştı: Vali ${N(C.get(ctx.c))}, kanunsuz vergiler topluyor, karşı çıkanları zindana atıyor. Konağındaki hazine, eyaletin yıllık gelirinden fazla.`,
      choices: [
        { t: 'Valiyi yerinde idam ettirin', run: (s, ctx) => { const c = C.get(ctx.c); const w = Math.round(c.wealth * 0.8); PH.Court.execute(c, true); fx({ treasury: w, popularity: 5 }); s.provs[ctx.p].unrest = Math.max(0, s.provs[ctx.p].unrest - 20); s.reign.justice++; return `Valinin başı konağının kapısına asıldı; ${U.money(w, true)} hazineye aktarıldı. Halk bayram ediyor.`; } },
        { t: 'Azledip servetini müsadere edin', run: (s, ctx) => { const c = C.get(ctx.c); const w = PH.Court.confiscate(c); PH.Court.dismiss(c); fx({ popularity: 3 }); s.reign.justice++; return `Vali azledildi; ${U.money(w, true)} müsadere edildi.`; } },
        { t: 'Uyarın, bir şans daha verin', run: (s, ctx) => { const c = C.get(ctx.c); C.opinion(c, -5); c.traits = c.traits.filter((t) => t !== 'rusvetci'); fx({ popularity: -1 }); return 'Vali yere kapanıp af diledi.'; } },
      ],
    },
    {
      id: 'enc_av_koylu', cat: 'halk', icon: 'people', title: 'Avda Bir Köylü',
      text: () => 'Av sırasında yolunuza çıkan bir köylü, atınızın dizginlerine yapıştı: "Efendim, sipahimiz ekinlerimizi atlarına çiğnetti, üstüne de vergi istiyor!" Avcılar onu uzaklaştırmak istiyor.',
      choices: [
        { t: 'Sipahinin tımarını elinden alın', run: (s) => { fx({ popularity: 3, sip: -100 }); s.reign.justice++; return 'Sipahinin tımarı başkasına verildi. Köylü gözyaşları içinde teşekkür etti.'; } },
        { t: 'Köylüye bir kese verin', run: () => { fx({ treasury: -1e5, popularity: 1 }); return 'Köylü dualar ederek uzaklaştı.'; } },
        { t: 'Avı bozduğu için uzaklaştırın', run: () => { fx({ popularity: -1 }); return 'Köylü hıçkırıklar içinde uzaklaştı.'; } },
      ],
    },
    {
      id: 'enc_av_ayi', cat: 'kisisel', icon: 'bow', title: 'Ayı Saldırısı!',
      text: () => 'Çalıların arasından dev bir boz ayı fırladı! Atınız şaha kalktı; avcılar uzakta.',
      choices: [
        { t: 'Mızrağınızla karşı koyun', hint: (s) => `Askerlik: ${E.pctTxt(E.checkP('askeri', 10))}`, run: () => { if (E.check('askeri', 10)) { fx({ prestige: 4, happiness: 8, askeri: 1 }); return 'Mızrağınız ayının kalbine saplandı! Postu Has Oda\'ya serilecek.'; } fx({ health: -U.ri(15, 30) }); return 'Ayının pençesi omzunuzu yardı! Avcılar son anda yetişti.'; } },
        { t: 'Atı mahmuzlayıp kaçın', run: () => { fx({ stress: 4 }); return 'Canınızı zor kurtardınız.'; } },
      ],
    },
    {
      id: 'enc_av_cesme', cat: 'kisisel', icon: 'drop', title: 'Pınar Başında',
      text: () => 'Avdan dönüşte, susuz bir köyün kenarında mola verdiniz. Köylüler, köylerine su getirecek bir çeşme için yıllardır dua ettiklerini söylüyor.',
      choices: [
        { t: 'Çeşme yaptırın', hint: '300 bin akçe', run: () => { fx({ treasury: -3e5, popularity: 2, piety: 2 }); return 'Köye bir çeşme yaptırıldı; kitabesinde adınız yazacak.'; } },
        { t: 'Valiye havale edin', run: () => 'Vali mektubu okuyacak mı, bilinmez.' },
      ],
    },
  );

  return A;
})();
