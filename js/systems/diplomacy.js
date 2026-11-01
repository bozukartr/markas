/* Padişah Hayatı — Diplomasi */
PH.Dip = (function () {
  const U = PH.U, D = PH.D, C = PH.C;
  const Dp = {};

  Dp.name = (nid) => { const nd = D.nations[nid]; return nd ? (nd.n[PH.state.era] || nd.n[0] || nd.short) : nid; };
  Dp.short = (nid) => (D.nations[nid] ? D.nations[nid].short : nid);
  Dp.ruler = (nid) => { const n = PH.state.nations[nid]; return `${D.nations[nid].t} ${n.ruler}`; };
  Dp.alive = () => Object.values(PH.state.nations).filter((n) => !n.dead);

  /** Döneme uygun hükümdar adı (listeler kabaca kronolojik) */
  Dp.rulerName = (nid, era, not) => {
    const list = D.names.foreign[nid] || ['Hükümdar'];
    const n = list.length;
    const a = Math.floor((n * era) / 4), b = Math.min(n, Math.ceil((n * (era + 1)) / 4) + 1);
    const seg = list.slice(a, Math.max(a + 1, b)).filter((x) => x !== not);
    return U.pick(seg.length ? seg : list) || list[0];
  };

  Dp.relWord = (r) => (r >= 60 ? 'Dost' : r >= 25 ? 'Samimi' : r >= -10 ? 'Nötr' : r >= -40 ? 'Gergin' : r >= -70 ? 'Hasmane' : 'Kin dolu');

  Dp.ourPower = () => PH.Mil.power(PH.state.army);
  Dp.strEstimate = (n) => {
    const s = PH.state;
    const exact = n.intel > s.turn;
    const v = exact ? n.str : Math.round(n.str * (0.75 + (U.hash(n.id + s.year) % 50) / 100) / 1000) * 1000;
    return { v, exact };
  };

  Dp.cdLeft = (n, key) => Math.max(0, (n.cd[key] || 0) - PH.state.turn);
  Dp.setCd = (n, key, m) => { n.cd[key] = PH.state.turn + m; };

  Dp.relChange = (n, d) => {
    const before = n.rel;
    n.rel = U.clamp(n.rel + d, -100, 100);
    PH.FX.note('rel' + n.id, Dp.short(n.id) + ' ilişkisi', n.rel - before, { icon: 'globe' });
  };

  Dp.envoy = (n) => {
    const sul = C.sultan();
    const v3 = PH.St.offSkill('vezir3');
    const d = Math.round(4 + sul.sk.diplomasi * 0.5 + v3 * 0.3 + U.ri(-2, 4));
    PH.fx({ treasury: -1e6 });
    Dp.relChange(n, d);
    Dp.setCd(n, 'envoy', 6);
    if (U.chance(0.25)) { n.intel = PH.state.turn + 6; return { d, intel: true }; }
    return { d };
  };

  Dp.gift = (n, amt) => {
    PH.fx({ treasury: -amt });
    const d = Math.round((amt / 1e6) * 2.5 + U.ri(0, 3));
    Dp.relChange(n, Math.min(25, d));
    Dp.setCd(n, 'gift', 4);
  };

  Dp.insult = (n) => {
    Dp.relChange(n, -U.ri(12, 20));
    PH.fx({ prestige: U.ri(1, 3), janissary: 1 });
    Dp.setCd(n, 'insult', 3);
  };

  Dp.spy = (n) => {
    const s = PH.state;
    PH.fx({ treasury: -1.5e6 });
    const sk = C.sultan().sk.entrika + PH.St.offSkill('bostancibasi');
    const ok = U.chance(U.clamp(0.4 + sk * 0.02, 0.3, 0.9));
    Dp.setCd(n, 'spy', 6);
    if (ok) {
      n.intel = s.turn + 12;
      if (n.war && U.chance(0.4)) { n.str = Math.round(n.str * 0.95); return { ok, sabotage: true }; }
      return { ok };
    }
    Dp.relChange(n, -10);
    return { ok: false };
  };

  /** Savaş ilanı */
  Dp.declareWar = (n) => {
    const s = PH.state;
    const breakTruce = n.truce > s.turn;
    n.war = true; n.ws = 0; n.weary = 0; n.ally = false; n.trade = false; n.tribute = 0;
    Dp.relChange(n, -40);
    s.flags.lastWar = s.turn;
    const fx = { janissary: 6, popularity: -1, stress: 3 };
    if (breakTruce) { fx.legitimacy = -12; fx.prestige = -6; fx.ulema = -6; }
    if (D.nations[n.id].din === 'Sünni') { fx.ulema = (fx.ulema || 0) - 6; fx.legitimacy = (fx.legitimacy || 0) - 4; }
    else if (D.nations[n.id].din === 'Şii') fx.ulema = (fx.ulema || 0) + 4;
    else fx.ulema = (fx.ulema || 0) + 2;
    PH.fx(fx);
    PH.Turn.log(`${U.dat(Dp.short(n.id))} savaş ilan edildi!${breakTruce ? ' (Ahitname bozuldu)' : ''}`, 'war');
    // Müttefikler
    Object.values(s.nations).forEach((o) => {
      if (o.id === n.id || o.dead) return;
      if (D.nations[o.id].din === D.nations[n.id].din && o.rel < -30 && o.truce <= s.turn && U.chance(0.07)) {
        o.war = true; o.ws = 0; o.weary = 0;
        PH.Turn.log(`${Dp.name(o.id)} müttefikinin yanında savaşa girdi!`, 'war');
      }
    });
  };

  /** Barış önerisi kabul ihtimali */
  Dp.TERMS = {
    beyaz: { n: 'Mevcut durum üzerinden barış', d: 'Fethedilen yerler bizde kalır, kimse bir şey ödemez.', mod: 0 },
    tazminat: { n: 'Savaş tazminatı', d: 'Düşman hazinemize tazminat öder.', mod: -18 },
    harac: { n: 'Yıllık haraç', d: 'Düşman her ay haraç öder.', mod: -28 },
    toprak: { n: 'Toprak terki', d: 'Düşman bir eyaletini daha bize bırakır.', mod: -35 },
    odeme: { n: 'Biz tazminat öderiz', d: 'Barış karşılığında biz ödeme yaparız.', mod: 30 },
  };

  Dp.peaceChance = (n, term) => {
    const sul = C.sultan();
    let p = 20 + n.ws * 0.8 + n.weary * 0.4 + Dp.TERMS[term].mod + sul.sk.diplomasi * 0.6 + PH.St.offSkill('vezir3') * 0.3;
    if (term === 'toprak' && !PH.Mil.targets(n.id).length) return 0;
    return U.clamp(Math.round(p), 0, 98);
  };

  Dp.offerPeace = (n, term) => {
    const s = PH.state;
    const ch = Dp.peaceChance(n, term);
    Dp.setCd(n, 'peace', 3);
    if (!U.chance(ch / 100)) { Dp.relChange(n, -3); return { ok: false, ch }; }
    const out = { ok: true, ch };
    if (term === 'tazminat') { out.amt = Math.round(n.str * U.rf(300, 600)); PH.fx({ treasury: out.amt }); }
    if (term === 'harac') { n.tribute = Math.round(n.str * U.rf(6, 10)); out.trib = n.tribute; }
    if (term === 'toprak') {
      const t = PH.Mil.targets(n.id).filter((p) => !D.prov[p.id].cap || D.prov[p.id].cap !== n.id).sort((a, b) => D.prov[a.id].dist - D.prov[b.id].dist)[0] || PH.Mil.targets(n.id)[0];
      if (t) { t.owner = 'osm'; t.conq = s.turn; t.unrest = 45; t.gov = null; out.prov = t.id; s.stats.conquests++; s.reign.conquests++; }
    }
    if (term === 'odeme') { out.amt = Math.round(n.str * U.rf(200, 400)); PH.fx({ treasury: -out.amt, prestige: -5 }); }
    Dp.makePeace(n);
    PH.fx({ prestige: term === 'odeme' ? -3 : term === 'beyaz' ? 1 : 4, stress: -4 });
    return out;
  };

  Dp.makePeace = (n) => {
    const s = PH.state;
    n.war = false; n.ws = 0; n.weary = 0;
    n.truce = s.turn + 120;
    n.rel = U.clamp(n.rel + 25, -100, 100);
    PH.Turn.log(`${Dp.name(n.id)} ile ahitname imzalandı. On yıllık barış başladı.`, 'diplo');
    if (s.campaign && s.campaign.nation === n.id) { s.campaign.phase = 'return'; s.campaign.left = 1; }
  };

  Dp.allianceChance = (n) => {
    const sul = C.sultan();
    let p = (n.rel - 40) * 1.2 + sul.sk.diplomasi * 1.2 + (s_prestige() - 50) / 2;
    if (D.nations[n.id].din === 'Sünni') p += 10;
    return U.clamp(Math.round(p), 0, 95);
  };
  function s_prestige() { return PH.state.emp.prestige; }

  Dp.tradeChance = (n) => U.clamp(Math.round(30 + n.rel * 0.7 + C.sultan().sk.diplomasi), 0, 95);

  Dp.tributeChance = (n) => {
    const ours = Dp.ourPower();
    const ratio = ours / Math.max(1, n.str);
    return U.clamp(Math.round((ratio - 1.5) * 35 + C.sultan().sk.diplomasi + (PH.state.emp.prestige - 50) / 3), 0, 90);
  };

  /** Aylık: ilişkiler kayar, yapay zeka savaş açabilir */
  Dp.monthly = () => {
    const s = PH.state;
    const our = Dp.ourPower();
    Dp.alive().forEach((n) => {
      const nd = D.nations[n.id];
      // ilişki sürüklenmesi
      const base = (nd.rel[s.era] || 0) * 0.6 + (n.ally ? 30 : 0) + (n.trade ? 10 : 0);
      n.rel = U.clamp(n.rel + (base - n.rel) * 0.02 + U.rf(-1, 1), -100, 100);
      // güç büyümesi
      const g = n.id === 'rus' && s.era >= 2 ? 0.0018 : 0.0009;
      n.str = Math.round(n.str * (1 + g) + (n.war ? 0 : 20));
      if (!n.war) n.weary = Math.max(0, n.weary - 1);
      // hükümdar yaşlanır
      if (s.month === 0) {
        n.rulerAge++;
        if (U.chance(n.rulerAge > 60 ? 0.12 : 0.03)) {
          const old = n.ruler;
          n.ruler = Dp.rulerName(n.id, s.era, old);
          n.rulerAge = U.ri(18, 45);
          PH.Turn.log(`${Dp.name(n.id)}: ${old} öldü, yerine ${n.ruler} geçti.`, 'diplo');
          n.rel = U.clamp(n.rel + U.ri(-15, 15), -100, 100);
          if (n.ally && U.chance(0.4)) { n.ally = false; PH.Turn.log(`${Dp.short(n.id)} ile ittifak, yeni hükümdarla sona erdi.`, 'diplo'); }
        }
      }
      // savaş ilanı
      const wars = Object.values(s.nations).filter((x) => x.war).length;
      if (!n.war && n.truce <= s.turn && n.rel < -35 && wars < 2 && s.turn > 6) {
        const ratio = n.str / Math.max(5000, our);
        const p = 0.0045 * nd.aggr * (1 + ratio) * (1 + (-n.rel - 35) / 40) * PH.St.DIFF[s.diff].events;
        if (ratio > 0.4 && U.chance(p) && !s.eventQueue.some((e) => e.id === 'savas_ilani')) PH.E.push('savas_ilani', { n: n.id });
      }
      // haraç ödeyen devletin isyanı
      if (n.tribute > 0 && n.rel < -30 && U.chance(0.03)) {
        n.tribute = 0;
        PH.Turn.log(`${Dp.short(n.id)} haraç ödemeyi kesti.`, 'diplo');
      }
      // ittifak yardımı
      if (n.ally && Object.values(s.nations).some((o) => o.war) && U.chance(0.15)) {
        const enemy = U.pick(Object.values(s.nations).filter((o) => o.war));
        if (enemy) enemy.ws = Math.min(100, enemy.ws + 3);
      }
    });
  };

  return Dp;
})();
