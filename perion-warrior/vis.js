/* 페리온 전사 — 비주얼 강화 (배경·지형 장식·분위기 효과)
   art.js 가 먼저 로드된 뒤 Art 에 연결된다. 모두 캔버스 2D 로 그린 그림이라 외부 파일이 필요 없다. */
(function (root) {
  'use strict';
  const A = root.Art; if (!A) return;
  const TAU = Math.PI * 2, shade = A.shade, seeded = A.seeded;
  const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  function mkLayer(w, h, fn) { const cv = document.createElement('canvas'); cv.width = Math.max(2, Math.ceil(w)); cv.height = Math.max(2, Math.ceil(h)); fn(cv.getContext('2d'), cv.width, cv.height); return cv; }
  const lerp = (a, b, k) => a + (b - a) * k;
  const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

  /* ───────── 공용 그리기 도구 ───────── */
  function puff(c, x, y, s, a, tint) { // 부드러운 구름 한 덩이
    const g = c.createRadialGradient(x, y - 5 * s, 2 * s, x, y, 28 * s); const t = tint || '236,246,255';
    g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(0.6, `rgba(${t},${a * 0.85})`); g.addColorStop(1, `rgba(${t},0)`);
    c.fillStyle = g; c.beginPath(); c.arc(x, y, 28 * s, 0, TAU); c.fill();
  }
  function cloudBank(c, x0, x1, y, s, a, rnd, tint) { for (let x = x0; x < x1; x += 20 * s) puff(c, x + rnd() * 16, y - rnd() * 12 * s, s * (0.8 + rnd() * 0.8), a, tint); }
  function mount(c, w, base, amp, step, rnd, fill, cap, capH) { // 능선 + (선택) 눈 덮인 봉우리
    c.beginPath(); c.moveTo(0, base + 400); let pts = []; for (let x = -step; x <= w + step; x += step) { const y = base - amp * (0.35 + rnd() * 0.65); pts.push([x, y]); }
    c.lineTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { const p0 = pts[i - 1], p1 = pts[i]; c.quadraticCurveTo((p0[0] + p1[0]) / 2 + (rnd() - 0.5) * step * 0.3, Math.min(p0[1], p1[1]) - amp * 0.18, p1[0], p1[1]); }
    c.lineTo(w + step, base + 400); c.closePath(); c.fillStyle = fill; c.fill();
    if (cap) { c.fillStyle = cap; for (let i = 1; i < pts.length - 1; i++) { const p = pts[i]; if (p[1] > base - amp * 0.55) continue; c.beginPath(); c.moveTo(p[0] - step * 0.22, p[1] + capH); c.lineTo(p[0] - step * 0.05, p[1] + capH * 0.4); c.lineTo(p[0], p[1]); c.lineTo(p[0] + step * 0.06, p[1] + capH * 0.5); c.lineTo(p[0] + step * 0.22, p[1] + capH); c.closePath(); c.fill(); } }
  }
  function haze(c, w, y0, y1, color, a0, a1) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, rgba(color, a0)); g.addColorStop(1, rgba(color, a1)); c.fillStyle = g; c.fillRect(0, y0, w, y1 - y0); }
  function island(c, x, y, w, rnd, pal) { // 떠 있는 섬: y = 윗면
    c.beginPath(); c.moveTo(x - w / 2, y); c.quadraticCurveTo(x - w * 0.38, y + w * 0.16, x - w * 0.16, y + w * 0.3); c.quadraticCurveTo(x - w * 0.04, y + w * 0.58, x + w * 0.1, y + w * 0.32); c.quadraticCurveTo(x + w * 0.36, y + w * 0.18, x + w / 2, y); c.closePath();
    const g = c.createLinearGradient(0, y, 0, y + w * 0.55); g.addColorStop(0, pal.rock1); g.addColorStop(1, pal.rock2); c.fillStyle = g; c.fill();
    c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x - w * 0.3, y + w * 0.12); c.lineTo(x - w * 0.12, y + w * 0.28); c.moveTo(x + w * 0.2, y + w * 0.1); c.lineTo(x + w * 0.08, y + w * 0.3); c.stroke();
    c.beginPath(); c.ellipse(x, y, w / 2, w * 0.075, 0, 0, TAU); c.fillStyle = pal.grass; c.fill(); c.beginPath(); c.ellipse(x, y - w * 0.012, w / 2 * 0.94, w * 0.055, 0, 0, TAU); c.fillStyle = shade(pal.grass, 0.18); c.fill();
    const n = 2 + ((w / 60) | 0); for (let i = 0; i < n; i++) { const tx = x + (rnd() - 0.5) * w * 0.7, ty = y - 1, th = 12 + rnd() * 18; c.fillStyle = '#5a4a3a'; c.fillRect(tx - 1, ty - th * 0.5, 2, th * 0.5); c.beginPath(); c.arc(tx, ty - th * 0.6, th * 0.42, 0, TAU); c.fillStyle = pal.tree; c.fill(); c.beginPath(); c.arc(tx - th * 0.12, ty - th * 0.7, th * 0.22, 0, TAU); c.fillStyle = shade(pal.tree, 0.25); c.fill(); }
    if (pal.tower && w > 160) { const tx = x + (rnd() - 0.5) * w * 0.3, th = 40 + rnd() * 26; c.fillStyle = '#f0f4fc'; c.fillRect(tx - 7, y - th, 14, th); c.fillStyle = '#d8e2f4'; c.fillRect(tx + 1, y - th, 6, th); c.beginPath(); c.moveTo(tx - 10, y - th); c.lineTo(tx, y - th - 18); c.lineTo(tx + 10, y - th); c.closePath(); c.fillStyle = pal.roof || '#6a9ae0'; c.fill(); c.fillStyle = '#ffe9a0'; c.fillRect(tx - 2, y - th * 0.7, 4, 7); }
  }

  /* ───────── 맞춤 배경 ───────── */
  const BG = {};
  // 하늘(오르비스·구름 정원·천상의 정원): 떠 있는 섬, 흰 탑, 구름 바다
  BG.sky = function (map, vw, vh, th) {
    const H = Math.max(vh + 120, map.h), gy = map.plats[0].y, rnd = seeded(map.w * 5 + 11), layers = [];
    const sky = mkLayer(8, H, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2f78e0'); g.addColorStop(0.45, '#62a8f2'); g.addColorStop(0.8, '#b4d8fa'); g.addColorStop(1, '#f4ecd8'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    const addL = (f, fn) => layers.push({ f, cv: mkLayer(map.w * f + vw + 80, H, fn) });
    addL(0.08, (c, w, h) => { const pal = { rock1: '#b8c8e8', rock2: '#8ea4d0', grass: '#a8d8c0', tree: '#8fc4b0', tower: true, roof: '#9ab8ec' }; for (let x = 60; x < w; x += 300 + rnd() * 220) island(c, x, gy - 250 - rnd() * 60, 150 + rnd() * 80, rnd, pal); haze(c, w, 0, h, '#cfe4ff', 0.12, 0.12); });
    addL(0.2, (c, w, h) => { for (let x = 40; x < w; x += 130 + rnd() * 110) { const th2 = 70 + rnd() * 90; c.fillStyle = 'rgba(244,248,255,.9)'; c.fillRect(x, gy - th2 - 20, 20, th2 + 40); c.fillStyle = 'rgba(210,224,248,.9)'; c.fillRect(x + 12, gy - th2 - 20, 8, th2 + 40); c.beginPath(); c.moveTo(x - 5, gy - th2 - 20); c.lineTo(x + 10, gy - th2 - 52); c.lineTo(x + 25, gy - th2 - 20); c.closePath(); c.fillStyle = '#8aaee8'; c.fill(); if (rnd() < 0.5) { c.fillStyle = 'rgba(255,230,150,.9)'; c.fillRect(x + 7, gy - th2 + 6, 5, 8); } }
      cloudBank(c, 0, w, gy - 6, 1.5, 0.9, rnd); });
    addL(0.38, (c, w, h) => { const pal = { rock1: '#d8e4f8', rock2: '#a8b8dc', grass: '#bfe4a8', tree: '#7ec490', tower: true, roof: '#e07a6a' }; for (let x = 120; x < w; x += 360 + rnd() * 260) island(c, x, gy - 150 - rnd() * 90, 120 + rnd() * 120, rnd, pal); cloudBank(c, 0, w, gy + 8, 2, 0.95, rnd); });
    addL(0.6, (c, w, h) => { cloudBank(c, 0, w, gy + 26, 2.6, 0.95, rnd); for (let x = 0; x < w; x += 340 + rnd() * 300) puff(c, x, gy - 40 - rnd() * 60, 1.6 + rnd() * 1.4, 0.55); });
    return {
      draw(c, camX, camY, vw2, vh2, t) {
        c.drawImage(sky, 0, 0, 8, H, 0, -camY, vw2, H);
        const g = c.createRadialGradient(vw2 * 0.8, vh2 * 0.15, 4, vw2 * 0.8, vh2 * 0.15, 150); g.addColorStop(0, 'rgba(255,252,220,.95)'); g.addColorStop(0.3, 'rgba(255,244,190,.5)'); g.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = g; c.fillRect(0, 0, vw2, vh2);
        // 광선
        c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { const x0 = vw2 * 0.8 - 40 + i * 20, a = 0.05 + 0.025 * Math.sin(t * 0.6 + i * 1.7); c.fillStyle = `rgba(255,246,200,${a})`; c.beginPath(); c.moveTo(x0, 0); c.lineTo(x0 + 18, 0); c.lineTo(x0 - 220 - i * 40, vh2); c.lineTo(x0 - 300 - i * 50, vh2); c.closePath(); c.fill(); } c.restore();
        // 흘러가는 구름 · 새
        for (let i = 0; i < 6; i++) { const x = ((hash(i) * (vw2 + 400) + t * (4 + i * 1.5)) % (vw2 + 400)) - 200, y = 26 + hash(i + 9) * (vh2 * 0.45); puff(c, x, y, 1.1 + hash(i + 3), 0.55); }
        for (let i = 0; i < 4; i++) { const x = ((hash(i + 20) * vw2 + t * (18 + i * 5)) % (vw2 + 80)) - 40, y = 40 + hash(i + 31) * 90 + Math.sin(t * 2 + i) * 4; c.strokeStyle = 'rgba(70,90,120,.55)'; c.lineWidth = 1.4; const fl = Math.sin(t * 9 + i * 2) * 3; c.beginPath(); c.moveTo(x - 6, y - fl); c.quadraticCurveTo(x - 2, y - 3, x, y); c.quadraticCurveTo(x + 2, y - 3, x + 6, y - fl); c.stroke(); }
        for (const ly of layers) { let sx = camX * ly.f, dx = 0; if (sx < 0) { dx = -sx; sx = 0; } const sw = Math.min(vw2 - dx, ly.cv.width - sx); if (sw > 0) c.drawImage(ly.cv, sx, Math.max(0, camY), sw, vh2, dx, 0, sw, vh2); }
      },
    };
  };
  // 바다(항구·배): 수평선, 일렁이는 파도, 돛단배, 갈매기
  BG.sea = function (map, vw, vh, th) {
    const H = Math.max(vh + 120, map.h), gy = map.plats[0].y, hy = gy - 78, rnd = seeded(map.w * 3 + 5);
    const sky = mkLayer(8, H, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, hy); g.addColorStop(0, '#3a98e8'); g.addColorStop(0.6, '#86c8f6'); g.addColorStop(1, '#fff0d0'); c.fillStyle = g; c.fillRect(0, 0, w, hy + 1); const g2 = c.createLinearGradient(0, hy, 0, h); g2.addColorStop(0, '#5ab4e8'); g2.addColorStop(0.5, '#2a86c4'); g2.addColorStop(1, '#14507e'); c.fillStyle = g2; c.fillRect(0, hy, w, h - hy); });
    const far = mkLayer(map.w * 0.1 + vw + 80, H, (c, w) => { c.fillStyle = '#a8c0d8'; for (let x = 100; x < w; x += 600 + rnd() * 400) { c.beginPath(); c.moveTo(x - 90, hy); c.quadraticCurveTo(x - 30, hy - 40 - rnd() * 24, x + 20, hy - 26); c.quadraticCurveTo(x + 60, hy - 34, x + 100, hy); c.closePath(); c.fill(); } cloudBank(c, 0, w, hy - 70, 1.6, 0.8, rnd); });
    const mid = mkLayer(map.w * 0.25 + vw + 80, H, (c, w) => { for (let x = 150; x < w; x += 700 + rnd() * 400) { const s = 0.8 + rnd() * 0.5; c.fillStyle = '#5a3a28'; c.beginPath(); c.moveTo(x - 24 * s, hy + 6); c.lineTo(x + 26 * s, hy + 6); c.lineTo(x + 16 * s, hy + 14 * s); c.lineTo(x - 14 * s, hy + 14 * s); c.closePath(); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x, hy - 40 * s); c.lineTo(x + 18 * s, hy + 2); c.lineTo(x, hy + 2); c.closePath(); c.fill(); c.fillStyle = '#f0e8d8'; c.beginPath(); c.moveTo(x - 2, hy - 34 * s); c.lineTo(x - 16 * s, hy + 2); c.lineTo(x - 2, hy + 2); c.closePath(); c.fill(); } });
    return {
      draw(c, camX, camY, vw2, vh2, t) {
        c.drawImage(sky, 0, 0, 8, H, 0, -camY, vw2, H);
        const sx0 = vw2 * 0.72, sy0 = hy - camY - 90; const g = c.createRadialGradient(sx0, sy0, 3, sx0, sy0, 120); g.addColorStop(0, 'rgba(255,252,225,1)'); g.addColorStop(0.2, 'rgba(255,240,180,.6)'); g.addColorStop(1, 'rgba(255,230,160,0)'); c.fillStyle = g; c.fillRect(0, 0, vw2, vh2);
        for (let i = 0; i < 5; i++) { const x = ((hash(i + 4) * (vw2 + 300) + t * (3 + i)) % (vw2 + 300)) - 150, y = 20 + hash(i + 7) * (hy - camY - 100); puff(c, x, y, 1 + hash(i) * 1.2, 0.6); }
        { let sx = camX * 0.1; c.drawImage(far, sx, Math.max(0, camY), Math.min(vw2, far.width - sx), vh2, 0, 0, Math.min(vw2, far.width - sx), vh2); sx = camX * 0.25; c.drawImage(mid, sx, Math.max(0, camY), Math.min(vw2, mid.width - sx), vh2, 0, 0, Math.min(vw2, mid.width - sx), vh2); }
        // 파도: 수평선 아래를 여러 겹 사인파로
        const yy = hy - camY; for (let k = 0; k < 9; k++) { const y0 = yy + 4 + k * k * 1.9 + k * 3, amp = 1 + k * 0.5, sp = 0.8 + k * 0.15; c.beginPath(); c.moveTo(0, y0); for (let x = 0; x <= vw2; x += 12) c.lineTo(x, y0 + Math.sin((x + camX * (0.2 + k * 0.05)) * 0.03 * (1 + k * 0.07) + t * sp + k) * amp); c.strokeStyle = `rgba(255,255,255,${0.1 + k * 0.045})`; c.lineWidth = 1 + k * 0.28; c.stroke(); }
        // 햇빛 반짝임
        c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 22; i++) { const x = sx0 - 90 + hash(i) * 180, y = yy + 8 + hash(i + 40) * 40, a = Math.max(0, Math.sin(t * 3 + i * 2.1)) * 0.5; c.fillStyle = `rgba(255,250,210,${a})`; c.fillRect(x, y, 6 + hash(i + 9) * 10, 1.4); } c.restore();
        for (let i = 0; i < 4; i++) { const x = ((hash(i + 60) * vw2 + t * (14 + i * 4)) % (vw2 + 60)) - 30, y = 36 + hash(i + 70) * 70 + Math.sin(t * 1.6 + i) * 6; c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.6; const fl = Math.sin(t * 8 + i) * 3; c.beginPath(); c.moveTo(x - 7, y - fl); c.quadraticCurveTo(x - 3, y - 4, x, y); c.quadraticCurveTo(x + 3, y - 4, x + 7, y - fl); c.stroke(); }
      },
    };
  };
  // 얼음(얼음 협곡·눈보라 고원·서리 왕좌): 오로라, 눈 덮인 산, 얼어붙은 침엽수
  BG.ice = function (map, vw, vh, th) {
    const H = Math.max(vh + 120, map.h), gy = map.plats[0].y, rnd = seeded(map.w * 9 + 2), layers = [];
    const sky = mkLayer(8, H, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0a1230'); g.addColorStop(0.5, '#1e3a70'); g.addColorStop(0.85, '#5a8ec8'); g.addColorStop(1, '#bfe0f8'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    const stars = Array.from({ length: 50 }, (_, i) => [hash(i + 1), hash(i + 90) * 0.45, hash(i + 5) * 2 + 0.6]);
    const addL = (f, fn) => layers.push({ f, cv: mkLayer(map.w * f + vw + 80, H, fn) });
    addL(0.08, (c, w) => { mount(c, w, gy - 150, 190, 230, rnd, '#5a7ab0', '#e8f4ff', 46); haze(c, w, gy - 340, gy + 40, '#9ac8f0', 0.18, 0.32); });
    addL(0.22, (c, w) => { mount(c, w, gy - 70, 150, 190, rnd, '#3e5e98', '#f0f8ff', 38); c.fillStyle = 'rgba(150,220,255,.5)'; for (let i = 0; i < w / 160; i++) { const x = rnd() * w, y = gy - 60 - rnd() * 90; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 5, y - 22 - rnd() * 14); c.lineTo(x + 10, y); c.closePath(); c.fill(); } haze(c, w, gy - 200, gy + 40, '#bfe4ff', 0.12, 0.28); });
    addL(0.45, (c, w) => { for (let x = 0; x < w; x += 46 + rnd() * 40) { const hh = 70 + rnd() * 90, ww = 18 + rnd() * 16; c.fillStyle = '#1e3a5a'; c.beginPath(); c.moveTo(x, gy + 6); c.lineTo(x + ww * 0.5, gy - hh); c.lineTo(x + ww, gy + 6); c.closePath(); c.fill(); c.fillStyle = '#2a4e78'; for (let k = 0; k < 4; k++) { const yy = gy - hh * (0.2 + k * 0.2), ww2 = ww * (0.9 - k * 0.2); c.beginPath(); c.moveTo(x + ww * 0.5 - ww2 * 0.5, yy); c.lineTo(x + ww * 0.5, yy - hh * 0.2); c.lineTo(x + ww * 0.5 + ww2 * 0.5, yy); c.closePath(); c.fill(); } c.fillStyle = 'rgba(240,250,255,.9)'; for (let k = 0; k < 4; k++) { const yy = gy - hh * (0.2 + k * 0.2); c.beginPath(); c.ellipse(x + ww * 0.5 - 2, yy - 2, ww * (0.32 - k * 0.05), 2.4, 0, 0, TAU); c.fill(); } } });
    return {
      draw(c, camX, camY, vw2, vh2, t) {
        c.drawImage(sky, 0, 0, 8, H, 0, -camY, vw2, H);
        for (const s of stars) { c.globalAlpha = 0.4 + 0.5 * Math.abs(Math.sin(t * 1.2 + s[0] * 20)); c.fillStyle = '#fff'; c.fillRect(s[0] * vw2, s[1] * vh2, s[2] * 0.9, s[2] * 0.9); } c.globalAlpha = 1;
        // 오로라
        c.save(); c.globalCompositeOperation = 'lighter'; const cols = [['80,255,200', 0], ['120,160,255', 1.7], ['200,120,255', 3.1]]; for (const [rgb, ph] of cols) { c.beginPath(); const pts = []; for (let x = 0; x <= vw2 + 20; x += 16) pts.push([x, 36 + Math.sin(x * 0.012 + t * 0.35 + ph) * 22 + Math.sin(x * 0.03 - t * 0.5 + ph) * 8 - camY * 0.05]); c.moveTo(pts[0][0], pts[0][1]); for (const p of pts) c.lineTo(p[0], p[1]); for (let i = pts.length - 1; i >= 0; i--) c.lineTo(pts[i][0], pts[i][1] + 70 + Math.sin(t * 0.4 + i * 0.3 + ph) * 18); c.closePath(); const g = c.createLinearGradient(0, 20, 0, 140); g.addColorStop(0, `rgba(${rgb},.0)`); g.addColorStop(0.3, `rgba(${rgb},.28)`); g.addColorStop(1, `rgba(${rgb},0)`); c.fillStyle = g; c.fill(); } c.restore();
        for (const ly of layers) { let sx = camX * ly.f, dx = 0; if (sx < 0) { dx = -sx; sx = 0; } const sw = Math.min(vw2 - dx, ly.cv.width - sx); if (sw > 0) c.drawImage(ly.cv, sx, Math.max(0, camY), sw, vh2, dx, 0, sw, vh2); }
      },
    };
  };
  // 용암(불꽃 협곡·불의 비밀 통로): 화산, 흐르는 용암, 연기
  BG.lava = function (map, vw, vh, th) {
    const H = Math.max(vh + 120, map.h), gy = map.plats[0].y, rnd = seeded(map.w * 13 + 4), layers = [];
    const sky = mkLayer(8, H, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#12040a'); g.addColorStop(0.45, '#4a1210'); g.addColorStop(0.8, '#c4501e'); g.addColorStop(1, '#ffb050'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    const addL = (f, fn) => layers.push({ f, cv: mkLayer(map.w * f + vw + 80, H, fn) });
    addL(0.1, (c, w) => { mount(c, w, gy - 120, 200, 260, rnd, '#3a1618', null, 0); for (let x = 200; x < w; x += 700 + rnd() * 400) { c.beginPath(); c.moveTo(x - 110, gy + 20); c.lineTo(x - 26, gy - 190); c.lineTo(x + 26, gy - 190); c.lineTo(x + 110, gy + 20); c.closePath(); c.fillStyle = '#2a0e12'; c.fill(); const g = c.createRadialGradient(x, gy - 190, 2, x, gy - 190, 60); g.addColorStop(0, 'rgba(255,200,90,.95)'); g.addColorStop(0.4, 'rgba(255,110,30,.6)'); g.addColorStop(1, 'rgba(255,60,10,0)'); c.fillStyle = g; c.fillRect(x - 70, gy - 260, 140, 140); c.strokeStyle = 'rgba(255,120,40,.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 20, gy - 186); c.quadraticCurveTo(x - 40, gy - 90, x - 70, gy + 10); c.moveTo(x + 18, gy - 186); c.quadraticCurveTo(x + 44, gy - 80, x + 66, gy + 10); c.stroke(); } haze(c, w, gy - 260, gy + 40, '#ff7a30', 0.05, 0.3); });
    addL(0.28, (c, w) => { mount(c, w, gy - 50, 130, 170, rnd, '#4a1a16', null, 0); c.strokeStyle = 'rgba(255,130,40,.55)'; c.lineWidth = 2; for (let i = 0; i < w / 120; i++) { const x = rnd() * w, y = gy - 20 - rnd() * 60; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 8 + rnd() * 14, y + 10 + rnd() * 14); c.lineTo(x + 2, y + 26 + rnd() * 10); c.stroke(); } });
    addL(0.55, (c, w) => { c.fillStyle = '#220a0c'; for (let x = 0; x < w; x += 90 + rnd() * 80) { const hh = 40 + rnd() * 70; c.beginPath(); c.moveTo(x, gy + 6); c.lineTo(x + 10, gy - hh); c.lineTo(x + 22, gy - hh * 0.5); c.lineTo(x + 34, gy - hh * 0.9); c.lineTo(x + 48, gy + 6); c.closePath(); c.fill(); } const g = c.createLinearGradient(0, gy - 10, 0, gy + 30); g.addColorStop(0, 'rgba(255,120,30,0)'); g.addColorStop(1, 'rgba(255,150,40,.55)'); c.fillStyle = g; c.fillRect(0, gy - 10, w, 40); });
    return {
      draw(c, camX, camY, vw2, vh2, t) {
        c.drawImage(sky, 0, 0, 8, H, 0, -camY, vw2, H);
        for (const ly of layers) { let sx = camX * ly.f, dx = 0; if (sx < 0) { dx = -sx; sx = 0; } const sw = Math.min(vw2 - dx, ly.cv.width - sx); if (sw > 0) c.drawImage(ly.cv, sx, Math.max(0, camY), sw, vh2, dx, 0, sw, vh2); }
        // 화산 연기
        for (let i = 0; i < 7; i++) { const k = ((t * 0.07 + hash(i)) % 1), x = vw2 * (0.15 + hash(i + 5) * 0.7) + Math.sin(t * 0.5 + i) * 16, y = vh2 * 0.5 - k * vh2 * 0.5; c.fillStyle = `rgba(50,20,24,${0.28 * (1 - k)})`; c.beginPath(); c.arc(x, y, 18 + k * 34, 0, TAU); c.fill(); }
        c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, vh2 * 0.55, 0, vh2); g.addColorStop(0, 'rgba(255,90,20,0)'); g.addColorStop(1, `rgba(255,110,30,${0.2 + 0.05 * Math.sin(t * 2)})`); c.fillStyle = g; c.fillRect(0, vh2 * 0.55, vw2, vh2 * 0.45); c.restore();
      },
    };
  };
  A.customBg = function (map, vw, vh) { const th = A.THEMES[map.theme]; const f = BG[map.theme]; if (!f) return null; return { th, custom: f(map, vw, vh, th), layers: [], clouds: [] }; };

  /* ───────── 분위기 효과 (눈·불씨·빛줄기·비네트) ───────── */
  A.drawAtmos = function (c, G, cx, cy, VW, VH, t) {
    const m = G.map, th = m.theme; c.save();
    if (th === 'ice') { // 눈 내리기 (3겹 시차)
      c.fillStyle = '#fff'; for (let i = 0; i < 70; i++) { const d = 1 + (i % 3), sp = 14 + d * 12, x = ((hash(i) * (VW + 80) + t * (10 + d * 4) - cx * 0.05 * d) % (VW + 80) + (VW + 80)) % (VW + 80) - 40, y = ((hash(i + 50) * (VH + 40) + t * sp) % (VH + 40)) - 20; c.globalAlpha = 0.35 + 0.2 * d; c.beginPath(); c.arc(x + Math.sin(t * 1.2 + i) * 4, y, 0.8 + d * 0.5, 0, TAU); c.fill(); }
      c.globalAlpha = 1; const g = c.createLinearGradient(0, VH * 0.7, 0, VH); g.addColorStop(0, 'rgba(180,220,255,0)'); g.addColorStop(1, 'rgba(200,230,255,.18)'); c.fillStyle = g; c.fillRect(0, VH * 0.7, VW, VH * 0.3);
    } else if (th === 'lava') { // 떠오르는 불씨
      c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 46; i++) { const k = (t * (0.08 + hash(i) * 0.1) + hash(i + 3)) % 1, x = ((hash(i + 9) * (VW + 60) - cx * 0.08) % (VW + 60) + (VW + 60)) % (VW + 60) - 30 + Math.sin(t * 2 + i) * 10, y = VH + 10 - k * (VH + 20); c.globalAlpha = (1 - k) * 0.8; c.fillStyle = hash(i + 7) < 0.5 ? '#ff9a30' : '#ffd060'; c.beginPath(); c.arc(x, y, 0.9 + hash(i + 1) * 1.6, 0, TAU); c.fill(); }
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; const g = c.createLinearGradient(0, VH * 0.65, 0, VH); g.addColorStop(0, 'rgba(255,100,20,0)'); g.addColorStop(1, 'rgba(255,100,20,.14)'); c.fillStyle = g; c.fillRect(0, VH * 0.65, VW, VH * 0.35);
    } else if (th === 'sky') { // 반짝이는 빛 알갱이
      c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 26; i++) { const x = ((hash(i) * (VW + 40) + Math.sin(t * 0.3 + i) * 20 - cx * 0.04) % (VW + 40) + (VW + 40)) % (VW + 40) - 20, y = hash(i + 11) * VH, a = Math.max(0, Math.sin(t * 1.6 + i * 3.1)) * 0.7; c.fillStyle = `rgba(255,250,220,${a})`; c.beginPath(); c.arc(x, y, 1 + hash(i + 2), 0, TAU); c.fill(); }
    } else if (th === 'sea') { // 물보라
      c.fillStyle = '#fff'; for (let i = 0; i < 22; i++) { const k = (t * 0.5 + hash(i)) % 1, x = hash(i + 4) * VW, y = VH - 8 - k * 50; c.globalAlpha = (1 - k) * 0.5; c.beginPath(); c.arc(x, y, 0.8 + k * 1.2, 0, TAU); c.fill(); }
    } else if (th === 'cave' || th === 'cave2' || th === 'temple') { // 먼지 알갱이
      c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 24; i++) { const x = ((hash(i) * (VW + 40) + Math.sin(t * 0.4 + i) * 14 - cx * 0.06) % (VW + 40) + (VW + 40)) % (VW + 40) - 20, y = ((hash(i + 7) * VH + t * (3 + hash(i) * 4)) % VH); c.fillStyle = `rgba(${th === 'temple' ? '200,170,255' : '255,220,170'},${0.22 + 0.2 * Math.sin(t + i)})`; c.beginPath(); c.arc(x, y, 0.9 + hash(i + 3), 0, TAU); c.fill(); }
    } else if (th === 'forest') { // 빛줄기
      c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) { const x0 = VW * (0.15 + i * 0.22) + Math.sin(t * 0.3 + i) * 10, a = 0.05 + 0.03 * Math.sin(t * 0.8 + i * 2); c.fillStyle = `rgba(220,255,200,${a})`; c.beginPath(); c.moveTo(x0, 0); c.lineTo(x0 + 26, 0); c.lineTo(x0 - 70, VH); c.lineTo(x0 - 130, VH); c.closePath(); c.fill(); }
    } else { // 따뜻한 햇살 알갱이
      c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 16; i++) { const x = ((hash(i) * (VW + 40) + t * (6 + hash(i) * 8) - cx * 0.05) % (VW + 40) + (VW + 40)) % (VW + 40) - 20, y = hash(i + 6) * VH * 0.8 + Math.sin(t + i) * 6; c.fillStyle = `rgba(255,240,190,${0.18 + 0.12 * Math.sin(t * 1.3 + i)})`; c.beginPath(); c.arc(x, y, 1 + hash(i + 2) * 1.2, 0, TAU); c.fill(); }
    }
    c.restore();
    // 비네트: 가장자리를 살짝 어둡게 해서 화면 중심이 또렷해 보이게
    const vg = c.createRadialGradient(VW / 2, VH / 2, VH * 0.45, VW / 2, VH / 2, Math.max(VW, VH) * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(8,6,20,.32)'); c.fillStyle = vg; c.fillRect(0, 0, VW, VH);
  };
})(typeof window !== 'undefined' ? window : globalThis);
