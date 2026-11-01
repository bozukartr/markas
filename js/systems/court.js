/* Padişah Hayatı — Divan, atamalar, cezalar ve komplolar */
PH.Court = (function () {
  const U = PH.U, D = PH.D, C = PH.C;
  const Court = {};

  /** Bir makam için uygun adaylar */
  Court.candidates = (off) => {
    const s = PH.state;
    const od = D.offices[off];
    return C.list((c) => c.role === 'devlet' && c.cls === od.cls && c.office !== off && !c.exiled && !c.prison && c.id !== s.sultanId)
      .sort((a, b) => b.sk[od.key] - a.sk[od.key]);
  };

  Court.newCandidates = (cls, n = 3) => {
    const out = [];
    for (let i = 0; i < n; i++) out.push(C.statesman(cls, { age: U.ri(28, 58) }));
    return out;
  };

  Court.appoint = (off, c) => {
    const s = PH.state;
    const prev = PH.St.officer(off);
    if (prev && prev.id !== c.id) {
      C.opinion(prev, -20);
      prev.amb = Math.min(100, prev.amb + 10);
    }
    // eski makamından ya da valilikten çıkar
    PH.St.assign(off, c);
    if (prev && prev.id !== c.id) PH.Turn.log(`${C.name(prev)} ${D.offices[off].n} makamından alındı; yerine ${C.name(c)} getirildi.`, 'court');
    else PH.Turn.log(`${C.name(c)} ${D.offices[off].n} makamına atandı.`, 'court');
    // diğer hırslı adaylar kıskanır
    Court.candidates(off).filter((x) => C.has(x, 'hirsli') && x.id !== c.id).slice(0, 2).forEach((x) => C.opinion(x, -6, true));
  };

  Court.dismiss = (c) => {
    const s = PH.state;
    if (c.office) {
      const off = c.office;
      PH.St.assign(off, null);
      PH.Turn.log(`${C.name(c)} ${D.offices[off].n} makamından azledildi.`, 'court');
    }
    if (c.gov) {
      const p = s.provs[c.gov];
      if (p) p.gov = null;
      PH.Turn.log(`${C.name(c)} ${D.prov[c.gov].n} valiliğinden azledildi.`, 'court');
      c.gov = null;
    }
    C.opinion(c, -30);
    c.amb = Math.min(100, c.amb + 15);
  };

  Court.appointGov = (provId, c) => {
    const s = PH.state;
    const p = s.provs[provId];
    const prev = C.get(p.gov);
    if (prev) { prev.gov = null; C.opinion(prev, -15); }
    if (c.office) PH.St.assign(c.office, null);
    if (c.gov && s.provs[c.gov]) s.provs[c.gov].gov = null;
    c.gov = provId; p.gov = c.id;
    C.opinion(c, 10);
    PH.Turn.log(`${C.name(c)} ${D.prov[provId].n} valiliğine tayin edildi.`, 'court');
  };

  /** Şeyhülislamın fetva verme ihtimali */
  Court.fetvaChance = (target) => {
    const s = PH.state;
    const sh = PH.St.officer('seyhulislam');
    if (!sh) return 0.4;
    let p = 0.45 + sh.op / 200 + (s.emp.ulema - 50) / 200;
    if (target && C.has(target, 'dindar')) p -= 0.15;
    if (target && target.cls === 'ulema') p -= 0.25;
    if (C.has(sh, 'durust')) p -= 0.1;
    return U.clamp(p, 0.05, 0.98);
  };

  /** Siyaseten katl */
  Court.execute = (c, withFetva) => {
    const s = PH.state;
    const sul = C.sultan();
    const name = C.name(c);
    const wealth = c.wealth || 0;
    const wasOff = c.office || c.gov;
    C.kill(c, 'idam edildi');
    s.stats.executions++; s.reign.executions++; s.reign.cruelty++;
    const fear = C.has(sul, 'zalim') ? 0.5 : 1;
    const fx = { legitimacy: withFetva ? -1 : -5, stability: wasOff ? -2 : -1, ulema: withFetva ? 0 : -4, stress: 4 };
    if (c.dyn) { fx.legitimacy -= 6; fx.popularity = -5; fx.piety = -4; }
    if (c.cls === 'ulema') { fx.ulema -= 10; }
    for (const k in fx) fx[k] = Math.round(fx[k] * fear);
    PH.fx(fx);
    // diğerleri korkar: hırslılar sinir, sadıklar hafif
    C.list((x) => x.role === 'devlet' && (x.office || x.gov)).forEach((x) => {
      x.amb = Math.max(0, x.amb - 6);
      if (U.chance(0.4)) x.op = U.clamp(x.op + (C.has(x, 'sadik') ? 2 : -5), -100, 100);
    });
    PH.Turn.log(`${name} siyaseten katledildi${withFetva ? ' (fetva ile)' : ''}.`, 'blood');
    return wealth;
  };

  /** Müsadere */
  Court.confiscate = (c) => {
    const amt = Math.round((c.wealth || 0) * U.rf(0.6, 0.9));
    c.wealth = Math.max(0, (c.wealth || 0) - amt);
    PH.fx({ treasury: amt, legitimacy: -1, corruption: -1 });
    return amt;
  };

  Court.exile = (c) => {
    if (c.office) PH.St.assign(c.office, null);
    if (c.gov) { const p = PH.state.provs[c.gov]; if (p) p.gov = null; c.gov = null; }
    c.exiled = true;
    c.sancak = null;
    C.opinion(c, -40);
    PH.Turn.log(`${C.name(c)} sürgüne gönderildi.`, 'court');
  };

  Court.imprison = (c) => {
    if (c.office) PH.St.assign(c.office, null);
    if (c.gov) { const p = PH.state.provs[c.gov]; if (p) p.gov = null; c.gov = null; }
    c.prison = true;
    C.opinion(c, -50);
    PH.Turn.log(`${C.name(c)} Yedikule zindanlarına atıldı.`, 'court');
  };

  Court.pardon = (c) => {
    c.exiled = false; c.prison = false;
    C.opinion(c, 25);
    PH.Turn.log(`${C.name(c)} affedildi.`, 'court');
  };

  /* ---------- Komplolar ---------- */
  Court.PLOT_N = { darbe: 'Darbe', zehir: 'Zehirleme', isyan: 'İsyan', taht: 'Taht Kavgası', harem: 'Harem Entrikası' };

  Court.monthlyPlots = () => {
    const s = PH.state;
    const sul = C.sultan();
    // yeni komplolar
    C.list((c) => c.id !== sul.id && (c.role === 'devlet' || c.dyn || c.role === 'harem' || c.role === 'valide')).forEach((c) => {
      if (s.plots.some((p) => p.by === c.id)) return;
      if (C.age(c) < 16 || c.prison) return;
      const disloyal = c.op < -25 && c.amb > 45;
      if (!disloyal) return;
      let p = 0.012 * (1 + (c.amb - 45) / 40) * (1 + (-c.op - 25) / 50);
      if (C.has(sul, 'zalim')) p *= 0.6;
      if (C.has(c, 'sadik')) p *= 0.3;
      if (C.has(c, 'hain') || C.has(c, 'entrikaci')) p *= 1.5;
      if (!U.chance(p)) return;
      let type = 'darbe';
      if (c.dyn && c.g === 'm') type = c.sancak ? 'isyan' : 'taht';
      else if (c.role === 'harem' || c.role === 'valide') type = U.chance(0.5) ? 'harem' : 'zehir';
      else if (c.gov) type = 'isyan';
      else if (c.office === 'hekimbasi' || C.has(c, 'entrikaci')) type = 'zehir';
      let target = null;
      if (type === 'harem') {
        const rival = U.pick(C.list((x) => (x.role === 'harem' || (x.dyn && x.g === 'm' && x.fa === sul.id)) && x.id !== c.id && x.mo !== c.id));
        if (!rival) return;
        target = rival.id;
      }
      s.plots.push({ id: U.uid(), by: c.id, type, prog: 0, known: false, target });
    });
    // ilerleme ve keşif
    const detect = 0.03 + (sul.sk.entrika * 0.004) + PH.St.offSkill('bostancibasi') * 0.004 + (C.has(sul, 'kuskucu') ? 0.04 : 0) + PH.St.offSkill('darussaade') * 0.002;
    s.plots.slice().forEach((p) => {
      const c = C.get(p.by);
      if (!c || !c.alive) { s.plots = s.plots.filter((x) => x !== p); return; }
      if (c.op > 0) { s.plots = s.plots.filter((x) => x !== p); return; } // vazgeçti
      p.prog += U.ri(3, 8) + c.sk.entrika * 0.4;
      if (!p.known && U.chance(detect)) {
        p.known = true;
        PH.E.push('komplo_kesif', { plot: p.id, c: c.id });
        return;
      }
      if (p.prog >= 100) {
        s.plots = s.plots.filter((x) => x !== p);
        PH.E.push('komplo_' + (p.type === 'taht' ? 'darbe' : p.type), { c: c.id, t: p.target });
      }
    });
  };

  Court.plotOf = (c) => PH.state.plots.find((p) => p.by === c.id);

  /* ---------- Divan toplantısı gündemi ---------- */
  Court.agenda = () => {
    const s = PH.state;
    const b = PH.Eco.budget();
    const items = [];
    if (b.net < 0 || s.emp.treasury < 5e6) items.push('dv_hazine');
    const hot = PH.Eco.ownProvs(s).filter((p) => !p.vassal && p.unrest > 45).sort((a, c) => c.unrest - a.unrest)[0];
    if (hot) items.push('dv_eyalet');
    if (s.emp.janissary < 50) items.push('dv_yeniceri');
    if (s.emp.ulema < 45) items.push('dv_ulema');
    if (Object.values(s.nations).some((n) => n.war)) items.push('dv_savas');
    else items.push('dv_sefer');
    items.push('dv_adalet', 'dv_ticaret', 'dv_donanma', 'dv_kanun');
    return U.sample(Array.from(new Set(items)), 3);
  };

  return Court;
})();
