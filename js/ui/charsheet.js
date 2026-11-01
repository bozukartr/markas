/* Padişah Hayatı — Karakter sayfası ve kişi etkileşimleri */
(function () {
  const U = PH.U, D = PH.D, C = PH.C, UI = PH.UI, A = PH.A, St = PH.St, H = PH.Harem, Court = PH.Court;
  const ic = PH.ic;
  const fx = PH.fx;
  const N = (c) => C.name(c);
  const HIDDEN = ['hain', 'rusvetci', 'hirsli', 'entrikaci', 'kiskanc', 'sadik', 'durust'];

  const vakitReq = (n = 1) => PH.state.vakit >= n;
  const btn = (act, id, label, icon, o = {}) => `<button class="abtn ${o.cls || ''}" data-act="${act}" data-id="${id}" ${o.extra || ''} ${o.dis ? 'disabled' : ''}>${ic(icon)}<span>${label}</span>${o.sub ? `<small>${o.sub}</small>` : ''}</button>`;

  A.char = (ds) => UI.openChar(+ds.id);

  UI.openChar = (id) => {
    const existing = UI.sheets.find((x) => x.o.charId === id);
    if (existing) { existing.refresh(); return; }
    UI.sheet({ charId: id, cls: 'char-sheet', title: () => { const c = C.get(id); return c ? U.esc(C.title(c) || 'Kişi') : ''; }, render: () => renderChar(id) });
  };

  function traitsView(c) {
    const sul = C.sultan();
    const known = c.known || c.id === sul.id || c.dyn || c.role === 'valide';
    return (c.traits || []).map((t) => {
      const td = D.traits[t];
      if (!td) return '';
      if (!known && HIDDEN.includes(t)) return '<span class="trait unk" title="Bu özelliği öğrenmek için sohbet edin veya izletin">?</span>';
      return `<span class="trait ${td.kind === 'pos' ? 'pos' : td.kind === 'neg' ? 'neg' : ''}" title="${U.esc(td.d)}">${U.esc(td.n)}</span>`;
    }).join('');
  }

  function family(c) {
    const out = [];
    const fa = C.get(c.fa), mo = C.get(c.mo), sp = C.get(c.spouse);
    const kids = C.children(c.id, true).sort((a, b) => a.by - b.by);
    const link = (x, l) => `<button class="flink ${x.alive ? '' : 'dead'}" data-act="char" data-id="${x.id}">${PH.Portrait.svg(x, 30)}<span><small>${l}</small>${U.esc(x.name)}${x.alive ? '' : ' †'}</span></button>`;
    if (fa) out.push(link(fa, 'Baba'));
    if (mo) out.push(link(mo, 'Anne'));
    if (sp) out.push(link(sp, 'Eş'));
    kids.forEach((k) => out.push(link(k, k.g === 'm' ? 'Oğul' : 'Kız')));
    return out.length ? `<h4 class="sec">Aile</h4><div class="flinks">${out.join('')}</div>` : '';
  }

  function renderChar(id) {
    const s = PH.state;
    const c = C.get(id);
    if (!c) return UI.empty('Bu kişi artık yok.');
    const sul = C.sultan();
    const isSul = c.id === sul.id;
    const age = C.ageAt(c);
    const rel = C.relation(c);
    const plot = PH.Court.plotOf(c);
    const known = c.known || c.dyn || c.role === 'valide';
    let h = `<div class="ch-head">${PH.Portrait.svg(c, 84)}<div><h2>${U.esc(N(c))}${c.lakab ? ` <em>"${U.esc(c.lakab)}"</em>` : ''}</h2>
      <div class="muted">${rel ? U.esc(rel) + ' · ' : ''}${age} yaşında${c.alive ? '' : ` · ${c.dy} yılında ${U.esc(c.dcause)} vefat etti`}${c.origin ? ' · ' + U.esc(c.origin) : ''}</div>
      <div class="traits">${traitsView(c)}</div></div></div>`;
    if (c.alive) {
      h += `<div class="card">`;
      h += UI.statRow('Sağlık', c.hp, 100, { icon: 'heart' });
      if (!isSul) {
        h += UI.statRow('Size bakışı', c.op + 100, 200, { icon: 'smile', txt: U.opWord(c.op) });
        if (known) h += UI.statRow('Hırs', c.amb, 100, { icon: 'flag', cls: c.amb > 65 ? 'bad' : 'mid' });
        if (c.role === 'harem') h += UI.statRow('Gözdeliği', c.favor || 0, 100, { icon: 'tulip' });
        if (c.wealth) h += `<div class="kv"><span>${ic('coin')} Servet</span><b>${U.money(c.wealth, true)}</b></div>`;
        if (c.preg) h += `<div class="kv"><span>${ic('baby')} Hamile</span><b>${c.preg} ay kaldı</b></div>`;
        if (c.edu && age < 18) h += `<div class="kv"><span>${ic('book')} Eğitim</span><b>${C.SKN[c.edu.focus]} · hoca ${'★'.repeat(c.edu.q)}</b></div>`;
        if (s.dynasty.heirId === c.id) h += `<div class="kv"><span>${ic('crown')} Veliaht</span><b>Evet</b></div>`;
        if (plot && plot.known) h += `<div class="alert">${ic('dagger')} Bu kişinin bir <b>${Court.PLOT_N[plot.type].toLowerCase()}</b> planı hazırladığı biliniyor! (%${Math.round(plot.prog)})</div>`;
      } else {
        h += UI.statRow('Keyif', sul.happiness, 100, { icon: 'smile' });
        h += UI.statRow('Stres', sul.stress, 100, { icon: 'stress', invert: true, txt: Math.round(sul.stress) });
        h += UI.statRow('Takva', sul.piety, 100, { icon: 'mosque' });
      }
      h += `</div>`;
    }
    h += `<h4 class="sec">Yetenekler</h4>${UI.skills(c)}`;
    if (c.alive) h += actions(c);
    h += family(c);
    if (isSul) h += `<div class="card muted small">Mahlas: <b>${U.esc(sul.mahlas || '-')}</b> · Yetişme: ${U.esc((D.upbringing.find((u) => u.id === sul.upbringing) || {}).n || 'Sarayda')}</div>`;
    return h;
  }

  function actions(c) {
    const s = PH.state;
    const sul = C.sultan();
    if (c.id === sul.id) {
      return `<h4 class="sec">Şahsi</h4><div class="agrid">
        ${btn('chMahlas', c.id, 'Mahlas Değiştir', 'feather')}
        ${btn('chAbdicate', c.id, 'Tahttan Feragat', 'exile', { cls: 'danger' })}
      </div>`;
    }
    const out = [];
    const vk = vakitReq();
    const age = C.age(c);
    out.push(btn('chTalk', c.id, 'Sohbet Et', 'talk', { sub: '1 vakit', dis: !vk }));
    if (c.role !== 'aday') out.push(btn('chGift', c.id, 'Hediye Ver', 'gift'));
    if (c.role === 'devlet') {
      if (!c.exiled && !c.prison) {
        out.push(btn('chAppoint', c.id, 'Makama Ata', 'seal'));
        if (c.cls === 'pasa') out.push(btn('chGov', c.id, 'Vali Ata', 'map'));
        if (c.office || c.gov) out.push(btn('chDismiss', c.id, 'Azlet', 'down'));
        out.push(btn('chSpy', c.id, 'Hafiyeye İzlet', 'eye', { sub: '300 bin' }));
        if (c.wealth > 1e6) out.push(btn('chConfiscate', c.id, 'Müsadere', 'bribe', { sub: U.money(c.wealth * 0.75) }));
        out.push(btn('chExile', c.id, 'Sürgün', 'exile', { cls: 'warn' }));
        out.push(btn('chPrison', c.id, 'Yedikule', 'chain', { cls: 'warn' }));
      } else out.push(btn('chPardon', c.id, 'Affet', 'check'));
      out.push(btn('chExecute', c.id, 'Siyaseten Katl', 'skull', { cls: 'danger', sub: `Fetva %${Math.round(Court.fetvaChance(c) * 100)}` }));
    }
    if (c.dyn && c.g === 'm') {
      if (age >= 4) out.push(btn('chTime', c.id, 'Vakit Geçir', 'family', { sub: '1 vakit', dis: !vk }));
      if (age >= 6 && age < 18) out.push(btn('chEdu', c.id, 'Eğitimini Düzenle', 'book'));
      if (age >= 14 && !c.sancak && !c.kafes) out.push(btn('chSancak', c.id, 'Sancağa Gönder', 'flag'));
      if (c.sancak) out.push(btn('chRecall', c.id, 'Saraya Çağır', 'palace'));
      if (!c.kafes) out.push(btn('chKafes', c.id, 'Kafese Kapat', 'lock', { cls: 'warn' }));
      else out.push(btn('chUnkafes', c.id, 'Kafesten Çıkar', 'key'));
      if (c.fa === sul.id && s.dynasty.heirId !== c.id) out.push(btn('chHeir', c.id, 'Veliaht İlan Et', 'crown'));
      if (age >= 12) out.push(btn('chExecute', c.id, 'Siyaseten Katl', 'skull', { cls: 'danger', sub: 'Hanedan kanı' }));
    }
    if (c.dyn && c.g === 'f') {
      if (age >= 4) out.push(btn('chTime', c.id, 'Vakit Geçir', 'family', { sub: '1 vakit', dis: !vk }));
      if (age >= 6 && age < 18) out.push(btn('chEdu', c.id, 'Eğitimini Düzenle', 'book'));
      if (age >= 14 && !c.spouse) out.push(btn('chMarry', c.id, 'Evlendir', 'ring'));
    }
    if (c.role === 'harem') {
      out.unshift(btn('chVisit', c.id, 'Vakit Geçir', 'tulip', { sub: '1 vakit', dis: !vk, cls: 'gold' }));
      if (c.rank !== 'haseki') out.push(btn('chPromote', c.id, 'Mertebe Yükselt', 'up'));
      if (c.rank === 'haseki' && !c.nikah) out.push(btn('chNikah', c.id, 'Nikâh Kıy', 'ring'));
      out.push(btn('chFreeMarry', c.id, 'Azat Edip Evlendir', 'handshake'));
      out.push(btn('chEskiSaray', c.id, 'Eski Saray\'a Gönder', 'exile', { cls: 'warn' }));
    }
    if (c.role === 'valide') {
      out.push(btn('chAdvice', c.id, 'Nasihat İste', 'scroll', { sub: '1 vakit', dis: !vk }));
      out.push(btn('chEskiSaray', c.id, 'Eski Saray\'a Gönder', 'exile', { cls: 'danger' }));
    }
    return `<h4 class="sec">Etkileşimler</h4><div class="agrid">${out.join('')}</div>`;
  }

  /* ---------- Eylemler ---------- */
  const get = (ds) => C.get(+ds.id);
  const useVakit = (n = 1) => { const s = PH.state; if (s.vakit < n) { UI.toast('Bu ay vaktiniz kalmadı.', 'bad'); return false; } s.vakit -= n; return true; };

  A.chTalk = (ds) => {
    const c = get(ds);
    if (!useVakit()) return;
    UI.run('Sohbet', () => {
      const s = PH.state;
      const first = !c.known;
      c.known = true;
      C.opinion(c, U.ri(3, 8) + (C.has(C.sultan(), 'heybetli') ? 2 : 0));
      fx({ stress: -2, happiness: 1 });
      const plot = Court.plotOf(c);
      let extra = '';
      if (plot && !plot.known && U.chance(0.2 + C.sultan().sk.entrika * 0.02)) { plot.known = true; extra = '\n\nSohbet sırasında bazı çelişkili sözleri dikkatinizi çekti. Bu kişi bir şeyler planlıyor!'; }
      if (C.has(c, 'sair') && U.chance(0.4)) { fx({ happiness: 3 }); extra += '\n\nSize kendi yazdığı bir beyit okudu.'; }
      const topic = c.role === 'devlet' ? U.pick(['devlet işlerini', 'eyaletlerin durumunu', 'eski seferleri', 'Divan\'daki dengeleri']) : c.dyn ? U.pick(['derslerini', 'okuduğu kitapları', 'at binmeyi', 'rüyalarını']) : U.pick(['haremdeki hayatı', 'memleketini', 'musikiyi', 'çiçekleri']);
      return `${N(c)} ile ${topic} konuştunuz.${first ? ' Onu artık çok daha iyi tanıyorsunuz: gizli özellikleri ortaya çıktı.' : ''}${extra}`;
    }, { icon: 'talk' });
  };

  A.chGift = (ds) => {
    const c = get(ds);
    const opts = [
      { k: 'hilat', n: 'Hil\'at (kaftan)', cost: 5e5, op: 8 },
      { k: 'kurk', n: 'Samur kürk', cost: 1.5e6, op: 15 },
      { k: 'at', n: 'Koşumlu Arap atı', cost: 1e6, op: 12 },
      { k: 'mucevher', n: 'Mücevher', cost: 2.5e6, op: 20 },
      { k: 'has', n: 'Has (arazi geliri)', cost: 6e6, op: 32 },
    ];
    UI.sheet({
      title: 'Hediye: ' + U.esc(c.name),
      render: (sh) => `<div class="list">${opts.map((o) => `<button class="lrow" data-act="chGiftGo" data-id="${c.id}" data-k="${o.k}" ${PH.state.emp.treasury < o.cost ? 'disabled' : ''}>${ic('gift')}<div><b>${o.n}</b><small>${U.money(o.cost, true)} · görüş +${o.op}</small></div></button>`).join('')}</div>`,
    });
    UI._giftOpts = opts;
  };
  A.chGiftGo = (ds) => {
    const c = get(ds);
    const o = UI._giftOpts.find((x) => x.k === ds.k);
    A.closeSheet();
    UI.run('Hediye', () => {
      fx({ treasury: -o.cost });
      let op = o.op;
      if (C.has(c, 'hasis')) op += 6;
      if (o.k === 'at' && (c.sk.askeri > 10 || C.has(c, 'cesur'))) op += 6;
      C.opinion(c, op);
      if (c.role === 'devlet') c.wealth += o.k === 'has' ? o.cost * 0.6 : 0;
      if (c.role === 'harem') c.favor = Math.min(100, (c.favor || 0) + 5);
      return `${N(c)}, ${o.n.toLowerCase()} hediyenizi büyük bir minnetle kabul etti.`;
    }, { icon: 'gift' });
  };

  A.chAppoint = (ds) => {
    const c = get(ds);
    const offs = D.officeOrder.filter((o) => D.offices[o].cls === c.cls);
    UI.sheet({
      title: 'Makama Ata',
      render: () => `<p class="muted">${U.esc(N(c))} hangi makama getirilsin?</p><div class="list">${offs.map((o) => {
        const od = D.offices[o];
        const cur = St.officer(o);
        return `<button class="lrow" data-act="chAppointGo" data-id="${c.id}" data-o="${o}" ${c.office === o ? 'disabled' : ''}>${ic(od.icon)}<div><b>${od.n}</b><small>${C.SKN[od.key]}: ${c.sk[od.key]} ${cur ? `· şu an ${U.esc(N(cur))} (${cur.sk[od.key]})` : '· boş'}</small></div></button>`;
      }).join('')}</div>`,
    });
  };
  A.chAppointGo = (ds) => {
    const c = get(ds);
    A.closeSheet();
    UI.run('Atama', () => { PH.Court.appoint(ds.o, c); return `${N(c)} ${D.offices[ds.o].n} makamına getirildi. Mühür ve kaftan törenle teslim edildi.`; }, { icon: 'seal' });
  };

  A.chGov = (ds) => {
    const c = get(ds);
    const s = PH.state;
    const provs = PH.Eco.ownProvs(s).filter((p) => !p.vassal && p.id !== s.capital).sort((a, b) => b.unrest - a.unrest);
    UI.sheet({
      title: 'Vali Tayini',
      render: () => `<p class="muted">${U.esc(N(c))} (İdare ${c.sk.idare}) hangi eyalete gönderilsin?</p><div class="list">${provs.map((p) => { const g = C.get(p.gov); return `<button class="lrow" data-act="chGovGo" data-id="${c.id}" data-p="${p.id}" ${c.gov === p.id ? 'disabled' : ''}>${ic('map')}<div><b>${D.prov[p.id].n}</b><small>Huzursuzluk %${Math.round(p.unrest)} · ${g ? U.esc(N(g)) + ' (İdare ' + g.sk.idare + ')' : 'Valisiz'}</small></div></button>`; }).join('')}</div>`,
    });
  };
  A.chGovGo = (ds) => {
    const c = get(ds);
    A.closeSheet();
    UI.run('Vali Tayini', () => { PH.Court.appointGov(ds.p, c); return `${N(c)} ${D.prov[ds.p].n} valiliğine gönderildi.`; }, { icon: 'map' });
  };

  A.chDismiss = (ds) => {
    const c = get(ds);
    UI.confirm({ title: 'Azil', text: `${N(c)} görevinden alınsın mı? Bu kişi size gücenecek.`, yes: 'Azlet', onYes: () => UI.run('Azil', () => { Court.dismiss(c); return `${N(c)} azledildi.`; }, { icon: 'down' }) });
  };

  A.chSpy = (ds) => {
    const c = get(ds);
    if (PH.state.emp.treasury < 3e5) { UI.toast('Hazine yetersiz', 'bad'); return; }
    UI.run('Hafiye Raporu', () => {
      fx({ treasury: -3e5 });
      c.known = true;
      const plot = Court.plotOf(c);
      if (plot) plot.known = true;
      return `Hafiyeler ${U.acc(N(c))} bir ay boyunca izledi.\n\nHakkınızdaki düşüncesi: ${U.opWord(c.op)}. Hırsı: ${c.amb > 65 ? 'çok yüksek' : c.amb > 35 ? 'orta' : 'düşük'}.\n${plot ? `DİKKAT: Gizli bir ${Court.PLOT_N[plot.type].toLowerCase()} planı yürüttüğü tespit edildi! (%${Math.round(plot.prog)})` : 'Herhangi bir komplo izine rastlanmadı.'}`;
    }, { icon: 'eye' });
  };

  A.chConfiscate = (ds) => {
    const c = get(ds);
    UI.confirm({ title: 'Müsadere', text: `${U.gen(N(c))} servetine el konulsun mu? Diğer devlet adamları da tedirgin olacak.`, yes: 'Müsadere Et', danger: true, onYes: () => UI.run('Müsadere', () => {
      const amt = Court.confiscate(c);
      C.opinion(c, -45);
      c.amb = Math.min(100, c.amb + 15);
      C.list((x) => x.role === 'devlet' && x.id !== c.id && (x.office || x.gov)).forEach((x) => C.opinion(x, -4, true));
      return `Konağı mühürlendi; ${U.money(amt, true)} hazineye aktarıldı.`;
    }, { icon: 'bribe' }) });
  };

  A.chExile = (ds) => { const c = get(ds); UI.confirm({ title: 'Sürgün', text: `${N(c)} sürgüne gönderilsin mi?`, yes: 'Sürgün Et', danger: true, onYes: () => UI.run('Sürgün', () => { Court.exile(c); fx({ stability: -1 }); return `${N(c)} Limni adasına sürüldü.`; }, { icon: 'exile' }) }); };
  A.chPrison = (ds) => { const c = get(ds); UI.confirm({ title: 'Hapis', text: `${N(c)} Yedikule zindanlarına atılsın mı?`, yes: 'Hapset', danger: true, onYes: () => UI.run('Hapis', () => { Court.imprison(c); fx({ stability: -1, legitimacy: -1 }); return `${N(c)} Yedikule'ye götürüldü.`; }, { icon: 'chain' }) }); };
  A.chPardon = (ds) => { const c = get(ds); UI.run('Af', () => { Court.pardon(c); fx({ popularity: 1 }); return `${N(c)} affedildi ve İstanbul'a döndü.`; }, { icon: 'check' }); };

  A.chExecute = (ds) => {
    const c = get(ds);
    const p = Court.fetvaChance(c);
    UI.confirm({
      title: 'Siyaseten Katl', danger: true, yes: 'Ferman Yazılsın',
      text: `${N(c)} idam edilsin mi?\n\nŞeyhülislamın fetva verme ihtimali: %${Math.round(p * 100)}. Fetvasız idam meşruiyetinize ve ulema desteğine zarar verir.${c.dyn ? '\n\nHanedan kanı dökmek halkı ve ulemayı derinden yaralar.' : ''}${c.wealth > 1e6 ? `\n\nServeti (${U.money(c.wealth)}) hazineye aktarılabilir.` : ''}`,
      onYes: () => UI.run('Siyaseten Katl', () => {
        const fet = U.chance(p);
        const w = Court.execute(c, fet);
        const conf = c.dyn ? 0 : Math.round(w * 0.75);
        if (conf) fx({ treasury: conf });
        PH.UI.sheets.filter((x) => x.o.charId === c.id).forEach((x) => x.close());
        return `Cellatbaşı fermanı yerine getirdi. ${N(c)} artık yok.${fet ? ' Fetva alınmıştı.' : ' Şeyhülislam fetva vermedi; ulema arasında huzursuzluk var.'}${conf ? ` Servetinden ${U.money(conf, true)} hazineye geçti.` : ''}`;
      }, { icon: 'skull' }),
    });
  };

  A.chTime = (ds) => {
    const c = get(ds);
    if (!useVakit()) return;
    UI.run('Evlatla Vakit', () => {
      C.opinion(c, U.ri(6, 12));
      const sul = C.sultan();
      const k = C.bestSkill(sul);
      let t = '';
      if (C.age(c) < 18 && U.chance(0.5)) { c.sk[k] = Math.min(30, c.sk[k] + 1); t = ` Ona ${C.SKN[k].toLowerCase()} alanındaki tecrübelerinizi aktardınız (${C.SKN[k]} +1).`; }
      fx({ happiness: U.ri(4, 8), stress: -4 });
      return `${N(c)} ile birlikte ${U.pick(['bahçede yürüdünüz', 'ok attınız', 'satranç oynadınız', 'kitap okudunuz', 'Boğaz\'da kayıkla gezdiniz', 'atlara baktınız'])}.${t}`;
    }, { icon: 'family' });
  };

  A.chEdu = (ds) => {
    const c = get(ds);
    UI.sheet({
      title: 'Eğitim: ' + U.esc(c.name),
      render: () => `<p class="muted">Odak alanı ve hoca kalitesi. Daha iyi hocalar her yıl daha çok gelişim sağlar.</p>
        <div class="list">${C.SK.map((k) => `<div class="lrow static">${ic('book')}<div><b>${C.SKN[k]}</b><small>Şu an ${c.sk[k]}</small></div><div class="rbtns">
          <button class="btn sm ${c.edu && c.edu.focus === k && c.edu.q === 1 ? 'gold' : ''}" data-act="chEduGo" data-id="${c.id}" data-k="${k}" data-q="1">Sıradan</button>
          <button class="btn sm ${c.edu && c.edu.focus === k && c.edu.q === 2 ? 'gold' : ''}" data-act="chEduGo" data-id="${c.id}" data-k="${k}" data-q="2" ${PH.state.emp.treasury < 1e6 ? 'disabled' : ''}>İyi · 1 Mn</button>
          <button class="btn sm ${c.edu && c.edu.focus === k && c.edu.q === 3 ? 'gold' : ''}" data-act="chEduGo" data-id="${c.id}" data-k="${k}" data-q="3" ${PH.state.emp.treasury < 3e6 ? 'disabled' : ''}>Usta · 3 Mn</button>
        </div></div>`).join('')}</div>`,
    });
  };
  A.chEduGo = (ds) => {
    const c = get(ds);
    const q = +ds.q;
    const cost = [0, 0, 1e6, 3e6][q];
    PH.FX.run(() => { fx({ treasury: -cost }); H.setEdu(c, ds.k, q); });
    UI.toast(`${U.esc(c.name)}: ${C.SKN[ds.k]} eğitimi (${['', 'sıradan', 'iyi', 'usta'][q]} hoca)`, 'ok');
    UI.refresh();
  };

  A.chSancak = (ds) => {
    const c = get(ds);
    UI.sheet({ title: 'Sancak Seçimi', render: () => `<div class="list">${D.names.sancaks.map((sn) => `<button class="lrow" data-act="chSancakGo" data-id="${c.id}" data-sn="${sn}">${ic('flag')}<div><b>${sn}</b><small>Şehzade sancağı</small></div></button>`).join('')}</div>` });
  };
  A.chSancakGo = (ds) => { const c = get(ds); A.closeSheet(); UI.run('Sancak', () => { H.toSancak(c, ds.sn); return `${N(c)}, lalası ve maiyetiyle birlikte ${ds.sn} sancağına doğru yola çıktı.`; }, { icon: 'flag' }); };
  A.chRecall = (ds) => { const c = get(ds); UI.run('Saraya Çağrı', () => { c.sancak = null; C.opinion(c, -8); c.amb = Math.max(0, c.amb - 8); return `${N(c)} sancağından İstanbul'a çağrıldı.`; }, { icon: 'palace' }); };
  A.chKafes = (ds) => { const c = get(ds); UI.confirm({ title: 'Kafes', text: `${N(c)} kafes dairesine kapatılsın mı? Güvenli ama eğitimsiz büyür ve size küser.`, yes: 'Kapat', danger: true, onYes: () => UI.run('Kafes', () => { H.toKafes(c); return `${N(c)} kafese kapatıldı.`; }, { icon: 'lock' }) }); };
  A.chUnkafes = (ds) => { const c = get(ds); UI.run('Kafesten Çıkış', () => { c.kafes = false; C.opinion(c, 20); return `${N(c)} kafesten çıkarıldı. Yıllar sonra ilk kez gün ışığını özgürce görüyor.`; }, { icon: 'key' }); };
  A.chHeir = (ds) => {
    const c = get(ds);
    UI.confirm({ title: 'Veliaht', text: `${N(c)} veliaht ilan edilsin mi? Veraset usulü "Padişahın Tayini" olarak değişir. Diğer şehzadeler ve anneleri gücenecek.`, yes: 'İlan Et', onYes: () => UI.run('Veliaht', () => {
      const s = PH.state;
      s.dynasty.heirId = c.id; s.dynasty.succession = 'tayin';
      C.opinion(c, 20);
      const m = C.get(c.mo); if (m) C.opinion(m, 20);
      H.kids().filter((k) => k.g === 'm' && k.id !== c.id).forEach((k) => { C.opinion(k, -15); k.amb = Math.min(100, k.amb + 8); const mm = C.get(k.mo); if (mm && mm.id !== c.mo) C.opinion(mm, -15); });
      fx({ legitimacy: 3, stability: 2 });
      PH.Turn.log(`${N(c)} veliaht ilan edildi.`, 'dyn');
      return `${N(c)} veliaht-ı saltanat ilan edildi.`;
    }, { icon: 'crown' }) });
  };

  A.chMarry = (ds) => {
    const c = get(ds);
    const cands = C.list((x) => x.role === 'devlet' && x.cls === 'pasa' && !x.spouse && !x.exiled && !x.prison).sort((a, b) => C.skillTotal(b) - C.skillTotal(a)).slice(0, 10);
    UI.sheet({
      title: 'Damat Adayları',
      render: () => cands.length ? `<p class="muted">Bir paşayı damat yapmak, onu hanedana bağlar; ama nüfuzunu da artırır.</p><div class="list">${cands.map((p) => `<button class="lrow" data-act="chMarryGo" data-id="${c.id}" data-p="${p.id}">${PH.Portrait.svg(p, 38)}<div><b>${U.esc(N(p))}</b><small>${C.age(p)} yaş · ${U.esc(C.title(p))} · İdare ${p.sk.idare}, Askerlik ${p.sk.askeri} · ${U.opWord(p.op)}</small></div></button>`).join('')}</div>` : UI.empty('Uygun bekâr paşa yok.'),
    });
  };
  A.chMarryGo = (ds) => {
    const c = get(ds); const p = C.get(+ds.p);
    A.closeSheet();
    if (PH.state.emp.treasury < 3e6) { UI.toast('Çeyiz için 3 Mn akçe gerekli', 'bad'); return; }
    UI.run('Düğün', () => { H.marryDaughter(c, p); fx({ treasury: -3e6, popularity: 2, happiness: 4 }); return `${N(c)} ile ${N(p)} evlendi. Çeyiz alayı Atmeydanı'ndan geçti, şehir donatıldı.`; }, { icon: 'ring' });
  };

  A.chVisit = (ds) => {
    const c = get(ds);
    if (!useVakit()) return;
    UI.run('Harem', () => H.visit(c), { icon: 'tulip' });
  };
  A.chPromote = (ds) => {
    const c = get(ds);
    UI.run('Mertebe', () => {
      const ok = H.promote(c);
      return ok ? `${c.name} artık ${H.RANK_N[c.rank]}. Haremde konumu yükseldi; kendisine yeni bir daire ve hizmetkârlar verildi.` : 'Bu mertebeye yükseltilemez (dönemin geleneklerine göre zaten bir Haseki var).';
    }, { icon: 'up' });
  };
  A.chNikah = (ds) => { const c = get(ds); UI.confirm({ title: 'Nikâh', text: 'Bir hasekiyle resmî nikâh, Osmanlı geleneğinde pek görülmemiştir. Ulema ve Valide Sultan hoşnut olmayabilir.', yes: 'Nikâh Kıyılsın', onYes: () => UI.run('Nikâh', () => { c.nikah = true; C.opinion(c, 35); fx({ happiness: 10, ulema: -3, legitimacy: -2 }); const v = H.valide(); if (v) C.opinion(v, -15); PH.Turn.log(`${C.sultan().name} Han, ${c.name} ile nikâhlandı.`, 'harem'); return 'Nikâh kıyıldı. Şehirde şenlikler yapıldı.'; }, { icon: 'ring' }) }); };
  A.chFreeMarry = (ds) => {
    const c = get(ds);
    const cands = C.list((x) => x.role === 'devlet' && !x.spouse && !x.exiled && !x.prison).sort((a, b) => C.skillTotal(b) - C.skillTotal(a)).slice(0, 8);
    UI.sheet({ title: 'Azat ve Evlilik', render: () => `<p class="muted">${U.esc(c.name)} azat edilip bir devlet adamıyla evlendirilecek. O kişi size minnettar kalır.</p><div class="list">${cands.map((p) => `<button class="lrow" data-act="chFreeMarryGo" data-id="${c.id}" data-p="${p.id}">${PH.Portrait.svg(p, 38)}<div><b>${U.esc(N(p))}</b><small>${U.esc(C.title(p))}</small></div></button>`).join('')}</div>` });
  };
  A.chFreeMarryGo = (ds) => { const c = get(ds); const p = C.get(+ds.p); UI.closeAllSheets(); UI.run('Azat', () => { H.marryOff(c, p); fx({ happiness: -3 }); return `${c.name} azat edildi ve ${N(p)} ile evlendi.`; }, { icon: 'handshake' }); };
  A.chEskiSaray = (ds) => {
    const c = get(ds);
    UI.confirm({ title: 'Eski Saray', text: `${N(c)} Eski Saray'a gönderilsin mi?${c.role === 'valide' ? ' Kendi annenizi saraydan uzaklaştırmak meşruiyetinize zarar verir.' : ''}`, yes: 'Gönder', danger: true, onYes: () => UI.run('Eski Saray', () => { const wasV = c.role === 'valide'; c.role = 'eskisaray'; C.opinion(c, -40); if (wasV) fx({ legitimacy: -6, piety: -3, stability: -2 }); UI.closeAllSheets(); return `${c.name} Eski Saray'a gönderildi.`; }, { icon: 'exile' }) });
  };
  A.chAdvice = (ds) => {
    const c = get(ds);
    if (!useVakit()) return;
    UI.run('Valide\'nin Nasihati', () => {
      const s = PH.state;
      C.opinion(c, 4);
      const plots = s.plots.filter((p) => !p.known);
      if (plots.length && U.chance(0.35 + c.sk.entrika * 0.02)) { const p = U.pick(plots); p.known = true; const pc = C.get(p.by); return `${N(c)} sesini alçalttı: "Oğlum, ${U.dat(N(pc))} dikkat et. Haremdeki kızlar onun adamlarının gece toplantılarından bahsediyor."`; }
      const dis = C.list((x) => x.office && x.op < -10)[0];
      if (dis) { dis.known = true; return `"${N(dis)} sana sadık değil oğlum. Gözlerinden belli."`; }
      fx({ stress: -4, entrika: U.chance(0.2) ? 1 : 0 });
      return U.pick(['"Babanın hatalarını tekrarlama. Vezirlerine güven ama her birinin kesesini say."', '"Halkın duası, ordunun kılıcından keskindir."', '"Harem huzurlu olursa saray huzurlu olur, saray huzurlu olursa devlet."']);
    }, { icon: 'scroll' });
  };

  A.chMahlas = () => {
    const sul = C.sultan();
    UI.prompt({ title: 'Mahlas', label: 'Şiirlerinizde kullanacağınız mahlas', value: sul.mahlas || '', onOk: (v) => { if (v && v.trim()) { sul.mahlas = v.trim().slice(0, 16); UI.refresh(); UI.toast('Mahlasınız: ' + U.esc(sul.mahlas), 'ok'); } } });
  };
  A.chAbdicate = () => {
    const h = H.heirCandidates();
    if (!h.all.length) { UI.toast('Tahta çıkacak bir şehzade yok!', 'bad'); return; }
    UI.confirm({ title: 'Tahttan Feragat', danger: true, yes: 'Feragat Et', text: 'Tahtı bırakıp bir varis seçeceksiniz. Oyun yeni padişahla devam eder; eski padişah kafes dairesine çekilir.', onYes: () => { PH.state.succession = { cause: 'kendi isteğiyle tahttan feragat etti', deposed: true }; UI.closeAllSheets(); UI.flow(); } });
  };
})();
