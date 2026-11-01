/* Padişah Hayatı — Harem ve Hanedan ekranı */
(function () {
  const U = PH.U, D = PH.D, C = PH.C, UI = PH.UI, A = PH.A, H = PH.Harem;
  const ic = PH.ic;
  const fx = PH.fx;
  const N = (c) => C.name(c);

  UI.screens.harem = {
    render() {
      const sub = UI.cur('harem', 'harem');
      let h = UI.seg('harem', [['harem', 'Harem-i Hümâyun'], ['hanedan', 'Hanedan'], ['silsile', 'Silsile']]);
      if (sub === 'harem') h += harem();
      if (sub === 'hanedan') h += dynasty();
      if (sub === 'silsile') h += lineage();
      return h;
    },
  };

  function harem() {
    const s = PH.state;
    const v = H.valide();
    const ws = H.women();
    let h = '';
    if (v) h += `<h4 class="sec">${ic('crown')} Valide Sultan</h4>${UI.charRow(v, `${C.age(v)} yaş · ${U.opWord(v.op)} · Hırs ${v.amb > 65 ? 'yüksek' : 'makul'}`)}`;
    h += `<h4 class="sec">${ic('tulip')} Harem <small>${ws.length} hanım · vakit: ${s.vakit}</small></h4>`;
    if (!ws.length) h += UI.empty('Haremde henüz kimse yok.');
    h += `<div class="list">${ws.map((w) => {
      const kids = C.children(w.id).filter((k) => k.fa === s.sultanId);
      const sons = kids.filter((k) => k.g === 'm').length;
      return `<div class="hw">${UI.charRow(w, `${H.RANK_N[w.rank]} · ${C.age(w)} yaş · ${w.origin || ''}${kids.length ? ` · ${kids.length} çocuk${sons ? ` (${sons} şehzade)` : ''}` : ''}${w.preg ? ' · hamile (' + w.preg + ' ay)' : ''}`, '<span class="hw-sp"></span>')}<button class="hw-visit btn sm gold" data-act="chVisit" data-id="${w.id}" ${s.vakit < 1 ? 'disabled' : ''} aria-label="Vakit geçir">${ic('tulip')}</button><div class="hw-bar">${U.bar(w.favor || 0, 100, 'rose')}</div></div>`;
    }).join('')}</div>`;
    h += `<button class="bigbtn" data-act="newCariye">${ic('plus')}<div><b>Harem'e Yeni Cariye Kabul Et</b><small>Valide Sultan ve Darüssaade Ağası'nın seçtiği adaylar · 1,5 Mn akçe</small></div>${ic('chev', 'chev')}</button>`;
    const old = C.list((c) => c.role === 'eskisaray');
    if (old.length) h += `<h4 class="sec">${ic('door')} Eski Saray <small>${old.length}</small></h4><div class="list">${old.slice(0, 8).map((c) => UI.charRow(c, `${C.age(c)} yaş`)).join('')}</div>`;
    return h;
  }

  function dynasty() {
    const s = PH.state;
    const sul = C.sultan();
    const kids = H.kids();
    const heir = H.ruleHeir();
    let h = `<div class="card"><div class="kv"><span>${ic('crown')} Veraset usulü</span><b>${H.SUCC_N[s.dynasty.succession]}</b></div><div class="kv"><span>${ic('user')} Varis</span><b>${heir ? U.esc(N(heir)) : '<span class="neg">Yok!</span>'}</b></div></div>`;
    const sons = kids.filter((k) => k.g === 'm'), daughters = kids.filter((k) => k.g === 'f');
    h += `<h4 class="sec">${ic('baby')} Şehzadeler <small>${sons.length}</small></h4>`;
    h += sons.length ? `<div class="list">${sons.map((k) => UI.charRow(k, `${C.age(k)} yaş · ${U.esc(C.title(k))}${s.dynasty.heirId === k.id ? ' · ⭐ Veliaht' : ''} · ${C.SKN[C.bestSkill(k)]} ${k.sk[C.bestSkill(k)]}${k.edu && C.age(k) < 18 ? ' · eğitim: ' + C.SKN[k.edu.focus] : ''}`)).join('')}</div>` : UI.empty('Henüz şehzadeniz yok.');
    h += `<h4 class="sec">${ic('tulip')} Sultanlar (Kızlarınız) <small>${daughters.length}</small></h4>`;
    h += daughters.length ? `<div class="list">${daughters.map((k) => UI.charRow(k, `${C.age(k)} yaş · ${k.spouse && C.get(k.spouse) ? 'Eşi: ' + U.esc(N(C.get(k.spouse))) : 'Bekâr'}`)).join('')}</div>` : UI.empty('Henüz kızınız yok.');
    const sibs = C.siblings(sul).filter((x) => x.dyn);
    if (sibs.length) h += `<h4 class="sec">${ic('family')} Kardeşleriniz</h4><div class="list">${sibs.map((k) => UI.charRow(k, `${C.age(k)} yaş · ${U.esc(C.title(k))} · ${U.opWord(k.op)}`)).join('')}</div>`;
    const others = H.dynMales().filter((c) => c.fa !== sul.id && c.fa !== sul.fa);
    if (others.length) h += `<h4 class="sec">${ic('people')} Diğer Hanedan Üyeleri</h4><div class="list">${others.map((k) => UI.charRow(k, `${C.age(k)} yaş · ${U.esc(C.relation(k) || C.title(k))}`)).join('')}</div>`;
    const lost = C.children(sul.id, true).filter((k) => !k.alive);
    if (lost.length) h += `<h4 class="sec">${ic('skull')} Kaybettiğiniz Evlatlar</h4><div class="list">${lost.map((k) => UI.charRow(k, `${k.dy} · ${U.esc(k.dcause)}`)).join('')}</div>`;
    return h;
  }

  function lineage() {
    const s = PH.state;
    const rulers = s.dynasty.rulers.slice().reverse();
    const sul = C.sultan();
    let h = `<div class="silsile"><div class="sil-node cur" data-act="char" data-id="${sul.id}">${PH.Portrait.svg(sul, 48)}<div><b>${U.esc(sul.name)}</b><small>${s.reign.start.y} – ... · hüküm sürüyor</small></div></div>`;
    rulers.forEach((r, i) => {
      const c = C.get(r.id);
      h += `<div class="sil-line"></div><div class="sil-node" ${c ? `data-act="char" data-id="${c.id}"` : ''}>${c ? PH.Portrait.svg(c, 40) : ''}<div><b>${U.esc(r.name)}${r.lakab ? ` <em>${U.esc(r.lakab)}</em>` : ''}</b><small>${r.from} – ${r.to} · ${U.esc(r.cause)}</small>${r.stats ? `<small>Fetih ${r.stats.conquests} · Yapı ${r.stats.buildings} · Zafer ${r.stats.battlesWon}</small>` : ''}</div></div>`;
    });
    h += `</div>`;
    return h;
  }

  A.newCariye = () => {
    const s = PH.state;
    if (s.emp.treasury < 1.5e6) { UI.toast('Hazine yetersiz (1,5 Mn)', 'bad'); return; }
    if ((s.cd.cariye || 0) > s.turn) { UI.toast(`Yeni adaylar ${(s.cd.cariye || 0) - s.turn} ay sonra hazır olacak.`, 'bad'); return; }
    H.cleanupCandidates();
    const cands = H.newCandidates();
    UI._cands = cands.map((c) => c.id);
    UI.sheet({
      title: 'Cariye Adayları',
      onClose: () => H.cleanupCandidates(),
      render: () => `<p class="muted">Darüssaade Ağası, Valide Sultan'ın da onayıyla üç adayı huzura çıkardı. Hepsi Enderun usulü terbiye görmüş; musiki, edep ve hüner sahibi.</p><div class="list">${UI._cands.map((id) => C.get(id)).filter(Boolean).map((c) => `<div class="cand">${PH.Portrait.svg(c, 52)}<div class="cand-main"><b>${U.esc(c.name)}</b><small>${C.age(c)} yaş · ${U.esc(c.origin)}</small><div class="traits">${C.traitChips(c)}</div></div><button class="btn sm gold" data-act="pickCariye" data-id="${c.id}">Kabul</button></div>`).join('')}</div>`,
    });
  };
  A.pickCariye = (ds) => {
    const s = PH.state;
    const c = C.get(+ds.id);
    const others = UI._cands.map((id) => C.get(id)).filter(Boolean);
    PH.FX.run(() => fx({ treasury: -1.5e6, happiness: 3 }));
    H.acceptCandidate(c, others);
    s.cd.cariye = s.turn + 6;
    const v = H.valide(); if (v) C.opinion(v, 3, true);
    UI._cands = [];
    A.closeSheet();
    UI.toast(`${U.esc(c.name)} harem-i hümâyuna katıldı.`, 'ok');
    UI.refresh();
  };
})();
