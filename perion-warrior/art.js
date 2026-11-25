/* 페리온 전사 — 그림(전부 코드로 그림). 캐릭터·몬스터·NPC·배경·지형 */
(function (root) {
  'use strict';
  const A = {}; const TAU = Math.PI * 2; const OUT = '#2b1c14';
  function rrect(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function ell(c, x, y, rx, ry) { c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, TAU); }
  function shade(hex, amt) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; const f = (v) => Math.max(0, Math.min(255, Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt)))); return '#' + ((1 << 24) | (f(r) << 16) | (f(g) << 8) | f(b)).toString(16).slice(1); }
  function fillStroke(c, fill, lw) { c.fillStyle = fill; c.fill(); c.lineWidth = lw || 2; c.strokeStyle = OUT; c.lineJoin = 'round'; c.stroke(); }
  function seeded(seed) { let a = seed | 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  A.shade = shade; A.rrect = rrect; A.seeded = seeded;

  /* ───────── 사람(주인공·NPC 공용) ───────── */
  function weapon(c, wt, col, len) {
    c.save();
    if (wt === 'axe') {
      c.beginPath(); c.rect(-1.6, -len * 0.9, 3.2, len * 0.95); fillStroke(c, '#7a4a2a', 1.6);
      c.beginPath(); c.moveTo(1, -len * 0.9); c.quadraticCurveTo(14, -len * 0.98, 12, -len * 0.55); c.lineTo(1, -len * 0.58); c.closePath(); fillStroke(c, col, 1.8);
      c.beginPath(); c.moveTo(-1, -len * 0.86); c.lineTo(-6, -len * 0.8); c.lineTo(-1, -len * 0.7); c.closePath(); fillStroke(c, shade(col, -0.2), 1.4);
    } else {
      const bl = wt === 'great' ? len * 1.15 : len;
      c.beginPath(); c.rect(-1.6, -4, 3.2, 8); fillStroke(c, '#6b3e22', 1.4); // 손잡이
      c.beginPath(); rrect(c, -6, -7, 12, 3.4, 1.5); fillStroke(c, '#d6b04a', 1.4); // 가드
      const w = wt === 'great' ? 4.6 : 3.4;
      c.beginPath(); c.moveTo(-w, -7); c.lineTo(-w, -bl + 5); c.lineTo(0, -bl); c.lineTo(w, -bl + 5); c.lineTo(w, -7); c.closePath(); fillStroke(c, col, 1.8);
      c.beginPath(); c.moveTo(-0.6, -9); c.lineTo(-0.6, -bl + 7); c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 1.2; c.stroke();
    }
    c.restore();
  }
  function helmet(c, kind, col, by) {
    c.save();
    if (kind === 'hm1') { c.beginPath(); c.arc(0, by - 1, 10.6, Math.PI * 1.02, Math.PI * 1.98); c.lineTo(10.6, by - 3); c.lineTo(-10.6, by - 3); c.closePath(); fillStroke(c, col, 1.8); c.beginPath(); ell(c, 8, by - 2.5, 5, 1.8); fillStroke(c, shade(col, -0.2), 1.4); }
    else {
      c.beginPath(); c.arc(0, by - 1, 11.2, Math.PI * 0.98, Math.PI * 2.02); c.lineTo(11.2, by + 2); c.lineTo(8, by + 2); c.lineTo(8, by - 2); c.lineTo(-8, by - 2); c.lineTo(-8, by + 2); c.lineTo(-11.2, by + 2); c.closePath(); fillStroke(c, col, 1.9);
      c.beginPath(); c.moveTo(0, by - 12); c.lineTo(0, by - 3); c.strokeStyle = shade(col, 0.5); c.lineWidth = 1.6; c.stroke();
      if (kind === 'hm3') { c.beginPath(); c.moveTo(-9, by - 6); c.lineTo(-15, by - 14); c.lineTo(-6, by - 10); c.closePath(); fillStroke(c, '#e8eef8', 1.4); c.beginPath(); c.moveTo(9, by - 6); c.lineTo(15, by - 14); c.lineTo(6, by - 10); c.closePath(); fillStroke(c, '#e8eef8', 1.4); }
      if (kind === 'hm4') { c.beginPath(); c.moveTo(-2, by - 11); c.quadraticCurveTo(-14, by - 22, -16, by - 8); c.quadraticCurveTo(-8, by - 14, -2, by - 8); c.closePath(); fillStroke(c, '#d6343c', 1.4); c.beginPath(); rrect(c, -3, by - 5, 6, 3, 1); fillStroke(c, '#e8cf7a', 1.2); }
    }
    c.restore();
  }
  function drawHuman(c, o) {
    const t = o.t || 0, moving = !!o.moving, air = !!o.air, cl = !!o.climb;
    const bob = (air || cl) ? 0 : (moving ? Math.abs(Math.sin(o.walk * 5)) * -1.6 : Math.sin(t * 2.6) * 0.7);
    const sw = moving && !air ? Math.sin(o.walk * 5) * 6 : 0;
    const armor = o.armor || '#c9b48a', pants = o.pants || '#5b4a3a', shoes = o.shoes || '#6b4426', skin = o.skin || '#f6d4b2', hair = o.hair || '#4a2f20';
    c.save(); c.scale(o.face < 0 ? -1 : 1, 1);
    if (o.alpha != null) c.globalAlpha = o.alpha;
    const cs = cl ? Math.sin((o.climbT || 0) * 14) * 4 : 0;
    // 다리
    const legY = -11 + bob * 0.3;
    const L = (x, k) => { c.beginPath(); rrect(c, x - 3.2, legY, 6.4, 11 + (air ? -2 : 0), 2.4); fillStroke(c, pants, 1.8); c.beginPath(); ell(c, x + 1.4, -1.8 + (air ? -2 : 0), 5.3, 3.2); fillStroke(c, shoes, 1.8); };
    if (cl) { L(-3, 0); c.save(); c.translate(0, cs); L(3, 1); c.restore(); }
    else if (air) { L(-4, 0); L(4, 1); }
    else { L(-3 - sw, 0); L(3 + sw, 1); }
    // 뒤쪽 팔
    c.save(); c.translate(-5, -23 + bob); c.rotate(cl ? -0.6 - cs * 0.05 : (air ? -1.1 : -0.15 - sw * 0.04)); c.beginPath(); rrect(c, -2.4, 0, 4.8, 11, 2.4); fillStroke(c, shade(armor, -0.15), 1.8); c.beginPath(); c.arc(0, 11.5, 3.1, 0, TAU); fillStroke(c, o.gloves || skin, 1.6); c.restore();
    // 몸통
    c.beginPath(); rrect(c, -8.2, -25 + bob, 16.4, 15.5, 4.5); fillStroke(c, armor, 2);
    c.beginPath(); c.moveTo(-8, -17 + bob); c.lineTo(8, -17 + bob); c.strokeStyle = shade(armor, 0.25); c.lineWidth = 1.2; c.stroke();
    c.beginPath(); rrect(c, -8.4, -13 + bob, 16.8, 3.6, 1.6); fillStroke(c, o.belt || '#6b3e22', 1.4);
    if (o.tier >= 2) { c.beginPath(); ell(c, -6.5, -24 + bob, 5, 3.6); fillStroke(c, shade(armor, 0.1), 1.5); c.beginPath(); ell(c, 6.5, -24 + bob, 5, 3.6); fillStroke(c, shade(armor, 0.1), 1.5); }
    if (o.tier >= 4) { c.beginPath(); c.arc(0, -19 + bob, 2.6, 0, TAU); fillStroke(c, '#e0b83a', 1.2); }
    // 머리
    const hy = -32 + bob;
    c.beginPath(); c.arc(-3, hy - 3, 9, Math.PI * 0.6, Math.PI * 1.9); c.lineTo(-3, hy + 6); fillStroke(c, hair, 1.8);
    c.beginPath(); c.arc(0, hy, 10, 0, TAU); fillStroke(c, skin, 2);
    if (!cl) {
      c.fillStyle = OUT; c.beginPath(); ell(c, 3.4, hy + 0.5, 1.7, 2.5); c.fill(); c.beginPath(); ell(c, 7.2, hy + 0.5, 1.5, 2.3); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(3.9, hy - 0.6, 0.8, 0, TAU); c.fill(); c.beginPath(); c.arc(7.6, hy - 0.4, 0.7, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,120,120,.4)'; c.beginPath(); ell(c, 2.6, hy + 4.3, 2.2, 1.3); c.fill();
      c.strokeStyle = OUT; c.lineWidth = 1.2; c.beginPath(); if (o.hurt) { c.moveTo(4, hy + 6.4); c.lineTo(7, hy + 5.4); } else { c.arc(5.4, hy + 3.6, 1.7, 0.2, Math.PI - 0.2); } c.stroke();
    } else { c.fillStyle = hair; c.beginPath(); c.arc(0, hy - 1, 9.6, Math.PI, TAU); c.fill(); }
    // 앞머리(삐죽)
    c.beginPath(); c.moveTo(-10, hy - 1); c.lineTo(-8, hy - 11); c.lineTo(-4, hy - 7); c.lineTo(0, hy - 13); c.lineTo(3, hy - 8); c.lineTo(8, hy - 11); c.lineTo(10, hy - 3); c.quadraticCurveTo(0, hy - 6, -10, hy - 1); c.closePath(); fillStroke(c, hair, 1.8);
    if (o.helmet) helmet(c, o.helmet, o.helmetCol, hy - 3);
    else if (o.band) { c.beginPath(); rrect(c, -10.2, hy - 6, 20.4, 3.6, 1.6); fillStroke(c, o.band, 1.5); c.beginPath(); c.moveTo(-10, hy - 5); c.lineTo(-16 - Math.sin(t * 6) * 1.5, hy - 2); c.lineTo(-12, hy - 3); c.closePath(); fillStroke(c, o.band, 1.2); }
    if (o.hat) { c.beginPath(); c.moveTo(-12, hy - 6); c.lineTo(12, hy - 6); c.lineTo(7, hy - 17); c.lineTo(-7, hy - 17); c.closePath(); fillStroke(c, o.hat, 1.8); }
    // 앞팔 + 무기
    let ang = air ? -0.7 : 0.1 + sw * 0.03, wang = 0.9, ex = 0;
    const a = o.atk;
    if (a) {
      const u = Math.min(1, a.t / a.dur), k = a.kind, PI = Math.PI;
      const ease = (x) => x * x * (3 - 2 * x), lerp = (p, q, f) => p + (q - p) * f, cl01 = (x) => Math.max(0, Math.min(1, x));
      if (k === 'quake') { ang = u < 0.5 ? lerp(0.2, -2.9, ease(u / 0.5)) : lerp(-2.9, -0.5, ease(cl01((u - 0.5) / 0.18))); }
      else if (k === 'power') { if (u < 0.35) ang = lerp(0.1, 0.8, ease(u / 0.35)); else { const f = ease(cl01((u - 0.35) / 0.2)); ang = lerp(0.8, -1.55, f); ex = lerp(0, 4, f); } }
      else if (k === 'slash') { ang = -1.2 + Math.sin(u * 6.5) * 0.55; }
      else if (a.combo === 1) { ang = u < 0.35 ? lerp(0.1, 0.8, ease(u / 0.35)) : lerp(0.8, -1.7, ease(cl01((u - 0.35) / 0.22))); }
      else if (a.combo === 2) { ang = u < 0.35 ? lerp(0.1, 0.5, ease(u / 0.35)) : lerp(0.5, -2.6, ease(cl01((u - 0.35) / 0.22))); }
      else { ang = u < 0.35 ? lerp(0.1, -2.6, ease(u / 0.35)) : lerp(-2.6, -0.5, ease(cl01((u - 0.35) / 0.22))); }
      wang = PI;
      if (u > 0.72) { const f = ease((u - 0.72) / 0.28); ang = lerp(ang, 0.1, f); wang = lerp(PI, 0.9, f); }
    }
    if (cl) ang = 0.6 + cs * 0.05;
    c.save(); c.translate(5.5 + ex, -23 + bob); c.rotate(ang);
    c.beginPath(); rrect(c, -2.5, 0, 5, 11, 2.4); fillStroke(c, shade(armor, 0.05), 1.8);
    c.translate(0, 11.5);
    if (!cl && o.weapon) { c.save(); c.rotate(wang); weapon(c, o.weapon.wt, o.weapon.col, o.weapon.len || 24); c.restore(); }
    c.beginPath(); c.arc(0, 0, 3.2, 0, TAU); fillStroke(c, o.gloves || skin, 1.6);
    c.restore();
    c.restore();
  }
  A.drawHuman = drawHuman;

  const TIER = { ar0: 0, ar1: 1, ar2: 2, ar3: 3, ar4: 4 };
  A.playerLook = function (G, extra) {
    const p = G.p, D = root.DATA; const eq = p.equip; const ar = D.ITEMS[eq.armor], w = D.ITEMS[eq.weapon], h = eq.helmet && D.ITEMS[eq.helmet], gl = eq.gloves && D.ITEMS[eq.gloves], sh = eq.shoes && D.ITEMS[eq.shoes];
    return Object.assign({ armor: ar ? ar.col : '#c9b48a', tier: ar ? (TIER[ar.id] || 0) : 0, pants: '#5a4636', shoes: sh ? sh.col : '#6b4426', gloves: gl ? gl.col : null, helmet: h ? h.id.replace(/^(hm\d)$/, '$1') : null, helmetCol: h ? h.col : null, band: h ? null : '#d6343c', weapon: w ? { wt: w.wt, col: w.col, len: w.wt === 'great' ? 26 : 24 } : null }, extra || {});
  };
  A.drawPlayer = function (c, G, t) {
    const p = G.p; const look = A.playerLook(G, { t, face: p.face, walk: p.walkT, moving: Math.abs(p.vx) > 18 && p.onGround, air: !p.onGround && !p.climb, climb: !!p.climb, climbT: p.climbT, atk: p.atk, hurt: p.hitFlash > 0 || p.dead });
    if (p.inv_t > 0 && !p.dead && Math.floor(p.inv_t * 14) % 2 === 0 && p.hitFlash <= 0) look.alpha = 0.45;
    drawHuman(c, look);
  };
  const NPCL = {
    elder: { armor: '#8a5aa8', pants: '#4a3560', hair: '#e8e8ee', hat: null, band: null, skin: '#f0cfae', belt: '#d6b04a', tier: 2, cane: true },
    innkeeper: { armor: '#e07a8a', pants: '#6a4a52', hair: '#7a3a22', band: '#fff', belt: '#f4d8a0', tier: 1 },
    merchant: { armor: '#3f9a6a', pants: '#3a5a46', hair: '#2a1d14', hat: '#d9a53a', band: null, belt: '#8a5a22', tier: 1 },
    smith: { armor: '#7a6a5a', pants: '#3a2f28', hair: '#2a1d14', band: '#8a8a8a', belt: '#4a3524', tier: 3, hammer: true },
    miner: { armor: '#c98a3a', pants: '#4a3a2a', hair: '#5a3a22', helmet: 'hm2', helmetCol: '#e0b83a', belt: '#6b3e22', tier: 1, pick: true },
    captain: { armor: '#4a78b8', pants: '#33415a', hair: '#2a2f45', helmet: 'hm4', helmetCol: '#d9c07a', belt: '#e0b83a', tier: 4, spear: true },
    master: { armor: '#b83a2e', pants: '#3a2a26', hair: '#1c1c20', band: '#f4d84a', belt: '#e0b83a', tier: 4, skin: '#e8bf98', weapon: { wt: 'great', col: '#e8eef8', len: 28 } },
  };
  A.drawNpc = function (c, n, t, nearby, noTag) {
    const l = NPCL[n.look] || NPCL.elder;
    c.save(); ell(c, 0, 0, 13, 3.6); c.fillStyle = 'rgba(0,0,0,.28)'; c.fill();
    c.save(); c.translate(0, 0);
    drawHuman(c, Object.assign({ t, face: 1, walk: 0, moving: false }, l, { weapon: l.weapon || null }));
    if (l.pick) { c.save(); c.translate(11, -14); c.rotate(-0.3); c.beginPath(); c.rect(-1.4, -20, 2.8, 26); fillStroke(c, '#7a4a2a', 1.4); c.beginPath(); c.moveTo(-10, -20); c.quadraticCurveTo(0, -27, 10, -20); c.lineTo(8, -18); c.quadraticCurveTo(0, -23, -8, -18); c.closePath(); fillStroke(c, '#9aa3b0', 1.4); c.restore(); }
    if (l.hammer) { c.save(); c.translate(12, -12); c.rotate(0.4 + Math.sin(t * 3) * 0.05); c.beginPath(); c.rect(-1.4, -18, 2.8, 24); fillStroke(c, '#7a4a2a', 1.4); c.beginPath(); rrect(c, -7, -24, 14, 9, 2); fillStroke(c, '#7a828e', 1.6); c.restore(); }
    if (l.spear) { c.save(); c.translate(-12, -2); c.beginPath(); c.rect(-1.4, -52, 2.8, 56); fillStroke(c, '#8a5a32', 1.4); c.beginPath(); c.moveTo(0, -62); c.lineTo(-4, -50); c.lineTo(4, -50); c.closePath(); fillStroke(c, '#dfe6f0', 1.4); c.restore(); }
    if (l.cane) { c.save(); c.translate(12, -2); c.beginPath(); c.rect(-1.4, -28, 2.8, 30); fillStroke(c, '#8a5a32', 1.4); c.restore(); }
    c.restore();
    // 이름표
    if (!noTag) { c.font = 'bold 11px sans-serif'; c.textAlign = 'center'; const w = c.measureText(n.n).width + 12;
    c.fillStyle = 'rgba(20,14,10,.78)'; rrect(c, -w / 2, 6, w, 15, 6); c.fill(); c.fillStyle = '#ffe9b0'; c.fillText(n.n, 0, 17); }
    // 퀘스트 말풍선
    if (n.mark) { const bob = Math.sin(t * 4) * 2.5; c.font = 'bold 22px sans-serif'; c.lineWidth = 4; c.strokeStyle = OUT; c.fillStyle = n.mark === '?' ? '#ffd94a' : n.mark === '!' ? '#ffe45e' : '#9fb4c8'; c.strokeText(n.mark, 0, -58 + bob); c.fillText(n.mark, 0, -58 + bob); }
    else if (n.role === 'shop') { c.font = '16px sans-serif'; c.fillText('🛒', 0, -56 + Math.sin(t * 3) * 2); }
    else if (n.role === 'inn') { c.font = '16px sans-serif'; c.fillText('🛏️', 0, -56 + Math.sin(t * 3) * 2); }
    c.restore();
  };

  /* ───────── 몬스터 ───────── */
  const eyeDots = (c, x, y, s) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, 3.4 * s, 0, TAU); c.fill(); c.lineWidth = 1.4; c.strokeStyle = OUT; c.stroke(); c.fillStyle = OUT; c.beginPath(); c.arc(x + 0.8 * s, y + 0.4 * s, 1.7 * s, 0, TAU); c.fill(); };
  const MONART = {
    snail(c, m, t) {
      const blue = m.def.hue === 'blue'; const shell = blue ? '#4f8fe8' : '#e8892b', body = blue ? '#c6e2ff' : '#f4dc96';
      const sq = 1 + Math.sin(t * 4 + m.seed) * 0.07;
      c.save(); c.scale(sq, 2 - sq);
      c.beginPath(); c.moveTo(-14, 0); c.quadraticCurveTo(-15, -9, -5, -9); c.lineTo(10, -9); c.quadraticCurveTo(16, -10, 15, -17); c.quadraticCurveTo(17, -6, 15, 0); c.closePath(); fillStroke(c, body, 2);
      c.restore();
      c.strokeStyle = OUT; c.lineWidth = 1.8; c.beginPath(); c.moveTo(12, -15); c.lineTo(11, -23); c.moveTo(15, -14); c.lineTo(17, -22); c.stroke(); c.fillStyle = OUT; c.beginPath(); c.arc(11, -24, 2, 0, TAU); c.arc(17, -23, 2, 0, TAU); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(11.4, -24.4, 0.7, 0, TAU); c.arc(17.4, -23.4, 0.7, 0, TAU); c.fill();
      c.beginPath(); c.arc(-3, -15, 11.5, 0, TAU); fillStroke(c, shell, 2); c.beginPath(); c.arc(-3, -15, 7, 0, TAU); c.strokeStyle = shade(shell, -0.35); c.lineWidth = 1.6; c.stroke(); c.beginPath(); c.arc(-3, -15, 3.2, 0, TAU); c.stroke(); c.beginPath(); c.arc(-6, -19, 3, 3.5, 5); c.strokeStyle = 'rgba(255,255,255,.6)'; c.stroke();
      c.fillStyle = OUT; c.beginPath(); c.arc(13, -5, 1.2, 0, TAU); c.fill();
    },
    stump(c, m, t) {
      const h = m.def.hue; const wood = h === 'dark' ? '#54405e' : h === 'axe' ? '#8f5e34' : '#9a6a3c', ring = h === 'dark' ? '#8a6aa0' : '#d9a86a';
      const sq = Math.sin(t * 5 + m.seed) * 1.4; const wd = m.def.w * 0.5, ht = m.def.h;
      c.save(); c.translate(0, -sq * 0.3);
      c.beginPath(); c.moveTo(-wd, 0); c.quadraticCurveTo(-wd - 3, -ht * 0.5, -wd + 3, -ht + 6); c.lineTo(wd - 3, -ht + 6); c.quadraticCurveTo(wd + 3, -ht * 0.5, wd, 0); c.closePath(); fillStroke(c, wood, 2.2);
      c.strokeStyle = shade(wood, -0.3); c.lineWidth = 1.4; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(i * 8, -ht + 10); c.lineTo(i * 8 + (i ? i * 2 : 0), -4); c.stroke(); }
      c.beginPath(); ell(c, 0, -ht + 5, wd - 1, 6); fillStroke(c, ring, 2); c.beginPath(); ell(c, 0, -ht + 5, wd * 0.55, 3.2); c.strokeStyle = shade(ring, -0.3); c.lineWidth = 1.2; c.stroke();
      // 얼굴
      const ey = -ht * 0.5; c.fillStyle = '#fff'; if (h === 'dark') { c.fillStyle = '#ff4a5a'; }
      c.beginPath(); ell(c, 5, ey, 4, 5); c.fill(); c.beginPath(); ell(c, 13, ey, 3.6, 4.6); c.fill(); c.lineWidth = 1.4; c.strokeStyle = OUT; c.stroke(); c.fillStyle = OUT; c.beginPath(); c.arc(6, ey + 0.8, 1.8, 0, TAU); c.arc(13.6, ey + 0.8, 1.7, 0, TAU); c.fill();
      c.strokeStyle = OUT; c.lineWidth = 2; c.beginPath(); c.moveTo(1, ey - 6); c.lineTo(9, ey - 4); c.moveTo(11, ey - 4); c.lineTo(17, ey - 6); c.stroke();
      c.beginPath(); c.arc(9, ey + 8, 3, 0.2, Math.PI - 0.2); c.stroke();
      // 새싹
      c.beginPath(); c.moveTo(0, -ht + 2); c.lineTo(0, -ht - 6); c.strokeStyle = '#3a6a2a'; c.lineWidth = 2; c.stroke();
      c.beginPath(); c.ellipse(-4, -ht - 8, 6, 3, -0.5, 0, TAU); fillStroke(c, h === 'dark' ? '#6a4a8a' : '#5cc24a', 1.5); c.beginPath(); c.ellipse(4, -ht - 9, 6, 3, 0.5, 0, TAU); fillStroke(c, h === 'dark' ? '#7a5a9a' : '#6ed25a', 1.5);
      // 뿌리 발
      c.beginPath(); ell(c, -wd * 0.55, -1, 6, 3.2); fillStroke(c, shade(wood, -0.15), 1.6); c.beginPath(); ell(c, wd * 0.55, -1, 6, 3.2); fillStroke(c, shade(wood, -0.15), 1.6);
      if (h === 'axe') { c.save(); c.translate(-wd + 1, -ht * 0.45); c.rotate(-0.5 + Math.sin(t * 6) * 0.15); c.beginPath(); c.rect(-1.6, -20, 3.2, 24); fillStroke(c, '#6b4426', 1.4); c.beginPath(); c.moveTo(1, -20); c.quadraticCurveTo(14, -24, 12, -10); c.lineTo(1, -11); c.closePath(); fillStroke(c, '#b5bcc8', 1.6); c.restore(); }
      c.restore();
    },
    woodmask(c, m, t) {
      const st = m.def.hue === 'stone'; const base = st ? '#8d939c' : '#b4854a'; const hop = m.y < m.py - 2 ? 0 : Math.abs(Math.sin(t * 6 + m.seed)) * 2;
      c.save(); c.translate(0, -hop);
      c.beginPath(); rrect(c, -9, -10, 6, 10, 2); fillStroke(c, shade(base, -0.25), 1.6); c.beginPath(); rrect(c, 3, -10, 6, 10, 2); fillStroke(c, shade(base, -0.25), 1.6);
      c.beginPath(); c.moveTo(0, -42); c.quadraticCurveTo(15, -40, 15, -24); c.quadraticCurveTo(14, -10, 0, -8); c.quadraticCurveTo(-14, -10, -15, -24); c.quadraticCurveTo(-15, -40, 0, -42); c.closePath(); fillStroke(c, base, 2.2);
      c.strokeStyle = shade(base, -0.3); c.lineWidth = 1.3; c.beginPath(); c.moveTo(0, -42); c.lineTo(0, -34); c.moveTo(-10, -36); c.lineTo(-5, -34); c.moveTo(10, -36); c.lineTo(5, -34); c.stroke();
      if (st) { c.beginPath(); c.moveTo(6, -40); c.lineTo(10, -30); c.lineTo(5, -26); c.stroke(); }
      c.fillStyle = OUT; c.beginPath(); c.moveTo(-10, -28); c.lineTo(-3, -26); c.lineTo(-6, -20); c.closePath(); c.fill(); c.beginPath(); c.moveTo(10, -28); c.lineTo(3, -26); c.lineTo(6, -20); c.closePath(); c.fill();
      c.fillStyle = st ? '#7ae0ff' : '#ffd24a'; c.beginPath(); c.arc(-6, -24, 1.6, 0, TAU); c.arc(6, -24, 1.6, 0, TAU); c.fill();
      c.beginPath(); ell(c, 0, -14, 4.5, 3); c.fillStyle = OUT; c.fill();
      c.restore();
    },
    ant(c, m, t) {
      const h = m.def.hue; const col = h === 'soldier' ? '#c4452d' : h === 'zombie' ? '#7aa05a' : '#5a3a2a'; const w = Math.sin(t * 10 + m.seed);
      c.strokeStyle = OUT; c.lineWidth = 2; for (let i = 0; i < 3; i++) { const x = -8 + i * 8; c.beginPath(); c.moveTo(x, -8); c.lineTo(x + 3 + w * (i % 2 ? 2 : -2), 0); c.moveTo(x, -8); c.lineTo(x - 4 + w * (i % 2 ? -2 : 2), 0); c.stroke(); }
      c.beginPath(); ell(c, -13, -12, 10, 8); fillStroke(c, col, 2);
      c.beginPath(); ell(c, 0, -11, 6.5, 6); fillStroke(c, shade(col, 0.05), 2);
      c.beginPath(); ell(c, 12, -13, 8, 7.5); fillStroke(c, shade(col, 0.12), 2);
      c.strokeStyle = OUT; c.lineWidth = 1.6; c.beginPath(); c.moveTo(14, -19); c.quadraticCurveTo(18, -27, 24, -26); c.moveTo(11, -19); c.quadraticCurveTo(12, -28, 18, -30); c.stroke();
      eyeDots(c, 14, -14, 0.8);
      c.beginPath(); c.moveTo(18, -10); c.lineTo(24, -8); c.lineTo(19, -6); c.closePath(); fillStroke(c, h === 'soldier' ? '#f2e2b0' : '#c9c9c9', 1.4);
      if (h === 'zombie') { c.fillStyle = '#d96a7a'; c.beginPath(); c.arc(-14, -14, 3, 0, TAU); c.fill(); c.fillStyle = '#4a6a3a'; c.beginPath(); c.arc(-10, -9, 1.6, 0, TAU); c.fill(); }
      if (h === 'soldier') { c.fillStyle = '#e8c04a'; c.beginPath(); c.rect(-17, -13, 3, 6); c.fill(); }
    },
    boar(c, m, t) {
      const wind = m.st === 'wind'; const sh = wind ? Math.sin(t * 60) * 1.5 : 0; const run = m.st === 'dash';
      c.save(); c.translate(sh, 0);
      c.strokeStyle = OUT; c.lineWidth = 2; const lg = Math.sin(t * (run ? 24 : 10));
      c.beginPath(); rrect(c, -14, -9, 6, 9 + lg * 1.5, 2); fillStroke(c, '#7a2a1c', 1.6); c.beginPath(); rrect(c, 8, -9, 6, 9 - lg * 1.5, 2); fillStroke(c, '#7a2a1c', 1.6);
      c.beginPath(); c.moveTo(-22, -16); c.quadraticCurveTo(-18, -34, 0, -33); c.quadraticCurveTo(18, -33, 22, -18); c.quadraticCurveTo(22, -8, 10, -8); c.lineTo(-14, -8); c.quadraticCurveTo(-22, -9, -22, -16); c.closePath(); fillStroke(c, '#c4452d', 2.2);
      for (let i = 0; i < 4; i++) { const fx = -14 + i * 9, fl = 8 + Math.sin(t * 9 + i * 1.7) * 3; c.beginPath(); c.moveTo(fx - 4, -30 + i); c.quadraticCurveTo(fx, -30 - fl - 4, fx + 2, -30 - fl - 10); c.quadraticCurveTo(fx + 6, -30 - fl, fx + 5, -29); c.closePath(); c.fillStyle = i % 2 ? '#ffb23a' : '#ff6a2a'; c.fill(); }
      c.beginPath(); ell(c, 24, -17, 9, 8); fillStroke(c, '#d65a3a', 2.2); c.beginPath(); ell(c, 30, -14, 4, 3.6); fillStroke(c, '#f0a08a', 1.6); c.fillStyle = OUT; c.beginPath(); c.arc(29, -14, 0.9, 0, TAU); c.arc(32, -14, 0.9, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(26, -10); c.quadraticCurveTo(34, -10, 33, -20); c.quadraticCurveTo(30, -12, 25, -10); c.closePath(); fillStroke(c, '#f6ecd0', 1.4);
      c.beginPath(); c.moveTo(20, -24); c.lineTo(17, -31); c.lineTo(24, -26); c.closePath(); fillStroke(c, '#7a2a1c', 1.4);
      c.fillStyle = wind ? '#ffee66' : '#fff'; c.beginPath(); c.arc(24, -20, 2.8, 0, TAU); c.fill(); c.lineWidth = 1.3; c.strokeStyle = OUT; c.stroke(); c.fillStyle = OUT; c.beginPath(); c.arc(25, -19.5, 1.4, 0, TAU); c.fill();
      c.restore();
    },
    golem(c, m, t) {
      const fire = m.def.hue === 'fire'; const rock = fire ? '#6a4038' : '#8d939c'; const glow = fire ? '#ff7a2a' : '#6fd0e8'; const b = Math.sin(t * 2 + m.seed) * 1;
      const wd = m.def.w, ht = m.def.h; const g = (x, y, w, h, r, col) => { c.beginPath(); rrect(c, x, y, w, h, r); fillStroke(c, col || rock, 2.2); };
      g(-wd * 0.34, -ht * 0.22, wd * 0.26, ht * 0.22, 4, shade(rock, -0.12)); g(wd * 0.08, -ht * 0.22, wd * 0.26, ht * 0.22, 4, shade(rock, -0.12));
      const sw = Math.sin(t * 3) * 3;
      g(-wd * 0.72, -ht * 0.66 + sw, wd * 0.22, ht * 0.34, 5, shade(rock, -0.08)); g(wd * 0.5, -ht * 0.66 - sw, wd * 0.22, ht * 0.34, 5, shade(rock, -0.08));
      g(-wd * 0.78, -ht * 0.34 + sw, wd * 0.3, ht * 0.18, 5, shade(rock, 0.05)); g(wd * 0.48, -ht * 0.34 - sw, wd * 0.3, ht * 0.18, 5, shade(rock, 0.05));
      g(-wd * 0.42, -ht * 0.74 + b, wd * 0.84, ht * 0.55, 8, rock);
      c.strokeStyle = glow; c.lineWidth = 2; c.shadowColor = glow; c.shadowBlur = 6; c.beginPath(); c.moveTo(-wd * 0.2, -ht * 0.6 + b); c.lineTo(-wd * 0.05, -ht * 0.45 + b); c.lineTo(-wd * 0.18, -ht * 0.3 + b); c.moveTo(wd * 0.22, -ht * 0.66 + b); c.lineTo(wd * 0.1, -ht * 0.5 + b); c.stroke(); c.shadowBlur = 0;
      g(-wd * 0.25, -ht * 1.0 + b, wd * 0.5, ht * 0.3, 7, shade(rock, 0.08));
      c.fillStyle = glow; c.shadowColor = glow; c.shadowBlur = 8; c.beginPath(); c.rect(-wd * 0.15, -ht * 0.88 + b, wd * 0.1, ht * 0.06); c.rect(wd * 0.05, -ht * 0.88 + b, wd * 0.1, ht * 0.06); c.fill(); c.shadowBlur = 0;
      if (fire) { for (let i = 0; i < 3; i++) { const fx = -12 + i * 12; c.beginPath(); c.moveTo(fx - 4, -ht * 1.0); c.quadraticCurveTo(fx, -ht * 1.0 - 14 - Math.sin(t * 8 + i) * 4, fx + 4, -ht * 1.0); c.fillStyle = i === 1 ? '#ffd24a' : '#ff7a2a'; c.fill(); } }
    },
    bosstree(c, m, t) {
      const wind = m.st === 'wind'; const sh = wind ? Math.sin(t * 50) * 2 : 0; const b = Math.sin(t * 1.6) * 2;
      c.save(); c.translate(sh, 0);
      const trunk = '#6a4528'; c.beginPath(); c.moveTo(-44, 0); c.quadraticCurveTo(-52, -50, -36, -92 + b); c.lineTo(36, -92 + b); c.quadraticCurveTo(52, -50, 44, 0); c.closePath(); fillStroke(c, trunk, 3);
      c.strokeStyle = shade(trunk, -0.35); c.lineWidth = 2; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * 12, -86); c.lineTo(i * 13, -6); c.stroke(); }
      const armUp = wind && m.atkn === 'slam' ? -1 : 0.25 + Math.sin(t * 2) * 0.15;
      for (const d of [-1, 1]) { c.save(); c.translate(d * 40, -62); c.rotate(d * (1.0 + armUp)); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(d * 14, -20, d * 8, -52); c.lineTo(d * -2, -52); c.quadraticCurveTo(d * 4, -22, -8 * d, 6); c.closePath(); fillStroke(c, trunk, 2.6); for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(d * (6 + k * 3), -50 - k * 4, 9, 5, d * (0.4 + k * 0.5), 0, TAU); fillStroke(c, k % 2 ? '#4aa83e' : '#62c04e', 1.8); } c.restore(); }
      c.beginPath(); c.arc(0, -108 + b, 44, 0, TAU); fillStroke(c, '#3f9a36', 3); for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + t * 0.1; c.beginPath(); c.arc(Math.cos(a) * 30, -108 + b + Math.sin(a) * 22, 14, 0, TAU); fillStroke(c, i % 2 ? '#4cb040' : '#58c04a', 2); }
      const ey = -64 + b; c.fillStyle = m.p2 ? '#ff4a3a' : '#ffe27a'; c.shadowColor = c.fillStyle; c.shadowBlur = 8;
      c.beginPath(); c.moveTo(-26, ey - 6); c.lineTo(-8, ey); c.lineTo(-24, ey + 8); c.closePath(); c.fill(); c.beginPath(); c.moveTo(26, ey - 6); c.lineTo(8, ey); c.lineTo(24, ey + 8); c.closePath(); c.fill(); c.shadowBlur = 0;
      c.strokeStyle = OUT; c.lineWidth = 3; c.beginPath(); c.moveTo(-28, ey - 14); c.lineTo(-6, ey - 6); c.moveTo(28, ey - 14); c.lineTo(6, ey - 6); c.stroke();
      c.beginPath(); c.moveTo(-18, ey + 24); c.quadraticCurveTo(0, ey + 14, 18, ey + 24); c.quadraticCurveTo(0, ey + 40, -18, ey + 24); c.closePath(); fillStroke(c, '#2a0f12', 2.4);
      c.fillStyle = '#e9e2d0'; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * 6 - 2, ey + 22); c.lineTo(i * 6 + 2, ey + 22); c.lineTo(i * 6, ey + 28); c.fill(); }
      c.restore();
    },
    bossgolem(c, m, t) {
      const wind = m.st === 'wind'; const sh = wind ? Math.sin(t * 50) * 2 : 0; const b = Math.sin(t * 1.8) * 1.5; const gold = '#ffd24a'; const rock = '#5e5870';
      c.save(); c.translate(sh, 0);
      const g = (x, y, w, h, r, col) => { c.beginPath(); rrect(c, x, y, w, h, r); fillStroke(c, col || rock, 3); };
      g(-38, -34, 28, 34, 6, shade(rock, -0.15)); g(10, -34, 28, 34, 6, shade(rock, -0.15));
      const up = wind ? -34 : Math.sin(t * 2.2) * 5;
      g(-72, -92 + up, 26, 54, 8, shade(rock, -0.05)); g(46, -92 - up * 0.4, 26, 54, 8, shade(rock, -0.05));
      g(-80, -50 + up, 38, 30, 8, shade(rock, 0.06)); g(42, -50 - up * 0.4, 38, 30, 8, shade(rock, 0.06));
      g(-46, -98 + b, 92, 70, 12, rock);
      c.strokeStyle = gold; c.lineWidth = 3; c.shadowColor = gold; c.shadowBlur = 8; c.beginPath(); c.moveTo(-30, -84 + b); c.lineTo(-10, -70 + b); c.lineTo(-24, -54 + b); c.moveTo(30, -84 + b); c.lineTo(10, -66 + b); c.lineTo(26, -50 + b); c.moveTo(-6, -90 + b); c.lineTo(6, -60 + b); c.stroke(); c.shadowBlur = 0;
      g(-28, -140 + b, 56, 46, 10, shade(rock, 0.1));
      c.fillStyle = m.p2 ? '#ff4a3a' : gold; c.shadowColor = c.fillStyle; c.shadowBlur = 10; c.beginPath(); c.rect(-18, -122 + b, 12, 8); c.rect(6, -122 + b, 12, 8); c.fill(); c.shadowBlur = 0;
      c.beginPath(); c.moveTo(-14, -146 + b); c.lineTo(-8, -166 + b); c.lineTo(0, -148 + b); c.lineTo(8, -170 + b); c.lineTo(14, -146 + b); c.closePath(); fillStroke(c, gold, 2.4);
      c.strokeStyle = OUT; c.lineWidth = 3; c.beginPath(); c.moveTo(-16, -106 + b); c.lineTo(16, -106 + b); c.stroke();
      c.restore();
    },
  };
  const tmp = document.createElement('canvas'); tmp.width = 260; tmp.height = 260; const tc = tmp.getContext('2d');
  A.drawMon = function (c, m, t) {
    const fn = MONART[m.def.art]; if (!fn) return;
    const big = m.def.boss; const sc = big ? 1 : 1.12;
    c.save(); ell(c, 0, 0, m.def.w * 0.55, big ? 8 : 4); c.fillStyle = 'rgba(0,0,0,.3)'; c.fill();
    c.scale(m.face < 0 ? -sc : sc, sc);
    let a = 1; if (m.dead) { const u = Math.min(1, m.deadT / (big ? 1.6 : 0.5)); a = 1 - u; c.rotate(u * 0.3 * (m.face)); c.scale(1 + u * 0.1, 1 - u * 0.5); }
    if (m.spawnT > 0) a *= 0.4;
    if (m.flash > 0 && !m.dead) {
      tc.setTransform(1, 0, 0, 1, 0, 0); tc.clearRect(0, 0, 260, 260); tc.setTransform(1, 0, 0, 1, 130, 200); fn(tc, m, t);
      tc.setTransform(1, 0, 0, 1, 0, 0); tc.globalCompositeOperation = 'source-atop'; tc.fillStyle = 'rgba(255,255,255,.75)'; tc.fillRect(0, 0, 260, 260); tc.globalCompositeOperation = 'source-over';
      c.drawImage(tmp, -130, -200);
    } else { c.globalAlpha = a; fn(c, m, t); }
    c.restore();
  };

  /* ───────── 배경 ───────── */
  const THEMES = {
    town: { sky: ['#ffd9a0', '#ffb27a', '#e8805a'], far: '#d9835a', mid: '#b8664a', near: '#8f4a38', grass: '#6aa84a', soil: '#9a5a3a', rock: '#7a4430', sun: true, kind: 'mesa' },
    rock: { sky: ['#7fc8ff', '#b8e4ff', '#ffe9c0'], far: '#b89a8a', mid: '#a0785f', near: '#8a5f48', grass: '#6cc04a', soil: '#9a6a44', rock: '#7a5338', sun: true, kind: 'mesa' },
    rock2: { sky: ['#6ab4f0', '#a8d8f8', '#ffd9a8'], far: '#a88a7a', mid: '#8f6a52', near: '#74503c', grass: '#5ca83e', soil: '#8a5a3a', rock: '#6a4630', sun: true, kind: 'mesa' },
    forest: { sky: ['#1d3a3a', '#2f6a56', '#8ac28a'], far: '#1f4a3a', mid: '#173a2c', near: '#10281f', grass: '#4a9a3a', soil: '#5a3f2a', rock: '#47301f', kind: 'forest', fire: true },
    cave: { sky: ['#1a1218', '#2a1c22', '#3d2a2a'], far: '#2a1d22', mid: '#3a2a2c', near: '#4a3633', grass: '#6a8a3a', soil: '#5a4030', rock: '#463024', kind: 'cave' },
    cave2: { sky: ['#0f0a18', '#1d1230', '#2e1c44'], far: '#1c1230', mid: '#2a1c42', near: '#38275a', grass: '#7a6aa0', soil: '#46345c', rock: '#32224a', kind: 'cave', crystal: true },
    quarry: { sky: ['#e8884a', '#f4b46a', '#ffe0a0'], far: '#b86a4a', mid: '#9a5440', near: '#7a4032', grass: '#c4a45a', soil: '#8a5a40', rock: '#6a4030', kind: 'mesa', dust: true },
    temple: { sky: ['#140e24', '#2a1a48', '#4a2a68'], far: '#2a1d48', mid: '#3a2a60', near: '#4a3878', grass: '#8a78c0', soil: '#4a3a66', rock: '#352850', kind: 'temple' },
  };
  A.THEMES = THEMES;
  function layer(w, h, fn) { const cv = document.createElement('canvas'); cv.width = Math.ceil(w); cv.height = Math.ceil(h); const c = cv.getContext('2d'); fn(c, w, h); return cv; }
  function mountains(c, w, h, base, col, amp, rnd, step, spiky) {
    c.beginPath(); c.moveTo(0, h); let x = 0; c.lineTo(0, base);
    while (x < w) { const sw = step * (0.6 + rnd() * 0.9); const peak = base - amp * (0.4 + rnd() * 0.6); if (spiky) { c.lineTo(x + sw * 0.4, peak); c.lineTo(x + sw, base - amp * rnd() * 0.2); } else { c.lineTo(x + sw * 0.15, peak); c.lineTo(x + sw * 0.85, peak + 3); c.lineTo(x + sw, base - amp * rnd() * 0.15); } x += sw; }
    c.lineTo(w, h); c.closePath(); c.fillStyle = col; c.fill();
  }
  A.buildBg = function (map, vw, vh) {
    const th = THEMES[map.theme] || THEMES.rock; const rnd = seeded(map.w * 7 + map.h); const H = Math.max(vh + 120, map.h);
    const L = { th, layers: [] };
    L.sky = layer(8, 360, (c) => { const g = c.createLinearGradient(0, 0, 0, 360); g.addColorStop(0, th.sky[0]); g.addColorStop(0.55, th.sky[1]); g.addColorStop(1, th.sky[2]); c.fillStyle = g; c.fillRect(0, 0, 8, 360); });
    const mk = (f, colr, base, amp, step, spiky, extra) => ({ f, cv: layer(map.w * f + vw + 40, H, (c, w, h) => { mountains(c, w, h, base, colr, amp, rnd, step, spiky); if (extra) extra(c, w, h); }) });
    const gy = map.plats[0].y;
    if (th.kind === 'mesa') {
      L.layers.push(mk(0.12, th.far, gy - 120, 120, 260, false, (c, w, h) => { c.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < w / 150; i++) { c.fillRect(rnd() * w, gy - 200 + rnd() * 80, 40 + rnd() * 60, 2); } }));
      L.layers.push(mk(0.3, th.mid, gy - 60, 130, 200, true, (c, w, h) => { c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 2; for (let i = 0; i < w / 60; i++) { const x = rnd() * w; c.beginPath(); c.moveTo(x, gy - 40 - rnd() * 80); c.lineTo(x + rnd() * 16 - 8, gy + 10); c.stroke(); } }));
      L.layers.push(mk(0.55, th.near, gy - 20, 70, 150, false, (c, w, h) => { for (let i = 0; i < w / 110; i++) { const x = rnd() * w, y = gy - 4; c.fillStyle = '#4a7a38'; c.beginPath(); c.arc(x, y - 12, 14 + rnd() * 6, 0, TAU); c.arc(x + 14, y - 6, 10, 0, TAU); c.fill(); c.fillStyle = '#3a2a1c'; c.fillRect(x - 2, y - 8, 4, 12); } }));
    } else if (th.kind === 'forest') {
      L.layers.push(mk(0.1, th.far, gy - 100, 100, 180, true));
      L.layers.push({ f: 0.3, cv: layer(map.w * 0.3 + vw + 40, H, (c, w, h) => { for (let i = 0; i < w / 70; i++) { const x = i * 70 + rnd() * 30, th2 = 22 + rnd() * 20; c.fillStyle = th.mid; c.fillRect(x, 0, th2, h); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(x + th2 * 0.6, 0, th2 * 0.4, h); } }) });
      L.layers.push({ f: 0.55, cv: layer(map.w * 0.55 + vw + 40, H, (c, w, h) => { c.fillStyle = th.near; for (let i = 0; i < w / 130; i++) { const x = i * 130 + rnd() * 60, tw = 40 + rnd() * 30; c.fillRect(x, 0, tw, h); c.beginPath(); c.arc(x + tw / 2, gy - 220 + rnd() * 40, 80 + rnd() * 30, 0, TAU); c.fillStyle = '#16402e'; c.fill(); c.fillStyle = th.near; } }) });
    } else if (th.kind === 'cave') {
      const cry = !!th.crystal;
      L.layers.push(mk(0.15, th.far, gy - 80, 110, 220, true));
      L.layers.push({ f: 0.35, cv: layer(map.w * 0.35 + vw + 40, H, (c, w, h) => { c.fillStyle = th.mid; for (let i = 0; i < w / 90; i++) { const x = i * 90 + rnd() * 40, l = 40 + rnd() * 120; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 28, 0); c.lineTo(x + 14, l); c.closePath(); c.fill(); } for (let i = 0; i < w / 120; i++) { const x = rnd() * w, hh = 40 + rnd() * 70; c.beginPath(); c.moveTo(x, h); c.lineTo(x + 40, h); c.lineTo(x + 20, h - hh); c.closePath(); c.fillStyle = th.near; c.fill(); } }) });
      L.layers.push({ f: 0.6, cv: layer(map.w * 0.6 + vw + 40, H, (c, w, h) => { for (let i = 0; i < w / 100; i++) { const x = rnd() * w, y = gy - 10 - rnd() * 150; if (cry) { for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(x + k * 8, y); c.lineTo(x + k * 8 + 6, y - 22 - rnd() * 14); c.lineTo(x + k * 8 + 12, y); c.closePath(); c.fillStyle = k % 2 ? '#8a6aff' : '#5ac8ff'; c.shadowColor = c.fillStyle; c.shadowBlur = 14; c.fill(); } c.shadowBlur = 0; } else { c.fillStyle = '#e8dcc0'; c.fillRect(x, y - 8, 3, 8); c.beginPath(); c.arc(x + 1.5, y - 10, 9, Math.PI, 0); c.fillStyle = rnd() < 0.5 ? '#ff8a5a' : '#ffd24a'; c.shadowColor = c.fillStyle; c.shadowBlur = 12; c.fill(); c.shadowBlur = 0; } } }) });
    } else if (th.kind === 'temple') {
      L.layers.push(mk(0.12, th.far, gy - 100, 90, 240, false));
      L.layers.push({ f: 0.35, cv: layer(map.w * 0.35 + vw + 40, H, (c, w, h) => { for (let i = 0; i < w / 160; i++) { const x = i * 160 + 40; c.fillStyle = th.mid; c.fillRect(x, 0, 46, h); c.fillStyle = th.near; c.fillRect(x - 6, gy - 30, 58, 30); c.fillRect(x - 6, 0, 58, 22); c.strokeStyle = '#ffd24a'; c.globalAlpha = 0.5; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 23, 40); c.lineTo(x + 12, 70); c.lineTo(x + 34, 96); c.stroke(); c.globalAlpha = 1; } }) });
      L.layers.push({ f: 0.6, cv: layer(map.w * 0.6 + vw + 40, H, (c, w, h) => { for (let i = 0; i < w / 220; i++) { const x = i * 220 + 90; c.fillStyle = th.near; c.fillRect(x, 0, 6, 120 + rnd() * 60); c.beginPath(); c.arc(x + 3, 130 + rnd() * 60, 9, 0, TAU); c.fillStyle = '#ffb23a'; c.shadowColor = '#ffb23a'; c.shadowBlur = 16; c.fill(); c.shadowBlur = 0; } }) });
    }
    // 구름(rock 계열)
    L.clouds = (th.kind === 'mesa' && !th.dust) ? Array.from({ length: 7 }, () => ({ x: rnd() * 1400, y: 20 + rnd() * 120, s: 0.6 + rnd() * 0.8, v: 3 + rnd() * 5 })) : [];
    L.sun = !!th.sun;
    return L;
  };
  A.drawBg = function (c, L, camX, camY, vw, vh, t) {
    const th = L.th; c.drawImage(L.sky, 0, 0, 8, 360, 0, 0, vw, vh);
    if (L.sun) { const g = c.createRadialGradient(vw * 0.78, vh * 0.2, 4, vw * 0.78, vh * 0.2, 90); g.addColorStop(0, 'rgba(255,250,210,.95)'); g.addColorStop(0.25, 'rgba(255,240,170,.55)'); g.addColorStop(1, 'rgba(255,230,150,0)'); c.fillStyle = g; c.fillRect(0, 0, vw, vh); }
    for (const cl of L.clouds) { const x = ((cl.x + t * cl.v) % (vw + 300)) - 150; c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.arc(x, cl.y, 16 * cl.s, 0, TAU); c.arc(x + 18 * cl.s, cl.y - 6 * cl.s, 20 * cl.s, 0, TAU); c.arc(x + 40 * cl.s, cl.y, 15 * cl.s, 0, TAU); c.fill(); }
    for (const ly of L.layers) { let sx = camX * ly.f, dx = 0; if (sx < 0) { dx = -sx; sx = 0; } const sw = Math.min(vw - dx, ly.cv.width - sx); if (sw > 0) c.drawImage(ly.cv, sx, Math.max(0, camY), sw, vh, dx, 0, sw, vh); }
    if (th.fire) { c.fillStyle = 'rgba(255,240,150,.8)'; for (let i = 0; i < 14; i++) { const x = (i * 97 + Math.sin(t * 0.7 + i) * 40 + t * 6 * (i % 3)) % vw, y = (i * 53 + Math.cos(t * 0.9 + i * 2) * 30) % (vh - 80); c.globalAlpha = 0.4 + 0.4 * Math.sin(t * 2 + i); c.beginPath(); c.arc(x, y + 60, 1.6, 0, TAU); c.fill(); } c.globalAlpha = 1; }
    if (th.dust) { c.fillStyle = 'rgba(255,220,170,.18)'; for (let i = 0; i < 8; i++) { const x = ((i * 190 + t * 24) % (vw + 200)) - 100; c.fillRect(x, 40 + i * 30, 160, 14); } }
  };

  /* ───────── 지형·소품 (맵 하나를 통째로 미리 그림) ───────── */
  A.buildFore = function (map) {
    const th = THEMES[map.theme] || THEMES.rock; const rnd = seeded(map.w + 31);
    const W = map.w, Ht = map.h + 80;
    const cv = layer(W, Ht, (c) => {
      // 건물(마을)
      if (map.town) townDecor(c, map, rnd);
      // 사다리/밧줄
      for (const l of map.ladders) { c.strokeStyle = OUT; c.lineWidth = 6; c.beginPath(); c.moveTo(l.x, l.y1); c.lineTo(l.x, l.y2); c.stroke(); c.strokeStyle = '#c9a56a'; c.lineWidth = 3.4; c.beginPath(); c.moveTo(l.x, l.y1); c.lineTo(l.x, l.y2); c.stroke(); c.strokeStyle = '#8a6a3a'; c.lineWidth = 1.2; for (let y = l.y1 + 6; y < l.y2; y += 10) { c.beginPath(); c.moveTo(l.x - 3.4, y); c.lineTo(l.x + 3.4, y + 3); c.stroke(); } }
      // 발판
      for (const p of map.plats) {
        const solid = p.solid; const th2 = solid ? Ht - p.y : 24;
        if (solid) { const g = c.createLinearGradient(0, p.y, 0, p.y + th2); g.addColorStop(0, th.soil); g.addColorStop(0.5, th.rock); g.addColorStop(1, shade(th.rock, -0.5)); c.fillStyle = g; c.fillRect(p.x, p.y + 6, p.w, th2); }
        else { c.beginPath(); c.moveTo(p.x, p.y + 4); c.lineTo(p.x + p.w, p.y + 4); c.lineTo(p.x + p.w - 10, p.y + 22); c.quadraticCurveTo(p.x + p.w * 0.7, p.y + 32, p.x + p.w * 0.5, p.y + 26); c.quadraticCurveTo(p.x + p.w * 0.25, p.y + 34, p.x + 10, p.y + 22); c.closePath(); const g = c.createLinearGradient(0, p.y, 0, p.y + 30); g.addColorStop(0, th.soil); g.addColorStop(1, th.rock); c.fillStyle = g; c.fill(); c.lineWidth = 2.4; c.strokeStyle = OUT; c.stroke(); }
        // 질감
        c.fillStyle = 'rgba(0,0,0,.14)'; const r2 = seeded(Math.floor(p.x * 7 + p.y)); for (let i = 0; i < p.w / 22; i++) { const x = p.x + r2() * p.w, y = p.y + 10 + r2() * Math.min(th2 - 14, 20); c.beginPath(); c.ellipse(x, y, 4 + r2() * 6, 2 + r2() * 3, 0, 0, TAU); c.fill(); }
        c.fillStyle = 'rgba(255,255,255,.07)'; for (let i = 0; i < p.w / 40; i++) { const x = p.x + r2() * p.w, y = p.y + 12 + r2() * 12; c.fillRect(x, y, 10 + r2() * 14, 2); }
        // 풀 윗면
        c.beginPath(); c.moveTo(p.x - 1, p.y + 6); c.lineTo(p.x - 1, p.y - 1); for (let x = p.x; x <= p.x + p.w; x += 12) { c.lineTo(x, p.y - 2 - (((x / 12) | 0) % 2) * 3); } c.lineTo(p.x + p.w + 1, p.y + 6); c.closePath(); c.fillStyle = th.grass; c.fill(); c.lineWidth = 2; c.strokeStyle = OUT; c.stroke();
        c.fillStyle = shade(th.grass, 0.28); c.fillRect(p.x, p.y - 1, p.w, 2.2);
        if (th.kind !== 'cave' && th.kind !== 'temple') for (let x = p.x + 8; x < p.x + p.w - 6; x += 22 + r2() * 30) { if (r2() < 0.45) { c.fillStyle = ['#ffd24a', '#ff8aa8', '#fff'][(r2() * 3) | 0]; c.beginPath(); c.arc(x, p.y - 5, 2, 0, TAU); c.fill(); c.fillStyle = '#3a8a2a'; c.fillRect(x - 0.5, p.y - 4, 1.2, 4); } }
        if (th.kind === 'cave' || th.kind === 'temple') for (let x = p.x + 14; x < p.x + p.w - 8; x += 40 + r2() * 40) { c.fillStyle = shade(th.rock, 0.2); c.beginPath(); c.moveTo(x, p.y); c.lineTo(x + 4, p.y - 7 - r2() * 6); c.lineTo(x + 9, p.y); c.fill(); }
      }
      // 포탈 표식(고정 기둥)
      for (const pt of map.portals) { const y = map.plats[0].y; c.fillStyle = shade(th.rock, 0.1); c.beginPath(); rrect(c, pt.x - 30, y - 62, 10, 62, 3); fillStroke(c, shade(th.rock, 0.1), 2); c.beginPath(); rrect(c, pt.x + 20, y - 62, 10, 62, 3); fillStroke(c, shade(th.rock, 0.1), 2); c.beginPath(); rrect(c, pt.x - 36, y - 74, 72, 14, 4); fillStroke(c, shade(th.rock, 0.2), 2); }
    });
    return cv;
  };
  function townDecor(c, map, rnd) {
    const gy = map.plats[0].y;
    const house = (x, w, h, roof, wall) => { c.beginPath(); rrect(c, x, gy - h, w, h, 4); fillStroke(c, wall, 2.4); c.beginPath(); c.moveTo(x - 10, gy - h + 2); c.lineTo(x + w / 2, gy - h - 40); c.lineTo(x + w + 10, gy - h + 2); c.closePath(); fillStroke(c, roof, 2.6); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x + 4, gy - h + 8, w - 8, 4); c.beginPath(); rrect(c, x + w / 2 - 13, gy - 40, 26, 40, 5); fillStroke(c, '#6b3e22', 2); c.fillStyle = '#e0b83a'; c.beginPath(); c.arc(x + w / 2 + 7, gy - 20, 2, 0, TAU); c.fill(); for (const wx of [x + 10, x + w - 28]) { c.beginPath(); rrect(c, wx, gy - h + 22, 18, 18, 3); fillStroke(c, '#ffe9a8', 2); c.strokeStyle = OUT; c.lineWidth = 1.4; c.beginPath(); c.moveTo(wx + 9, gy - h + 22); c.lineTo(wx + 9, gy - h + 40); c.moveTo(wx, gy - h + 31); c.lineTo(wx + 18, gy - h + 31); c.stroke(); } };
    house(330, 190, 112, '#c4452d', '#e9d3a8');
    // 여관
    house(620, 200, 118, '#3f7ac4', '#e6cfa0'); c.beginPath(); rrect(c, 820, gy - 100, 36, 22, 4); fillStroke(c, '#8a5a32', 2); c.font = 'bold 12px sans-serif'; c.fillStyle = '#ffe9b0'; c.textAlign = 'center'; c.fillText('여관', 838, gy - 85);
    house(910, 190, 108, '#3f9a6a', '#ecdcb4'); c.font = 'bold 13px sans-serif'; c.fillStyle = '#2a1d14'; c.fillText('🛒 잡화점', 1005, gy - 120);
    // 대장간
    c.beginPath(); rrect(c, 1160, gy - 92, 190, 92, 4); fillStroke(c, '#8a8f98', 2.4); c.beginPath(); c.moveTo(1150, gy - 90); c.lineTo(1255, gy - 138); c.lineTo(1360, gy - 90); c.closePath(); fillStroke(c, '#4a4f58', 2.6);
    c.beginPath(); rrect(c, 1316, gy - 150, 22, 62, 3); fillStroke(c, '#6a5a52', 2); c.beginPath(); c.moveTo(1176, gy - 14); c.lineTo(1204, gy - 14); c.lineTo(1198, gy - 28); c.lineTo(1184, gy - 28); c.closePath(); fillStroke(c, '#3a3f48', 1.6); c.fillStyle = '#2a1d14'; c.font = 'bold 13px sans-serif'; c.fillText('⚔️ 대장간', 1255, gy - 108);
    // 개미굴 석문
    for (const pt of map.portals) if (pt.id === 'toAnt') { c.beginPath(); c.moveTo(pt.x - 60, gy); c.lineTo(pt.x - 60, gy - 90); c.quadraticCurveTo(pt.x, gy - 150, pt.x + 60, gy - 90); c.lineTo(pt.x + 60, gy); c.lineTo(pt.x + 36, gy); c.lineTo(pt.x + 36, gy - 80); c.quadraticCurveTo(pt.x, gy - 118, pt.x - 36, gy - 80); c.lineTo(pt.x - 36, gy); c.closePath(); fillStroke(c, '#7a6a62', 3); c.beginPath(); c.moveTo(pt.x - 36, gy); c.lineTo(pt.x - 36, gy - 80); c.quadraticCurveTo(pt.x, gy - 118, pt.x + 36, gy - 80); c.lineTo(pt.x + 36, gy); c.closePath(); c.fillStyle = '#1a0f10'; c.fill(); }
    // 광부 집, 경비대
    house(1760, 170, 100, '#8a5a32', '#d9c096');
    // 전망대(발판 위)
    house(2040, 170, 96, '#7a4aa8', '#e6d0b0');
    // 깃발·가로등
    for (let x = 220; x < map.w; x += 380) { c.strokeStyle = OUT; c.lineWidth = 5; c.beginPath(); c.moveTo(x, gy); c.lineTo(x, gy - 80); c.stroke(); c.strokeStyle = '#8a6a4a'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(x, gy); c.lineTo(x, gy - 80); c.stroke(); c.beginPath(); c.moveTo(x, gy - 78); c.lineTo(x + 32, gy - 70); c.lineTo(x, gy - 58); c.closePath(); fillStroke(c, ['#d6343c', '#3f7ac4', '#e0b83a'][((x / 380) | 0) % 3], 2); }
  }

  /* ───────── 동적 소품 ───────── */
  A.drawPortal = function (c, pt, t, near) {
    c.save(); c.translate(pt.x, 0); const y = pt.y;
    const col = pt.col || '#8cf'; const pulse = 0.8 + Math.sin(t * 4) * 0.2;
    const g = c.createRadialGradient(0, y - 30, 4, 0, y - 30, 40); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(0.4, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.globalAlpha = 0.85; c.fillStyle = g; c.beginPath(); ell(c, 0, y - 30, 20 * pulse, 34); c.fill(); c.globalAlpha = 1;
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(0, y - 30, 8 + i * 5 + Math.sin(t * 3 + i) * 2, 20 + i * 5, 0, t * 2 + i, t * 2 + i + 3); c.stroke(); }
    c.font = 'bold 11px sans-serif'; c.textAlign = 'center'; const w = c.measureText(pt.label).width + 14; c.fillStyle = 'rgba(20,14,10,.8)'; rrect(c, -w / 2, y - 92, w, 16, 6); c.fill(); c.fillStyle = '#fff'; c.fillText(pt.label, 0, y - 80);
    if (pt.lv) { c.font = '10px sans-serif'; c.fillStyle = '#ffd98a'; c.fillText(pt.lv, 0, y - 98); }
    if (near) { c.font = 'bold 20px sans-serif'; c.lineWidth = 4; c.strokeStyle = OUT; c.fillStyle = '#fff'; const b = Math.sin(t * 6) * 3; c.strokeText('⬆', 0, y - 112 + b); c.fillText('⬆', 0, y - 112 + b); }
    c.restore();
  };
  A.drawDrop = function (c, d, t) {
    const bob = d.onG ? Math.sin(t * 4 + d.ph) * 2 - 3 : 0; c.save(); c.translate(d.x, d.y + bob);
    if (d.life < 5 && Math.floor(t * 8) % 2) c.globalAlpha = 0.4;
    if (d.meso) { const s = Math.abs(Math.cos(t * 5 + d.ph)); c.beginPath(); ell(c, 0, -6, 6 * (0.3 + s * 0.7), 6); fillStroke(c, '#ffd24a', 1.8); if (s > 0.5) { c.fillStyle = '#c28a1a'; c.font = 'bold 7px sans-serif'; c.textAlign = 'center'; c.fillText('$', 0, -3.4); } }
    else { const it = root.DATA.ITEMS[d.id]; c.beginPath(); rrect(c, -9, -19, 18, 18, 5); fillStroke(c, it.col && it.t !== 'equip' ? shade(it.col, 0.25) : '#f4e6c0', 2); c.font = '12px sans-serif'; c.textAlign = 'center'; c.fillText(it.icon, 0, -6); if (it.t === 'equip') { c.strokeStyle = '#ffd24a'; c.lineWidth = 1.4; c.beginPath(); rrect(c, -10.5, -20.5, 21, 21, 6); c.stroke(); } }
    c.restore();
  };
  A.drawProj = function (c, q, t) {
    c.save(); c.translate(q.x, q.y);
    if (q.kind === 'fire') { c.shadowColor = '#ff7a2a'; c.shadowBlur = 12; c.beginPath(); c.arc(0, 0, 10, 0, TAU); c.fillStyle = '#ff9a3a'; c.fill(); c.beginPath(); c.arc(0, 0, 5.5, 0, TAU); c.fillStyle = '#ffee88'; c.fill(); c.shadowBlur = 0; }
    else if (q.kind === 'wave') { const s = Math.sign(q.vx) || 1; c.scale(s, 1); const h = q.h; c.beginPath(); c.moveTo(-q.w * 0.5, 4); c.quadraticCurveTo(-q.w * 0.2, -h * 1.1, q.w * 0.5, -h * 0.2); c.lineTo(q.w * 0.5, 4); c.closePath(); c.fillStyle = 'rgba(255,230,160,.75)'; c.fill(); c.lineWidth = 2.2; c.strokeStyle = OUT; c.stroke(); for (let i = 0; i < 3; i++) { c.fillStyle = '#7a6048'; c.beginPath(); c.arc(-q.w * 0.35 + i * 10 + Math.sin(t * 20 + i) * 2, -h * 0.55 - (i % 2) * 6, 3.4, 0, TAU); c.fill(); } }
    c.restore();
  };
  A.drawZone = function (c, z, t) {
    const u = Math.min(1, z.t / z.dur); c.save(); c.translate(z.x, z.y);
    if (!z.fired) { c.globalAlpha = 0.35 + 0.35 * Math.sin(t * 18); c.fillStyle = z.kind === 'root' ? '#7be05a' : '#ff6a4a'; c.beginPath(); ell(c, 0, 0, z.r * (0.5 + u * 0.5), 8); c.fill(); c.globalAlpha = 1; c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); ell(c, 0, 0, z.r, 9); c.stroke(); if (z.kind === 'rock') { c.fillStyle = '#8d8678'; c.beginPath(); c.arc(0, -((1 - u) * 260) - 14, 16, 0, TAU); c.fill(); c.lineWidth = 2; c.strokeStyle = OUT; c.stroke(); } }
    else { const k = Math.min(1, (z.t - z.dur) / 0.2); if (z.kind === 'root') { c.beginPath(); c.moveTo(-14, 4); c.quadraticCurveTo(-4, -70 * (1 - k * 0.3), 0, -78 * (1 - k * 0.3)); c.quadraticCurveTo(4, -50, 14, 4); c.closePath(); fillStroke(c, '#6a4528', 2.4); } else { c.fillStyle = 'rgba(120,110,100,.8)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc((i - 2.5) * 11, -k * (12 + (i % 3) * 8), 4 + i % 2 * 2, 0, TAU); c.fill(); } } }
    c.restore();
  };
  A.drawPet = function (c, t, face, moving, cheer) {
    const bob = Math.abs(Math.sin(t * (moving ? 12 : 3))) * (moving ? 3 : 1) + (cheer ? Math.abs(Math.sin(t * 20)) * 4 : 0);
    c.save(); c.scale(face < 0 ? -0.8 : 0.8, 0.8); ell(c, 0, 0, 12, 3); c.fillStyle = 'rgba(0,0,0,.25)'; c.fill();
    c.translate(0, -bob);
    const lg = moving ? Math.sin(t * 16) * 3 : 0; c.beginPath(); rrect(c, -8, -8, 4.4, 8 + lg * 0.3, 2); fillStroke(c, '#c4607a', 1.6); c.beginPath(); rrect(c, 5, -8, 4.4, 8 - lg * 0.3, 2); fillStroke(c, '#c4607a', 1.6);
    c.beginPath(); ell(c, 0, -12, 12, 9.5); fillStroke(c, '#f0a0b4', 2);
    c.beginPath(); c.moveTo(-10, -18); c.lineTo(-13, -22); c.lineTo(-6, -20); c.closePath(); fillStroke(c, '#e07a96', 1.2);
    c.beginPath(); ell(c, 11, -13, 7, 6.5); fillStroke(c, '#f6b4c4', 2); c.beginPath(); ell(c, 15.5, -11.5, 3.4, 3); fillStroke(c, '#f09ab0', 1.4); c.fillStyle = OUT; c.beginPath(); c.arc(14.6, -11.6, 0.7, 0, TAU); c.arc(16.6, -11.6, 0.7, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(8, -18); c.lineTo(6, -23); c.lineTo(12, -19); c.closePath(); fillStroke(c, '#e07a96', 1.2);
    c.fillStyle = '#fff'; c.beginPath(); c.arc(11, -15, 2.2, 0, TAU); c.fill(); c.fillStyle = OUT; c.beginPath(); c.arc(11.7, -15, 1.2, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(14, -8); c.quadraticCurveTo(18, -8, 17, -14); c.quadraticCurveTo(15, -9, 13, -8); c.closePath(); fillStroke(c, '#fff6dc', 1);
    c.restore();
  };
  A.drawGrave = function (c, x, y, t) { c.save(); c.translate(x, y); c.beginPath(); c.moveTo(-12, 0); c.lineTo(-12, -22); c.arc(0, -22, 12, Math.PI, 0); c.lineTo(12, 0); c.closePath(); fillStroke(c, '#9aa0aa', 2.4); c.strokeStyle = '#5a6068'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(0, -30); c.lineTo(0, -12); c.moveTo(-6, -24); c.lineTo(6, -24); c.stroke(); c.globalAlpha = 0.6 + Math.sin(t * 3) * 0.2; c.font = '16px sans-serif'; c.fillText('👻', -8, -44 - Math.sin(t * 3) * 4); c.restore(); };
  root.Art = A;
})(window);
