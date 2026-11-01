/* Padişah Hayatı — Oyun durumu ve yeni oyun kurulumu */
PH.St = (function () {
  const U = PH.U, D = PH.D, C = PH.C;
  const St = {};

  St.DIFF = {
    kolay: { n: 'Kolay', money: 1.5, enemy: 0.8, events: 0.85 },
    normal: { n: 'Normal', money: 1, enemy: 1, events: 1 },
    zor: { n: 'Zor', money: 0.6, enemy: 1.25, events: 1.15 },
  };

  St.blank = () => ({
    v: 1, era: 1, diff: 'normal', year: 1520, month: 2, turn: 0,
    capital: 'istanbul', nextId: 1, chars: {}, sultanId: null,
    dynasty: { rulers: [], succession: 'tayin', heirId: null },
    emp: { treasury: 0, debt: 0, tax: 2, purity: 100, popularity: 50, stability: 50, prestige: 50, legitimacy: 50, janissary: 50, ulema: 50, corruption: 20, food: 50 },
    army: { jan: 0, sip: 0, azap: 0, nizam: 0, cannons: 0, ships: 0, morale: 60, training: 60 },
    offices: {}, provs: {}, nations: {}, campaign: null,
    projects: [], built: [], laws: {}, plots: [], log: [], eventQueue: [],
    flags: {}, cd: {}, vakit: 4, vakitMax: 4,
    stats: { battlesWon: 0, battlesLost: 0, conquests: 0, lost: 0, executions: 0, buildings: 0, laws: 0, poems: 0, justice: 0, hunts: 0, kids: 0 },
    reign: null, last: null, succession: null, gameOver: null, notices: [],
  });

  St.newReignStats = (s) => ({ start: { y: s.year, m: s.month }, conquests: 0, lost: 0, battlesWon: 0, battlesLost: 0, executions: 0, buildings: 0, laws: 0, poems: 0, justice: 0, cruelty: 0, piousActs: 0, hunts: 0 });

  /** Yeni oyun */
  St.newGame = (o) => {
    const era = D.eras[o.era];
    const diff = St.DIFF[o.diff] || St.DIFF.normal;
    const s = St.blank();
    PH.state = s;
    s.era = era.id; s.diff = o.diff; s.year = era.year; s.month = 2; s.capital = era.capital;
    s.emp = Object.assign(s.emp, era.emp, { treasury: Math.round(era.treasury * diff.money), debt: era.debt || 0, food: era.food, tax: 2, purity: 100 });
    s.army = Object.assign({}, era.army);
    s.laws = Object.assign({}, era.laws);
    s.dynasty.succession = era.succession;

    // Eyaletler
    D.provList.forEach((p) => {
      const owner = p.own[era.id];
      if (!owner) return;
      s.provs[p.id] = {
        id: p.id, owner, dev: p.dev, unrest: U.ri(5, 22), gov: null, bld: [], rebel: false,
        fort: p.fort, exempt: 0, conq: -999, vassal: owner === 'osm' && p.vassal,
      };
    });
    if (era.id === 2) { ['konya', 'sivas', 'ankara', 'maras'].forEach((id) => s.provs[id] && (s.provs[id].unrest = U.ri(35, 55))); }

    // Devletler
    era.nations.forEach((nid) => {
      const nd = D.nations[nid];
      s.nations[nid] = {
        id: nid, rel: nd.rel[era.id] || 0, str: Math.round((nd.str[era.id] || 10000) * diff.enemy),
        ships: nd.ships[era.id] || 0, war: false, ws: 0, weary: 0, truce: 0, ally: false, trade: false,
        tribute: 0, intel: 0, cd: {}, ruler: PH.Dip.rulerName(nid, era.id), rulerAge: U.ri(25, 60),
      };
    });
    if (era.id === 0) { s.nations.krm.ally = true; s.nations.byz.tribute = 300000; }
    if (era.id === 1) { s.nations.fra.trade = true; }
    if (era.id === 3) { s.nations.fra.trade = true; s.nations.rus.rel = -55; }

    // Padişah
    const up = D.upbringing.find((u) => u.id === o.upbringing) || D.upbringing[0];
    const sk = { idare: 6, askeri: 6, diplomasi: 6, entrika: 5, ilim: 6 };
    for (const k in up.sk) sk[k] += up.sk[k];
    o.traits.forEach((t) => { const td = D.traits[t]; if (td && td.sk) for (const k in td.sk) sk[k] = Math.max(0, sk[k] + td.sk[k]); });
    const sul = C.create({ g: 'm', name: o.name, age: o.age, role: 'sultan', traits: o.traits.slice(), sk, op: 100, amb: 50, hp: 92, dyn: true });
    sul.mahlas = o.mahlas || U.pick(D.mahlas);
    sul.happiness = 60; sul.stress = 25; sul.piety = C.has(sul, 'dindar') ? 65 : 45;
    sul.upbringing = up.id;
    s.sultanId = sul.id;
    s.vakitMax = 4 + (C.has(sul, 'caliskan') ? 1 : 0) - (C.has(sul, 'tembel') ? 1 : 0);
    s.vakit = s.vakitMax;
    s.reign = St.newReignStats(s);

    // Merhum baba
    const faName = U.pick(D.names.sultan.filter((n) => n !== o.name));
    const fa = C.create({ g: 'm', name: faName, age: o.age + U.ri(20, 30), role: 'exsultan', dyn: true, traits: C.randTraits() });
    C.kill(fa, 'eceliyle');
    s.succession = null; // kill padişah değil, ama emniyet
    fa.dy = s.year; fa.dm = Math.max(0, s.month - 1);
    sul.fa = fa.id;
    s.dynasty.rulers.push({ id: fa.id, name: faName, from: era.year - U.ri(8, 25), to: era.year, lakab: '', cause: 'eceliyle vefat' });

    // Valide
    const moAge = o.age + U.ri(17, 23);
    const mo = C.create({ g: 'f', name: U.pick(D.names.cariye), age: moAge, role: 'valide', op: U.ri(55, 85), amb: U.ri(40, 85), origin: U.pick(D.names.origins), traits: C.randTraits({ g: 'f' }) });
    sul.mo = mo.id;
    if (moAge > 70 && U.chance(0.6)) C.kill(mo, 'eceliyle');

    // Kardeşler
    const nBro = U.ri(0, era.brothers === 'kafes' ? 3 : 2);
    for (let i = 0; i < nBro; i++) {
      const ba = U.clamp(o.age + U.ri(-8, 6), 8, 50);
      const b = C.create({ g: 'm', age: ba, name: U.pick(D.names.sultan.filter((n) => n !== o.name)), role: 'dyn', dyn: true, fa: fa.id, op: U.ri(-30, 30), amb: U.ri(30, 85) });
      b.mo = U.chance(0.4) ? mo.id : null;
      if (era.brothers === 'kafes') b.kafes = true;
      else if (ba >= 15) b.sancak = U.pick(D.names.sancaks);
    }
    const nSis = U.ri(0, 2);
    for (let i = 0; i < nSis; i++) {
      C.create({ g: 'f', age: U.clamp(o.age + U.ri(-8, 6), 6, 50), role: 'dyn', dyn: true, fa: fa.id, mo: U.chance(0.5) ? mo.id : null, op: U.ri(20, 60) });
    }

    // Harem ve çocuklar
    St.genHarem(s, sul, o.age);

    // Divan
    D.officeOrder.forEach((off) => {
      const od = D.offices[off];
      const c = C.statesman(od.cls, { focus: od.key, age: U.ri(35, 65) });
      St.assign(off, c, true);
    });
    // Valiler
    Object.values(s.provs).forEach((p) => {
      if (p.owner !== 'osm' || p.vassal || p.id === s.capital) return;
      const g = C.statesman('pasa', { age: U.ri(30, 60) });
      g.gov = p.id; p.gov = g.id;
    });
    // Makamsız aday havuzu
    for (let i = 0; i < 4; i++) C.statesman('pasa');
    C.statesman('ulema'); C.statesman('kalem'); C.statesman('aga');

    // Kızlar evliyse damat
    C.list((c) => c.dyn && c.g === 'f' && C.age(c) >= 16 && c.fa === fa.id).forEach((d) => {
      if (U.chance(0.6)) {
        const pasa = U.pick(C.list((x) => x.role === 'devlet' && x.cls === 'pasa' && !x.spouse));
        if (pasa) { d.spouse = pasa.id; pasa.spouse = d.id; pasa.nick = 'Damat'; pasa.op = Math.min(100, pasa.op + 20); }
      }
    });

    s.log = [];
    PH.Turn.log(`${C.name(sul)} ${era.year} yılında ${D.eras[o.era].n} döneminde Osmanlı tahtına cülus etti.`, 'major');

    // Başlangıç olayları
    PH.E.push('cülus', {});
    const bros = C.list((c) => c.dyn && c.g === 'm' && c.fa === fa.id && c.id !== sul.id);
    if (bros.length) PH.E.push('kardesler', {});
    if (era.id === 0) PH.E.push('era0_intro', {});
    if (era.id === 3) PH.E.push('era3_intro', {});
    return s;
  };

  St.genHarem = (s, sul, age) => {
    if (age < 17) return;
    const n = age < 20 ? 1 : age < 26 ? U.ri(1, 2) : U.ri(2, 4);
    const women = [];
    for (let i = 0; i < n; i++) {
      const rank = i === 0 ? (s.era <= 1 ? 'haseki' : 'kadin') : U.pick(['kadin', 'ikbal', 'gozde']);
      const w = C.create({
        g: 'f', role: 'harem', rank, age: U.clamp(age - U.ri(2, 8), 18, 40), name: U.pick(PH.D.names.cariye),
        op: U.ri(30, 80), amb: U.ri(20, 80), favor: i === 0 ? U.ri(60, 85) : U.ri(25, 60), origin: U.pick(PH.D.names.origins),
        traits: C.randTraits({ g: 'f' }),
      });
      women.push(w);
    }
    // çocuklar
    let kids = age < 21 ? U.ri(0, 1) : age < 28 ? U.ri(1, 3) : U.ri(2, 5);
    for (let i = 0; i < kids; i++) {
      const mother = U.pick(women);
      const maxAge = Math.min(age - 17, C.age(mother) - 17);
      if (maxAge < 0) continue;
      const ka = U.ri(0, maxAge);
      const g = U.chance(0.52) ? 'm' : 'f';
      const kid = C.create({ g, age: ka, role: 'dyn', dyn: true, fa: sul.id, mo: mother.id, op: U.ri(40, 80), amb: U.ri(10, 60), name: g === 'm' ? U.pick(PH.D.names.sultan) : U.pick(PH.D.names.female) });
      kid.sk = C.randSkills({ base: Math.round(ka / 3) });
      if (ka >= 6) kid.edu = { focus: U.pick(C.SK), q: U.ri(1, 2) };
      if (g === 'm' && ka >= 15) {
        if (s.laws.kafes) kid.kafes = true; else kid.sancak = U.pick(PH.D.names.sancaks);
      }
    }
  };

  /** Makama ata */
  St.assign = (off, c, silent) => {
    const s = PH.state;
    const cur = C.get(s.offices[off]);
    if (cur) { cur.office = null; }
    if (c) {
      if (c.office) s.offices[c.office] = null;
      if (c.gov) { const p = s.provs[c.gov]; if (p) p.gov = null; c.gov = null; }
      c.office = off;
      s.offices[off] = c.id;
      if (!silent) C.opinion(c, 15);
    } else s.offices[off] = null;
  };

  St.officer = (off) => C.get(PH.state.offices[off]);
  /** Makam yeteneği (boşsa düşük değer) */
  St.offSkill = (off, key) => {
    const c = St.officer(off);
    if (!c) return 2;
    return c.sk[key || D.offices[off].key];
  };

  return St;
})();
