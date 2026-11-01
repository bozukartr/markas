/* Padişah Hayatı — Olay motoru
 * Olay tanımı:
 *  { id, cat, icon, title, text(s,ctx), w (ağırlık; varsa rastgele olaydır), cond(s), setup(s)->ctx|null,
 *    cd (ay), once, valid(s,ctx), choices:[{ t, hint, req(s,ctx)->true|'sebep', run(s,ctx)->'sonuç metni' }] }
 */
PH.E = (function () {
  const U = PH.U;
  const E = { defs: {}, list: [] };

  E.CAT = {
    saray: { n: 'Saray', icon: 'palace' }, divan: { n: 'Divan', icon: 'seal' }, halk: { n: 'Halk', icon: 'people' },
    ordu: { n: 'Ordu', icon: 'sword' }, dunya: { n: 'Dünya', icon: 'globe' }, harem: { n: 'Harem', icon: 'tulip' },
    din: { n: 'Din', icon: 'mosque' }, felaket: { n: 'Felaket', icon: 'fire' }, sanat: { n: 'Sanat', icon: 'feather' },
    kehanet: { n: 'Kehanet', icon: 'comet' }, hanedan: { n: 'Hanedan', icon: 'crown' }, entrika: { n: 'Entrika', icon: 'dagger' },
    ekonomi: { n: 'Hazine', icon: 'coin' }, kisisel: { n: 'Şahsi', icon: 'user' },
  };

  E.reg = (...defs) => defs.forEach((d) => { E.defs[d.id] = d; E.list.push(d); });

  E.push = (id, ctx) => { if (!E.defs[id]) { console.warn('Olay yok:', id); return; } PH.state.eventQueue.push({ id, ctx: ctx || {} }); };
  E.pushFront = (id, ctx) => { if (!E.defs[id]) { console.warn('Olay yok:', id); return; } PH.state.eventQueue.unshift({ id, ctx: ctx || {} }); };

  E.eligible = (s) => E.list.filter((d) => {
    if (d.w == null) return false;
    if (d.once && s.flags['once_' + d.id]) return false;
    if (s.cd['ev_' + d.id] > s.turn) return false;
    if (d.era && !d.era.includes(s.era)) return false;
    try { if (d.cond && !d.cond(s)) return false; } catch (e) { console.error(d.id, e); return false; }
    return true;
  });

  /** Aylık rastgele olaylar */
  E.roll = (s) => {
    const mul = PH.St.DIFF[s.diff].events;
    let n = 0;
    if (U.chance(0.72)) n++;
    if (U.chance(0.22 * mul)) n++;
    if (s.eventQueue.length >= 3) n = Math.min(n, 1);
    const used = new Set(s.eventQueue.map((q) => q.id));
    for (let i = 0; i < n; i++) {
      const pool = E.eligible(s).filter((d) => !used.has(d.id));
      const d = U.pickW(pool, (x) => (typeof x.w === 'function' ? x.w(s) : x.w));
      if (!d) break;
      let ctx = {};
      if (d.setup) { ctx = d.setup(s); if (!ctx) continue; }
      used.add(d.id);
      E.push(d.id, ctx);
    }
  };

  E.mark = (s, d) => {
    if (d.once) s.flags['once_' + d.id] = true;
    s.cd['ev_' + d.id] = s.turn + (d.cd != null ? d.cd : 18);
  };

  E.isValid = (item) => {
    const d = E.defs[item.id];
    if (!d) return false;
    try { return !d.valid || d.valid(PH.state, item.ctx); } catch (e) { console.error(item.id, e); return false; }
  };

  E.val = (v, s, ctx) => (typeof v === 'function' ? v(s, ctx) : v);

  /** Seçenekleri değerlendir */
  E.choices = (item) => {
    const d = E.defs[item.id];
    const s = PH.state;
    const list = typeof d.choices === 'function' ? d.choices(s, item.ctx) : d.choices;
    return list.filter((c) => !c.hide || !c.hide(s, item.ctx)).map((c) => {
      let ok = true, why = '';
      if (c.req) {
        const r = c.req(s, item.ctx);
        if (r !== true) { ok = false; why = typeof r === 'string' ? r : 'Koşul sağlanmıyor'; }
      }
      return { def: c, t: E.val(c.t, s, item.ctx), hint: E.val(c.hint, s, item.ctx), ok, why };
    });
  };

  /** Seçimi uygula; sonuç metni ve etkiler döner */
  E.choose = (item, choice, value) => {
    const s = PH.state;
    const d = E.defs[item.id];
    E.mark(s, d);
    const r = PH.FX.run(() => (choice.run ? choice.run(s, item.ctx, value) : ''));
    return { text: r.res || '', deltas: r.deltas };
  };

  /* Ortak yardımcılar */
  E.req = {
    money: (amt) => (s) => (s.emp.treasury >= amt ? true : `Hazine yetersiz (${U.money(amt)} gerekli)`),
    vakit: (n) => (s) => (s.vakit >= n ? true : 'Vakit kalmadı'),
    skill: (k, v) => () => (PH.C.sultan().sk[k] >= v ? true : `${PH.C.SKN[k]} ${v} gerekli`),
    office: (o) => (s) => (s.offices[o] ? true : `${PH.D.offices[o].n} makamı boş`),
  };

  /** Basit yetenek sınaması */
  E.check = (skill, diff) => {
    const v = PH.C.sultan().sk[skill];
    const p = U.clamp(0.5 + (v - diff) * 0.05, 0.08, 0.95);
    return U.chance(p);
  };
  E.checkP = (skill, diff) => U.clamp(0.5 + (PH.C.sultan().sk[skill] - diff) * 0.05, 0.08, 0.95);
  E.pctTxt = (p) => `%${Math.round(p * 100)} ihtimal`;

  return E;
})();
