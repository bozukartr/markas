/* Padişah Hayatı — Etki sistemi
 * Tüm stat değişiklikleri FX.apply üzerinden geçer; böylece her eylemin sonucu
 * oyuncuya "etki çipleri" olarak gösterilebilir.
 */
PH.FX = (function () {
  const U = PH.U;
  const DEF = {
    treasury: { l: 'Hazine', i: 'coin', money: 1 },
    debt: { l: 'Borç', i: 'chain', money: 1, bad: 1 },
    popularity: { l: 'Halk', i: 'people' },
    stability: { l: 'İstikrar', i: 'scale' },
    prestige: { l: 'Şöhret', i: 'star' },
    legitimacy: { l: 'Meşruiyet', i: 'crown' },
    janissary: { l: 'Yeniçeri Sadakati', i: 'jan' },
    ulema: { l: 'Ulema', i: 'book' },
    corruption: { l: 'Rüşvet', i: 'bribe', bad: 1 },
    food: { l: 'Zahire', i: 'wheat' },
    health: { l: 'Sağlık', i: 'heart', sultan: 1 },
    happiness: { l: 'Keyif', i: 'smile', sultan: 1 },
    stress: { l: 'Stres', i: 'stress', sultan: 1, bad: 1 },
    piety: { l: 'Takva', i: 'mosque', sultan: 1 },
    idare: { l: 'İdare', i: 'scroll', skill: 1 },
    askeri: { l: 'Askerlik', i: 'sword', skill: 1 },
    diplomasi: { l: 'Diplomasi', i: 'handshake', skill: 1 },
    entrika: { l: 'Entrika', i: 'mask', skill: 1 },
    ilim: { l: 'İlim', i: 'book', skill: 1 },
    jan: { l: 'Yeniçeri', i: 'jan', army: 1, unit: 1 },
    sip: { l: 'Sipahi', i: 'horse', army: 1, unit: 1 },
    azap: { l: 'Azap', i: 'people', army: 1, unit: 1 },
    nizam: { l: 'Nizam-ı Cedid', i: 'shield', army: 1, unit: 1 },
    cannons: { l: 'Top', i: 'cannon', army: 1, unit: 1 },
    ships: { l: 'Gemi', i: 'ship', army: 1, unit: 1 },
    morale: { l: 'Moral', i: 'flag', army: 1, pct: 1 },
    training: { l: 'Talim', i: 'shield', army: 1, pct: 1 },
  };
  const EMP_KEYS = ['popularity', 'stability', 'prestige', 'legitimacy', 'janissary', 'ulema', 'corruption', 'food'];

  let capture = null;

  function record(key, d, meta) {
    if (!capture || !d) return;
    if (!capture[key]) capture[key] = Object.assign({ d: 0 }, meta || {});
    capture[key].d += d;
  }

  /** Etkileri uygula. ch: { popularity: 5, treasury: -1e6, ... } */
  function apply(ch) {
    const s = PH.state;
    if (!s || !ch) return;
    const sul = PH.C.sultan();
    for (const k in ch) {
      let v = ch[k];
      if (!v || typeof v !== 'number' || isNaN(v)) continue;
      const def = DEF[k];
      if (!def) continue;
      let before, after;
      if (k === 'treasury') {
        before = s.emp.treasury; s.emp.treasury = Math.round(before + v); after = s.emp.treasury;
      } else if (k === 'debt') {
        before = s.emp.debt; s.emp.debt = Math.max(0, Math.round(before + v)); after = s.emp.debt;
      } else if (EMP_KEYS.includes(k)) {
        before = s.emp[k]; s.emp[k] = U.clamp(before + v, 0, 100); after = s.emp[k];
      } else if (def.sultan) {
        if (!sul) continue;
        const f = k === 'health' ? 'hp' : k;
        before = sul[f]; sul[f] = U.clamp(before + v, 0, 100); after = sul[f];
      } else if (def.skill) {
        if (!sul) continue;
        before = sul.sk[k]; sul.sk[k] = U.clamp(before + v, 0, 30); after = sul.sk[k];
      } else if (def.army) {
        before = s.army[k];
        if (def.pct) s.army[k] = U.clamp(before + v, 0, 100);
        else s.army[k] = Math.max(0, Math.round(before + v));
        after = s.army[k];
      }
      const d = after - before;
      if (d) record(k, d);
    }
  }

  /** Serbest not (ör. bir kişinin görüşü) */
  function note(key, label, d, opts = {}) {
    record('n:' + key, d, { label, icon: opts.icon || 'user', bad: opts.bad, raw: opts.raw });
  }

  /** fn'yi çalıştır ve oluşan tüm değişiklikleri döndür */
  function run(fn) {
    const prev = capture;
    capture = {};
    let res, err;
    try { res = fn(); } catch (e) { err = e; }
    const deltas = capture;
    capture = prev;
    if (prev) {
      for (const k in deltas) {
        if (!prev[k]) prev[k] = Object.assign({}, deltas[k]);
        else prev[k].d += deltas[k].d;
      }
    }
    if (err) throw err;
    return { res, deltas };
  }

  function chip(k, o) {
    const def = DEF[k] || { l: o.label, i: o.icon || 'info', bad: o.bad };
    const d = o.d;
    if (!d || Math.abs(d) < 0.05) return '';
    const good = def.bad ? d < 0 : d > 0;
    let val;
    if (def.money) val = (d > 0 ? '+' : '−') + U.money(Math.abs(d));
    else if (def.unit) val = (d > 0 ? '+' : '−') + U.num(Math.abs(d));
    else val = U.signed(Math.abs(d) < 1 ? U.r1(d) : Math.round(d), Math.abs(d) < 1 ? 1 : 0);
    return `<span class="fxchip ${good ? 'pos' : 'neg'}">${PH.ic(def.i)}<b>${val}</b> ${U.esc(def.l || o.label)}</span>`;
  }

  function chips(deltas) {
    if (!deltas) return '';
    const html = Object.keys(deltas).map((k) => chip(k.startsWith('n:') ? '_' : k, deltas[k])).join('');
    return html ? `<div class="fxchips">${html}</div>` : '';
  }

  /** Bir etki nesnesinin önizlemesi (henüz uygulanmamış) */
  function preview(ch) {
    if (!ch) return '';
    const d = {};
    for (const k in ch) if (DEF[k]) d[k] = { d: ch[k] };
    return chips(d);
  }

  return { DEF, apply, note, run, chips, preview, EMP_KEYS };
})();
PH.fx = PH.FX.apply;
