/* Padişah Hayatı — Kayıt / yükleme ve ayarlar */
PH.Save = (function () {
  const KEY = 'padisah_save_';
  const SET = 'padisah_settings';
  const SLOTS = ['oto', '1', '2', '3'];
  const S = { SLOTS };

  S.meta = (slot) => {
    try {
      const raw = localStorage.getItem(KEY + slot + '_meta');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  };

  S.save = (slot) => {
    const s = PH.state;
    if (!s) return false;
    try {
      const sul = PH.C.sultan();
      localStorage.setItem(KEY + slot, JSON.stringify(s));
      localStorage.setItem(KEY + slot + '_meta', JSON.stringify({
        name: sul ? PH.C.name(sul) : '—', date: PH.U.dateStr(s.year, s.month), era: PH.D.eras[s.era].n,
        provs: PH.Eco.ownProvs(s).length, saved: Date.now(), over: !!s.gameOver,
      }));
      return true;
    } catch (e) {
      console.error('Kayıt hatası', e);
      return false;
    }
  };

  S.load = (slot) => {
    try {
      const raw = localStorage.getItem(KEY + slot);
      if (!raw) return false;
      const s = JSON.parse(raw);
      // eksik alanları tamamla (eski kayıtlar için)
      const blank = PH.St.blank();
      for (const k in blank) if (s[k] === undefined) s[k] = blank[k];
      PH.state = s;
      PH.Harem.cleanupCandidates();
      return true;
    } catch (e) {
      console.error('Yükleme hatası', e);
      return false;
    }
  };

  S.del = (slot) => { localStorage.removeItem(KEY + slot); localStorage.removeItem(KEY + slot + '_meta'); };
  S.any = () => SLOTS.some((sl) => S.meta(sl));
  S.latest = () => {
    let best = null;
    SLOTS.forEach((sl) => { const m = S.meta(sl); if (m && !m.over && (!best || m.saved > best.m.saved)) best = { sl, m }; });
    return best;
  };

  S.loadSettings = () => {
    let st = { haptics: true, fontScale: 1, confirmEnd: true, reduceMotion: false };
    try { const raw = localStorage.getItem(SET); if (raw) st = Object.assign(st, JSON.parse(raw)); } catch (e) { /* yok */ }
    PH.settings = st;
    return st;
  };
  S.saveSettings = () => { try { localStorage.setItem(SET, JSON.stringify(PH.settings)); } catch (e) { /* yok */ } };

  return S;
})();
