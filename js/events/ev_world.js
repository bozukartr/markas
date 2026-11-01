/* Padişah Hayatı — Dünya ve diplomasi olayları */
(function () {
  const U = PH.U, D = PH.D, C = PH.C, St = PH.St, E = PH.E, Dp = PH.Dip;
  const fx = PH.fx;

  E.reg({
    id: 'elci_gelis', cat: 'dunya', icon: 'letter', title: (s, ctx) => `${Dp.short(ctx.n)} Elçisi`,
    w: 5, cd: 6,
    setup: (s) => { const n = U.pick(Dp.alive().filter((x) => !x.war)); return n ? { n: n.id, gift: U.ri(1, 4) * 1e6 } : null; },
    valid: (s, ctx) => s.nations[ctx.n] && !s.nations[ctx.n].war,
    text: (s, ctx) => `${Dp.name(ctx.n)} elçisi, ${U.money(ctx.gift, true)} değerinde hediyelerle İstanbul'a geldi: saatler, kumaşlar, av köpekleri ve av kuşları. Divan-ı Hümâyun'da huzura kabul edilmeyi bekliyor. Gelenek gereği elçi ancak koltuklarından tutulup eğilerek huzura çıkarılabilir.`,
    choices: [
      { t: 'Görkemli bir kabul töreni yapın', hint: 'İlişkiler iyileşir', run: (s, ctx) => { fx({ treasury: ctx.gift - 1e6, prestige: 2 }); Dp.relChange(s.nations[ctx.n], 10); return 'Elçiye hil\'at giydirildi, yeniçerilerin ulufe dağıtımı gösterildi. Elçi, Osmanlı ihtişamını ülkesine anlatacak.'; } },
      { t: 'Elçiyi aylarca bekletin', hint: 'Şöhret artar, ilişki bozulur', run: (s, ctx) => { fx({ treasury: ctx.gift, prestige: 3 }); Dp.relChange(s.nations[ctx.n], -8); return 'Elçi, Yedikule yakınındaki elçi hanında aylarca bekletildi.'; } },
      { t: 'Hediyeleri yetersiz bulun, haraç isteyin', hint: (s, ctx) => `Kabul ihtimali %${Dp.tributeChance(s.nations[ctx.n])}`, run: (s, ctx) => { const n = s.nations[ctx.n]; fx({ treasury: ctx.gift }); if (U.chance(Dp.tributeChance(n) / 100)) { n.tribute = Math.round(n.str * 5); fx({ prestige: 5 }); return `Elçi, efendisi adına her ay ${U.money(n.tribute, true)} haraç ödenmesini kabul etti!`; } Dp.relChange(n, -15); return 'Elçi öfkeyle ayrıldı.'; } },
    ],
  });

  E.reg({
    id: 'ittifak_talebi', cat: 'dunya', icon: 'handshake', title: 'İttifak Teklifi',
    w: (s) => (Dp.alive().some((n) => n.rel > 30 && !n.ally && !n.war) ? 2.5 : 0), cd: 30,
    setup: (s) => { const n = U.pick(Dp.alive().filter((x) => x.rel > 30 && !x.ally && !x.war)); if (!n) return null; const enemy = U.pick(Dp.alive().filter((x) => x.id !== n.id && x.rel < 0)); return { n: n.id, e: enemy ? enemy.id : null }; },
    valid: (s, ctx) => s.nations[ctx.n] && !s.nations[ctx.n].war,
    text: (s, ctx) => `${Dp.ruler(ctx.n)}, ${ctx.e ? U.dat(Dp.short(ctx.e)) : 'ortak düşmanlara'} karşı bir ittifak öneriyor. "Düşmanımın düşmanı dostumdur," diye yazıyor mektubunda.`,
    choices: [
      { t: 'İttifakı kabul edin', run: (s, ctx) => { const n = s.nations[ctx.n]; n.ally = true; Dp.relChange(n, 15); if (ctx.e) Dp.relChange(s.nations[ctx.e], -15); fx({ prestige: 2 }); PH.Turn.log(`${Dp.name(ctx.n)} ile ittifak kuruldu.`, 'diplo'); return 'Ahitname imzalandı. Müttefikiniz savaşlarınızda size destek olacak.'; } },
      { t: 'Osmanlı kimseyle eşit ittifak yapmaz', run: (s, ctx) => { Dp.relChange(s.nations[ctx.n], -6); fx({ prestige: 1 }); return 'Elçi kibarca geri çevrildi.'; } },
    ],
  });

  E.reg({
    id: 'sinir', cat: 'dunya', icon: 'flag', title: 'Sınırda Çatışma',
    w: 4, cd: 8,
    setup: (s) => { const n = U.pick(Dp.alive().filter((x) => !x.war && x.rel < 20 && D.nations[x.id].din !== 'Sünni')); return n ? { n: n.id } : null; },
    valid: (s, ctx) => s.nations[ctx.n] && !s.nations[ctx.n].war,
    text: (s, ctx) => `Sınır boylarında ${Dp.short(ctx.n)} askerleriyle bizim sipahiler arasında çatışma çıktı. Birkaç köy yandı, iki taraftan da ölenler var. Sınır beyi intikam almak için izin istiyor.`,
    choices: [
      { t: 'Misilleme yapılsın', run: (s, ctx) => { Dp.relChange(s.nations[ctx.n], -12); fx({ prestige: 2, janissary: 2 }); return 'Sipahiler sınırı geçip birkaç düşman köyünü yaktı.'; } },
      { t: 'Elçi gönderip tazminat isteyin', run: (s, ctx) => { const n = s.nations[ctx.n]; if (U.chance(0.4 + C.sultan().sk.diplomasi * 0.02)) { fx({ treasury: 2e6, prestige: 2 }); return 'Düşman özür diledi ve tazminat ödedi.'; } Dp.relChange(n, -5); return 'Talebiniz reddedildi.'; } },
      { t: 'Olayı kapatın', run: (s, ctx) => { fx({ prestige: -1, popularity: -1 }); return 'Sınır beyi hayal kırıklığına uğradı.'; } },
    ],
  });

  E.reg({
    id: 'multeci', cat: 'dunya', icon: 'crown', title: 'Kaçak Bir Taht Varisi',
    w: 1.5, cd: 80,
    setup: (s) => { const n = U.pick(Dp.alive().filter((x) => !x.war)); return n ? { n: n.id, name: U.pick(D.names.foreign[n.id] || ['Prens']) } : null; },
    text: (s, ctx) => `${Dp.name(ctx.n)} tahtında hak iddia eden prens ${ctx.name}, kardeşinden kaçarak Osmanlı topraklarına sığındı. Padişahın himayesini istiyor. Onu elinizde tutmak, ${Dp.short(ctx.n)} üzerinde güçlü bir koz olabilir.`,
    choices: [
      { t: 'Himaye edin; gerektiğinde koz olarak kullanın', run: (s, ctx) => { const n = s.nations[ctx.n]; Dp.relChange(n, -15); s.flags['koz_' + ctx.n] = s.turn + 120; fx({ prestige: 3 }); return 'Prens Edirne\'de bir sarayda misafir edildi. (Bu devletle barış görüşmelerinde avantaj sağlayacak.)'; } },
      { t: 'Onu kardeşine teslim edin, karşılığında altın alın', run: (s, ctx) => { fx({ treasury: 8e6, prestige: -2 }); Dp.relChange(s.nations[ctx.n], 20); return 'Prens zincire vurulup sınırda teslim edildi.'; } },
      { t: 'Reddedin', run: () => 'Prens başka bir sarayda şansını deneyecek.' },
    ],
  });

  E.reg({
    id: 'haraç_red', cat: 'dunya', icon: 'coin', title: 'Haraç Gecikti',
    w: (s) => (Dp.alive().some((n) => n.tribute > 0) ? 3 : 0), cd: 12,
    setup: (s) => { const n = U.pick(Dp.alive().filter((x) => x.tribute > 0)); return n ? { n: n.id } : null; },
    valid: (s, ctx) => s.nations[ctx.n] && s.nations[ctx.n].tribute > 0,
    text: (s, ctx) => `${Dp.name(ctx.n)}, bu yılki haracını göndermedi. Elçisi "hazinemiz tükendi" diyor; ama casuslar ordusunu büyüttüğünü bildiriyor.`,
    choices: [
      { t: 'Tehdit edin: ya haraç ya savaş', run: (s, ctx) => { const n = s.nations[ctx.n]; if (U.chance(Dp.tributeChance(n) / 100 + 0.2)) { fx({ treasury: n.tribute * 3, prestige: 2 }); return 'Gecikmiş haraç faiziyle ödendi.'; } n.tribute = 0; Dp.relChange(n, -20); return 'Haraçgüzar devlet başkaldırdı ve ödemeyi kesti.'; } },
      { t: 'Bu yıl affedin', run: (s, ctx) => { Dp.relChange(s.nations[ctx.n], 10); fx({ prestige: -1 }); return 'Merhametiniz takdirle karşılandı.'; } },
    ],
  });

  E.reg({
    id: 'kapitulasyon_talep', cat: 'dunya', icon: 'scroll', title: 'Ticari İmtiyaz Talebi',
    era: [1, 2, 3], w: (s) => (s.laws.kapitulasyon ? 0 : 2.5), cd: 40,
    setup: (s) => { const n = U.pick(Dp.alive().filter((x) => ['fra', 'ven', 'hab'].includes(x.id) && !x.war)); return n ? { n: n.id } : null; },
    text: (s, ctx) => `${Dp.short(ctx.n)} elçisi, tüccarlarının Osmanlı limanlarında düşük gümrükle ticaret yapabilmesi, kendi konsoloslarının yargısına tabi olması için bir ahidnâme istiyor. Bu, ticareti canlandırabilir; ama yerli tüccarları zor durumda bırakabilir.`,
    choices: [
      { t: 'İmtiyazları verin', run: (s, ctx) => { PH.Eco.toggleLaw('kapitulasyon'); s.nations[ctx.n].trade = true; Dp.relChange(s.nations[ctx.n], 20); return 'Ahidnâme mühürlendi.'; } },
      { t: 'Yalnızca bu devlete ticaret izni', run: (s, ctx) => { s.nations[ctx.n].trade = true; Dp.relChange(s.nations[ctx.n], 8); return 'Sınırlı bir ticaret izni verildi.'; } },
      { t: 'Reddedin', run: (s, ctx) => { Dp.relChange(s.nations[ctx.n], -8); return 'Elçi eli boş döndü.'; } },
    ],
  });

  E.reg({
    id: 'hukumdar_mektup', cat: 'dunya', icon: 'letter', title: 'Küstah Bir Mektup',
    w: 2.5, cd: 24,
    setup: (s) => { const n = U.pick(Dp.alive().filter((x) => x.rel < 0 && !x.war)); return n ? { n: n.id } : null; },
    text: (s, ctx) => `${Dp.ruler(ctx.n)}, size hitabında unvanlarınızı eksik yazdığı, kendisini "dünyanın efendisi" ilan ettiği küstah bir mektup gönderdi. Divan öfkeden kaynıyor.`,
    choices: [
      { t: 'Daha küstah bir cevap yazın', run: (s, ctx) => { Dp.relChange(s.nations[ctx.n], -15); fx({ prestige: 3, janissary: 2 }); return 'Nişancı, düşman hükümdarını "kulumuz" diye anan bir name-i hümâyun kaleme aldı.'; } },
      { t: 'Elçiyi zindana atın', run: (s, ctx) => { Dp.relChange(s.nations[ctx.n], -30); fx({ prestige: 2 }); return 'Elçi Yedikule\'ye atıldı. Bu bir savaş sebebi sayılabilir.'; } },
      { t: 'Görmezden gelin', run: () => { fx({ prestige: -1 }); return 'Mektup hazine arşivine kaldırıldı.'; } },
    ],
  });
})();
