/* Padişah Hayatı — Saray, Divan, entrika ve hanedan olayları */
(function () {
  const U = PH.U, D = PH.D, C = PH.C, St = PH.St, E = PH.E;
  const fx = PH.fx;
  const N = (c) => C.name(c);
  const off = (o) => St.officer(o);

  /* ===================== CÜLUS ===================== */
  E.reg({
    id: 'cülus', cat: 'hanedan', icon: 'crown',
    title: 'Cülus-ı Hümâyun',
    text: (s) => {
      const sul = C.sultan();
      const amt = Math.round((s.army.jan + s.army.nizam) * 1200);
      return `Topkapı Sarayı'nın Bâbüssaade önünde taht kuruldu. Vezirler, ulema ve ocak ağaları sırayla gelip ${U.dat(N(sul))} biat ediyor. Ancak gelenek bellidir: kapıkulu askerleri cülus bahşişini bekliyor.\n\nDefterdar, ocakların beklentisinin ${U.money(amt, true)} civarında olduğunu fısıldıyor. Hazinede ${U.money(s.emp.treasury, true)} var.`;
    },
    choices: [
      { t: 'Tam bahşiş dağıtın', hint: 'Yeniçeriler memnun olur', run: (s) => { const amt = Math.round((s.army.jan + s.army.nizam) * 1200); fx({ treasury: -amt, janissary: 15, stability: 4 }); return 'Altın keseler ocak ağalarına teslim edildi. Yeniçeriler "Padişahım çok yaşa!" nidalarıyla kazanlarını devirmeden kışlalarına çekildi.'; } },
      { t: 'Yarısını dağıtın, hazine zor durumda', hint: 'Orta yol', run: (s) => { const amt = Math.round((s.army.jan + s.army.nizam) * 600); fx({ treasury: -amt, janissary: 2 }); return 'Ağalar homurdandı ama keseleri aldılar. Ocakta "yeni padişah eli sıkı" sözleri dolaşıyor.'; } },
      { t: 'Bahşiş verilmeyecek; kul padişahına hizmet eder', hint: 'Riskli ama hazine korunur', run: (s) => { fx({ janissary: -20, prestige: 2, stability: -5 }); if (s.emp.janissary < 30) E.push('yeniceri_isyan', {}); return 'Sözleriniz kışlalarda bomba gibi patladı. Ocak ağaları tehditkâr bakışlarla huzurunuzdan ayrıldı.'; } },
    ],
  });

  E.reg({
    id: 'kardesler', cat: 'hanedan', icon: 'dagger',
    title: 'Kardeşlerin Akıbeti',
    valid: (s) => PH.Harem.dynMales().some((c) => c.fa === C.sultan().fa && c.id !== s.sultanId),
    text: (s) => {
      const sul = C.sultan();
      const bros = PH.Harem.dynMales().filter((c) => c.fa === sul.fa);
      const list = bros.map((b) => `• ${N(b)} (${C.age(b)} yaşında, ${b.sancak ? b.sancak + ' sancağında' : b.kafes ? 'kafeste' : 'sarayda'}, ${U.opWord(b.op).toLowerCase()})`).join('\n');
      return `Babanızdan kalan şehzadeler hâlâ hayatta:\n${list}\n\nSadrazam başını eğerek konuşuyor: "Hünkârım, ecdadınızın kanunu açıktır: nizam-ı âlem için... Ama karar sizindir."`;
    },
    choices: [
      { t: 'Nizam-ı âlem için... kanun uygulansın', hint: 'Taht güvenceye alınır, vicdan ağırlaşır', req: (s) => (s.laws.kardes || PH.Court.fetvaChance() > 0.5 ? true : 'Şeyhülislam fetva vermez (kanun yok)'), run: (s) => {
        const sul = C.sultan();
        const bros = PH.Harem.dynMales().filter((c) => c.fa === sul.fa);
        bros.forEach((b) => { C.kill(b, 'nizam-ı âlem için katledildi'); });
        s.reign.cruelty += bros.length; s.stats.executions += bros.length;
        fx({ stability: 8, legitimacy: 4, popularity: -6, piety: -6, happiness: -15, stress: 12 });
        PH.Turn.log(`${bros.length} şehzade nizam-ı âlem için boğduruldu. Tabutları ardı ardına saraydan çıktı.`, 'blood');
        return 'Cellatlar yay kirişleriyle görevlerini sessizce yaptı. Küçük tabutlar babanızın türbesine taşınırken İstanbul halkı gözyaşı döktü. Taht artık yalnız sizindir; ama geceleri uykunuz kaçacak.';
      } },
      { t: 'Kafes dairesine kapatılsınlar', hint: 'Hayatta kalırlar ama gözetim altında', run: (s) => {
        const sul = C.sultan();
        PH.Harem.dynMales().filter((c) => c.fa === sul.fa).forEach((b) => { b.kafes = true; b.sancak = null; C.opinion(b, -15); });
        fx({ stability: 2, piety: 2, popularity: 2 });
        return 'Şehzadeler, Harem\'in en iç avlusundaki demir parmaklıklı dairelere yerleştirildi. Hayattalar, ama dünyayla bağları koparıldı.';
      } },
      { t: 'Sancaklarında kalsınlar, kardeş kanı dökülmez', hint: 'Merhamet; ancak taht kavgası riski', run: (s) => {
        const sul = C.sultan();
        PH.Harem.dynMales().filter((c) => c.fa === sul.fa).forEach((b) => { C.opinion(b, 20); if (!b.kafes && C.age(b) >= 15) b.sancak = b.sancak || U.pick(D.names.sancaks); });
        fx({ popularity: 5, piety: 4, stability: -6, legitimacy: -3 });
        if (!C.has(sul, 'merhametli') && U.chance(0.5)) C.addTrait(sul, 'merhametli');
        return 'Merhametiniz dilden dile dolaştı. Ancak bazı vezirler, sancaklardaki şehzadelerin etraflarına adam toplamaya başlayacağından endişeli.';
      } },
    ],
  });

  E.reg({
    id: 'naib', cat: 'hanedan', icon: 'crown',
    title: 'Çocuk Padişah',
    text: (s) => `${N(C.sultan())} henüz ${C.age(C.sultan())} yaşında. Devletin dümenini, siz reşit olana dek kim tutacak?`,
    choices: [
      { t: 'Valide Sultan naibe olsun', hide: () => !PH.Harem.valide(), run: () => { const v = PH.Harem.valide(); C.opinion(v, 20); v.amb = Math.min(100, v.amb + 15); fx({ stability: 4, legitimacy: 2 }); return `${N(v)} perde arkasından devleti yönetmeye başladı. Harem artık devletin kalbi.`; } },
      { t: 'Sadrazam devleti idare etsin', req: E.req.office('sadrazam'), run: () => { const c = off('sadrazam'); C.opinion(c, 15); c.amb = Math.min(100, c.amb + 20); fx({ stability: 6 }); return `${N(c)} mühr-i hümâyunu sıkıca kavradı. Divan, sizin adınıza karar alıyor.`; } },
      { t: 'Ben padişahım, kararları ben veririm', run: () => { fx({ legitimacy: 3, stability: -4, stress: 6, idare: 1 }); return 'Genç yaşınıza rağmen divana bizzat başkanlık ediyorsunuz. Vezirler şaşkın, ama hürmetkâr.'; } },
    ],
  });

  /* ===================== KOMPLOLAR ===================== */
  E.reg({
    id: 'komplo_kesif', cat: 'entrika', icon: 'eye',
    title: 'Bir Komplo Ortaya Çıktı',
    valid: (s, ctx) => { const c = C.get(ctx.c); return c && c.alive && s.plots.some((p) => p.id === ctx.plot); },
    text: (s, ctx) => {
      const c = C.get(ctx.c);
      const p = s.plots.find((x) => x.id === ctx.plot);
      const bost = off('bostancibasi');
      return `${bost ? N(bost) : 'Sadık bir hizmetkâr'} gece yarısı huzurunuza çıktı. Elindeki mühürlü mektuplar şüpheye yer bırakmıyor: ${N(c)} (${C.title(c)}) bir ${PH.Court.PLOT_N[p.type].toLowerCase()} planı hazırlıyor.\n\nPlanın ilerleme durumu: %${Math.round(p.prog)}. Ne emredersiniz?`;
    },
    choices: (s, ctx) => {
      const c = C.get(ctx.c);
      const list = [
        { t: 'Siyaseten katl! Başı Bâb-ı Hümâyun\'a asılsın', hint: c && c.dyn ? 'Hanedan kanı dökülür' : 'Fetva istenecek', run: (s2, cx) => {
          const t = C.get(cx.c);
          const fet = U.chance(PH.Court.fetvaChance(t));
          const w = PH.Court.execute(t, fet);
          const conf = Math.round(w * 0.7);
          if (conf > 0 && !t.dyn) fx({ treasury: conf });
          s2.plots = s2.plots.filter((p) => p.by !== t.id);
          return `${N(t)} yakalandı ve idam edildi.${fet ? ' Şeyhülislam fetvayı imzaladı.' : ' Şeyhülislam fetva vermekte tereddüt etti; idam fetvasız yapıldı.'}${conf > 0 && !t.dyn ? ` Servetine el konuldu: ${U.money(conf, true)}.` : ''}`;
        } },
        { t: 'Yedikule zindanına atılsın', run: (s2, cx) => { const t = C.get(cx.c); PH.Court.imprison(t); s2.plots = s2.plots.filter((p) => p.by !== t.id); fx({ stability: 1 }); return `${N(t)} zincire vurularak Yedikule'ye götürüldü.`; } },
        { t: 'Sürgüne gönderilsin', hide: () => c && c.role === 'harem', run: (s2, cx) => { const t = C.get(cx.c); PH.Court.exile(t); s2.plots = s2.plots.filter((p) => p.by !== t.id); return `${N(t)} her şeyini geride bırakarak uzak bir kaleye sürgün edildi.`; } },
        { t: 'Gönlünü alın: hil\'at ve kese bağışlayın', hint: 'Sadakati satın almayı deneyin', req: E.req.money(4e6), run: (s2, cx) => { const t = C.get(cx.c); fx({ treasury: -4e6 }); C.opinion(t, U.ri(35, 55)); if (t.op > 0) s2.plots = s2.plots.filter((p) => p.by !== t.id); return t.op > 0 ? `${N(t)} şaşkınlıkla hediyelerinizi kabul etti ve ayaklarınıza kapandı. Komplodan vazgeçtiği anlaşılıyor.` : `${N(t)} hediyeleri aldı; ama gözlerindeki kin sönmedi.`; } },
        { t: 'Bilmiyormuş gibi davranın, izlemeye devam edin', hint: 'Riskli; suç ortakları ortaya çıkabilir', run: (s2, cx) => { fx({ entrika: 1, stress: 3 }); const p = s2.plots.find((x) => x.id === cx.plot); if (p) p.prog = Math.max(0, p.prog - 20); return 'Casuslarınız gölge gibi peşinde. Plan ağır ilerliyor ve her adım kaydediliyor.'; } },
      ];
      if (c && c.dyn && c.g === 'm') list.splice(1, 0, { t: 'Kafese kapatılsın', run: (s2, cx) => { const t = C.get(cx.c); PH.Harem.toKafes(t); s2.plots = s2.plots.filter((p) => p.by !== t.id); return `${N(t)} kafes dairesine kapatıldı. Bundan böyle dünyayı demir parmaklıklar ardından görecek.`; } });
      return list;
    },
  });

  E.reg({
    id: 'komplo_darbe', cat: 'entrika', icon: 'dagger',
    title: 'Saray Darbesi!',
    valid: (s, ctx) => { const c = C.get(ctx.c); return c && c.alive && !c.prison; },
    text: (s, ctx) => {
      const c = C.get(ctx.c);
      return `Gece yarısı sarayda kılıç şakırtıları! ${N(c)} etrafına topladığı zorbalar ve bir grup yeniçeriyle Orta Kapı'ya dayandı. "Padişah tahttan insin!" diye bağırıyorlar.\n\nBostancılar kapıları tutuyor ama ne kadar dayanacakları belli değil.`;
    },
    choices: [
      { t: 'Bostancıları ve sadık kulları toplayıp karşı koyun', hint: (s, ctx) => { const p = PH.Court._coupP(s, ctx, 0); return `Başarı: %${Math.round((1 - p) * 100)}`; }, run: (s, ctx) => PH.Court._coup(s, ctx, 0) },
      { t: 'Yeniçerilere altın saçın, saflarına çekin', hint: (s, ctx) => { const p = PH.Court._coupP(s, ctx, 0.25); return `10 Mn akçe · Başarı: %${Math.round((1 - p) * 100)}`; }, req: E.req.money(10e6), run: (s, ctx) => { fx({ treasury: -10e6 }); return PH.Court._coup(s, ctx, 0.25); } },
      { t: 'Kan dökülmesin; tahttan feragat edin', hint: 'Saltanatınız sona erer', run: (s, ctx) => { s.succession = { cause: 'tahttan indirildi', deposed: true, forced: ctx.c }; return 'Tacınızı ve kılıcınızı bıraktınız. Kafes dairesinin kapısı arkanızdan kapanacak.'; } },
    ],
  });
  PH.Court._coupP = (s, ctx, bonus) => {
    const c = C.get(ctx.c);
    let p = 0.35 + (c ? c.sk.entrika * 0.015 + c.sk.askeri * 0.01 : 0) - s.emp.janissary / 220 - s.emp.stability / 300 - St.offSkill('bostancibasi') * 0.012 - bonus + (c && c.office === 'yeniceri' ? 0.15 : 0) + (c && c.office === 'sadrazam' ? 0.08 : 0);
    return U.clamp(p, 0.05, 0.85);
  };
  PH.Court._coup = (s, ctx, bonus) => {
    const c = C.get(ctx.c);
    const p = PH.Court._coupP(s, ctx, bonus);
    if (U.chance(p)) {
      s.succession = { cause: 'darbe ile tahttan indirildi', deposed: true, forced: ctx.c };
      return `Kapılar kırıldı. ${N(c)} ve adamları Has Oda'ya daldı. Saltanatınız bu gece sona erdi...`;
    }
    PH.Court.execute(c, true);
    fx({ legitimacy: 5, stability: 4, stress: 10, prestige: 3 });
    return `Darbe bastırıldı! ${N(c)} yakalandı ve sabah olmadan idam edildi. İstanbul, padişahın kudretini bir kez daha gördü.`;
  };

  E.reg({
    id: 'komplo_zehir', cat: 'entrika', icon: 'poison',
    title: 'Zehir!',
    valid: (s, ctx) => !!C.get(ctx.c),
    text: (s, ctx) => `Akşam yemeğinden sonra midenizde dayanılmaz bir yanma başladı. Dudaklarınız morardı, eliniz titriyor. Çeşnigirbaşı da aynı tabaktan tatmıştı ve şimdi yerde kıvranıyor.\n\nHekimbaşı koşarak geliyor...`,
    choices: [
      { t: 'Hekimbaşına teslim olun', hint: (s) => (off('hekimbasi') ? `Hekimbaşı ilim: ${off('hekimbasi').sk.ilim}` : 'Hekimbaşı yok!'), run: (s, ctx) => {
        const h = off('hekimbasi');
        const saved = h && U.chance(0.45 + h.sk.ilim * 0.03) && !(h.id === ctx.c);
        const c = C.get(ctx.c);
        if (saved) { fx({ health: -U.ri(10, 20), stress: 10 }); }
        else { fx({ health: -U.ri(30, 50), stress: 15 }); }
        if (c && c.alive) { c.known = true; }
        if (C.sultan().hp <= 0) { C.kill(C.sultan(), 'zehirlenerek'); return 'Panzehirler işe yaramadı. Padişah, sabaha karşı ruhunu teslim etti.'; }
        return (saved ? 'Hekimbaşı panzehiri zamanında verdi. Kurtuldunuz ama bedeniniz zayıf düştü.' : 'Günlerce ateşler içinde yattınız. Ölümden döndünüz, ama sağlığınız ağır hasar gördü.') + (c && c.alive ? `\n\nSoruşturma derinleşti: iz ${U.dat(N(c))} çıkıyor!` : '');
      } },
      { t: 'Kusmak için tuzlu su içip dua edin', run: (s, ctx) => { fx({ health: -U.ri(20, 40), piety: 3 }); const c = C.get(ctx.c); if (c) c.known = true; if (C.sultan().hp <= 0) { C.kill(C.sultan(), 'zehirlenerek'); return 'Dualarınız bu sefer kabul olmadı...'; } return 'Bir gece boyunca ölümle pençeleştiniz. Sabah, solgun ama hayatta uyandınız.'; } },
    ],
    after: true,
  });

  E.reg({
    id: 'komplo_isyan', cat: 'entrika', icon: 'flag',
    title: 'İsyan Bayrağı',
    valid: (s, ctx) => { const c = C.get(ctx.c); return c && c.alive && !c.prison && !c.exiled; },
    text: (s, ctx) => {
      const c = C.get(ctx.c);
      const where = c.gov ? D.prov[c.gov].n : c.sancak || 'Anadolu';
      return `${N(c)} ${U.loc(where)} isyan bayrağını açtı! Etrafına sekbanlar, levendler ve hoşnutsuz sipahiler topladı. ${c.dyn ? 'Şehzade, tahtın asıl sahibinin kendisi olduğunu ilan etti!' : '"Padişah kötü vezirlerin elinde esir" diyerek halkı kışkırtıyor.'}`;
    },
    choices: [
      { t: 'Ordu gönderin, isyanı ezin', hint: (s, ctx) => `Başarı: %${Math.round(PH.Court._revP(s, ctx) * 100)}`, run: (s, ctx) => {
        const c = C.get(ctx.c);
        const win = U.chance(PH.Court._revP(s, ctx));
        fx({ treasury: -3e6, sip: -U.ri(1000, 3000), jan: -U.ri(300, 1200) });
        if (win) { PH.Court.execute(c, true); fx({ prestige: 3, stability: 4 }); return `Asiler dağıtıldı. ${N(c)} yakalandı ve idam edildi.`; }
        if (c.gov) { const p = s.provs[c.gov]; if (p) { p.rebel = true; p.unrest = 95; } }
        fx({ prestige: -5, stability: -8 });
        return 'Ordu ağır bir yenilgi aldı! Asiler güçleniyor. Bölge artık merkeze vergi göndermiyor.';
      } },
      { t: 'Af ve beylerbeyilik teklif edin', hint: 'Barışçı çözüm', run: (s, ctx) => {
        const c = C.get(ctx.c);
        if (U.chance(0.55 + C.sultan().sk.diplomasi * 0.02)) { C.opinion(c, 50); fx({ legitimacy: -4, stability: 2, prestige: -2 }); return `${N(c)} affı kabul etti ve kılıcını kınına soktu. Bazıları bunu zaaf olarak görüyor.`; }
        fx({ prestige: -4, stability: -5 });
        if (c.gov) { const p = s.provs[c.gov]; if (p) { p.rebel = true; p.unrest = 95; } }
        return `${N(c)} elçinizi kovdu: "Ben pazarlık etmem, tahtı isterim!"`;
      } },
      { t: 'Bir suikastçı gönderin', hint: (s) => `Entrika sınaması: ${E.pctTxt(E.checkP('entrika', 10))}`, run: (s, ctx) => {
        const c = C.get(ctx.c);
        if (E.check('entrika', 10)) { C.kill(c, 'suikasta kurban gitti'); s.reign.cruelty++; fx({ stability: 3, legitimacy: -2 }); return `Bir gece, ${N(c)} çadırında ölü bulundu. Lidersiz kalan asiler dağıldı.`; }
        fx({ legitimacy: -5, prestige: -3 });
        if (c.gov) { const p = s.provs[c.gov]; if (p) { p.rebel = true; p.unrest = 95; } }
        return 'Suikastçı yakalandı ve kimin gönderdiğini itiraf etti. İsyan büyüyor, adınız lekelendi.';
      } },
    ],
  });
  PH.Court._revP = (s, ctx) => {
    const c = C.get(ctx.c);
    const ours = PH.Mil.power(PH.Mil.home());
    return U.clamp(0.45 + (ours / 100000) * 0.3 - (c ? c.sk.askeri * 0.015 : 0) + St.offSkill('vezir2') * 0.01, 0.15, 0.92);
  };

  E.reg({
    id: 'komplo_harem', cat: 'harem', icon: 'poison',
    title: 'Haremde Karanlık İşler',
    valid: (s, ctx) => { const t = C.get(ctx.t); const c = C.get(ctx.c); return t && t.alive && c && c.alive; },
    text: (s, ctx) => {
      const t = C.get(ctx.t);
      return `${N(t)} birdenbire ağır şekilde hastalandı. Saray hekimleri şaşkın; bazı cariyeler, yemeğine bir şey katıldığını fısıldıyor. Darüssaade Ağası huzurunuzda emir bekliyor.`;
    },
    choices: [
      { t: 'Derhal soruşturma başlatın', hint: (s) => `Entrika: ${E.pctTxt(U.clamp(E.checkP('entrika', 8) + St.offSkill('darussaade') * 0.02, 0, 0.95))}`, run: (s, ctx) => {
        const t = C.get(ctx.t); const c = C.get(ctx.c);
        const found = U.chance(U.clamp(E.checkP('entrika', 8) + St.offSkill('darussaade') * 0.02, 0, 0.95));
        t.hp = Math.max(5, t.hp - U.ri(10, 30));
        if (found) { c.known = true; E.pushFront('harem_suclu', { c: c.id, t: t.id }); return `Ağalar cariyeleri tek tek sorguya çekti. Bütün ipler aynı kişiye çıkıyor: ${N(c)}.`; }
        return 'Soruşturma bir sonuç vermedi. Harem sessiz, ama herkes birbirine şüpheyle bakıyor.';
      } },
      { t: 'Olayı örtbas edin, harem huzuru bozulmasın', run: (s, ctx) => { const t = C.get(ctx.t); t.hp = Math.max(1, t.hp - U.ri(20, 45)); fx({ stress: 2 }); if (t.hp < 15) { C.kill(t, 'gizemli bir hastalıktan'); fx({ happiness: -8 }); return `${N(t)} kurtarılamadı. Ölümünün sırrı haremin duvarlarına gömüldü.`; } return `${N(t)} yavaş yavaş iyileşiyor. Kimse bir şey konuşmuyor.`; } },
    ],
  });
  E.reg({
    id: 'harem_suclu', cat: 'harem', icon: 'gavel',
    title: 'Suçlu Bulundu',
    valid: (s, ctx) => { const c = C.get(ctx.c); return c && c.alive; },
    text: (s, ctx) => `${N(C.get(ctx.c))} suçunu inkâr ediyor; ama deliller ortada. Hükmünüz nedir?`,
    choices: [
      { t: 'Torbaya konup Boğaz\'a atılsın', hint: 'Haremin eski cezası', run: (s, ctx) => { const c = C.get(ctx.c); C.kill(c, 'Boğaz\'ın sularına atıldı'); s.reign.cruelty++; fx({ stress: 4, stability: 1, happiness: -3 }); return 'Gece karanlığında bir kayık Sarayburnu\'ndan açıldı ve boş döndü.'; } },
      { t: 'Eski Saray\'a sürülsün', run: (s, ctx) => { const c = C.get(ctx.c); c.role = 'eskisaray'; C.opinion(c, -40); return `${N(c)} gözyaşları içinde Eski Saray'a gönderildi. Bir daha harem-i hümâyunun kapısından giremeyecek.`; } },
      { t: 'Affedin, bir daha olmasın', run: (s, ctx) => { const c = C.get(ctx.c); C.opinion(c, 20); fx({ piety: 2, stability: -1 }); return 'Merhametiniz haremde konuşuluyor. Kimisi bunu yücelik, kimisi zaaf sayıyor.'; } },
    ],
  });

  /* ===================== YENİÇERİ ===================== */
  E.reg({
    id: 'yeniceri_isyan', cat: 'ordu', icon: 'jan',
    title: 'Kazan Kaldırdılar!',
    w: (s) => (s.emp.janissary < 30 ? 6 : 0), cd: 10,
    text: (s) => `Et Meydanı'nda kazanlar devrildi! Yeniçeriler çorbayı reddederek isyan bayrağı açtı. ${s.emp.purity < 90 ? 'Ulufelerinin değersiz akçeyle ödenmesine öfkeliler. ' : ''}Kalabalık Atmeydanı'na yürüyor ve ${off('sadrazam') ? N(off('sadrazam')) + "'nın başını" : 'bahşiş'} istiyor.`,
    choices: [
      { t: 'Bahşiş dağıtın ve ulufeleri artırın', hint: '15 Mn akçe', req: E.req.money(15e6), run: () => { fx({ treasury: -15e6, janissary: 20, stability: -2, prestige: -2 }); return 'Altınlar kazanların içine döküldü. Ocak bu seferlik sakinleşti; ama ders aldılar: isyan para eder.'; } },
      { t: 'Sadrazamı kurban verin', hint: 'Sadrazam idam edilir', req: E.req.office('sadrazam'), run: () => { const c = off('sadrazam'); PH.Court.execute(c, true); fx({ janissary: 25, legitimacy: -4, prestige: -3 }); return `${U.gen(N(c))} cesedi Bâb-ı Hümâyun önüne atıldı. Yeniçeriler zafer çığlıklarıyla dağıldı.`; } },
      { t: 'Sancak-ı Şerif\'i çıkarın, halkı ve ulemayı çağırın', hint: (s) => `Başarı: %${Math.round(U.clamp((s.emp.ulema + s.emp.popularity) / 200 + 0.05, 0.1, 0.9) * 100)}`, run: (s) => {
        const p = U.clamp((s.emp.ulema + s.emp.popularity) / 200 + 0.05, 0.1, 0.9);
        if (U.chance(p)) { fx({ janissary: 10, prestige: 5, legitimacy: 5, jan: -Math.round(s.army.jan * 0.05) }); return 'Peygamber sancağı altında toplanan halk ve medrese talebeleri karşısında asiler dağıldı. Elebaşları yakalanıp cezalandırıldı.'; }
        fx({ janissary: -10, stability: -10, legitimacy: -8 });
        if (U.chance(0.35)) { s.succession = { cause: 'yeniçeri isyanıyla tahttan indirildi', deposed: true }; return 'Halk korkudan evlerine kapandı. Asiler saraya girdi ve sizi tahttan indirdi!'; }
        return 'Halk evlerinden çıkmadı. Asiler şehri yağmalayıp çekildi. Otoriteniz derinden sarsıldı.';
      } },
      { t: 'Topçu ve bostancılarla ocağı bastırın', hint: 'Kanlı ve tehlikeli', run: (s) => {
        const p = U.clamp(0.25 + (s.army.cannons / 1000) + (s.army.nizam / 20000) + St.offSkill('bostancibasi') * 0.015, 0.1, 0.85);
        if (U.chance(p)) { fx({ jan: -Math.round(s.army.jan * 0.2), janissary: 15, prestige: 6, stability: 3, popularity: -3 }); s.reign.cruelty++; return 'Toplar kışlalara çevrildi. Saatler süren çatışmanın ardından asi bölükler teslim oldu. Ocak, padişahın kim olduğunu hatırladı.'; }
        s.succession = { cause: 'yeniçeri isyanıyla tahttan indirildi', deposed: true };
        return 'Bostancılar ezildi. Asiler saray kapılarını kırıp içeri girdi ve "Padişah istemeyüz!" diye haykırdı...';
      } },
    ],
  });

  E.reg({
    id: 'ulufe_gecikme', cat: 'ekonomi', icon: 'coin',
    title: 'Ulufeler Ödenemiyor',
    text: (s) => `Defterdar titreyerek huzurunuzda: "Hazine-i âmire tamtakır, hünkârım. ${s.flags.unpaid} aydır kapıkulu ulufeleri ödenemedi. Yeniçeriler sabırsızlanıyor."`,
    choices: [
      { t: 'Galata sarraflarından borç alın (25 Mn)', hint: 'Aylık %1,2 faiz', run: () => { fx({ treasury: 25e6, debt: 27e6, stability: -1 }); return 'Sarraflar keselerini açtı; ama faizleri ağır.'; } },
      { t: 'Akçede tağşiş yapın', hint: 'Hızlı para; yeniçeriler kızar', run: (s) => { const amt = Math.round(PH.Eco.budget().ti * 2.5); s.emp.purity = Math.max(30, s.emp.purity - 12); fx({ treasury: amt, janissary: -8, popularity: -4 }); return `Darphane, gümüşü azaltılmış akçe basmaya başladı. Hazineye ${U.money(amt, true)} girdi; ancak piyasalarda fiyatlar şimdiden yükseliyor.`; } },
      { t: 'Zengin bir paşanın servetini müsadere edin', hint: 'En zengin devlet adamı', run: () => { const rich = C.list((c) => c.role === 'devlet').sort((a, b) => b.wealth - a.wealth)[0]; if (!rich) return 'Müsadere edilecek kimse bulunamadı.'; const amt = PH.Court.confiscate(rich); C.opinion(rich, -40); return `${U.gen(N(rich))} konağı basıldı. Hazineye ${U.money(amt, true)} aktarıldı. Paşa öfkeden kuduruyor.`; } },
      { t: 'İç hazineden (padişah servetinden) ödeyin', hint: 'Keyfiniz kaçar', run: () => { fx({ treasury: 12e6, happiness: -10, prestige: 2, janissary: 4 }); return 'Enderun hazinesindeki altın tabaklar ve mücevherler darphaneye gönderildi. Kullar, padişahın fedakârlığından etkilendi.'; } },
    ],
  });

  /* ===================== DİVAN ===================== */
  E.reg({
    id: 'vezir_rusvet', cat: 'divan', icon: 'bribe',
    title: 'Rüşvet İddiası',
    w: (s) => 4 + s.emp.corruption / 15, cd: 10,
    setup: (s) => { const c = U.pick(C.list((x) => x.role === 'devlet' && (x.office || x.gov))); return c ? { c: c.id, guilty: C.has(c, 'rusvetci') ? 0.85 : 0.35 } : null; },
    valid: (s, ctx) => { const c = C.get(ctx.c); return c && c.alive && (c.office || c.gov); },
    text: (s, ctx) => { const c = C.get(ctx.c); return `Bir arzuhal, ${N(c)} (${C.title(c)}) hakkında ağır iddialar içeriyor: makam satmak, kadılardan rüşvet almak ve vakıf gelirlerini zimmetine geçirmek. Paşanın serveti son yıllarda göz kamaştırıcı biçimde arttı (${U.money(c.wealth, true)}).`; },
    choices: [
      { t: 'Soruşturma açılsın', hint: 'Teftiş ve müfettiş gönderilir', run: (s, ctx) => {
        const c = C.get(ctx.c);
        const guilty = U.chance(ctx.guilty);
        if (guilty) { c.known = true; E.pushFront('rusvet_hukum', { c: c.id }); return 'Müfettişler defterleri inceledi: iddialar doğru çıktı!'; }
        C.opinion(c, -10); fx({ corruption: -1 });
        return `İddialar asılsız çıktı. ${N(c)} temize çıktı ama bu şüpheden alındı.`;
      } },
      { t: 'İftiradır, arzuhali yırtın', run: (s, ctx) => { const c = C.get(ctx.c); C.opinion(c, 10); fx({ corruption: 3, popularity: -1 }); return 'Paşa, kendisine gösterdiğiniz itimattan memnun. Ancak halk arasında "büyük balık yakalanmaz" sözü dolaşıyor.'; } },
      { t: 'Sorgusuz sualsiz azledin', run: (s, ctx) => { const c = C.get(ctx.c); PH.Court.dismiss(c); fx({ corruption: -3, stability: -1 }); return `${N(c)} görevinden alındı. Saray koridorlarında bu kararın acelesi konuşuluyor.`; } },
    ],
  });
  E.reg({
    id: 'rusvet_hukum', cat: 'divan', icon: 'gavel',
    title: 'Suçlu Paşa',
    valid: (s, ctx) => { const c = C.get(ctx.c); return c && c.alive; },
    text: (s, ctx) => `${U.gen(N(C.get(ctx.c)))} suçu sabit. Servetinin büyük kısmının haram yoldan kazanıldığı anlaşıldı.`,
    choices: [
      { t: 'İdam ve müsadere', hint: 'Servetine el konur', run: (s, ctx) => { const c = C.get(ctx.c); const w = Math.round(c.wealth * 0.85); PH.Court.execute(c, true); fx({ treasury: w, corruption: -6, popularity: 4 }); s.reign.justice++; return `Paşa idam edildi; ${U.money(w, true)} hazineye aktarıldı. Halk, adaletin yerini bulduğunu söylüyor.`; } },
      { t: 'Azil ve müsadere', run: (s, ctx) => { const c = C.get(ctx.c); const w = PH.Court.confiscate(c); PH.Court.dismiss(c); fx({ corruption: -4, popularity: 2 }); s.reign.justice++; return `Paşa azledildi, ${U.money(w, true)} müsadere edildi.`; } },
      { t: 'Para cezasıyla görevinde kalsın', hint: 'Yetenekli ise kaybetmeyin', run: (s, ctx) => { const c = C.get(ctx.c); const w = Math.round(c.wealth * 0.3); c.wealth -= w; fx({ treasury: w, corruption: -1 }); C.opinion(c, -5); return `${N(c)} ${U.money(w, true)} ödedi ve görevine devam ediyor. Ama artık gözünüz üzerinde.`; } },
    ],
  });

  E.reg({
    id: 'divan_kavga', cat: 'divan', icon: 'swap',
    title: 'Vezirler Arasında Çekişme',
    w: 4, cd: 14,
    setup: (s) => { const l = C.list((x) => x.office && D.offices[x.office].divan && x.role === 'devlet'); if (l.length < 2) return null; const [a, b] = U.sample(l, 2); return { a: a.id, b: b.id, topic: U.pick(['sefer', 'hazine', 'atama']) }; },
    valid: (s, ctx) => C.get(ctx.a) && C.get(ctx.a).alive && C.get(ctx.b) && C.get(ctx.b).alive,
    text: (s, ctx) => {
      const a = C.get(ctx.a), b = C.get(ctx.b);
      const t = { sefer: 'yeni bir seferin gerekliliği', hazine: 'hazinenin nasıl düzeltileceği', atama: 'Mısır beylerbeyiliğine kimin gideceği' }[ctx.topic];
      return `Kubbealtı'nda ${t} konusunda ${N(a)} (${C.title(a)}) ile ${N(b)} (${C.title(b)}) arasında sert bir tartışma çıktı. Sesler kafesli pencerenin ardından sizin oturduğunuz yere kadar ulaşıyor. İki taraf da sizin desteğinizi bekliyor.`;
    },
    choices: [
      { t: (s, ctx) => `${U.acc(C.get(ctx.a).name)} destekleyin`, run: (s, ctx) => { const a = C.get(ctx.a), b = C.get(ctx.b); C.opinion(a, 12); C.opinion(b, -15); fx({ stability: -1 }); return `${N(a)} memnun; ${N(b)} ise surat asarak divanı terk etti.`; } },
      { t: (s, ctx) => `${U.acc(C.get(ctx.b).name)} destekleyin`, run: (s, ctx) => { const a = C.get(ctx.a), b = C.get(ctx.b); C.opinion(b, 12); C.opinion(a, -15); fx({ stability: -1 }); return `${N(b)} memnun; ${N(a)} ise kin besliyor.`; } },
      { t: 'Kafesin perdesini çekip ikisini de susturun', hint: 'Heybetinizi gösterin', run: (s, ctx) => { const a = C.get(ctx.a), b = C.get(ctx.b); C.opinion(a, -4); C.opinion(b, -4); fx({ legitimacy: 2, stability: 2, prestige: 1 }); return 'Kafes perdesinin sertçe çekildiğini duyan vezirler bir anda sustu. Divan sessizlik içinde işlerine döndü.'; } },
    ],
  });

  E.reg({
    id: 'sadrazam_guc', cat: 'divan', icon: 'seal',
    title: 'Sadrazamın Nüfuzu',
    w: (s) => { const c = off('sadrazam'); return c && c.amb > 65 ? 4 : 0; }, cd: 24,
    setup: (s) => { const c = off('sadrazam'); return c ? { c: c.id } : null; },
    valid: (s, ctx) => { const c = C.get(ctx.c); return c && c.office === 'sadrazam'; },
    text: (s, ctx) => { const c = C.get(ctx.c); return `${U.gen(N(c))} konağı, sarayınızdan daha kalabalık. Valiler önce ona hediye gönderiyor, fermanlarınız onun mühürüyle şekilleniyor. Halk arasında "asıl padişah kim?" sorusu fısıldanıyor. Valide Sultan bu durumdan rahatsız.`; },
    choices: [
      { t: 'Yetkilerini kısın, bazı kararları bizzat verin', hint: 'Vakit harcanır', run: (s, ctx) => { const c = C.get(ctx.c); C.opinion(c, -12); c.amb = Math.max(0, c.amb - 15); fx({ legitimacy: 4, stress: 4, idare: 1 }); return 'Divan kararlarını artık bizzat onaylıyorsunuz. Sadrazamın yüzü asık, ama nüfuzu kırıldı.'; } },
      { t: 'Ona güvenin; devlet ehil ellerde', run: (s, ctx) => { const c = C.get(ctx.c); C.opinion(c, 10); c.amb = Math.min(100, c.amb + 10); fx({ stability: 3, legitimacy: -3, stress: -4 }); return 'Devlet çarkları sadrazamın elinde tıkır tıkır işliyor. Siz de keyfinize bakabilirsiniz... şimdilik.'; } },
      { t: 'Mührü geri alın, azledin', run: (s, ctx) => { const c = C.get(ctx.c); PH.Court.dismiss(c); fx({ legitimacy: 3, stability: -4 }); return `Mühr-i hümâyun ${U.abl(N(c))} geri alındı. Yeni bir sadrazam atamanız gerekecek.`; } },
    ],
  });

  E.reg({
    id: 'valide_nasihat', cat: 'saray', icon: 'crown',
    title: 'Valide Sultan\'ın Nasihati',
    w: (s) => (PH.Harem.valide() ? 4 : 0), cd: 16,
    setup: (s) => { const v = PH.Harem.valide(); if (!v) return null; const cand = U.pick(C.list((c) => c.role === 'devlet' && !c.office && c.cls === 'pasa')); return { v: v.id, cand: cand ? cand.id : null, kind: U.pick(['atama', 'harem', 'tasarruf']) }; },
    valid: (s, ctx) => { const v = C.get(ctx.v); return v && v.alive && v.role === 'valide'; },
    text: (s, ctx) => {
      const v = C.get(ctx.v);
      if (ctx.kind === 'atama' && ctx.cand) return `${N(v)} sizi dairesine çağırdı: "Oğlum, ${N(C.get(ctx.cand))} sadık ve ehil bir kuldur. Divanda bir makam verilse devlete hayırlı olur." Valide'nin bu ısrarının arkasında hangi hesaplar var, merak ediyorsunuz.`;
      if (ctx.kind === 'harem') return `${N(v)}: "Oğlum, hanedanın devamı için haremde daha çok vakit geçirmelisin. Sana yeni, terbiyeli cariyeler seçtim."`;
      return `${N(v)}: "Oğlum, saray masrafları göz kamaştırıyor. Biraz tasarruf etsek, hazine de halk da rahat eder."`;
    },
    choices: (s, ctx) => {
      if (ctx.kind === 'atama' && ctx.cand) return [
        { t: 'Valide\'nin adayını İkinci Vezir yapın', run: (s2, cx) => { const c = C.get(cx.cand); if (!c || !c.alive) return 'Aday artık yok.'; PH.Court.appoint('vezir2', c); C.opinion(C.get(cx.v), 15); return `${N(c)} İkinci Vezir oldu. Valide memnun; artık divanda bir kulağı daha var.`; } },
        { t: 'Nazikçe reddedin', run: (s2, cx) => { C.opinion(C.get(cx.v), -12); fx({ legitimacy: 1 }); return 'Valide Sultan dudaklarını büzdü: "Sen bilirsin oğlum."'; } },
      ];
      if (ctx.kind === 'harem') return [
        { t: 'Valide\'nin seçtiği cariyeleri kabul edin', run: (s2, cx) => { const c = C.create({ g: 'f', role: 'harem', rank: 'cariye', age: U.ri(16, 20), name: U.pick(D.names.cariye), origin: U.pick(D.names.origins), favor: 20, op: 30, traits: C.randTraits({ g: 'f' }) }); C.opinion(C.get(cx.v), 10); return `${c.name} adında bir cariye harem-i hümâyuna katıldı.`; } },
        { t: 'Harem işlerine karışmamasını rica edin', run: (s2, cx) => { C.opinion(C.get(cx.v), -10); return 'Valide Sultan gücendi.'; } },
      ];
      return [
        { t: 'Saray masraflarını kısın', hint: '1 yıl boyunca saray gideri %25 azalır', run: (s2, cx) => { s2.flags.palaceCut = s2.turn + 12; C.opinion(C.get(cx.v), 8); fx({ happiness: -5, popularity: 2 }); return 'Saray mutfağından harem bütçesine kadar her kalemde kısıntıya gidildi.'; } },
        { t: 'Padişahın sofrası kısılmaz', run: (s2, cx) => { C.opinion(C.get(cx.v), -5); fx({ happiness: 2 }); return 'Valide Sultan iç geçirdi.'; } },
      ];
    },
  });

  E.reg({
    id: 'bostanci_rapor', cat: 'entrika', icon: 'mask',
    title: 'Bostancıbaşının Raporu',
    w: (s) => (off('bostancibasi') ? 4 : 0), cd: 8,
    setup: (s) => { const c = U.pick(C.list((x) => (x.role === 'devlet' && x.office) || x.role === 'harem' || (x.dyn && x.g === 'm' && C.age(x) > 14 && x.id !== s.sultanId))); return c ? { c: c.id } : null; },
    valid: (s, ctx) => { const c = C.get(ctx.c); return c && c.alive; },
    text: (s, ctx) => {
      const c = C.get(ctx.c); c.known = true;
      const plot = PH.Court.plotOf(c);
      return `${N(off('bostancibasi'))} kulağınıza eğildi: "Hünkârım, ${N(c)} hakkında haberlerim var. Hakkınızda ${U.opWord(c.op).toLowerCase()} duygular besliyor; hırsı ${c.amb > 65 ? 'gözlerini kör etmiş' : c.amb > 35 ? 'makul seviyede' : 'pek yok'}.${plot ? ' Gizli toplantılar yaptığına dair söylentiler var!' : ''}"`;
    },
    choices: [
      { t: 'Bilgi için teşekkür edin', run: (s, ctx) => { const c = C.get(ctx.c); const plot = PH.Court.plotOf(c); if (plot) { plot.known = true; return 'Kişiyi dikkatle izletmeye karar verdiniz. (Komplo artık biliniyor; kişi kartından hesap sorabilirsiniz.)'; } return 'Bilgileri zihninizin bir köşesine kaydettiniz.'; } },
      { t: 'Bostancıbaşını ödüllendirin', hint: '500 bin akçe', req: E.req.money(5e5), run: () => { fx({ treasury: -5e5 }); C.opinion(off('bostancibasi'), 10); return 'Sadık hafiyeniz şevkle çalışmaya devam edecek.'; } },
    ],
  });

  /* ===================== ÖLÜM HABERLERİ ===================== */
  E.reg({
    id: 'olum_haber', cat: 'hanedan', icon: 'skull',
    title: (s, ctx) => (C.get(ctx.c) && C.get(ctx.c).g === 'f' ? 'Bir Vefat Haberi' : 'Bir Vefat Haberi'),
    valid: (s, ctx) => !!C.get(ctx.c),
    text: (s, ctx) => {
      const c = C.get(ctx.c);
      const rel = C.relation(c);
      const a = C.ageAt(c);
      return `Saray matem içinde. ${rel ? rel + ' ' : ''}${N(c)}, ${a} yaşında ${c.dcause} vefat etti. ${a < 6 ? 'Minik tabutu dualar eşliğinde türbeye taşındı.' : 'Cenaze namazı büyük bir kalabalıkla kılındı.'}`;
    },
    choices: [
      { t: 'Büyük bir cenaze merasimi ve türbe yaptırın', hint: '2 Mn akçe', req: E.req.money(2e6), run: (s, ctx) => { fx({ treasury: -2e6, piety: 3, popularity: 2, happiness: -6, stress: 3 }); return 'Mevlidler okundu, fakirlere helva ve ekmek dağıtıldı. Kabri başına bir de türbe yapılıyor.'; } },
      { t: 'Sessizce yas tutun', run: () => { fx({ happiness: -10, stress: 5 }); return 'Günlerce kimseyi kabul etmediniz. Has Oda\'nın ışıkları geç saatlere dek yandı.'; } },
      { t: 'Devlet işlerine gömülün', run: () => { fx({ happiness: -5, idare: 1, stress: 4 }); return 'Acınızı divan defterlerine gömdünüz.'; } },
    ],
  });

  /* ===================== DİVAN GÜNDEMLERİ ===================== */
  const dv = (id, title, icon, text, choices) => E.reg({ id, cat: 'divan', icon, title, text, choices });

  dv('dv_hazine', 'Divan: Hazine Meselesi', 'coin', (s) => { const b = PH.Eco.budget(); return `Başdefterdar raporunu okuyor: aylık gelir ${U.money(b.ti, true)}, gider ${U.money(b.te, true)}. ${b.net < 0 ? 'Hazine her ay ' + U.money(-b.net, true) + ' açık veriyor.' : 'Hazine dengede, ama ihtiyatlı olmak gerek.'} Vezirler çözüm önerileri sunuyor.`; }, [
    { t: 'Avarız vergisi toplansın', hint: 'Tek seferlik gelir, halk kızar', run: () => { const amt = PH.Eco.budget().inc.vergi * 1.5; fx({ treasury: Math.round(amt), popularity: -6 }); return `Olağanüstü avarız vergisi toplandı: ${U.money(amt, true)}.`; } },
    { t: 'Saray masrafları kısılsın', run: (s) => { s.flags.palaceCut = s.turn + 12; fx({ happiness: -4, popularity: 2 }); return 'Bir yıl boyunca saray giderleri kısılacak.'; } },
    { t: 'Ordunun bir kısmı terhis edilsin', hint: 'Azaplar ve sipahilerin bir kısmı', run: (s) => { const a = Math.round(s.army.azap * 0.4); const sp = Math.round(s.army.sip * 0.1); fx({ azap: -a, sip: -sp, janissary: -2 }); return `${U.num(a)} azap ve ${U.num(sp)} sipahi terhis edildi.`; } },
    { t: 'Şimdilik bir şey yapılmasın', run: () => { fx({ stability: -1 }); return 'Divan dağıldı. Defterdar iç çekerek defterlerini topladı.'; } },
  ]);
  dv('dv_eyalet', 'Divan: Taşradaki Huzursuzluk', 'flag', (s) => { const p = PH.Eco.ownProvs(s).filter((x) => !x.vassal).sort((a, b) => b.unrest - a.unrest)[0]; s.flags.dvProv = p.id; return `Sadrazam, ${D.prov[p.id].n} eyaletindeki huzursuzluğun tehlikeli boyutlara ulaştığını bildiriyor (huzursuzluk %${Math.round(p.unrest)}). Eşkıya yolları kesiyor, köylüler vergi vermiyor.`; }, [
    { t: 'Asker gönderin, düzeni sağlayın', hint: '2 Mn akçe', run: (s) => { const p = s.provs[s.flags.dvProv]; p.unrest = Math.max(0, p.unrest - 25); fx({ treasury: -2e6, popularity: -1 }); return 'Sipahiler bölgeye girdi, eşkıya dağıtıldı.'; } },
    { t: 'Bir yıl vergi muafiyeti tanıyın', run: (s) => { const p = s.provs[s.flags.dvProv]; p.exempt = s.turn + 12; p.unrest = Math.max(0, p.unrest - 30); fx({ popularity: 2 }); return 'Muafiyet fermanı köy köy okundu; köylüler dua ediyor.'; } },
    { t: 'Valiyi azledin', run: (s) => { const p = s.provs[s.flags.dvProv]; const g = C.get(p.gov); if (g) PH.Court.dismiss(g); p.unrest = Math.max(0, p.unrest - 10); return 'Vali görevinden alındı. Yeni bir vali tayin etmeyi unutmayın.'; } },
  ]);
  dv('dv_yeniceri', 'Divan: Ocağın Hoşnutsuzluğu', 'jan', (s) => `Yeniçeri Ağası ocağın huzursuz olduğunu bildiriyor. Sadakat %${Math.round(s.emp.janissary)} seviyesinde.`, [
    { t: 'Bahşiş dağıtın', hint: '6 Mn akçe', req: E.req.money(6e6), run: () => { fx({ treasury: -6e6, janissary: 10 }); return 'Ocak memnun.'; } },
    { t: 'Talim ve disiplin artırılsın', run: () => { fx({ training: 8, janissary: -3 }); return 'Talimler sıklaştı; ağalar homurdanıyor ama ordu güçleniyor.'; } },
    { t: 'Yeniçeri Ağası değiştirilsin', run: () => { const c = off('yeniceri'); if (c) PH.Court.dismiss(c); fx({ janissary: 2 }); return 'Ağa azledildi; yerine kimi atayacağınızı Divan ekranından seçebilirsiniz.'; } },
  ]);
  dv('dv_ulema', 'Divan: Ulemanın Şikâyeti', 'book', (s) => 'Şeyhülislam, medreselerin ihmal edildiğinden, meyhane ve kahvehanelerin çoğaldığından yakınıyor.', [
    { t: 'Vakıflara bağış yapın', hint: '4 Mn akçe', req: E.req.money(4e6), run: () => { fx({ treasury: -4e6, ulema: 10, piety: 2 }); return 'Medreselere ve camilere bağışlar ulaştı.'; } },
    { t: 'Bir yasakname çıkarın (içki yasağı)', hide: (s) => s.laws.icki, run: () => { PH.Eco.toggleLaw('icki'); return 'İçki yasağı ilan edildi.'; } },
    { t: 'Ulemanın siyasete karışmamasını söyleyin', run: () => { fx({ ulema: -6, legitimacy: 1 }); C.opinion(off('seyhulislam'), -10); return 'Şeyhülislam kırgın.'; } },
  ]);
  dv('dv_savas', 'Divan: Savaşın Gidişatı', 'sword', (s) => { const w = Object.values(s.nations).filter((n) => n.war).map((n) => `${PH.Dip.short(n.id)} (savaş skoru ${Math.round(n.ws)})`).join(', '); return `Serdarlar ve vezirler savaşları görüşüyor: ${w}. Kimi barış istiyor, kimi yeni bir sefer.`; }, [
    { t: 'Seferberlik: ordu takviye edilsin', hint: '5.000 azap toplanır', run: () => { PH.Mil.recruit('azap', 5000); return 'Rumeli ve Anadolu\'dan azaplar toplandı.'; } },
    { t: 'Barış arayışına girilsin', run: () => { Object.values(PH.state.nations).filter((n) => n.war).forEach((n) => (n.weary += 10)); fx({ janissary: -3 }); return 'Elçiler gizlice düşman başkentlerine gönderildi. Düşmanların barışa yatkınlığı arttı.'; } },
    { t: 'Savaşa devam! Gaza farzdır', run: () => { fx({ morale: 6, ulema: 2, popularity: -2 }); return 'Divan bir ağızdan gaza duası etti.'; } },
  ]);
  dv('dv_sefer', 'Divan: Yeni Bir Sefer mi?', 'flag', (s) => { const weak = PH.Dip.alive().filter((n) => n.truce <= s.turn && !n.ally).sort((a, b) => a.str - b.str)[0]; s.flags.dvNation = weak ? weak.id : null; return weak ? `İkinci Vezir, ${U.gen(PH.Dip.short(weak.id))} zayıf düştüğünü ve sınırlarda kışkırtmalar yaptığını söylüyor. "Gaza vakti gelmiştir!"` : 'Vezirler barışın devamını tartışıyor.'; }, [
    { t: 'Savaş hazırlıkları başlasın', hide: (s) => !s.flags.dvNation, run: (s) => { const n = s.nations[s.flags.dvNation]; PH.Dip.relChange(n, -20); fx({ janissary: 3, morale: 4 }); return `${PH.Dip.short(n.id)} ile ilişkiler gerildi. Savaş ilanı için Dünya ekranını kullanabilirsiniz.`; } },
    { t: 'Barış devam etsin; ülke imar edilsin', run: () => { fx({ popularity: 2, janissary: -2, stability: 2 }); return 'Divan, barış ve imar politikasını onayladı.'; } },
  ]);
  dv('dv_adalet', 'Divan: Adalet İşleri', 'gavel', () => 'Kazasker, taşradaki kadıların bazılarının zulüm ve rüşvetle anıldığını bildiriyor.', [
    { t: 'Müfettiş kadılar gönderilsin', hint: '1,5 Mn akçe', req: E.req.money(1.5e6), run: (s) => { fx({ treasury: -1.5e6, corruption: -4, popularity: 3 }); s.reign.justice++; return 'Teftişler başladı; birkaç kadı azledildi.'; } },
    { t: 'Adaletnâme yayınlansın', hide: (s) => s.laws.adalet, run: (s) => { PH.Eco.toggleLaw('adalet'); s.reign.justice++; return 'Adaletnâme ilan edildi.'; } },
    { t: 'Kazaskere tam yetki verilsin', run: () => { C.opinion(off('kazasker'), 10); fx({ ulema: 2 }); return 'Kazasker memnun.'; } },
  ]);
  dv('dv_ticaret', 'Divan: Ticaret Yolları', 'tent', () => 'Bazı tüccar heyetleri yolların güvensizliğinden ve gümrük memurlarının keyfiliğinden yakınıyor.', [
    { t: 'Derbentçiler ve kervansaray muhafızları artırılsın', hint: '2 Mn akçe', req: E.req.money(2e6), run: (s) => { fx({ treasury: -2e6 }); s.flags.mineUntil = Math.max(s.flags.mineUntil || 0, s.turn + 12); s.flags.mineInc = Math.max(s.flags.mineInc || 0, 200000); return 'Yollar güvenli hale geldi; bir yıl boyunca ek ticaret geliri bekleniyor.'; } },
    { t: 'Gümrükler hafifletilsin', run: () => { fx({ popularity: 2, treasury: -1e6 }); return 'Tüccarlar memnun.'; } },
  ]);
  dv('dv_donanma', 'Divan: Donanma', 'ship', (s) => `Kaptan-ı Derya, donanmanın ${s.army.ships} gemiden ibaret olduğunu, düşman korsanlarının kıyıları vurduğunu bildiriyor.`, [
    { t: '10 kadırga inşa edilsin', hint: (s) => U.money(PH.Mil.recruitCost('ships', 10), true), req: (s) => (s.emp.treasury >= PH.Mil.recruitCost('ships', 10) ? true : 'Hazine yetersiz'), run: () => { PH.Mil.recruit('ships', 10); return 'Tersanede çekiçler durmadan çalışıyor.'; } },
    { t: 'Korsan reislerine akıncılık izni verilsin', run: () => { fx({ treasury: 2e6, prestige: 1 }); Object.values(PH.state.nations).filter((n) => ['ven', 'spa', 'kni'].includes(n.id)).forEach((n) => PH.Dip.relChange(n, -8)); return 'Reisler Akdeniz\'e açıldı; ganimetlerden hazineye pay geliyor.'; } },
    { t: 'Donanmaya ihtiyaç yok', run: () => { C.opinion(off('kaptan'), -8); return 'Kaptan-ı Derya küskün.'; } },
  ]);
  dv('dv_kanun', 'Divan: Kanunname Teklifi', 'pen', () => 'Nişancı, dağınık hükümleri bir araya getiren yeni bir kanunname taslağı sunuyor. Bu, devletin işleyişini düzenleyecek, ama ulemanın şer\'i hükümlerle çelişen maddelere itirazı olabilir.', [
    { t: 'Kanunname onaylansın', run: (s) => { fx({ stability: 4, legitimacy: 3, ulema: -2, idare: 1 }); s.reign.laws++; s.reign.justice++; return 'Yeni kanunname tuğranızla yürürlüğe girdi.'; } },
    { t: 'Önce Şeyhülislam\'ın görüşü alınsın', run: (s) => { fx({ stability: 2, legitimacy: 1, ulema: 2 }); s.reign.laws++; return 'Kanunname, ulemanın itirazları giderilerek yumuşatıldı ve kabul edildi.'; } },
    { t: 'Reddedin', run: () => { C.opinion(off('nisanci'), -6); return 'Nişancı kalemini kırdı.'; } },
  ]);
})();
