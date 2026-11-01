/* Padişah Hayatı — Oyun menüsü: kayıt, yükleme, ayarlar, rehber */
(function () {
  const U = PH.U, UI = PH.UI, A = PH.A, Sv = PH.Save;
  const ic = PH.ic;

  UI.openMenu = () => UI.sheet({ title: 'Menü', render: renderMenu });

  function slotRow(sl, mode) {
    const m = Sv.meta(sl);
    const label = sl === 'oto' ? 'Otomatik kayıt' : 'Kayıt ' + sl;
    const info = m ? `${U.esc(m.name)} · ${U.esc(m.date)} · ${m.provs} eyalet${m.over ? ' · bitti' : ''}` : 'Boş';
    if (mode === 'save') return sl === 'oto' ? '' : `<button class="lrow" data-act="saveSlot" data-sl="${sl}">${ic('save')}<div><b>${label}</b><small>${info}</small></div></button>`;
    return `<div class="lrow static">${ic('door')}<div><b>${label}</b><small>${info}</small></div><div class="rbtns">${m ? `<button class="btn sm gold" data-act="loadSlot" data-sl="${sl}">Yükle</button><button class="btn sm ghost" data-act="delSlot" data-sl="${sl}">${ic('trash')}</button>` : ''}</div></div>`;
  }

  function renderMenu() {
    const st = PH.settings;
    const inGame = !!PH.state;
    let h = '';
    if (inGame) h += `<h4 class="sec">${ic('save')} Kaydet</h4><div class="list">${['1', '2', '3'].map((sl) => slotRow(sl, 'save')).join('')}</div>`;
    h += `<h4 class="sec">${ic('door')} Yükle</h4><div class="list">${Sv.SLOTS.map((sl) => slotRow(sl, 'load')).join('')}</div>`;
    h += `<h4 class="sec">${ic('gear')} Ayarlar</h4><div class="card">
      <div class="kv"><span>Titreşim</span><button class="toggle ${st.haptics ? 'on' : ''}" data-act="setOpt" data-k="haptics"><i></i></button></div>
      <div class="kv"><span>Vakit kalmışken ay sonu uyarısı</span><button class="toggle ${st.confirmEnd ? 'on' : ''}" data-act="setOpt" data-k="confirmEnd"><i></i></button></div>
      <div class="kv"><span>Hareketleri azalt</span><button class="toggle ${st.reduceMotion ? 'on' : ''}" data-act="setOpt" data-k="reduceMotion"><i></i></button></div>
      <div class="kv"><span>Yazı boyutu</span><div class="rbtns">${[0.9, 1, 1.1, 1.2].map((v) => `<button class="btn sm ${st.fontScale === v ? 'gold' : ''}" data-act="setFont" data-v="${v}">${Math.round(v * 100)}%</button>`).join('')}</div></div></div>`;
    h += `<div class="list"><button class="lrow" data-act="howTo">${ic('info')}<div><b>Nasıl Oynanır?</b><small>Temel kurallar ve ipuçları</small></div>${ic('chev', 'chev')}</button>`;
    if (inGame) h += `<button class="lrow" data-act="goMain">${ic('exile')}<div><b>Ana Menüye Dön</b><small>Oyun otomatik kaydedilir</small></div>${ic('chev', 'chev')}</button>`;
    h += `</div><p class="muted small center">Padişah Hayatı · sürüm 1.0</p>`;
    return h;
  }

  A.saveSlot = (ds) => { if (Sv.save(ds.sl)) { UI.toast('Oyun kaydedildi.', 'ok'); UI.topSheet().refresh(); } else UI.toast('Kayıt başarısız!', 'bad'); };
  A.loadSlot = (ds) => {
    const go = () => { if (Sv.load(ds.sl)) { UI.closeAllSheets(); PH.startUI(); UI.toast('Oyun yüklendi.', 'ok'); } else UI.toast('Yükleme başarısız!', 'bad'); };
    if (PH.state) UI.confirm({ title: 'Yükle', text: 'Mevcut oyundaki kaydedilmemiş ilerleme kaybolacak.', yes: 'Yükle', onYes: go });
    else go();
  };
  A.delSlot = (ds) => UI.confirm({ title: 'Kaydı sil', text: 'Bu kayıt kalıcı olarak silinecek.', yes: 'Sil', danger: true, onYes: () => { Sv.del(ds.sl); UI.refresh(); const t = UI.topSheet(); if (t) t.refresh(); if (!PH.state) PH.UI.titleScreen(); } });
  A.setOpt = (ds) => { PH.settings[ds.k] = !PH.settings[ds.k]; Sv.saveSettings(); PH.applySettings(); UI.topSheet().refresh(); };
  A.setFont = (ds) => { PH.settings.fontScale = +ds.v; Sv.saveSettings(); PH.applySettings(); UI.topSheet().refresh(); };
  A.goMain = () => { if (PH.state && !PH.state.gameOver) Sv.save('oto'); UI.closeAllSheets(); if (UI.modalOpen) { document.getElementById('modal-root').innerHTML = ''; UI.modalOpen = false; UI.modalQueue = []; } PH.state = null; UI.titleScreen(); };

  A.howTo = () => UI.sheet({
    title: 'Nasıl Oynanır?', cls: 'tall',
    render: () => `<div class="guide">
      <p><b>Padişah Hayatı</b>, bir Osmanlı padişahının hem şahsi hayatını hem de devlet idaresini yönettiğiniz yazı tabanlı bir simülasyondur. Her tur bir aydır.</p>
      <h4>${ic('hourglass')} Vakit</h4><p>Her ay sınırlı vaktiniz vardır (genelde 4). Av, tebdil-i kıyafet, okuma, harem ziyareti, sohbet, Divan toplantısı gibi şahsi işler vakit harcar. Devlet kararları (atama, kanun, inşaat, diplomasi) vakit harcamaz ama paraya ve sonuçlara mal olur.</p>
      <h4>${ic('scale')} Göstergeler</h4><p>Üst şeritteki değerlere dokunarak ayrıntılarını görün. Halk, istikrar, yeniçeri, ulema, meşruiyet her ay belirli bir hedefe doğru kayar; olaylar ve kararlar onları anlık değiştirir. Hazine eksiye düşerse ulufeler ödenmez ve yeniçeriler kazan kaldırır.</p>
      <h4>${ic('palace')} Saray</h4><p>Padişahınızın sağlığı, keyfi, stresi ve takvası. Stres yüksekse sağlık bozulur. Yaşlandıkça ölüm ihtimali artar; ölünce tahta varisiniz geçer ve oyun devam eder. Hanedanda erkek kalmazsa oyun biter.</p>
      <h4>${ic('seal')} Divan</h4><p>Vezirleri atayın, azledin, idam edin. Her makamın belirleyici bir yeteneği vardır. Vergi oranını, akçe ayarını, borçları yönetin. Kanunlar ilan edin, fermanlar yazın, camiler ve medreseler inşa edin.</p>
      <h4>${ic('tulip')} Harem ve Hanedan</h4><p>Haseki ve cariyelerle vakit geçirin; çocuklarınız dünyaya gelir. İsimlerini siz koyarsınız. Şehzadelere hoca tayin edin, sancağa çıkarın ya da kafese kapatın. Kızlarınızı paşalarla evlendirerek onları hanedana bağlayın. Veliahdınızı belirleyin.</p>
      <h4>${ic('sword')} Ordu</h4><p>Asker toplayın, talim yaptırın, bahşiş dağıtın. Savaştaysanız sefer düzenleyin: hedef, kuvvet ve serdar seçin. Meydan muharebesinde düşmanın düzenine göre taktik seçin; kuşatmada hücum, aman veya sabır arasında karar verin. Kışın ordu erir!</p>
      <h4>${ic('globe')} Dünya</h4><p>Elçi gönderin, hediye verin, ittifak ve ticaret anlaşması yapın, haraç isteyin, savaş ilan edin, barış şartlarını belirleyin. Eyaletlere vali atayın, yatırım yapın, isyanları bastırın.</p>
      <h4>${ic('dagger')} Entrika</h4><p>Size küsen hırslı kişiler komplo kurabilir: darbe, zehir, isyan. Sohbet ederek, hafiyeyle izleterek ve iyi bir Bostancıbaşı atayarak komploları önceden sezin.</p>
      <h4>${ic('star')} İpuçları</h4><p>• İlk aylarda boş makamları doldurun ve hazineyi dengeleyin.<br>• Seferlere baharda çıkın.<br>• Erkek evlat sahibi olmak meşruiyeti artırır.<br>• Adil hükümler ve yapılar size "Kanunî", "Âdil" gibi lakaplar kazandırır.<br>• Oyun her ay otomatik kaydedilir.</p>
    </div>`,
  });
})();
