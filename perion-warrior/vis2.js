/* 페리온 전사 — 비주얼 강화 2: 지형 질감(테마별) + 마을·항구·배 장식 */
(function (root) {
  'use strict';
  const A = root.Art; if (!A || !A._v) return;
  const TAU = Math.PI * 2, seeded = A.seeded, rrect = A.rrect, V = A._v, puff = V.puff;
  const OUT = '#2b1c14';
  function fs(c, fill, lw) { c.fillStyle = fill; c.fill(); c.lineWidth = lw || 2; c.strokeStyle = OUT; c.lineJoin = 'round'; c.stroke(); }

  /* ───────── 지형 질감 (테마별) ───────── */
  A.terrainFx = function (c, map, th, rnd) {
    const id = map.theme; if (!['ice', 'sky', 'lava', 'sea'].includes(id)) return;
    for (const p of map.plats) {
      const r2 = seeded(Math.floor(p.x * 3 + p.y * 7 + 5)), solid = p.solid;
      if (id === 'ice') {
        // 눈 덮개: 몽글몽글한 흰 띠 + 고드름 + 빛나는 얼음 결정
        c.fillStyle = '#f4fbff'; c.beginPath(); c.moveTo(p.x - 2, p.y + 3); for (let x = p.x; x <= p.x + p.w; x += 10) c.quadraticCurveTo(x + 5, p.y - 7 - r2() * 3, x + 10, p.y + 1); c.lineTo(p.x + p.w + 2, p.y + 6); c.closePath(); c.fill(); c.lineWidth = 1.6; c.strokeStyle = 'rgba(40,70,110,.8)'; c.stroke();
        c.fillStyle = 'rgba(160,210,255,.6)'; c.fillRect(p.x, p.y + 4, p.w, 2);
        if (!solid) for (let x = p.x + 10; x < p.x + p.w - 8; x += 12 + r2() * 20) { const l = 8 + r2() * 16; c.beginPath(); c.moveTo(x - 3, p.y + 20); c.lineTo(x, p.y + 20 + l); c.lineTo(x + 3, p.y + 20); c.closePath(); fs(c, 'rgba(190,235,255,.95)', 1.2); }
        if (solid) for (let x = p.x + 60; x < p.x + p.w - 40; x += 160 + r2() * 220) { c.shadowColor = '#6ad8ff'; c.shadowBlur = 10; for (let k = 0; k < 3; k++) { const hh = 14 + r2() * 18; c.beginPath(); c.moveTo(x + k * 10 - 4, p.y - 1); c.lineTo(x + k * 10, p.y - hh); c.lineTo(x + k * 10 + 4, p.y - 1); c.closePath(); fs(c, ['#bfeaff', '#8ad4ff', '#d8f4ff'][k % 3], 1.2); } c.shadowBlur = 0; }
      } else if (id === 'sky') {
        // 구름 밑단 + 반짝 꽃
        if (!solid) for (let x = p.x + 8; x < p.x + p.w - 6; x += 18) puff(c, x, p.y + 26 + r2() * 6, 0.45 + r2() * 0.3, 0.8);
        if (solid) for (let x = p.x + 30; x < p.x + p.w - 20; x += 90 + r2() * 160) { c.fillStyle = '#ffffff'; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(x + Math.cos(k * 1.256) * 4, p.y - 8 + Math.sin(k * 1.256) * 4, 2.4, 0, TAU); c.fill(); } c.fillStyle = '#ffd24a'; c.beginPath(); c.arc(x, p.y - 8, 2, 0, TAU); c.fill(); c.strokeStyle = '#3a8a2a'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(x, p.y - 6); c.lineTo(x, p.y); c.stroke(); }
      } else if (id === 'lava') {
        // 식은 용암 바위 + 이글거리는 균열
        c.fillStyle = '#2a1a1c'; c.beginPath(); c.moveTo(p.x - 1, p.y + 6); c.lineTo(p.x - 1, p.y - 1); for (let x = p.x; x <= p.x + p.w; x += 12) c.lineTo(x, p.y - 2 - (((x / 12) | 0) % 2) * 3); c.lineTo(p.x + p.w + 1, p.y + 6); c.closePath(); c.fill(); c.lineWidth = 1.6; c.strokeStyle = OUT; c.stroke();
        c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,120,30,.85)'; c.lineWidth = 1.6; c.shadowColor = '#ff6a10'; c.shadowBlur = 6; const th2 = solid ? 60 : 22; for (let x = p.x + 12; x < p.x + p.w - 8; x += 26 + r2() * 40) { c.beginPath(); c.moveTo(x, p.y + 4); let y = p.y + 4; for (let k = 0; k < 3; k++) { y += 5 + r2() * 7; c.lineTo(x + (r2() - 0.5) * 12, Math.min(p.y + th2, y)); } c.stroke(); } c.restore();
        if (!solid) { c.save(); c.globalCompositeOperation = 'lighter'; for (let x = p.x + 14; x < p.x + p.w - 10; x += 30 + r2() * 40) { c.fillStyle = 'rgba(255,110,20,.9)'; c.beginPath(); c.ellipse(x, p.y + 24 + r2() * 6, 2.4, 4.4, 0, 0, TAU); c.fill(); } c.restore(); }
      } else if (id === 'sea' && solid) {
        // 갑판: 널빤지 이음매와 못
        c.save(); c.beginPath(); c.rect(p.x, p.y - 1, p.w, 400); c.clip();
        const g = c.createLinearGradient(0, p.y, 0, p.y + 60); g.addColorStop(0, '#d8a868'); g.addColorStop(1, '#8a5a34'); c.fillStyle = g; c.fillRect(p.x, p.y, p.w, 400);
        c.strokeStyle = 'rgba(60,30,10,.45)'; c.lineWidth = 1.2; for (let y = p.y + 14; y < p.y + 90; y += 14) { c.beginPath(); c.moveTo(p.x, y); c.lineTo(p.x + p.w, y); c.stroke(); } for (let row = 0; row < 6; row++) for (let x = p.x + ((row * 53) % 90); x < p.x + p.w; x += 90) { c.beginPath(); c.moveTo(x, p.y + row * 14); c.lineTo(x, p.y + (row + 1) * 14); c.stroke(); c.fillStyle = 'rgba(40,20,8,.6)'; c.fillRect(x + 4, p.y + row * 14 + 5, 2, 2); }
        c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(p.x, p.y, p.w, 3); c.restore(); c.strokeStyle = OUT; c.lineWidth = 2; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x + p.w, p.y); c.stroke();
      } else if (id === 'sea' && !solid) {
        // 위층 갑판: 두꺼운 목재 + 난간 기둥
        c.beginPath(); rrect(c, p.x, p.y - 2, p.w, 12, 3); fs(c, '#b8844a', 2); c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(p.x + 4, p.y - 1, p.w - 8, 2);
        for (let x = p.x + 6; x <= p.x + p.w - 6; x += 30) { c.beginPath(); rrect(c, x - 2, p.y - 18, 4, 17, 1.5); fs(c, '#a0703c', 1.4); } c.strokeStyle = OUT; c.lineWidth = 3.4; c.beginPath(); c.moveTo(p.x + 6, p.y - 16); c.lineTo(p.x + p.w - 6, p.y - 16); c.stroke(); c.strokeStyle = '#d8a868'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(p.x + 6, p.y - 16); c.lineTo(p.x + p.w - 6, p.y - 16); c.stroke();
      }
    }
  };

  /* ───────── 마을·배 장식 (발판보다 먼저 그려져 뒤에 깔림) ───────── */
  function roofTent(c, x, y, w, h, col) { c.beginPath(); c.moveTo(x - 6, y - h); c.lineTo(x + w / 2, y - h - 28); c.lineTo(x + w + 6, y - h); c.closePath(); fs(c, col, 2.4); c.fillStyle = 'rgba(255,255,255,.16)'; c.beginPath(); c.moveTo(x + w / 2, y - h - 28); c.lineTo(x + w + 6, y - h); c.lineTo(x + w / 2 + 4, y - h); c.closePath(); c.fill(); }
  function bld(c, x, gy, w, h, wall, roof, o) {
    o = o || {}; c.beginPath(); rrect(c, x, gy - h, w, h, 4); fs(c, wall, 2.4); c.fillStyle = 'rgba(0,0,40,.1)'; c.fillRect(x + w * 0.62, gy - h + 2, w * 0.36, h - 4);
    if (o.dome) { c.beginPath(); c.arc(x + w / 2, gy - h, w * 0.46, Math.PI, 0); c.closePath(); fs(c, roof, 2.6); c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.ellipse(x + w * 0.38, gy - h - w * 0.2, w * 0.1, w * 0.05, -0.6, 0, TAU); c.fill(); c.strokeStyle = OUT; c.lineWidth = 2; c.beginPath(); c.moveTo(x + w / 2, gy - h - w * 0.46); c.lineTo(x + w / 2, gy - h - w * 0.46 - 14); c.stroke(); c.fillStyle = '#ffd24a'; c.beginPath(); c.arc(x + w / 2, gy - h - w * 0.46 - 15, 3, 0, TAU); c.fill(); } else roofTent(c, x, gy, w, h, roof);
    const wn = Math.max(1, Math.floor(w / 70)); for (let i = 0; i < wn; i++) { const wx = x + (w / (wn + 1)) * (i + 1) - 11; c.beginPath(); rrect(c, wx, gy - h + 18, 22, 26, o.arch ? 11 : 3); fs(c, '#ffe9a8', 1.8); c.strokeStyle = OUT; c.lineWidth = 1.4; c.beginPath(); c.moveTo(wx + 11, gy - h + 18); c.lineTo(wx + 11, gy - h + 44); c.moveTo(wx, gy - h + 31); c.lineTo(wx + 22, gy - h + 31); c.stroke(); }
    c.beginPath(); rrect(c, x + w / 2 - 13, gy - 40, 26, 40, o.arch ? 13 : 3); fs(c, o.door || '#8a5a32', 2); c.fillStyle = '#ffd24a'; c.beginPath(); c.arc(x + w / 2 + 6, gy - 20, 1.8, 0, TAU); c.fill();
    if (o.sign) { c.beginPath(); rrect(c, x + w / 2 - 28, gy - h + 2, 56, 16, 5); fs(c, '#6a4a8a', 1.8); c.font = 'bold 11px sans-serif'; c.fillStyle = '#fff3c8'; c.textAlign = 'center'; c.fillText(o.sign, x + w / 2, gy - h + 14); }
  }
  function lamp(c, x, gy, glow) { c.strokeStyle = OUT; c.lineWidth = 5; c.beginPath(); c.moveTo(x, gy); c.lineTo(x, gy - 64); c.stroke(); c.strokeStyle = '#c8d0e0'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x, gy); c.lineTo(x, gy - 64); c.stroke(); c.beginPath(); c.arc(x, gy - 68, 7, 0, TAU); fs(c, glow || '#fff4c0', 1.8); const g = c.createRadialGradient(x, gy - 68, 2, x, gy - 68, 30); g.addColorStop(0, 'rgba(255,240,170,.55)'); g.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = g; c.fillRect(x - 30, gy - 98, 60, 60); }
  function planter(c, x, gy, cols) { c.beginPath(); rrect(c, x - 16, gy - 14, 32, 14, 3); fs(c, '#a0703c', 1.8); for (let i = 0; i < 5; i++) { c.strokeStyle = '#3a8a2a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x - 12 + i * 6, gy - 14); c.lineTo(x - 12 + i * 6, gy - 22); c.stroke(); c.fillStyle = cols[i % cols.length]; c.beginPath(); c.arc(x - 12 + i * 6, gy - 24, 3.4, 0, TAU); c.fill(); } }
  function banner(c, x, gy, col) { c.strokeStyle = OUT; c.lineWidth = 5; c.beginPath(); c.moveTo(x, gy); c.lineTo(x, gy - 96); c.stroke(); c.strokeStyle = '#d8dce8'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x, gy); c.lineTo(x, gy - 96); c.stroke(); c.beginPath(); c.moveTo(x, gy - 92); c.lineTo(x + 34, gy - 86); c.lineTo(x + 28, gy - 72); c.lineTo(x + 34, gy - 58); c.lineTo(x, gy - 62); c.closePath(); fs(c, col, 1.8); }
  function crate(c, x, gy, w) { c.beginPath(); rrect(c, x, gy - w, w, w, 3); fs(c, '#b8844a', 2); c.strokeStyle = OUT; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x, gy - w); c.lineTo(x + w, gy); c.moveTo(x + w, gy - w); c.lineTo(x, gy); c.stroke(); }
  A.extraDecor = function (c, map, rnd) {
    const gy = map.plats[0].y;
    if (map.id === 'orbis') {
      bld(c, 540, gy, 200, 120, '#f2f5ff', '#5a8ae0', { dome: true, arch: true, sign: '여관', door: '#7a6aa8' });
      bld(c, 880, gy, 190, 108, '#eef6ec', '#3fb07a', { sign: '잡화점', door: '#8a6a3a' });
      bld(c, 1260, 330, 300, 110, '#e8ecf6', '#8a8fa8', { sign: '대장간', door: '#5a5f70' });
      bld(c, 1690, gy, 210, 124, '#f6f0fa', '#9a5ae0', { dome: true, arch: true, sign: '주문서', door: '#6a4a8a' });
      bld(c, 2090, gy, 240, 140, '#fff6e0', '#e0a830', { dome: true, arch: true, sign: '수호대', door: '#8a5a2a' });
      const hx = 2330, hw = 270, hy = 330; c.beginPath(); rrect(c, hx, hy - 120, hw, 120, 4); fs(c, '#f4f6ff', 2.4);
      for (let i = 0; i < 5; i++) { c.beginPath(); rrect(c, hx + 14 + i * 56, hy - 118, 18, 116, 3); fs(c, '#fff', 1.8); c.fillStyle = 'rgba(80,100,160,.18)'; c.fillRect(hx + 26 + i * 56, hy - 116, 6, 112); }
      c.beginPath(); c.moveTo(hx - 12, hy - 120); c.lineTo(hx + hw / 2, hy - 176); c.lineTo(hx + hw + 12, hy - 120); c.closePath(); fs(c, '#e0b848', 2.6); c.beginPath(); c.arc(hx + hw / 2, hy - 140, 9, 0, TAU); fs(c, '#6aa8ff', 1.6);
      for (const x of [380, 800, 1170, 1620, 2010, 2290, 2800]) lamp(c, x, gy);
      for (const [x, col] of [[300, '#e05a6a'], [770, '#6ab0ff'], [1130, '#ffd24a'], [1980, '#9a5ae0'], [2700, '#e05a6a']]) banner(c, x, gy, col);
      for (const x of [460, 830, 1620, 2050, 2760, 3000]) planter(c, x, gy, ['#ff8aa8', '#ffd24a', '#fff', '#a8d8ff']);
    } else if (map.id === 'port') {
      const lx = 330; c.beginPath(); c.moveTo(lx - 34, gy); c.lineTo(lx - 20, gy - 190); c.lineTo(lx + 20, gy - 190); c.lineTo(lx + 34, gy); c.closePath(); fs(c, '#f4f4f8', 2.6);
      for (let k = 0; k < 4; k++) { const y0 = gy - 30 - k * 42; c.fillStyle = '#d6342c'; c.beginPath(); c.moveTo(lx - 32 + k * 3.5, y0); c.lineTo(lx + 32 - k * 3.5, y0); c.lineTo(lx + 29 - k * 3.5, y0 - 18); c.lineTo(lx - 29 + k * 3.5, y0 - 18); c.closePath(); c.fill(); }
      c.beginPath(); rrect(c, lx - 24, gy - 214, 48, 26, 4); fs(c, '#ffe27a', 2.2); c.beginPath(); c.moveTo(lx - 30, gy - 214); c.lineTo(lx, gy - 244); c.lineTo(lx + 30, gy - 214); c.closePath(); fs(c, '#d6342c', 2.4);
      c.save(); c.globalCompositeOperation = 'lighter'; const gl = c.createRadialGradient(lx, gy - 200, 2, lx, gy - 200, 90); gl.addColorStop(0, 'rgba(255,240,160,.8)'); gl.addColorStop(1, 'rgba(255,240,160,0)'); c.fillStyle = gl; c.fillRect(lx - 90, gy - 290, 180, 180); c.restore();
      const sx = 1180; c.beginPath(); c.moveTo(sx - 80, gy - 70); c.lineTo(sx + 360, gy - 70); c.quadraticCurveTo(sx + 330, gy - 8, sx + 250, gy + 6); c.lineTo(sx - 20, gy + 6); c.quadraticCurveTo(sx - 70, gy - 20, sx - 80, gy - 70); c.closePath(); fs(c, '#7a4a2a', 3); c.fillStyle = '#a0703c'; c.fillRect(sx - 76, gy - 66, 432, 8);
      for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(sx + 10 + k * 56, gy - 40, 7, 0, TAU); fs(c, '#ffe9a8', 1.8); }
      c.beginPath(); rrect(c, sx + 140, gy - 250, 10, 190, 2); fs(c, '#6a4a2a', 2); c.beginPath(); c.moveTo(sx + 152, gy - 244); c.quadraticCurveTo(sx + 215, gy - 170, sx + 152, gy - 90); c.closePath(); fs(c, '#fff8ea', 2.4); c.beginPath(); c.moveTo(sx + 138, gy - 230); c.quadraticCurveTo(sx + 90, gy - 170, sx + 138, gy - 100); c.closePath(); fs(c, '#f2e6cc', 2.4); c.beginPath(); c.moveTo(sx + 150, gy - 252); c.lineTo(sx + 188, gy - 262); c.lineTo(sx + 150, gy - 272); c.closePath(); fs(c, '#d6342c', 1.6);
      bld(c, 960, gy, 150, 96, '#c8a070', '#5a8ae0', { sign: '매표소' });
      for (const [x, w] of [[520, 40], [566, 34], [600, 44]]) crate(c, x, gy, w);
      for (const x of [700, 770]) { c.beginPath(); rrect(c, x, gy - 38, 30, 38, 8); fs(c, '#8a5a32', 2); c.strokeStyle = '#3a2a1c'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, gy - 26); c.lineTo(x + 30, gy - 26); c.moveTo(x, gy - 12); c.lineTo(x + 30, gy - 12); c.stroke(); }
      for (const x of [120, 460, 880, 1560]) lamp(c, x, gy, '#fff0b0');
    } else if (map.id === 'ship') {
      for (const mx of [420, 1060]) {
        c.beginPath(); rrect(c, mx - 7, gy - 330, 14, 330, 3); fs(c, '#6a4a2a', 2.4);
        c.beginPath(); c.moveTo(mx + 8, gy - 316); c.quadraticCurveTo(mx + 120, gy - 230, mx + 8, gy - 110); c.closePath(); fs(c, '#fffaf0', 2.6);
        c.strokeStyle = 'rgba(120,100,70,.35)'; c.lineWidth = 1.4; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(mx + 8, gy - 316 + k * 52); c.quadraticCurveTo(mx + 70, gy - 290 + k * 46, mx + 8 + k * 6, gy - 110 + (k - 3) * 6); c.stroke(); }
        c.beginPath(); c.moveTo(mx - 8, gy - 300); c.quadraticCurveTo(mx - 90, gy - 220, mx - 8, gy - 120); c.closePath(); fs(c, '#f4e8cc', 2.6);
        c.beginPath(); c.moveTo(mx, gy - 330); c.lineTo(mx + 36, gy - 322); c.lineTo(mx, gy - 312); c.closePath(); fs(c, '#d6342c', 1.8);
        c.strokeStyle = 'rgba(60,40,20,.7)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(mx, gy - 326); c.lineTo(mx - 200, gy); c.moveTo(mx, gy - 326); c.lineTo(mx + 200, gy); c.stroke();
      }
      for (const [x, w] of [[120, 40], [166, 34], [1300, 44], [1348, 36]]) crate(c, x, gy, w);
      c.beginPath(); c.arc(740, gy - 30, 18, 0, TAU); fs(c, '#fff', 2); c.beginPath(); c.arc(740, gy - 30, 12, 0, TAU); c.strokeStyle = '#d6342c'; c.lineWidth = 6; c.stroke();
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
