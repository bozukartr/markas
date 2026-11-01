/* Padişah Hayatı — Ordu, seferler, meydan muharebeleri ve kuşatmalar */
PH.Mil = (function () {
  const U = PH.U, D = PH.D, C = PH.C;
  const M = {};
  M.UNITS = ['jan', 'sip', 'azap', 'nizam', 'cannons'];
  M.UNIT_N = { jan: 'Yeniçeri', sip: 'Tımarlı Sipahi', azap: 'Azap ve Akıncı', nizam: 'Nizam-ı Cedid', cannons: 'Top', ships: 'Kadırga/Kalyon' };

  M.janQ = () => {
    const s = PH.state;
    let q = D.eras[s.era].janQ;
    q += (s.army.training - 60) / 150;
    return Math.max(0.5, q);
  };

  /** Bir kuvvetin savaş gücü */
  M.power = (f) => {
    const s = PH.state;
    const raw = (f.jan || 0) * M.janQ() + (f.sip || 0) * (s.laws.timar ? 1.1 : 1) + (f.azap || 0) * 0.5 + (f.nizam || 0) * 2.1 + (f.cannons || 0) * 40;
    const mt = 0.65 + s.army.training / 300 + s.army.morale / 300;
    return Math.round(raw * mt);
  };

  M.home = () => {
    const s = PH.state;
    const a = s.army;
    const c = s.campaign ? s.campaign.forces : {};
    const out = {};
    M.UNITS.forEach((k) => (out[k] = Math.max(0, a[k] - (c[k] || 0))));
    return out;
  };

  M.totalMen = (f) => (f.jan || 0) + (f.sip || 0) + (f.azap || 0) + (f.nizam || 0);

  M.strWord = (ratio) => (ratio > 1.8 ? 'Ezici üstünlük' : ratio > 1.25 ? 'Üstün' : ratio > 0.85 ? 'Denk' : ratio > 0.55 ? 'Zayıf' : 'Çok zayıf');

  /** Asker toplama */
  M.recruitCost = (unit, n) => {
    const s = PH.state;
    let c = PH.Eco.RECRUIT[unit] * n;
    if (unit === 'ships' && PH.Eco.hasBuilding('tersane')) c *= 0.7;
    if (unit === 'cannons' && PH.Eco.hasBuilding('tophane')) c *= 0.7;
    return Math.round(c);
  };

  M.recruit = (unit, n) => {
    const s = PH.state;
    const cost = M.recruitCost(unit, n);
    PH.fx({ treasury: -cost, [unit]: n });
    if (unit === 'jan') { PH.fx({ training: -Math.min(8, n / 1500) }); }
    if (unit === 'nizam') PH.fx({ janissary: -Math.min(10, Math.round(n / 800)) });
    if (unit === 'azap') PH.fx({ popularity: -Math.min(5, Math.round(n / 3000)) });
  };

  M.disband = (unit, n) => {
    const s = PH.state;
    const home = M.home();
    n = Math.min(n, home[unit] || s.army[unit]);
    PH.fx({ [unit]: -n });
    if (unit === 'jan') PH.fx({ janissary: -Math.min(20, Math.round(n / 400)), stability: -Math.round(n / 2000) });
    if (unit === 'sip') PH.fx({ popularity: -1 });
    return n;
  };

  /* ---------- Seferler ---------- */
  M.distance = (provId) => {
    const s = PH.state;
    let d = D.prov[provId].dist;
    if (s.capital === 'edirne' && D.prov[provId].reg === 'Anadolu') d += 1;
    return Math.max(1, d);
  };

  M.targets = (nid) => Object.values(PH.state.provs).filter((p) => p.owner === nid);

  M.canCampaign = (provId, forces) => {
    const s = PH.state;
    const p = s.provs[provId];
    const pd = D.prov[provId];
    if (s.campaign) return 'Zaten bir sefer devam ediyor';
    if (!p) return 'Hedef yok';
    const n = s.nations[p.owner];
    if (!n || !n.war) return 'Bu devletle savaşta değilsiniz';
    if (pd.island && s.army.ships < 40) return 'Ada seferi için en az 40 gemi gerekir';
    if (M.totalMen(forces) < 5000) return 'En az 5.000 asker gerekir';
    return null;
  };

  M.commanders = () => {
    const s = PH.state;
    const list = [C.sultan()];
    ['sadrazam', 'vezir2', 'vezir3', 'kaptan', 'yeniceri'].forEach((o) => { const c = PH.St.officer(o); if (c) list.push(c); });
    C.list((c) => c.gov && c.role === 'devlet' && c.sk.askeri >= 10).slice(0, 3).forEach((c) => list.push(c));
    C.list((c) => c.dyn && c.g === 'm' && c.sancak && C.age(c) >= 18).forEach((c) => list.push(c));
    return Array.from(new Set(list));
  };

  M.startCampaign = (provId, forces, cmdId) => {
    const s = PH.state;
    const p = s.provs[provId];
    const months = M.distance(provId);
    s.campaign = {
      target: provId, nation: p.owner, forces: Object.assign({}, forces), cmd: cmdId,
      phase: 'march', left: months, siege: 0, months: 0, battles: 0, start: s.turn, ret: false,
    };
    const sul = C.sultan();
    s.flags.lastWar = s.turn;
    PH.fx({ janissary: 4, morale: 4 });
    if (cmdId === sul.id) {
      PH.fx({ prestige: 2, stress: 6 });
      PH.Turn.log(`${C.name(sul)} bizzat ${U.dat(D.prov[provId].n)} sefere çıktı. Tuğlar dikildi, otağ-ı hümâyun kuruldu.`, 'war');
    } else PH.Turn.log(`${C.name(C.get(cmdId))} serdar tayin edilerek ${U.dat(D.prov[provId].n)} sefere gönderildi.`, 'war');
  };

  M.cmd = () => C.get(PH.state.campaign && PH.state.campaign.cmd);
  M.cmdSkill = () => { const c = M.cmd(); return c ? c.sk.askeri : 3; };

  M.campaignPower = () => {
    const s = PH.state;
    const cp = s.campaign;
    return Math.round(M.power(cp.forces) * (1 + M.cmdSkill() * 0.025) * (cp.cmd === s.sultanId && C.has(C.sultan(), 'cesur') ? 1.08 : 1));
  };

  M.enemyField = (nid) => {
    const n = PH.state.nations[nid];
    return Math.round(n.str * U.rf(0.55, 0.85));
  };

  /** Aylık sefer işleyişi */
  M.monthly = (rep) => {
    const s = PH.state;
    const cp = s.campaign;
    if (cp) {
      cp.months++;
      // kış ve hastalık yıpranması
      const winter = U.isWinter(s.month);
      let attr = winter ? 0.035 : 0.008;
      if (cp.phase === 'siege') attr += 0.01;
      M.UNITS.forEach((k) => {
        if (k === 'cannons') return;
        const loss = Math.round(cp.forces[k] * attr * U.rf(0.5, 1.5));
        cp.forces[k] -= loss; s.army[k] -= loss;
      });
      if (winter && cp.phase !== 'return') s.army.morale = Math.max(0, s.army.morale - 3);
      const n = s.nations[cp.nation];
      if ((!n || !n.war) && cp.phase !== 'return') { cp.phase = 'return'; cp.left = Math.max(1, Math.ceil(M.distance(cp.target) / 2)); PH.Turn.log('Barış yapıldığı için ordu geri dönüyor.', 'war'); }
      if (cp.phase === 'march') {
        cp.left--;
        if (cp.left <= 0) {
          // düşman ordusu karşılar mı?
          if (U.chance(0.75)) { cp.phase = 'battle'; PH.E.push('meydan', {}); }
          else { cp.phase = 'siege'; PH.Turn.log(`Ordu ${D.prov[cp.target].n} önlerine ulaştı ve muhasara başladı.`, 'war'); PH.E.push('kusatma', {}); }
        } else if (U.chance(0.18)) PH.E.push('sefer_yol', {});
      } else if (cp.phase === 'siege') {
        const p = s.provs[cp.target];
        const pr = (6 + cp.forces.cannons / 25 + M.cmdSkill() * 0.5 + (PH.Eco.hasBuilding('tophane') ? 3 : 0) + (s.flags.sahiTopu ? 4 : 0) + (s.flags.esrefUntil > s.turn ? 2 : 0)) * U.rf(0.6, 1.3) / (p.fort * 0.45 + 0.4);
        cp.siege = Math.min(100, cp.siege + pr);
        if (cp.siege >= 100) M.conquer(cp.target, rep);
        else if (U.chance(0.12) && !s.flags.reliefThis) { s.flags.reliefThis = true; PH.E.push('yardim_ordusu', {}); }
        else PH.E.push('kusatma', {});
      } else if (cp.phase === 'return') {
        cp.left--;
        if (cp.left <= 0) M.endCampaign();
      }
    }
    M.enemyActions(rep);
  };

  /** Meydan muharebesi çözümü. tactic: 'hilal' | 'top' | 'merkez' | 'pusu' | 'ricat' */
  M.TACTICS = {
    hilal: { n: 'Hilal Düzeni', d: 'Merkezde yeniçeriler ve toplar, kanatlarda sipahiler düşmanı sarar.', beats: 'hucum', weak: 'kanat' },
    top: { n: 'Tabur Cengi ve Top Ateşi', d: 'Arabalar zincirlenir, toplar ateş açar; düşman saldırısını bekleriz.', beats: 'hucum', weak: 'savunma' },
    merkez: { n: 'Yeniçeri Merkez Hücumu', d: 'Yeniçeriler doğrudan düşman merkezine yüklenir.', beats: 'savunma', weak: 'hucum' },
    pusu: { n: 'Akıncı Pususu', d: 'Akıncılar sahte ricatla düşmanı tuzağa çeker, sipahiler yandan vurur.', beats: 'kanat', weak: 'savunma' },
  };
  M.POSTURE_N = { hucum: 'saldırı', savunma: 'savunma', kanat: 'kanat manevrası' };

  M.battleSetup = () => {
    const s = PH.state;
    const cp = s.campaign;
    if (!cp.enemy) {
      cp.enemy = { str: M.enemyField(cp.nation), posture: U.pick(['hucum', 'savunma', 'kanat']), self: U.chance(0.5) };
    }
    // keşif: doğru bilgi ihtimali
    const acc = U.clamp(0.45 + M.cmdSkill() * 0.025 + (s.nations[cp.nation].intel > s.turn ? 0.25 : 0), 0.3, 0.95);
    if (!cp.enemy.scout) cp.enemy.scout = U.chance(acc) ? cp.enemy.posture : U.pick(['hucum', 'savunma', 'kanat']);
    cp.enemy.acc = acc;
    return cp.enemy;
  };

  M.resolveBattle = (tactic) => {
    const s = PH.state;
    const cp = s.campaign;
    const en = cp.enemy;
    const t = M.TACTICS[tactic];
    let mod = 1;
    if (t.beats === en.posture) mod = 1.3;
    else if (t.weak === en.posture) mod = 0.78;
    if (tactic === 'pusu' && cp.forces.azap < 3000) mod *= 0.85;
    if (tactic === 'top' && cp.forces.cannons < 60) mod *= 0.85;
    const ours = M.campaignPower() * mod * U.rf(0.8, 1.2) * (s.flags.esrefUntil > s.turn ? 1.08 : 1);
    const theirs = en.str * U.rf(0.8, 1.2);
    const ratio = ours / (ours + theirs);
    const win = ratio > 0.5;
    const ourLoss = win ? U.rf(0.05, 0.14) * (1.4 - ratio) : U.rf(0.18, 0.35);
    const theirLoss = win ? U.rf(0.25, 0.5) : U.rf(0.06, 0.15);
    const lost = {};
    M.UNITS.forEach((k) => {
      if (k === 'cannons') { lost[k] = win ? 0 : Math.round(cp.forces[k] * U.rf(0.1, 0.4)); }
      else lost[k] = Math.round(cp.forces[k] * ourLoss * (C.has(C.sultan(), 'temkinli') && cp.cmd === s.sultanId ? 0.8 : 1));
      cp.forces[k] -= lost[k]; s.army[k] -= lost[k];
    });
    const n = s.nations[cp.nation];
    n.str = Math.max(2000, Math.round(n.str - en.str * theirLoss));
    cp.enemy = null; cp.battles++;
    const res = { win, ratio, lost, enemyLost: Math.round(en.str * theirLoss), tactic, posture: en.posture };
    const sul = C.sultan();
    const isSul = cp.cmd === s.sultanId;
    if (win) {
      n.ws = Math.min(100, n.ws + 15); n.weary += 10;
      s.stats.battlesWon++; s.reign.battlesWon++;
      PH.fx({ prestige: 4 + (isSul ? 3 : 0), morale: 8, janissary: 4, popularity: 2 });
      if (isSul) { PH.fx({ askeri: 1 }); if (!C.has(sul, 'gazi') && U.chance(0.5)) C.addTrait(sul, 'gazi'); }
      else { const c = M.cmd(); if (c) { C.opinion(c, 5, true); c.sk.askeri = Math.min(30, c.sk.askeri + 1); } }
      cp.phase = 'siege';
      PH.Turn.log(`${D.prov[cp.target].n} önlerinde ${M.TACTICS[tactic].n} ile büyük zafer kazanıldı!`, 'war');
    } else {
      n.ws = Math.max(-100, n.ws - 15);
      s.stats.battlesLost++; s.reign.battlesLost++;
      PH.fx({ prestige: -5, morale: -15, janissary: -6, popularity: -3, stress: isSul ? 10 : 4 });
      cp.phase = 'return'; cp.left = Math.max(1, Math.ceil(M.distance(cp.target) / 2));
      PH.Turn.log(`${D.prov[cp.target].n} önlerinde ordu bozguna uğradı.`, 'war');
      if (isSul && U.chance(0.12)) { PH.fx({ health: -U.ri(10, 25) }); res.wounded = true; if (U.chance(0.5)) C.addTrait(sul, 'yarali'); }
    }
    return res;
  };

  M.assault = () => {
    const s = PH.state;
    const cp = s.campaign;
    const p = s.provs[cp.target];
    const chance = U.clamp(0.25 + cp.siege / 160 + M.cmdSkill() * 0.01 - p.fort * 0.05 + (s.army.morale - 50) / 300, 0.05, 0.9);
    const ok = U.chance(chance);
    const lossR = ok ? U.rf(0.06, 0.12) : U.rf(0.1, 0.2);
    ['jan', 'azap', 'nizam'].forEach((k) => { const l = Math.round(cp.forces[k] * lossR); cp.forces[k] -= l; s.army[k] -= l; });
    if (ok) cp.siege = 100;
    else { cp.siege = Math.max(0, cp.siege - 10); PH.fx({ morale: -8 }); }
    return { ok, chance };
  };

  M.conquer = (provId, rep) => {
    const s = PH.state;
    const p = s.provs[provId];
    const pd = D.prov[provId];
    const oldOwner = p.owner;
    const n = s.nations[oldOwner];
    p.owner = 'osm'; p.conq = s.turn; p.unrest = 55; p.rebel = false; p.gov = null; p.vassal = false;
    p.fort = Math.max(1, p.fort - 1);
    s.stats.conquests++; s.reign.conquests++;
    const booty = Math.round(pd.inc * 1000 * U.rf(8, 16));
    PH.fx({ treasury: booty, prestige: 6 + (pd.cap ? 10 : 0) + (pd.holy ? 8 : 0), popularity: 3, janissary: 6, legitimacy: 2 });
    s.flags.bootyUntil = s.turn + 6;
    if (n) { n.ws = Math.min(100, n.ws + (pd.cap === oldOwner ? 40 : 25)); n.weary += 15; n.str = Math.round(n.str * 0.9); }
    if (pd.cap === oldOwner) s.reign.capitalTaken = true;
    PH.Turn.log(`${pd.n} fethedildi! Ganimet: ${U.money(booty, true)}.`, 'major');
    if (rep) rep.notes.push({ i: 'flag', t: `${pd.n} fethedildi!` });
    if (s.campaign && s.campaign.target === provId) {
      s.campaign.phase = 'return'; s.campaign.left = Math.max(1, Math.ceil(M.distance(provId) / 2));
      PH.E.push('fetih', { p: provId, booty, from: oldOwner });
    }
    // devlet tüm topraklarını kaybettiyse
    if (n && !M.targets(oldOwner).length) {
      PH.Turn.log(`${D.nations[oldOwner].n[s.era]} tarih sahnesinden silindi.`, 'major');
      n.war = false; n.dead = true;
    }
  };

  M.endCampaign = () => {
    const s = PH.state;
    if (!s.campaign) return;
    PH.Turn.log('Sefer ordusu payitahta döndü.', 'war');
    s.campaign = null;
    delete s.flags.reliefThis;
  };

  M.abortSiege = () => {
    const s = PH.state;
    const cp = s.campaign;
    cp.phase = 'return';
    cp.left = Math.max(1, Math.ceil(M.distance(cp.target) / 2));
    PH.fx({ prestige: -3, morale: -5, janissary: -3 });
    PH.Turn.log(`${D.prov[cp.target].n} kuşatması kaldırıldı.`, 'war');
  };

  /* ---------- Düşman hamleleri ---------- */
  M.enemyActions = (rep) => {
    const s = PH.state;
    const home = M.power(M.home());
    Object.values(s.nations).forEach((n) => {
      if (!n.war || n.dead) return;
      n.weary += 1.5;
      const ourBorder = Object.values(s.provs).filter((p) => p.owner === 'osm' && p.id !== s.capital);
      if (!ourBorder.length) return;
      const ratio = n.str / Math.max(5000, home);
      const p = 0.025 + Math.min(0.08, ratio * 0.03);
      if (U.chance(p * PH.St.DIFF[s.diff].events) && !s.eventQueue.some((e) => e.id === 'dusman_saldiri')) {
        // hedef: düşmana yakın eyalet (uzaklık benzerliği)
        const theirs = M.targets(n.id);
        const avgDist = theirs.length ? U.avg(theirs, (x) => D.prov[x.id].dist) : 3;
        const sorted = ourBorder.slice().sort((a, b) => Math.abs(D.prov[a.id].dist - avgDist) - Math.abs(D.prov[b.id].dist - avgDist));
        const target = U.pick(sorted.slice(0, 4));
        PH.E.push('dusman_saldiri', { n: n.id, p: target.id, str: Math.round(n.str * U.rf(0.35, 0.6)) });
      }
      // barış isteği
      if (n.ws > 35 && n.weary > 40 && U.chance(0.12) && !s.eventQueue.some((e) => e.id === 'baris_teklifi')) PH.E.push('baris_teklifi', { n: n.id });
      // kazanan düşmanın ağır barış talebi
      if (n.ws < -35 && n.weary > 25 && U.chance(0.1) && !s.eventQueue.some((e) => e.id === 'baris_talebi')) PH.E.push('baris_talebi', { n: n.id });
    });
  };

  /** Savunma muharebesi */
  M.defend = (nid, provId, enemyStr, mode) => {
    const s = PH.state;
    const p = s.provs[provId];
    const home = M.home();
    let ours;
    if (mode === 'ordu') ours = M.power(home) * 0.7 * (1 + PH.St.offSkill('vezir2') * 0.02);
    else ours = (p.fort * 7000 + 5000) * (1 + (C.get(p.gov) ? C.get(p.gov).sk.askeri * 0.03 : 0)) * (s.flags.esrefUntil > s.turn ? 1.1 : 1);
    ours *= U.rf(0.8, 1.2);
    const theirs = enemyStr * U.rf(0.8, 1.2) * (mode === 'kale' ? 0.75 : 1);
    const win = ours > theirs;
    const n = s.nations[nid];
    if (mode === 'ordu') {
      const lr = win ? U.rf(0.03, 0.08) : U.rf(0.1, 0.2);
      ['jan', 'sip', 'azap', 'nizam'].forEach((k) => PH.fx({ [k]: -Math.round(home[k] * 0.7 * lr) }));
    }
    if (win) {
      n.ws = Math.min(100, n.ws + 10); n.str = Math.round(n.str * 0.93); n.weary += 6;
      PH.fx({ prestige: 2, morale: 4 });
    } else {
      n.ws = Math.max(-100, n.ws - (mode === 'kale' ? 20 : 15));
      PH.fx({ prestige: -4, morale: -6 });
      if (mode === 'kale' && U.chance(0.45)) {
        // kale düşmedi ama eyalet yağmalandı
        p.dev = Math.max(1, p.dev - 1); p.unrest = Math.min(100, p.unrest + 20);
        PH.Turn.log(`${D.prov[provId].n} yağmalandı, ama kale düşmedi.`, 'war');
        return 'yagma';
      }
      if (mode === 'kale' || mode === 'ordu') {
        // eyalet düşer
        p.owner = nid; p.gov = null; p.rebel = false; p.conq = s.turn; p.bld = p.bld.filter(() => U.chance(0.6));
        s.stats.lost++; s.reign.lost++;
        PH.fx({ prestige: -6, popularity: -4, legitimacy: -3 });
        PH.Turn.log(`${D.prov[provId].n} düşman eline geçti!`, 'major');
        C.list((c) => c.gov === provId).forEach((c) => (c.gov = null));
      }
    }
    return win;
  };

  return M;
})();
