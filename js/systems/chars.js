/* Padişah Hayatı — Karakter sistemi */
PH.C = (function () {
  const U = PH.U;
  const D = PH.D;
  const C = {};
  const SK = ['idare', 'askeri', 'diplomasi', 'entrika', 'ilim'];
  C.SK = SK;
  C.SKN = { idare: 'İdare', askeri: 'Askerlik', diplomasi: 'Diplomasi', entrika: 'Entrika', ilim: 'İlim' };

  C.get = (id) => (id && PH.state ? PH.state.chars[id] : null);
  C.sultan = () => (PH.state ? PH.state.chars[PH.state.sultanId] : null);
  C.age = (c) => {
    const s = PH.state;
    let a = s.year - c.by;
    if (s.month < c.bm) a--;
    return Math.max(0, a);
  };
  C.ageAt = (c) => (c.alive ? C.age(c) : (c.dy - c.by));
  C.list = (fn) => Object.values(PH.state.chars).filter((c) => c.alive && (!fn || fn(c)));
  C.has = (c, t) => !!(c && c.traits && c.traits.includes(t));

  C.randName = (g, cls) => {
    if (g === 'f') return U.pick(D.names.female);
    if (cls === 'ulema') return U.pick(D.names.ulemaNames);
    return U.pick(D.names.maleCommon);
  };

  C.randTraits = (o = {}) => {
    const pool = Object.keys(D.traits).filter((k) => {
      const t = D.traits[k];
      if (!t.npc) return false;
      if (t.harem && !(o.g === 'f')) return false;
      return true;
    });
    const n = U.chance(0.35) ? 3 : 2;
    const out = [];
    let guard = 0;
    while (out.length < n && guard++ < 30) {
      const t = U.pick(pool);
      if (out.includes(t)) continue;
      const opp = D.traits[t].opp;
      if (opp && out.includes(opp)) continue;
      out.push(t);
    }
    return out;
  };

  C.randSkills = (o = {}) => {
    const sk = {};
    const base = o.base != null ? o.base : 5;
    SK.forEach((k) => (sk[k] = U.clamp(base + U.ri(-3, 5), 0, 30)));
    if (o.cls === 'pasa') { sk.askeri += U.ri(1, 5); sk.idare += U.ri(1, 4); }
    if (o.cls === 'kalem') { sk.idare += U.ri(2, 6); sk.diplomasi += U.ri(0, 3); }
    if (o.cls === 'ulema') { sk.ilim += U.ri(4, 8); }
    if (o.cls === 'aga') { sk.askeri += U.ri(1, 4); sk.entrika += U.ri(2, 5); }
    if (o.focus) sk[o.focus] += U.ri(3, 6);
    return sk;
  };

  /** Yeni karakter oluştur */
  C.create = (o = {}) => {
    const s = PH.state;
    const id = s.nextId++;
    const g = o.g || 'm';
    const age = o.age != null ? o.age : 30;
    const bm = o.bm != null ? o.bm : U.ri(0, 11);
    const by = s.year - age - (bm > s.month ? 1 : 0);
    const c = {
      id, g, by, bm,
      name: o.name || C.randName(g, o.cls),
      alive: true,
      role: o.role || 'devlet',
      cls: o.cls || null,
      office: null,
      traits: o.traits || C.randTraits({ g }),
      sk: o.sk || C.randSkills(o),
      op: o.op != null ? o.op : U.ri(5, 40),
      amb: o.amb != null ? o.amb : U.ri(10, 70),
      hp: o.hp != null ? o.hp : U.ri(70, 100),
      wealth: o.wealth != null ? o.wealth : 0,
      fa: o.fa || null, mo: o.mo || null,
      nick: o.nick || null,
      dyn: !!o.dyn,
      rank: o.rank || null,
      favor: o.favor != null ? o.favor : null,
      origin: o.origin || null,
      spouse: o.spouse || null,
      known: o.known || false, // gizli özellikler biliniyor mu
    };
    // Özelliklerin yetenek etkileri
    if (!o.sk) {
      c.traits.forEach((t) => {
        const td = D.traits[t];
        if (td && td.sk) for (const k in td.sk) c.sk[k] = U.clamp(c.sk[k] + td.sk[k], 0, 30);
      });
    }
    if (C.has(c, 'hirsli')) c.amb = Math.min(100, c.amb + 25);
    if (C.has(c, 'sadik')) { c.amb = Math.max(0, c.amb - 20); c.op = Math.min(100, c.op + 15); }
    s.chars[id] = c;
    return c;
  };

  /** Devlet adamı oluştur */
  C.statesman = (cls, o = {}) => {
    const age = o.age != null ? o.age : U.ri(32, 62);
    const c = C.create(Object.assign({
      g: 'm', role: 'devlet', cls, age,
      wealth: U.ri(2, 25) * 1e6 * (cls === 'pasa' ? 1.3 : 1),
      nick: cls === 'pasa' && U.chance(0.45) ? U.pick(D.names.nicks) : null,
    }, o));
    if (cls === 'ulema' && !o.name) c.name = U.pick(D.names.ulemaNames);
    return c;
  };

  /** Görünen tam ad */
  C.name = (c, opts = {}) => {
    if (!c) return '—';
    const s = PH.state;
    if (c.id === s.sultanId) return `Sultan ${c.name} Han`;
    if (c.role === 'exsultan') return `Sultan ${c.name}${c.lakab ? ' (' + c.lakab + ')' : ''}`;
    if (c.role === 'valide') return `${c.name} Valide Sultan`;
    if (c.role === 'harem') {
      if (c.rank === 'haseki') return `${c.name} Haseki Sultan`;
      if (c.rank === 'kadin') return `${c.name} Kadın`;
      if (c.rank === 'ikbal') return `${c.name} İkbal`;
      return `${c.name} Hatun`;
    }
    if (c.role === 'eskisaray') return `${c.name} Hatun`;
    if (c.dyn) return c.g === 'm' ? `Şehzade ${c.name}` : `${c.name} Sultan`;
    if (c.role === 'devlet') {
      const suf = D.clsSuffix[c.cls] || '';
      const nick = c.nick && !opts.noNick ? c.nick + ' ' : '';
      return `${nick}${c.name} ${suf}`.trim();
    }
    if (c.role === 'yabanci') return c.name;
    return c.name;
  };

  /** Kısa ünvan (görev) */
  C.title = (c) => {
    if (!c) return '';
    const s = PH.state;
    if (c.id === s.sultanId) return 'Padişah';
    if (!c.alive) return 'Merhum';
    if (c.office) return D.offices[c.office].n;
    if (c.role === 'valide') return 'Valide Sultan';
    if (c.role === 'harem') return { haseki: 'Haseki Sultan', kadin: 'Kadınefendi', ikbal: 'İkbal', gozde: 'Gözde', cariye: 'Cariye' }[c.rank] || 'Cariye';
    if (c.dyn) {
      if (c.g === 'm') {
        if (c.kafes) return 'Kafeste';
        if (c.sancak) return c.sancak + ' Sancakbeyi';
        return C.age(c) < 15 ? 'Şehzade' : 'Şehzade';
      }
      return c.spouse ? 'Evli Sultan' : 'Sultan';
    }
    if (c.gov) return (D.prov[c.gov] ? D.prov[c.gov].n : '') + ' Valisi';
    if (c.exiled) return 'Sürgünde';
    if (c.prison) return 'Yedikule\'de mahpus';
    if (c.role === 'devlet') return 'Makamsız (' + (D.clsName[c.cls] || '') + ')';
    if (c.role === 'eskisaray') return 'Eski Saray\'da';
    return '';
  };

  C.relation = (c) => {
    const sul = C.sultan();
    if (!sul || !c) return '';
    if (c.id === sul.mo) return 'Anneniz';
    if (c.id === sul.fa) return 'Babanız';
    if (c.fa === sul.id) return c.g === 'm' ? 'Oğlunuz' : 'Kızınız';
    if (c.fa && c.fa === sul.fa && c.id !== sul.id) return c.g === 'm' ? 'Kardeşiniz' : 'Kız kardeşiniz';
    const kids = C.children(c.id);
    if (kids.some((k) => k.fa === sul.id)) return 'Çocuklarınızın annesi';
    if (c.spouse) {
      const sp = C.get(c.spouse);
      if (sp && sp.fa === sul.id) return 'Damadınız';
      if (sp && sp.fa === sul.fa) return 'Eniştemiz';
    }
    const fa = C.get(c.fa);
    if (fa && fa.fa === sul.id) return c.g === 'm' ? 'Torununuz' : 'Torununuz';
    if (fa && fa.fa === sul.fa && fa.id !== sul.id) return 'Yeğeniniz';
    return '';
  };

  C.children = (id, all) => Object.values(PH.state.chars).filter((c) => (c.fa === id || c.mo === id) && (all || c.alive));
  C.sons = (id) => C.children(id).filter((c) => c.g === 'm');
  C.siblings = (c) => (c.fa ? Object.values(PH.state.chars).filter((x) => x.alive && x.id !== c.id && x.fa === c.fa) : []);

  C.opinion = (c, d, silent) => {
    if (!c || !d) return;
    let v = d;
    if (d > 0 && C.has(C.sultan(), 'comert')) v *= 1.2;
    const before = c.op;
    c.op = U.clamp(c.op + v, -100, 100);
    if (!silent) PH.FX.note('op' + c.id, C.name(c, { noNick: true }), c.op - before, { icon: 'user' });
  };

  C.skillTotal = (c) => U.sum(SK, (k) => c.sk[k]);
  C.bestSkill = (c) => SK.reduce((b, k) => (c.sk[k] > c.sk[b] ? k : b), SK[0]);

  /** Karakteri öldür */
  C.kill = (c, cause) => {
    const s = PH.state;
    if (!c || !c.alive) return;
    c.alive = false;
    c.dy = s.year; c.dm = s.month; c.dcause = cause || 'eceliyle';
    if (c.office) { s.offices[c.office] = null; c.office = null; }
    if (c.gov) { const p = s.provs[c.gov]; if (p && p.gov === c.id) p.gov = null; c.gov = null; }
    if (c.preg) c.preg = null;
    if (s.dynasty.heirId === c.id) s.dynasty.heirId = null;
    // Komploları temizle
    s.plots = s.plots.filter((p) => p.by !== c.id && p.target !== c.id);
    if (c.id === s.sultanId) {
      if (!s.succession) s.succession = { cause: c.dcause };
    }
  };

  /** Aylık karakter güncellemesi: ölüm, sağlık */
  C.monthly = () => {
    const s = PH.state;
    const sulId = s.sultanId;
    const deaths = [];
    for (const c of Object.values(s.chars)) {
      if (!c.alive || c.role === 'yabanci') continue;
      const a = C.age(c);
      // sağlık
      if (a > 45 && U.chance(0.25)) c.hp = Math.max(0, c.hp - U.rf(0.2, 1.2) * (a > 65 ? 2 : 1));
      else if (a < 45 && c.hp < 90 && U.chance(0.3)) c.hp = Math.min(100, c.hp + 1);
      if (c.kafes && U.chance(0.1)) c.hp = Math.max(5, c.hp - 1);
      if (c.id === sulId) continue; // padişah ayrıca ele alınır
      let annual;
      if (a < 1) annual = 0.07; else if (a < 5) annual = 0.03; else if (a < 15) annual = 0.006;
      else if (a < 40) annual = 0.008; else if (a < 50) annual = 0.014; else if (a < 60) annual = 0.03;
      else if (a < 70) annual = 0.065; else if (a < 80) annual = 0.14; else annual = 0.3;
      if (c.hp < 30) annual *= 3; else if (c.hp < 50) annual *= 1.6;
      if (c.prison) annual *= 2;
      if (U.chance(annual / 12) || c.hp <= 0) deaths.push(c);
    }
    deaths.forEach((c) => {
      C.kill(c, U.pick(['eceliyle', 'ani bir hastalıkla', 'humma nöbetinden', 'yaşlılıktan', 'veremden']));
      PH.Turn && PH.Turn.noteDeath(c);
    });
  };

  /** Yıllık karakter güncellemesi: eğitim, hırs, servet */
  C.yearly = () => {
    const s = PH.state;
    for (const c of Object.values(s.chars)) {
      if (!c.alive) continue;
      const a = C.age(c);
      if (c.role === 'devlet') {
        c.wealth += U.ri(1, 3) * 1e6 * (C.has(c, 'rusvetci') ? 2 : 1) * (c.office || c.gov ? 1 : 0.3);
        if (C.has(c, 'hirsli') && !c.office) c.amb = Math.min(100, c.amb + 3);
        // makamsızlar zamanla küser
        if (!c.office && !c.gov && c.op > -20) c.op -= 2;
      }
      if (c.dyn && c.g === 'm' && c.id !== s.sultanId) {
        if (c.kafes && a >= 12) {
          if (U.chance(0.25)) SK.forEach((k) => (c.sk[k] = Math.max(0, c.sk[k] - (U.chance(0.3) ? 1 : 0))));
          if (a > 25 && !c.traits.includes('kafesli') && U.chance(0.15)) c.traits.push('kafesli');
          c.amb = Math.max(0, c.amb - 4);
        } else if (c.sancak) {
          c.sk.idare = Math.min(30, c.sk.idare + U.ri(0, 2));
          c.sk.askeri = Math.min(30, c.sk.askeri + U.ri(0, 1));
          c.sk.diplomasi = Math.min(30, c.sk.diplomasi + U.ri(0, 1));
          c.amb = Math.min(100, c.amb + U.ri(1, 4));
        }
      }
      // çocuk eğitimi
      if (c.dyn && a >= 6 && a <= 17 && c.edu) {
        const tq = c.edu.q || 1;
        const smart = C.has(c, 'zeki') ? 1 : C.has(c, 'kalinkafa') ? -1 : 0;
        const bonus = (PH.Eco && PH.Eco.hasBuilding('medrese') ? 1 : 0) + (s.laws.matbaa ? 1 : 0);
        c.sk[c.edu.focus] = Math.min(30, c.sk[c.edu.focus] + tq + smart + U.ri(0, 1) + (U.chance(0.3) ? bonus : 0));
        const other = U.pick(SK.filter((k) => k !== c.edu.focus));
        c.sk[other] = Math.min(30, c.sk[other] + (U.chance(0.6) ? 1 : 0));
      } else if (c.dyn && a >= 6 && a <= 17) {
        const k = U.pick(SK);
        c.sk[k] = Math.min(30, c.sk[k] + (U.chance(0.5) ? 1 : 0));
      }
    }
  };

  C.traitChips = (c, max) => {
    const list = (c.traits || []).slice(0, max || 99);
    return list.map((t) => {
      const td = D.traits[t];
      if (!td) return '';
      return `<span class="trait ${td.kind === 'pos' ? 'pos' : td.kind === 'neg' ? 'neg' : ''}" title="${U.esc(td.d)}">${U.esc(td.n)}</span>`;
    }).join('');
  };

  C.addTrait = (c, t) => {
    if (!c || C.has(c, t)) return;
    const opp = D.traits[t] && D.traits[t].opp;
    if (opp) c.traits = c.traits.filter((x) => x !== opp);
    c.traits.push(t);
    const td = D.traits[t];
    if (td && td.sk) for (const k in td.sk) c.sk[k] = U.clamp(c.sk[k] + td.sk[k], 0, 30);
  };

  return C;
})();
