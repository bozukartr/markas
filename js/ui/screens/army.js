/* Padişah Hayatı — Ordu ve sefer ekranı */
(function () {
  const U = PH.U, D = PH.D, C = PH.C, UI = PH.UI, A = PH.A, M = PH.Mil, St = PH.St;
  const ic = PH.ic;
  const fx = PH.fx;
  const N = (c) => C.name(c);

  const UNIT_INFO = {
    jan: { icon: 'jan', d: 'Kapıkulu piyadesi; ordunun bel kemiği. Pahalı ama güçlü. Siyasi olarak tehlikeli.', step: 1000 },
    sip: { icon: 'horse', d: 'Tımar sahibi atlı askerler. Ucuz, kalabalık; taşradan gelir.', step: 2000 },
    azap: { icon: 'people', d: 'Hafif piyade ve akıncılar. Ucuz, zayıf; pusu taktiğinde etkili.', step: 2000 },
    nizam: { icon: 'shield', d: 'Avrupa usulü talimli modern piyade. Çok güçlü ama pahalı; yeniçeriler nefret eder.', step: 1000, req: (s) => (s.laws.nizam ? true : 'Nizam-ı Cedid kanunu gerekli') },
    cannons: { icon: 'cannon', d: 'Kuşatmaların anahtarı. Tophane maliyeti düşürür.', step: 10 },
    ships: { icon: 'ship', d: 'Kadırga ve kalyonlar. Ada seferleri ve deniz savaşları için.', step: 5 },
  };

  UI.screens.army = {
    render() {
      const sub = UI.cur('army', 'ordu');
      const s = PH.state;
      let h = UI.seg('army', [['ordu', 'Ordu'], ['sefer', 'Sefer', s.campaign ? '⚔' : ''], ['savas', 'Savaşlar', Object.values(s.nations).filter((n) => n.war).length || '']]);
      if (sub === 'ordu') h += army(s);
      if (sub === 'sefer') h += campaign(s);
      if (sub === 'savas') h += wars(s);
      return h;
    },
  };

  function army(s) {
    const a = s.army;
    const home = M.home();
    const pow = M.power(a);
    const up = PH.Eco.UPKEEP;
    let h = `<div class="card armysum"><div><small>Toplam savaş gücü</small><div class="big">${U.num(pow)}</div></div><div><small>Asker</small><b>${U.num(M.totalMen(a))}</b></div><div><small>Aylık ulufe</small><b class="neg">${U.money(PH.Eco.budget().exp.ordu)}</b></div></div>
      <div class="card">${UI.statRow('Moral', a.morale, 100, { icon: 'flag' })}${UI.statRow('Talim', a.training, 100, { icon: 'shield' })}${UI.statRow('Yeniçeri sadakati', s.emp.janissary, 100, { icon: 'jan' })}
      <p class="muted small">Yeniçeri kalitesi: ×${M.janQ().toFixed(2).replace('.', ',')} (dönem ve talime bağlı)</p></div>`;
    h += `<h4 class="sec">${ic('people')} Kuvvetler</h4><div class="list">`;
    ['jan', 'sip', 'azap', 'nizam', 'cannons', 'ships'].forEach((k) => {
      const inf = UNIT_INFO[k];
      if (k === 'nizam' && !s.laws.nizam && !a.nizam) return;
      const away = k !== 'ships' && s.campaign ? s.campaign.forces[k] || 0 : 0;
      h += `<button class="lrow" data-act="unit" data-k="${k}">${ic(inf.icon)}<div><b>${M.UNIT_N[k]} <span class="num">${U.num(a[k])}</span></b><small>${away ? `${U.num(away)} seferde · ` : ''}bakım ${U.money(a[k] * up[k])}/ay</small></div>${ic('chev', 'chev')}</button>`;
    });
    h += `</div>`;
    const cdT = (s.cd.drill || 0) > s.turn, cdB = (s.cd.bahsis || 0) > s.turn;
    h += `<h4 class="sec">${ic('gear')} Ordu İşleri</h4><div class="agrid">
      <button class="abtn" data-act="drill" ${cdT ? 'disabled' : ''}>${ic('shield')}<span>Büyük Talim</span><small>${cdT ? 'yakında' : '2 Mn · talim +10'}</small></button>
      <button class="abtn" data-act="bahsis" ${cdB ? 'disabled' : ''}>${ic('coin')}<span>Bahşiş Dağıt</span><small>${cdB ? 'yakında' : U.money(Math.round((a.jan + a.nizam) * 300)) + ' · sadakat +8'}</small></button>
      <button class="abtn" data-act="yoklama">${ic('scroll')}<span>Esame Yoklaması</span><small>sahte kayıtları temizle</small></button>
      <button class="abtn" data-act="tab" data-t="army" data-s="sefer">${ic('tent')}<span>Sefer Planla</span><small>${Object.values(s.nations).some((n) => n.war) ? 'hazır' : 'savaş yok'}</small></button>
    </div>`;
    const cmds = M.commanders().filter((c) => c.id !== s.sultanId).slice(0, 6);
    h += `<h4 class="sec">${ic('sword')} Komutanlar</h4><div class="list">${cmds.map((c) => UI.charRow(c, `${U.esc(C.title(c))} · Askerlik <b>${c.sk.askeri}</b>`)).join('')}</div>`;
    return h;
  }

  A.unit = (ds) => {
    const k = ds.k;
    const inf = UNIT_INFO[k];
    UI.sheet({
      title: M.UNIT_N[k],
      render: () => {
        const s = PH.state;
        const r = inf.req ? inf.req(s) : true;
        const steps = [inf.step, inf.step * 5];
        const home = k === 'ships' ? s.army.ships : M.home()[k];
        return `<p class="muted">${U.esc(inf.d)}</p><div class="card"><div class="kv"><span>Mevcut</span><b>${U.num(s.army[k])}</b></div><div class="kv"><span>Payitahtta</span><b>${U.num(home)}</b></div><div class="kv"><span>Bakım (birim)</span><b>${U.money(PH.Eco.UPKEEP[k])}/ay</b></div><div class="kv"><span>Toplama (birim)</span><b>${U.money(M.recruitCost(k, 1))}</b></div></div>
          ${r !== true ? `<div class="alert">${ic('lock')} ${U.esc(r)}</div>` : `<h4 class="sec">Asker Topla</h4><div class="mrow wrap">${steps.map((n) => { const c = M.recruitCost(k, n); return `<button class="btn gold" data-act="recruit" data-k="${k}" data-n="${n}" ${s.emp.treasury < c ? 'disabled' : ''}>+${U.num(n)}<small>${U.money(c)}</small></button>`; }).join('')}</div>`}
          <h4 class="sec">Terhis Et</h4><div class="mrow wrap">${steps.map((n) => `<button class="btn warn" data-act="disband" data-k="${k}" data-n="${n}" ${home < n ? 'disabled' : ''}>−${U.num(n)}</button>`).join('')}</div>
          ${k === 'jan' ? '<p class="muted small">Yeniçeri terhisi ocağı kızdırır.</p>' : ''}${k === 'jan' && s.laws.devsirme ? '<p class="muted small">Devşirme kanunu her yıl ocağa acemi katıyor.</p>' : ''}`;
      },
    });
  };
  A.recruit = (ds) => { const n = +ds.n; UI.run('Asker', () => { M.recruit(ds.k, n); return `${U.num(n)} ${M.UNIT_N[ds.k]} saflara katıldı.`; }, { toast: true }); };
  A.disband = (ds) => { const n = +ds.n; UI.run('Terhis', () => { const x = M.disband(ds.k, n); return `${U.num(x)} ${M.UNIT_N[ds.k]} terhis edildi.`; }, { toast: true }); };
  A.drill = () => { const s = PH.state; if (s.emp.treasury < 2e6) { UI.toast('Hazine yetersiz', 'bad'); return; } s.cd.drill = s.turn + 4; UI.run('Büyük Talim', () => { fx({ treasury: -2e6, training: 10, morale: 3, janissary: -1 }); return 'Kağıthane sırtlarında büyük bir talim yapıldı. Toplar atıldı, sipahiler hücum provaları yaptı.'; }, { icon: 'shield' }); };
  A.bahsis = () => { const s = PH.state; const c = Math.round((s.army.jan + s.army.nizam) * 300); if (s.emp.treasury < c) { UI.toast('Hazine yetersiz', 'bad'); return; } s.cd.bahsis = s.turn + 6; UI.run('Bahşiş', () => { fx({ treasury: -c, janissary: 8, morale: 4 }); return 'Ocak ağaları bahşiş keselerini aldı.'; }, { icon: 'coin' }); };
  A.yoklama = () => {
    UI.confirm({ title: 'Esame Yoklaması', text: 'Yeniçeri esame defterlerindeki ölü ve sahte kayıtlar silinecek. Masraf düşer; ama ocak ağaları kazançlarını kaybeder.', yes: 'Yoklama Yap', onYes: () => UI.run('Yoklama', () => {
      const s = PH.state;
      const fake = Math.round(s.army.jan * U.rf(0.04, 0.04 + s.era * 0.05));
      fx({ jan: -fake, janissary: -Math.min(15, Math.round(fake / 600)), corruption: -2 });
      s.cd.yoklama = s.turn + 24;
      return `Yoklamada ${U.num(fake)} sahte kayıt bulundu ve silindi.`;
    }, { icon: 'scroll' }) });
  };

  /* ---------- Sefer ---------- */
  function campaign(s) {
    const cp = s.campaign;
    if (cp) {
      const p = s.provs[cp.target];
      const cmd = M.cmd();
      const phase = { march: 'Yolda', battle: 'Meydan muharebesi', siege: 'Kuşatma', return: 'Dönüş yolunda' }[cp.phase];
      let h = `<div class="card campaign"><div class="cmp-top">${PH.Portrait.nationBadge(cp.nation, 44)}<div><small>${PH.Dip.name(cp.nation)}</small><h3>${D.prov[cp.target].n} Seferi</h3><span class="pill">${phase}</span></div></div>
        <div class="kv"><span>Serdar</span><b>${cmd ? U.esc(N(cmd)) : '—'}</b></div>
        <div class="kv"><span>Kuvvet</span><b>${U.num(M.totalMen(cp.forces))} asker · ${cp.forces.cannons} top</b></div>
        <div class="kv"><span>Güç</span><b>${U.num(M.campaignPower())}</b></div>
        <div class="kv"><span>Süre</span><b>${cp.months} ay</b></div>
        ${cp.phase === 'march' || cp.phase === 'return' ? `<div class="kv"><span>Kalan yol</span><b>${cp.left} ay</b></div>` : ''}
        ${cp.phase === 'siege' ? `<div class="kv"><span>Kale</span><b>Seviye ${p.fort}</b></div>${U.bar(cp.siege, 100, 'gold')}<p class="muted small">Muhasara %${Math.round(cp.siege)}</p>` : ''}
        ${U.isWinter(s.month) ? `<div class="alert">${ic('drop')} Kış! Ordu her ay ciddi kayıp veriyor.</div>` : ''}
        ${cp.phase !== 'return' ? `<button class="btn warn wide" data-act="recallArmy">Orduyu geri çağır</button>` : ''}</div>`;
      return h;
    }
    const enemies = Object.values(s.nations).filter((n) => n.war);
    if (!enemies.length) return `<div class="empty">${ic('handshake')}<br>Şu an hiçbir devletle savaşta değilsiniz.<br><small>Sefer düzenlemek için önce Dünya ekranından savaş ilan edin.</small></div><button class="btn wide" data-act="tab" data-t="world">${ic('globe')} Dünya ekranına git</button>`;
    let h = `<button class="bigbtn" data-act="planStart">${ic('tent')}<div><b>Sefer-i Hümâyun Düzenle</b><small>Hedef seç, orduyu ayarla, serdar tayin et</small></div>${ic('chev', 'chev')}</button>`;
    h += `<p class="muted">Seferler aylarca sürer. Kış aylarında (Kasım–Şubat) ordu ağır kayıp verir; seferleri bahar başında başlatmak gelenektir.</p>`;
    return h + wars(s);
  }

  A.recallArmy = () => UI.confirm({ title: 'Ordunun dönüşü', text: 'Sefer yarıda kesilecek; şöhret ve moral kaybı olur.', yes: 'Geri Çağır', onYes: () => UI.run('Sefer', () => { M.abortSiege(); return 'Otağ-ı hümâyun söküldü; ordu geri dönüyor.'; }, { icon: 'tent' }) });

  A.planStart = () => {
    const s = PH.state;
    UI._plan = { n: null, p: null, f: { jan: 70, sip: 70, azap: 70, nizam: 70, cannons: 70 }, cmd: null };
    UI.sheet({ title: 'Sefer Planı', cls: 'plan', render: planRender });
  };

  function planRender() {
    const s = PH.state;
    const P = UI._plan;
    const enemies = Object.values(s.nations).filter((n) => n.war);
    let h = `<h4 class="sec">1. Düşman</h4><div class="chips">${enemies.map((n) => `<button class="chip ${P.n === n.id ? 'on' : ''}" data-act="planN" data-id="${n.id}">${PH.Dip.short(n.id)}</button>`).join('')}</div>`;
    if (!P.n) return h;
    const targets = M.targets(P.n).sort((a, b) => M.distance(a.id) - M.distance(b.id));
    h += `<h4 class="sec">2. Hedef</h4><div class="list">${targets.map((p) => { const pd = D.prov[p.id]; return `<button class="lrow ${P.p === p.id ? 'sel' : ''}" data-act="planP" data-id="${p.id}">${ic(pd.island ? 'ship' : 'castle')}<div><b>${pd.n}${pd.cap === P.n ? ' ★' : ''}</b><small>${M.distance(p.id)} ay yol · kale ${p.fort}${pd.island ? ' · ada (40+ gemi)' : ''} · gelir ${U.money(pd.inc * 1000)}</small></div></button>`; }).join('')}</div>`;
    if (!P.p) return h;
    const home = M.home();
    h += `<h4 class="sec">3. Kuvvetler <small>payitahttakilerin yüzdesi</small></h4><div class="card">`;
    ['jan', 'sip', 'azap', 'nizam', 'cannons'].forEach((k) => {
      if (!home[k]) return;
      h += `<div class="slider"><label>${M.UNIT_N[k]} <b id="pl-${k}">${U.num(Math.round(home[k] * P.f[k] / 100))}</b></label><input type="range" min="0" max="100" step="5" value="${P.f[k]}" data-input="planSlide" data-k="${k}"></div>`;
    });
    h += `</div>`;
    const cmds = M.commanders();
    if (!P.cmd) P.cmd = cmds[1] ? cmds[1].id : cmds[0].id;
    h += `<h4 class="sec">4. Serdar</h4><div class="list">${cmds.map((c) => `<button class="lrow ${P.cmd === c.id ? 'sel' : ''}" data-act="planCmd" data-id="${c.id}">${PH.Portrait.svg(c, 34)}<div><b>${U.esc(N(c))}</b><small>${c.id === s.sultanId ? 'Bizzat padişah · şöhret ve moral artar, risk de' : U.esc(C.title(c))} · Askerlik ${c.sk.askeri}</small></div></button>`).join('')}</div>`;
    h += `<div class="card" id="plan-sum">${planSummary()}</div><button class="btn gold wide" data-act="planGo">${ic('flag')} Sefere Çık</button>`;
    return h;
  }

  UI._planRender = planRender;

  function planForces() {
    const P = UI._plan;
    const home = M.home();
    const f = {};
    ['jan', 'sip', 'azap', 'nizam', 'cannons'].forEach((k) => (f[k] = Math.round((home[k] || 0) * P.f[k] / 100)));
    return f;
  }
  function planSummary() {
    const s = PH.state;
    const P = UI._plan;
    const f = planForces();
    const cmd = C.get(P.cmd);
    const pow = Math.round(M.power(f) * (1 + (cmd ? cmd.sk.askeri : 3) * 0.025));
    const n = s.nations[P.n];
    const est = PH.Dip.strEstimate(n);
    const field = est.v * 0.7;
    const err = M.canCampaign(P.p, f);
    const left = M.power(M.home()) - M.power(f);
    return `<div class="kv"><span>Sefer gücü</span><b>${U.num(pow)}</b></div><div class="kv"><span>Düşman sahra ordusu (tahmin${est.exact ? ', kesin istihbarat' : ''})</span><b>~${U.num(Math.round(field / 1000) * 1000)}</b></div><div class="kv"><span>Değerlendirme</span><b>${M.strWord(pow / Math.max(1, field))}</b></div><div class="kv"><span>Payitahtta kalan güç</span><b>${U.num(Math.max(0, left))}</b></div><div class="kv"><span>Ek sefer masrafı</span><b class="neg">~${U.money(PH.Eco.UPKEEP.jan * f.jan * 0.45 + 250000)}/ay</b></div>${err ? `<div class="alert">${ic('alert')} ${U.esc(err)}</div>` : ''}`;
  }

  A.planN = (ds) => { UI._plan.n = ds.id; UI._plan.p = null; UI.topSheet().refresh(); };
  A.planP = (ds) => { UI._plan.p = ds.id; UI.topSheet().refresh(); };
  A.planCmd = (ds) => { UI._plan.cmd = +ds.id; UI.topSheet().refresh(); };
  A.planSlide = (ds, el) => {
    UI._plan.f[ds.k] = +el.value;
    const home = M.home();
    const lab = document.getElementById('pl-' + ds.k);
    if (lab) lab.textContent = U.num(Math.round(home[ds.k] * (+el.value) / 100));
    const sum = document.getElementById('plan-sum');
    if (sum) sum.innerHTML = planSummary();
  };
  A.planGo = () => {
    const P = UI._plan;
    const f = planForces();
    const err = M.canCampaign(P.p, f);
    if (err) { UI.toast(U.esc(err), 'bad'); return; }
    A.closeSheet();
    UI.sub.army = 'sefer';
    UI.run('Sefer-i Hümâyun', () => { M.startCampaign(P.p, f, P.cmd); return `Tuğlar Üsküdar'a (ya da Davutpaşa'ya) dikildi. Ordu-yı hümâyun ${D.prov[P.p].n} üzerine yürüyor. Yol ${M.distance(P.p)} ay sürecek.`; }, { icon: 'flag' });
  };

  /* ---------- Savaşlar ---------- */
  function wars(s) {
    const ws = Object.values(s.nations).filter((n) => n.war);
    if (!ws.length) return '';
    return `<h4 class="sec">${ic('sword')} Süren Savaşlar</h4><div class="list">${ws.map((n) => `<button class="lrow" data-act="nation" data-id="${n.id}">${PH.Portrait.nationBadge(n.id, 34)}<div><b>${PH.Dip.name(n.id)}</b><small>Savaş skoru ${Math.round(n.ws)} · düşman yorgunluğu ${Math.round(n.weary)} · ${M.targets(n.id).length} eyalet</small>${U.bar(n.ws + 100, 200)}</div>${ic('chev', 'chev')}</button>`).join('')}</div>`;
  }
})();
