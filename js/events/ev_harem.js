/* Padişah Hayatı — Harem ve hanedan olayları */
(function () {
  const U = PH.U, D = PH.D, C = PH.C, St = PH.St, E = PH.E, H = PH.Harem;
  const fx = PH.fx;
  const N = (c) => C.name(c);

  E.reg({
    id: 'gebelik', cat: 'harem', icon: 'baby', title: 'Müjde!',
    valid: (s, ctx) => { const w = C.get(ctx.w); return w && w.alive && w.preg; },
    text: (s, ctx) => `Darüssaade Ağası güler yüzle huzura çıktı: "Müjdemi isterim hünkârım! ${N(C.get(ctx.w))} hamile!" Saray ebeleri doğumun yaklaşık ${C.get(ctx.w).preg} ay sonra olacağını söylüyor.`,
    choices: [
      { t: 'Müjdeciye bir kese altın verin, kurbanlar kesilsin', hint: '500 bin akçe', run: (s, ctx) => { fx({ treasury: -5e5, happiness: 8, legitimacy: 1 }); C.opinion(C.get(ctx.w), 10); return 'Saray sevinç içinde. Hamile hanımefendiye ayrı bir daire ve hizmetkârlar tahsis edildi.'; } },
      { t: 'Müneccimbaşına çocuğun talihini sordurun', run: (s, ctx) => { const w = C.get(ctx.w); w.prophecy = U.pick(['m', 'f']); fx({ happiness: 5 }); return `Müneccimbaşı yıldızlara baktı: "${w.prophecy === 'm' ? 'Bir şehzade müjdeliyor yıldızlar, hünkârım!' : 'Ay gibi güzel bir sultan doğacak, hünkârım.'}" (Müneccimler her zaman haklı çıkmaz.)`; } },
    ],
  });

  const nameChoices = (g) => {
    const pool = g === 'm' ? D.names.sultan : D.names.female;
    return U.sample(pool, 3);
  };

  E.reg({
    id: 'dogum', cat: 'harem', icon: 'baby', title: 'Bir Doğum',
    valid: (s, ctx) => { const w = C.get(ctx.w); return w && w.alive; },
    setup: () => null,
    choices: (s, ctx) => {
      if (!ctx.g) {
        ctx.g = ctx.forceG || (U.chance(0.51) ? 'm' : 'f');
        ctx.names = nameChoices(ctx.g);
        ctx.momDies = U.chance(0.035);
        ctx.stillborn = U.chance(0.05);
      }
      if (ctx.stillborn) return [{ t: 'Allah\'ın takdiri...', run: (s2, cx) => { fx({ happiness: -12, stress: 6 }); const w = C.get(cx.w); C.opinion(w, 5); return 'Bebek ölü doğdu. Saray yasa büründü.'; } }];
      const mk = (nm) => ({ t: `Adı ${nm} olsun`, run: (s2, cx) => birth(s2, cx, nm) });
      return ctx.names.map(mk).concat([{ t: 'Kendiniz bir isim koyun…', input: { label: 'Çocuğun adı', suggest: ctx.names[0] }, run: (s2, cx, v) => birth(s2, cx, (v || ctx.names[0]).trim().slice(0, 20) || ctx.names[0]) }]);
    },
    text: (s, ctx) => {
      if (!ctx.g) { E.defs.dogum.choices(s, ctx); }
      const w = C.get(ctx.w);
      if (ctx.stillborn) return `${N(w)} uzun ve zorlu bir doğum yaptı. Ebeler başlarını önlerine eğdi...`;
      return `Sarayda çocuk ağlaması! ${N(w)} ${ctx.g === 'm' ? 'bir şehzade' : 'bir kız çocuğu'} dünyaya getirdi.${ctx.g === 'm' ? ' Toplar atılıyor, şehir yedi gün yedi gece donanacak.' : ' Saray halkı sevinç içinde.'}${ctx.momDies ? '\n\nAncak anne doğumdan sonra ağır bir humma nöbetine tutuldu...' : ''}\n\nBebeğe hangi adı koyacaksınız? Kulağına ezan okunmak üzere.`;
    },
  });
  function birth(s, ctx, name) {
    const w = C.get(ctx.w);
    const kid = H.birth(w, ctx.g, name);
    let txt = `${N(kid)} adıyla ezan okundu.`;
    if (ctx.g === 'm') { fx({ legitimacy: 5, popularity: 3, happiness: 10, stability: 2 }); txt += ' Halk, hanedanın devamı için dua ediyor.'; }
    else fx({ happiness: 7 });
    if (ctx.momDies) { C.kill(w, 'loğusa hummasından'); fx({ happiness: -10 }); txt += `\n\nNe yazık ki ${w.name} birkaç gün sonra vefat etti.`; }
    return txt;
  }

  E.reg({
    id: 'dusuk', cat: 'harem', icon: 'drop', title: 'Kötü Haber',
    valid: (s, ctx) => !!C.get(ctx.w),
    text: (s, ctx) => `${N(C.get(ctx.w))} çocuğunu düşürdü. Saray ebeleri çaresiz kaldı. Bazı cariyeler bunun bir nazar, bazılarıysa bir rakibin işi olduğunu fısıldıyor.`,
    choices: [
      { t: 'Onu teselli edin', run: (s, ctx) => { C.opinion(C.get(ctx.w), 12); fx({ happiness: -6 }); return 'Acınızı birlikte paylaştınız.'; } },
      { t: 'Soruşturma açtırın', run: (s, ctx) => { fx({ entrika: 0, stress: 3 }); const rival = U.pick(H.women().filter((x) => x.id !== ctx.w && C.has(x, 'kiskanc'))); if (rival && U.chance(0.5)) { rival.known = true; C.opinion(rival, -10, true); return `İzler kıskançlığıyla bilinen ${U.dat(N(rival))} çıkıyor; ama kesin delil yok.`; } return 'Hiçbir şey bulunamadı. Takdir-i ilahi.'; } },
    ],
  });

  E.reg({
    id: 'egitim', cat: 'hanedan', icon: 'book', title: (s, ctx) => `${U.gen(C.get(ctx.k) ? C.get(ctx.k).name : '')} Eğitimi`,
    valid: (s, ctx) => { const k = C.get(ctx.k); return k && k.alive; },
    text: (s, ctx) => { const k = C.get(ctx.k); return `${N(k)} altı yaşına bastı. "Bed-i besmele" töreniyle ilk dersine başlayacak. Hangi alanda yetişmesini istersiniz ve hocası kim olsun?`; },
    choices: [
      { t: 'İdare ve devlet adabı (Lala Paşa)', run: (s, ctx) => { H.setEdu(C.get(ctx.k), 'idare', 2); return 'Tecrübeli bir lala tayin edildi.'; } },
      { t: 'Askerlik ve binicilik (Enderun ağaları)', run: (s, ctx) => { H.setEdu(C.get(ctx.k), 'askeri', 2); return 'Ok, kılıç ve at üzerinde talimler başladı.'; } },
      { t: 'İlim, şiir ve hat (devrin âlimi)', hint: '1 Mn akçe, en iyi hoca', req: E.req.money(1e6), run: (s, ctx) => { fx({ treasury: -1e6 }); H.setEdu(C.get(ctx.k), 'ilim', 3); return 'Devrin en büyük âlimi hoca olarak tayin edildi.'; } },
      { t: 'Diplomasi ve diller (Rum ve Frenk tercümanlar)', run: (s, ctx) => { H.setEdu(C.get(ctx.k), 'diplomasi', 2); return 'Çocuğa Farsça, Arapça ve İtalyanca öğretilecek.'; } },
      { t: 'Saray adabı ve entrika (Darüssaade ağaları)', run: (s, ctx) => { H.setEdu(C.get(ctx.k), 'entrika', 2); return 'Sarayın görünmeyen kurallarını öğrenecek.'; } },
    ],
  });

  E.reg({
    id: 'sancak_vakti', cat: 'hanedan', icon: 'flag', title: 'Sancağa Çıkma Vakti',
    valid: (s, ctx) => { const k = C.get(ctx.k); return k && k.alive && !k.sancak && !k.kafes; },
    text: (s, ctx) => { const k = C.get(ctx.k); return `${N(k)} on beş yaşına bastı. Ecdat geleneğine göre bir sancağa çıkıp devlet idaresini öğrenmesi gerekir. Ancak sancaktaki şehzadeler, zamanla kendi adamlarını toplar...${s.laws.kafes ? '\n\nKafes usulü yürürlükte; şehzadeyi kafeste tutmak da mümkün.' : ''}`; },
    choices: (s, ctx) => {
      const list = U.sample(D.names.sancaks, 3).map((sn) => ({ t: `${sn} sancağına gönderin`, run: (s2, cx) => { H.toSancak(C.get(cx.k), sn); return `${N(C.get(cx.k))} ${U.dat(sn)} doğru yola çıktı.`; } }));
      list.push({ t: 'Sarayda, gözümün önünde kalsın', run: (s2, cx) => { C.opinion(C.get(cx.k), -5); return 'Şehzade sarayda kalacak.'; } });
      list.push({ t: 'Kafes dairesine yerleştirin', run: (s2, cx) => { H.toKafes(C.get(cx.k)); return 'Şehzade kafese kapatıldı.'; } });
      return list;
    },
  });

  E.reg({
    id: 'sunnet', cat: 'hanedan', icon: 'feast', title: 'Sünnet Düğünü',
    valid: (s, ctx) => { const k = C.get(ctx.k); return k && k.alive && !k.sunnet; },
    text: (s, ctx) => `${U.gen(N(C.get(ctx.k)))} sünnet vakti geldi. Vezirler, ecdat geleneğine uygun büyük bir şenlik yapılmasını öneriyor: Atmeydanı'nda haftalarca sürecek gösteriler, ziyafetler, cambazlar ve havai fişekler.`,
    choices: [
      { t: 'Elli gün elli gece sürecek muhteşem bir şenlik', hint: '15 Mn akçe', req: E.req.money(15e6), run: (s, ctx) => { C.get(ctx.k).sunnet = true; fx({ treasury: -15e6, popularity: 12, prestige: 8, legitimacy: 5, happiness: 10 }); Object.values(s.nations).forEach((n) => !n.war && PH.Dip.relChange(n, 3)); PH.Turn.log(`${N(C.get(ctx.k))} için muhteşem bir sünnet şenliği düzenlendi.`, 'dyn'); return 'Yabancı elçiler hayranlıkla izledi; esnaf alayları geçti, fakir çocuklar da şehzadeyle birlikte sünnet ettirildi.'; } },
      { t: 'Mütevazı bir merasim', hint: '2 Mn akçe', req: E.req.money(2e6), run: (s, ctx) => { C.get(ctx.k).sunnet = true; fx({ treasury: -2e6, popularity: 3, happiness: 4 }); return 'Saray içinde güzel bir tören yapıldı.'; } },
      { t: 'Sessizce yapılsın', run: (s, ctx) => { C.get(ctx.k).sunnet = true; fx({ prestige: -1 }); return 'Tören sessiz sedasız yapıldı.'; } },
    ],
  });

  E.reg({
    id: 'talip', cat: 'hanedan', icon: 'ring', title: 'Bir Talip',
    valid: (s, ctx) => { const k = C.get(ctx.k); return k && k.alive && !k.spouse; },
    setup: () => null,
    text: (s, ctx) => {
      const k = C.get(ctx.k);
      if (!ctx.p) { const p = U.pick(C.list((c) => c.role === 'devlet' && c.cls === 'pasa' && !c.spouse && C.age(c) < 60)); ctx.p = p ? p.id : null; }
      const p = C.get(ctx.p);
      return p ? `${N(p)} (${C.title(p)}), aracılar vasıtasıyla ${U.dat(N(k))} talip olduğunu bildirdi. Bir sultanla evlenmek, paşayı hanedana bağlar — ama aynı zamanda nüfuzunu da artırır.` : `${N(k)} evlilik çağına geldi, ama uygun bir talip henüz yok.`;
    },
    choices: [
      { t: 'Nikâh kıyılsın', req: (s, ctx) => (C.get(ctx.p) && C.get(ctx.p).alive ? true : 'Talip yok'), run: (s, ctx) => { const p = C.get(ctx.p); H.marryDaughter(C.get(ctx.k), p); fx({ treasury: -3e6, popularity: 2, happiness: 3 }); return `${N(p)} artık damadınız. Çeyiz alayı Atmeydanı'ndan geçti.`; } },
      { t: 'Kızım için daha uygun biri bulunsun', run: () => 'Talip geri çevrildi.' },
      { t: 'Kızım henüz genç', run: (s, ctx) => { C.opinion(C.get(ctx.k), 5); return 'Sultan, babasının kararına sevindi.'; } },
    ],
  });

  E.reg({
    id: 'harem_kavga', cat: 'harem', icon: 'swap', title: 'Haremde Çekişme',
    w: (s) => (H.women().length >= 2 ? 4 : 0), cd: 10,
    setup: () => { const ws = H.women(); if (ws.length < 2) return null; const [a, b] = U.sample(ws, 2); return { a: a.id, b: b.id }; },
    valid: (s, ctx) => C.get(ctx.a) && C.get(ctx.a).alive && C.get(ctx.b) && C.get(ctx.b).alive && C.get(ctx.a).role === 'harem' && C.get(ctx.b).role === 'harem',
    text: (s, ctx) => `Haremde fırtına! ${N(C.get(ctx.a))} ile ${N(C.get(ctx.b))} arasında çıkan tartışma saç saça bir kavgaya dönüştü. Biri diğerinin yüzünü tırmaladı. Kalfalar ayırmakta güçlük çekti. İkisi de huzurunuza çıkıp hakkını arıyor.`,
    choices: [
      { t: (s, ctx) => `${U.abl(C.get(ctx.a).name)} yana çıkın`, run: (s, ctx) => { C.opinion(C.get(ctx.a), 10); C.opinion(C.get(ctx.b), -18); C.get(ctx.b).favor = Math.max(0, C.get(ctx.b).favor - 10); return 'Kararınız haremde dengeleri değiştirdi.'; } },
      { t: (s, ctx) => `${U.abl(C.get(ctx.b).name)} yana çıkın`, run: (s, ctx) => { C.opinion(C.get(ctx.b), 10); C.opinion(C.get(ctx.a), -18); C.get(ctx.a).favor = Math.max(0, C.get(ctx.a).favor - 10); return 'Kararınız haremde dengeleri değiştirdi.'; } },
      { t: 'Valide Sultan\'a havale edin', hide: () => !H.valide(), run: () => { const v = H.valide(); C.opinion(v, 4); v.amb = Math.min(100, v.amb + 3); return 'Valide Sultan iki hanımefendiyi de sertçe uyardı.'; } },
      { t: 'İkisine de bir süre yüz vermeyin', run: (s, ctx) => { [ctx.a, ctx.b].forEach((id) => { const w = C.get(id); w.favor = Math.max(0, w.favor - 8); C.opinion(w, -5); }); fx({ stress: -1 }); return 'Harem bir süreliğine sessizleşti.'; } },
    ],
  });

  E.reg({
    id: 'haseki_istek', cat: 'harem', icon: 'tulip', title: 'Haseki\'nin Ricası',
    w: (s) => (H.women().some((w) => w.rank === 'haseki' || w.rank === 'kadin') ? 3.5 : 0), cd: 14,
    setup: () => { const w = H.women().find((x) => x.rank === 'haseki') || H.women().find((x) => x.rank === 'kadin'); return w ? { w: w.id, kind: U.pick(['vakif', 'pasa', 'oglu', 'nikah']) } : null; },
    valid: (s, ctx) => { const w = C.get(ctx.w); if (!w || !w.alive || w.role !== 'harem') return false; if (ctx.kind === 'nikah') return !w.nikah; return true; },
    text: (s, ctx) => {
      const w = C.get(ctx.w);
      const son = C.children(w.id).find((k) => k.g === 'm');
      return {
        vakif: `${N(w)}, kendi adına bir külliye (camii, imaret ve hamam) yaptırmak için izin ve hazineden destek istiyor. "Hayır dualarını size adayacağım, hünkârım."`,
        pasa: `${N(w)}, mevcut sadrazamın kendisine saygısızlık ettiğini ve onun yerine başka birinin getirilmesi gerektiğini ima ediyor.`,
        oglu: son ? `${N(w)}, oğlu ${U.gen(N(son))} veliaht ilan edilmesi için yalvarıyor.` : `${N(w)}, kendisine yeni bir daire ve daha çok hizmetkâr verilmesini istiyor.`,
        nikah: `${N(w)}, sizden resmî nikâh istiyor. Bu, Osmanlı geleneğinde pek görülmemiş bir şeydir; ulema ve halk arasında dedikodu olabilir.`,
      }[ctx.kind];
    },
    choices: (s, ctx) => {
      const w = C.get(ctx.w);
      const son = w && C.children(w.id).find((k) => k.g === 'm');
      if (ctx.kind === 'vakif') return [
        { t: 'Hazineden destek verin', hint: '6 Mn akçe', req: E.req.money(6e6), run: () => { fx({ treasury: -6e6, popularity: 4, piety: 2 }); C.opinion(w, 15); w.amb = Math.min(100, w.amb + 5); return 'Haseki Külliyesi\'nin temeli atıldı.'; } },
        { t: 'Kendi servetinden yaptırsın', run: () => { C.opinion(w, -4); fx({ popularity: 2 }); return 'Hanımefendi kendi mücevherlerini satarak küçük bir mescit yaptırdı.'; } },
      ];
      if (ctx.kind === 'pasa') return [
        { t: 'Sadrazamı azledin', req: (s2) => (s2.offices.sadrazam ? true : 'Sadrazam yok'), run: () => { PH.Court.dismiss(St.officer('sadrazam')); C.opinion(w, 20); w.amb = Math.min(100, w.amb + 10); fx({ stability: -3, legitimacy: -2 }); return 'Sadrazam azledildi. Haremin gücü herkesin gözü önünde.'; } },
        { t: 'Devlet işlerine karışmamasını söyleyin', run: () => { C.opinion(w, -12); fx({ legitimacy: 2 }); return 'Haseki gözyaşları içinde dairesine çekildi.'; } },
      ];
      if (ctx.kind === 'oglu' && son) return [
        { t: `${U.acc(son.name)} veliaht ilan edin`, run: (s2) => { s2.dynasty.heirId = son.id; if (s2.dynasty.succession !== 'tayin') s2.dynasty.succession = 'tayin'; C.opinion(w, 25); C.opinion(son, 20); H.kids().filter((k) => k.g === 'm' && k.id !== son.id).forEach((k) => { C.opinion(k, -20); const m = C.get(k.mo); if (m) C.opinion(m, -20); }); return `${N(son)} veliaht ilan edildi. Diğer şehzadelerin anneleri öfke içinde.`; } },
        { t: 'Veraset Allah\'ın takdiridir', run: () => { C.opinion(w, -10); return 'Haseki hayal kırıklığını gizleyemedi.'; } },
      ];
      if (ctx.kind === 'nikah') return [
        { t: 'Nikâh kıyılsın', run: (s2) => { w.nikah = true; w.rank = 'haseki'; C.opinion(w, 35); fx({ happiness: 10, ulema: -3, legitimacy: -2 }); const v = H.valide(); if (v) C.opinion(v, -15); PH.Turn.log(`${C.sultan().name} Han, ${w.name} ile resmen nikâhlandı.`, 'harem'); return 'Nikâh kıyıldı! İstanbul bu olağanüstü olayı konuşuyor.'; } },
        { t: 'Gelenekleri bozamam', run: () => { C.opinion(w, -10); return 'Hanımefendi kırıldı.'; } },
      ];
      return [
        { t: 'İsteğini yerine getirin', hint: '1 Mn akçe', run: () => { fx({ treasury: -1e6 }); C.opinion(w, 10); return 'Hanımefendi memnun.'; } },
        { t: 'Reddedin', run: () => { C.opinion(w, -6); return 'Hanımefendi küstü.'; } },
      ];
    },
  });

  E.reg({
    id: 'valide_haseki', cat: 'harem', icon: 'crown', title: 'Valide ile Haseki Arasında',
    w: (s) => (H.valide() && H.women().some((w) => w.rank === 'haseki' || w.rank === 'kadin') ? 3 : 0), cd: 20,
    setup: () => { const v = H.valide(); const w = H.women().find((x) => x.rank === 'haseki') || H.women().find((x) => x.rank === 'kadin'); return v && w ? { v: v.id, w: w.id } : null; },
    valid: (s, ctx) => C.get(ctx.v) && C.get(ctx.v).alive && C.get(ctx.v).role === 'valide' && C.get(ctx.w) && C.get(ctx.w).alive && C.get(ctx.w).role === 'harem',
    text: (s, ctx) => `Haremin iki kudretli kadını, ${N(C.get(ctx.v))} ve ${N(C.get(ctx.w))}, artık birbirlerini görmeye tahammül edemiyor. Valide, gelinin "haddini aştığını" söylüyor; Haseki ise Valide'nin her işine karıştığından yakınıyor. İkisi de sizden bir seçim yapmanızı istiyor.`,
    choices: [
      { t: 'Annenizin yanında durun', run: (s, ctx) => { C.opinion(C.get(ctx.v), 15); C.opinion(C.get(ctx.w), -15); C.get(ctx.w).favor -= 10; fx({ legitimacy: 2 }); return 'Valide Sultan\'ın sözü harem-i hümâyunda yine kanun.'; } },
      { t: 'Hasekinizin yanında durun', run: (s, ctx) => { C.opinion(C.get(ctx.w), 15); C.opinion(C.get(ctx.v), -18); fx({ happiness: 4 }); return 'Valide Sultan, oğlunun bir cariyeye "esir" olduğunu söylüyor.'; } },
      { t: 'Haseki\'ye ayrı bir saray tahsis edin', hint: '4 Mn akçe', req: E.req.money(4e6), run: (s, ctx) => { fx({ treasury: -4e6 }); C.opinion(C.get(ctx.w), 8); C.opinion(C.get(ctx.v), 3); return 'İki hanımefendi artık farklı saraylarda yaşıyor. Huzur geri geldi... şimdilik.'; } },
    ],
  });

  E.reg({
    id: 'cariye_yetenek', cat: 'harem', icon: 'music', title: 'Yetenekli Bir Cariye',
    w: (s) => (H.women().some((w) => w.rank === 'cariye' || w.rank === 'gozde') ? 3 : 0), cd: 18,
    setup: () => { const w = U.pick(H.women().filter((x) => x.rank === 'cariye' || x.rank === 'gozde')); return w ? { w: w.id } : null; },
    valid: (s, ctx) => { const w = C.get(ctx.w); return w && w.alive && w.role === 'harem'; },
    text: (s, ctx) => `Harem bahçesinden yükselen bir ney sesi dikkatinizi çekti. Sesin sahibi ${N(C.get(ctx.w))} (${C.get(ctx.w).origin}). Harem kalfası, bu cariyenin musikide, şiirde ve hatta satrançta eşsiz olduğunu söylüyor.`,
    choices: [
      { t: 'Onu huzurunuza çağırın', hint: 'Vakit harcamaz', run: (s, ctx) => { const w = C.get(ctx.w); w.favor = Math.min(100, w.favor + 20); if (!C.has(w, 'zarif')) w.traits.push('zarif'); C.opinion(w, 15); fx({ happiness: 6, stress: -4 }); if (w.rank === 'cariye') w.rank = 'gozde'; return `${w.name} artık "gözde" mertebesinde. Musikisi geceleri Has Oda'yı dolduruyor.`; } },
      { t: 'Ona sarayın musiki hocalığını verin', run: (s, ctx) => { C.opinion(C.get(ctx.w), 8); fx({ prestige: 1, happiness: 2 }); return 'Haremde yeni bir fasıl heyeti kuruldu.'; } },
    ],
  });

  E.reg({
    id: 'cocuk_hasta', cat: 'hanedan', icon: 'heart', title: 'Hasta Çocuk',
    w: (s) => (H.kids().some((k) => C.age(k) < 10) ? 3 : 0), cd: 10,
    setup: () => { const k = U.pick(H.kids().filter((x) => C.age(x) < 10)); return k ? { k: k.id } : null; },
    valid: (s, ctx) => { const k = C.get(ctx.k); return k && k.alive; },
    text: (s, ctx) => `${N(C.get(ctx.k))} çiçek hastalığına yakalandı! Ateşi düşmüyor. Annesi başucundan ayrılmıyor; hekimler endişeli.`,
    choices: [
      { t: 'Hekimbaşı tüm ilmiyle uğraşsın', hint: (s) => (St.officer('hekimbasi') ? `İlim ${St.officer('hekimbasi').sk.ilim}` : 'Hekimbaşı yok'), run: (s, ctx) => { const k = C.get(ctx.k); const h = St.officer('hekimbasi'); const p = 0.6 + (h ? h.sk.ilim * 0.02 : -0.2) + (PH.Eco.hasBuilding('darussifa') ? 0.1 : 0); if (U.chance(p)) { k.hp = Math.max(30, k.hp - 10); return 'Ateş düştü; çocuk kurtuldu! Yüzünde birkaç iz kalacak.'; } C.kill(k, 'çiçek hastalığından'); fx({ happiness: -15, stress: 8 }); return 'Tüm çabalara rağmen çocuk kurtarılamadı...'; } },
      { t: 'Çiçek aşısı (Anadolu usulü) denensin', hint: 'Riskli ama etkili', run: (s, ctx) => { const k = C.get(ctx.k); if (U.chance(0.75)) { k.hp = Math.min(100, k.hp + 5); fx({ ilim: 1 }); return 'Halk hekimlerinin usulü işe yaradı! Diğer çocuklara da aşı yaptırıldı.'; } C.kill(k, 'çiçek hastalığından'); fx({ happiness: -15, stress: 8 }); return 'Aşı tutmadı. Çocuk kurtarılamadı...'; } },
      { t: 'Türbelerde dua ettirin, Eyüp Sultan\'a adak adayın', run: (s, ctx) => { const k = C.get(ctx.k); fx({ piety: 3 }); if (U.chance(0.55)) return 'Dualar kabul oldu; çocuk iyileşti.'; C.kill(k, 'çiçek hastalığından'); fx({ happiness: -15 }); return 'Takdir-i ilahi... Çocuk kurtarılamadı.'; } },
    ],
  });

  E.reg({
    id: 'sehzade_mektup', cat: 'hanedan', icon: 'letter', title: 'Sancaktan Mektup',
    w: (s) => (H.kids().some((k) => k.sancak) ? 3 : 0), cd: 12,
    setup: () => { const k = U.pick(H.kids().filter((x) => x.sancak)); return k ? { k: k.id, kind: U.pick(['para', 'asker', 'basari']) } : null; },
    valid: (s, ctx) => { const k = C.get(ctx.k); return k && k.alive && k.sancak; },
    text: (s, ctx) => { const k = C.get(ctx.k); return { para: `${N(k)} ${U.abl(k.sancak)} mektup gönderdi: sancağın gelirlerinin yetersiz olduğunu, maiyetine bakamadığını yazıyor ve hazineden yardım istiyor.`, asker: `${N(k)}, sancağına daha fazla asker ve top gönderilmesini istiyor. "Sınırlarda eşkıya çoğaldı," diyor. Bazı vezirler bunun bir hazırlık olabileceğinden şüpheli.`, basari: `${N(k)}, ${U.loc(k.sancak)} bir eşkıya çetesini dağıttığını ve halkın kendisini çok sevdiğini bildiriyor.` }[ctx.kind]; },
    choices: (s, ctx) => {
      const k = C.get(ctx.k);
      if (ctx.kind === 'para') return [
        { t: 'Bir kese gönderin', hint: '1,5 Mn akçe', req: E.req.money(1.5e6), run: () => { fx({ treasury: -1.5e6 }); C.opinion(k, 12); return 'Şehzade memnun.'; } },
        { t: 'İdareli olmasını öğütleyin', run: () => { C.opinion(k, -6); k.sk.idare = Math.min(30, k.sk.idare + 1); return 'Şehzade kırgın ama bir ders aldı.'; } },
      ];
      if (ctx.kind === 'asker') return [
        { t: 'İstenen askeri gönderin', run: () => { C.opinion(k, 10); k.amb = Math.min(100, k.amb + 10); k.sk.askeri = Math.min(30, k.sk.askeri + 1); return 'Şehzade artık daha güçlü bir maiyete sahip.'; } },
        { t: 'Reddedin, gözetim altına aldırın', run: () => { C.opinion(k, -15); k.known = true; return 'Şehzadenin her adımı artık izleniyor.'; } },
        { t: 'Saraya geri çağırın', run: () => { k.sancak = null; C.opinion(k, -10); k.amb = Math.max(0, k.amb - 10); return 'Şehzade sancağını bırakıp İstanbul\'a döndü.'; } },
      ];
      return [
        { t: 'Onu övün ve ödüllendirin', run: () => { C.opinion(k, 15); fx({ legitimacy: 2 }); return 'Şehzadenin ünü yayılıyor.'; } },
        { t: 'Ünü fazla yayılıyor; dikkatli olun', run: () => { C.opinion(k, -5); k.known = true; return 'Şehzadenin popülerliği sizi tedirgin ediyor.'; } },
      ];
    },
  });
})();
