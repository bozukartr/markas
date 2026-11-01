/* Padişah Hayatı — Prosedürel SVG portreler (minimal 2D) */
PH.Portrait = (function () {
  const U = PH.U;
  const SKIN = ['#f3d6bb', '#ecc6a2', '#ddb08a', '#c99470', '#ad7a55'];
  const HAIR = ['#24160d', '#3b2414', '#55361e', '#6e4a2a', '#1a1210', '#8a5a32'];
  const ROBES = ['#2f6b3a', '#6b2f2f', '#2f4f7a', '#5b3d7a', '#7a5a2f', '#2f6b6b', '#7a2f5a', '#3d5a2f'];
  const GOWN = ['#9c2f4f', '#2f6f8f', '#7a3f9c', '#3f8f6f', '#b5672f', '#8f2f2f', '#4f5fa8', '#a8862f'];

  function svg(c, size = 56) {
    if (!c) return '';
    const s = PH.state;
    const r = U.seeded(U.hash('p' + c.id + c.name));
    const age = c.alive ? PH.C.age(c) : PH.C.ageAt(c);
    const male = c.g === 'm';
    const isSultan = s && c.id === s.sultanId;
    const role = isSultan ? 'sultan' : c.role === 'exsultan' ? 'sultan' : c.role;
    const skin = SKIN[Math.floor(r() * SKIN.length)];
    let hair = HAIR[Math.floor(r() * HAIR.length)];
    if (age > 68) hair = '#e6e2da'; else if (age > 52) hair = '#a39d93';
    const child = age < 13;
    const teen = age >= 13 && age < 18;
    let robe, bg = '#3a2a1c', trim = '#d4af37';
    if (role === 'sultan') { robe = '#a8201c'; bg = '#4a1512'; }
    else if (c.role === 'valide') { robe = '#5b2f7a'; bg = '#2f1f3f'; }
    else if (c.role === 'harem' || c.role === 'aday' || c.role === 'eskisaray' || c.role === 'evli') { robe = GOWN[Math.floor(r() * GOWN.length)]; bg = '#3f2030'; }
    else if (c.dyn) { robe = male ? '#1f4f8a' : GOWN[Math.floor(r() * GOWN.length)]; bg = '#1f2f4a'; }
    else if (c.cls === 'ulema') { robe = r() < 0.5 ? '#e6dfcc' : '#4a3a6a'; bg = '#2a2a36'; trim = '#9a8a5a'; }
    else if (c.cls === 'aga') { robe = '#7a1c1c'; bg = '#3a1a14'; }
    else if (c.cls === 'kalem') { robe = '#3a5a7a'; bg = '#1f2a36'; }
    else if (c.role === 'yabanci') { robe = '#2f3f6f'; bg = '#1f2436'; }
    else { robe = ROBES[Math.floor(r() * ROBES.length)]; bg = '#22301f'; }

    const faceRy = child ? 10 : 11.5;
    const faceRx = child ? 9 : 9.5;
    const fy = child ? 35 : 32;
    let p = '';
    p += `<circle cx="32" cy="32" r="32" fill="${bg}"/>`;
    // gövde / kaftan
    p += `<path d="M6 64 C8 ${child ? 52 : 48} 20 ${child ? 47 : 44} 32 ${child ? 47 : 44} C44 ${child ? 47 : 44} 56 ${child ? 52 : 48} 58 64 Z" fill="${robe}"/>`;
    p += `<path d="M32 ${child ? 48 : 45} L32 64" stroke="${trim}" stroke-width="1.2" opacity=".8"/>`;
    if (role === 'sultan' || c.cls === 'pasa') p += `<path d="M14 64 C16 54 24 48 32 47 C40 48 48 54 50 64" fill="none" stroke="${trim}" stroke-width="1.6" opacity=".65"/>`;
    // boyun
    p += `<rect x="28.5" y="${fy + 8}" width="7" height="6" rx="2" fill="${skin}"/>`;
    // kadın saçı (arka)
    if (!male) p += `<path d="M${32 - faceRx - 3} ${fy - 2} Q${32 - faceRx - 5} ${fy + 16} ${32 - faceRx + 1} ${fy + 20} L${32 + faceRx - 1} ${fy + 20} Q${32 + faceRx + 5} ${fy + 16} ${32 + faceRx + 3} ${fy - 2} Z" fill="${hair}"/>`;
    // yüz
    p += `<ellipse cx="32" cy="${fy}" rx="${faceRx}" ry="${faceRy}" fill="${skin}"/>`;
    // gözler
    const ey = fy - 1;
    p += `<circle cx="28.3" cy="${ey}" r="1.15" fill="#1a120c"/><circle cx="35.7" cy="${ey}" r="1.15" fill="#1a120c"/>`;
    p += `<path d="M26.3 ${ey - 2.6} q2 -1 4 0 M33.7 ${ey - 2.6} q2 -1 4 0" stroke="${male ? hair : '#3a2416'}" stroke-width="${male ? 1.1 : 0.8}" fill="none" stroke-linecap="round"/>`;
    if (!male) p += `<path d="M30.5 ${fy + 6} q1.5 1 3 0" stroke="#a8404a" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
    // sakal / bıyık
    if (male && age >= 17) {
      const beardLen = age >= 30 ? 8 + r() * 6 : 3 + r() * 3;
      if (age >= 22 || r() < 0.5) p += `<path d="M${32 - faceRx + 0.5} ${fy + 2} Q${32 - faceRx} ${fy + faceRy + beardLen} 32 ${fy + faceRy + beardLen + 1} Q${32 + faceRx} ${fy + faceRy + beardLen} ${32 + faceRx - 0.5} ${fy + 2} Q${32 + 5} ${fy + 8} 32 ${fy + 8} Q${32 - 5} ${fy + 8} ${32 - faceRx + 0.5} ${fy + 2} Z" fill="${hair}"/>`;
      p += `<path d="M27 ${fy + 5.2} Q32 ${fy + 2.8} 37 ${fy + 5.2}" stroke="${hair}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    } else if (male) {
      p += `<path d="M30.3 ${fy + 6} q1.7 .8 3.4 0" stroke="#8a4a3a" stroke-width="1" fill="none" stroke-linecap="round"/>`;
    }
    // başlık
    const top = fy - faceRy;
    if (role === 'sultan') {
      p += `<ellipse cx="32" cy="${top + 1}" rx="${faceRx + 6}" ry="9" fill="#f4f0e6"/>`;
      p += `<path d="M${32 - faceRx - 5} ${top + 1} Q32 ${top - 5} ${32 + faceRx + 5} ${top + 1}" stroke="#d8d0bf" stroke-width="1" fill="none"/>`;
      p += `<path d="M${32 - faceRx - 4} ${top + 4} Q32 ${top} ${32 + faceRx + 4} ${top + 4}" stroke="#d8d0bf" stroke-width="1" fill="none"/>`;
      p += `<rect x="28" y="${top - 11}" width="8" height="6" rx="2" fill="#a8201c"/>`;
      p += `<path d="M35 ${top - 3} C38 ${top - 12} 41 ${top - 16} 44 ${top - 18}" stroke="#2a2a2a" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;
      p += `<path d="M35 ${top - 3} C38 ${top - 12} 41 ${top - 16} 44 ${top - 18}" stroke="#f2f2f2" stroke-width="1" stroke-linecap="round" fill="none"/>`;
      p += `<circle cx="34.5" cy="${top - 2.5}" r="2.2" fill="#2fa86a" stroke="#d4af37" stroke-width="1"/>`;
    } else if (c.role === 'yabanci') {
      p += `<path d="M22 ${top + 3} L22 ${top - 6} L26 ${top - 2} L29 ${top - 8} L32 ${top - 2} L35 ${top - 8} L38 ${top - 2} L42 ${top - 6} L42 ${top + 3} Z" fill="#d4af37"/>`;
    } else if (!male) {
      if (child) p += `<path d="M${32 - faceRx} ${top + 4} Q32 ${top - 5} ${32 + faceRx} ${top + 4} Z" fill="${hair}"/><circle cx="32" cy="${top - 1}" r="1.6" fill="#d4af37"/>`;
      else {
        const hc = c.role === 'valide' ? '#3a2050' : GOWN[Math.floor(r() * GOWN.length)];
        p += `<path d="M${32 - faceRx - 1} ${top + 5} Q${32 - faceRx} ${top - 9} 32 ${top - 10} Q${32 + faceRx} ${top - 9} ${32 + faceRx + 1} ${top + 5} Z" fill="${hc}"/>`;
        p += `<path d="M${32 - faceRx - 1} ${top + 4} L${32 + faceRx + 1} ${top + 4}" stroke="#d4af37" stroke-width="1.4"/>`;
        p += `<circle cx="32" cy="${top - 2}" r="1.8" fill="#e8445a" stroke="#d4af37" stroke-width=".8"/>`;
        p += `<path d="M${32 + faceRx} ${top} Q${32 + faceRx + 8} ${top + 10} ${32 + faceRx + 6} ${top + 26}" stroke="rgba(255,255,255,.35)" stroke-width="3" fill="none"/>`;
        if (c.role === 'valide') p += `<path d="M28 ${top - 9} L30 ${top - 14} L32 ${top - 10} L34 ${top - 14} L36 ${top - 9}" fill="#d4af37"/>`;
      }
    } else if (c.dyn) {
      p += `<ellipse cx="32" cy="${top + 1}" rx="${faceRx + 3}" ry="${child ? 5 : 6.5}" fill="#f1ece0"/>`;
      p += `<path d="M34 ${top - 2} C36 ${top - 8} 38 ${top - 11} 40 ${top - 12}" stroke="#f2f2f2" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
      p += `<circle cx="33.5" cy="${top - 1.5}" r="1.5" fill="#2f6fd8" stroke="#d4af37" stroke-width=".7"/>`;
    } else if (c.cls === 'ulema') {
      p += `<ellipse cx="32" cy="${top}" rx="${faceRx + 7}" ry="10" fill="#f6f2e8"/>`;
      p += `<path d="M${32 - faceRx - 6} ${top} Q32 ${top - 6} ${32 + faceRx + 6} ${top} M${32 - faceRx - 5} ${top + 4} Q32 ${top - 2} ${32 + faceRx + 5} ${top + 4} M${32 - faceRx - 5} ${top - 4} Q32 ${top - 10} ${32 + faceRx + 5} ${top - 4}" stroke="#d8d0bf" stroke-width=".9" fill="none"/>`;
    } else if (c.cls === 'aga') {
      p += `<path d="M${32 - faceRx} ${top + 4} L${32 - faceRx + 2} ${top - 12} Q32 ${top - 16} ${32 + faceRx - 2} ${top - 12} L${32 + faceRx} ${top + 4} Z" fill="#f2ede2"/>`;
      p += `<path d="M${32 + faceRx - 2} ${top - 11} Q${32 + faceRx + 10} ${top - 4} ${32 + faceRx + 8} ${top + 18}" stroke="#f2ede2" stroke-width="5" fill="none" stroke-linecap="round"/>`;
      p += `<rect x="${32 - faceRx}" y="${top + 1}" width="${faceRx * 2}" height="3" fill="#d4af37"/>`;
    } else if (c.cls === 'pasa') {
      p += `<path d="M${32 - faceRx - 2} ${top + 5} L${32 - faceRx} ${top - 13} Q32 ${top - 17} ${32 + faceRx} ${top - 13} L${32 + faceRx + 2} ${top + 5} Z" fill="#f4f0e6"/>`;
      p += `<path d="M${32 - faceRx - 1} ${top + 2} L${32 + faceRx + 1} ${top - 10}" stroke="#d4af37" stroke-width="2.2"/>`;
      p += `<ellipse cx="32" cy="${top + 4}" rx="${faceRx + 3}" ry="3.2" fill="#e9e3d4"/>`;
    } else {
      p += `<ellipse cx="32" cy="${top + 1}" rx="${faceRx + 4}" ry="7.5" fill="#f1ece0"/>`;
      p += `<rect x="29.5" y="${top - 9}" width="5" height="5" rx="1.5" fill="${robe}"/>`;
    }
    const dead = !c.alive;
    return `<svg class="portrait${dead ? ' dead' : ''}" viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true"><defs><clipPath id="pc${c.id}"><circle cx="32" cy="32" r="32"/></clipPath></defs><g clip-path="url(#pc${c.id})">${p}</g></svg>`;
  }

  /** Devlet arması (sancak dairesi) */
  function nationBadge(nid, size = 40) {
    const nd = PH.D.nations[nid];
    const col = nd ? nd.color : '#888';
    const r = U.seeded(U.hash(nid));
    const shape = Math.floor(r() * 3);
    let inner = '';
    if (nd && (nd.din === 'Sünni' || nd.din === 'Şii')) inner = `<path d="M24 12a9 9 0 1 0 0 16a7 7 0 1 1 0-16z" fill="#f2e6c8"/>`;
    else if (shape === 0) inner = `<path d="M20 10v20M12 18h16" stroke="#f2e6c8" stroke-width="3.2"/>`;
    else if (shape === 1) inner = `<path d="M20 10l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6L11 17l6-1z" fill="#f2e6c8"/>`;
    else inner = `<path d="M12 12h16v8c0 6-4 9-8 10-4-1-8-4-8-10z" fill="none" stroke="#f2e6c8" stroke-width="2.4"/>`;
    return `<svg class="nbadge" viewBox="0 0 40 40" width="${size}" height="${size}" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="${col}" stroke="rgba(255,255,255,.25)" stroke-width="1.5"/>${inner}</svg>`;
  }

  /** Tuğra benzeri dekoratif imza */
  function tughra(size = 120) {
    return `<svg class="tughra" viewBox="0 0 120 80" width="${size}" height="${size * 0.66}" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round">
      <path d="M30 70 C30 30 34 12 38 8 M44 70 C44 34 48 14 52 10 M58 70 C58 36 62 18 66 14" stroke-width="3"/>
      <path d="M20 60 C10 52 8 40 18 34 C30 28 52 34 70 46 C88 58 104 60 112 52" stroke-width="2.4"/>
      <path d="M24 56 C16 50 16 42 24 40 C34 38 54 44 72 54" stroke-width="2"/>
      <path d="M70 70 C80 62 96 64 100 72" stroke-width="2"/><circle cx="86" cy="38" r="3"/>
    </svg>`;
  }

  return { svg, nationBadge, tughra };
})();
