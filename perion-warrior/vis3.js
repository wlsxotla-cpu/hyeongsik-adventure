/* 페리온 전사 — 비주얼 3: 새 지역 9개 테마 배경 + 마을 장식 (모두 차분한 톤: 대비·움직임을 줄여 눈이 편하게) */
(function (root) {
  'use strict';
  const A = root.Art; if (!A || !A._v) return;
  const V = A._v, TAU = Math.PI * 2, seeded = A.seeded, shade = A.shade, rrect = A.rrect, hash = V.hash, mkLayer = V.mkLayer, puff = V.puff, haze = V.haze, mount = V.mount;
  const OUT = '#2b1c14';
  function fs(c, fill, lw) { c.fillStyle = fill; c.fill(); c.lineWidth = lw || 2; c.strokeStyle = OUT; c.lineJoin = 'round'; c.stroke(); }
  const ST = {};
  // 공용: 하늘 그라데이션 + 시차 레이어 + 동적 요소(dyn)로 customBg 만들기
  function build(map, vw, vh, th, spec) {
    const H = Math.max(vh + 120, map.h), gy = map.plats[0].y, rnd = seeded(map.w * 11 + 3), layers = [];
    const sky = mkLayer(8, H, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, th.sky[0]); g.addColorStop(0.55, th.sky[1]); g.addColorStop(1, th.sky[2]); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    for (const [f, fn] of spec.layers(gy, rnd, th, H)) layers.push({ f, cv: mkLayer(map.w * f + vw + 80, H, (c, w, h) => fn(c, w, h)) });
    return { draw(c, camX, camY, vw2, vh2, t) {
      c.drawImage(sky, 0, 0, 8, H, 0, -camY, vw2, H); if (spec.pre) spec.pre(c, vw2, vh2, t, camY, gy);
      for (const ly of layers) { let sx = camX * ly.f, dx = 0; if (sx < 0) { dx = -sx; sx = 0; } const sw = Math.min(vw2 - dx, ly.cv.width - sx); if (sw > 0) c.drawImage(ly.cv, sx, Math.max(0, camY), sw, vh2, dx, 0, sw, vh2); }
      if (spec.post) spec.post(c, vw2, vh2, t, camY, gy);
    } };
  }
  const sun = (c, x, y, r, col) => { const g = c.createRadialGradient(x, y, 2, x, y, r); g.addColorStop(0, col + 'f0'); g.addColorStop(0.35, col + '66'); g.addColorStop(1, col + '00'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); };
  // 장난감 도시: 파스텔 블록 탑 + 줄무늬 천막 + 천천히 뜨는 풍선
  ST.toy = (map, vw, vh, th) => build(map, vw, vh, th, {
    layers: (gy, rnd) => [[0.1, (c, w) => { mount(c, w, gy - 100, 120, 260, rnd, '#f4c8dc', null, 0); haze(c, w, gy - 260, gy + 30, '#ffe8f4', 0.15, 0.3); }],
      [0.3, (c, w) => { const cols = ['#f08a9a', '#ffd070', '#7ac0f0', '#a0d890', '#c8a0f0']; for (let x = 20; x < w; x += 70 + rnd() * 90) { let y = gy; const n = 3 + ((rnd() * 4) | 0), bw = 36 + rnd() * 30; for (let k = 0; k < n; k++) { c.fillStyle = cols[(((x / 70) | 0) + k) % cols.length]; c.fillRect(x, y - 30, bw, 30); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x, y - 30, bw, 4); c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(x + bw - 6, y - 30, 6, 30); y -= 30; } } haze(c, w, gy - 200, gy + 40, '#fff0f4', 0.12, 0.28); }],
      [0.55, (c, w) => { for (let x = 30; x < w; x += 230 + rnd() * 160) { const col = ['#e05a7a', '#5a9ae0', '#f0b030'][((x / 230) | 0) % 3]; c.beginPath(); c.moveTo(x - 46, gy - 4); c.lineTo(x, gy - 62); c.lineTo(x + 46, gy - 4); c.closePath(); c.fillStyle = col; c.fill(); c.fillStyle = 'rgba(255,255,255,.55)'; for (let k = -1; k <= 1; k += 2) { c.beginPath(); c.moveTo(x + k * 14, gy - 4); c.lineTo(x, gy - 62); c.lineTo(x + k * 28, gy - 4); c.closePath(); c.fill(); } } }]],
    pre: (c, vw, vh, t) => { for (let i = 0; i < 6; i++) { const k = (t * 0.02 + hash(i)) % 1, x = hash(i + 3) * vw, y = vh * (1.05 - k * 1.2), col = ['#f08a9a', '#7ac0f0', '#ffd070'][i % 3]; c.strokeStyle = 'rgba(80,60,60,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y + 16); c.lineTo(x + Math.sin(t + i) * 3, y + 40); c.stroke(); c.beginPath(); c.ellipse(x, y, 10, 13, 0, 0, TAU); c.fillStyle = col; c.globalAlpha = 0.8; c.fill(); c.globalAlpha = 1; } },
  });
  // 바닷속: 햇살 줄기, 산호 실루엣, 천천히 지나가는 물고기 그림자
  ST.ocean = (map, vw, vh, th) => build(map, vw, vh, th, {
    layers: (gy, rnd) => [[0.12, (c, w) => { c.fillStyle = 'rgba(20,70,110,.55)'; for (let x = 0; x < w; x += 140 + rnd() * 120) { const hh = 70 + rnd() * 90; c.beginPath(); c.moveTo(x, gy + 10); c.quadraticCurveTo(x + 30, gy - hh, x + 70, gy + 10); c.fill(); } haze(c, w, gy - 260, gy + 30, '#4ab0d0', 0.1, 0.3); }],
      [0.34, (c, w) => { for (let x = 10; x < w; x += 80 + rnd() * 90) { const col = ['#e07a8a', '#e0a070', '#c070b0'][((x / 80) | 0) % 3]; c.strokeStyle = col; c.globalAlpha = 0.5; c.lineWidth = 6; c.lineCap = 'round'; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(x + k * 10, gy); c.quadraticCurveTo(x + k * 14 - 14, gy - 40, x + k * 8 - 8, gy - 60 - rnd() * 40); c.stroke(); } c.globalAlpha = 1; } }],
      [0.58, (c, w) => { c.strokeStyle = 'rgba(30,110,90,.7)'; c.lineWidth = 3; c.lineCap = 'round'; for (let x = 0; x < w; x += 40 + rnd() * 50) { const hh = 40 + rnd() * 60; c.beginPath(); c.moveTo(x, gy + 6); c.bezierCurveTo(x - 10, gy - hh * 0.4, x + 12, gy - hh * 0.7, x, gy - hh); c.stroke(); } }]],
    pre: (c, vw, vh, t) => { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { const x0 = vw * (0.1 + i * 0.2) + Math.sin(t * 0.2 + i) * 14, a = 0.05 + 0.02 * Math.sin(t * 0.5 + i); c.fillStyle = `rgba(190,240,255,${a})`; c.beginPath(); c.moveTo(x0, 0); c.lineTo(x0 + 30, 0); c.lineTo(x0 - 80, vh); c.lineTo(x0 - 150, vh); c.closePath(); c.fill(); } c.restore(); },
    post: (c, vw, vh, t) => { c.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 12; i++) { const k = (t * 0.07 + hash(i)) % 1, x = hash(i + 9) * vw + Math.sin(t + i) * 6, y = vh * (1 - k); c.globalAlpha = 0.5 * (1 - k); c.beginPath(); c.arc(x, y, 1 + hash(i + 2) * 2, 0, TAU); c.fill(); } c.globalAlpha = 1; for (let i = 0; i < 3; i++) { const x = ((t * (14 + i * 6) + hash(i) * vw) % (vw + 80)) - 40, y = vh * (0.22 + i * 0.16); c.fillStyle = 'rgba(15,50,90,.35)'; c.beginPath(); c.ellipse(x, y, 14, 5, 0, 0, TAU); c.moveTo(x - 12, y); c.lineTo(x - 22, y - 5); c.lineTo(x - 22, y + 5); c.fill(); } },
  });
  // 용의 둥지: 황금빛 산, 이끼 낀 암봉, 느리게 나는 용 실루엣
  ST.dragon = (map, vw, vh, th) => build(map, vw, vh, th, {
    layers: (gy, rnd) => [[0.1, (c, w) => { mount(c, w, gy - 130, 190, 240, rnd, '#7aa86a', null, 0); haze(c, w, gy - 320, gy + 30, '#ffe8a0', 0.1, 0.3); }],
      [0.28, (c, w) => { for (let x = 60; x < w; x += 200 + rnd() * 160) { const hh = 90 + rnd() * 100; c.beginPath(); c.moveTo(x - 30, gy + 8); c.lineTo(x - 12, gy - hh); c.lineTo(x + 8, gy - hh * 0.8); c.lineTo(x + 34, gy + 8); c.closePath(); c.fillStyle = '#4a7a50'; c.fill(); c.fillStyle = '#78b060'; c.fillRect(x - 14, gy - hh - 2, 24, 5); } }],
      [0.55, (c, w) => { for (let x = 0; x < w; x += 70 + rnd() * 70) { const hh = 50 + rnd() * 60; c.fillStyle = '#2f5a36'; c.fillRect(x + 8, gy - hh * 0.5, 7, hh * 0.5 + 6); c.beginPath(); c.arc(x + 11, gy - hh * 0.55, 20 + rnd() * 10, 0, TAU); c.fillStyle = '#3a6a40'; c.fill(); } }]],
    pre: (c, vw, vh, t) => { sun(c, vw * 0.75, vh * 0.2, 110, '#fff0b0'); },
    post: (c, vw, vh, t) => { for (let i = 0; i < 2; i++) { const x = ((t * (9 + i * 4) + hash(i + 5) * vw) % (vw + 120)) - 60, y = vh * (0.18 + i * 0.12) + Math.sin(t * 0.8 + i) * 5, fl = Math.sin(t * 2.4 + i) * 6; c.strokeStyle = 'rgba(40,70,50,.5)'; c.lineWidth = 2.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 20, y - fl); c.quadraticCurveTo(x - 8, y - 6, x, y); c.quadraticCurveTo(x + 8, y - 6, x + 20, y - fl); c.moveTo(x, y); c.lineTo(x + 14, y + 4); c.stroke(); } },
  });
  // 대나무 숲(무릉): 안개 낀 봉우리와 대나무 기둥
  ST.bamboo = (map, vw, vh, th) => build(map, vw, vh, th, {
    layers: (gy, rnd) => [[0.1, (c, w) => { mount(c, w, gy - 140, 200, 250, rnd, '#9ab890', null, 0); haze(c, w, gy - 320, gy + 30, '#f4f6e0', 0.2, 0.4); }],
      [0.3, (c, w) => { for (let x = 0; x < w; x += 22 + rnd() * 26) { c.fillStyle = 'rgba(90,140,90,.7)'; c.fillRect(x, 0, 6 + rnd() * 4, 1000); c.fillStyle = 'rgba(60,110,70,.8)'; for (let y = gy - 400 + rnd() * 30; y < gy; y += 46 + rnd() * 18) c.fillRect(x - 1, y, 9, 3); } haze(c, w, gy - 260, gy + 30, '#e8f0d0', 0.15, 0.35); }],
      [0.55, (c, w) => { for (let x = 0; x < w; x += 54 + rnd() * 60) { c.fillStyle = 'rgba(46,96,56,.85)'; c.fillRect(x, 0, 10, 1000); c.fillStyle = 'rgba(28,70,40,.9)'; for (let y = gy - 400 + rnd() * 30; y < gy; y += 52 + rnd() * 20) c.fillRect(x - 1, y, 12, 4); c.fillStyle = 'rgba(70,130,70,.8)'; for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(x + 20 + k * 6, gy - 140 - k * 50, 16, 4, 0.5, 0, TAU); c.fill(); } } }]],
    post: (c, vw, vh, t) => { const g = c.createLinearGradient(0, vh * 0.6, 0, vh); g.addColorStop(0, 'rgba(240,248,230,0)'); g.addColorStop(1, 'rgba(240,248,230,.22)'); c.fillStyle = g; c.fillRect(0, vh * 0.6, vw, vh * 0.4); },
  });
  // 사막: 큰 해, 모래 언덕, 피라미드
  ST.desert = (map, vw, vh, th) => build(map, vw, vh, th, {
    layers: (gy, rnd) => [[0.08, (c, w) => { for (let x = 100; x < w; x += 600 + rnd() * 400) { c.beginPath(); c.moveTo(x - 90, gy + 8); c.lineTo(x, gy - 110); c.lineTo(x + 90, gy + 8); c.closePath(); c.fillStyle = '#d8b070'; c.fill(); c.beginPath(); c.moveTo(x, gy - 110); c.lineTo(x + 90, gy + 8); c.lineTo(x + 20, gy + 8); c.closePath(); c.fillStyle = '#c09858'; c.fill(); } haze(c, w, gy - 200, gy + 30, '#fff0c8', 0.2, 0.4); }],
      [0.26, (c, w) => { c.beginPath(); c.moveTo(0, gy + 10); for (let x = 0; x <= w; x += 20) c.lineTo(x, gy - 40 - Math.sin(x * 0.006 + 1) * 40 - Math.sin(x * 0.017) * 14); c.lineTo(w, gy + 10); c.closePath(); c.fillStyle = '#e0bc78'; c.fill(); }],
      [0.5, (c, w) => { c.beginPath(); c.moveTo(0, gy + 10); for (let x = 0; x <= w; x += 20) c.lineTo(x, gy - 10 - Math.sin(x * 0.009 + 2) * 26); c.lineTo(w, gy + 10); c.closePath(); c.fillStyle = '#c8a060'; c.fill(); for (let x = 60; x < w; x += 300 + rnd() * 260) { c.fillStyle = '#6a8a48'; c.fillRect(x, gy - 46, 6, 46); c.fillRect(x - 8, gy - 34, 5, 14); c.fillRect(x + 9, gy - 30, 5, 12); } }]],
    pre: (c, vw, vh) => { sun(c, vw * 0.7, vh * 0.2, 130, '#fff6c0'); },
    post: (c, vw, vh, t) => { c.fillStyle = 'rgba(240,200,130,.18)'; for (let i = 0; i < 4; i++) { const x = ((i * 220 + t * 14) % (vw + 240)) - 120; c.fillRect(x, vh * 0.55 + i * 18, 190, 8); } },
  });
  // 연금술 도시: 높은 탑, 은은한 룬 문양, 떠오르는 방울
  ST.alchemy = (map, vw, vh, th) => build(map, vw, vh, th, {
    layers: (gy, rnd) => [[0.1, (c, w) => { mount(c, w, gy - 120, 150, 230, rnd, '#4a2a78', null, 0); haze(c, w, gy - 300, gy + 30, '#a070d0', 0.08, 0.3); }],
      [0.3, (c, w) => { for (let x = 40; x < w; x += 150 + rnd() * 120) { const hh = 110 + rnd() * 130; c.fillStyle = '#34205a'; c.fillRect(x, gy - hh, 40, hh + 10); c.beginPath(); c.moveTo(x - 6, gy - hh); c.lineTo(x + 20, gy - hh - 40); c.lineTo(x + 46, gy - hh); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,220,140,.8)'; for (let y = gy - hh + 18; y < gy - 8; y += 30) c.fillRect(x + 14 + rnd() * 6, y, 6, 10); } }],
      [0.55, (c, w) => { for (let x = 30; x < w; x += 260 + rnd() * 200) { c.beginPath(); c.arc(x, gy - 28, 26, 0, TAU); c.fillStyle = 'rgba(80,200,180,.5)'; c.fill(); c.fillRect(x - 6, gy - 66, 12, 20); c.strokeStyle = 'rgba(160,240,220,.6)'; c.lineWidth = 2; c.beginPath(); c.arc(x, gy - 28, 26, 0, TAU); c.stroke(); } }]],
    post: (c, vw, vh, t) => { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(190,150,255,.16)'; c.lineWidth = 1.4; for (let i = 0; i < 3; i++) { const x = vw * (0.2 + i * 0.3), y = vh * 0.35 + Math.sin(t * 0.4 + i) * 8, r = 34 + i * 6; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); for (let k = 0; k < 6; k++) { const a = t * 0.15 + k * TAU / 6; c.beginPath(); c.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); c.lineTo(x + Math.cos(a + 2.1) * r, y + Math.sin(a + 2.1) * r); c.stroke(); } } c.restore(); },
  });
  // 시간의 신전: 거대한 톱니바퀴와 시계 (천천히 회전)
  const gear = (c, x, y, r, n, rot, col) => { c.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr = i % 2 ? r * 0.86 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fillStyle = col; c.fill(); c.beginPath(); c.arc(x, y, r * 0.35, 0, TAU); c.fillStyle = 'rgba(0,0,0,.18)'; c.fill(); };
  ST.clock = (map, vw, vh, th) => build(map, vw, vh, th, {
    layers: (gy, rnd) => [[0.1, (c, w) => { mount(c, w, gy - 110, 150, 240, rnd, '#7a6270', null, 0); haze(c, w, gy - 300, gy + 30, '#f0d8a0', 0.1, 0.3); }],
      [0.32, (c, w) => { for (let x = 80; x < w; x += 340 + rnd() * 200) { const hh = 130 + rnd() * 90; c.fillStyle = '#5a4a58'; c.fillRect(x, gy - hh, 56, hh + 10); c.fillRect(x - 8, gy - hh - 8, 72, 10); c.beginPath(); c.arc(x + 28, gy - hh + 34, 20, 0, TAU); c.fillStyle = '#e8d8a8'; c.fill(); c.strokeStyle = '#3a2a30'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 28, gy - hh + 34); c.lineTo(x + 28, gy - hh + 22); c.moveTo(x + 28, gy - hh + 34); c.lineTo(x + 38, gy - hh + 38); c.stroke(); } }]],
    pre: (c, vw, vh, t, camY, gy) => { sun(c, vw * 0.5, vh * 0.15, 160, '#ffe8a8'); c.globalAlpha = 0.5; gear(c, vw * 0.18, vh * 0.28, 70, 14, t * 0.05, '#7a6a78'); gear(c, vw * 0.3, vh * 0.42, 46, 10, -t * 0.075, '#8a7a86'); gear(c, vw * 0.82, vh * 0.3, 80, 16, -t * 0.045, '#7a6a78'); c.globalAlpha = 1; },
  });
  // 증기 도시: 공장 굴뚝과 천천히 피어오르는 연기
  ST.steam = (map, vw, vh, th) => build(map, vw, vh, th, {
    layers: (gy, rnd) => [[0.1, (c, w) => { for (let x = 0; x < w; x += 70 + rnd() * 70) { const hh = 50 + rnd() * 90; c.fillStyle = '#8a7a6a'; c.fillRect(x, gy - hh, 50, hh + 10); } haze(c, w, gy - 260, gy + 30, '#d8c8a8', 0.2, 0.4); }],
      [0.3, (c, w) => { for (let x = 30; x < w; x += 170 + rnd() * 120) { const hh = 90 + rnd() * 100; c.fillStyle = '#5e5042'; c.fillRect(x, gy - hh, 70, hh + 10); c.fillStyle = '#4a3e34'; c.fillRect(x + 50, gy - hh - 50, 14, 50); c.fillStyle = 'rgba(255,200,120,.7)'; for (let k = 0; k < 3; k++) c.fillRect(x + 8 + k * 20, gy - hh + 14, 10, 10); } }],
      [0.55, (c, w) => { c.strokeStyle = '#3a3028'; c.lineWidth = 7; for (let x = 0; x < w; x += 320 + rnd() * 200) { c.beginPath(); c.moveTo(x, gy - 60); c.lineTo(x + 120, gy - 60); c.lineTo(x + 120, gy + 10); c.stroke(); } }]],
    post: (c, vw, vh, t) => { for (let i = 0; i < 5; i++) { const k = (t * 0.05 + hash(i)) % 1, x = vw * (0.1 + hash(i + 4) * 0.8) + Math.sin(t * 0.6 + i) * 10, y = vh * 0.5 - k * vh * 0.5; c.fillStyle = `rgba(90,80,76,${0.18 * (1 - k)})`; c.beginPath(); c.arc(x, y, 14 + k * 30, 0, TAU); c.fill(); } },
  });
  // 우주: 별, 행성, 성운, 가끔 지나가는 유성
  ST.space = (map, vw, vh, th) => { const stars = Array.from({ length: 70 }, (_, i) => [hash(i + 1), hash(i + 90), hash(i + 5) * 1.8 + 0.5]); return build(map, vw, vh, th, {
    layers: (gy, rnd) => [[0.06, (c, w, h) => { for (let i = 0; i < w / 260; i++) { const x = rnd() * w, y = gy - 120 - rnd() * 180, r = 60 + rnd() * 80, g = c.createRadialGradient(x, y, 4, x, y, r); const col = ['150,100,255', '90,150,255', '200,110,230'][i % 3]; g.addColorStop(0, `rgba(${col},.22)`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); } }],
      [0.2, (c, w) => { const x = w * 0.6, y = gy - 190, r = 70, g = c.createRadialGradient(x - 20, y - 20, 8, x, y, r); g.addColorStop(0, '#9a8ae0'); g.addColorStop(1, '#2a2068'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = 'rgba(200,190,255,.4)'; c.lineWidth = 5; c.beginPath(); c.ellipse(x, y, r * 1.6, r * 0.34, -0.3, 0, TAU); c.stroke(); }],
      [0.5, (c, w) => { c.fillStyle = '#1a1440'; for (let x = 0; x < w; x += 120 + rnd() * 90) { const hh = 20 + rnd() * 40; c.beginPath(); c.moveTo(x, gy + 8); c.lineTo(x + 20, gy - hh); c.lineTo(x + 50, gy + 8); c.closePath(); c.fill(); } }]],
    pre: (c, vw, vh, t) => { for (const s of stars) { c.globalAlpha = 0.35 + 0.4 * Math.abs(Math.sin(t * 0.9 + s[0] * 20)); c.fillStyle = '#fff'; c.fillRect(s[0] * vw, s[1] * vh * 0.8, s[2], s[2]); } c.globalAlpha = 1; },
    post: (c, vw, vh, t) => { const k = (t * 0.12) % 6; if (k < 1) { const x = vw * (1 - k) * 1.1, y = vh * 0.1 + k * vh * 0.35; c.strokeStyle = `rgba(220,230,255,${0.7 * (1 - k)})`; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 50, y - 22); c.stroke(); } },
  }); };
  A._bgStyles = ST;

  /* ───────── 마을 장식: 팔레트(map.deco)로 NPC 위치에 맞춰 건물을 세운다 ───────── */
  const baseDecor = A.extraDecor;
  function crate(c, x, gy, w) { c.beginPath(); rrect(c, x, gy - w, w, w, 3); fs(c, '#b8844a', 2); c.strokeStyle = OUT; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x, gy - w); c.lineTo(x + w, gy); c.moveTo(x + w, gy - w); c.lineTo(x, gy); c.stroke(); }
  function house(c, x, base, w, h, wall, roof, label, dome) {
    c.beginPath(); rrect(c, x, base - h, w, h, 4); fs(c, wall, 2.4); c.fillStyle = 'rgba(0,0,40,.1)'; c.fillRect(x + w * 0.62, base - h + 2, w * 0.36, h - 4);
    if (dome) { c.beginPath(); c.arc(x + w / 2, base - h, w * 0.46, Math.PI, 0); c.closePath(); fs(c, roof, 2.6); c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.ellipse(x + w * 0.38, base - h - w * 0.2, w * 0.1, w * 0.05, -0.6, 0, TAU); c.fill(); }
    else { c.beginPath(); c.moveTo(x - 8, base - h); c.lineTo(x + w / 2, base - h - 34); c.lineTo(x + w + 8, base - h); c.closePath(); fs(c, roof, 2.4); c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.moveTo(x + w / 2, base - h - 34); c.lineTo(x + w + 8, base - h); c.lineTo(x + w / 2 + 4, base - h); c.closePath(); c.fill(); }
    const wn = Math.max(1, Math.floor(w / 70)); for (let i = 0; i < wn; i++) { const wx = x + (w / (wn + 1)) * (i + 1) - 11; c.beginPath(); rrect(c, wx, base - h + 18, 22, 26, 5); fs(c, '#ffe9a8', 1.8); c.strokeStyle = OUT; c.lineWidth = 1.2; c.beginPath(); c.moveTo(wx + 11, base - h + 18); c.lineTo(wx + 11, base - h + 44); c.stroke(); }
    c.beginPath(); rrect(c, x + w / 2 - 13, base - 40, 26, 40, 4); fs(c, '#8a5a32', 2);
    if (label) { c.beginPath(); rrect(c, x + w / 2 - 30, base - h + 1, 60, 16, 5); fs(c, roof, 1.8); c.font = 'bold 11px sans-serif'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText(label, x + w / 2, base - h + 13); }
  }
  function lamp(c, x, gy) { c.strokeStyle = OUT; c.lineWidth = 5; c.beginPath(); c.moveTo(x, gy); c.lineTo(x, gy - 62); c.stroke(); c.strokeStyle = '#c8d0e0'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x, gy); c.lineTo(x, gy - 62); c.stroke(); c.beginPath(); c.arc(x, gy - 66, 7, 0, TAU); fs(c, '#fff4c0', 1.8); const g = c.createRadialGradient(x, gy - 66, 2, x, gy - 66, 26); g.addColorStop(0, 'rgba(255,240,170,.4)'); g.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = g; c.fillRect(x - 26, gy - 92, 52, 52); }
  A.extraDecor = function (c, map, rnd) {
    if (!(map.town && map.deco)) return baseDecor && baseDecor(c, map, rnd);
    const gy = map.plats[0].y, [wall, roofA, roofB] = map.deco;
    for (const n of map.npcs) {
      const base = n.y || gy, x = n.x - 100;
      if (n.role === 'inn') house(c, x, base, 200, 120, wall, roofA, '여관', true);
      else if (n.role === 'shop' && n.shopKind === 'potion') house(c, x, base, 190, 108, wall, roofB, '잡화점');
      else if (n.role === 'shop' && n.shopKind === 'smith') house(c, x - 30, base, 240, 104, shade(wall, -0.1), '#6a6e7c', '대장간');
      else if (n.role === 'shop') house(c, x, base, 200, 116, wall, roofA, '주문서', true);
      else if (n.role === 'quest') house(c, x - 20, base, 240, 132, wall, roofB, '수호대', true);
      else if (n.role === 'travel') { c.strokeStyle = OUT; c.lineWidth = 6; c.beginPath(); c.moveTo(n.x - 70, base); c.lineTo(n.x - 70, base - 96); c.stroke(); c.strokeStyle = '#a0703c'; c.lineWidth = 3; c.beginPath(); c.moveTo(n.x - 70, base); c.lineTo(n.x - 70, base - 96); c.stroke(); c.beginPath(); rrect(c, n.x - 70, base - 100, 96, 22, 5); fs(c, roofB, 2); c.font = 'bold 11px sans-serif'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText('🧭 이동', n.x - 22, base - 85); }
      else if (n.role === 'master4') { const hx = n.x - 120; c.beginPath(); rrect(c, hx, base - 130, 240, 130, 4); fs(c, wall, 2.4); for (let i = 0; i < 5; i++) { c.beginPath(); rrect(c, hx + 12 + i * 48, base - 128, 16, 126, 3); fs(c, '#fff', 1.6); } c.beginPath(); c.moveTo(hx - 10, base - 130); c.lineTo(hx + 120, base - 186); c.lineTo(hx + 250, base - 130); c.closePath(); fs(c, roofA, 2.4); }
    }
    for (let x = 300; x < map.w; x += 420) lamp(c, x, gy);
    for (const x of [140, 2600]) { c.strokeStyle = OUT; c.lineWidth = 5; c.beginPath(); c.moveTo(x, gy); c.lineTo(x, gy - 90); c.stroke(); c.beginPath(); c.moveTo(x, gy - 86); c.lineTo(x + 32, gy - 78); c.lineTo(x + 26, gy - 66); c.lineTo(x + 32, gy - 54); c.lineTo(x, gy - 58); c.closePath(); fs(c, roofA, 1.8); }
    for (const x of [420, 780, 1180, 1980]) crate(c, x, gy, 26);
  };
})(typeof window !== 'undefined' ? window : globalThis);
