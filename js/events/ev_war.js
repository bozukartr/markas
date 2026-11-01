/* Padişah Hayatı — Savaş ve sefer olayları */
(function () {
  const U = PH.U, D = PH.D, C = PH.C, St = PH.St, E = PH.E, M = PH.Mil;
  const fx = PH.fx;
  const N = (c) => C.name(c);
  const camp = () => PH.state.campaign;
  const tName = () => D.prov[camp().target].n;
  const nName = () => PH.Dip.name(camp().nation);

  E.reg({
    id: 'meydan', cat: 'ordu', icon: 'sword', title: 'Meydan Muharebesi',
    valid: (s) => s.campaign && s.campaign.phase === 'battle',
    text: (s) => {
      const en = M.battleSetup();
      const ours = M.campaignPower();
      const cmd = M.cmd();
      return `${tName()} önlerinde iki ordu karşı karşıya! ${nName()} ordusu, ${U.gen(PH.Dip.ruler(s.campaign.nation))} ${en.self ? 'bizzat' : 'serdarının'} komutasında saf tuttu.\n\n` +
        `Bizim ordu: ${U.num(M.totalMen(s.campaign.forces))} asker, ${s.campaign.forces.cannons} top (güç ≈ ${U.num(ours)})\nDüşman: tahminen ${U.num(Math.round(en.str / 1000) * 1000)} güç\nKomutan: ${N(cmd)}\n\n` +
        `Keşif kolları, düşmanın ${M.POSTURE_N[en.scout]} düzeninde olduğunu bildiriyor (güvenilirlik %${Math.round(en.acc * 100)}).\n\nSavaş düzenini seçin:`;
    },
    choices: () => Object.keys(M.TACTICS).map((k) => ({
      t: M.TACTICS[k].n, hint: M.TACTICS[k].d,
      run: () => {
        const r = M.resolveBattle(k);
        const lost = M.totalMen(r.lost);
        if (r.win) return `ZAFER! Düşman aslında ${M.POSTURE_N[r.posture]} düzenindeydi. ${M.TACTICS[k].n} düşman saflarını darmadağın etti. Düşman ${U.num(r.enemyLost)} kayıp verdi; bizim kaybımız ${U.num(lost)} asker. Ordu şimdi ${tName()} kuşatmasına geçiyor.`;
        return `BOZGUN! Düşman ${M.POSTURE_N[r.posture]} düzenindeydi ve hamlemiz boşa çıktı. ${U.num(lost)} askerimiz şehit düştü${r.lost.cannons ? `, ${r.lost.cannons} top düşman eline geçti` : ''}. Ordu geri çekiliyor.${r.wounded ? '\n\nPadişah da savaşta yaralandı!' : ''}`;
      },
    })).concat([{ t: 'Savaşa girmeden geri çekilin', hint: 'Şöhret kaybı', run: (s) => { s.campaign.phase = 'return'; s.campaign.left = Math.max(1, Math.ceil(M.distance(s.campaign.target) / 2)); s.campaign.enemy = null; fx({ prestige: -6, morale: -10, janissary: -5 }); s.nations[s.campaign.nation].ws -= 8; return 'Ordu düşmanla çarpışmadan geri döndü. Yeniçeriler "korkak" diye homurdanıyor.'; } }]),
  });

  E.reg({
    id: 'kusatma', cat: 'ordu', icon: 'castle', title: (s) => `${tName()} Kuşatması`,
    valid: (s) => s.campaign && s.campaign.phase === 'siege',
    text: (s) => {
      const cp = s.campaign; const p = s.provs[cp.target];
      const winter = U.isWinter(s.month);
      return `Ordu-yı hümâyun ${tName()} surlarını kuşatmış durumda. Kale seviyesi: ${p.fort}/6.\n\nMuhasara ilerlemesi: %${Math.round(cp.siege)}\nAsker: ${U.num(M.totalMen(cp.forces))} · Top: ${cp.forces.cannons} · Moral: %${Math.round(s.army.morale)}\nSeferde geçen süre: ${cp.months} ay${winter ? '\n\nKış bastırdı! Askerler soğuktan ve hastalıktan kırılıyor.' : ''}`;
    },
    choices: (s) => [
      { t: 'Muhasaraya devam', hint: 'Toplar surları dövmeye devam eder', run: () => 'Toplar gece gündüz gürlüyor. Lağımcılar surların altını kazıyor.' },
      { t: 'Genel hücum!', hint: (s2) => { const cp = s2.campaign; const p = s2.provs[cp.target]; const ch = U.clamp(0.25 + cp.siege / 160 + M.cmdSkill() * 0.01 - p.fort * 0.05 + (s2.army.morale - 50) / 300, 0.05, 0.9); return `Başarı %${Math.round(ch * 100)} · ağır kayıp`; }, run: (s2) => { const r = M.assault(); if (r.ok) { M.conquer(s2.campaign.target); return `Tekbir sesleri arasında yeniçeriler surlara tırmandı! ${s2.campaign ? tName() : 'Kale'} düştü!`; } return 'Hücum püskürtüldü! Surların dibinde yüzlerce şehit bıraktık.'; } },
      { t: 'Kaleye aman teklif edin', hint: (s2) => `Teslim ihtimali %${Math.round(U.clamp(s2.campaign.siege / 130 + C.sultan().sk.diplomasi * 0.01, 0.05, 0.85) * 100)}`, run: (s2) => { const ch = U.clamp(s2.campaign.siege / 130 + C.sultan().sk.diplomasi * 0.01, 0.05, 0.85); if (U.chance(ch)) { const t = tName(); M.conquer(s2.campaign.target); fx({ popularity: 1, piety: 1 }); return `Kale komutanı anahtarları teslim etti. Halka can ve mal güvencesi verildi. ${t} kan dökülmeden alındı!`; } return 'Kale muhafızları teklifinizi alay ederek reddetti.'; } },
      { t: 'Kuşatmayı kaldırıp dönün', hint: 'Şöhret kaybı', run: () => { M.abortSiege(); return 'Ordu çadırlarını toplayıp geri dönüyor.'; } },
    ],
  });

  E.reg({
    id: 'yardim_ordusu', cat: 'ordu', icon: 'flag', title: 'Düşman Yardım Ordusu',
    valid: (s) => s.campaign && s.campaign.phase === 'siege',
    text: (s) => `Akıncılar haber getirdi: ${nName()}, kuşatılan ${tName()} kalesini kurtarmak için bir yardım ordusu gönderiyor! Muhasarayı sürdürürsek iki ateş arasında kalabiliriz.`,
    choices: [
      { t: 'Kuşatmayı bırakıp meydan savaşı verin', run: (s) => { s.campaign.phase = 'battle'; s.campaign.enemy = null; E.pushFront('meydan', {}); return 'Ordu, yardım ordusunu karşılamak için harekete geçti.'; } },
      { t: 'Bir kısım kuvvetle yolu kesin, kuşatma sürsün', hint: 'Riskli', run: (s) => { if (U.chance(0.5 + M.cmdSkill() * 0.02)) { s.nations[s.campaign.nation].str = Math.round(s.nations[s.campaign.nation].str * 0.92); fx({ morale: 5, prestige: 2 }); return 'Yardım ordusu geçitlerde pusuya düşürüldü ve dağıtıldı!'; } const l = Math.round(s.campaign.forces.sip * 0.3); s.campaign.forces.sip -= l; s.army.sip -= l; s.campaign.siege = Math.max(0, s.campaign.siege - 20); fx({ morale: -8 }); return 'Kuvvetlerimiz yenildi; yardım ordusu kaleye erzak ulaştırdı.'; } },
      { t: 'Kuşatmayı kaldırın', run: () => { M.abortSiege(); return 'Ordu geri çekiliyor.'; } },
    ],
  });

  E.reg({
    id: 'sefer_yol', cat: 'ordu', icon: 'tent', title: 'Sefer Yolunda',
    valid: (s) => s.campaign && s.campaign.phase === 'march',
    setup: () => null,
    text: (s, ctx) => {
      if (!ctx.kind) ctx.kind = U.pick(['nehir', 'erzak', 'hastalik', 'akinci']);
      return {
        nehir: 'Sel sularıyla kabaran bir nehir ordunun önünü kesti. Köprü yıkılmış.',
        erzak: 'Menzillerde beklenen erzak gelmedi. Askerler aç; at yemi tükeniyor.',
        hastalik: 'Orduda dizanteri baş gösterdi. Her gün onlarca asker ölüyor.',
        akinci: 'Akıncı beyi, düşman topraklarına yağma akını yapmak için izin istiyor.',
      }[ctx.kind];
    },
    choices: (s, ctx) => ({
      nehir: [
        { t: 'Gemilerden köprü kurdurun', hint: 'Zaman kaybı yok, masraflı', run: () => { fx({ treasury: -1.5e6 }); return 'Mimarlar bir gecede seyyar köprü kurdu.'; } },
        { t: 'Suların çekilmesini bekleyin', hint: '1 ay gecikme', run: (s2) => { s2.campaign.left++; return 'Ordu bir ay bekledi.'; } },
      ],
      erzak: [
        { t: 'Hazineden acil erzak satın alın', hint: '2 Mn akçe', run: () => { fx({ treasury: -2e6 }); return 'Yerel tüccarlardan erzak satın alındı.'; } },
        { t: 'Yol üstündeki köylerden zorla toplayın', run: () => { fx({ popularity: -4, morale: 2 }); return 'Köylülerin ambarları boşaltıldı.'; } },
        { t: 'Askerler sabretsin', run: (s2) => { fx({ morale: -10, janissary: -4 }); const l = Math.round(s2.campaign.forces.azap * 0.15); s2.campaign.forces.azap -= l; s2.army.azap -= l; return 'Açlık yüzünden bazı azaplar firar etti.'; } },
      ],
      hastalik: [
        { t: 'Hasta askerleri geri gönderin', run: (s2) => { const l = Math.round(s2.campaign.forces.jan * 0.06); s2.campaign.forces.jan -= l; s2.army.jan -= l; return 'Hastalar geri gönderildi; salgın yayılmadı.'; } },
        { t: 'Ordu hekimlerine güvenin', run: (s2) => { const l = Math.round(M.totalMen(s2.campaign.forces) * U.rf(0.02, 0.1)); ['jan', 'sip', 'azap'].forEach((k) => { const x = Math.round(s2.campaign.forces[k] * l / Math.max(1, M.totalMen(s2.campaign.forces))); s2.campaign.forces[k] -= x; s2.army[k] -= x; }); return `Salgın ${U.num(l)} kadar askeri alıp götürdü.`; } },
      ],
      akinci: [
        { t: 'Akına izin verin', run: (s2) => { const g = U.ri(1, 4) * 1e6; fx({ treasury: g, morale: 4 }); s2.nations[s2.campaign.nation].ws += 3; return `Akıncılar ${U.money(g, true)} değerinde ganimetle döndü.`; } },
        { t: 'Ordu bir arada kalmalı', run: () => { fx({ morale: -2 }); return 'Akıncılar hayal kırıklığına uğradı.'; } },
      ],
    }[ctx.kind || 'nehir']),
  });

  E.reg({
    id: 'fetih', cat: 'ordu', icon: 'flag', title: 'Fetih!',
    valid: (s, ctx) => s.provs[ctx.p] && s.provs[ctx.p].owner === 'osm',
    text: (s, ctx) => {
      const pd = D.prov[ctx.p];
      return `${pd.n} artık Osmanlı mülküdür! Kalenin burçlarına sancak dikildi, en büyük kiliseye ezan sesi yükseldi. Ganimet: ${U.money(ctx.booty, true)}.${pd.cap === ctx.from ? `\n\n${PH.Dip.short(ctx.from)} başkenti düştü! Bu, tarihe geçecek bir zaferdir.` : ''}\n\nFethedilen halka nasıl davranılacak?`;
    },
    choices: (s, ctx) => {
      const list = [
        { t: 'Aman verin; can, mal ve din güvencesi', hint: 'Huzursuzluk azalır', run: (s2, cx) => { const p = s2.provs[cx.p]; p.unrest = 30; fx({ piety: 1, legitimacy: 2 }); return 'Ahitnâme ile halkın canı, malı ve ibadeti güvence altına alındı. Şehir kısa sürede eski canlılığına kavuşacak.'; } },
        { t: 'Üç gün yağma izni', hint: 'Askerler memnun, halk düşman', run: (s2, cx) => { const p = s2.provs[cx.p]; p.unrest = 80; p.dev = Math.max(1, p.dev - 2); fx({ janissary: 12, treasury: Math.round(cx.booty * 0.5), morale: 8, prestige: -1 }); s2.reign.cruelty++; return 'Üç gün boyunca şehir yağmalandı. Askerler zengin oldu; şehir harabeye döndü.'; } },
        { t: 'Anadolu\'dan Türkmen aileler iskân edin', hint: 'Uzun vadeli bağlılık', run: (s2, cx) => { const p = s2.provs[cx.p]; p.unrest = 45; fx({ popularity: -1, stability: 1 }); s2.flags['iskan_' + cx.p] = true; return 'Sürgün fermanları yazıldı; yeni yerleşimciler yola çıktı.'; } },
      ];
      if (D.prov[ctx.p].cap && ['byz'].includes(ctx.from)) list.unshift({ t: 'Payitahtı buraya taşıyın!', run: (s2, cx) => { s2.capital = cx.p; s2.provs[cx.p].unrest = 25; fx({ prestige: 15, legitimacy: 8 }); s2.reign.capitalTaken = true; PH.Turn.log(`Payitaht ${U.dat(D.prov[cx.p].n)} taşındı.`, 'major'); return 'Kayser-i Rum unvanını aldınız. Payitaht artık iki kıtanın birleştiği bu şehir!'; } });
      return list;
    },
  });

  E.reg({
    id: 'dusman_saldiri', cat: 'ordu', icon: 'alert', title: (s, ctx) => `${PH.Dip.short(ctx.n)} Saldırısı!`,
    valid: (s, ctx) => s.nations[ctx.n] && s.nations[ctx.n].war && s.provs[ctx.p] && s.provs[ctx.p].owner === 'osm',
    text: (s, ctx) => {
      const p = s.provs[ctx.p];
      const home = M.power(M.home());
      return `${PH.Dip.name(ctx.n)} ordusu (tahmini güç ${U.num(Math.round(ctx.str / 1000) * 1000)}) ${D.prov[ctx.p].n} topraklarına girdi! Köyler yanıyor, kale (seviye ${p.fort}) kuşatılmak üzere.\n\nPayitahttaki ordunun gücü: ${U.num(home)}${s.campaign ? ' (ordunun bir kısmı seferde)' : ''}.`;
    },
    choices: [
      { t: 'Payitahttaki orduyu gönderin', hint: (s, ctx) => `Bizim güç ≈ ${U.num(Math.round(M.power(M.home()) * 0.7))}`, run: (s, ctx) => { const win = M.defend(ctx.n, ctx.p, ctx.str, 'ordu'); return win ? `Düşman ${D.prov[ctx.p].n} önlerinde ağır bir yenilgiye uğratıldı!` : `Ordu yenildi ve ${D.prov[ctx.p].n} düşmana düştü!`; } },
      { t: 'Kale direnir; garnizona güvenin', hint: (s, ctx) => `Kale seviyesi ${s.provs[ctx.p].fort}`, run: (s, ctx) => { const win = M.defend(ctx.n, ctx.p, ctx.str, 'kale'); if (win === 'yagma') return 'Kale direndi ama düşman çevredeki köyleri yağmalayıp çekildi. Eyalet ağır hasar gördü.'; return win ? 'Kale muhafızları kahramanca direndi; düşman çekildi!' : `${D.prov[ctx.p].n} kalesi düştü!`; } },
      { t: 'Düşmana haraç ödeyip çekilmesini sağlayın', hint: (s, ctx) => U.money(Math.round(ctx.str * 250), true), req: (s, ctx) => (s.emp.treasury >= ctx.str * 250 ? true : 'Hazine yetersiz'), run: (s, ctx) => { fx({ treasury: -Math.round(ctx.str * 250), prestige: -5, legitimacy: -3 }); s.nations[ctx.n].ws += 5; return 'Altınlar teslim edildi; düşman ordusu geri çekildi. Bu utanç kolay unutulmayacak.'; } },
    ],
  });

  E.reg({
    id: 'savas_ilani', cat: 'dunya', icon: 'sword', title: (s, ctx) => `${PH.Dip.short(ctx.n)} Savaş İlan Etti!`,
    valid: (s, ctx) => s.nations[ctx.n] && !s.nations[ctx.n].war && !s.nations[ctx.n].dead,
    text: (s, ctx) => `${PH.Dip.ruler(ctx.n)}, elçinizi kovdu ve Osmanlı Devleti'ne savaş ilan etti! ${PH.Dip.name(ctx.n)} orduları sınırlarda toplanıyor.`,
    choices: [
      { t: 'Gaza! Seferberlik ilan edin', run: (s, ctx) => { const n = s.nations[ctx.n]; n.war = true; n.ws = 0; n.weary = 0; n.ally = false; n.trade = false; n.tribute = 0; s.flags.lastWar = s.turn; fx({ janissary: 6, morale: 6, ulema: 3 }); PH.Turn.log(`${PH.Dip.name(ctx.n)} savaş ilan etti.`, 'war'); return 'Tuğlar dikildi. Ordu ekranından sefer düzenleyebilirsiniz.'; } },
      { t: 'Hemen barış için elçi gönderin (haraç teklifi)', hint: (s, ctx) => `${U.money(s.nations[ctx.n].str * 200, true)} ödeme`, run: (s, ctx) => { const n = s.nations[ctx.n]; const amt = Math.round(n.str * 200); if (s.emp.treasury >= amt && U.chance(0.6)) { fx({ treasury: -amt, prestige: -6 }); n.truce = s.turn + 60; n.rel += 10; return 'Düşman ödemeyi kabul etti ve savaş ilanını geri aldı.'; } n.war = true; n.ws = 0; n.weary = 0; fx({ prestige: -2 }); return 'Teklifiniz reddedildi. Savaş kaçınılmaz.'; } },
    ],
  });

  E.reg({
    id: 'baris_teklifi', cat: 'dunya', icon: 'handshake', title: 'Barış Teklifi',
    valid: (s, ctx) => s.nations[ctx.n] && s.nations[ctx.n].war,
    text: (s, ctx) => `${PH.Dip.ruler(ctx.n)}, savaştan yorulduğunu bildiren bir mektup gönderdi. Elçisi, barış karşılığında ${U.money(s.nations[ctx.n].str * 300, true)} tazminat ödemeyi teklif ediyor. (Savaş skoru: ${Math.round(s.nations[ctx.n].ws)})`,
    choices: [
      { t: 'Kabul edin', run: (s, ctx) => { const n = s.nations[ctx.n]; fx({ treasury: Math.round(n.str * 300), prestige: 4 }); PH.Dip.makePeace(n); return 'Ahitname imzalandı; tazminat hazineye ulaştı.'; } },
      { t: 'Daha fazlasını isteyin: yıllık haraç', hint: '%50 ihtimal', run: (s, ctx) => { const n = s.nations[ctx.n]; if (U.chance(0.5)) { n.tribute = Math.round(n.str * 8); PH.Dip.makePeace(n); fx({ prestige: 6 }); return `Düşman her ay ${U.money(n.tribute, true)} haraç ödemeyi kabul etti!`; } return 'Elçi öfkeyle ayrıldı. Savaş sürüyor.'; } },
      { t: 'Reddedin; savaş sürecek', run: () => { fx({ janissary: 2 }); return 'Savaş devam ediyor.'; } },
    ],
  });

  E.reg({
    id: 'baris_talebi', cat: 'dunya', icon: 'scroll', title: 'Ağır Barış Şartları',
    valid: (s, ctx) => s.nations[ctx.n] && s.nations[ctx.n].war,
    setup: () => null,
    text: (s, ctx) => {
      const n = s.nations[ctx.n];
      if (ctx.prov === undefined) { const own = PH.Eco.ownProvs(s).filter((p) => p.id !== s.capital && !D.prov[p.id].holy); const near = own.sort((a, b) => D.prov[b.id].dist - D.prov[a.id].dist)[0]; ctx.prov = near ? near.id : null; ctx.amt = Math.round(n.str * 250); }
      return `${PH.Dip.ruler(ctx.n)} üstünlüğünü bildiğini hissettiriyor. Elçisi şu şartları getirdi: ${ctx.prov ? D.prov[ctx.prov].n + ' eyaletinin terki' : 'büyük bir tazminat'} ya da ${U.money(ctx.amt, true)} savaş tazminatı. Kabul edilirse on yıllık barış imzalanacak. (Savaş skoru: ${Math.round(n.ws)})`;
    },
    choices: [
      { t: (s, ctx) => (ctx.prov ? `${D.prov[ctx.prov].n} terk edilsin` : 'Kabul'), hide: (s, ctx) => !ctx.prov, run: (s, ctx) => { const p = s.provs[ctx.prov]; if (p && p.owner === 'osm') { p.owner = ctx.n; p.gov = null; p.conq = s.turn; C.list((c) => c.gov === ctx.prov).forEach((c) => (c.gov = null)); s.stats.lost++; s.reign.lost++; } fx({ prestige: -8, legitimacy: -4 }); PH.Dip.makePeace(s.nations[ctx.n]); return 'Acı bir barış imzalandı. Ama ordu ve hazine nefes alacak.'; } },
      { t: 'Tazminat ödensin', req: (s, ctx) => (s.emp.treasury >= ctx.amt ? true : 'Hazine yetersiz'), run: (s, ctx) => { fx({ treasury: -ctx.amt, prestige: -5 }); PH.Dip.makePeace(s.nations[ctx.n]); return 'Tazminat ödendi; savaş sona erdi.'; } },
      { t: 'Asla! Son nefere kadar', run: () => { fx({ janissary: 3, morale: 4, prestige: 1 }); return 'Elçi kovuldu. Savaş sürüyor.'; } },
    ],
  });

  E.reg({
    id: 'akinci', cat: 'ordu', icon: 'horse', title: 'Akıncı Beyleri',
    w: (s) => (Object.values(s.nations).some((n) => n.war) ? 4 : 0.6), cd: 6,
    setup: (s) => { const n = U.pick(Object.values(s.nations).filter((x) => x.war)) || U.pick(PH.Dip.alive().filter((x) => x.rel < 0 && D.nations[x.id].din !== 'Sünni')); return n ? { n: n.id } : null; },
    text: (s, ctx) => `Mihaloğlu ve Turhanoğlu gibi akıncı beyleri, ${PH.Dip.name(ctx.n)} topraklarına bir akın düzenlemek için izin istiyor.${s.nations[ctx.n].war ? '' : ' Ancak bu ülkeyle savaşta değilsiniz; akın bir savaş sebebi olabilir.'}`,
    choices: [
      { t: 'İzin verin', run: (s, ctx) => { const n = s.nations[ctx.n]; const g = U.ri(1, 5) * 1e6; fx({ treasury: g, janissary: 2, morale: 3 }); if (n.war) { n.ws += 4; n.weary += 3; } else PH.Dip.relChange(n, -15); return `Akıncılar ${U.money(g, true)} ganimetle döndü.`; } },
      { t: 'Reddedin', run: () => 'Akıncı beyleri sınır boylarına döndü.' },
    ],
  });

  E.reg({
    id: 'korsan', cat: 'ordu', icon: 'ship', title: 'Bir Deniz Gazisi',
    era: [0, 1, 2], w: 2, cd: 60,
    setup: () => ({ name: U.pick(['Hızır Reis', 'Oruç Reis', 'Turgut Reis', 'Kemal Reis', 'Piri Reis', 'Uluç Ali Reis', 'Salih Reis', 'Murad Reis']) }),
    text: (s, ctx) => `Akdeniz'de Hristiyan donanmalarına korku salan meşhur korsan ${ctx.name}, kadırgalarıyla birlikte padişahın hizmetine girmek istiyor. Karşılığında Kaptan-ı Deryalık ve bir sancak bekliyor.`,
    choices: [
      { t: 'Kaptan-ı Derya yapın', run: (s, ctx) => { const c = C.statesman('pasa', { name: ctx.name.replace(' Reis', ''), nick: 'Reis', age: U.ri(35, 50), traits: ['cesur', 'ehil'], op: 50 }); c.sk.askeri = Math.max(c.sk.askeri, U.ri(14, 20)); St.assign('kaptan', c); fx({ ships: U.ri(15, 30), prestige: 4 }); ['ven', 'spa', 'kni'].forEach((id) => s.nations[id] && PH.Dip.relChange(s.nations[id], -10)); return `${N(c)} donanmanın başına geçti. Kadırgaları Osmanlı donanmasına katıldı.`; } },
      { t: 'Gemilerini kabul edin, bir sancak verin', run: (s) => { fx({ ships: U.ri(10, 20), prestige: 2 }); return 'Reis bir sancakbeyliğine tayin edildi; gemileri donanmaya katıldı.'; } },
      { t: 'Korsanlarla iş tutmayın', run: () => 'Reis başka bir deniz kıyısında şansını deneyecek.' },
    ],
  });

  E.reg({
    id: 'deniz_savasi', cat: 'ordu', icon: 'wave', title: 'Deniz Muharebesi',
    w: (s) => (Object.values(s.nations).some((n) => n.war && n.ships > 20) ? 3 : 0), cd: 8,
    setup: (s) => { const n = U.pick(Object.values(s.nations).filter((x) => x.war && x.ships > 20)); return n ? { n: n.id } : null; },
    valid: (s, ctx) => s.nations[ctx.n] && s.nations[ctx.n].war,
    text: (s, ctx) => { const n = s.nations[ctx.n]; return `${PH.Dip.name(ctx.n)} donanması (yaklaşık ${n.ships} gemi) Ege'de görüldü. Kaptan-ı Derya ${St.officer('kaptan') ? N(St.officer('kaptan')) : '(makam boş)'}, ${s.army.ships} gemiyle emir bekliyor.`; },
    choices: [
      { t: 'Donanma açık denizde savaşsın', hint: (s, ctx) => { const our = s.army.ships * (1 + St.offSkill('kaptan') * 0.04); const p = our / (our + s.nations[ctx.n].ships); return `Tahmini başarı %${Math.round(p * 100)}`; }, run: (s, ctx) => { const n = s.nations[ctx.n]; const our = s.army.ships * (1 + St.offSkill('kaptan') * 0.04); const p = our / (our + n.ships); if (U.chance(p)) { const l = Math.round(n.ships * U.rf(0.3, 0.5)); n.ships -= l; n.ws += 12; fx({ ships: -Math.round(s.army.ships * U.rf(0.05, 0.12)), prestige: 6 }); return `Büyük zafer! Düşman ${l} gemi kaybetti. Donanma-yı hümâyun Akdeniz'in hâkimi.`; } fx({ ships: -Math.round(s.army.ships * U.rf(0.3, 0.6)), prestige: -6 }); n.ws -= 12; return 'Felaket! Donanmamızın büyük kısmı batırıldı.'; } },
      { t: 'Limanda kalın, kıyıları koruyun', run: (s, ctx) => { fx({ prestige: -2, treasury: -1e6 }); return 'Düşman donanması kıyıları vurdu ama limana giremedi.'; } },
    ],
  });

  E.reg({
    id: 'kazak', cat: 'ordu', icon: 'ship', title: 'Kazak Akını',
    era: [2, 3], w: 2.5, cd: 24,
    text: () => 'Zaporojya Kazakları, hafif kayıklarıyla (şayka) Karadeniz\'i geçerek Sinop ve Trabzon kıyılarını yağmaladı! Hatta Boğaz\'ın ağzındaki köylere kadar geldiler.',
    choices: [
      { t: 'Karadeniz\'e bir filo gönderin', run: () => { fx({ treasury: -2e6, prestige: 2 }); return 'Filo Kazak kayıklarını Dinyeper ağzında yakaladı.'; } },
      { t: 'Kıyı kalelerini tahkim edin', run: () => { fx({ treasury: -3e6, stability: 1 }); return 'Yeni hisarlar inşa ediliyor.'; } },
      { t: 'Lehistan\'a sert bir mektup yazın', run: (s) => { if (s.nations.pol) PH.Dip.relChange(s.nations.pol, -10); fx({ prestige: -1 }); return 'Leh kralı Kazaklar üzerinde hiçbir kontrolü olmadığını söyledi.'; } },
    ],
  });
})();
