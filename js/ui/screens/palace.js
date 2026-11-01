/* Padişah Hayatı — Saray ekranı: padişah, uyarılar ve şahsi faaliyetler */
(function () {
  const U = PH.U, D = PH.D, C = PH.C, UI = PH.UI, A = PH.A;
  const ic = PH.ic;

  function alerts(s) {
    const out = [];
    const b = PH.Eco.budget();
    const sul = C.sultan();
    if (s.emp.treasury < 0) out.push(['bad', 'coin', 'Hazine boş! Ulufeler ödenemiyor.', 'statInfo', 'k="treasury"']);
    else if (b.net < 0) out.push(['warn', 'coin', `Hazine her ay ${U.money(-b.net)} açık veriyor.`, 'statInfo', 'k="treasury"']);
    if (s.emp.janissary < 35) out.push(['bad', 'jan', 'Yeniçeriler huzursuz; isyan çıkabilir.', 'statInfo', 'k="janissary"']);
    if (s.emp.food < 25) out.push(['warn', 'wheat', 'Zahire ambarları boşalıyor.', 'statInfo', 'k="food"']);
    const rebels = PH.Eco.ownProvs(s).filter((p) => p.rebel);
    if (rebels.length) out.push(['bad', 'flag', `${rebels.map((p) => D.prov[p.id].n).join(', ')} isyanda.`, 'tab', 'data-t="world" data-s="eyalet"']);
    const hot = PH.Eco.ownProvs(s).filter((p) => !p.rebel && !p.vassal && p.unrest > 65);
    if (hot.length) out.push(['warn', 'alert', `${hot.length} eyalette huzursuzluk yüksek.`, 'tab', 'data-t="world" data-s="eyalet"']);
    const vac = D.officeOrder.filter((o) => !s.offices[o]);
    if (vac.length) out.push(['warn', 'seal', `Boş makamlar: ${vac.map((o) => D.offices[o].n).join(', ')}`, 'tab', 'data-t="divan"']);
    s.plots.filter((p) => p.known).forEach((p) => { const c = C.get(p.by); if (c) out.push(['bad', 'dagger', `${C.name(c)} bir ${PH.Court.PLOT_N[p.type].toLowerCase()} planlıyor!`, 'char', `data-id="${c.id}"`]); });
    Object.values(s.nations).filter((n) => n.war).forEach((n) => out.push(['war', 'sword', `${PH.Dip.short(n.id)} ile savaştasınız (skor ${Math.round(n.ws)}).`, 'nation', `data-id="${n.id}"`]));
    if (s.campaign) { const cp = s.campaign; out.push(['war', 'tent', `Sefer: ${D.prov[cp.target].n} — ${{ march: 'yolda', battle: 'muharebe', siege: 'kuşatma %' + Math.round(cp.siege), return: 'dönüşte' }[cp.phase]}`, 'tab', 'data-t="army" data-s="sefer"']); }
    if (sul.hp < 40) out.push(['bad', 'heart', 'Sağlığınız kötü. Hekimbaşına görünün, dinlenin.', 'char', `data-id="${sul.id}"`]);
    if (sul.stress > 70) out.push(['warn', 'stress', 'Stresiniz çok yüksek. Hamam, av veya bahçe iyi gelebilir.', 'char', `data-id="${sul.id}"`]);
    if (!C.sons(sul.id).length && C.age(sul) >= 18) out.push(['warn', 'baby', 'Henüz bir şehzadeniz yok. Hanedanın devamı tehlikede.', 'tab', 'data-t="harem"']);
    C.list((c) => c.preg && c.role === 'harem').forEach((w) => out.push(['ok', 'baby', `${w.name} hamile (${w.preg} ay).`, 'char', `data-id="${w.id}"`]));
    PH.Harem.kids().filter((k) => C.age(k) >= 6 && C.age(k) < 18 && !k.edu).forEach((k) => out.push(['warn', 'book', `${C.name(k)} için hoca tayin edilmedi.`, 'char', `data-id="${k.id}"`]));
    return out;
  }

  UI.screens.palace = {
    render() {
      const s = PH.state;
      const sul = C.sultan();
      const years = s.year - s.reign.start.y;
      const lakab = PH.Harem.lakab();
      let h = `<section class="hero" data-act="char" data-id="${sul.id}">
        <div class="hero-bg"></div>
        ${PH.Portrait.svg(sul, 92)}
        <div class="hero-main">
          <h1>${U.esc(C.name(sul))}</h1>
          <div class="hero-sub">${C.age(sul)} yaşında · ${years ? years + ' yıllık saltanat' : 'yeni cülus'}${lakab ? ` · halk arasında <b>"${U.esc(lakab)}"</b>` : ''}</div>
          <div class="traits">${C.traitChips(sul)}</div>
        </div>
      </section>
      <div class="card meters">
        ${UI.statRow('Sağlık', sul.hp, 100, { icon: 'heart' })}
        ${UI.statRow('Keyif', sul.happiness, 100, { icon: 'smile' })}
        ${UI.statRow('Stres', sul.stress, 100, { icon: 'stress', invert: true, txt: Math.round(sul.stress) })}
        ${UI.statRow('Takva', sul.piety, 100, { icon: 'mosque', cls: 'mid' })}
      </div>
      ${UI.skills(sul)}`;
      const al = alerts(s);
      if (al.length) h += `<h4 class="sec">${ic('alert')} Dikkat Edilecekler</h4><div class="alerts">${al.slice(0, 8).map(([t, i, txt, act, attr]) => `<button class="alrt ${t}" data-act="${act}" ${attr.startsWith('k=') ? 'data-' + attr : attr}>${ic(i)}<span>${U.esc(txt)}</span>${ic('chev', 'chev')}</button>`).join('')}</div>`;
      // faaliyetler
      const groups = {};
      PH.Act.list.forEach((a) => { (groups[a.grp] = groups[a.grp] || []).push(a); });
      h += `<h4 class="sec">${ic('hourglass')} Şahsi Faaliyetler <small>Kalan vakit: ${s.vakit}/${s.vakitMax}</small></h4>`;
      Object.keys(groups).forEach((g) => {
        h += `<div class="grp-title">${g}</div><div class="actgrid">${groups[g].map((a) => {
          const dis = s.vakit < a.cost;
          return `<button class="actc ${dis ? 'dim' : ''}" data-act="act" data-id="${a.id}">${ic(a.icon)}<b>${a.n}</b><small>${'⌛'.repeat(a.cost)}</small></button>`;
        }).join('')}</div>`;
      });
      // son olaylar
      const recent = s.log.slice(0, 5);
      if (recent.length) h += `<h4 class="sec">${ic('scroll')} Son Gelişmeler</h4><div class="card log-mini">${recent.map((l) => `<div class="lg ${l.k}"><small>${U.MONTHS[l.m].slice(0, 3)} ${l.y}</small><span>${U.esc(l.t)}</span></div>`).join('')}<button class="btn ghost sm wide" data-act="openChronicle">Tüm kronik</button></div>`;
      return h;
    },
  };

  A.act = (ds) => {
    const s = PH.state;
    const a = PH.Act.byId(ds.id);
    if (!a) return;
    if (s.vakit < a.cost) { UI.toast('Bu ay yeterli vaktiniz kalmadı. Ayı tamamlayın.', 'bad'); return; }
    const opts = a.opts ? a.opts(s) : null;
    if (opts) {
      if (!opts.length) { UI.toast('Uygun seçenek yok.', 'bad'); return; }
      UI.sheet({
        title: U.esc(a.n),
        render: () => `<p class="muted">${U.esc(a.d)}</p><div class="list">${opts.map((o) => {
          const r = o.req ? o.req(PH.state) : true;
          const ok = r === true;
          return `<button class="lrow" data-act="actGo" data-id="${a.id}" data-o="${o.id}" ${ok ? '' : 'disabled'}>${ic(a.icon)}<div><b>${U.esc(o.n)}</b><small>${ok ? U.esc(o.d || '') : ic('lock') + ' ' + U.esc(r)}</small></div>${ic('chev', 'chev')}</button>`;
        }).join('')}</div>`,
      });
      return;
    }
    A.actGo({ id: a.id });
  };

  A.actGo = (ds) => {
    const s = PH.state;
    const a = PH.Act.byId(ds.id);
    if (s.vakit < a.cost) { UI.toast('Vakit yetersiz.', 'bad'); return; }
    if (ds.o) A.closeSheet();
    s.vakit -= a.cost;
    UI.run(a.n, () => a.run(s, ds.o), { icon: a.icon });
  };
})();
