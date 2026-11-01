/* Padişah Hayatı — Ay sonu işleyişi, kronik */
PH.Turn = (function () {
  const U = PH.U, D = PH.D, C = PH.C;
  const T = {};

  T.log = (text, kind = 'info') => {
    const s = PH.state;
    if (!s) return;
    s.log.unshift({ y: s.year, m: s.month, t: text, k: kind });
    if (s.log.length > 600) s.log.length = 600;
  };

  T.noteDeath = (c) => {
    const s = PH.state;
    const sul = C.sultan();
    if (!sul || c.id === sul.id) return;
    const close = c.dyn || c.role === 'valide' || c.role === 'harem';
    if (c.office || c.gov) {
      T.log(`${C.name(c)} (${c.office ? D.offices[c.office] ? D.offices[c.office].n : '' : 'vali'}) ${c.dcause} vefat etti.`, 'death');
      s.notices.push({ i: 'skull', t: `${C.name(c)} vefat etti. Makamı boşaldı.` });
    } else if (close) {
      T.log(`${C.name(c)} ${c.dcause} vefat etti.`, 'death');
      if (c.dcause !== 'idam edildi' && !c.dcause.includes('katled')) PH.E.push('olum_haber', { c: c.id });
    }
  };

  /** Padişahın aylık durumu */
  T.sultanMonthly = (s) => {
    const sul = C.sultan();
    const a = C.age(sul);
    const wars = Object.values(s.nations).filter((n) => n.war).length;
    // stres
    let stT = 25 + (s.emp.treasury < 0 ? 20 : 0) + wars * 7 + (100 - s.emp.stability) / 5 + s.plots.filter((p) => p.known).length * 6 - sul.happiness / 6;
    if (C.has(sul, 'ofkeli')) stT += 8;
    if (C.has(sul, 'sabirli')) stT -= 8;
    sul.stress = U.clamp(sul.stress + (stT - sul.stress) * 0.12, 0, 100);
    // keyif
    let hT = 50 + PH.Harem.women().reduce((m, w) => Math.max(m, w.favor || 0), 0) / 8 - sul.stress / 4 + (C.has(sul, 'musrif') ? 5 : 0) - (C.has(sul, 'melankolik') ? 12 : 0) + (PH.Eco.hasBuilding('kosk') ? 5 : 0);
    sul.happiness = U.clamp(sul.happiness + (hT - sul.happiness) * 0.1, 0, 100);
    // sağlık
    let hpT = 100 - Math.max(0, a - 30) * 1.1 - sul.stress / 5 + (C.has(sul, 'pehlivan') ? 10 : 0) - (C.has(sul, 'narin') ? 12 : 0) - (C.has(sul, 'nikris') ? 8 : 0) + (PH.Eco.hasBuilding('darussifa') ? 3 : 0);
    if (s.campaign && s.campaign.cmd === sul.id && U.isWinter(s.month)) hpT -= 10;
    sul.hp = U.clamp(sul.hp + (hpT - sul.hp) * 0.04 + U.rf(-0.5, 0.3), 0, 100);
    // takva sürüklenmesi
    const pT = C.has(sul, 'dindar') ? 70 : 45;
    sul.piety = U.clamp(sul.piety + (pT - sul.piety) * 0.01, 0, 100);
    // ölüm
    let annual;
    if (a < 30) annual = 0.004; else if (a < 40) annual = 0.007; else if (a < 50) annual = 0.012; else if (a < 60) annual = 0.025; else if (a < 70) annual = 0.06; else if (a < 80) annual = 0.13; else annual = 0.28;
    if (sul.hp < 50) annual *= 1 + (50 - sul.hp) / 10;
    if (sul.hp <= 0 || U.chance(annual / 12)) {
      const cause = sul.hp < 20 ? 'uzun süren bir hastalıktan' : a > 60 ? 'ihtiyarlıktan' : U.pick(['ani bir hastalıkla', 'şiddetli bir humma nöbetinden', 'kalp sektesinden', 'şirpençe (şarbon) hastalığından']);
      C.kill(sul, cause);
    }
    // ağır stres
    if (sul.stress > 85 && U.chance(0.08)) sul.hp = Math.max(0, sul.hp - 5);
  };

  /** Ay sonu */
  T.endMonth = () => {
    const s = PH.state;
    const before = Object.assign({}, s.emp, { hp: C.sultan().hp });
    const rep = { y: s.year, m: s.month, notes: [], budget: null };
    s.notices = [];
    // tarih ilerlet
    s.turn++;
    s.month++;
    if (s.month > 11) { s.month = 0; s.year++; }
    const newYear = s.month === 0;

    PH.Eco.monthly(rep);
    PH.Mil.monthly(rep);
    PH.Dip.monthly(rep);
    PH.Court.monthlyPlots(rep);
    PH.Harem.monthly(rep);
    C.monthly(rep);
    if (newYear) {
      C.yearly(rep);
      T.yearly(s, rep);
    }
    if (s.month === 7) {
      const h = PH.Eco.harvest(s);
      s.emp.food = U.clamp(s.emp.food + h, 0, 100);
      rep.notes.push({ i: 'wheat', t: `Hasat ${h > 28 ? 'bereketli' : h > 16 ? 'orta' : 'kötü'} geçti (zahire +${h}).` });
      if (h < 14) PH.E.push('kitlik', {});
    }
    if (C.sultan().alive) T.sultanMonthly(s);
    PH.E.roll(s);

    // vakit
    s.vakit = s.vakitMax;
    // rapor farkları
    rep.diff = {};
    ['popularity', 'stability', 'prestige', 'legitimacy', 'janissary', 'ulema', 'corruption', 'food'].forEach((k) => (rep.diff[k] = s.emp[k] - before[k]));
    rep.diff.treasury = s.emp.treasury - before.treasury;
    rep.notes = rep.notes.concat(s.notices);
    s.last = rep;
    // kontrol: kalıcı çöküş
    T.checkCollapse(s);
    return rep;
  };

  T.yearly = (s, rep) => {
    // devşirme
    if (s.laws.devsirme) {
      const n = U.ri(800, 1600);
      s.army.jan += n;
      rep.notes.push({ i: 'jan', t: `Devşirme ile ${U.num(n)} acemi oğlanı ocağa katıldı.` });
    }
    // makamsız aday havuzunu tazele
    const pool = C.list((c) => c.role === 'devlet' && !c.office && !c.gov && !c.exiled && !c.prison);
    if (pool.length < 5) for (let i = 0; i < 3; i++) C.statesman(U.pick(['pasa', 'pasa', 'kalem', 'ulema', 'aga']));
    // mahkumlar
    C.list((c) => c.prison).forEach((c) => { if (U.chance(0.1)) { C.kill(c, 'zindanda'); } });
    // akçe değeri yavaşça toparlanmaz; kayıt
    if (s.emp.debt > 0 && s.emp.treasury > s.emp.debt * 2) rep.notes.push({ i: 'chain', t: 'Hazine güçlü; borçları ödemeyi düşünebilirsiniz.' });
  };

  T.checkCollapse = (s) => {
    const own = PH.Eco.ownProvs(s).length;
    if (own <= 2 && !s.gameOver) s.gameOver = { reason: 'Devlet-i Aliyye topraklarının neredeyse tamamını kaybetti. Saltanat sona erdi.' };
    if (s.emp.stability <= 0 && s.emp.janissary <= 5 && s.emp.popularity <= 5 && !s.succession) {
      s.succession = { cause: 'büyük bir ihtilal ile tahttan indirildi', deposed: true };
    }
  };

  /** Veraset sonrası hanedanın sonu mu? */
  T.dynastyEnded = () => PH.Harem.heirCandidates().all.length === 0;

  return T;
})();
