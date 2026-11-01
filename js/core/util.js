/* Padişah Hayatı — Yardımcı fonksiyonlar */
window.PH = window.PH || {};

PH.U = (function () {
  const U = {};

  U.ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  U.rf = (a, b) => a + Math.random() * (b - a);
  U.chance = (p) => Math.random() < p;
  U.pick = (a) => (a && a.length ? a[Math.floor(Math.random() * a.length)] : undefined);
  U.pickW = (arr, wf) => {
    let tot = 0;
    const ws = arr.map((x) => {
      const v = Math.max(0, typeof wf === 'function' ? wf(x) : (x.w || 1));
      tot += v;
      return v;
    });
    if (tot <= 0) return null;
    let r = Math.random() * tot;
    for (let i = 0; i < arr.length; i++) {
      r -= ws[i];
      if (r <= 0) return arr[i];
    }
    return arr[arr.length - 1];
  };
  U.shuffle = (a) => {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  U.sample = (a, n) => U.shuffle(a).slice(0, n);
  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.r1 = (v) => Math.round(v * 10) / 10;
  U.sum = (arr, f) => arr.reduce((t, x) => t + (f ? f(x) : x), 0);
  U.avg = (arr, f) => (arr.length ? U.sum(arr, f) / arr.length : 0);
  U.uid = () => Math.random().toString(36).slice(2, 9);

  U.num = (n) => Math.round(n).toLocaleString('tr-TR');

  /** Akçe biçimlendirme: 1,2 Mn / 350 bin */
  U.money = (n, withUnit) => {
    const neg = n < 0;
    const a = Math.abs(n);
    let s;
    if (a >= 1e9) s = (a / 1e9).toFixed(2).replace('.', ',') + ' Mr';
    else if (a >= 1e6) s = (a / 1e6).toFixed(a >= 1e8 ? 0 : 1).replace('.', ',') + ' Mn';
    else if (a >= 1e3) s = Math.round(a / 1e3) + ' bin';
    else s = String(Math.round(a));
    return (neg ? '−' : '') + s + (withUnit ? ' akçe' : '');
  };
  U.signed = (n, d = 0) => {
    const v = d ? n.toFixed(d).replace('.', ',') : String(Math.round(n));
    return n > 0 ? '+' + v : n < 0 ? '−' + v.replace('-', '') : '0';
  };
  U.pct = (v) => Math.round(v * 100) + '%';

  U.MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  U.season = (m) => (m <= 1 || m === 11 ? 'Kış' : m <= 4 ? 'Bahar' : m <= 7 ? 'Yaz' : 'Güz');
  U.isWinter = (m) => m >= 10 || m <= 1;
  U.hijri = (y, m) => Math.floor((y + m / 12 - 622) * 33 / 32);
  U.dateStr = (y, m) => U.MONTHS[m] + ' ' + y;

  U.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  U.hash = (str) => {
    let h = 2166136261;
    str = String(str);
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };
  /** Tohumlu rastgele (portreler gibi kalıcı görseller için) */
  U.seeded = (seed) => {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  /** Basit ilerleme çubuğu HTML'i */
  U.bar = (v, max = 100, cls = '') => {
    const p = U.clamp((v / max) * 100, 0, 100);
    let tone = cls;
    if (!tone) tone = p < 25 ? 'bad' : p < 50 ? 'warn' : p < 75 ? 'mid' : 'good';
    return `<div class="bar ${tone}"><i style="width:${p}%"></i></div>`;
  };

  /** Değer seviyesi sözcükleri */
  U.level = (v) => (v >= 85 ? 'Mükemmel' : v >= 70 ? 'Yüksek' : v >= 50 ? 'İyi' : v >= 35 ? 'Orta' : v >= 20 ? 'Düşük' : 'Kritik');
  U.skillWord = (v) => (v >= 18 ? 'Dâhi' : v >= 14 ? 'Usta' : v >= 10 ? 'Ehil' : v >= 6 ? 'Vasat' : v >= 3 ? 'Zayıf' : 'Câhil');
  U.opWord = (v) => (v >= 70 ? 'Hayran' : v >= 40 ? 'Sadık' : v >= 10 ? 'Hürmetkâr' : v >= -10 ? 'Mesafeli' : v >= -40 ? 'Soğuk' : v >= -70 ? 'Hasım' : 'Düşman');

  U.cap = (s) => (s ? s.charAt(0).toLocaleUpperCase('tr-TR') + s.slice(1) : s);

  /** Türkçe ek uyumu (basit): ismin -i hali */
  U.vowelLast = (w) => {
    const m = String(w).toLocaleLowerCase('tr-TR').match(/[aeıioöuü](?=[^aeıioöuü]*$)/);
    return m ? m[0] : 'e';
  };
  U.acc = (w) => { // belirtme hali (-ı/-i/-u/-ü)
    const v = U.vowelLast(w);
    const map = { a: 'ı', ı: 'ı', e: 'i', i: 'i', o: 'u', u: 'u', ö: 'ü', ü: 'ü' };
    const last = String(w).slice(-1).toLocaleLowerCase('tr-TR');
    const isV = 'aeıioöuü'.includes(last);
    return w + "'" + (isV ? 'y' : '') + map[v];
  };
  U.loc = (w) => { // bulunma hali (-da/-de/-ta/-te)
    const v = U.vowelLast(w);
    const back = 'aıou'.includes(v);
    const last = String(w).slice(-1).toLocaleLowerCase('tr-TR');
    const hard = 'çfhkpsşt'.includes(last);
    return w + "'" + (hard ? 't' : 'd') + (back ? 'a' : 'e');
  };
  U.dat = (w) => { // yönelme hali (-a/-e)
    const v = U.vowelLast(w);
    const back = 'aıou'.includes(v);
    const last = String(w).slice(-1).toLocaleLowerCase('tr-TR');
    const isV = 'aeıioöuü'.includes(last);
    return w + "'" + (isV ? 'y' : '') + (back ? 'a' : 'e');
  };
  U.abl = (w) => { // ayrılma hali (-dan/-den/-tan/-ten)
    const v = U.vowelLast(w);
    const back = 'aıou'.includes(v);
    const last = String(w).slice(-1).toLocaleLowerCase('tr-TR');
    const hard = 'çfhkpsşt'.includes(last);
    return w + "'" + (hard ? 't' : 'd') + (back ? 'an' : 'en');
  };
  U.gen = (w) => { // ilgi hali (-ın/-in/-un/-ün)
    const v = U.vowelLast(w);
    const map = { a: 'ın', ı: 'ın', e: 'in', i: 'in', o: 'un', u: 'un', ö: 'ün', ü: 'ün' };
    const last = String(w).slice(-1).toLocaleLowerCase('tr-TR');
    const isV = 'aeıioöuü'.includes(last);
    return w + "'" + (isV ? 'n' : '') + map[v];
  };

  U.vibrate = (ms = 8) => {
    try {
      if (PH.state && PH.settings && PH.settings.haptics && navigator.vibrate) navigator.vibrate(ms);
    } catch (e) { /* yok say */ }
  };

  return U;
})();
