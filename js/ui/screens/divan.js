/* Padişah Hayatı — Divan ekranı: makamlar, hazine, kanunlar, inşaat */
(function () {
  const U = PH.U, D = PH.D, C = PH.C, UI = PH.UI, A = PH.A, St = PH.St, Eco = PH.Eco;
  const ic = PH.ic;
  const fx = PH.fx;
  const N = (c) => C.name(c);

  /* ---------- Fermanlar (tek seferlik) ---------- */
  const DECREES = [
    { id: 'genelaf', n: 'Genel Af', icon: 'key', cd: 24, d: 'Tüm mahkumlar ve sürgünler affedilir. Halk sevinir; ancak düzen biraz gevşer.', run: (s) => { let n = 0; C.list((c) => c.prison || c.exiled).forEach((c) => { PH.Court.pardon(c); n++; }); fx({ popularity: 5, stability: -2, piety: 2 }); return `${n} kişi affedildi. Zindan kapıları açıldı.`; } },
    { id: 'avariz', n: 'Avarız Vergisi', icon: 'coin', cd: 12, d: 'Olağanüstü bir vergi toplanır. Hazine dolar, halk kızar.', run: (s) => { const a = Math.round(Eco.budget().inc.vergi * 1.6); fx({ treasury: a, popularity: -7, stability: -2 }); return `Avarız akçesi toplandı: ${U.money(a, true)}.`; } },
    { id: 'ulufe', n: 'Ulufe Zammı', icon: 'jan', cd: 18, cost: 8e6, d: 'Kapıkulu askerlerine ulufe zammı ve bahşiş. Yeniçeri sadakati artar.', run: () => { fx({ treasury: -8e6, janissary: 14, morale: 6 }); return 'Ocaklar bayram ediyor.'; } },
    { id: 'tahrir', n: 'Tahrir (Sayım)', icon: 'scroll', cd: 60, cost: 4e6, d: 'Tüm eyaletlerde nüfus ve vergi kaynakları yeniden yazılır. Beş yıl boyunca vergi geliri %6 artar, yolsuzluk azalır.', run: (s) => { fx({ treasury: -4e6, corruption: -5, idare: 1 }); s.flags.tahrirUntil = s.turn + 60; return 'Tahrir emini kâtipler köy köy dolaşıp defterleri yeniledi.'; } },
    { id: 'imar', n: 'İmar Fermanı', icon: 'hammer', cd: 36, cost: 15e6, d: 'Payitaht ve büyük şehirlerde yollar, kaldırımlar, çeşmeler yenilenir. Gelişmişlik artar.', run: (s) => { fx({ treasury: -15e6, popularity: 4, prestige: 3 }); Eco.ownProvs(s).filter((p) => !p.vassal).sort((a, b) => D.prov[b.id].inc - D.prov[a.id].inc).slice(0, 5).forEach((p) => (p.dev = Math.min(10, p.dev + 1))); return 'En büyük beş şehirde imar çalışmaları başladı.'; } },
    { id: 'iskan', n: 'İskân Fermanı', icon: 'people', cd: 48, d: 'Anadolu\'dan Türkmen aileleri Rumeli\'ye yerleştirilir. Rumeli bağlılığı artar, Anadolu\'da hoşnutsuzluk olur.', run: (s) => { Eco.ownProvs(s).forEach((p) => { const r = D.prov[p.id].reg; if (r === 'Rumeli' || r === 'Avrupa') p.unrest = Math.max(0, p.unrest - 10); if (r === 'Anadolu') p.unrest = Math.min(100, p.unrest + 5); }); fx({ popularity: -2, stability: 2 }); return 'Sürgün kafileleri yola çıktı.'; } },
    { id: 'sadaka', n: 'Sadaka ve Zekât Dağıtımı', icon: 'gift', cd: 6, cost: 3e6, d: 'Fakirlere, dullara ve yetimlere hazineden yardım.', run: () => { fx({ treasury: -3e6, popularity: 5, piety: 3 }); return 'Mahalle imamları eliyle sadakalar dağıtıldı.'; } },
    { id: 'seferberlik', n: 'Gaza İlanı', icon: 'flag', cd: 24, d: 'Camilerde gaza hutbeleri okunur; gönüllüler (azap) toplanır.', run: () => { fx({ azap: U.ri(4000, 9000), morale: 8, popularity: -2, ulema: 2 }); return 'Binlerce gönüllü sancak altına koştu.'; } },
  ];

  UI.screens.divan = {
    render() {
      const sub = UI.cur('divan', 'uyeler');
      const s = PH.state;
      const vac = D.officeOrder.filter((o) => !s.offices[o]).length;
      let h = UI.seg('divan', [['uyeler', 'Makamlar', vac || ''], ['hazine', 'Hazine'], ['kanun', 'Kanunlar'], ['insa', 'İnşaat', s.projects.length || '']]);
      if (sub === 'uyeler') h += members(s);
      if (sub === 'hazine') h += treasury(s);
      if (sub === 'kanun') h += laws(s);
      if (sub === 'insa') h += building(s);
      return h;
    },
  };

  function members(s) {
    let h = `<button class="bigbtn" data-act="divanMeet" ${s.vakit < 1 ? 'disabled' : ''}>${ic('seal')}<div><b>Divan-ı Hümâyun'u Topla</b><small>Gündemi belirleyin, vezirleri dinleyin · 1 vakit</small></div>${ic('chev', 'chev')}</button>`;
    h += `<div class="list">`;
    D.officeOrder.forEach((o) => {
      const od = D.offices[o];
      const c = St.officer(o);
      if (c) h += `<button class="crow" data-act="char" data-id="${c.id}">${PH.Portrait.svg(c, 46)}<div class="crow-main"><small class="office">${ic(od.icon)} ${od.n}</small><b>${U.esc(N(c))}</b><small>${C.SKN[od.key]} ${c.sk[od.key]} · ${U.opWord(c.op)}${PH.Court.plotOf(c) && PH.Court.plotOf(c).known ? ' · ⚠ komplo' : ''}</small></div>${U.bar(c.op + 100, 200)}</button>`;
      else h += `<button class="crow vacant" data-act="officeFill" data-o="${o}"><div class="vac-ic">${ic(od.icon)}</div><div class="crow-main"><small class="office">${od.n}</small><b>Makam boş</b><small>Atama yapmak için dokunun</small></div>${ic('plus')}</button>`;
    });
    h += `</div>`;
    const pool = C.list((c) => c.role === 'devlet' && !c.office && !c.gov && !c.exiled && !c.prison);
    h += `<h4 class="sec">${ic('people')} Makamsız Devlet Adamları <small>${pool.length}</small></h4><div class="list">${pool.slice(0, 12).map((c) => UI.charRow(c, `${D.clsName[c.cls]} · en iyi: ${C.SKN[C.bestSkill(c)]} ${c.sk[C.bestSkill(c)]}`)).join('')}</div>`;
    h += `<button class="btn wide" data-act="newCands">${ic('plus')} Yeni adaylar getirt (500 bin)</button>`;
    const fallen = C.list((c) => c.role === 'devlet' && (c.exiled || c.prison));
    if (fallen.length) h += `<h4 class="sec">${ic('chain')} Sürgün ve Mahpuslar</h4><div class="list">${fallen.map((c) => UI.charRow(c)).join('')}</div>`;
    return h;
  }

  A.officeFill = (ds) => {
    const o = ds.o;
    const od = D.offices[o];
    UI.sheet({
      title: U.esc(od.n) + ' Ataması',
      render: () => {
        const cands = PH.Court.candidates(o);
        return `<p class="muted">${U.esc(od.d)}</p><div class="list">${cands.length ? cands.slice(0, 14).map((c) => `<button class="lrow" data-act="officeGo" data-o="${o}" data-id="${c.id}">${PH.Portrait.svg(c, 38)}<div><b>${U.esc(N(c))}</b><small>${C.SKN[od.key]} <b>${c.sk[od.key]}</b> · ${C.age(c)} yaş · ${U.esc(C.title(c))} · ${U.opWord(c.op)}</small></div></button>`).join('') : UI.empty('Uygun aday yok.')}</div>
          <button class="btn wide" data-act="newCands" data-cls="${od.cls}">${ic('plus')} Yeni adaylar getirt (500 bin)</button>`;
      },
    });
  };
  A.officeGo = (ds) => { const c = C.get(+ds.id); A.closeSheet(); UI.run('Atama', () => { PH.Court.appoint(ds.o, c); return `${N(c)} ${D.offices[ds.o].n} makamına getirildi.`; }, { icon: 'seal' }); };
  A.newCands = (ds) => {
    const s = PH.state;
    if (s.emp.treasury < 5e5) { UI.toast('Hazine yetersiz', 'bad'); return; }
    if ((s.cd.newCands || 0) > s.turn) { UI.toast('Bu ay zaten aday getirtildi.', 'bad'); return; }
    PH.FX.run(() => fx({ treasury: -5e5 }));
    s.cd.newCands = s.turn + 1;
    const cls = ds.cls || U.pick(['pasa', 'kalem', 'ulema', 'aga']);
    PH.Court.newCandidates(cls, 3);
    UI.toast('Üç yeni aday saraya çağrıldı.', 'ok');
    UI.refresh();
  };

  A.divanMeet = () => {
    const s = PH.state;
    if (s.vakit < 1) { UI.toast('Vakit yok', 'bad'); return; }
    const items = PH.Court.agenda();
    UI.sheet({
      title: 'Divan Gündemi',
      render: () => `<p class="muted">Kubbealtı'nda vezirler toplandı. Bugün hangi meseleyi görüşelim?</p><div class="list">${items.map((id) => { const d = PH.E.defs[id]; return `<button class="lrow" data-act="divanGo" data-e="${id}">${ic(d.icon)}<div><b>${U.esc(PH.E.val(d.title, s, {}).replace('Divan: ', ''))}</b><small>Meseleyi görüş</small></div>${ic('chev', 'chev')}</button>`; }).join('')}</div>`,
    });
  };
  A.divanGo = (ds) => {
    const s = PH.state;
    A.closeSheet();
    s.vakit -= 1;
    C.list((c) => c.office && D.offices[c.office].divan).forEach((c) => C.opinion(c, 1, true));
    PH.FX.run(() => fx({ stability: 1, idare: U.chance(0.1) ? 1 : 0 }));
    PH.E.pushFront(ds.e, {});
    UI.refresh();
    UI.flow();
  };

  /* ---------- Hazine ---------- */
  function treasury(s) {
    const b = Eco.budget();
    const e = s.emp;
    let h = `<div class="card tre"><div class="tre-top"><div><small>Hazine-i Âmire</small><div class="big ${e.treasury < 0 ? 'neg' : ''}">${U.money(e.treasury, true)}</div></div><div class="net ${b.net >= 0 ? 'pos' : 'neg'}"><small>Aylık net</small><b>${b.net >= 0 ? '+' : '−'}${U.money(Math.abs(b.net))}</b></div></div>
      ${e.debt ? `<div class="kv"><span>${ic('chain')} Borç</span><b class="neg">${U.money(e.debt, true)}</b></div>` : ''}
      <button class="btn ghost sm wide" data-act="statInfo" data-k="treasury">Gelir-gider dökümü</button></div>`;
    // vergi
    const cdTax = (s.cd.tax || 0) > s.turn;
    h += `<h4 class="sec">${ic('scale')} Vergi Oranı</h4><div class="card"><div class="taxrow">${D.taxLevels.map((t, i) => `<button class="${e.tax === i ? 'on' : ''}" data-act="setTax" data-i="${i}" ${cdTax && e.tax !== i ? 'disabled' : ''}><b>${t.n}</b><small>×${t.mul}</small></button>`).join('')}</div>
      <p class="muted small">${D.taxLevels[e.tax].n}: gelir ×${D.taxLevels[e.tax].mul}, halk etkisi ${U.signed(D.taxLevels[e.tax].pop)}, huzursuzluk ${U.signed(D.taxLevels[e.tax].unrest)}.${cdTax ? ' Vergi oranı yakın zamanda değişti; ' + ((s.cd.tax || 0) - s.turn) + ' ay bekleyin.' : ''}</p></div>`;
    // sikke
    h += `<h4 class="sec">${ic('coin')} Darphane (Akçe Ayarı)</h4><div class="card">${UI.statRow('Gümüş ayarı', e.purity, 100, { icon: 'coin', txt: '%' + Math.round(e.purity) })}
      <p class="muted small">Tağşiş, akçedeki gümüşü azaltarak hızlı para sağlar; ama enflasyona, ticaretin bozulmasına ve yeniçeri öfkesine yol açar.</p>
      <div class="mrow"><button class="btn warn" data-act="debase" ${e.purity <= 30 ? 'disabled' : ''}>Tağşiş yap</button><button class="btn" data-act="reform" ${e.purity >= 100 ? 'disabled' : ''}>Sikke ıslahı</button></div></div>`;
    // borç
    h += `<h4 class="sec">${ic('chain')} Galata Sarrafları</h4><div class="card"><p class="muted small">Borç alırsanız aylık %1,2 faiz ödenir. Alınan miktarın %8 fazlası borç yazılır.</p>
      <div class="mrow wrap">${[10e6, 25e6, 50e6].map((v) => `<button class="btn" data-act="borrow" data-v="${v}">${U.money(v)} al</button>`).join('')}</div>
      ${e.debt ? `<div class="mrow wrap"><button class="btn gold" data-act="repay" data-v="10000000" ${e.treasury < Math.min(10e6, e.debt) ? 'disabled' : ''}>10 Mn öde</button><button class="btn gold" data-act="repay" data-v="all" ${e.treasury < e.debt ? 'disabled' : ''}>Tamamını öde</button></div>` : ''}</div>`;
    // zenginler
    const rich = C.list((c) => c.role === 'devlet').sort((a, b) => b.wealth - a.wealth).slice(0, 5);
    h += `<h4 class="sec">${ic('bribe')} En Zengin Devlet Adamları</h4><div class="list">${rich.map((c) => UI.charRow(c, `${U.esc(C.title(c))} · ${U.money(c.wealth, true)}`)).join('')}</div>`;
    return h;
  }

  A.setTax = (ds) => {
    const s = PH.state;
    const i = +ds.i;
    if (i === s.emp.tax) return;
    const from = s.emp.tax;
    s.emp.tax = i;
    s.cd.tax = s.turn + 3;
    PH.FX.run(() => fx({ popularity: (from - i) * 2 }));
    PH.Turn.log(`Vergi oranı "${D.taxLevels[i].n}" olarak belirlendi.`, 'eco');
    UI.toast(`Vergi: ${D.taxLevels[i].n}`, 'ok');
    UI.refresh();
  };
  A.debase = () => {
    UI.confirm({ title: 'Tağşiş', text: 'Akçenin gümüş ayarı %10 düşürülecek. Hazineye büyük para girer; ama yeniçeriler ulufelerinin değer kaybetmesine öfkelenir, fiyatlar artar.', yes: 'Tağşiş Et', danger: true, onYes: () => UI.run('Tağşiş', () => {
      const s = PH.state;
      const amt = Math.round(Eco.budget().ti * 2.2);
      s.emp.purity = Math.max(30, s.emp.purity - 10);
      fx({ treasury: amt, janissary: -10, popularity: -4, corruption: 2 });
      PH.Turn.log('Akçede tağşiş yapıldı.', 'eco');
      if (s.emp.janissary < 25 && U.chance(0.5)) PH.E.push('yeniceri_isyan', {});
      return `Darphanede yeni akçeler basıldı. Hazineye ${U.money(amt, true)} girdi. Çarşıda fiyatlar şimdiden yükselmeye başladı.`;
    }, { icon: 'coin' }) });
  };
  A.reform = () => {
    const s = PH.state;
    const cost = Math.round(Eco.budget().ti * 2.5);
    if (s.emp.treasury < cost) { UI.toast(`Islah için ${U.money(cost)} gerekli`, 'bad'); return; }
    UI.confirm({ title: 'Sikke Islahı', text: `Ayarı %10 yükseltmek ${U.money(cost, true)} tutacak.`, yes: 'Islah Et', onYes: () => UI.run('Sikke Islahı', () => { s.emp.purity = Math.min(100, s.emp.purity + 10); fx({ treasury: -cost, janissary: 5, popularity: 3, prestige: 1 }); PH.Turn.log('Sikke ıslahı yapıldı.', 'eco'); return 'Yeni, tam ayarlı akçeler piyasaya sürüldü. Esnaf ve askerler memnun.'; }, { icon: 'coin' }) });
  };
  A.borrow = (ds) => { const v = +ds.v; UI.run('Borç', () => { fx({ treasury: v, debt: Math.round(v * 1.08), legitimacy: v >= 50e6 ? -2 : 0 }); PH.Turn.log(`Galata sarraflarından ${U.money(v)} borç alındı.`, 'eco'); return `Sarraflar ${U.money(v, true)} teslim etti. Borç defterine ${U.money(v * 1.08, true)} yazıldı.`; }, { icon: 'chain', toast: true }); };
  A.repay = (ds) => { const s = PH.state; const v = ds.v === 'all' ? s.emp.debt : Math.min(+ds.v, s.emp.debt); UI.run('Borç Ödemesi', () => { fx({ treasury: -v, debt: -v, prestige: v >= s.emp.debt ? 1 : 0 }); return `${U.money(v, true)} borç ödendi.`; }, { icon: 'chain', toast: true }); };

  /* ---------- Kanunlar ---------- */
  function laws(s) {
    let h = `<p class="muted">Kanunlar her ay etkisini sürdürür. İlan veya ilga ettikten sonra 6 ay değiştirilemez.</p><div class="list">`;
    D.lawOrder.forEach((id) => {
      const l = D.laws[id];
      if (s.era < l.era[0] || s.era > l.era[1]) return;
      const on = !!s.laws[id];
      const cd = (s.cd['law_' + id] || 0) > s.turn;
      h += `<div class="law ${on ? 'on' : ''}"><div class="law-top"><div><small>${l.cat}</small><b>${l.n}</b></div><button class="toggle ${on ? 'on' : ''}" data-act="lawToggle" data-id="${id}" ${cd ? 'disabled' : ''}><i></i></button></div><p>${U.esc(l.d)}</p>
        <div class="law-fx">${l.cost ? `<span class="fxchip neg">${ic('coin')}<b>−${U.money(l.cost)}</b>/ay</span>` : ''}${l.incMul ? `<span class="fxchip ${l.incMul > 1 ? 'pos' : 'neg'}">Vergi ×${l.incMul}</span>` : ''}${l.tradeMul ? `<span class="fxchip ${l.tradeMul > 1 ? 'pos' : 'neg'}">Ticaret ×${l.tradeMul}</span>` : ''}${PH.FX.preview(l.m).replace('<div class="fxchips">', '').replace(/<\/div>$/, '')}</div>
        ${cd ? `<small class="muted">${(s.cd['law_' + id] || 0) - s.turn} ay değiştirilemez</small>` : ''}</div>`;
    });
    h += `</div><h4 class="sec">${ic('seal')} Fermanlar</h4><p class="muted">Tek seferlik padişah emirleri.</p><div class="list">`;
    DECREES.forEach((d) => {
      const cd = (s.cd['dec_' + d.id] || 0) > s.turn;
      const poor = d.cost && s.emp.treasury < d.cost;
      h += `<button class="lrow" data-act="decree" data-id="${d.id}" ${cd || poor ? 'disabled' : ''}>${ic(d.icon)}<div><b>${d.n}</b><small>${U.esc(d.d)}${d.cost ? ' · ' + U.money(d.cost, true) : ''}${cd ? ` · ${(s.cd['dec_' + d.id] || 0) - s.turn} ay sonra` : ''}</small></div>${ic('chev', 'chev')}</button>`;
    });
    h += `</div>`;
    h += `<h4 class="sec">${ic('crown')} Veraset Usulü</h4><div class="card"><div class="taxrow three">${Object.keys(PH.Harem.SUCC_N).map((k) => `<button class="${s.dynasty.succession === k ? 'on' : ''}" data-act="setSucc" data-k="${k}"><b>${PH.Harem.SUCC_N[k].split(' (')[0]}</b><small>${PH.Harem.SUCC_N[k].includes('(') ? PH.Harem.SUCC_N[k].split('(')[1].replace(')', '') : 'veliaht'}</small></button>`).join('')}</div>${(() => { const h2 = PH.Harem.ruleHeir(); return `<p class="muted small">Şu anki varis: <b>${h2 ? U.esc(N(h2)) : 'yok!'}</b></p>`; })()}</div>`;
    return h;
  }
  A.lawToggle = (ds) => {
    const s = PH.state;
    const l = D.laws[ds.id];
    UI.confirm({ title: l.n, text: s.laws[ds.id] ? 'Bu kanun ilga edilsin mi?' : 'Bu kanun ilan edilsin mi?\n\n' + l.d, yes: s.laws[ds.id] ? 'İlga Et' : 'İlan Et', onYes: () => UI.run(l.n, () => { Eco.toggleLaw(ds.id); return s.laws[ds.id] ? `${l.n} ilan edildi. Tellallar fermanı şehir şehir okuyor.` : `${l.n} ilga edildi.`; }, { icon: 'scroll' }) });
  };
  A.decree = (ds) => {
    const d = DECREES.find((x) => x.id === ds.id);
    UI.confirm({ title: d.n, text: d.d, yes: 'Ferman Yazılsın', onYes: () => UI.run(d.n, () => { const s = PH.state; s.cd['dec_' + d.id] = s.turn + d.cd; PH.Turn.log(`Ferman: ${d.n}`, 'law'); return d.run(s); }, { icon: d.icon }) });
  };
  A.setSucc = (ds) => {
    const s = PH.state;
    if (s.dynasty.succession === ds.k) return;
    UI.confirm({ title: 'Veraset Usulü', text: `Veraset usulü "${PH.Harem.SUCC_N[ds.k]}" olarak değiştirilsin mi? Ulema ve hanedan mensupları bu değişikliği tartışacak.`, yes: 'Değiştir', onYes: () => UI.run('Veraset', () => { s.dynasty.succession = ds.k; fx({ legitimacy: -3, stability: -2 }); if (ds.k !== 'tayin') s.dynasty.heirId = null; PH.Turn.log(`Veraset usulü değişti: ${PH.Harem.SUCC_N[ds.k]}`, 'dyn'); return 'Yeni veraset kanunu ilan edildi.'; }, { icon: 'crown' }) });
  };

  /* ---------- İnşaat ---------- */
  function building(s) {
    let h = '';
    if (s.projects.length) {
      h += `<h4 class="sec">${ic('hammer')} Süren İnşaatlar</h4><div class="list">${s.projects.map((p) => `<div class="proj"><div class="proj-top">${ic(D.buildings[p.type].icon)}<div><b>${U.esc(p.name)}</b><small>${D.prov[p.prov].n} · ${p.left} ay kaldı</small></div><button class="btn sm" data-act="rush" data-id="${p.id}" ${p.left <= 1 ? 'disabled' : ''}>Hızlandır</button></div>${U.bar(p.total - p.left, p.total, 'gold')}</div>`).join('')}</div>`;
    }
    h += `<h4 class="sec">${ic('plus')} Yeni Yapı ${s.flags.mimarUntil > s.turn ? `<small>Mimarbaşı ${U.esc(s.flags.mimar || '')}: %20 indirim</small>` : ''}</h4><div class="bgrid">`;
    D.buildingOrder.forEach((t) => {
      const b = D.buildings[t];
      h += `<button class="bcard" data-act="buildPick" data-t="${t}">${ic(b.icon)}<b>${b.n}</b><small>${U.money(Eco.buildCost(t))} · ${b.m} ay</small></button>`;
    });
    h += `</div>`;
    if (s.built.length) {
      const by = {};
      s.built.forEach((b) => { (by[b.type] = by[b.type] || []).push(b); });
      h += `<h4 class="sec">${ic('mosque')} Eserleriniz ve Ecdadınızın Eserleri <small>${s.built.length}</small></h4><div class="card">${Object.keys(by).map((t) => `<div class="kv"><span>${ic(D.buildings[t].icon)} ${D.buildings[t].n}</span><b>${by[t].length}</b></div>`).join('')}</div>`;
    }
    return h;
  }
  A.buildPick = (ds) => {
    const t = ds.t;
    const b = D.buildings[t];
    UI.sheet({
      title: U.esc(b.n),
      render: () => {
        const s = PH.state;
        const provs = Eco.ownProvs(s).filter((p) => !p.vassal).sort((a, b2) => (a.id === s.capital ? -1 : b2.id === s.capital ? 1 : D.prov[b2.id].inc - D.prov[a.id].inc));
        const fxp = PH.FX.preview(b.fx);
        const extra = [b.trade ? `Ticaret +${U.money(b.trade)}/ay` : '', b.unrest ? `Huzursuzluk ${b.unrest}` : '', b.dev ? `Gelişmişlik +${b.dev}` : '', b.fort ? 'Kale +1' : '', b.food ? 'Zahire +/ay' : '', b.up ? `Bakım ${U.money(b.up)}/ay` : ''].filter(Boolean).join(' · ');
        return `<p class="muted">${U.esc(b.d)}</p><div class="card"><div class="kv"><span>Maliyet</span><b>${U.money(Eco.buildCost(t), true)}</b></div><div class="kv"><span>Süre</span><b>${b.m} ay</b></div><p class="muted small">${extra}</p>${fxp}</div>
          <h4 class="sec">Nereye inşa edilsin?</h4><div class="list">${provs.map((p) => { const why = Eco.canBuild(t, p.id); return `<button class="lrow" data-act="buildGo" data-t="${t}" data-p="${p.id}" ${why ? 'disabled' : ''}>${ic('map')}<div><b>${D.prov[p.id].n}${p.id === s.capital ? ' (Payitaht)' : ''}</b><small>${why ? U.esc(why) : `Gelişmişlik ${p.dev} · ${p.bld.length} yapı`}</small></div></button>`; }).join('')}</div>`;
      },
    });
  };
  A.buildGo = (ds) => {
    const t = ds.t, p = ds.p;
    const s = PH.state;
    const b = D.buildings[t];
    const defName = t === 'cami' ? `Sultan ${C.sultan().name} Camii` : `${D.prov[p].n} ${b.n}`;
    UI.prompt({
      title: 'Esere ad verin', label: 'Yapının adı', value: defName, max: 40,
      onOk: (v) => { UI.closeAllSheets(); UI.run(b.n, () => { Eco.startBuilding(t, p, (v || '').trim() || defName); fx({ prestige: t === 'cami' ? 2 : 0 }); return `${(v || defName)} için temel atma töreni yapıldı. Kurbanlar kesildi, dualar edildi. ${b.m} ay sonra tamamlanacak.`; }, { icon: b.icon }); },
    });
  };
  A.rush = (ds) => {
    const s = PH.state;
    const p = s.projects.find((x) => x.id === ds.id);
    if (!p) return;
    const cost = Math.round(p.cost * 0.12);
    if (s.emp.treasury < cost) { UI.toast(`Hızlandırmak için ${U.money(cost)} gerekli`, 'bad'); return; }
    UI.confirm({ title: 'İnşaatı hızlandır', text: `${U.money(cost, true)} ek ödemeyle inşaat 2 ay erken bitecek.`, yes: 'Öde', onYes: () => { PH.FX.run(() => fx({ treasury: -cost })); p.left = Math.max(1, p.left - 2); UI.refresh(); UI.toast('İşçi sayısı iki katına çıkarıldı.', 'ok'); } });
  };
})();
