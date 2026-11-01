/* Padişah Hayatı — Harem, hanedan ve veraset */
PH.Harem = (function () {
  const U = PH.U, D = PH.D, C = PH.C;
  const H = {};

  H.RANKS = ['cariye', 'gozde', 'ikbal', 'kadin', 'haseki'];
  H.RANK_N = { cariye: 'Cariye', gozde: 'Gözde', ikbal: 'İkbal', kadin: 'Kadın', haseki: 'Haseki Sultan' };

  H.women = () => C.list((c) => c.role === 'harem').sort((a, b) => H.RANKS.indexOf(b.rank) - H.RANKS.indexOf(a.rank) || b.favor - a.favor);
  H.valide = () => C.list((c) => c.role === 'valide')[0] || null;
  H.kids = () => C.children(PH.state.sultanId).sort((a, b) => a.by - b.by || a.bm - b.bm);

  H.fertility = (w) => {
    const a = C.age(w);
    if (a < 16 || a > 44) return 0;
    if (a <= 32) return 1;
    if (a <= 37) return 0.6;
    return 0.25;
  };

  /** Haseki/kadını ziyaret */
  H.visit = (w) => {
    const s = PH.state;
    const sul = C.sultan();
    w.favor = U.clamp((w.favor || 30) + U.ri(6, 12) + (C.has(w, 'guzel') ? 3 : 0) + (C.has(w, 'zarif') ? 2 : 0), 0, 100);
    C.opinion(w, U.ri(3, 7));
    const mood = { happiness: U.ri(4, 9), stress: -U.ri(3, 7) };
    if (C.has(w, 'zarif')) mood.happiness += 3;
    PH.fx(mood);
    let txt = U.pick([
      `${C.name(w)} ile has bahçede uzun bir akşam geçirdiniz. Saz heyetinin nağmeleri arasında devletin dertleri bir süre unutuldu.`,
      `${C.name(w)} size kendi elleriyle şerbet ikram etti; sohbetiniz gece yarısına dek sürdü.`,
      `${C.name(w)} ile satranç oynadınız. Sizi yenmesine izin verip vermediğinden hiçbir zaman emin olamadınız.`,
      `${C.name(w)} size bir gazel okudu; sesi sarayın soğuk taş duvarlarını ısıtıyordu.`,
    ]);
    // rakip kıskançlığı
    H.women().filter((x) => x.id !== w.id && C.has(x, 'kiskanc')).forEach((x) => C.opinion(x, -3, true));
    // gebelik
    if (!w.preg) {
      const hpF = sul.hp > 60 ? 1 : sul.hp / 60;
      const p = 0.17 * H.fertility(w) * hpF * (C.age(sul) > 55 ? 0.5 : 1);
      if (U.chance(p)) {
        w.preg = 9;
        s.flags['pregNotice' + w.id] = s.turn + U.ri(1, 2);
      }
    }
    return txt;
  };

  H.promote = (w) => {
    const i = H.RANKS.indexOf(w.rank);
    if (i >= H.RANKS.length - 1) return false;
    const next = H.RANKS[i + 1];
    if (next === 'haseki' && H.women().some((x) => x.rank === 'haseki' && x.id !== w.id) && PH.state.era >= 2) return false;
    w.rank = next;
    C.opinion(w, 15);
    w.amb = Math.min(100, w.amb + 5);
    // diğerleri kıskanır
    H.women().filter((x) => x.id !== w.id && H.RANKS.indexOf(x.rank) >= 2).forEach((x) => C.opinion(x, -8));
    const v = H.valide();
    if (v && next === 'haseki') C.opinion(v, -6);
    PH.Turn.log(`${w.name} ${H.RANK_N[next]} mertebesine yükseltildi.`, 'harem');
    return true;
  };

  H.newCandidates = () => {
    const out = [];
    for (let i = 0; i < 3; i++) {
      const c = C.create({
        g: 'f', role: 'aday', age: U.ri(16, 22), name: U.pick(D.names.cariye), origin: U.pick(D.names.origins),
        op: U.ri(10, 50), amb: U.ri(10, 90), favor: U.ri(10, 30), traits: C.randTraits({ g: 'f' }),
      });
      c.alive = true;
      out.push(c);
    }
    return out;
  };

  H.acceptCandidate = (c, others) => {
    c.role = 'harem'; c.rank = 'cariye';
    (others || []).forEach((o) => { if (o.id !== c.id) delete PH.state.chars[o.id]; });
    PH.Turn.log(`${c.name} (${c.origin}) harem-i hümâyuna kabul edildi.`, 'harem');
  };

  H.cleanupCandidates = () => {
    const s = PH.state;
    Object.values(s.chars).forEach((c) => { if (c.role === 'aday') delete s.chars[c.id]; });
  };

  /** Haremden çıkarıp bir paşayla evlendir */
  H.marryOff = (w, pasa) => {
    w.role = 'evli';
    w.spouse = pasa.id; pasa.spouse = w.id;
    C.opinion(pasa, 20);
    PH.Turn.log(`${w.name} azat edilerek ${C.name(pasa)} ile evlendirildi.`, 'harem');
  };

  H.marryDaughter = (d, pasa) => {
    d.spouse = pasa.id; pasa.spouse = d.id;
    if (!pasa.nick || pasa.nick !== 'Damat') pasa.nick = 'Damat';
    C.opinion(pasa, 35);
    pasa.amb = Math.min(100, pasa.amb + 10);
    C.opinion(d, U.ri(-10, 15));
    PH.Turn.log(`${d.name} Sultan, ${C.name(pasa)} ile nikâhlandı. Düğün kırk gün kırk gece sürdü.`, 'harem');
  };

  /** Aylık: gebelik ve doğumlar */
  H.monthly = (rep) => {
    const s = PH.state;
    C.list((c) => c.preg).forEach((w) => {
      if (s.flags['pregNotice' + w.id] === s.turn) {
        PH.E.push('gebelik', { w: w.id });
        delete s.flags['pregNotice' + w.id];
      }
      w.preg -= 1;
      if (w.preg <= 0) {
        w.preg = null;
        PH.E.push('dogum', { w: w.id });
      } else if (w.preg === 5 && U.chance(0.06)) {
        w.preg = null;
        PH.E.push('dusuk', { w: w.id });
      }
    });
    // Favor zamanla azalır; ziyaret edilmese de ara sıra gebelik olur
    const sul = C.sultan();
    const age = C.age(sul);
    H.women().forEach((w) => {
      w.favor = U.clamp((w.favor || 30) - 0.8, 0, 100);
      if (!w.preg && age >= 16 && age < 65 && U.chance(0.012 * H.fertility(w) * (0.4 + (w.favor || 0) / 100))) { w.preg = 9; s.flags['pregNotice' + w.id] = s.turn + 1; }
    });
    // Çocuklar büyüyor
    H.kids().forEach((k) => {
      const a = C.age(k);
      if (a === 6 && k.bm === s.month && !k.edu) PH.E.push('egitim', { k: k.id });
      if (k.g === 'm' && a === 15 && k.bm === s.month && !k.sancak && !k.kafes) PH.E.push('sancak_vakti', { k: k.id });
      if (k.g === 'm' && a >= 7 && a <= 11 && !k.sunnet && U.chance(0.02)) PH.E.push('sunnet', { k: k.id });
      if (k.g === 'f' && a >= 15 && !k.spouse && U.chance(0.015)) PH.E.push('talip', { k: k.id });
    });
  };

  /** Doğum gerçekleştir */
  H.birth = (w, g, name) => {
    const s = PH.state;
    const sul = C.sultan();
    const kid = C.create({ g, age: 0, bm: s.month, role: 'dyn', dyn: true, fa: sul.id, mo: w.id, name, op: 60, amb: U.ri(10, 70), hp: U.ri(50, 100) });
    kid.sk = { idare: 0, askeri: 0, diplomasi: 0, entrika: 0, ilim: 0 };
    kid.by = s.year;
    s.stats.kids++;
    if (g === 'm' && H.RANKS.indexOf(w.rank) < 3) w.rank = 'kadin';
    w.favor = Math.min(100, (w.favor || 30) + 10);
    w.amb = Math.min(100, w.amb + (g === 'm' ? 15 : 3));
    PH.Turn.log(`${C.name(kid)} dünyaya geldi. Annesi ${w.name}.`, 'birth');
    return kid;
  };

  H.setEdu = (k, focus, q) => { k.edu = { focus, q }; };

  H.toSancak = (k, sancak) => {
    k.sancak = sancak; k.kafes = false;
    C.opinion(k, 15);
    PH.Turn.log(`${C.name(k)} ${sancak} sancağına çıktı.`, 'dyn');
  };
  H.toKafes = (k) => {
    k.kafes = true; k.sancak = null;
    C.opinion(k, -25);
    PH.Turn.log(`${C.name(k)} kafes dairesine kapatıldı.`, 'dyn');
  };

  /* ---------- Veraset ---------- */
  H.SUCC_N = {
    tayin: 'Padişahın Tayini',
    ekber: 'Ekber-i Evlâd (en büyük oğul)',
    ekberiyet: 'Ekberiyet (hanedanın en yaşlı erkeği)',
  };

  /** Hanedanın tüm yaşayan erkekleri (padişah hariç) */
  H.dynMales = () => C.list((c) => c.dyn && c.g === 'm' && c.id !== PH.state.sultanId && c.role !== 'exsultan');

  H.heirCandidates = () => {
    const s = PH.state;
    const sul = C.sultan();
    const males = H.dynMales().filter((c) => !c.exiled);
    const sons = males.filter((c) => c.fa === sul.id).sort((a, b) => b.by * 12 + b.bm < a.by * 12 + a.bm ? 1 : -1);
    const others = males.filter((c) => c.fa !== sul.id).sort((a, b) => (a.by * 12 + a.bm) - (b.by * 12 + b.bm));
    return { sons: sons.sort((a, b) => (a.by * 12 + a.bm) - (b.by * 12 + b.bm)), others, all: males.sort((a, b) => (a.by * 12 + a.bm) - (b.by * 12 + b.bm)) };
  };

  /** Kurala göre veliaht */
  H.ruleHeir = () => {
    const s = PH.state;
    const h = H.heirCandidates();
    const rule = s.dynasty.succession;
    if (rule === 'ekberiyet') return h.all[0] || null;
    if (rule === 'tayin') {
      const chosen = C.get(s.dynasty.heirId);
      if (chosen && chosen.alive) return chosen;
    }
    return h.sons[0] || h.others[0] || null;
  };

  /** Yeni padişahı tahta çıkar */
  H.succeed = (heir) => {
    const s = PH.state;
    const old = C.sultan();
    const succ = s.succession || { cause: 'feragat' };
    // eski padişahı kaydet
    const lakab = H.lakab();
    old.lakab = lakab;
    const last = s.dynasty.rulers[s.dynasty.rulers.length - 1];
    s.dynasty.rulers.push({ id: old.id, name: old.name, from: s.reign.start.y, to: s.year, lakab, cause: succ.cause, stats: Object.assign({}, s.reign) });
    old.role = 'exsultan';
    if (old.alive && succ.deposed) { old.kafes = true; old.role = 'exsultan'; }
    // eski harem Eski Saray'a
    C.list((c) => c.role === 'harem').forEach((w) => {
      if (w.id === heir.mo) return;
      w.role = 'eskisaray';
    });
    const oldValide = H.valide();
    if (oldValide) oldValide.role = 'eskisaray';
    // yeni valide
    const mo = C.get(heir.mo);
    if (mo && mo.alive) { mo.role = 'valide'; C.opinion(mo, 30); }
    // yeni padişah
    heir.role = 'sultan';
    heir.sancak = null; heir.kafes = false; heir.office = null;
    heir.op = 100;
    heir.happiness = heir.happiness != null ? heir.happiness : 55;
    heir.stress = 30;
    heir.piety = heir.piety != null ? heir.piety : (C.has(heir, 'dindar') ? 65 : 45);
    if (!heir.mahlas) heir.mahlas = U.pick(D.mahlas);
    s.sultanId = heir.id;
    s.dynasty.heirId = null;
    s.vakitMax = 4 + (C.has(heir, 'caliskan') ? 1 : 0) - (C.has(heir, 'tembel') ? 1 : 0);
    s.vakit = s.vakitMax;
    s.reign = PH.St.newReignStats(s);
    s.succession = null;
    // karakterlerin yeni padişaha bakışı yeniden şekillenir
    C.list((c) => c.role === 'devlet').forEach((c) => (c.op = U.clamp(Math.round(c.op * 0.5 + U.ri(-10, 20)), -100, 100)));
    // eski padişahın sevdiği haseki/şehzadeler
    PH.fx({ legitimacy: C.age(heir) < 16 ? -10 : 0, stability: -6, janissary: -5 });
    PH.Turn.log(`${C.name(heir)} ${s.year} yılında tahta çıktı.`, 'major');
    // cülus olayları
    PH.E.push('cülus', {});
    const bros = H.dynMales().filter((c) => c.fa === heir.fa && c.id !== heir.id);
    if (bros.length) PH.E.push('kardesler', {});
    if (C.age(heir) < 16) PH.E.push('naib', {});
    // haremi olmayan genç padişaha Valide cariye seçer
    if (C.age(heir) >= 15 && !H.women().length) {
      const n = C.age(heir) >= 20 ? 2 : 1;
      for (let i = 0; i < n; i++) C.create({ g: 'f', role: 'harem', rank: i === 0 ? 'gozde' : 'cariye', age: U.ri(16, 20), name: U.pick(D.names.cariye), origin: U.pick(D.names.origins), favor: U.ri(30, 55), op: U.ri(20, 50), traits: C.randTraits({ g: 'f' }) });
      PH.Turn.log('Valide Sultan yeni padişahın haremi için cariyeler seçti.', 'harem');
    }
  };

  /** Padişahın lakabı */
  H.lakab = () => {
    const s = PH.state;
    const r = s.reign;
    const sul = C.sultan();
    const years = s.year - r.start.y;
    const cands = [];
    if (r.capitalTaken) cands.push(['Fâtih', 100]);
    if (r.conquests >= 6) cands.push(['Muhteşem', 70 + r.conquests]);
    if (r.conquests >= 3) cands.push(['Yavuz', 40 + r.conquests * 5 + r.battlesWon * 2]);
    if (r.laws >= 5 && r.justice >= 5) cands.push(['Kanunî', 40 + r.laws * 5 + r.justice]);
    if (r.justice >= 8) cands.push(['Âdil', 30 + r.justice * 3]);
    if (r.buildings >= 5) cands.push(['Mimarperver', 25 + r.buildings * 4]);
    if (r.executions >= 6) cands.push(['Deli', 20 + r.executions * 5]);
    if (r.cruelty >= 4) cands.push(['Gaddar', 15 + r.cruelty * 5]);
    if (sul.piety >= 85) cands.push(['Velî', 45 + sul.piety / 3]);
    if (r.poems >= 6) cands.push(['Şair', 20 + r.poems * 3]);
    if (r.hunts >= 10) cands.push(['Avcı', 15 + r.hunts * 2]);
    if (r.lost >= 3) cands.push(['Bahtsız', 25 + r.lost * 6]);
    if (r.battlesWon >= 5) cands.push(['Gazi', 30 + r.battlesWon * 4]);
    if (years >= 30) cands.push(['Koca', 30 + years]);
    if (!cands.length) return years < 3 ? '' : U.pick(['Halim', 'Sakin', 'Mütevazı']);
    cands.sort((a, b) => b[1] - a[1]);
    return cands[0][0];
  };

  return H;
})();
