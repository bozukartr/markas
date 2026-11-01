/* Padişah Hayatı — Vakanüvis (kronik) ve istatistikler */
(function () {
  const U = PH.U, D = PH.D, C = PH.C, UI = PH.UI, A = PH.A;
  const ic = PH.ic;

  const KINDS = {
    all: { n: 'Tümü' },
    major: { n: 'Önemli', k: ['major'] },
    war: { n: 'Savaş', k: ['war', 'diplo'] },
    court: { n: 'Saray', k: ['court', 'harem', 'dyn', 'birth', 'law', 'build', 'eco'] },
    death: { n: 'Ölüm', k: ['death', 'blood'] },
  };
  const KIND_IC = { major: 'star', war: 'sword', diplo: 'handshake', court: 'seal', harem: 'tulip', dyn: 'crown', birth: 'baby', law: 'scroll', build: 'hammer', eco: 'coin', death: 'skull', blood: 'dagger', info: 'info' };

  UI.openChronicle = (tab) => {
    UI._chr = tab || UI._chr || 'all';
    UI.sheet({ title: 'Vakanüvis', cls: 'tall', render: renderChr });
  };
  A.chrTab = (ds) => { UI._chr = ds.t; UI.topSheet().refresh(); };

  function renderChr() {
    const s = PH.state;
    const t = UI._chr;
    let h = `<div class="chips">${Object.keys(KINDS).map((k) => `<button class="chip ${t === k ? 'on' : ''}" data-act="chrTab" data-t="${k}">${KINDS[k].n}</button>`).join('')}<button class="chip ${t === 'genel' ? 'on' : ''}" data-act="chrTab" data-t="genel">İstatistik</button></div>`;
    if (t === 'genel') return h + general(s);
    const f = KINDS[t].k;
    const list = s.log.filter((l) => !f || f.includes(l.k)).slice(0, 250);
    if (!list.length) return h + UI.empty('Henüz kayıt yok.');
    let lastY = null;
    h += `<div class="chron">`;
    list.forEach((l) => {
      if (l.y !== lastY) { h += `<div class="chron-y">${l.y} <small>${U.hijri(l.y, l.m)} H.</small></div>`; lastY = l.y; }
      h += `<div class="chron-i ${l.k}">${ic(KIND_IC[l.k] || 'info')}<div><small>${U.MONTHS[l.m]}</small><span>${U.esc(l.t)}</span></div></div>`;
    });
    return h + `</div>`;
  }

  function general(s) {
    const st = s.stats;
    const r = s.reign;
    const sul = C.sultan();
    const own = PH.Eco.ownProvs(s).length;
    let h = `<div class="card"><h4>${U.gen(U.esc(C.name(sul)))} Saltanatı</h4><div class="reign-stats">${UI.reignStats(r)}</div><p class="muted small">Halk arasındaki lakabı: <b>${U.esc(PH.Harem.lakab() || 'henüz yok')}</b></p></div>`;
    h += `<div class="card"><h4>Hanedanın Toplamı</h4><div class="reign-stats">${UI.reignStats(st)}<div><b>${st.kids}</b><small>Doğum</small></div><div><b>${st.poems}</b><small>Şiir</small></div><div><b>${st.hunts}</b><small>Av</small></div><div><b>${own}</b><small>Eyalet</small></div></div></div>`;
    h += `<div class="card"><div class="kv"><span>Oyun başlangıcı</span><b>${D.eras[s.era].year}</b></div><div class="kv"><span>Geçen süre</span><b>${Math.floor(s.turn / 12)} yıl ${s.turn % 12} ay</b></div><div class="kv"><span>Zorluk</span><b>${PH.St.DIFF[s.diff].n}</b></div><div class="kv"><span>Hükümdar sayısı</span><b>${s.dynasty.rulers.length}</b></div></div>`;
    return h;
  }
})();
