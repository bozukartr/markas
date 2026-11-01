/* Padişah Hayatı — Dünya ekranı: devletler, eyaletler, harita */
(function () {
  const U = PH.U, D = PH.D, C = PH.C, UI = PH.UI, A = PH.A, Dp = PH.Dip, M = PH.Mil;
  const ic = PH.ic;
  const fx = PH.fx;
  const N = (c) => C.name(c);

  /* Şematik harita koordinatları (enlem, boylam) */
  const GEO = {
    istanbul: [41.0, 29.0], edirne: [41.7, 26.6], bursa: [40.2, 29.1], selanik: [40.6, 22.9], mora: [37.5, 22.4], egriboz: [38.5, 23.8], arnavutluk: [41.3, 19.8], bosna: [43.9, 18.4], semendire: [44.2, 21.4], belgrad: [44.9, 20.4], budin: [47.5, 19.0], temesvar: [45.8, 21.2], erdel: [46.8, 23.6], hirvatistan: [45.8, 16.0], viyana: [48.2, 16.4], prag: [50.1, 14.4], eflak: [44.4, 26.1], bogdan: [47.2, 27.6], kirim: [45.0, 34.1], azak: [47.1, 39.4], kamanice: [48.7, 26.6], lviv: [49.8, 24.0], krakov: [50.1, 19.9], kiev: [50.4, 30.5], moskova: [55.2, 37.6], ankara: [39.9, 32.9], kastamonu: [41.4, 33.8], konya: [37.9, 32.5], sivas: [39.7, 37.0], trabzon: [41.0, 39.7], maras: [37.6, 36.9], diyarbekir: [37.9, 40.2], erzurum: [39.9, 41.3], van: [38.5, 43.4], musul: [36.3, 43.1], bagdat: [33.3, 44.4], basra: [30.5, 47.8], halep: [36.2, 37.2], sam: [33.5, 36.3], kudus: [31.8, 35.2], misir: [30.0, 31.2], hicaz: [21.4, 39.8], yemen: [15.4, 44.2], trablusgarp: [32.9, 13.2], tunus: [36.8, 10.2], cezayir: [36.7, 3.1], kibris: [35.1, 33.4], girit: [35.2, 24.9], rodos: [36.4, 28.2], malta: [35.9, 14.4], dalmacya: [43.5, 16.4], venedik: [45.4, 12.3], napoli: [40.8, 14.3], sicilya: [37.6, 14.0], marsilya: [43.3, 5.4], paris: [48.9, 2.35], tiflis: [41.7, 44.8], revan: [40.2, 44.5], sirvan: [40.4, 49.0], tebriz: [38.1, 46.3], isfahan: [32.7, 51.7],
  };
  const OSM_COLOR = '#d63a2f';
  const xy = (id) => { const g = GEO[id] || [40, 30]; return [Math.round(g[1] * 10 + 12), Math.round((56.5 - g[0]) * 10)]; };

  UI.screens.world = {
    render() {
      const sub = UI.cur('world', 'devlet');
      const s = PH.state;
      let h = UI.seg('world', [['devlet', 'Devletler', Object.values(s.nations).filter((n) => n.war).length || ''], ['eyalet', 'Eyaletler', PH.Eco.ownProvs(s).filter((p) => p.rebel).length || ''], ['harita', 'Harita']]);
      if (sub === 'devlet') h += nations(s);
      if (sub === 'eyalet') h += provinces(s);
      if (sub === 'harita') h += map(s);
      return h;
    },
  };

  function relClass(r) { return r >= 25 ? 'good' : r >= -10 ? 'mid' : r >= -40 ? 'warn' : 'bad'; }

  function nations(s) {
    const our = Dp.ourPower();
    const list = Dp.alive().sort((a, b) => (b.war - a.war) || (a.rel - b.rel));
    let h = `<div class="card"><div class="kv"><span>${ic('sword')} Ordumuzun gücü</span><b>${U.num(our)}</b></div><div class="kv"><span>${ic('star')} Şöhret</span><b>${Math.round(s.emp.prestige)}</b></div></div><div class="list">`;
    list.forEach((n) => {
      const est = Dp.strEstimate(n);
      const tags = [n.war ? '<span class="tag bad">Savaş</span>' : '', n.ally ? '<span class="tag good">Müttefik</span>' : '', n.truce > s.turn && !n.war ? '<span class="tag">Ahitname</span>' : '', n.tribute > 0 ? '<span class="tag gold">Haraçgüzar</span>' : '', n.tribute < 0 ? '<span class="tag warn">Haraç ödüyoruz</span>' : '', n.trade ? '<span class="tag">Ticaret</span>' : ''].join('');
      h += `<button class="lrow nrow" data-act="nation" data-id="${n.id}">${PH.Portrait.nationBadge(n.id, 40)}<div><b>${Dp.name(n.id)}</b><small>${D.nations[n.id].t} ${U.esc(n.ruler)} · ${D.nations[n.id].din} · gücümüz: ${M.strWord(our / Math.max(1, est.v)).toLowerCase()}</small><div class="tags">${tags}</div>${U.bar(n.rel + 100, 200, relClass(n.rel))}</div>${ic('chev', 'chev')}</button>`;
    });
    h += `</div>`;
    const dead = Object.values(s.nations).filter((n) => n.dead);
    if (dead.length) h += `<p class="muted small">Tarihe karışan devletler: ${dead.map((n) => Dp.short(n.id)).join(', ')}</p>`;
    return h;
  }

  function provinces(s) {
    const own = PH.Eco.ownProvs(s);
    const by = {};
    own.forEach((p) => { const r = D.prov[p.id].reg; (by[r] = by[r] || []).push(p); });
    let h = `<div class="card"><div class="kv"><span>${ic('map')} Eyalet sayısı</span><b>${own.length}</b></div><div class="kv"><span>${ic('alert')} Ortalama huzursuzluk</span><b>%${Math.round(U.avg(own.filter((p) => !p.vassal), (p) => p.unrest))}</b></div></div>`;
    D.regions.forEach((r) => {
      if (!by[r]) return;
      h += `<h4 class="sec">${r} <small>${by[r].length}</small></h4><div class="list">${by[r].sort((a, b) => b.unrest - a.unrest).map((p) => {
        const pd = D.prov[p.id];
        const g = C.get(p.gov);
        const inc = PH.Eco.provIncome(p);
        return `<button class="lrow prow ${p.rebel ? 'rebel' : ''}" data-act="prov" data-id="${p.id}">${ic(p.id === s.capital ? 'crown' : p.vassal ? 'handshake' : pd.island ? 'ship' : 'castle')}<div><b>${pd.n}${p.id === s.capital ? ' · Payitaht' : ''}${p.rebel ? ' · İSYAN' : ''}${p.vassal ? ' · Vasal' : ''}</b><small>${U.money(inc)}/ay · gelişmişlik ${p.dev} · kale ${p.fort}${p.vassal ? '' : ' · ' + (g ? U.esc(N(g)) : 'valisiz')}${p.exempt > s.turn ? ' · muaf' : ''}</small>${p.vassal ? '' : U.bar(100 - p.unrest, 100)}</div>${ic('chev', 'chev')}</button>`;
      }).join('')}</div>`;
    });
    return h;
  }

  function map(s) {
    const provs = Object.values(s.provs);
    const dots = provs.map((p) => {
      const [x, y] = xy(p.id);
      const pd = D.prov[p.id];
      const col = p.owner === 'osm' ? OSM_COLOR : (D.nations[p.owner] ? D.nations[p.owner].color : '#777');
      const atWar = p.owner !== 'osm' && s.nations[p.owner] && s.nations[p.owner].war;
      const target = s.campaign && s.campaign.target === p.id;
      return `<g class="mp ${p.rebel ? 'reb' : ''}" data-act="prov" data-id="${p.id}"><circle cx="${x}" cy="${y}" r="${pd.cap || p.id === s.capital ? 8 : 6}" fill="${col}" stroke="${atWar ? '#ff5a4a' : target ? '#f0d27a' : p.owner === 'osm' ? '#f0d27a' : 'rgba(255,255,255,.45)'}" stroke-width="${atWar || target ? 2.6 : p.owner === 'osm' ? 1.4 : 1}"/>${p.id === s.capital ? `<circle cx="${x}" cy="${y}" r="2.5" fill="#f0d27a"/>` : ''}<text x="${x}" y="${y - 10}" text-anchor="middle">${pd.n}</text></g>`;
    }).join('');
    const legend = [['osm', 'Osmanlı', OSM_COLOR]].concat(Dp.alive().map((n) => [n.id, Dp.short(n.id), D.nations[n.id].color]));
    return `<div class="maptools"><button class="chip ${UI._mapZoom ? 'on' : ''}" data-act="mapZoom">${ic(UI._mapZoom ? 'minus' : 'plus')} ${UI._mapZoom ? 'Uzaklaştır' : 'Yakınlaştır'}</button></div><div class="mapwrap ${UI._mapZoom ? 'zoom' : ''}"><svg class="map" viewBox="0 0 560 430" aria-label="Şematik harita">
      <defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="rgba(212,175,55,.06)"/></pattern></defs>
      <rect width="560" height="430" fill="url(#grid)"/>
      <text class="sea" x="200" y="230">AKDENİZ</text><text class="sea" x="340" y="150">KARADENİZ</text><text class="sea" x="440" y="300">ARABİSTAN</text><text class="sea" x="120" y="90">AVRUPA</text><text class="sea" x="470" y="140">KAFKASYA</text>
      ${dots}</svg></div>
      <div class="legend">${legend.map(([id, n, c]) => `<span><i style="background:${c}"></i>${n}</span>`).join('')}</div>
      <p class="muted small">Kırmızı halka: savaştığınız devletin toprağı. Altın halka: sefer hedefi. Bir noktaya dokunarak eyaleti açın.</p>`;
  }

  A.mapZoom = () => { UI._mapZoom = !UI._mapZoom; UI.refresh(); if (UI._mapZoom) { const w = document.querySelector('.mapwrap'); if (w) { w.scrollLeft = w.scrollWidth * 0.42; w.scrollTop = w.scrollHeight * 0.22; } } };

  /* ---------- Devlet sayfası ---------- */
  A.nation = (ds) => {
    const id = ds.id;
    UI.sheet({ title: () => Dp.name(id), cls: 'nation-sheet', render: () => nationSheet(id) });
  };

  function nationSheet(id) {
    const s = PH.state;
    const n = s.nations[id];
    const nd = D.nations[id];
    if (!n || n.dead) return UI.empty('Bu devlet artık yok.');
    const est = Dp.strEstimate(n);
    const our = Dp.ourPower();
    const provs = M.targets(id);
    const cd = (k) => Dp.cdLeft(n, k);
    let h = `<div class="ch-head">${PH.Portrait.nationBadge(id, 72)}<div><h2>${Dp.name(id)}</h2><div class="muted">${nd.t} ${U.esc(n.ruler)} (${n.rulerAge} yaş) · ${nd.din}</div></div></div>
      <div class="card">${UI.statRow('İlişki', n.rel + 100, 200, { icon: 'handshake', txt: `${Dp.relWord(n.rel)} (${Math.round(n.rel)})`, cls: relClass(n.rel) })}
      <div class="kv"><span>${ic('sword')} Ordu gücü</span><b>${est.exact ? '' : '~'}${U.num(est.v)}${est.exact ? ' (kesin)' : ''}</b></div>
      <div class="kv"><span>${ic('ship')} Donanma</span><b>${est.exact ? n.ships : '~' + Math.round(n.ships / 10) * 10} gemi</b></div>
      <div class="kv"><span>${ic('scale')} Bize göre</span><b>${M.strWord(our / Math.max(1, est.v))}</b></div>
      ${n.war ? `<div class="kv"><span>${ic('flag')} Savaş skoru</span><b class="${n.ws >= 0 ? 'pos' : 'neg'}">${Math.round(n.ws)}</b></div><div class="kv"><span>Düşman yorgunluğu</span><b>${Math.round(n.weary)}</b></div>` : ''}
      ${n.truce > s.turn && !n.war ? `<div class="kv"><span>${ic('scroll')} Ahitname</span><b>${Math.ceil((n.truce - s.turn) / 12)} yıl daha</b></div>` : ''}
      ${n.tribute ? `<div class="kv"><span>${ic('coin')} Haraç</span><b class="${n.tribute > 0 ? 'pos' : 'neg'}">${U.money(Math.abs(n.tribute))}/ay ${n.tribute > 0 ? 'alıyoruz' : 'ödüyoruz'}</b></div>` : ''}
      </div>`;
    h += `<h4 class="sec">Diplomasi</h4><div class="agrid">`;
    if (!n.war) {
      h += `<button class="abtn" data-act="dEnvoy" data-id="${id}" ${cd('envoy') || s.emp.treasury < 1e6 ? 'disabled' : ''}>${ic('letter')}<span>Elçi Gönder</span><small>${cd('envoy') ? cd('envoy') + ' ay' : '1 Mn'}</small></button>`;
      h += `<button class="abtn" data-act="dGift" data-id="${id}" ${cd('gift') ? 'disabled' : ''}>${ic('gift')}<span>Hediye</span><small>${cd('gift') ? cd('gift') + ' ay' : 'ilişki +'}</small></button>`;
      h += `<button class="abtn" data-act="dTrade" data-id="${id}" ${n.trade || cd('trade') ? 'disabled' : ''}>${ic('tent')}<span>Ticaret Ahdi</span><small>${n.trade ? 'mevcut' : '%' + Dp.tradeChance(n)}</small></button>`;
      h += n.ally ? `<button class="abtn warn" data-act="dBreakAlly" data-id="${id}">${ic('swap')}<span>İttifakı Boz</span></button>` : `<button class="abtn" data-act="dAlly" data-id="${id}" ${cd('ally') ? 'disabled' : ''}>${ic('handshake')}<span>İttifak Teklifi</span><small>%${Dp.allianceChance(n)}</small></button>`;
      if (n.tribute <= 0) h += `<button class="abtn" data-act="dTribute" data-id="${id}" ${cd('tribute') ? 'disabled' : ''}>${ic('coin')}<span>Haraç İste</span><small>%${Dp.tributeChance(n)}</small></button>`;
      if (n.tribute < 0) h += `<button class="abtn warn" data-act="dStopPay" data-id="${id}">${ic('coin')}<span>Haracı Kes</span></button>`;
      h += `<button class="abtn" data-act="dInsult" data-id="${id}" ${cd('insult') ? 'disabled' : ''}>${ic('talk')}<span>Tehdit Mektubu</span><small>şöhret +, ilişki −</small></button>`;
      h += `<button class="abtn danger" data-act="dWar" data-id="${id}">${ic('sword')}<span>Savaş İlan Et</span><small>${n.truce > s.turn ? 'ahitname bozulur!' : 'casus belli'}</small></button>`;
    } else {
      h += `<button class="abtn gold" data-act="dPeace" data-id="${id}" ${cd('peace') ? 'disabled' : ''}>${ic('handshake')}<span>Barış Teklif Et</span><small>${cd('peace') ? cd('peace') + ' ay' : 'şartları seç'}</small></button>`;
      h += `<button class="abtn" data-act="tab" data-t="army" data-s="sefer">${ic('tent')}<span>Sefer Düzenle</span></button>`;
    }
    h += `<button class="abtn" data-act="dSpy" data-id="${id}" ${cd('spy') || s.emp.treasury < 1.5e6 ? 'disabled' : ''}>${ic('mask')}<span>Casus Gönder</span><small>${cd('spy') ? cd('spy') + ' ay' : '1,5 Mn'}</small></button>`;
    h += `</div>`;
    h += `<h4 class="sec">Toprakları <small>${provs.length}</small></h4><div class="list">${provs.map((p) => `<button class="lrow" data-act="prov" data-id="${p.id}">${ic(D.prov[p.id].island ? 'ship' : 'castle')}<div><b>${D.prov[p.id].n}${D.prov[p.id].cap === id ? ' ★ başkent' : ''}</b><small>Kale ${p.fort} · ${M.distance(p.id)} ay uzaklıkta</small></div></button>`).join('')}</div>`;
    return h;
  }

  const nat = (ds) => PH.state.nations[ds.id];
  A.dEnvoy = (ds) => { const n = nat(ds); UI.run('Elçilik', () => { const r = Dp.envoy(n); return `Elçiniz ${Dp.name(n.id)} sarayında ağırlandı.${r.intel ? ' Ayrıca ordularının gerçek gücünü öğrendi!' : ''}`; }, { icon: 'letter' }); };
  A.dGift = (ds) => {
    const n = nat(ds);
    UI.sheet({ title: 'Hediye: ' + Dp.short(n.id), render: () => `<div class="list">${[2e6, 5e6, 10e6].map((v) => `<button class="lrow" data-act="dGiftGo" data-id="${n.id}" data-v="${v}" ${PH.state.emp.treasury < v ? 'disabled' : ''}>${ic('gift')}<div><b>${U.money(v, true)}</b><small>${v === 2e6 ? 'Kaftanlar ve atlar' : v === 5e6 ? 'Mücevherli eşyalar, halılar' : 'Altın işlemeli otağ, nadir yazmalar'}</small></div></button>`).join('')}</div>` });
  };
  A.dGiftGo = (ds) => { const n = nat(ds); A.closeSheet(); UI.run('Hediye', () => { Dp.gift(n, +ds.v); return `Hediyeler ${Dp.ruler(n.id)} tarafından memnuniyetle kabul edildi.`; }, { icon: 'gift' }); };
  A.dInsult = (ds) => { const n = nat(ds); UI.run('Tehdit', () => { Dp.insult(n); return `Nişancının kaleme aldığı sert mektup ${U.dat(Dp.ruler(n.id))} ulaştı.`; }, { icon: 'talk' }); };
  A.dSpy = (ds) => { const n = nat(ds); UI.run('Casusluk', () => { const r = Dp.spy(n); return r.ok ? `Casuslar başarıyla döndü: ordunun kesin gücü öğrenildi.${r.sabotage ? ' Ayrıca cephaneliklerini havaya uçurdular!' : ''}` : 'Casuslarınız yakalandı! İlişkiler bozuldu.'; }, { icon: 'mask' }); };
  A.dTrade = (ds) => { const n = nat(ds); UI.run('Ticaret Ahdi', () => { Dp.setCd(n, 'trade', 6); if (U.chance(Dp.tradeChance(n) / 100)) { n.trade = true; Dp.relChange(n, 5); return 'Ticaret ahitnamesi imzalandı. Gümrük gelirleri artacak.'; } Dp.relChange(n, -2); return 'Teklifiniz reddedildi.'; }, { icon: 'tent' }); };
  A.dAlly = (ds) => { const n = nat(ds); UI.run('İttifak', () => { Dp.setCd(n, 'ally', 12); if (U.chance(Dp.allianceChance(n) / 100)) { n.ally = true; Dp.relChange(n, 10); PH.Turn.log(`${Dp.name(n.id)} ile ittifak kuruldu.`, 'diplo'); return 'İttifak antlaşması imzalandı!'; } Dp.relChange(n, -4); return `${Dp.ruler(n.id)} ittifak teklifinizi nazikçe geri çevirdi.`; }, { icon: 'handshake' }); };
  A.dBreakAlly = (ds) => { const n = nat(ds); UI.run('İttifak', () => { n.ally = false; Dp.relChange(n, -25); fx({ prestige: -2 }); return 'İttifak bozuldu.'; }, { icon: 'swap' }); };
  A.dTribute = (ds) => { const n = nat(ds); UI.run('Haraç Talebi', () => { Dp.setCd(n, 'tribute', 12); if (U.chance(Dp.tributeChance(n) / 100)) { n.tribute = Math.round(n.str * 6); fx({ prestige: 5 }); return `${Dp.ruler(n.id)} boyun eğdi: her ay ${U.money(n.tribute, true)} haraç ödeyecek!`; } Dp.relChange(n, -18); return 'Talebiniz hakaret sayıldı.'; }, { icon: 'coin' }); };
  A.dStopPay = (ds) => { const n = nat(ds); UI.run('Haraç', () => { n.tribute = 0; Dp.relChange(n, -30); fx({ prestige: 3 }); return 'Artık haraç ödemiyoruz. Bu bir savaş sebebi olabilir.'; }, { icon: 'coin' }); };
  A.dWar = (ds) => {
    const s = PH.state;
    const n = nat(ds);
    const truce = n.truce > s.turn;
    const sunni = D.nations[n.id].din === 'Sünni';
    UI.confirm({ title: 'Savaş İlanı', danger: true, yes: 'Savaş İlan Et', text: `${U.dat(Dp.short(n.id))} savaş ilan edilsin mi?${truce ? '\n\nDİKKAT: Aranızda geçerli bir ahitname var! Bozmak meşruiyet, şöhret ve ulema desteği kaybettirir.' : ''}${sunni ? '\n\nSünni bir devlete savaş açmak ulemayı rahatsız eder.' : ''}${n.ally ? '\n\nBu devlet müttefikinizdir!' : ''}`, onYes: () => UI.run('Savaş!', () => { Dp.declareWar(n); return `Savaş ilan edildi! Elçileri Yedikule'ye atıldı. Ordu ekranından sefer düzenleyebilirsiniz.`; }, { icon: 'sword' }) });
  };
  A.dPeace = (ds) => {
    const n = nat(ds);
    UI.sheet({
      title: 'Barış Şartları',
      render: () => `<p class="muted">Savaş skoru: <b>${Math.round(n.ws)}</b> · düşman yorgunluğu: <b>${Math.round(n.weary)}</b>. Ağır şartlar kabul ihtimalini düşürür.</p><div class="list">${Object.keys(Dp.TERMS).map((k) => { const t = Dp.TERMS[k]; const ch = Dp.peaceChance(n, k); return `<button class="lrow" data-act="dPeaceGo" data-id="${n.id}" data-k="${k}" ${ch <= 0 ? 'disabled' : ''}>${ic('scroll')}<div><b>${t.n}</b><small>${t.d}</small></div><span class="pct ${ch >= 60 ? 'pos' : ch >= 30 ? '' : 'neg'}">%${ch}</span></button>`; }).join('')}</div>`,
    });
  };
  A.dPeaceGo = (ds) => {
    const n = nat(ds);
    A.closeSheet();
    UI.run('Barış Görüşmesi', () => {
      const r = Dp.offerPeace(n, ds.k);
      if (!r.ok) return `${Dp.ruler(n.id)} şartlarınızı reddetti. Savaş sürüyor.`;
      let t = 'Barış antlaşması imzalandı!';
      if (r.amt && ds.k === 'tazminat') t += ` Tazminat: ${U.money(r.amt, true)}.`;
      if (r.trib) t += ` Yıllık haraç: ayda ${U.money(r.trib, true)}.`;
      if (r.prov) t += ` ${D.prov[r.prov].n} artık bizim!`;
      if (r.amt && ds.k === 'odeme') t += ` Ödenen: ${U.money(r.amt, true)}.`;
      return t;
    }, { icon: 'handshake' });
  };

  /* ---------- Eyalet sayfası ---------- */
  A.prov = (ds) => {
    const id = ds.id;
    UI.sheet({ title: () => D.prov[id].n, render: () => provSheet(id) });
  };

  function provSheet(id) {
    const s = PH.state;
    const p = s.provs[id];
    const pd = D.prov[id];
    const ours = p.owner === 'osm';
    const g = C.get(p.gov);
    let h = `<div class="card"><div class="kv"><span>${ic('flag')} Sahibi</span><b>${ours ? 'Devlet-i Aliyye' : Dp.name(p.owner)}</b></div><div class="kv"><span>${ic('map')} Bölge</span><b>${pd.reg}${pd.coast ? ' · kıyı' : ''}${pd.island ? ' · ada' : ''}</b></div>
      <div class="kv"><span>${ic('castle')} Kale</span><b>${p.fort}/6</b></div><div class="kv"><span>${ic('chart')} Gelişmişlik</span><b>${p.dev}/10</b></div>
      ${ours ? `<div class="kv"><span>${ic('coin')} Aylık gelir</span><b>${U.money(PH.Eco.provIncome(p), true)}</b></div>${p.vassal ? '' : UI.statRow('Huzursuzluk', p.unrest, 100, { icon: 'alert', invert: true, txt: '%' + Math.round(p.unrest) })}` : ''}
      ${p.exempt > s.turn ? `<div class="kv"><span>Vergi muafiyeti</span><b>${p.exempt - s.turn} ay</b></div>` : ''}
      ${p.rebel ? `<div class="alert">${ic('flag')} Eyalet isyan halinde! Vergi gelmiyor.</div>` : ''}</div>`;
    if (ours && !p.vassal && id !== s.capital) h += `<h4 class="sec">Vali</h4>${g ? UI.charRow(g, `İdare ${g.sk.idare} · Askerlik ${g.sk.askeri} · ${U.opWord(g.op)}`) : UI.empty('Eyalet valisiz; gelir ve huzur düşük.')}`;
    if (p.bld.length) h += `<h4 class="sec">Yapılar</h4><div class="chips">${p.bld.map((b) => `<span class="chip">${ic(D.buildings[b].icon)} ${D.buildings[b].n}</span>`).join('')}</div>`;
    if (ours) {
      const devCost = Math.round((p.dev + 1) * 1.5e6);
      h += `<h4 class="sec">İdare</h4><div class="agrid">`;
      if (!p.vassal && id !== s.capital) h += `<button class="abtn" data-act="pGov" data-id="${id}">${ic('user')}<span>Vali Tayin Et</span></button>`;
      if (!p.vassal) h += `<button class="abtn" data-act="pInvest" data-id="${id}" ${p.dev >= 10 || s.emp.treasury < devCost ? 'disabled' : ''}>${ic('chart')}<span>Yatırım</span><small>${U.money(devCost)} · gelişmişlik +1</small></button>`;
      if (!p.vassal) h += `<button class="abtn" data-act="pExempt" data-id="${id}" ${p.exempt > s.turn ? 'disabled' : ''}>${ic('scroll')}<span>Vergi Muafiyeti</span><small>1 yıl</small></button>`;
      h += `<button class="abtn" data-act="pTroops" data-id="${id}" ${s.emp.treasury < 2e6 ? 'disabled' : ''}>${ic('sword')}<span>${p.rebel ? 'Tenkil Ordusu' : 'Asker Gönder'}</span><small>2 Mn · huzursuzluk −</small></button>`;
      h += `<button class="abtn" data-act="pKadi" data-id="${id}" ${s.emp.treasury < 6e5 ? 'disabled' : ''}>${ic('gavel')}<span>Müfettiş Kadı</span><small>600 bin</small></button>`;
      h += `<button class="abtn" data-act="buildPick" data-t="kale">${ic('castle')}<span>Kale Tahkimi</span><small>İnşaat</small></button>`;
      h += `</div>`;
    } else if (s.nations[p.owner] && s.nations[p.owner].war) {
      h += `<button class="btn gold wide" data-act="planFor" data-n="${p.owner}" data-p="${id}">${ic('tent')} Bu eyalete sefer düzenle</button>`;
    } else if (s.nations[p.owner]) {
      h += `<button class="btn wide" data-act="nation" data-id="${p.owner}">${PH.Dip.short(p.owner)} ile ilişkiler ${ic('chev')}</button>`;
    }
    return h;
  }

  A.pGov = (ds) => {
    const id = ds.id;
    const cands = C.list((c) => c.role === 'devlet' && c.cls === 'pasa' && !c.exiled && !c.prison && !c.office && c.gov !== id).sort((a, b) => b.sk.idare - a.sk.idare).slice(0, 12);
    UI.sheet({ title: 'Vali Adayları', render: () => `<p class="muted">Başka bir eyaletin valisini atarsanız o eyalet valisiz kalır.</p><div class="list">${cands.map((c) => `<button class="lrow" data-act="chGovGo" data-id="${c.id}" data-p="${id}">${PH.Portrait.svg(c, 36)}<div><b>${U.esc(N(c))}</b><small>İdare <b>${c.sk.idare}</b> · Askerlik ${c.sk.askeri} · ${U.esc(C.title(c))} · ${U.opWord(c.op)}</small></div></button>`).join('')}</div>` });
  };
  A.pInvest = (ds) => { const s = PH.state; const p = s.provs[ds.id]; const cost = Math.round((p.dev + 1) * 1.5e6); UI.run('Yatırım', () => { fx({ treasury: -cost }); p.dev = Math.min(10, p.dev + 1); p.unrest = Math.max(0, p.unrest - 3); return `${U.loc(D.prov[ds.id].n)} yollar, hanlar ve çarşılar yenilendi.`; }, { toast: true }); };
  A.pExempt = (ds) => { const s = PH.state; const p = s.provs[ds.id]; UI.run('Muafiyet', () => { p.exempt = s.turn + 12; p.unrest = Math.max(0, p.unrest - 20); fx({ popularity: 1 }); return `${D.prov[ds.id].n} bir yıl vergiden muaf.`; }, { toast: true }); };
  A.pTroops = (ds) => {
    const s = PH.state; const p = s.provs[ds.id];
    UI.run('Asker', () => {
      fx({ treasury: -2e6 });
      if (p.rebel) {
        const ch = U.clamp(0.35 + M.power(M.home()) / 160000, 0.15, 0.9);
        if (U.chance(ch)) { p.rebel = false; p.unrest = 45; fx({ prestige: 2, stability: 3, sip: -U.ri(300, 1200) }); return 'Asiler dağıtıldı; eyalet yeniden itaat altında.'; }
        fx({ sip: -U.ri(800, 2000), prestige: -2 }); return 'Tenkil ordusu asileri yenemedi.';
      }
      p.unrest = Math.max(0, p.unrest - 22); fx({ popularity: -1 });
      return 'Sipahiler eşkıyayı temizledi; yollar güvenli.';
    }, { icon: 'sword' });
  };
  A.pKadi = (ds) => { const s = PH.state; const p = s.provs[ds.id]; UI.run('Müfettiş', () => { fx({ treasury: -6e5, corruption: -1 }); p.unrest = Math.max(0, p.unrest - 8); const g = C.get(p.gov); if (g) { g.known = true; if (C.has(g, 'rusvetci')) return `Müfettiş, Vali ${U.gen(N(g))} rüşvet aldığını tespit etti! (Kişi kartından hesap sorabilirsiniz.)`; } s.reign.justice++; return 'Müfettiş kadı haksızlıkları giderdi.'; }, { icon: 'gavel' }); };
  A.planFor = (ds) => {
    UI.closeAllSheets();
    UI.tab = 'army'; UI.sub.army = 'sefer'; UI.render();
    UI._plan = { n: ds.n, p: ds.p, f: { jan: 70, sip: 70, azap: 70, nizam: 70, cannons: 70 }, cmd: null };
    if (PH.state.campaign) { UI.toast('Zaten bir sefer sürüyor.', 'bad'); return; }
    UI.sheet({ title: 'Sefer Planı', cls: 'plan', render: () => PH.UI._planRender() });
  };
})();
