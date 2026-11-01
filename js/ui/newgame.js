/* Padişah Hayatı — Açılış ekranı ve yeni oyun sihirbazı */
(function () {
  const U = PH.U, D = PH.D, UI = PH.UI, A = PH.A, Sv = PH.Save;
  const ic = PH.ic;

  UI.titleScreen = () => {
    const app = document.getElementById('app');
    const latest = Sv.latest();
    app.innerHTML = `<div class="title-screen">
      <div class="ts-pattern"></div>
      <div class="ts-inner">
        <div class="ts-emblem">${PH.Portrait.tughra(150)}</div>
        <h1>Padişah Hayatı</h1>
        <p class="ts-sub">Devlet-i Aliyye'nin tahtına oturun.<br>Saray, harem, divan ve cihan sizin elinizde.</p>
        <div class="ts-btns">
          ${latest ? `<button class="btn gold big" data-act="tsContinue" data-sl="${latest.sl}">${ic('play')} Devam Et<small>${U.esc(latest.m.name)} · ${U.esc(latest.m.date)}</small></button>` : ''}
          <button class="btn ${latest ? '' : 'gold'} big" data-act="tsNew">${ic('crown')} Yeni Saltanat</button>
          ${Sv.any() ? `<button class="btn ghost" data-act="openMenu">${ic('door')} Kayıtlar</button>` : ''}
          <button class="btn ghost" data-act="howTo">${ic('info')} Nasıl Oynanır?</button>
        </div>
      </div>
      <p class="ts-foot">Tarihî esinlenmeli kurgusal bir simülasyondur.</p>
    </div>`;
  };

  A.tsContinue = (ds) => { if (Sv.load(ds.sl)) PH.startUI(); else UI.toast('Kayıt açılamadı', 'bad'); };

  /* ---------- Sihirbaz ---------- */
  const NG = {};
  A.tsNew = () => {
    Object.assign(NG, { step: 0, name: U.pick(D.names.sultan), mahlas: U.pick(D.mahlas), era: 1, age: 26, upbringing: 'sancak', traits: [], diff: 'normal' });
    renderNG();
  };

  function renderNG() {
    const app = document.getElementById('app');
    const steps = ['Dönem', 'Padişah', 'Kişilik', 'Onay'];
    let body = '';
    if (NG.step === 0) {
      body = `<h2>Hangi devirde tahta çıkacaksınız?</h2><div class="era-list">${D.eras.map((e) => `<button class="era ${NG.era === e.id ? 'on' : ''}" data-act="ngEra" data-id="${e.id}"><div class="era-top"><b>${e.n}</b><span>${e.sub}</span></div><p>${U.esc(e.d)}</p><div class="era-diff">${['Kolay başlangıç', 'Altın çağ', 'Zorlu', 'Çok zorlu'][e.id]}</div></button>`).join('')}</div>`;
    } else if (NG.step === 1) {
      body = `<h2>Padişahınız</h2>
        <label class="field"><span>İsim</span><div class="inrow"><input id="ng-name" maxlength="16" value="${U.esc(NG.name)}" data-input="ngName"><button class="icon-btn" data-act="ngRandName">${ic('swap')}</button></div></label>
        <div class="chips">${U.sample(D.names.sultan, 8).map((n) => `<button class="chip" data-act="ngSetName" data-v="${n}">${n}</button>`).join('')}</div>
        <label class="field"><span>Şiirlerinizdeki mahlas</span><div class="inrow"><input id="ng-mahlas" maxlength="14" value="${U.esc(NG.mahlas)}" data-input="ngMahlas"><button class="icon-btn" data-act="ngRandMahlas">${ic('swap')}</button></div></label>
        <div class="slider"><label>Cülus yaşı <b id="ng-age">${NG.age}</b></label><input type="range" min="12" max="55" value="${NG.age}" data-input="ngAge"></div>
        <p class="muted small">Genç padişahlar uzun yaşar ama tecrübesizdir; 16 yaşından küçükse naib (vekil) gerekir. Yaşlı padişahların çocukları olur ama ömrü kısadır.</p>
        <h3>Yetişme Tarzı</h3><div class="opt-list">${D.upbringing.map((u) => `<button class="opt ${NG.upbringing === u.id ? 'on' : ''}" data-act="ngUp" data-id="${u.id}"><b>${u.n}</b><small>${U.esc(u.d)}</small><div class="sk-mini">${Object.keys(u.sk).map((k) => `${PH.C.SKN[k]} +${u.sk[k]}`).join(' · ')}</div></button>`).join('')}</div>`;
    } else if (NG.step === 2) {
      const all = Object.keys(D.traits).filter((k) => D.traits[k].sultan);
      body = `<h2>Kişiliği</h2><p class="muted">En fazla 3 özellik seçin (${NG.traits.length}/3). Olumsuz özellikler de oyuna derinlik katar.</p>
        <div class="trait-pick">${all.map((k) => { const t = D.traits[k]; const on = NG.traits.includes(k); const blocked = !on && (NG.traits.length >= 3 || (t.opp && NG.traits.includes(t.opp))); return `<button class="tp ${t.kind} ${on ? 'on' : ''}" data-act="ngTrait" data-id="${k}" ${blocked ? 'disabled' : ''}><b>${t.n}</b><small>${U.esc(t.d)}</small></button>`; }).join('')}</div>
        <h3>Zorluk</h3><div class="taxrow three">${Object.keys(PH.St.DIFF).map((k) => `<button class="${NG.diff === k ? 'on' : ''}" data-act="ngDiff" data-k="${k}"><b>${PH.St.DIFF[k].n}</b><small>${k === 'kolay' ? 'bol hazine' : k === 'zor' ? 'güçlü düşman' : 'dengeli'}</small></button>`).join('')}</div>`;
    } else {
      const e = D.eras[NG.era];
      body = `<h2>Cülus-ı Hümâyun</h2><div class="card ng-sum"><div class="kv"><span>Padişah</span><b>Sultan ${U.esc(NG.name)} Han</b></div><div class="kv"><span>Mahlas</span><b>${U.esc(NG.mahlas)}</b></div><div class="kv"><span>Dönem</span><b>${e.n} (${e.year})</b></div><div class="kv"><span>Yaş</span><b>${NG.age}</b></div><div class="kv"><span>Yetişme</span><b>${D.upbringing.find((u) => u.id === NG.upbringing).n}</b></div><div class="kv"><span>Kişilik</span><b>${NG.traits.map((t) => D.traits[t].n).join(', ') || '—'}</b></div><div class="kv"><span>Zorluk</span><b>${PH.St.DIFF[NG.diff].n}</b></div></div>
        <p class="muted center">"${U.esc(e.d)}"</p>`;
    }
    app.innerHTML = `<div class="ng">
      <header class="ng-head"><button class="icon-btn" data-act="ngBack">${ic('back')}</button><div class="ng-steps">${steps.map((s, i) => `<span class="${i === NG.step ? 'on' : i < NG.step ? 'done' : ''}">${s}</span>`).join('')}</div><span></span></header>
      <div class="ng-body">${body}</div>
      <footer class="ng-foot"><button class="btn gold wide big" data-act="ngNext">${NG.step === 3 ? ic('crown') + ' Tahta Çık' : 'Devam ' + ic('chev')}</button></footer>
    </div>`;
  }

  A.ngEra = (ds) => { NG.era = +ds.id; renderNG(); };
  A.ngName = (ds, el) => { NG.name = el.value; };
  A.ngMahlas = (ds, el) => { NG.mahlas = el.value; };
  A.ngSetName = (ds) => { NG.name = ds.v; renderNG(); };
  A.ngRandName = () => { NG.name = U.pick(D.names.sultan); renderNG(); };
  A.ngRandMahlas = () => { NG.mahlas = U.pick(D.mahlas); renderNG(); };
  A.ngAge = (ds, el) => { NG.age = +el.value; const l = document.getElementById('ng-age'); if (l) l.textContent = NG.age; };
  A.ngUp = (ds) => { NG.upbringing = ds.id; renderNG(); };
  A.ngTrait = (ds) => { const i = NG.traits.indexOf(ds.id); if (i >= 0) NG.traits.splice(i, 1); else if (NG.traits.length < 3) NG.traits.push(ds.id); renderNG(); };
  A.ngDiff = (ds) => { NG.diff = ds.k; renderNG(); };
  A.ngBack = () => { if (NG.step === 0) UI.titleScreen(); else { NG.step--; renderNG(); } };
  A.ngNext = () => {
    if (NG.step === 1) {
      NG.name = (NG.name || '').trim().slice(0, 16) || U.pick(D.names.sultan);
      NG.mahlas = (NG.mahlas || '').trim().slice(0, 14) || U.pick(D.mahlas);
    }
    if (NG.step < 3) { NG.step++; renderNG(); document.querySelector('.ng-body').scrollTop = 0; return; }
    PH.St.newGame({ name: NG.name, mahlas: NG.mahlas, era: NG.era, age: NG.age, upbringing: NG.upbringing, traits: NG.traits.slice(), diff: NG.diff });
    PH.startUI();
  };
})();
