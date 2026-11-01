/* Padişah Hayatı — Arayüz çekirdeği: kabuk, sekmeler, sayfalar, pencereler */
PH.UI = (function () {
  const U = PH.U, D = PH.D, C = PH.C;
  const ic = PH.ic;
  const UI = { tab: 'palace', sub: {}, screens: {}, sheets: [], modalOpen: false, modalQueue: [] };
  PH.A = PH.A || {};
  const A = PH.A;

  UI.TABS = [
    { id: 'palace', n: 'Saray', icon: 'palace' },
    { id: 'divan', n: 'Divan', icon: 'seal' },
    { id: 'harem', n: 'Harem', icon: 'tulip' },
    { id: 'army', n: 'Ordu', icon: 'sword' },
    { id: 'world', n: 'Dünya', icon: 'globe' },
  ];

  UI.STAT_STRIP = [
    { k: 'treasury', l: 'Hazine', i: 'coin' },
    { k: 'popularity', l: 'Halk', i: 'people' },
    { k: 'stability', l: 'İstikrar', i: 'scale' },
    { k: 'janissary', l: 'Yeniçeri', i: 'jan' },
    { k: 'ulema', l: 'Ulema', i: 'book' },
    { k: 'legitimacy', l: 'Meşruiyet', i: 'crown' },
    { k: 'prestige', l: 'Şöhret', i: 'star' },
    { k: 'food', l: 'Zahire', i: 'wheat' },
    { k: 'corruption', l: 'Rüşvet', i: 'bribe', bad: 1 },
  ];

  /* ---------- Metin biçimleme ---------- */
  UI.paras = (t) => String(t || '').split(/\n\n+/).map((p) => `<p>${U.esc(p).replace(/\n/g, '<br>')}</p>`).join('');

  /* ---------- Kabuk ---------- */
  UI.shell = () => {
    const app = document.getElementById('app');
    app.innerHTML = `
      <header class="topbar">
        <button class="tb-btn" data-act="openChronicle" aria-label="Kronik">${ic('scroll')}</button>
        <div class="tb-center" data-act="openCalendar">
          <div class="tb-date" id="tb-date"></div>
          <div class="tb-sub" id="tb-sub"></div>
        </div>
        <button class="tb-btn" data-act="openMenu" aria-label="Menü">${ic('menu')}</button>
      </header>
      <div class="statstrip" id="statstrip"></div>
      <main class="screen" id="screen"></main>
      <div class="endbar" id="endbar"></div>
      <nav class="tabbar" id="tabbar"></nav>`;
  };

  UI.renderHeader = () => {
    const s = PH.state;
    document.getElementById('tb-date').textContent = U.dateStr(s.year, s.month);
    document.getElementById('tb-sub').textContent = `${U.hijri(s.year, s.month)} H. · ${U.season(s.month)} · ${D.eras[s.era].n}`;
    const last = s.last && s.last.diff ? s.last.diff : {};
    document.getElementById('statstrip').innerHTML = UI.STAT_STRIP.map((x) => {
      const v = s.emp[x.k];
      const d = last[x.k] || 0;
      const val = x.k === 'treasury' ? U.money(v) : Math.round(v);
      let tone = '';
      if (x.k === 'treasury') tone = v < 0 ? 'bad' : v < 5e6 ? 'warn' : '';
      else { const eff = x.bad ? 100 - v : v; tone = eff < 25 ? 'bad' : eff < 40 ? 'warn' : ''; }
      const arrow = Math.abs(d) >= (x.k === 'treasury' ? 1 : 0.5) ? `<em class="${(x.bad ? d < 0 : d > 0) ? 'up' : 'down'}">${d > 0 ? '▲' : '▼'}</em>` : '';
      return `<button class="schip ${tone}" data-act="statInfo" data-k="${x.k}">${ic(x.i)}<span><small>${x.l}</small><b>${val}${arrow}</b></span></button>`;
    }).join('');
    const vk = Array.from({ length: s.vakitMax }, (_, i) => `<i class="${i < s.vakit ? 'on' : ''}"></i>`).join('');
    document.getElementById('endbar').innerHTML = `
      <div class="vakit" title="Bu ay kalan vakit">${ic('hourglass')}<div><small>Vakit</small><span class="dots">${vk}</span></div></div>
      <button class="btn-end" data-act="endTurn">Ayı Tamamla ${ic('chev')}</button>`;
    document.getElementById('tabbar').innerHTML = UI.TABS.map((t) => {
      const badge = UI.badge(t.id);
      return `<button class="tab ${UI.tab === t.id ? 'on' : ''}" data-act="tab" data-t="${t.id}">${ic(t.icon)}<span>${t.n}</span>${badge ? `<b class="tbadge">${badge}</b>` : ''}</button>`;
    }).join('');
  };

  UI.badge = (tab) => {
    const s = PH.state;
    if (tab === 'divan') return D.officeOrder.filter((o) => !s.offices[o]).length || '';
    if (tab === 'army') return s.campaign ? '⚔' : '';
    if (tab === 'world') return Object.values(s.nations).filter((n) => n.war).length || '';
    if (tab === 'harem') return C.list((c) => c.preg && c.role === 'harem').length ? '•' : '';
    return '';
  };

  UI.render = () => {
    if (!PH.state) return;
    UI.renderHeader();
    const scr = UI.screens[UI.tab];
    const el = document.getElementById('screen');
    if (scr) {
      try { el.innerHTML = scr.render(); } catch (e) { console.error(e); el.innerHTML = `<div class="empty">Ekran çizilemedi: ${U.esc(e.message)}</div>`; }
    }
  };

  /** Ekranı ve açık sayfaları tazele */
  UI.refresh = () => {
    if (!PH.state) return;
    const sc = document.getElementById('screen');
    const top = sc ? sc.scrollTop : 0;
    UI.render();
    if (sc) sc.scrollTop = top;
    UI.sheets.slice().forEach((sh) => sh.refresh());
  };

  /* ---------- Alt sayfa (bottom sheet) ---------- */
  UI.sheet = (o) => {
    const root = document.getElementById('sheet-root');
    const wrap = document.createElement('div');
    wrap.className = 'sheet-wrap';
    wrap.innerHTML = `<div class="sheet-bg" data-act="closeSheet"></div><section class="sheet ${o.cls || ''}" role="dialog" aria-modal="true"><div class="sheet-grip"></div><header class="sheet-head"><h3></h3><button class="icon-btn" data-act="closeSheet" aria-label="Kapat">${ic('close')}</button></header><div class="sheet-body"></div></section>`;
    root.appendChild(wrap);
    const sh = {
      o, el: wrap,
      refresh() {
        try {
          const body = wrap.querySelector('.sheet-body');
          const st = body.scrollTop;
          const t = typeof o.title === 'function' ? o.title() : o.title;
          wrap.querySelector('.sheet-head h3').innerHTML = t || '';
          body.innerHTML = o.render(sh);
          body.scrollTop = st;
        } catch (e) { console.error(e); sh.close(); }
      },
      close() {
        UI.sheets = UI.sheets.filter((x) => x !== sh);
        wrap.classList.add('out');
        setTimeout(() => wrap.remove(), 200);
        if (o.onClose) o.onClose();
      },
    };
    UI.sheets.push(sh);
    sh.refresh();
    requestAnimationFrame(() => wrap.classList.add('in'));
    return sh;
  };
  UI.topSheet = () => UI.sheets[UI.sheets.length - 1];
  UI.closeAllSheets = () => UI.sheets.slice().forEach((s) => s.close());

  /* ---------- Modal ---------- */
  UI.modal = (html, o = {}) => {
    if (UI.modalOpen) { UI.modalQueue.push([html, o]); return; }
    UI.modalOpen = true;
    const root = document.getElementById('modal-root');
    root.innerHTML = `<div class="modal-wrap ${o.cls || ''}"><div class="modal-bg" ${o.dismiss ? 'data-act="closeModal"' : ''}></div><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`;
    requestAnimationFrame(() => root.firstElementChild && root.firstElementChild.classList.add('in'));
    UI._modalOpts = o;
  };
  UI.modalEl = () => document.querySelector('#modal-root .modal');
  UI.closeModal = () => {
    const root = document.getElementById('modal-root');
    const o = UI._modalOpts || {};
    root.innerHTML = '';
    UI.modalOpen = false;
    UI._modalOpts = null;
    if (o.onClose) o.onClose();
    if (UI.modalQueue.length) { const [h, oo] = UI.modalQueue.shift(); UI.modal(h, oo); return; }
    UI.flow();
  };

  UI.toast = (msg, kind = '') => {
    const root = document.getElementById('toast-root');
    const t = document.createElement('div');
    t.className = 'toast ' + kind;
    t.innerHTML = msg;
    root.appendChild(t);
    requestAnimationFrame(() => t.classList.add('in'));
    setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 300); }, 2600);
  };

  UI.confirm = (o) => {
    UI._confirm = o;
    UI.modal(`<div class="mbox"><h3>${U.esc(o.title || 'Emin misiniz?')}</h3>${UI.paras(o.text || '')}<div class="mrow"><button class="btn ghost" data-act="confirmNo">${U.esc(o.no || 'Vazgeç')}</button><button class="btn ${o.danger ? 'danger' : 'gold'}" data-act="confirmYes">${U.esc(o.yes || 'Evet')}</button></div></div>`, { dismiss: true, cls: 'small' });
  };
  A.confirmYes = () => { const o = UI._confirm; UI._confirm = null; UI.closeModal(); if (o && o.onYes) o.onYes(); };
  A.confirmNo = () => { UI._confirm = null; UI.closeModal(); };

  UI.prompt = (o) => {
    UI._prompt = o;
    UI.modal(`<div class="mbox"><h3>${U.esc(o.title || '')}</h3>${o.text ? UI.paras(o.text) : ''}<label class="field"><span>${U.esc(o.label || '')}</span><input id="prompt-in" type="text" maxlength="${o.max || 24}" value="${U.esc(o.value || '')}" autocomplete="off"></label><div class="mrow"><button class="btn ghost" data-act="promptNo">Vazgeç</button><button class="btn gold" data-act="promptOk">Tamam</button></div></div>`, { cls: 'small' });
    setTimeout(() => { const i = document.getElementById('prompt-in'); if (i) { i.focus(); i.select(); } }, 60);
  };
  A.promptOk = () => { const o = UI._prompt; const v = (document.getElementById('prompt-in') || {}).value; UI._prompt = null; UI.closeModal(); if (o && o.onOk) o.onOk(v); };
  A.promptNo = () => { UI._prompt = null; UI.closeModal(); };

  /** Sonuç penceresi */
  UI.result = (title, text, deltas, o = {}) => {
    const chips = PH.FX.chips(deltas);
    UI.modal(`<div class="mbox result"><div class="res-icon">${ic(o.icon || 'scroll')}</div><h3>${U.esc(title)}</h3>${UI.paras(text)}${chips}<button class="btn gold wide" data-act="closeModal">Tamam</button></div>`, { dismiss: true, cls: 'small' });
  };

  /** Bir eylemi çalıştır, etkilerini göster */
  UI.run = (title, fn, o = {}) => {
    let r;
    try { r = PH.FX.run(fn); } catch (e) { console.error(e); UI.toast('Hata: ' + U.esc(e.message), 'bad'); return; }
    const text = r.res;
    UI.refresh();
    if (o.silent && !text) { UI.flow(); return; }
    if (text === false) return;
    if (o.toast) { UI.toast(U.esc(text || title), 'ok'); UI.flow(); return; }
    UI.result(title, text || '', r.deltas, o);
  };

  /* ---------- Olay akışı ---------- */
  UI.flow = () => {
    const s = PH.state;
    if (!s || UI.modalOpen) return;
    while (s.eventQueue.length) {
      const item = s.eventQueue[0];
      if (!PH.E.isValid(item)) { s.eventQueue.shift(); continue; }
      UI.showEvent(item);
      return;
    }
    if (s.succession) { UI.showSuccession(); return; }
    if (s.gameOver) { UI.showGameOver(); return; }
    PH.Save.save('oto');
    UI.refresh();
  };

  UI.evPortraits = (ctx) => {
    const ids = ['c', 'w', 'k', 'a', 'b', 'v'].map((k) => ctx[k]).filter((x) => typeof x === 'number');
    const cs = ids.map((id) => C.get(id)).filter(Boolean).slice(0, 3);
    if (!cs.length && ctx.n && PH.D.nations[ctx.n]) return `<div class="ev-ports">${PH.Portrait.nationBadge(ctx.n, 48)}</div>`;
    return cs.length ? `<div class="ev-ports">${cs.map((c) => `<div class="evp">${PH.Portrait.svg(c, 52)}<small>${U.esc(c.name)}</small></div>`).join('')}</div>` : '';
  };

  UI.showEvent = (item) => {
    const s = PH.state;
    const d = PH.E.defs[item.id];
    let text, title, choices;
    try {
      text = PH.E.val(d.text, s, item.ctx);
      title = PH.E.val(d.title, s, item.ctx);
      choices = PH.E.choices(item);
    } catch (e) {
      console.error('Olay hatası', item.id, e);
      s.eventQueue.shift();
      UI.flow();
      return;
    }
    UI._ev = { item, choices };
    const cat = PH.E.CAT[d.cat] || PH.E.CAT.saray;
    const more = s.eventQueue.length > 1 ? `<span class="ev-count">+${s.eventQueue.length - 1}</span>` : '';
    const ch = choices.map((c, i) => `<button class="choice ${c.ok ? '' : 'locked'}" data-act="evChoose" data-i="${i}" ${c.ok ? '' : 'disabled'}><span class="ct">${U.esc(c.t)}</span>${c.hint || !c.ok ? `<small>${c.ok ? U.esc(c.hint) : ic('lock') + ' ' + U.esc(c.why)}</small>` : ''}</button>`).join('');
    UI.modal(`<div class="event cat-${d.cat}">
      <div class="ev-head"><div class="ev-medal">${ic(d.icon || cat.icon)}</div><div class="ev-meta"><span class="ev-cat">${cat.n}</span><span>${U.dateStr(s.year, s.month)}</span>${more}</div><h2>${U.esc(title)}</h2></div>
      ${UI.evPortraits(item.ctx)}
      <div class="ev-body">${UI.paras(text)}</div>
      <div class="ev-choices">${ch}</div></div>`, { cls: 'event-wrap' });
  };

  A.evChoose = (ds) => {
    const ev = UI._ev;
    if (!ev) return;
    const c = ev.choices[+ds.i];
    if (!c || !c.ok) return;
    U.vibrate(10);
    const go = (val) => {
      const s = PH.state;
      s.eventQueue = s.eventQueue.filter((x) => x !== ev.item);
      let r;
      try { r = PH.E.choose(ev.item, c.def, val); } catch (e) { console.error(e); r = { text: 'Bir aksilik oldu: ' + e.message, deltas: {} }; }
      UI._ev = null;
      const m = UI.modalEl();
      if (!m) { UI.flow(); return; }
      const body = `<div class="ev-result"><div class="ev-chosen">${ic('check')} ${U.esc(c.t)}</div>${UI.paras(r.text)}${PH.FX.chips(r.deltas)}</div><div class="ev-choices"><button class="btn gold wide" data-act="closeModal">Devam ${ic('chev')}</button></div>`;
      const evEl = m.querySelector('.event');
      const oldCh = evEl.querySelector('.ev-choices');
      if (oldCh) oldCh.remove();
      evEl.querySelector('.ev-body').outerHTML = body;
      m.scrollTop = 0;
      UI.refresh();
    };
    if (c.def.input) {
      UI._evInput = { go, c };
      const m = UI.modalEl();
      const box = m.querySelector('.ev-choices');
      box.innerHTML = `<label class="field"><span>${U.esc(c.def.input.label)}</span><input id="ev-in" type="text" maxlength="20" value="${U.esc(c.def.input.suggest || '')}" autocomplete="off"></label><button class="btn gold wide" data-act="evInputOk">Onayla</button>`;
      setTimeout(() => { const i = document.getElementById('ev-in'); if (i) { i.focus(); i.select(); } }, 50);
      return;
    }
    go();
  };
  A.evInputOk = () => { const x = UI._evInput; if (!x) return; UI._evInput = null; x.go((document.getElementById('ev-in') || {}).value); };

  /* ---------- Ay sonu ---------- */
  A.endTurn = () => {
    const s = PH.state;
    if (UI.modalOpen) return;
    if (s.eventQueue.length) { UI.flow(); return; }
    const doIt = () => {
      UI.closeAllSheets();
      let rep;
      try { rep = PH.Turn.endMonth(); } catch (e) { console.error(e); UI.toast('Ay işlenirken hata: ' + U.esc(e.message), 'bad'); return; }
      U.vibrate(15);
      UI.refresh();
      UI.showReport(rep);
    };
    if (s.vakit > 0 && PH.settings.confirmEnd && !UI._skipVakitWarn) {
      UI.confirm({ title: 'Vakit kaldı', text: `Bu ay hâlâ ${s.vakit} vaktiniz var. Kullanmadan ayı bitirmek istiyor musunuz?`, yes: 'Ayı Bitir', no: 'Geri Dön', onYes: () => { UI._skipVakitWarn = true; setTimeout(() => (UI._skipVakitWarn = false), 100); doIt(); } });
      return;
    }
    doIt();
  };

  UI.showReport = (rep) => {
    const s = PH.state;
    const b = rep.budget;
    const diffRow = (k, l, bad) => {
      const d = rep.diff[k] || 0;
      if (Math.abs(d) < 0.5) return '';
      const good = bad ? d < 0 : d > 0;
      return `<span class="fxchip ${good ? 'pos' : 'neg'}"><b>${U.signed(d)}</b> ${l}</span>`;
    };
    const diffs = [diffRow('popularity', 'Halk'), diffRow('stability', 'İstikrar'), diffRow('janissary', 'Yeniçeri'), diffRow('ulema', 'Ulema'), diffRow('legitimacy', 'Meşruiyet'), diffRow('prestige', 'Şöhret'), diffRow('food', 'Zahire'), diffRow('corruption', 'Rüşvet', 1)].join('');
    const notes = rep.notes.map((n) => `<li>${ic(n.i || 'info')}<span>${U.esc(n.t)}</span></li>`).join('');
    const ev = s.eventQueue.length;
    UI.modal(`<div class="mbox report">
      <div class="rep-head">${PH.Portrait.tughra(90)}<div><small>Ay tamamlandı</small><h3>${U.dateStr(s.year, s.month)}</h3></div></div>
      <div class="rep-money"><div><small>Gelir</small><b class="pos">+${U.money(b.ti)}</b></div><div><small>Gider</small><b class="neg">−${U.money(b.te)}</b></div><div><small>Net</small><b class="${b.net >= 0 ? 'pos' : 'neg'}">${b.net >= 0 ? '+' : '−'}${U.money(Math.abs(b.net))}</b></div></div>
      <div class="rep-tre">Hazine: <b>${U.money(s.emp.treasury, true)}</b>${s.emp.debt ? ` · Borç: <b class="neg">${U.money(s.emp.debt)}</b>` : ''}</div>
      ${diffs ? `<div class="fxchips">${diffs}</div>` : ''}
      ${notes ? `<ul class="rep-notes">${notes}</ul>` : ''}
      <button class="btn gold wide" data-act="closeModal">${ev ? `Gelişmeler (${ev}) ${ic('chev')}` : 'Devam'}</button>
    </div>`, { cls: 'small' });
  };

  /* ---------- Veraset ve oyun sonu ---------- */
  UI.showSuccession = () => {
    const s = PH.state;
    const old = C.sultan();
    const succ = s.succession;
    const h = PH.Harem.heirCandidates();
    const ruleHeir = PH.Harem.ruleHeir();
    if (!h.all.length) {
      s.gameOver = { reason: `${C.name(old)} ${succ.cause}. Hanedandan tahta çıkacak hiçbir erkek kalmadı. Osmanoğulları\'nın saltanatı sona erdi.` };
      s.succession = null;
      UI.showGameOver();
      return;
    }
    const years = s.year - s.reign.start.y;
    const lakab = PH.Harem.lakab();
    let list = h.all;
    const canChoose = s.dynasty.succession === 'tayin' && !succ.forced;
    if (succ.forced) { const f = C.get(succ.forced); if (f && f.dyn && f.alive) list = [f]; }
    const first = succ.forced && C.get(succ.forced) && C.get(succ.forced).dyn ? C.get(succ.forced) : ruleHeir;
    UI._succ = { pick: first ? first.id : list[0].id };
    const rows = (canChoose ? list : [first || list[0]]).map((c) => `<button class="pick ${UI._succ.pick === c.id ? 'on' : ''}" data-act="succPick" data-id="${c.id}">${PH.Portrait.svg(c, 44)}<div><b>${U.esc(C.name(c))}</b><small>${C.age(c)} yaş · ${U.esc(C.relation(c) || C.title(c))} · ${C.SK.map((k) => C.SKN[k].slice(0, 3) + ' ' + c.sk[k]).join(' ')}</small><div class="traits">${C.traitChips(c, 3)}</div></div></button>`).join('');
    UI.modal(`<div class="mbox succession">
      <div class="res-icon">${ic(succ.deposed ? 'chain' : 'skull')}</div>
      <h3>${U.esc(C.name(old))}${lakab ? ` "${U.esc(lakab)}"` : ''}</h3>
      <p class="center">${U.esc(old.alive ? 'Tahttan indirildi' : 'Vefat etti')}: ${U.esc(succ.cause)}.<br>${years} yıl saltanat sürdü · ${C.ageAt(old)} yaşında.</p>
      <div class="reign-stats">${UI.reignStats(s.reign)}</div>
      <h4>${canChoose ? 'Tahta kim çıkacak?' : 'Veraset usulüne göre tahtın varisi'}</h4>
      <div class="picks">${rows}</div>
      <button class="btn gold wide" data-act="succGo">Cülus ${ic('crown')}</button>
    </div>`, { cls: 'small' });
  };
  UI.reignStats = (r) => [['Fetih', r.conquests], ['Kayıp', r.lost], ['Zafer', r.battlesWon], ['Bozgun', r.battlesLost], ['Yapı', r.buildings], ['Kanun', r.laws], ['İdam', r.executions], ['Adalet', r.justice]].map(([l, v]) => `<div><b>${v || 0}</b><small>${l}</small></div>`).join('');
  A.succPick = (ds) => { UI._succ.pick = +ds.id; document.querySelectorAll('.picks .pick').forEach((b) => b.classList.toggle('on', +b.dataset.id === UI._succ.pick)); };
  A.succGo = () => {
    const heir = C.get(UI._succ.pick);
    UI.modalOpen = false; document.getElementById('modal-root').innerHTML = '';
    PH.FX.run(() => PH.Harem.succeed(heir));
    UI.tab = 'palace';
    UI.refresh();
    UI.toast(`${U.esc(C.name(heir))} tahta çıktı!`, 'ok');
    UI.flow();
  };

  UI.showGameOver = () => {
    const s = PH.state;
    const rulers = s.dynasty.rulers.slice(1).map((r) => `<li><b>${U.esc(r.name)}${r.lakab ? ' (' + U.esc(r.lakab) + ')' : ''}</b><small>${r.from}–${r.to} · ${U.esc(r.cause)}</small></li>`).join('');
    PH.Save.save('oto');
    UI.modal(`<div class="mbox gameover">
      ${PH.Portrait.tughra(110)}
      <h3>Saltanat Sona Erdi</h3>
      ${UI.paras(s.gameOver.reason)}
      <div class="reign-stats">${UI.reignStats(s.stats)}</div>
      ${rulers ? `<h4>Hükümdarlarınız</h4><ul class="rulers">${rulers}</ul>` : ''}
      <button class="btn gold wide" data-act="goMain">Ana Menü</button>
    </div>`, { cls: 'small' });
  };

  /* ---------- Genel eylemler ---------- */
  A.tab = (ds) => { UI.tab = ds.t; if (ds.s) UI.sub[ds.t] = ds.s; UI.closeAllSheets(); UI.render(); document.getElementById('screen').scrollTop = 0; U.vibrate(5); };
  A.sub = (ds) => { UI.sub[ds.tab] = ds.s; UI.render(); document.getElementById('screen').scrollTop = 0; };
  A.closeSheet = () => { const t = UI.topSheet(); if (t) t.close(); };
  A.closeModal = () => UI.closeModal();
  A.noop = () => {};

  /** Stat açıklaması */
  A.statInfo = (ds) => {
    const k = ds.k;
    const s = PH.state;
    UI.sheet({
      title: () => (PH.FX.DEF[k] ? PH.FX.DEF[k].l : k),
      render: () => {
        if (k === 'treasury') {
          const b = PH.Eco.budget();
          const row = (l, v, cls) => `<div class="kv"><span>${l}</span><b class="${cls}">${U.money(v)}</b></div>`;
          return `<div class="card"><div class="big ${s.emp.treasury < 0 ? 'neg' : ''}">${U.money(s.emp.treasury, true)}</div>${s.emp.debt ? `<div class="muted">Borç: ${U.money(s.emp.debt, true)} (aylık faiz %1,2)</div>` : ''}</div>
            <h4 class="sec">Aylık Gelirler</h4><div class="card">${Object.keys(b.inc).map((x) => (b.inc[x] ? row(PH.Eco.INC_N[x], b.inc[x], 'pos') : '')).join('')}<div class="kv total"><span>Toplam</span><b class="pos">${U.money(b.ti)}</b></div></div>
            <h4 class="sec">Aylık Giderler</h4><div class="card">${Object.keys(b.exp).map((x) => (b.exp[x] ? row(PH.Eco.EXP_N[x], b.exp[x], 'neg') : '')).join('')}<div class="kv total"><span>Toplam</span><b class="neg">${U.money(b.te)}</b></div></div>
            <div class="card"><div class="kv total"><span>Net</span><b class="${b.net >= 0 ? 'pos' : 'neg'}">${U.money(b.net)}</b></div></div>
            <button class="btn wide" data-act="tab" data-t="divan" data-s="hazine">Hazine yönetimine git ${ic('chev')}</button>`;
        }
        const t = PH.Eco.targets(s);
        const v = s.emp[k];
        const DESC = {
          popularity: 'Halkın padişaha ve devlete duyduğu memnuniyet. Vergi oranı, zahire, rüşvet, yapılar, savaşlar ve adaletinizden etkilenir. Düşerse eyaletlerde isyan çıkar.',
          stability: 'Devletin genel istikrarı. Halk, yeniçeri, ulema ve meşruiyetin ortalaması ile sadrazamın yeteneğine bağlıdır.',
          janissary: 'Kapıkulu ocaklarının sadakati. Akçe değeri, bahşişler, ulufelerin zamanında ödenmesi ve seferlerle artar. Çok düşerse kazan kaldırırlar.',
          ulema: 'Din adamlarının desteği. Takvanız, Şeyhülislam\'ın görüşü, camii ve medreseler belirler.',
          legitimacy: 'Saltanatınızın meşruiyeti. Şöhret, erkek evlat sahibi olmak, Nişancı ve kişisel heybet etkiler.',
          prestige: 'Devletin cihandaki şöhreti. Fetihler, zaferler ve büyük eserlerle artar.',
          food: 'Zahire ambarlarının doluluğu. Her ay azalır, Ağustos\'ta hasatla dolar. Mısır buğdayı ve imaretler yardımcı olur.',
          corruption: 'Devlet çarkındaki rüşvet ve yolsuzluk. Vergi gelirlerini düşürür, halkı kızdırır. Defterdar ve sadrazamın dürüstlüğüne bağlıdır.',
        };
        const tv = t[k];
        return `<div class="card"><div class="big">${Math.round(v)}<small>/100</small></div>${U.bar(k === 'corruption' ? 100 - v : v)}<p class="muted">${DESC[k] || ''}</p>
          ${tv != null ? `<div class="kv"><span>Yöneldiği değer</span><b>${Math.round(tv)}</b></div><p class="muted small">Değerler her ay yavaşça bu hedefe doğru kayar. Olaylar ve kararlar ani değişiklikler yaratır.</p>` : ''}</div>`;
      },
    });
  };

  A.openChronicle = () => PH.UI.openChronicle();
  A.openMenu = () => PH.UI.openMenu();
  A.openCalendar = () => PH.UI.openChronicle('genel');

  /** Etkinlik için tıklama dağıtıcısı */
  UI.bind = () => {
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-act]');
      if (!t || t.disabled) return;
      const fn = A[t.dataset.act];
      if (!fn) { console.warn('Eylem yok:', t.dataset.act); return; }
      e.preventDefault();
      try { fn(t.dataset, t, e); } catch (err) { console.error(err); UI.toast('Hata: ' + U.esc(err.message), 'bad'); }
    });
    document.addEventListener('input', (e) => {
      const t = e.target.closest('[data-input]');
      if (!t) return;
      const fn = A[t.dataset.input];
      if (fn) fn(t.dataset, t, e);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (UI.modalOpen && UI._modalOpts && UI._modalOpts.dismiss) UI.closeModal();
        else if (!UI.modalOpen && UI.sheets.length) A.closeSheet();
      }
      if (e.key === 'Enter') {
        if (document.getElementById('prompt-in') === document.activeElement) A.promptOk();
        if (document.getElementById('ev-in') === document.activeElement) A.evInputOk();
      }
    });
  };

  /* ---------- Ortak UI parçaları ---------- */
  UI.seg = (tab, items) => {
    const cur = UI.sub[tab] || items[0][0];
    return `<div class="seg">${items.map(([id, n, badge]) => `<button class="${cur === id ? 'on' : ''}" data-act="sub" data-tab="${tab}" data-s="${id}">${n}${badge ? `<b>${badge}</b>` : ''}</button>`).join('')}</div>`;
  };
  UI.cur = (tab, def) => UI.sub[tab] || def;

  UI.charRow = (c, sub, right, act) => `<button class="crow" data-act="${act || 'char'}" data-id="${c.id}">${PH.Portrait.svg(c, 46)}<div class="crow-main"><b>${U.esc(C.name(c))}</b><small>${sub || U.esc(C.title(c))}</small></div>${right || ic('chev', 'chev')}</button>`;

  UI.statRow = (l, v, max = 100, opts = {}) => `<div class="srow"><span>${opts.icon ? ic(opts.icon) : ''}${l}</span>${U.bar(opts.invert ? max - v : v, max, opts.cls)}<b>${opts.txt != null ? opts.txt : Math.round(v)}</b></div>`;

  UI.skills = (c) => `<div class="skills">${C.SK.map((k) => `<div class="sk"><small>${C.SKN[k]}</small><b>${c.sk[k]}</b><i>${U.skillWord(c.sk[k])}</i></div>`).join('')}</div>`;

  UI.empty = (t) => `<div class="empty">${U.esc(t)}</div>`;

  return UI;
})();
