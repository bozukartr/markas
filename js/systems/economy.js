/* Padişah Hayatı — Ekonomi: gelir, gider, eyaletler, yapılar */
PH.Eco = (function () {
  const U = PH.U, D = PH.D, C = PH.C;
  const Eco = {};

  Eco.UPKEEP = { jan: 260, sip: 28, azap: 85, nizam: 320, cannons: 2600, ships: 13000 };
  Eco.RECRUIT = { jan: 2800, sip: 600, azap: 450, nizam: 4200, cannons: 32000, ships: 420000 };

  Eco.ownProvs = (s) => Object.values((s || PH.state).provs).filter((p) => p.owner === 'osm');
  Eco.hasBuilding = (type, prov) => PH.state.built.some((b) => b.type === type && (!prov || b.prov === prov));
  Eco.countBuilding = (type) => PH.state.built.filter((b) => b.type === type).length;

  Eco.lawMul = (key) => {
    const s = PH.state;
    let m = 1;
    for (const id in s.laws) if (s.laws[id] && D.laws[id] && D.laws[id][key]) m *= D.laws[id][key];
    return m;
  };

  /** Eyaletin aylık vergi geliri */
  Eco.provIncome = (p) => {
    const s = PH.state;
    const d = D.prov[p.id];
    if (p.owner !== 'osm' || p.rebel) return 0;
    if (p.vassal) return d.inc * 1000 * 0.45;
    if (p.exempt > s.turn) return 0;
    const tax = D.taxLevels[s.emp.tax].mul;
    const gov = C.get(p.gov);
    const gF = p.id === s.capital ? 1.05 : gov ? 0.88 + gov.sk.idare * 0.012 - (C.has(gov, 'rusvetci') ? 0.08 : 0) : 0.8;
    let v = d.inc * 1000 * (0.7 + p.dev * 0.08) * tax * (1 - p.unrest / 220) * gF;
    if (s.turn - p.conq < 18) v *= 0.55;
    return Math.max(0, v);
  };

  /** Aylık bütçe dökümü */
  Eco.budget = () => {
    const s = PH.state;
    const era = D.eras[s.era];
    const inc = { vergi: 0, harac: 0, ticaret: 0, diger: 0 };
    const exp = { ordu: 0, sefer: 0, saray: 0, maas: 0, bina: 0, kanun: 0, faiz: 0, harac: 0 };
    const corrF = 1 - s.emp.corruption / 260;
    const defF = 0.9 + PH.St.offSkill('defterdar') * 0.01;
    const lawInc = Eco.lawMul('incMul');
    let vergi = 0, harac = 0;
    Eco.ownProvs(s).forEach((p) => {
      const v = Eco.provIncome(p);
      if (p.vassal) harac += v; else vergi += v;
    });
    inc.vergi = vergi * corrF * defF * lawInc * (s.flags.tahrirUntil > s.turn ? 1.06 : 1) * (era.ecoMul || 1);
    inc.harac = harac;
    Object.values(s.nations).forEach((n) => { if (n.tribute > 0) inc.harac += n.tribute; else if (n.tribute < 0) exp.harac += -n.tribute; });
    // ticaret
    let trade = era.trade * (0.6 + Eco.ownProvs(s).filter((p) => D.prov[p.id].coast).length / 30);
    s.built.forEach((b) => { const bd = D.buildings[b.type]; if (bd.trade) trade += bd.trade; });
    Object.values(s.nations).forEach((n) => { if (n.trade) trade += 220000; });
    const wars = Object.values(s.nations).filter((n) => n.war).length;
    trade *= Math.pow(0.93, wars) * Eco.lawMul('tradeMul') * (s.flags.plagueUntil > s.turn ? 0.75 : 1);
    if (s.emp.purity < 100) trade *= 0.85 + s.emp.purity * 0.0015;
    inc.ticaret = trade * (era.ecoMul || 1);
    if (s.flags.mineUntil > s.turn) inc.diger += s.flags.mineInc || 0;
    // ordu
    const a = s.army;
    const camp = s.campaign ? s.campaign.forces : null;
    const u = Eco.UPKEEP;
    const tot = (o) => o.jan * u.jan + o.sip * u.sip + o.azap * u.azap + o.nizam * u.nizam + o.cannons * u.cannons;
    exp.ordu = tot(a) + a.ships * u.ships;
    if (camp) exp.sefer = tot(camp) * 0.45 + 250000;
    // saray
    const sul = C.sultan();
    const haremN = C.list((c) => c.role === 'harem').length;
    const dynN = C.list((c) => c.dyn && c.id !== s.sultanId).length;
    let palace = era.palace + haremN * 30000 + dynN * 45000;
    if (C.has(sul, 'musrif')) palace *= 1.35;
    if (C.has(sul, 'tutumlu')) palace *= 0.8;
    if (s.flags.palaceCut > s.turn) palace *= 0.75;
    exp.saray = palace;
    // maaşlar
    D.officeOrder.forEach((o) => { if (s.offices[o]) exp.maas += D.offices[o].salary; });
    exp.maas += Eco.ownProvs(s).filter((p) => p.gov).length * 22000;
    exp.maas *= era.salMul || 1;
    // binalar
    s.built.forEach((b) => (exp.bina += D.buildings[b.type].up || 0));
    // kanunlar
    for (const id in s.laws) if (s.laws[id] && D.laws[id] && D.laws[id].cost) exp.kanun += D.laws[id].cost;
    exp.faiz = s.emp.debt * 0.012;
    const ti = U.sum(Object.values(inc));
    const te = U.sum(Object.values(exp));
    return { inc, exp, ti, te, net: ti - te };
  };

  Eco.INC_N = { vergi: 'Eyalet vergileri', harac: 'Haraç ve vasallar', ticaret: 'Gümrük ve ticaret', diger: 'Diğer gelirler' };
  Eco.EXP_N = { ordu: 'Ordu ulufeleri', sefer: 'Sefer masrafları', saray: 'Saray ve harem', maas: 'Vezir ve vali maaşları', bina: 'Yapı bakımları', kanun: 'Kanun ve vakıf giderleri', faiz: 'Borç faizi', harac: 'Ödenen haraç' };

  /** Aylık ekonomi ve imparatorluk sürüklenmesi */
  Eco.monthly = (rep) => {
    const s = PH.state;
    const b = Eco.budget();
    s.emp.treasury = Math.round(s.emp.treasury + b.net);
    rep.budget = b;
    // Hazine iflası: maaş gecikmesi
    if (s.emp.treasury < 0) {
      s.flags.unpaid = (s.flags.unpaid || 0) + 1;
      if (s.flags.unpaid >= 2 && !s.eventQueue.some((e) => e.id === 'ulufe_gecikme')) PH.E.push('ulufe_gecikme', {});
    } else s.flags.unpaid = 0;

    Eco.drift(s);
    Eco.provinces(s, rep);
    Eco.projects(s, rep);
    Eco.food(s);
    Eco.laws(s);
  };

  Eco.targets = (s) => {
    const e = s.emp;
    const sul = C.sultan();
    const tax = D.taxLevels[e.tax];
    const provs = Eco.ownProvs(s);
    const avgUnrest = U.avg(provs, (p) => p.unrest);
    const rebels = provs.filter((p) => p.rebel).length;
    const wars = Object.values(s.nations).filter((n) => n.war).length;
    const t = {};
    t.popularity = 50 + tax.pop + (e.food - 50) / 4 - e.corruption / 6 + Math.min(12, s.built.length * 0.8)
      + (C.has(sul, 'adil') ? 5 : 0) - (C.has(sul, 'zalim') ? 6 : 0) + (e.prestige - 50) / 10 - wars * 2 - (s.flags.plagueUntil > s.turn ? 6 : 0)
      + PH.St.offSkill('kazasker') * 0.3 - (100 - e.purity) / 4;
    t.stability = (e.popularity + e.janissary + e.legitimacy + e.ulema) / 4 - avgUnrest / 4 + PH.St.offSkill('sadrazam') * 0.6 - rebels * 5 + 5;
    t.janissary = 52 - (100 - e.purity) * 0.6 + (C.get(s.offices.yeniceri) ? C.get(s.offices.yeniceri).op / 6 : -10)
      + (s.flags.bootyUntil > s.turn ? 10 : 0) - (s.flags.unpaid ? 25 : 0) - Math.max(0, (s.turn - (s.flags.lastWar || 0)) / 12 - 3) * 1.5
      + (s.army.training - 50) / 10 + (C.has(sul, 'cesur') ? 4 : 0);
    t.ulema = 38 + sul.piety / 5 + (C.get(s.offices.seyhulislam) ? C.get(s.offices.seyhulislam).op / 6 : -10) + Math.min(10, (Eco.countBuilding('cami') * 3 + Eco.countBuilding('medrese')));
    t.legitimacy = 40 + e.prestige / 5 + (C.sons(sul.id).length ? 8 : -6) + (C.has(sul, 'heybetli') ? 6 : 0) + PH.St.offSkill('nisanci') * 0.4 - (C.age(sul) < 16 ? 12 : 0);
    t.prestige = 25 + provs.length * 0.7 + s.stats.conquests * 0.3;
    t.corruption = 34 - PH.St.offSkill('defterdar') * 0.8 - PH.St.offSkill('sadrazam') * 0.3 + (C.has(C.get(s.offices.defterdar), 'rusvetci') ? 12 : 0) + (C.has(C.get(s.offices.sadrazam), 'rusvetci') ? 8 : 0) + (C.has(sul, 'tutumlu') ? -4 : 0) + s.era * 4;
    for (const k in t) t[k] = U.clamp(t[k], 0, 100);
    return t;
  };

  Eco.drift = (s) => {
    const t = Eco.targets(s);
    const rates = { popularity: 0.06, stability: 0.07, janissary: 0.06, ulema: 0.05, legitimacy: 0.04, prestige: 0.02, corruption: 0.04 };
    for (const k in rates) s.emp[k] = U.clamp(s.emp[k] + (t[k] - s.emp[k]) * rates[k], 0, 100);
    // akçe ayarı zamanla kendiliğinden düzelmez; ancak hafif enflasyon
    s.army.morale = U.clamp(s.army.morale + ((55 + s.emp.janissary / 5 - s.army.morale) * 0.05), 0, 100);
    s.army.training = U.clamp(s.army.training - 0.25 + (Eco.hasBuilding('kisla') ? 0.2 : 0) + (PH.St.offSkill('vezir2') - 8) * 0.02, 0, 100);
  };

  Eco.provinces = (s, rep) => {
    const tax = D.taxLevels[s.emp.tax];
    const zimmi = s.laws.zimmi ? D.laws.zimmi.unrestChristian : 0;
    Eco.ownProvs(s).forEach((p) => {
      const d = D.prov[p.id];
      if (p.vassal) { p.unrest = U.clamp(p.unrest + U.rf(-1.5, 1.5), 0, 100); return; }
      const gov = C.get(p.gov);
      const christ = 1 - (D.regionInfo[d.reg] ? D.regionInfo[d.reg].muslim : 0.5);
      let target = 14 + tax.unrest + d.dist * 2 + (s.turn - p.conq < 36 ? 25 : 0)
        - (gov ? gov.sk.idare * 0.8 + (C.has(gov, 'adil') ? 5 : 0) - (C.has(gov, 'zalim') ? 6 : 0) - (C.has(gov, 'rusvetci') ? 6 : 0) : -8)
        + christ * 10 + christ * zimmi - (s.emp.popularity - 50) / 4 + (s.laws.devsirme && d.reg === 'Rumeli' ? 5 : 0)
        + s.emp.corruption / 8 - (p.id === s.capital ? 10 : 0);
      p.bld.forEach((bt) => (target += D.buildings[bt].unrest || 0));
      if (s.flags.celali && ['Anadolu'].includes(d.reg)) target += 15;
      if (s.flags.kizilbas && ['Anadolu', 'Irak'].includes(d.reg)) target += 8;
      target = U.clamp(target, 0, 100);
      p.unrest = U.clamp(p.unrest + (target - p.unrest) * 0.07 + U.rf(-1.5, 1.5), 0, 100);
      if (p.rebel) p.unrest = Math.max(p.unrest, 60);
      if (!p.rebel && p.unrest >= 82 && U.chance(0.25) && !s.eventQueue.some((e) => e.id === 'isyan')) PH.E.push('isyan', { p: p.id });
    });
    // Asi eyaletler istikrarı düşürür
  };

  Eco.projects = (s, rep) => {
    const done = [];
    s.projects.forEach((pr) => {
      pr.left -= 1;
      if (pr.left <= 0) done.push(pr);
    });
    done.forEach((pr) => {
      s.projects = s.projects.filter((x) => x !== pr);
      Eco.completeBuilding(pr);
      rep.notes.push({ i: D.buildings[pr.type].icon, t: `${pr.name} tamamlandı.` });
    });
  };

  Eco.completeBuilding = (pr) => {
    const s = PH.state;
    const bd = D.buildings[pr.type];
    const p = s.provs[pr.prov];
    s.built.push({ type: pr.type, prov: pr.prov, year: s.year, name: pr.name });
    if (p) {
      p.bld.push(pr.type);
      if (bd.dev) p.dev = Math.min(10, p.dev + bd.dev);
      if (bd.fort) p.fort = Math.min(6, p.fort + bd.fort);
    }
    if (bd.ships) s.army.ships += bd.ships;
    if (bd.cannons) s.army.cannons += bd.cannons;
    // bir kerelik etkiler doğrudan
    PH.FX.run(() => PH.fx(bd.fx || {}));
    s.stats.buildings++; s.reign.buildings++;
    PH.Turn.log(`${pr.name} (${D.prov[pr.prov] ? D.prov[pr.prov].n : ''}) tamamlandı.`, 'build');
  };

  Eco.buildCost = (type) => {
    const s = PH.state;
    let c = D.buildings[type].cost;
    if (s.flags.mimarUntil > s.turn) c *= 0.8;
    return Math.round(c);
  };

  Eco.canBuild = (type, provId) => {
    const s = PH.state;
    const bd = D.buildings[type];
    const p = s.provs[provId];
    if (!p || p.owner !== 'osm') return 'Eyalet sizin değil';
    if (p.rebel) return 'Eyalet isyanda';
    if (bd.coast && !D.prov[provId].coast) return 'Kıyı eyaleti gerekir';
    const inProg = s.projects.some((x) => x.type === type && x.prov === provId);
    if (bd.uniq && (p.bld.includes(type) || inProg)) return 'Bu eyalette zaten var';
    if (type === 'kale' && p.fort >= 6) return 'Kale en üst seviyede';
    if (s.projects.length >= 4) return 'Aynı anda en fazla 4 inşaat';
    if (s.emp.treasury < Eco.buildCost(type)) return 'Hazine yetersiz';
    return null;
  };

  Eco.startBuilding = (type, provId, customName) => {
    const s = PH.state;
    const bd = D.buildings[type];
    const sul = C.sultan();
    const cost = Eco.buildCost(type);
    PH.fx({ treasury: -cost });
    const pn = D.prov[provId].n;
    let name = customName;
    if (!name) name = type === 'cami' ? `Sultan ${sul.name} Camii` : `${pn} ${bd.n}`;
    s.projects.push({ id: U.uid(), type, prov: provId, left: bd.m, total: bd.m, cost, name });
    PH.Turn.log(`${name} için temel atıldı.`, 'build');
  };

  Eco.food = (s) => {
    let d = -1.2;
    if (s.provs.misir && s.provs.misir.owner === 'osm' && !s.provs.misir.rebel) d += 0.7;
    s.built.forEach((b) => (d += D.buildings[b.type].food || 0));
    if (s.campaign) d -= 0.4;
    s.emp.food = U.clamp(s.emp.food + d, 0, 100);
    if (s.emp.food < 20 && !s.cd.kitlik && U.chance(0.3)) PH.E.push('kitlik', {});
  };

  Eco.laws = (s) => {
    for (const id in s.laws) {
      if (!s.laws[id]) continue;
      const l = D.laws[id];
      if (!l || !l.m) continue;
      PH.fx(l.m);
    }
  };

  Eco.harvest = (s) => {
    const base = U.ri(8, 34);
    const bonus = Eco.countBuilding('ambar') * D.buildings.ambar.harvest;
    const v = base + bonus;
    return v;
  };

  /** Hukuk/kanun değiştir */
  Eco.toggleLaw = (id) => {
    const s = PH.state;
    const l = D.laws[id];
    if (s.laws[id]) {
      s.laws[id] = false;
      PH.fx(l.off || {});
      PH.Turn.log(`${l.n} kaldırıldı.`, 'law');
    } else {
      s.laws[id] = true;
      PH.fx(l.on || {});
      s.stats.laws++; s.reign.laws++;
      PH.Turn.log(`${l.n} ilan edildi.`, 'law');
    }
    s.cd['law_' + id] = s.turn + 6;
  };

  return Eco;
})();
