/* Padişah Hayatı — Başlangıç */
(function () {
  const UI = PH.UI;

  PH.applySettings = () => {
    const st = PH.settings;
    document.documentElement.style.setProperty('--fs', st.fontScale || 1);
    document.documentElement.classList.toggle('reduce-motion', !!st.reduceMotion);
  };

  /** Oyun arayüzünü başlat (yeni oyun veya yüklemeden sonra) */
  PH.startUI = () => {
    UI.tab = 'palace';
    UI.sub = {};
    UI.modalOpen = false;
    UI.modalQueue = [];
    document.getElementById('modal-root').innerHTML = '';
    document.getElementById('sheet-root').innerHTML = '';
    UI.sheets = [];
    UI.shell();
    UI.render();
    UI.flow();
  };

  function boot() {
    PH.Save.loadSettings();
    PH.applySettings();
    UI.bind();
    UI.titleScreen();
    // Android geri tuşu / tarayıcı geri: açık sayfayı kapat
    history.pushState({ ph: 1 }, '');
    window.addEventListener('popstate', () => {
      if (UI.sheets.length) UI.topSheet().close();
      history.pushState({ ph: 1 }, '');
    });
    // Kapanırken otomatik kayıt
    window.addEventListener('pagehide', () => { if (PH.state && !PH.state.gameOver) PH.Save.save('oto'); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && PH.state && !PH.state.gameOver) PH.Save.save('oto'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
