// 딱지왕 — 그림 전부 코드(SVG)로 그린다. 이미지 파일 없음.
(function (root) {
  'use strict';
  let uid = 0;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  // ================= 딱지 앞면 =================
  function pattern(kind, c1, c2, id) {
    let s = '';
    switch (kind) {
      case 'stars':
        for (let i = 0; i < 14; i++) { const x = (i * 37 + 11) % 90 + 5, y = (i * 53 + 7) % 90 + 5; s += `<text x="${x}" y="${y}" font-size="${6 + (i % 3) * 3}" fill="#fff" opacity=".55" text-anchor="middle">✦</text>`; }
        break;
      case 'rays':
        for (let i = 0; i < 12; i++) { const a = i * 30 * Math.PI / 180, b = (i * 30 + 15) * Math.PI / 180; s += `<polygon points="50,50 ${50 + 90 * Math.cos(a)},${50 + 90 * Math.sin(a)} ${50 + 90 * Math.cos(b)},${50 + 90 * Math.sin(b)}" fill="#fff" opacity=".2"/>`; }
        break;
      case 'stripes':
        for (let i = -4; i < 12; i++) s += `<line x1="${i * 14}" y1="0" x2="${i * 14 + 40}" y2="100" stroke="#fff" stroke-width="5" opacity=".22"/>`;
        break;
      case 'checker':
        for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) if ((x + y) % 2 === 0) s += `<rect x="${x * 20}" y="${y * 20}" width="20" height="20" fill="#000" opacity=".16"/>`;
        break;
      case 'dots':
        for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) s += `<circle cx="${10 + x * 16 + (y % 2) * 8}" cy="${10 + y * 16}" r="4" fill="#fff" opacity=".28"/>`;
        break;
      case 'halftone':
        for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) s += `<circle cx="${6 + x * 12}" cy="${6 + y * 12}" r="${1 + y * 0.45}" fill="#000" opacity=".12"/>`;
        break;
      case 'flames':
        for (let i = 0; i < 6; i++) { const x = i * 18 + 4; s += `<path d="M${x},100 Q${x - 6},80 ${x + 4},66 Q${x + 2},82 ${x + 10},74 Q${x + 18},88 ${x + 16},100Z" fill="#ffd34a" opacity=".5"/>`; }
        break;
      case 'circuit':
        s += `<g stroke="#fff" stroke-width="1.6" fill="none" opacity=".4"><path d="M6,20 H30 V40 H50"/><path d="M94,30 H70 V12"/><path d="M8,80 H26 V64"/><path d="M94,82 H64 V94"/></g>`;
        s += `<g fill="#fff" opacity=".5"><circle cx="50" cy="40" r="2.5"/><circle cx="70" cy="12" r="2.5"/><circle cx="26" cy="64" r="2.5"/><circle cx="64" cy="94" r="2.5"/></g>`;
        break;
      case 'scales':
        for (let y = 0; y < 7; y++) for (let x = 0; x < 6; x++) s += `<path d="M${x * 18 + (y % 2) * 9 - 2},${y * 14 + 10} a9,9 0 0 0 18,0" fill="none" stroke="#fff" stroke-width="1.6" opacity=".3"/>`;
        break;
      case 'foil':
        s += `<rect width="100" height="100" fill="url(#f${id})" opacity=".55"/>`;
        for (let i = 0; i < 8; i++) s += `<text x="${(i * 41 + 9) % 88 + 6}" y="${(i * 29 + 13) % 84 + 10}" font-size="9" fill="#fff" opacity=".85">✦</text>`;
        break;
      case 'rainbow':
        s += `<rect width="100" height="100" fill="url(#r${id})" opacity=".9"/>`;
        s += `<path d="M0,100 Q50,10 100,100" stroke="#fff" stroke-width="3" fill="none" opacity=".4"/>`;
        break;
      default: // plain: 접은 자국
        s += `<g stroke="#000" opacity=".12" stroke-width="1.2"><line x1="0" y1="0" x2="100" y2="100"/><line x1="100" y1="0" x2="0" y2="100"/><rect x="18" y="18" width="64" height="64" fill="none"/></g>`;
    }
    return s;
  }
  function cardFace(d, opts) {
    opts = opts || {};
    const id = ++uid;
    const locked = opts.locked;
    const c1 = locked ? '#5a5a66' : d.c1, c2 = locked ? '#2d2d36' : d.c2;
    const stars = '★'.repeat(d.rarity);
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="face rar${d.rarity}">
<defs>
<linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
<linearGradient id="f${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6c0"/><stop offset=".4" stop-color="#ffd24a"/><stop offset=".7" stop-color="#fff0a0"/><stop offset="1" stop-color="#c88a1a"/></linearGradient>
<linearGradient id="r${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5d8f"/><stop offset=".25" stop-color="#ffd24a"/><stop offset=".5" stop-color="#5dff9a"/><stop offset=".75" stop-color="#4bb8ff"/><stop offset="1" stop-color="#b66bff"/></linearGradient>
<clipPath id="c${id}"><rect x="3" y="3" width="94" height="94" rx="9"/></clipPath>
</defs>
<rect x="1.5" y="1.5" width="97" height="97" rx="11" fill="#1a1208"/>
<rect x="3" y="3" width="94" height="94" rx="9" fill="url(#g${id})"/>
<g clip-path="url(#c${id})">${locked ? '' : pattern(d.pattern, c1, c2, id)}</g>
<rect x="8" y="8" width="84" height="84" rx="6" fill="none" stroke="#fff" stroke-opacity="${locked ? .15 : .55}" stroke-width="1.5"/>
${locked ? `<text x="50" y="64" font-size="44" text-anchor="middle" fill="#9a9aa8" font-weight="900">?</text>` :
        `<circle cx="50" cy="46" r="26" fill="#000" opacity=".22"/><text x="50" y="60" font-size="40" text-anchor="middle">${d.icon}</text>`}
${locked ? '' : `<rect x="10" y="76" width="80" height="16" rx="4" fill="#000" opacity=".5"/><text x="50" y="88" font-size="11" font-weight="900" text-anchor="middle" fill="#fff" font-family="Malgun Gothic,Apple SD Gothic Neo,sans-serif">${esc(d.name)}</text>
<text x="14" y="21" font-size="9" fill="#fff" stroke="#000" stroke-width=".4">${stars}</text>`}
</svg>`;
  }
  // 딱지 뒷면: 접은 신문지
  function cardBack() {
    const id = ++uid;
    let lines = '';
    for (let i = 0; i < 9; i++) lines += `<line x1="12" y1="${14 + i * 9}" x2="${60 + (i * 17) % 30}" y2="${14 + i * 9}" stroke="#5a5240" stroke-width="2" opacity=".22"/>`;
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="face back">
<defs><linearGradient id="b${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d8d0b8"/><stop offset="1" stop-color="#b3a98c"/></linearGradient></defs>
<rect x="1.5" y="1.5" width="97" height="97" rx="11" fill="#2a2418"/>
<rect x="3" y="3" width="94" height="94" rx="9" fill="url(#b${id})"/>
${lines}
<g stroke="#4a4232" stroke-width="1.3" fill="none" opacity=".55"><rect x="14" y="14" width="72" height="72"/><rect x="30" y="30" width="40" height="40"/><line x1="14" y1="14" x2="30" y2="30"/><line x1="86" y1="14" x2="70" y2="30"/><line x1="14" y1="86" x2="30" y2="70"/><line x1="86" y1="86" x2="70" y2="70"/></g>
</svg>`;
  }
  // 앞/뒤 두 면을 가진 3D 딱지 (flipped=true 면 뒷면이 보임)
  function card(d, opts) {
    opts = opts || {};
    return `<div class="dk r${d.rarity} ${opts.cls || ''}" data-id="${d.id}"><div class="flipper${opts.flipped ? ' flipped' : ''}"><div class="side front">${cardFace(d, opts)}</div><div class="side rear">${cardBack()}</div></div></div>`;
  }

  // ================= 인물 =================
  function kid(look, mood) {
    mood = mood || 'normal';
    const L = look;
    let hairBack = '', hairFront = '', extra = '';
    switch (L.style) {
      case 'bowl': hairFront = `<path d="M26,44 Q26,18 50,18 Q74,18 74,44 Q64,34 50,34 Q36,34 26,44Z" fill="${L.hair}"/>`; break;
      case 'side': hairFront = `<path d="M26,46 Q24,16 52,16 Q78,18 74,46 Q70,28 40,32 Q32,34 26,46Z" fill="${L.hair}"/>`; break;
      case 'spiky': hairFront = `<path d="M26,44 L28,18 L38,28 L44,12 L52,26 L60,12 L64,28 L74,18 L74,44 Q62,32 50,34 Q38,32 26,44Z" fill="${L.hair}"/>`; break;
      case 'short': hairFront = `<path d="M26,44 Q24,16 50,15 Q76,16 74,44 Q64,30 50,30 Q36,30 26,44Z" fill="${L.hair}"/>`; break;
      case 'long': hairBack = `<path d="M22,50 Q20,14 50,14 Q80,14 78,50 L78,76 Q64,70 62,56 L38,56 Q36,70 22,76Z" fill="${L.hair}"/>`; hairFront = `<path d="M28,44 Q30,22 50,22 Q70,22 72,44 Q62,34 50,34 Q38,34 28,44Z" fill="${L.hair}"/>`; break;
      case 'pomade': hairFront = `<path d="M26,44 Q22,12 52,10 Q82,12 74,44 Q70,24 50,24 Q34,24 26,44Z" fill="${L.hair}"/><path d="M40,14 Q60,6 72,18" stroke="#fff" stroke-opacity=".4" stroke-width="2" fill="none"/>`; break;
    }
    if (L.extra === 'glasses') extra += `<g fill="#cfe9ff" fill-opacity=".35" stroke="#222" stroke-width="2"><circle cx="41" cy="48" r="8"/><circle cx="59" cy="48" r="8"/></g><line x1="49" y1="48" x2="51" y2="48" stroke="#222" stroke-width="2"/>`;
    if (L.extra === 'snot') extra += `<path d="M47,58 q-1,7 2,7 q3,0 2,-7z" fill="#bfe6ff" opacity=".9"/>`;
    if (L.extra === 'cap') extra += `<path d="M24,38 Q26,14 50,14 Q74,14 76,38 Z" fill="#e63946"/><rect x="20" y="36" width="46" height="6" rx="3" fill="#b8202c"/><circle cx="50" cy="14" r="3" fill="#fff"/>`;
    if (L.extra === 'band') extra += `<rect x="25" y="30" width="50" height="7" fill="#d62839"/><circle cx="50" cy="33.5" r="3" fill="#fff"/>`;
    if (L.extra === 'scar') extra += `<path d="M60,40 L66,54" stroke="#a33" stroke-width="2.2" stroke-linecap="round"/>`;
    if (L.extra === 'crown') extra += `<path d="M30,18 L36,4 L44,14 L50,0 L56,14 L64,4 L70,18Z" fill="#ffd34a" stroke="#b8860b" stroke-width="1.5"/><circle cx="50" cy="7" r="2" fill="#ff4d6d"/>`;
    const eyeY = 48;
    let eyes, mouth;
    const eyeFill = L.extra === 'glasses' ? '' : '';
    if (mood === 'sad') { eyes = `<path d="M37,${eyeY + 1} q4,-4 8,0 M55,${eyeY + 1} q4,-4 8,0" stroke="#222" stroke-width="2.2" fill="none"/><path d="M33,${eyeY + 8} q0,5 -2,8 M67,${eyeY + 8} q0,5 2,8" stroke="#7ec8ff" stroke-width="2.4" fill="none"/>`; mouth = `<path d="M43,68 q7,-6 14,0" stroke="#222" stroke-width="2.2" fill="none"/>`; }
    else if (mood === 'happy') { eyes = `<path d="M37,${eyeY + 2} q4,-6 8,0 M55,${eyeY + 2} q4,-6 8,0" stroke="#222" stroke-width="2.4" fill="none"/>`; mouth = `<path d="M42,62 q8,10 16,0Z" fill="#7a1f1f"/><path d="M45,66 q5,3 10,0" stroke="#ff8a8a" stroke-width="2" fill="none"/>`; }
    else { eyes = `<circle cx="41" cy="${eyeY}" r="3" fill="#222"/><circle cx="59" cy="${eyeY}" r="3" fill="#222"/><circle cx="42" cy="${eyeY - 1}" r="1" fill="#fff"/><circle cx="60" cy="${eyeY - 1}" r="1" fill="#fff"/>`; mouth = `<path d="M44,64 q6,4 12,0" stroke="#222" stroke-width="2.2" fill="none"/>`; }
    return `<svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg" class="kid">
<path d="M18,110 Q18,80 50,80 Q82,80 82,110Z" fill="${L.shirt}"/>
<path d="M40,80 Q50,90 60,80" fill="${L.skin}"/>
<rect x="43" y="70" width="14" height="14" fill="${L.skin}"/>
${hairBack}
<circle cx="50" cy="48" r="25" fill="${L.skin}"/>
<ellipse cx="27" cy="52" rx="4" ry="6" fill="${L.skin}"/><ellipse cx="73" cy="52" rx="4" ry="6" fill="${L.skin}"/>
${hairFront}
<circle cx="35" cy="58" r="4.5" fill="#ff8a8a" opacity=".35"/><circle cx="65" cy="58" r="4.5" fill="#ff8a8a" opacity=".35"/>
${eyes}${mouth}${extra}
</svg>`;
  }
  const ME = { skin: '#ffd9b3', hair: '#1c1c24', style: 'spiky', shirt: '#ffc928', extra: 'band' };

  // ================= 배경(골목) =================
  const SKY = [
    ['#ffb45e', '#ff7a6b', '#7a5aa8'],   // 1 놀이터 노을
    ['#ffd08a', '#ff9a7a', '#8a6fb0'],   // 2 아파트
    ['#ffc46b', '#ff8e5e', '#9a6a9c'],   // 3 문방구
    ['#8fd3ff', '#bfe8ff', '#fff3cf'],   // 4 운동장(맑은 오후)
    ['#3a4a6e', '#2a3250', '#171c33'],   // 5 비 온 뒤
    ['#ff7a3d', '#c2305f', '#2a1646'],   // 6 해질녘
  ];
  const GROUND = [
    ['#e2c48a', '#c9a96a'], ['#9a9ba3', '#7a7b84'], ['#d8782c', '#b45c1a'], ['#b9a58a', '#9a866c'], ['#4a4f63', '#363a4c'], ['#74707c', '#55515f'],
  ];
  function rnd(seed) { let a = seed; return () => { a = (a * 9301 + 49297) % 233280; return a / 233280; }; }
  function buildings(seed, y, count, color, win, lit) {
    const r = rnd(seed); let s = '', x = -10;
    for (let i = 0; i < count; i++) {
      const w = 40 + r() * 50, h = 40 + r() * 70;
      s += `<rect x="${x}" y="${y - h}" width="${w}" height="${h + 40}" fill="${color}"/>`;
      for (let wy = y - h + 8; wy < y - 8; wy += 16) for (let wx = x + 7; wx < x + w - 10; wx += 14) {
        const on = r() < lit;
        s += `<rect x="${wx}" y="${wy}" width="7" height="9" fill="${on ? win : '#000'}" opacity="${on ? .9 : .18}"/>`;
      }
      x += w + 2 + r() * 6;
    }
    return s;
  }
  function scene(stage) {
    const sk = SKY[stage], gr = GROUND[stage];
    const id = 's' + (++uid);
    const GY = 152; // 땅이 시작되는 y
    let far = '', mid = '', props = '', gtex = '';
    const dark = stage === 4 || stage === 5;
    // 해/달
    const sun = stage === 4 ? `<circle cx="300" cy="46" r="26" fill="#fff" opacity=".12"/><circle cx="300" cy="46" r="14" fill="#cfd8ff" opacity=".7"/>`
      : stage === 3 ? `<circle cx="70" cy="52" r="26" fill="#fff6a8"/><circle cx="70" cy="52" r="40" fill="#fff6a8" opacity=".25"/>`
        : stage === 5 ? `<circle cx="188" cy="124" r="64" fill="#ffb347" opacity=".9"/><circle cx="188" cy="124" r="90" fill="#ff7a3d" opacity=".25"/>`
          : `<circle cx="${stage === 2 ? 300 : 80}" cy="${GY - 28}" r="38" fill="#ffe08a" opacity=".9"/><circle cx="${stage === 2 ? 300 : 80}" cy="${GY - 28}" r="58" fill="#fff" opacity=".18"/>`;
    // 구름
    const cloud = (x, y, o) => `<g class="cloud" style="animation-delay:${-x / 8}s" opacity="${o}"><ellipse cx="${x}" cy="${y}" rx="30" ry="9" fill="#fff"/><ellipse cx="${x + 18}" cy="${y - 6}" rx="18" ry="8" fill="#fff"/><ellipse cx="${x - 16}" cy="${y - 4}" rx="16" ry="7" fill="#fff"/></g>`;
    far = (stage === 4 ? '' : cloud(60, 36, .55) + cloud(250, 24, .4)) + sun;
    // 멀리 건물
    mid += buildings(stage * 11 + 3, GY - 6, 9, dark ? '#242a45' : '#6c4f78', '#ffe9a0', dark ? .5 : .35);
    if (stage === 0) { // 놀이터: 미끄럼틀·그네
      props += `<g stroke="#3a2a4a" stroke-width="4" fill="none" stroke-linecap="round"><path d="M268,${GY + 20} V${GY - 40} H320 V${GY + 20}"/><path d="M280,${GY - 40} L290,${GY + 14} M308,${GY - 40} L300,${GY + 14}"/><path d="M60,${GY + 20} L80,${GY - 36} L100,${GY + 20}"/><path d="M70,${GY - 36} H92"/></g><rect x="270" y="${GY - 4}" width="50" height="5" fill="#ff5a4d"/>`;
    }
    if (stage === 1) { // 상가 간판
      props += `<rect x="20" y="${GY - 58}" width="120" height="46" fill="#2b2f4a"/><rect x="26" y="${GY - 52}" width="108" height="20" fill="#e63946"/><text x="80" y="${GY - 37}" font-size="14" font-weight="900" fill="#fff" text-anchor="middle" font-family="Malgun Gothic,sans-serif">우리슈퍼</text><rect x="30" y="${GY - 26}" width="40" height="22" fill="#ffd978" opacity=".8"/><rect x="80" y="${GY - 26}" width="50" height="22" fill="#9ad0ff" opacity=".6"/>`;
    }
    if (stage === 2) { // 문방구
      props += `<rect x="6" y="${GY - 66}" width="160" height="70" fill="#3a2a56"/><path d="M0,${GY - 66} H172 L162,${GY - 44} H10Z" fill="#ff5a4d"/>`;
      for (let i = 0; i < 8; i++) props += `<path d="M${10 + i * 20},${GY - 66} h20 l-2,22 h-16z" fill="${i % 2 ? '#fff' : '#ff5a4d'}" opacity=".92"/>`;
      props += `<rect x="30" y="${GY - 94}" width="112" height="22" rx="4" fill="#ffd34a" stroke="#b8860b" stroke-width="2"/><text x="86" y="${GY - 78}" font-size="15" font-weight="900" fill="#c2305f" text-anchor="middle" font-family="Malgun Gothic,sans-serif">문 방 구</text>`;
      props += `<g><rect x="190" y="${GY - 36}" width="26" height="40" rx="4" fill="#4bb8ff"/><circle cx="203" cy="${GY - 24}" r="9" fill="#e8f6ff"/><circle cx="198" cy="${GY - 26}" r="3" fill="#ff5d8f"/><circle cx="207" cy="${GY - 22}" r="3" fill="#ffd24a"/><rect x="222" y="${GY - 36}" width="26" height="40" rx="4" fill="#ff5d8f"/><circle cx="235" cy="${GY - 24}" r="9" fill="#ffe8f0"/><circle cx="231" cy="${GY - 22}" r="3" fill="#5dff9a"/></g>`;
      props += `<text x="300" y="${GY - 20}" font-size="13" font-weight="900" fill="#fff" text-anchor="middle" stroke="#c2305f" stroke-width="3" paint-order="stroke" font-family="Malgun Gothic,sans-serif">100원 뽑기!</text>`;
    }
    if (stage === 3) { // 운동장: 학교, 국기봉, 골대
      props += `<rect x="150" y="${GY - 64}" width="190" height="64" fill="#e9dcc2"/><rect x="150" y="${GY - 72}" width="190" height="10" fill="#a45a3a"/>`;
      for (let i = 0; i < 6; i++) props += `<rect x="${160 + i * 30}" y="${GY - 54}" width="18" height="22" fill="#8fc4ff"/>`;
      props += `<rect x="46" y="${GY - 80}" width="4" height="84" fill="#777"/><path class="flag" d="M50,${GY - 78} h34 v20 h-34z" fill="#fff" stroke="#d62839" stroke-width="3"/>`;
    }
    if (stage === 4) { // 비 온 뒤 골목: 가로등, 전선
      props += `<path d="M0,40 Q190,76 375,34" stroke="#0b0e1c" stroke-width="2" fill="none"/><path d="M0,58 Q190,92 375,52" stroke="#0b0e1c" stroke-width="2" fill="none"/>`;
      props += `<rect x="322" y="${GY - 90}" width="5" height="100" fill="#0b0e1c"/><path d="M324,${GY - 90} h-30" stroke="#0b0e1c" stroke-width="4"/><ellipse cx="294" cy="${GY - 84}" rx="12" ry="5" fill="#ffe9a0"/><path class="lamp" d="M280,${GY - 80} L268,${GY + 10} H320 L308,${GY - 80}Z" fill="#ffe9a0" opacity=".25"/>`;
    }
    if (stage === 5) { // 동네짱: 가로등 + 낙서
      props += `<rect x="40" y="${GY - 100}" width="6" height="110" fill="#1a0f28"/><path d="M43,${GY - 100} h30" stroke="#1a0f28" stroke-width="4"/><ellipse cx="73" cy="${GY - 94}" rx="12" ry="5" fill="#ffe9a0"/><path class="lamp" d="M60,${GY - 90} L46,${GY + 10} H100 L86,${GY - 90}Z" fill="#ffe9a0" opacity=".28"/>`;
      props += `<rect x="250" y="${GY - 70}" width="110" height="74" fill="#2a1646"/><text x="305" y="${GY - 30}" font-size="38" text-anchor="middle">👑</text><text x="305" y="${GY - 8}" font-size="11" font-weight="900" fill="#ff6b8a" text-anchor="middle" font-family="Malgun Gothic,sans-serif">골목대장 대철</text>`;
    }
    // 땅 + 원근 + 질감
    const r = rnd(stage * 7 + 1);
    if (stage === 0) for (let i = 0; i < 90; i++) gtex += `<circle cx="${r() * 375}" cy="${GY + 6 + r() * 170}" r="${0.8 + r() * 1.4}" fill="#8a6a3a" opacity=".35"/>`;
    if (stage === 1 || stage === 3 || stage === 5) { for (let i = 0; i < 9; i++) gtex += `<line x1="${r() * 375}" y1="${GY + 10 + r() * 160}" x2="${r() * 375}" y2="${GY + 10 + r() * 170}" stroke="#000" stroke-width=".7" opacity=".16"/>`; for (let i = 0; i < 40; i++) gtex += `<circle cx="${r() * 375}" cy="${GY + 6 + r() * 170}" r="1.2" fill="#000" opacity=".1"/>`; }
    if (stage === 2) for (let i = 0; i < 18; i++) gtex += `<line x1="${i * 24 - 30}" y1="${GY}" x2="${(i - 9) * 90 + 188}" y2="330" stroke="#8a3a0a" stroke-width="2" opacity=".28"/>` + `<line x1="0" y1="${GY + i * i * 0.6 + 6}" x2="375" y2="${GY + i * i * 0.6 + 6}" stroke="#8a3a0a" stroke-width="1.5" opacity=".25"/>`;
    if (stage === 4) gtex += `<ellipse cx="90" cy="250" rx="60" ry="12" fill="#8fb4ff" opacity=".3"/><ellipse cx="290" cy="200" rx="46" ry="9" fill="#8fb4ff" opacity=".3"/><ellipse cx="200" cy="290" rx="80" ry="14" fill="#ffe9a0" opacity=".15"/>`;
    const lampGlow = (stage === 4 || stage === 5) ? `<ellipse cx="${stage === 5 ? 70 : 300}" cy="${GY + 50}" rx="90" ry="24" fill="#ffe9a0" opacity=".14"/>` : '';
    return `<svg viewBox="0 0 375 330" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" class="scene-svg">
<defs><linearGradient id="${id}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sk[0]}"/><stop offset=".55" stop-color="${sk[1]}"/><stop offset="1" stop-color="${sk[2]}"/></linearGradient>
<linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${gr[0]}"/><stop offset="1" stop-color="${gr[1]}"/></linearGradient></defs>
<rect width="375" height="${GY + 4}" fill="url(#${id}k)"/>${far}${mid}${props}
<rect y="${GY}" width="375" height="${330 - GY}" fill="url(#${id}g)"/>${gtex}${lampGlow}
<rect y="${GY}" width="375" height="5" fill="#000" opacity=".18"/>
</svg>`;
  }

  // 타이틀 장면 (노을 + 골목 + 전봇대)
  function titleBg() {
    return `<svg viewBox="0 0 375 812" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" class="title-svg">
<defs><linearGradient id="tk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b1b5e"/><stop offset=".35" stop-color="#c2305f"/><stop offset=".62" stop-color="#ff8a3d"/><stop offset="1" stop-color="#ffd27a"/></linearGradient></defs>
<rect width="375" height="812" fill="url(#tk)"/>
<circle cx="188" cy="470" r="110" fill="#fff0a0" opacity=".9"/><circle cx="188" cy="470" r="150" fill="#fff" opacity=".12"/>
${buildings(77, 560, 9, '#2a1646', '#ffe9a0', .45)}
${buildings(31, 620, 8, '#1a0e30', '#ffcf6b', .35)}
<g stroke="#10081c" stroke-width="3" fill="none"><path d="M0,330 Q190,390 375,320"/><path d="M0,352 Q190,414 375,344"/><path d="M0,372 Q190,430 375,366"/></g>
<rect x="30" y="230" width="9" height="400" fill="#10081c"/><rect x="12" y="260" width="46" height="5" fill="#10081c"/><rect x="16" y="282" width="38" height="5" fill="#10081c"/>
<rect x="330" y="280" width="9" height="360" fill="#10081c"/><rect x="312" y="310" width="46" height="5" fill="#10081c"/>
<rect y="620" width="375" height="192" fill="#2c2030"/><rect y="620" width="375" height="4" fill="#000" opacity=".3"/>
</svg>`;
  }

  root.Art = { card, cardFace, cardBack, kid, ME, scene, titleBg };
})(typeof window !== 'undefined' ? window : globalThis);
