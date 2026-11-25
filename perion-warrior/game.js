/* 페리온 전사 — 화면·조작·UI (엔진/그림/소리를 이어 붙임) */
(function () {
  'use strict';
  const D = DATA, E = Engine, VH = 310, TAU = Math.PI * 2, SAVE_KEY = 'pw.save';
  const $ = (id) => document.getElementById(id);
  const app = $('app'), cv = $('cv'), ctx = cv.getContext('2d'), modal = $('modal');
  const fmt = (n) => Math.round(n).toLocaleString('ko-KR');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const bold = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }, del(k) { try { localStorage.removeItem(k); } catch (e) { } } };

  let G = null, started = false, paused = false, modalClick = null, time = 0, last = 0, hudT = 0, miniT = 0, saveT = 0, deathT = 0, shownDeath = false;
  const view = { w: 800, h: 360, s: 1, vw: 700, k: 1, dpr: 1 };
  const cam = { x: 0, y: 0 };
  let dirty = true;
  let bg = null, fore = null; let fxs = [];
  const KEYS = { left: 0, right: 0, up: 0, down: 0 };
  const petState = { x: 0, y: 0, face: 1, moving: false, cheer: 0 };
  function updatePet(dt) {
    const p = G.p; if (!p.pet) return; const tx = p.x - p.face * 30, ty = p.y; const dx = tx - petState.x; petState.cheer = Math.max(0, petState.cheer - dt);
    if (Math.abs(dx) > 400 || Math.abs(ty - petState.y) > 160) { petState.x = tx; petState.y = ty; }
    petState.moving = Math.abs(dx) > 10; if (petState.moving) { petState.x += Math.sign(dx) * Math.min(Math.abs(dx), (Math.abs(dx) > 60 ? 200 : 120) * dt); petState.face = dx > 0 ? 1 : -1; } else petState.face = p.face;
    const ddy = ty - petState.y; petState.y += Math.max(-300 * dt, Math.min(300 * dt, ddy)); if (ddy < -3) petState.y = Math.max(ty, petState.y);
  }

  const BUILD = '20261125zzo';
  /* ───────── 화면 크기 / 세로 보정 ───────── */
  function layout() {
    const iw = window.innerWidth, ih = window.innerHeight, portrait = ih > iw * 1.02;
    const w = portrait ? ih : iw, h = portrait ? iw : ih;
    app.style.width = w + 'px'; app.style.height = h + 'px';
    app.style.transform = portrait ? `translateX(${iw}px) rotate(90deg)` : 'none';
    // 세로로 들면 화면을 90도 돌려 쓰므로, 안전 영역(상태바·홈 바)도 돌려서 맞춘다: 게임 왼쪽=폰 위쪽, 게임 오른쪽=폰 아래쪽, 게임 아래=폰 왼쪽
    if (portrait) { const pr = document.createElement('div'); pr.style.cssText = 'position:fixed;visibility:hidden;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)'; document.body.appendChild(pr); const cs = getComputedStyle(pr); const t = parseFloat(cs.paddingTop) || 0, r = parseFloat(cs.paddingRight) || 0, bt = parseFloat(cs.paddingBottom) || 0, l = parseFloat(cs.paddingLeft) || 0; pr.remove();
      const sa = (window.navigator.standalone === true) || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
      // 홈화면 앱은 상태바 밑까지 화면이 깔리므로, 안전 영역 값을 못 읽어도 최소 여백(위 48 / 아래 20)을 보장한다
      app.style.setProperty('--sl', Math.max(t, sa ? 48 : 0) + 'px'); app.style.setProperty('--sr', Math.max(bt, sa ? 20 : 0) + 'px'); app.style.setProperty('--sb', l + 'px'); }
    else { app.style.removeProperty('--sl'); app.style.removeProperty('--sr'); app.style.removeProperty('--sb'); }
    view.s = h / VH; view.vw = w / view.s; view.dpr = Math.min(window.devicePixelRatio || 1, 2); view.k = view.dpr * view.s;
    cv.width = Math.round(w * view.dpr); cv.height = Math.round(h * view.dpr); view.w = w; view.h = h; dirty = true;
  }
  window.addEventListener('resize', layout); window.addEventListener('orientationchange', () => setTimeout(layout, 120));

  /* ───────── 파티클 ───────── */
  function fx(o) { fxs.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, g: 0, life: 0.5, max: 0.5, type: 'spark', col: '#fff', size: 3, rot: 0, vr: 0, drag: 0 }, o, { max: o.life || 0.5 })); }
  function sparks(x, y, n, col, spd, life, sz) { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, s = spd * (0.4 + Math.random() * 0.8); fx({ type: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, g: 380, life: (life || 0.4) * (0.6 + Math.random() * 0.6), col, size: (sz || 3) * (0.6 + Math.random() * 0.8), drag: 2 }); } }
  function puffs(x, y, n, col, spd, sz, life) { for (let i = 0; i < n; i++) { const a = Math.random() * TAU; fx({ type: 'puff', x: x + (Math.random() - 0.5) * 10, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd * 0.5 - 10, life: (life || 0.5) * (0.7 + Math.random() * 0.6), col, size: sz * (0.6 + Math.random() * 0.8), drag: 3 }); } }
  function dmgText(x, y, s, o) { fx(Object.assign({ type: 'text', x: x + (Math.random() - 0.5) * 12, y, s: String(s), life: 0.95, size: 18, col: '#ffcc3a', stroke: '#6a2a08' }, o)); }

  function updateFx(dt) {
    for (let i = fxs.length - 1; i >= 0; i--) {
      const f = fxs[i]; f.life -= dt; if (f.life <= 0) { fxs.splice(i, 1); continue; }
      if (f.drag) { const d = Math.max(0, 1 - f.drag * dt); f.vx *= d; f.vy *= d; }
      f.vy += f.g * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vr * dt;
    }
    if (fxs.length > 500) fxs.splice(0, fxs.length - 500);
  }
  function drawFx(c) {
    for (const f of fxs) {
      const u = 1 - f.life / f.max; c.save();
      if (f.type === 'spark') { c.globalAlpha = Math.min(1, f.life / f.max * 1.6); c.fillStyle = f.col; c.translate(f.x, f.y); c.rotate(Math.atan2(f.vy, f.vx)); c.fillRect(-f.size * 1.6, -f.size * 0.4, f.size * 3.2, f.size * 0.8); }
      else if (f.type === 'puff') { c.globalAlpha = (1 - u) * 0.6; c.fillStyle = f.col; c.beginPath(); c.arc(f.x, f.y, f.size * (0.6 + u), 0, TAU); c.fill(); }
      else if (f.type === 'ring') { c.globalAlpha = (1 - u); c.strokeStyle = f.col; c.lineWidth = f.size * (1 - u) + 1; c.beginPath(); c.ellipse(f.x, f.y, f.r * (0.2 + u * 0.8), f.r * (f.flat || 1) * (0.2 + u * 0.8), 0, 0, TAU); c.stroke(); }
      else if (f.type === 'burst') { c.globalAlpha = 1 - u; c.translate(f.x, f.y); c.strokeStyle = f.col; c.lineWidth = 2.4; c.lineCap = 'round'; const n = f.n || 8, R = f.r * (0.4 + u * 0.8); for (let i = 0; i < n; i++) { const a = f.rot + i / n * TAU; c.beginPath(); c.moveTo(Math.cos(a) * R * 0.5, Math.sin(a) * R * 0.5); c.lineTo(Math.cos(a) * R, Math.sin(a) * R); c.stroke(); } c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, f.r * 0.28 * (1 - u), 0, TAU); c.fill(); }
      else if (f.type === 'star') { c.globalAlpha = Math.min(1, f.life / f.max * 2); c.translate(f.x, f.y); c.rotate(f.rot); c.fillStyle = f.col; c.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? f.size * 0.45 : f.size; const a = i / 8 * TAU; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); }
      else if (f.type === 'ray') { const p = G && G.p; const x = p ? p.x : f.x; c.globalAlpha = (1 - u) * 0.85; const g = c.createLinearGradient(0, f.y - 180, 0, f.y); g.addColorStop(0, 'rgba(255,240,150,0)'); g.addColorStop(1, 'rgba(255,230,120,.9)'); c.fillStyle = g; const w = f.size * (1 - u * 0.5); c.fillRect(x - w / 2, f.y - 180, w, 180); }
      else if (f.type === 'rock') { c.globalAlpha = Math.min(1, f.life / f.max * 2); c.translate(f.x, f.y); c.rotate(f.rot); c.fillStyle = f.col; c.strokeStyle = '#2b1c14'; c.lineWidth = 1.4; c.fillRect(-f.size, -f.size, f.size * 2, f.size * 2); c.strokeRect(-f.size, -f.size, f.size * 2, f.size * 2); }
      else if (f.type === 'arc') drawArc(c, f, u);
      else if (f.type === 'beam') { const k = Math.min(1, u * 3); c.globalAlpha = 1 - u; c.translate(f.x, f.y); c.scale(f.face, 1); const L = f.r * (0.4 + k * 0.9); const g = c.createLinearGradient(0, 0, L, 0); g.addColorStop(0, 'rgba(255,200,120,0)'); g.addColorStop(0.7, f.col); g.addColorStop(1, '#fff'); c.fillStyle = g; c.beginPath(); c.moveTo(0, -3); c.lineTo(L, 0); c.lineTo(0, 3 + 11 * (1 - u)); c.closePath(); c.fill(); c.beginPath(); c.moveTo(0, 3); c.lineTo(L, 0); c.lineTo(0, -3 - 11 * (1 - u)); c.closePath(); c.fill(); }
      else if (f.type === 'text') {
        const e = 1 - Math.pow(1 - Math.min(1, u * 1.6), 3); const pop = u < 0.12 ? 1 + (0.12 - u) * 5 : 1;
        c.globalAlpha = Math.min(1, f.life / 0.35); c.translate(f.x, f.y - 30 * e); c.scale(pop, pop); c.font = `900 ${f.size}px "Apple SD Gothic Neo","Malgun Gothic",sans-serif`; c.textAlign = 'center'; c.lineJoin = 'round'; c.lineWidth = 4.5; c.strokeStyle = f.stroke; c.strokeText(f.s, 0, 0);
        if (f.grad) { const g = c.createLinearGradient(0, -f.size, 0, 2); g.addColorStop(0, f.col); g.addColorStop(1, f.grad); c.fillStyle = g; } else c.fillStyle = f.col; c.fillText(f.s, 0, 0);
      }
      c.restore();
    }
  }
  function drawArc(c, f, u) {
    const p = G.p; if (f.delay > 0) return; const k = Math.min(1, u); const ease = k * k * (3 - 2 * k);
    const cx = p.x + f.face * 4, cy = p.y - 24;
    const pts = (a0, a1, R, tail) => { const head = a0 + (a1 - a0) * ease, tl = a0 + (a1 - a0) * Math.max(0, ease - tail); const arr = []; for (let i = 0; i <= 14; i++) { const a = tl + (head - tl) * i / 14; arr.push([cx + f.face * Math.cos(a) * R, cy + Math.sin(a) * R * (f.ry || 1)]); } return arr; };
    const stroke = (arr, w, col, al) => { for (let i = 1; i < arr.length; i++) { c.globalAlpha = al * (i / arr.length) * (1 - u * 0.4); c.strokeStyle = col; c.lineWidth = w * (0.3 + i / arr.length * 0.7); c.lineCap = 'round'; c.beginPath(); c.moveTo(arr[i - 1][0], arr[i - 1][1]); c.lineTo(arr[i][0], arr[i][1]); c.stroke(); } };
    if (f.kind === 'slash') { const R = f.r; for (let j = 0; j < 2; j++) { const off = j * Math.PI; const arr = pts(-1.6 + off + k * 2, 1.6 + off + k * 2, R * (1 - j * 0.12), 0.7); stroke(arr, 13, '#7ad8ff', 0.35); stroke(arr, 6, '#fff', 0.9); } c.globalAlpha = (1 - u) * 0.3; c.fillStyle = '#9fe6ff'; c.beginPath(); c.ellipse(cx, p.y - 14, R, R * 0.6, 0, 0, TAU); c.fill(); return; }
    const spec = f.combo === 1 ? [-0.8, 0.7, 1.0] : f.combo === 2 ? [1.0, -1.8, 1.0] : [-2.0, 0.3, 1.0];
    const col = f.col || '#cfe8ff'; const arr = pts(spec[0], spec[1], f.r * spec[2], 0.75);
    stroke(arr, 14, col, 0.35); stroke(arr, 7, col, 0.7); stroke(arr, 3, '#fff', 1);
  }

  /* ───────── 맵 전환 ───────── */
  function onMap() {
    const m = G.map; bg = Art.buildBg(m, 1200, VH); fore = Art.buildFore(m); fxs = [];
    cam.x = Math.max(0, Math.min(m.w - view.vw, G.p.x - view.vw / 2)); cam.y = Math.max(0, Math.min(m.h - VH, G.p.y - VH * 0.62));
    if (Snd.ctx) Snd.play(m.bgm); else Snd.track = m.bgm;
    const el = $('mapname'); el.querySelector('h2').textContent = m.n; el.querySelector('p').textContent = m.town ? '안전 지대' : m.lvTxt + (m.boss ? '  ⚠ 보스' : ''); el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    $('minin').textContent = m.n + (m.lvTxt && !m.town ? ' · ' + m.lvTxt : '');
    if (started) { if (m.id !== 'perion') G.p.tut.portal = 1; save(); }
    shownDeath = false;
  }
  function doFade() { const f = $('fade'); f.style.opacity = 1; setTimeout(() => { f.style.opacity = 0; }, 140); }

  /* ───────── 이벤트 처리 ───────── */
  const FXCOL = { basic: '#cfe8ff', power: '#ffb066', slash: '#7ad8ff', quake: '#ffcc66', rblow: '#ff6a4a', charge: '#ffe98a', crusher: '#7ae0a0' };
  function handleEvents() {
    const p = G.p; const ev = G.events; G.events = [];
    for (const e of ev) {
      switch (e.t) {
        case 'sfx': Snd.sfx(e.n); if (e.n === 'potion') p.tut.potion = 1; if (e.n === 'jump') p.tut.jump = 1; if (e.n === 'skill') p.tut.skill = 1; break;
        case 'swing': { p.tut.atk = 1; const st = E.stats(G), a = p.atk; if (!a) break; const cx = p.x + e.face * 6, cy = p.y - 24;
          if (e.kind === 'power' || e.kind === 'rblow' || e.kind === 'crusher') fx({ type: 'beam', x: cx, y: cy + 2, face: e.face, r: a.rng * 1.15, col: FXCOL[e.kind] || '#ffb066', life: 0.3, delay: 0 });
          else if (e.kind === 'quake') { fx({ type: 'ring', x: p.x, y: p.y - 2, r: 40, flat: 0.25, col: '#ffcc66', size: 5, life: 0.5 }); }
          else fx({ type: 'arc', kind: e.kind, face: e.face, combo: e.combo, r: Math.max(34, a.rng * 0.78), col: e.kind === 'basic' ? (D.ITEMS[p.equip.weapon].wt === 'axe' ? '#ffd9a0' : D.ITEMS[p.equip.weapon].wt === 'great' ? '#ffe0ff' : D.ITEMS[p.equip.weapon].wt === 'spear' ? '#c8ffd8' : D.ITEMS[p.equip.weapon].wt === 'mace' ? '#ffe3b8' : FXCOL.basic) : FXCOL[e.kind], life: e.kind === 'slash' ? 0.42 : 0.26, delay: 0 }), fxs[fxs.length - 1].delay = 0;
          if (e.kind === 'rblow') { fx({ type: 'ring', x: cx + e.face * a.rng * 0.7, y: p.y - 24, r: 38, col: '#ff5a3a', size: 7, life: 0.38 }); G.shake = Math.max(G.shake, 1); }
          else if (e.kind === 'crusher') { for (const dy of [-9, 9]) fx({ type: 'beam', x: cx, y: cy + 2 + dy, face: e.face, r: a.rng * 1.05, col: '#b6ffd0', life: 0.24, delay: 0.03 }); }
          else if (e.kind === 'charge') { fx({ type: 'ring', x: p.x, y: p.y - 24, r: 64, flat: 0.55, col: '#fff0a0', size: 6, life: 0.42 }); }
          break; }
        case 'dmg': {
          if (e.who === 'player') dmgText(e.x, e.y, e.amt, { col: '#ff6a7a', grad: '#ff2a4a', stroke: '#3a0610', size: 20 });
          else if (e.crit) dmgText(e.x, e.y - 6, e.amt, { col: '#fff27a', grad: '#ff8a2a', stroke: '#7a1a04', size: 27, life: 1.1 });
          else dmgText(e.x, e.y, e.amt, { col: '#fff0b0', grad: '#ff9a2a', stroke: '#6a2a08', size: 19 });
          if (e.crit) dmgText(e.x, e.y - 30, 'CRITICAL', { col: '#ffeb7a', stroke: '#7a1a04', size: 10, life: 0.8 });
          break; }
        case 'hit': { const col = e.crit ? '#ffee66' : '#fff'; if (e.fx === 'spawn') { puffs(e.x, e.y, 6, '#7bd05a', 40, 8); break; }
          fx({ type: 'burst', x: e.x, y: e.y, r: e.crit ? 28 : e.big ? 24 : 16, col: e.fx === 'power' ? '#ffb066' : e.fx === 'slash' ? '#7ad8ff' : col, n: e.crit ? 10 : 7, life: 0.2, rot: Math.random() }); sparks(e.x, e.y, e.crit ? 12 : e.big ? 9 : 5, col, 170, 0.35, 2.6); break; }
        case 'kill': { const d = D.MON[e.id]; puffs(e.x, e.y - d.h * 0.4, d.boss ? 22 : 7, d.boss ? '#ffe9a8' : '#fff', d.boss ? 150 : 50, d.boss ? 22 : 9, d.boss ? 1 : 0.5); for (let i = 0; i < (d.boss ? 22 : 6); i++) fx({ type: 'star', x: e.x, y: e.y - d.h * 0.5, vx: (Math.random() - 0.5) * (d.boss ? 360 : 170), vy: -80 - Math.random() * 180, g: 520, rot: Math.random() * 6, vr: 8, size: d.boss ? 9 : 5, col: ['#ffd24a', '#fff', '#ff9a4a'][i % 3], life: 0.7 + Math.random() * 0.4 }); if (d.boss) { fx({ type: 'ring', x: e.x, y: e.y - 40, r: 150, col: '#ffe9a8', size: 8, life: 0.9 }); } break; }
        case 'exp': logLine(`경험치 +${fmt(e.amt)}`, 'e'); if (e.amt >= 1) dmgText(p.x, p.y - 58, `EXP +${fmt(e.amt)}`, { col: '#c9ff8a', stroke: '#1a4a0a', size: 11, life: 0.9 }); break;
        case 'pickup': if (e.meso) { logLine(`💰 메소 +${fmt(e.meso)}`, 'g'); dmgText(e.x, e.y - 14, `+${fmt(e.meso)}`, { col: '#ffe36a', stroke: '#5a3a08', size: 12, life: 0.7 }); } else { const it = D.ITEMS[e.id]; logLine(`${it.icon} ${it.n} 획득!`, it.t === 'equip' ? 'q' : 'i'); dmgText(e.x, e.y - 20, it.n, { col: '#bfe2ff', stroke: '#0a2a4a', size: 11, life: 0.9 }); if (it.t === 'equip') { sparks(e.x, e.y - 10, 10, '#ffe36a', 120, 0.6, 3); } } updateDot(); break;
        case 'heal': dmgText(e.x, e.y, '+' + fmt(e.amt), { col: e.mp ? '#9fd0ff' : '#9fffb0', stroke: e.mp ? '#0a2a6a' : '#0a4a1a', size: 17 }); sparks(e.x, e.y + 20, 6, e.mp ? '#7ab4ff' : '#7aff9a', 70, 0.5, 2.4); break;
        case 'levelup': levelUpFx(e.lv); break;
        case 'map': onMap(); break;
        case 'fade': doFade(); break;
        case 'dust': puffs(e.x, e.y - 1, e.land ? 5 : 3, 'rgba(230,210,180,1)', e.land ? 40 : 24, 4, 0.35); break;
        case 'msg': logLine(e.text, 'q'); toastBanner(e.text); break;
        case 'bossWind': { const m = G.boss || { x: e.x, y: 0 }; fx({ type: 'text', x: e.x, y: (m.y || 0) - (D.MON[e.id] ? D.MON[e.id].h : 40) - 10, s: e.atk === 'charge' ? '‼' : '!', life: 0.7, size: 32, col: '#ff4a3a', stroke: '#fff' }); break; }
        case 'slam': { for (const d of [-1, 1]) puffs(e.x + d * e.w * 0.5, e.y - 2, 6, 'rgba(210,190,160,1)', 80, 9, 0.6); fx({ type: 'ring', x: e.x, y: e.y - 2, r: 120, flat: 0.18, col: '#ffe9b0', size: 6, life: 0.5 }); for (let i = 0; i < 8; i++) fx({ type: 'rock', x: e.x + (Math.random() - 0.5) * e.w, y: e.y - 6, vx: (Math.random() - 0.5) * 240, vy: -160 - Math.random() * 200, g: 700, size: 2 + Math.random() * 3, col: '#8d8678', rot: 0, vr: 9, life: 0.8 }); break; }
        case 'zone': { puffs(e.x, e.y - 4, 8, e.kind === 'root' ? '#7be05a' : 'rgba(210,190,160,1)', 90, 9, 0.5); for (let i = 0; i < 7; i++) fx({ type: 'rock', x: e.x, y: e.y - 8, vx: (Math.random() - 0.5) * 200, vy: -180 - Math.random() * 160, g: 700, size: 2 + Math.random() * 3, col: e.kind === 'root' ? '#6a4528' : '#8d8678', rot: 0, vr: 8, life: 0.8 }); break; }
        case 'quake': { fx({ type: 'ring', x: e.x, y: e.y - 2, r: e.r, flat: 0.16, col: '#ffcc66', size: 9, life: 0.6 }); fx({ type: 'ring', x: e.x, y: e.y - 2, r: e.r * 0.65, flat: 0.16, col: '#fff', size: 5, life: 0.45 }); puffs(e.x, e.y - 2, 14, 'rgba(220,200,170,1)', 150, 11, 0.7); for (let i = 0; i < 16; i++) fx({ type: 'rock', x: e.x + (Math.random() - 0.5) * e.r * 1.4, y: e.y - 6, vx: (Math.random() - 0.5) * 240, vy: -220 - Math.random() * 240, g: 800, size: 2.5 + Math.random() * 3.5, col: ['#9a8a6a', '#6a5a48', '#c4a870'][i % 3], rot: 0, vr: 10, life: 0.9 }); break; }
        case 'buff': { const s = D.SKILLS[e.sid]; fx({ type: 'ring', x: p.x, y: p.y - 18, r: 40, col: e.sid === 'rage' ? '#ff6a4a' : '#6ad0ff', size: 5, life: 0.7 }); sparks(p.x, p.y - 10, 16, e.sid === 'rage' ? '#ff9a5a' : '#8ae0ff', 90, 0.8, 3); logLine(`${s.icon} ${s.n} 발동!`, 'i'); break; }
        case 'buffEnd': break;
        case 'qprog': { updateHud(true); break; }
        case 'questdone': { const q = D.QUESTS[e.q]; toastBanner(`퀘스트 완료!  ${q.n}`); logLine(`✅ 퀘스트 완료: ${q.n}`, 'q'); save(); break; }
        case 'death': deathT = 0.9; break;
        case 'scroll': if (e.ok) { fx({ type: 'ring', x: p.x, y: p.y - 20, r: 44, col: '#ffe36a', size: 6, life: 0.7 }); sparks(p.x, p.y - 22, 26, '#ffe36a', 140, 0.8, 3); for (let i = 0; i < 8; i++) fx({ type: 'star', x: p.x + (Math.random() - 0.5) * 30, y: p.y - 20, vx: (Math.random() - 0.5) * 80, vy: -60 - Math.random() * 80, rot: 0, vr: 6, size: 6, col: '#fff7a8', life: 0.9 }); } else { puffs(p.x, p.y - 20, 10, 'rgba(120,120,130,1)', 60, 8, 0.6); } break;
        case 'petDrink': petState.cheer = 0.8; logLine('🐾 ' + p.pet.n + '이(가) 자동으로 물약을 먹여 줬어요!', 'i'); break;
        case 'petGot': petState.x = p.x - 30; petState.y = p.y; petState.cheer = 1.2; toastBanner('🐾 펫 ' + e.n + ' 획득!'); logLine('🐾 펫 ' + e.n + '이(가) 함께해요! 설정에서 자동 물약을 켤 수 있어요', 'q'); break;
      }
    }
  }
  function levelUpFx(lv) {
    const p = G.p; fx({ type: 'ray', x: p.x, y: p.y, size: 70, life: 1.3 }); fx({ type: 'ring', x: p.x, y: p.y - 4, r: 70, flat: 0.3, col: '#ffe36a', size: 7, life: 0.8 });
    for (let i = 0; i < 26; i++) fx({ type: 'star', x: p.x + (Math.random() - 0.5) * 50, y: p.y - Math.random() * 30, vx: (Math.random() - 0.5) * 60, vy: -70 - Math.random() * 130, rot: Math.random() * 6, vr: 6, size: 5 + Math.random() * 4, col: ['#ffe36a', '#fff', '#ffb83a'][i % 3], life: 1 + Math.random() * 0.7 });
    const el = $('lvup'); el.querySelector('h1').textContent = 'LEVEL UP!'; el.querySelector('p').textContent = `Lv ${lv} 달성!  🎒 메뉴에서 능력치·스킬 포인트를 써 보세요`; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    logLine(`⭐ 레벨 업! Lv ${lv}`, 'g'); updateDot(); buildSkillBtns(); save();
  }
  let bannerT = 0;
  function toastBanner(text) { const b = $('banner'); b.querySelector('h1').textContent = text; b.querySelector('h1').style.fontSize = text.length > 14 ? '22px' : '30px'; b.querySelector('p').textContent = ''; b.classList.remove('show'); void b.offsetWidth; b.classList.add('show'); }
  function logLine(txt, cls) { const l = $('log'); const d = document.createElement('div'); d.className = cls || ''; d.textContent = txt; l.appendChild(d); while (l.children.length > 6) l.removeChild(l.firstChild); setTimeout(() => d.remove(), 6200); }

  /* ───────── 저장 ───────── */
  function save() { if (!G || !started) return; store.set(SAVE_KEY, JSON.stringify(E.serialize(G))); }
  function loadSave() { const s = store.get(SAVE_KEY); if (!s) return null; try { const o = JSON.parse(s); return o && o.lv ? o : null; } catch (e) { return null; } }

  /* ───────── HUD ───────── */
  const hc = {};
  function setTxt(el, v, key) { if (hc[key] !== v) { hc[key] = v; el.innerHTML = v; } }
  function updateHud(force) {
    const p = G.p, st = E.stats(G);
    setTxt($('lvb'), 'Lv.' + p.lv, 'lv'); setTxt($('nm'), esc(p.name), 'nm'); setTxt($('mesob'), '💰 ' + fmt(p.meso), 'meso');
    const bar = (id, v, mx, txt) => { const el = $(id); const w = Math.max(0, Math.min(100, v / mx * 100)).toFixed(1) + '%'; if (hc[id] !== w) { hc[id] = w; el.firstElementChild.style.width = w; } const t = txt; if (hc[id + 't'] !== t) { hc[id + 't'] = t; el.lastElementChild.textContent = t; } };
    bar('hpbar', p.hp, st.maxHp, `HP ${Math.ceil(p.hp)} / ${st.maxHp}`); bar('mpbar', p.mp, st.maxMp, `MP ${Math.floor(p.mp)} / ${st.maxMp}`);
    const need = D.expToNext(p.lv); bar('xpbar', p.lv >= D.MAX_LV ? 1 : p.exp, p.lv >= D.MAX_LV ? 1 : need, p.lv >= D.MAX_LV ? 'MAX' : `EXP ${fmt(p.exp)} / ${fmt(need)}  (${(p.exp / need * 100).toFixed(1)}%)`);
    const o = E.objective(G); const ot = '📌 ' + esc(o.txt) + (o.sub ? `<small>📍 ${esc(o.sub)}</small>` : ''); setTxt($('obj'), ot, 'obj'); $('obj').classList.toggle('ready', !!o.ready);
    const potc = (k) => Object.keys(p.inv).reduce((a, id) => a + (D.ITEMS[id] && D.ITEMS[id][k] ? p.inv[id] : 0), 0);
    const hpN = potc('heal'), mpN = potc('mana');
    setTxt($('bHp').querySelector('b'), String(hpN), 'hpc'); setTxt($('bMp').querySelector('b'), String(mpN), 'mpc');
    $('bHp').classList.toggle('empty', hpN <= 0); $('bMp').classList.toggle('empty', mpN <= 0);
    // 보스바
    const bb = $('bossbar'); const b = G.boss; if (b && !b.dead) { bb.style.display = 'block'; bb.querySelector('.nm').textContent = `${b.def.n}  Lv.${b.def.lv}`; bb.querySelector('i').style.width = Math.max(0, b.hp / b.maxhp * 100) + '%'; } else bb.style.display = 'none';
    // 힌트
    const h = hintText(); const he = $('hint'); if (h) { if (hc.hint !== h) { hc.hint = h; he.textContent = h; } he.style.display = 'block'; } else { he.style.display = 'none'; hc.hint = ''; }
    // NPC 표시
    for (const n of G.map.npcs) { n.mark = null; if (n.role === 'chest') { n.mark = E.qState(G, 'q9') === 'active' && !(G.p.inv.relic > 0) ? '!' : null; } else if (n.quests) { let r = 0, a = 0, w = 0; for (const q of n.quests) { const s = E.qState(G, q); if (s === 'ready') r = 1; else if (s === 'avail') a = 1; else if (s === 'active') w = 1; } n.mark = r ? '?' : a ? '!' : w ? '…' : null; } }
    // 컨텍스트 버튼
    const nb = E.nearby(G); const cb = $('bCtx'); const key = nb ? nb.type + (nb.npc ? nb.npc.id : nb.portal.id) : '';
    if (hc.ctx !== key) { hc.ctx = key; if (!nb) cb.style.display = 'none'; else { cb.style.display = 'block'; cb.textContent = nb.type === 'npc' ? `💬 ${nb.npc.n.split(' ')[0]}${nb.npc.role === 'shop' ? ' (상점)' : ''}` : `🚪 ${nb.portal.label}으로`; } }
    updateDot();
  }
  function updateDot() { const p = G.p; const n = (p.ap > 0 ? 1 : 0) + (p.sp > 0 ? 1 : 0); const d = $('dotMenu'); const v = p.ap + p.sp; d.style.display = v > 0 ? 'block' : 'none'; d.textContent = v > 9 ? '9+' : v; }
  function hintText() {
    const p = G.p, t = p.tut; if (modal.classList.contains('on')) return null;
    if (!t.move) return '◀ ▶ 버튼을 눌러 걸어 보세요!';
    if (!t.jump) return '⤴ 점프 버튼을 눌러 보세요!';
    if (G.mapId === 'perion' && !t.talk) return '💬 촌장 도란(주황 지붕집 옆)에게 다가가 대화 버튼을 눌러요';
    if (G.mapId === 'perion' && E.qState(G, 'q1') === 'active' && !t.portal) return '마을 맨 왼쪽 빛나는 문 앞에서 ▲ 를 눌러 바위산으로!';
    if (G.mapId !== 'perion' && !t.atk) return '⚔️ 공격 버튼! 꾹 누르면 연속 공격';
    if (G.mapId !== 'perion' && t.atk && !t.skill && p.mp >= 5 && p.lv <= 3) return '💥 보라색 스킬 버튼으로 강한 공격 (MP 소모)';
    if (G.mapId !== 'perion' && !t.ladder && p.lv <= 2 && G.map.ladders.length && Math.abs(p.x - G.map.ladders[0].x) < 70) return '▲▼ 로 밧줄을 탈 수 있어요 (점프로 내리기)';
    { const st2 = E.stats(G); if (!p.pet && !t.potion && p.hp < st2.maxHp * 0.5 && (p.inv.hp1 || p.inv.hp2 || p.inv.hp3 || p.inv.hp4)) return '❤️ 오른쪽 위 하트 버튼을 눌러 HP 물약을 먹어요!'; }
    return null;
  }
  function drawMini() {
    const c = $('mini').getContext('2d'), W = 260, H = 60, m = G.map, sx = W / m.w; c.clearRect(0, 0, W, H);
    c.fillStyle = 'rgba(255,255,255,.14)'; for (const pl of m.plats) { const y = 6 + (pl.y / m.h) * (H - 14); c.fillRect(pl.x * sx, y, Math.max(2, pl.w * sx), 2.6); }
    for (const pt of m.portals) { c.fillStyle = '#6ab4ff'; c.fillRect(pt.x * sx - 2, H - 16, 4, 12); }
    for (const n of m.npcs) { c.fillStyle = '#ffe36a'; c.beginPath(); c.arc(n.x * sx, 6 + ((n.y || m.plats[0].y) / m.h) * (H - 14) - 3, 3, 0, TAU); c.fill(); }
    for (const mm of G.mons) if (!mm.dead) { c.fillStyle = mm.def.boss ? '#ff2a2a' : '#ff6a6a'; c.beginPath(); c.arc(mm.x * sx, 6 + (mm.y / m.h) * (H - 14) - 3, mm.def.boss ? 5 : 2.6, 0, TAU); c.fill(); }
    c.fillStyle = '#5fff8a'; c.strokeStyle = '#000'; c.lineWidth = 1.5; c.beginPath(); c.arc(G.p.x * sx, 6 + (G.p.y / m.h) * (H - 14) - 3, 4, 0, TAU); c.fill(); c.stroke();
  }

  /* ───────── 스킬 버튼 ───────── */
  function buildSkillBtns() {
    const box = $('skills'); box.innerHTML = '';
    const list = D.SKILL_ORDER.filter((s) => D.SKILLS[s].kind !== 'passive' && (G.p.skills[s] || 0) > 0);
    for (const sid of list) {
      const s = D.SKILLS[sid]; const b = document.createElement('button'); b.className = 'rb' + (s.kind === 'buff' ? ' buff' : ''); b.dataset.sid = sid; b.innerHTML = `<span class="ic">${s.icon}</span><span class="cd"></span><span class="mp">${s.mp(G.p.skills[sid])}</span><span class="act"></span>`;
      bindBtn(b, () => { if (started && !paused) E.skill(G, sid); }); box.appendChild(b);
    }
    hc.sk = null;
  }
  function updateSkillBtns() {
    const p = G.p; for (const b of $('skills').children) { const sid = b.dataset.sid, s = D.SKILLS[sid], l = p.skills[sid] || 0; const cd = p.skCd[sid] > 0 ? Math.min(100, p.skCd[sid] / Math.max(0.5, s.cd) * 100) : 0; b.querySelector('.cd').style.height = cd + '%'; b.classList.toggle('nomp', p.mp < s.mp(l)); b.querySelector('.act').style.display = s.kind === 'buff' && p.buffs[s.buff] ? 'block' : 'none'; }
  }

  /* ───────── 조작 바인딩 ───────── */
  function bindBtn(el, down, up) {
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (x) { } el.classList.add('on'); Snd.init(); down && down(e); });
    const u = (e) => { if (el.classList.contains('on')) { el.classList.remove('on'); up && up(e); } };
    el.addEventListener('pointerup', u); el.addEventListener('pointercancel', u); el.addEventListener('lostpointercapture', u);
  }
  const padPtrs = new Map();
  function applyPad() {
    const act = { left: 0, right: 0, up: 0, down: 0 }; for (const k of padPtrs.values()) if (k) act[k] = 1;
    for (const k in act) { if (!!act[k] !== !!KEYS[k]) setKey(k, act[k]); }
    for (const el of $('pad').children) el.classList.toggle('on', !!act[el.dataset.k]);
  }
  function setKey(k, v) { KEYS[k] = v ? 1 : 0; if (!G) return; if (v && k === 'up') E.tapUp(G); G.input[k] = !!v; }
  function releaseAll() { padPtrs.clear(); applyPad(); for (const k in KEYS) { KEYS[k] = 0; if (G) G.input[k] = false; } if (G) G.input.attack = false; for (const el of document.querySelectorAll('.rb.on')) el.classList.remove('on'); }
  function initControls() {
    const pad = $('pad');
    const keyAt = (e) => { const el = document.elementFromPoint(e.clientX, e.clientY); return el && el.dataset && el.dataset.k ? el.dataset.k : null; };
    pad.addEventListener('pointerdown', (e) => { e.preventDefault(); try { pad.setPointerCapture(e.pointerId); } catch (x) { } Snd.init(); padPtrs.set(e.pointerId, keyAt(e)); applyPad(); });
    pad.addEventListener('pointermove', (e) => { if (padPtrs.has(e.pointerId)) { padPtrs.set(e.pointerId, keyAt(e)); applyPad(); } });
    const up = (e) => { padPtrs.delete(e.pointerId); applyPad(); };
    pad.addEventListener('pointerup', up); pad.addEventListener('pointercancel', up); pad.addEventListener('lostpointercapture', up);
    bindBtn($('bAtk'), () => { if (G && started && !paused) G.input.attack = true; }, () => { if (G) G.input.attack = false; });
    bindBtn($('bJump'), () => { if (G && started && !paused) E.tapJump(G); });
    bindBtn($('bHp'), () => { if (G && started && !paused) E.potion(G, 'hp'); });
    bindBtn($('bMp'), () => { if (G && started && !paused) E.potion(G, 'mp'); });
    bindBtn($('bCtx'), () => { doContext(); });
    $('bMenu').addEventListener('click', () => { Snd.init(); Snd.sfx('click'); openMenu('inv'); });
    $('bStat').addEventListener('click', () => { Snd.init(); Snd.sfx('click'); openMenu('stat'); });
    const km = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down' };
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return; const k = e.key; if (!started) return;
      if (km[k]) { e.preventDefault(); if (!KEYS[km[k]]) setKey(km[k], 1); return; }
      if (paused) { if (k === 'Escape' || k === 'i') closeModal(); return; }
      if (k === ' ' || k === 'Alt') { e.preventDefault(); if (!e.repeat) E.tapJump(G); }
      else if (k === 'z' || k === 'Z' || k === 'Control' || k === 'j') G.input.attack = true;
      else if (k >= '1' && k <= '5') { const l = D.SKILL_ORDER.filter((s) => D.SKILLS[s].kind !== 'passive' && (G.p.skills[s] || 0) > 0); if (l[+k - 1]) E.skill(G, l[+k - 1]); }
      else if (k === 'h') E.potion(G, 'hp'); else if (k === 'm') E.potion(G, 'mp');
      else if (k === 'Enter' || k === 'e') doContext(); else if (k === 'i') openMenu('inv');
    });
    window.addEventListener('keyup', (e) => { const k = e.key; if (km[k]) setKey(km[k], 0); if (k === 'z' || k === 'Z' || k === 'Control' || k === 'j') if (G) G.input.attack = false; });
    window.addEventListener('blur', releaseAll);
    document.addEventListener('visibilitychange', () => { if (document.hidden) { releaseAll(); save(); } });
    window.addEventListener('pagehide', save);
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    modal.addEventListener('click', (e) => { if (e.target === modal) { if (modal.dataset.lock) return; closeModal(); return; } const b = e.target.closest('[data-a]'); if (!b) return; Snd.sfx('click'); if (modalClick) modalClick(b.dataset.a, b); });
  }
  function doContext() {
    if (!started || paused || !G) return; const nb = E.nearby(G); if (!nb) return; releaseAll();
    if (nb.type === 'npc') openNpc(nb.npc); else E.usePortal(G, nb.portal);
  }

  /* ───────── 모달 공통 ───────── */
  function showModal(html, handler, lock) { modal.innerHTML = html; modal.dataset.lock = lock ? '1' : ''; modal.classList.add('on'); paused = true; modalClick = handler; releaseAll(); }
  function closeModal() { modal.classList.remove('on'); modal.innerHTML = ''; paused = false; modalClick = null; if (G) updateHud(true); }

  /* ───────── 아이템 설명 ───────── */
  const ico = (id, cls) => { const u = Art.itemIconUrl(id); const it = D.ITEMS[id]; return u ? `<img class="ii ${cls || ''}" src="${u}" alt="">` : it.icon; };
  const enhOf = (id, idx) => E.recOf(G, id, idx);
  const enhBadge = (id, idx) => { const o = enhOf(id, idx).ok; return o ? `<span class="en" style="color:${Art.enhColor(o)}">+${o}</span>` : ''; };
  const gscore = (id, rec) => { const it = D.ITEMS[id]; return (it.atk || 0) * 3 + (it.def || 0) * 2 + (it.hp || 0) / 10 + (it.str || 0) * 4 + (it.dex || 0) * 2 + ((rec && rec.atk) || 0) * 3 + ((rec && rec.def) || 0) * 2; };
  // 가방 장비 중 지금 낀 것보다 좋고 입을 수 있는 건 초록 ▲ 표시
  const upMark = (id, k) => { const it = D.ITEMS[id]; if (it.t !== 'equip' || !E.canWear(G, it).ok) return ''; const cur = G.p.equip[it.slot]; const cs = cur ? gscore(cur, G.p.enh && G.p.enh[cur]) : 0; return gscore(id, E.bagRecs(G, id)[k]) > cs + 0.5 ? '<span class="up">▲</span>' : ''; };
  const gname = (id, idx) => D.ITEMS[id].n + (enhOf(id, idx).ok ? ` +${enhOf(id, idx).ok}` : '');
  const gnameC = (id, idx) => { const o = enhOf(id, idx).ok; return esc(D.ITEMS[id].n) + (o ? ` <span style="color:${Art.enhColor(o)};text-shadow:0 0 6px ${Art.enhColor(o)}">+${o}</span>` : ''); };
  const SLOTN = { weapon: '무기', helmet: '투구', armor: '갑옷', gloves: '장갑', shoes: '신발' };
  function itemInfo(id, idx) {
    const it = D.ITEMS[id]; let s = `<div class="nm">${ico(id, 'mini')} ${gnameC(id, idx)}</div>`;
    if (it.t === 'equip') {
      const cur = G.p.equip[it.slot] && D.ITEMS[G.p.equip[it.slot]]; const en = enhOf(id, idx), inf = E.enhInfo(G, id, idx); const row = (k, lab) => { const v = it[k] || 0, c = cur ? (cur[k] || 0) : 0; if (!v && !c && !(en[k])) return ''; const d = v - c; return `${lab} <b>${v}</b>${en[k] ? ` <span style="color:#7aff9a">(+${en[k]} 강화)</span>` : ''}${cur && cur.id !== id && d ? ` <span style="color:${d > 0 ? '#7aff9a' : '#ff8a8a'}">(${d > 0 ? '▲' : '▼'}${Math.abs(d)})</span>` : ''}<br>`; };
      s += `<div style="color:#bda8e0">${SLOTN[it.slot]}${it.wt ? ' · ' + ({ sword: '한손검', axe: '도끼', great: '대검(양손)', mace: '둔기', spear: '창(양손)' })[it.wt] : ''}</div>`;
      { const rq = E.req(it), pp = G.p; const c = (ok) => ok ? '#cfe' : '#ff8a8a'; s += `<span style="color:${c(pp.lv >= rq.lv)}">요구 Lv ${rq.lv}</span> · <span style="color:${c(pp.str >= rq.str)}">STR ${rq.str}</span>` + (rq.dex ? ` · <span style="color:${c(pp.dex >= rq.dex)}">DEX ${rq.dex}</span>` : '') + '<br>'; } s += '' + row('atk', '공격력') + row('def', '방어력') + row('str', 'STR') + row('dex', 'DEX') + row('hp', '최대 HP');
      s += `<div style="color:#ffe08a">🔨 강화 +${inf.ok} · 남은 횟수 <b>${inf.left}/${inf.slots}</b></div>`; if (it.wt) s += `공격 속도 <b>${it.spd <= 0.45 ? '빠름' : it.spd <= 0.55 ? '보통' : '느림'}</b> · 사거리 <b>${it.rng}</b><br>`;
    }
    s += `<div style="color:#cdbbe8;margin-top:3px">${esc(it.desc || '')}</div>`; s += `<div class="price">판매가 ${fmt(E.sellPrice(it))} 메소${E.lockedQty(G, id) ? ' (진행 중 퀘스트용 ' + E.lockedQty(G, id) + '개 제외)' : ''}</div>`; return s;
  }

  /* ───────── 메뉴 ───────── */
  let menuTab = 'inv', menuSel = null, menuIdx = null;
  function openMenu(tab) {
    if (!started) return; menuTab = tab || menuTab;
    const draw = () => {
      const p = G.p;
      const tabs = [['inv', '🎒', '소지품'], ['skill', '📘', '스킬', p.sp], ['stat', '💪', '능력치', p.ap], ['quest', '📜', '퀘스트'], ['set', '⚙️', '설정']];
      const tb = tabs.map((t) => `<button data-a="tab:${t[0]}" class="${menuTab === t[0] ? 'on' : ''}">${t[1]}<br>${t[2]}${t[3] ? `<span class="badge">${t[3]}</span>` : ''}</button>`).join('');
      let c = ''; if (menuTab === 'inv') c = tabInv(); else if (menuTab === 'skill') c = tabSkill(); else if (menuTab === 'stat') c = tabStat(); else if (menuTab === 'quest') c = tabQuest(); else c = tabSet();
      const ex = document.getElementById('menu');
      if (ex) { ex.querySelector('h3 span').textContent = `${p.name} · Lv.${p.lv}   💰 ${fmt(p.meso)}`; document.getElementById('tabs').innerHTML = tb; document.getElementById('tcont').innerHTML = c; }
      else modal.innerHTML = `<div class="panel" id="menu"><h3><span>${esc(p.name)} · Lv.${p.lv}   💰 ${fmt(p.meso)}</span><button class="x" data-a="close">✕</button></h3><div class="body"><div id="tabs">${tb}</div><div id="tcont">${c}</div></div></div>`;
    };
    const handler = (a, el) => {
      const p = G.p; const [k, v, w] = a.split(':');
      if (k === 'close') { closeModal(); return; }
      if (k === 'tab') { menuTab = v; menuSel = null; menuIdx = null; document.getElementById('tcont') && (document.getElementById('tcont').scrollTop = 0); draw(); const n = document.getElementById('tcont'); if (n) n.scrollTop = 0; return; }
      if (k === 'sel') { const ix = w === undefined || w === 'e' ? null : +w; if (v === menuSel && ix === menuIdx) { menuSel = null; menuIdx = null; } else { menuSel = v; menuIdx = ix; } }
      else if (k === 'eq') { const r = E.equip(G, v, w === undefined || w === '' ? null : +w); if (!r.ok) logLine(r.msg, 'q'); else { menuSel = null; menuIdx = null; Snd.sfx('equip'); } }
      else if (k === 'un') { E.unequip(G, v); menuSel = null; menuIdx = null; }
      else if (k === 'use') { E.useItem(G, v); if (!p.inv[v]) menuSel = null; if (G.mapId === 'perion' && D.ITEMS[v].town) { closeModal(); return; } }
      else if (k === 'enh') { enhAnim(v, w); return; }
      else if (k === 'learn') { E.learn(G, v); buildSkillBtns(); }
      else if (k === 'sreset') { E.resetSkills(G); buildSkillBtns(); updateHud(true); }
      else if (k === 'stat') { E.addStat(G, v, +w || 1); }
      else if (k === 'auto') { E.autoStat(G); }
      else if (k === 'reset') { E.resetStats(G); handleEvents(); }
      else if (k === 'tog') { p.settings[v] = !p.settings[v]; if (v === 'sound') Snd.setSound(p.settings.sound); if (v === 'music') Snd.setMusic(p.settings.music); if (v === 'ytbgm') Snd.setYt(p.settings.ytbgm); }
      else if (k === 'thr') { p.settings[v] = +w; }
      else if (k === 'save') { save(); logLine('💾 저장했어요', 'i'); }
      else if (k === 'wipe') { if (el.dataset.c !== '1') { el.dataset.c = '1'; el.textContent = '정말 지울까요? 한 번 더 누르면 삭제'; return; } store.del(SAVE_KEY); started = false; location.reload(); return; }
      draw(); updateHud(true);
    };
    showModal('', handler); draw();
  }
  function tabInv() {
    const p = G.p; let s = '<div class="eqrow">';
    for (const sl of ['weapon', 'helmet', 'armor', 'gloves', 'shoes']) { const id = p.equip[sl]; const it = id && D.ITEMS[id]; s += `<div class="c"><button class="slot eq ${it ? '' : 'empty'}" ${it ? `data-a="sel:${id}:e"` : ''} style="width:100%">${it ? ico(id) : SLOTN[sl]}${it ? `<span class="lv">Lv${it.lv}</span>${enhBadge(id)}` : ''}</button>${SLOTN[sl]}</div>`; }
    s += '</div>';
    if (menuSel && D.ITEMS[menuSel]) { const id = menuSel, it = D.ITEMS[id]; const worn = menuIdx === null && p.equip[it.slot] === id; s += `<div class="card">${itemInfo(id, menuIdx)}<div class="row2" style="margin-top:7px;flex-wrap:wrap">`;
      if (it.t === 'equip') { if (worn) s += it.slot === 'weapon' ? '<span style="color:#cdbbe8">착용 중 (무기는 다른 무기로 교체해요)</span>' : `<button class="btn sm gray" data-a="un:${it.slot}">벗기</button>`; else s += `<button class="btn sm green" data-a="eq:${id}:${menuIdx === null ? '' : menuIdx}" ${!E.canWear(G, it).ok || !(p.inv[id] > 0) ? 'disabled' : ''}>착용</button>` + (E.canWear(G, it).ok ? '' : `<small style="color:#ff8a8a"> ${E.canWear(G, it).msg}</small>`); }
      if (it.t === 'use') s += `<button class="btn sm green" data-a="use:${id}">사용</button>`;
      if (it.t === 'scroll') { const tg = E.scrollTargets(G, id); s += tg.length ? tg.map((t) => `<button class="btn sm green" data-a="enh:${id}:${t.key}" ${t.left <= 0 && it.kind !== 'restore' ? 'disabled' : ''}>${t.bag ? '🎒 가방' : '착용'} ${SLOTN[t.slot]}: ${esc(D.ITEMS[t.id].n)}${t.ok ? ` <span style="color:${Art.enhColor(t.ok)}">+${t.ok}</span>` : ''} (${t.left}/${t.slots}) 에 사용</button>`).join('') : '<span style="color:#ffb86a">사용할 수 있는 장비를 착용하세요</span>'; }
      s += '<button class="btn sm gray" data-a="sel:' + id + (menuIdx === null ? '' : ':' + menuIdx) + '">닫기</button></div></div>'; }
    const ids = Object.keys(p.inv).filter((i) => D.ITEMS[i]); const order = { equip: 0, scroll: 1, use: 2, etc: 3 };
    ids.sort((a, b) => order[D.ITEMS[a].t] - order[D.ITEMS[b].t] || (D.ITEMS[a].lv || 0) - (D.ITEMS[b].lv || 0));
    if (!ids.length) s += '<div class="card" style="text-align:center;color:#cdbbe8">가방이 비었어요. 몬스터를 처치해 아이템을 모아 보세요!</div>';
    s += '<div class="grid">' + ids.map((id) => { const it = D.ITEMS[id]; if (it.t === 'equip') return E.bagRecs(G, id).map((r, k) => `<button class="slot ${menuSel === id && menuIdx === k ? 'sel' : ''}" data-a="sel:${id}:${k}">${ico(id)}${enhBadge(id, k)}${upMark(id, k)}<span class="lv ${E.canWear(G, it).ok ? '' : 'bad'}">Lv${it.lv}</span></button>`).join(''); return `<button class="slot ${menuSel === id ? 'sel' : ''}" data-a="sel:${id}">${ico(id)}<small>${p.inv[id] > 1 ? p.inv[id] : ''}</small></button>`; }).join('') + '</div>';
    return s;
  }
  function tabSkill() {
    const p = G.p; let s = `<div class="card row2"><span style="flex:1">남은 스킬 포인트 <b style="font-size:17px">${p.sp}</b> <small style="color:#cdbbe8">(총량이 스킬에 딱 맞아요)</small></span></div>`;
    if (!p.job) s += `<div class="card" style="font-size:12px">⚔️ <b>2차 전직</b>: Lv ${D.JOB_LV} + 「고대 골렘의 시련」 완료 후 마을의 교관 발도에게 가면 <b>파이터 / 페이지 / 스피어맨</b> 중 하나로 전직해요.</div>`; else s += `<div class="card" style="font-size:12px">${D.JOBS[p.job].icon} 현재 직업 <b style="color:${D.JOBS[p.job].col}">${D.JOBS[p.job].n}</b></div>`;
    for (const sid of D.SKILL_ORDER) { const k = D.SKILLS[sid], l = p.skills[sid] || 0, lock = p.lv < k.reqLv; if (k.job && k.job !== p.job) continue; s += `<div class="sk ${lock ? 'lock' : ''}"><div class="ic">${k.icon}</div><div class="t"><b>${k.n}</b> <span style="color:#ffe08a">Lv ${l}/${k.maxLv}</span>${k.kind === 'passive' ? ' <span style="color:#9fe">[패시브]</span>' : k.kind === 'buff' ? ' <span style="color:#9fe">[버프]</span>' : ''}<br>${lock ? `<span style="color:#ff8a8a">Lv ${k.reqLv} 이상부터 배울 수 있어요</span>` : esc(k.desc(Math.max(1, l)))}</div>${!lock && l < k.maxLv ? (l >= E.skillCap(G, k) ? `<small style="color:#ff8a8a">Lv ${k.reqLv + Math.ceil((l + 1 - 3) / 0.8)}<br>필요</small>` : `<button class="btn sm green" data-a="learn:${sid}" ${p.sp < 1 ? 'disabled' : ''}>＋</button>`) : ''}</div>`; }
    s += `<div class="row2"><button class="btn sm gray" data-a="sreset">스킬 초기화(무료)</button></div><div class="card" style="font-size:11px">💡 스킬 레벨은 캐릭터 레벨이 오를수록 더 올릴 수 있어요.</div>`;
    return s;
  }
  function tabStat() {
    const p = G.p, st = E.stats(G); let s = `<div class="card">남은 능력치 포인트 <b style="font-size:17px">${p.ap}</b> <small style="color:#cdbbe8">(레벨업마다 +5) · 전사는 <b>STR</b>이 제일 중요해요!</small></div>`;
    const row = (k, n, d) => `<div class="st"><span><b style="color:#fff">${n}</b> <small style="color:#cdbbe8">${d}</small></span><b>${p[k]}${st[k] !== undefined && st[k] !== p[k] ? `<small style="color:#7aff9a">(+${st[k] - p[k]})</small>` : ''}</b><button class="btn sm" data-a="stat:${k}:1" ${p.ap < 1 ? 'disabled' : ''}>＋</button><button class="btn sm" data-a="stat:${k}:5" ${p.ap < 5 ? 'disabled' : ''}>＋5</button></div>`;
    s += row('str', 'STR 힘', '공격력') + row('dex', 'DEX 민첩', '공격력(조금)·방어') + row('int', 'INT 지력', '최대 MP') + row('luk', 'LUK 행운', '치명타·드랍');
    const w = D.ITEMS[p.equip.weapon] || D.ITEMS.sw0; const WT = { sword: '한손검', axe: '도끼', great: '대검', mace: '둔기', spear: '창' };
    s += `<div class="card" style="margin-top:8px;line-height:1.7"><b style="color:#ffd24a">📊 ${esc(p.name)} · Lv.${p.lv} ${p.job ? D.JOBS[p.job].n : '전사'}</b><br>⚔️ 공격력 <b>${fmt(Math.round(st.minDmg))} ~ ${fmt(Math.round(st.maxDmg))}</b> <small style="color:#cdbbe8">(무기 공격력 ${Math.round(st.wAtk)})</small><br>🛡️ 방어력 <b>${st.def}</b> · 치명타 <b>${(st.crit * 100).toFixed(1)}%</b><br>❤️ 최대 HP <b>${fmt(st.maxHp)}</b> · 💧 최대 MP <b>${fmt(st.maxMp)}</b><br>🗡️ 무기 <b>${esc(w.n)}</b> (${WT[w.wt] || '검'}) · 공격 속도 <b>${(1 / st.spd).toFixed(1)}</b>회/초 · 사거리 <b>${st.rng}</b><br>👟 이동 속도 <b>${st.speed}</b> · 장비 보너스 STR <b>+${st.bonus.str}</b> DEX <b>+${st.bonus.dex}</b> 공격 <b>+${st.bonus.atk}</b> 방어 <b>+${st.bonus.def}</b> HP <b>+${st.bonus.hp}</b></div>`;
    s += `<div class="card" style="font-size:11px;line-height:1.6"><b>🎽 장비 요구 능력치</b> <small style="color:#cdbbe8">(기본 STR/DEX 기준)</small><br>${['weapon', 'helmet', 'armor', 'gloves', 'shoes'].map((sl) => { const id = p.equip[sl], it = id && D.ITEMS[id]; if (!it) return `${SLOTN[sl]}: -`; const rq = E.req(it); return `${SLOTN[sl]}: ${esc(it.n)} (STR ${rq.str}${rq.dex ? ' / DEX ' + rq.dex : ''})`; }).join('<br>')}</div>`;
    s += `<div class="row2"><button class="btn sm green" data-a="auto" ${p.ap < 1 ? 'disabled' : ''}>남은 포인트 전부 STR에</button><button class="btn sm gray" data-a="reset">능력치 초기화(무료)</button></div>`;
    return s;
  }
  function tabQuest() {
    const p = G.p; let s = ''; const act = [], done = [];
    for (const qid of D.QUEST_ORDER) { const st = E.qState(G, qid); if (st === 'active' || st === 'ready') act.push(qid); else if (st === 'done') done.push(qid); }
    if (!act.length) { const o = E.objective(G); s += `<div class="card">진행 중인 퀘스트가 없어요.<br><b>${esc(o.txt)}</b></div>`; }
    for (const qid of act) { const q = D.QUESTS[qid], ready = E.qState(G, qid) === 'ready'; s += `<div class="card qrow ${ready ? 'ready' : ''}"><div class="nm">${esc(q.n)} <small style="color:#cdbbe8">Lv ${q.lv}</small></div><div style="color:#cdbbe8">${esc(E.npcName(q.npc))}</div>` + E.qProg(G, qid).map((g) => `<div>${esc(g.txt)} <b>${g.cur}/${g.n}</b><div class="pbar"><i style="width:${Math.min(100, g.cur / g.n * 100)}%"></i></div></div>`).join('') + `<div style="margin-top:4px">${ready ? '✅ <b>완료! NPC에게 돌아가세요</b>' : esc(q.doing)}</div></div>`; }
    if (done.length) s += `<div class="card" style="color:#cdbbe8">완료한 퀘스트 ${done.length}/${D.QUEST_ORDER.length}: ${done.map((q) => '✔ ' + esc(D.QUESTS[q].n)).join(' · ')}</div>`;
    return s;
  }
  function tabSet() {
    const p = G.p, st = p.settings; const tg = (k, n, d) => `<div class="tog" data-a="tog:${k}"><span><b>${n}</b><br><small style="color:#cdbbe8">${d}</small></span><div class="sw ${st[k] ? 'on' : ''}"></div></div>`;
    const pct = (k, lab) => `<div class="tog"><span><b>${lab}</b></span><span>${[0.3, 0.5, 0.7].map((v) => `<button class="btn sm ${Math.abs((st[k] || 0) - v) < 0.01 ? '' : 'gray'}" data-a="thr:${k}:${v}">${Math.round(v * 100)}%</button>`).join(' ')}</span></div>`;
    let pet;
    if (!p.pet) pet = `<div class="card">🐾 <b>펫이 없어요</b><br>퀘스트 <b>'길 잃은 새끼 멧돼지'</b>(촌장 도란, Lv 5~)를 완료하면 펫이 생겨요.<br><small style="color:#cdbbe8">펫이 있으면 HP·MP가 낮아졌을 때 자동으로 물약을 먹여 줘요.</small></div>`;
    else pet = `<div class="card">🐾 <b>${esc(p.pet.n)}</b> 와 함께하는 중!</div>` + tg('auto', '펫 자동 물약', 'HP·MP가 낮아지면 펫이 자동으로 물약을 먹여 줘요') + (st.auto ? pct('autoT', '❤️ 이 이하일 때 HP 물약') + tg('autoMp', 'MP 물약도 자동', '') + (st.autoMp ? pct('autoMpT', '💧 이 이하일 때 MP 물약') : '') : '');
    const how = `<div class="card">🧪 <b>물약 쓰는 법</b><br>화면 <b>오른쪽 위 ❤️(HP)·💧(MP) 버튼</b>을 누르면 가진 물약을 먹어요. 버튼의 숫자는 남은 개수예요.<br>⌨️ 키보드: H(HP) · M(MP)<br><small style="color:#cdbbe8">자동으로 먹는 건 펫이 있어야 해요 (아래 참고)</small></div>`;
    return how + pet + `<div class="card" style="font-size:11px;color:#cdbbe8">빌드 ${BUILD}</div>` + tg('sound', '효과음', '') + tg('music', '배경음악', '') + tg('ytbgm', '🎵 페리온 원곡 BGM (유튜브)', '마을·바위산·개미굴·채석장에서 유튜브로 원곡을 틀어요. 인터넷이 필요하고, 안 들리면 화면을 한 번 터치해 보세요') +tg('shake', '화면 흔들림', '타격·보스 공격 때 화면이 흔들려요 (멀미나면 꺼 두세요)') +
      `<div class="card">🕹️ <b>조작</b>: ◀▶ 이동 · ▲ 밧줄 오르기/문 들어가기 · ▼ 밧줄 내려가기/발판 아래로(▼+점프) · ⚔️ 공격(꾹) · 보라 버튼 스킬 · ❤️💧 물약<br>⌨️ 키보드: 방향키/Space점프/Z공격/1~5스킬/H·M물약/E대화</div>` +
      `<div class="row2"><button class="btn sm" data-a="save">💾 지금 저장</button><button class="btn sm red" data-a="wipe">🗑 처음부터 다시</button></div>`;
  }

  /* ───────── 주문서 바르기 연출 ───────── */
  const SLOTN2 = { weapon: '무기', helmet: '투구', armor: '갑옷', gloves: '장갑', shoes: '신발' };
  function enhAnim(sid, slot) {
    const p = G.p, tg0 = E.resolveTarget(G, slot), gid = tg0 && tg0.id, gidx = tg0 ? tg0.idx : null, sc = D.ITEMS[sid];
    const r = E.enhance(G, sid, slot);
    if (!r.ok) { logLine(r.msg, 'q'); toastBanner(r.msg); openMenu('inv'); return; }
    // 연출이 끝날 때까지 월드 효과·소리는 미룬다
    const held = G.events.filter((e) => e.t === 'scroll'); G.events = G.events.filter((e) => !(e.t === 'scroll' || (e.t === 'sfx' && (e.n === 'questdone' || e.n === 'deny'))));
    const slotLabel = tg0.bag ? '🎒 가방 ' + SLOTN[D.ITEMS[gid].slot] : SLOTN2[tg0.slot]; const inf = E.enhInfo(G, gid, gidx), gurl = Art.itemIconUrl(gid), surl = Art.itemIconUrl(sid);
    const html = `<div class="panel" id="enhp"><h3><span>🔨 장비 강화 · ${esc(sc.n)}</span></h3><div class="stage busy"><div class="glow"></div><img class="gear" src="${gurl}" alt=""><img class="scr" src="${surl}" alt=""><div class="flash"></div></div><div class="res"><div style="color:#ffe08a;font-weight:800">${slotLabel} · ${esc(D.ITEMS[gid].n)}</div><div class="dots" style="margin-top:4px">주문서를 바르는 중</div></div><div class="btns"></div></div>`;
    showModal(html, (a) => { if (a === 'again') { enhAnim(sid, slot); } else if (a === 'back') { openMenu('inv'); } }, true);
    const root = modal.querySelector('#enhp'), stage = root.querySelector('.stage');
    Snd.sfx('scrollApply');
    const spark = (col, n, far) => { for (let i = 0; i < n; i++) { const s = document.createElement('i'); s.className = 'sp'; const ang = Math.random() * 6.283, d = (far ? 90 : 55) + Math.random() * (far ? 120 : 60); s.style.setProperty('--dx', Math.cos(ang) * d + 'px'); s.style.setProperty('--dy', Math.sin(ang) * d * 0.8 + 'px'); s.style.background = col; s.style.boxShadow = '0 0 8px ' + col; s.style.animationDelay = (Math.random() * 0.15) + 's'; stage.appendChild(s); setTimeout(() => s.remove(), 1300); } };
    let tk = 0; const ti = setInterval(() => { if (!modal.contains(root)) { clearInterval(ti); return; } spark('#ffe9a0', 2, false); Snd.sfx('tick'); if (++tk > 10) clearInterval(ti); }, 200);
    setTimeout(() => {
      if (!modal.contains(root)) return; clearInterval(ti);
      const after = E.enhInfo(G, gid, gidx);
      stage.classList.remove('busy'); stage.classList.add(r.success ? 'ok' : 'fail');
      const fl = stage.querySelector('.flash'); if (r.success) { fl.classList.add('on'); spark('#fff27a', 34, true); spark('#ffffff', 14, true); Snd.sfx('enhOk'); } else { spark('#6a6a78', 18, false); Snd.sfx('enhFail'); }
      for (const e of held) G.events.push(e); handleEvents();
      const total = r.success && sc.kind !== 'restore' ? (sc.kind === 'weapon' ? `공격력 <b style="color:#7aff9a">+${r.bonus}</b> (강화 누계 +${after.atk})` : `방어력 <b style="color:#7aff9a">+${r.bonus}</b> (강화 누계 +${after.def})`) : '';
      const again = p.inv[sid] > 0 && (sc.kind === 'restore' ? after.used > 0 : after.left > 0);
      root.querySelector('.res').innerHTML = (r.success ? `<div class="big ok">✨ ${sc.kind === 'restore' ? '복구 성공' : '강화 성공'}! ✨</div>` : `<div class="big bad">${sc.kind === 'restore' ? '복구 실패…' : '강화 실패…'}</div>`) + `<div style="color:#ffe08a;font-weight:800">${slotLabel} · ${gnameC(gid, gidx)}</div>` + (total ? `<div>${total}</div>` : '') + `<div style="color:#cdbbe8">남은 강화 횟수 <b>${after.left}/${after.slots}</b>${r.success || sc.kind === 'restore' ? '' : ' (실패해도 횟수는 줄어요)'}</div>`;
      root.querySelector('.btns').innerHTML = (again ? `<button class="btn green" data-a="again">🔨 한 번 더 바르기 (${p.inv[sid]}장)</button>` : '') + '<button class="btn gray" data-a="back">🎒 가방으로</button>';
      modal.dataset.lock = '';
    }, 2500);
  }

  /* ───────── NPC 대화 / 퀘스트 / 상점 ───────── */
  function npcPortrait(npc) { const c = modal.querySelector('canvas'); if (!c) return; const g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); g.save(); g.translate(c.width / 2, c.height - 22); g.scale(3.3, 3.3); Art.drawNpc(g, Object.assign({}, npc, { mark: null }), time, false, true); g.restore(); }
  let lastDlgOpts = [];
  function dlg(npc, text, opts) {
    lastDlgOpts = opts; // 클릭한 버튼 번호는 항상 지금 보이는 대화창의 버튼 목록 기준 (전직 확인창에서 엉뚱한 직업이 뜨던 버그 수정)
    modal.innerHTML = `<div class="panel" id="dlg"><h3><span>💬 ${esc(npc.n)}</span><button class="x" data-a="close">✕</button></h3><div class="body"><canvas width="168" height="200"></canvas><div class="txt" style="flex:1"><div>${bold(text)}</div><div class="opts">${opts.map((o, i) => `<button class="btn ${o.cls || ''}" data-a="o:${i}" ${o.dis ? 'disabled' : ''}>${o.label}</button>`).join('')}</div></div></div></div>`;
    npcPortrait(npc);
  }
  const GREET = {
    elder: ['어서 오게, 젊은 전사여. 페리온은 바위와 용기의 마을일세.', '자네 같은 인재를 기다렸네. 무엇을 도와줄까?'],
    captain: ['페리온 경비대장 레온이다. 마을 밖은 위험하니 장비를 잘 갖춰라.', '강해졌나? 훈련을 거듭해라.'],
    miner: ['여어! 채석장 광부들의 반장이야. 돌 하나는 내가 제일 잘 알지!', '곡괭이질엔 인내가 중요하다고!'],
  };
  function openNpc(npc) {
    G.p.tut.talk = 1; Snd.sfx('click'); showModal('', null);
    const ctxO = { opts: [] };
    const home = () => {
      const opts = []; let text = '';
      if (npc.role === 'quest') {
        const g = GREET[npc.look] || ['무슨 일이지?']; text = g[Math.floor(Math.random() * g.length)];
        if (npc.id === 'elder' && !G.p.quests.q1) text = '자네가 새로 온 전사 지망생인가? 환영하네!\n\n💡 **조작 안내**\n· ◀▶ 이동, ⤴ 점프, ⚔️ 공격(꾹 누르면 연속)\n· 몬스터를 잡으면 메소·아이템·경험치!\n· 마을 왼쪽 끝 **빛나는 문**에서 ▲ 를 누르면 사냥터로 가요.';
        for (const qid of npc.quests) { const s = E.qState(G, qid), q = D.QUESTS[qid];
          if (s === 'avail') opts.push({ label: `❗ ${esc(q.n)} <small>(Lv ${q.lv})</small>`, cls: '', fn: () => quest(qid) });
          else if (s === 'ready') opts.push({ label: `✅ ${esc(q.n)} — 보상 받기`, cls: 'green', fn: () => quest(qid) });
          else if (s === 'active') opts.push({ label: `📜 ${esc(q.n)} — 진행 중`, cls: 'gray', fn: () => quest(qid) });
          else if (s === 'lowlv') opts.push({ label: `🔒 ${esc(q.n)} <small>(Lv ${q.lv}부터)</small>`, cls: 'gray', dis: true });
        }
      } else if (npc.role === 'inn') {
        const cost = Math.round(G.p.lv * 4); text = `어서 오세요, 여관 '바위 베개'예요!\n푹 쉬면 HP·MP가 가득 차요.\n이용료는 **${cost} 메소**랍니다.`;
        opts.push({ label: `🛏️ 쉬기 (${cost} 메소)`, cls: 'green', fn: () => { const r = E.innHeal(G); Snd.sfx(r.ok ? 'levelup' : 'deny'); if (r.ok) { fx({ type: 'ring', x: G.p.x, y: G.p.y - 20, r: 40, col: '#9fffb0', size: 5, life: 0.7 }); dlg(npc, '푹 쉬셨나요? 몸이 가벼워졌을 거예요! 😊', [{ label: '고마워요', fn: close }]); } else dlg(npc, r.msg, [{ label: '알겠어요', fn: home }]); } });
      } else if (npc.role === 'shop') {
        text = npc.shop === 'potion' ? '어서 와요! 물약과 귀환 주문서를 팔아요.\n사냥 전엔 물약 챙기는 거 잊지 마세요!' : npc.shop === 'scroll' ? '어서 오세요, 주문서 가게예요 ✨\n여기선 **100% 주문서**만 팔아요.\n**60%**와 **10%** 주문서는 몬스터가 떨어뜨리니 사냥하며 모아 보세요!' : '크하하, 불꽃 튀는 대장간에 어서 와라!\n무기와 방어구가 있다. 레벨에 맞는 걸 골라!';
        opts.push({ label: '🛒 물건 보기 (사기·팔기)', cls: 'green', fn: () => shop(npc) });
      } else if (npc.role === 'master') {
        const cadv = E.canAdvance(G);
        if (G.p.job) text = `${D.JOBS[G.p.job].icon} 이제 어엿한 **${D.JOBS[G.p.job].n}**이로군. 계속 강해져라, 페리온의 영웅!`;
        else if (cadv.ok) { text = '때가 됐군. 레벨 30, 그리고 시련까지 통과했다.\n\n**2차 전직**을 할 수 있다. 하나를 고르면 **되돌릴 수 없으니** 신중히 골라라!\n\n' + Object.keys(D.JOBS).map((j) => `${D.JOBS[j].icon} **${D.JOBS[j].n}** — ${D.JOBS[j].desc}\n  ▸ 쓰는 무기: ${D.JOBS[j].wtn} · 기본 보너스: ${D.JOBS[j].bonus}`).join('\n\n');
          for (const j of Object.keys(D.JOBS)) opts.push({ label: `${D.JOBS[j].icon} ${D.JOBS[j].n} 되기`, cls: 'green', fn: () => dlg(npc, `정말 **${D.JOBS[j].n}**(으)로 전직하겠나?\n선택하면 바꿀 수 없다.`, [{ label: '✅ 전직한다', cls: 'green', fn: () => { const r = E.advance(G, j); if (r.ok) { handleEvents(); buildSkillBtns(); updateHud(true); save(); toastBanner(`2차 전직! ${D.JOBS[j].n}`); dlg(npc, `좋다! 오늘부터 너는 **${D.JOBS[j].n}**이다.\n스킬 탭에서 새 스킬을 배워라. (SP +3, 능력치 +5)`, [{ label: '고맙습니다!', fn: close }]); } else dlg(npc, r.msg, [{ label: '알겠어요', fn: home }]); } }, { label: '← 다시 생각', cls: 'gray', fn: home }]) });
        } else text = `나는 전사 교관 발도다.\n\n⚔️ **2차 전직**(파이터·페이지·스피어맨)은 Lv ${D.JOB_LV} + 「고대 골렘의 시련」 완료 후에 가능하다. (${cadv.msg})\n\n전사의 길은 **STR**과 장비가 전부라고 할 수 있지.\n📘 스킬은 메뉴의 **스킬** 탭에서 올려라.`;
        if (false) text = `나는 전사 교관 발도다.\n전사의 길은 **STR**과 장비가 전부라고 할 수 있지.\n\n📘 스킬은 메뉴의 **스킬** 탭에서 올려라.\n· Lv 1 파워 스트라이크 · Lv 6 슬래시 블러스트\n· Lv 10 아이언 바디 · Lv 14 분노의 함성 · Lv 20 대지 가르기\n\n⚔️ 2차 전직(파이터·페이지·스피어맨)은 Lv 30 이후 준비 중이다. 기대해라!`;
      }
      if (npc.role === 'chest') {
        const can = E.qState(G, 'q9') === 'active' && !(G.p.inv.relic > 0);
        text = can ? '꼭대기까지 올라왔군요! 상자 안에서 **고대 골렘의 인장**이 빛나고 있어요.' : (G.p.inv.relic > 0 ? '상자는 이미 비어 있어요. 인장을 교관 발도에게 가져가세요!' : '낡은 고대 상자예요. 굳게 잠겨 있어요…\n(마을의 **전사 교관 발도**에게 시련을 받으면 열 수 있어요)');
        if (can) opts.push({ label: '🗿 상자 열기', cls: 'green', fn: () => { E.takeRelic(G); handleEvents(); toastBanner('고대 골렘의 인장 획득!'); updateHud(true); closeModal(); } });
      }
      if (npc.role !== 'quest' && npc.quests) for (const qid of npc.quests) { const s = E.qState(G, qid), q = D.QUESTS[qid];
        if (s === 'avail') opts.push({ label: `❗ ${esc(q.n)} <small>(Lv ${q.lv})</small>`, fn: () => quest(qid) });
        else if (s === 'ready') opts.push({ label: `✅ ${esc(q.n)} — 보상 받기`, cls: 'green', fn: () => quest(qid) });
        else if (s === 'active') opts.push({ label: `📜 ${esc(q.n)} — 진행 중`, cls: 'gray', fn: () => quest(qid) });
        else if (s === 'lowlv') opts.push({ label: `🔒 ${esc(q.n)} <small>(Lv ${q.lv}부터)</small>`, cls: 'gray', dis: true }); }
      opts.push({ label: '닫기', cls: 'gray', fn: close }); ctxO.opts = opts; dlg(npc, text || '...', opts);
    };
    const quest = (qid) => {
      const q = D.QUESTS[qid], st = E.qState(G, qid); const opts = []; let text = '';
      const rw = q.reward; const rtxt = `🎁 보상: 경험치 ${fmt(rw.exp)} · 💰 ${fmt(rw.meso)}` + (rw.items.length ? ' · ' + rw.items.map(([id, n]) => `${D.ITEMS[id].icon}${D.ITEMS[id].n}${n > 1 ? ' x' + n : ''}`).join(', ') : '');
      const goals = E.qProg(G, qid).map((g) => `· ${g.txt} ${Math.min(g.cur, g.n)}/${g.n}`).join('\n');
      if (st === 'avail') { text = `**[${q.n}]**\n${q.ask}\n\n${goals}\n${rtxt}`; opts.push({ label: '✅ 수락한다', cls: 'green', fn: () => { E.qAccept(G, qid); toastBanner('퀘스트 수락!  ' + q.n); updateHud(true); save(); quest(qid); } }); }
      else if (st === 'active') text = `**[${q.n}]**\n${q.doing}\n\n${goals}`;
      else if (st === 'ready') { text = `**[${q.n}]**\n${q.done}\n\n${rtxt}`; opts.push({ label: '🎁 보상 받기', cls: 'green', fn: () => { E.qComplete(G, qid); handleEvents(); updateHud(true); home(); } }); }
      opts.push({ label: '← 돌아가기', cls: 'gray', fn: home }); ctxO.opts = opts; dlg(npc, text, opts);
    };
    const close = () => closeModal();
    modalClick = (a) => { if (a === 'close') { closeModal(); return; } if (a.startsWith('o:')) { const o = lastDlgOpts[+a.slice(2)]; if (o && o.fn) o.fn(); } };
    home();
  }
  function shop(npc) {
    const S = D.SHOPS[npc.shop]; let tab = 'buy', shopTab = null;
    const draw = () => {
      const p = G.p; const sc = modal.querySelector('.list') ? modal.querySelector('.list').scrollTop : 0; let list = '';
      if (tab === 'buy') {
        list = S.items.map((id) => { const it = D.ITEMS[id]; const low = it.t === 'equip' && !E.canWear(G, it).ok; const can = p.meso >= it.price; const own = p.inv[id] || 0;
          return `<div class="it"><div class="slot ${low ? 'empty' : ''}">${ico(id)}</div><div class="t"><b>${esc(it.n)}</b>${it.t === 'equip' ? ` <small style="color:${low ? '#ff8a8a' : '#9fe'}">Lv ${it.lv}${(() => { const rq = E.req(it); return ' · STR ' + rq.str + (rq.dex ? ' · DEX ' + rq.dex : ''); })()}${low ? ' 필요' : ''}</small>` : ''}${own ? ` <small style="color:#cdbbe8">(보유 ${own})</small>` : ''}<br>${it.t === 'equip' ? [it.atk ? `공격 ${it.atk}` : '', it.def ? `방어 ${it.def}` : '', it.str ? `STR+${it.str}` : '', it.hp ? `HP+${it.hp}` : ''].filter(Boolean).join(' · ') : esc(it.desc)}</div><div style="text-align:right"><div class="price">💰 ${fmt(it.price)}</div><button class="btn sm green" data-a="buy:${id}:1" ${can ? '' : 'disabled'}>구매</button>${it.t === 'use' && it.price * 10 <= p.meso ? `<button class="btn sm" data-a="buy:${id}:10">x10</button>` : ''}</div></div>`; }).join('');
      } else {
        const ids = Object.keys(p.inv).filter((i) => D.ITEMS[i]).sort((a, b) => ({ etc: 0, equip: 1, scroll: 2, use: 3 })[D.ITEMS[a].t] - ({ etc: 0, equip: 1, scroll: 2, use: 3 })[D.ITEMS[b].t]);
        list = `<div class="row2" style="margin-bottom:7px"><button class="btn sm green" data-a="sellall">🧺 기타 아이템 전부 팔기</button></div>` + (ids.length ? '' : '<div class="card" style="text-align:center">팔 물건이 없어요</div>') + ids.map((id) => { const it = D.ITEMS[id], n = p.inv[id], wi = it.t === 'equip' ? E.worstIdx(E.bagRecs(G, id)) : null; return `<div class="it"><div class="slot">${ico(id)}${enhBadge(id, wi)}</div><div class="t"><b>${esc(gname(id, wi))}</b> <small style="color:#cdbbe8">x${n}</small>${E.lockedQty(G, id) ? ` <small style="color:#ffb86a">퀘스트용 ${E.lockedQty(G, id)}개 제외</small>` : ''}<br><span class="price">개당 💰 ${fmt(E.sellPrice(it))}</span></div><div>${E.sellable(G, id) < 1 ? '' : `<button class="btn sm" data-a="sell:${id}:1">1개</button>${E.sellable(G, id) > 1 ? `<button class="btn sm" data-a="sell:${id}:${E.sellable(G, id)}">전부</button>` : ''}`}</div></div>`; }).join('');
      }
      const ex = modal.querySelector('#shop');
      if (ex) { ex.querySelector('.mesoH').textContent = `💰 ${fmt(p.meso)} 메소`; ex.querySelectorAll('.tabs2 button').forEach((b) => { b.className = 'btn sm ' + (b.dataset.a === 't:' + tab ? '' : 'gray'); }); const l2 = ex.querySelector('.list'); l2.innerHTML = list; if (shopTab !== tab) l2.scrollTop = 0; }
      else modal.innerHTML = `<div class="panel" id="shop"><h3><span>🛒 ${esc(S.n)}</span><span class="mesoH">💰 ${fmt(p.meso)} 메소</span><button class="x" data-a="close">✕</button></h3><div class="body"><div class="tabs2"><button class="btn sm ${tab === 'buy' ? '' : 'gray'}" data-a="t:buy">구매</button><button class="btn sm ${tab === 'sell' ? '' : 'gray'}" data-a="t:sell">판매</button></div><div class="list">${list}</div></div></div>`;
      shopTab = tab;
    };
    modalClick = (a) => {
      const [k, v, n] = a.split(':');
      if (k === 'close') { closeModal(); return; }
      if (k === 't') tab = v;
      else if (k === 'buy') { const r = E.buy(G, v, +n); if (!r.ok) logLine(r.msg, 'q'); }
      else if (k === 'sell') { E.sell(G, v, +n); }
      else if (k === 'sellall') { const g = E.sellAllEtc(G); if (g) logLine(`💰 ${fmt(g)} 메소에 팔았어요`, 'g'); }
      draw(); updateHud(true);
    };
    draw();
  }

  /* ───────── 사망 ───────── */
  function showDeath() {
    const lose = Math.floor(D.expToNext(G.p.lv) * 0.08);
    showModal(`<div class="panel" id="death"><h2>💀 쓰러졌어요…</h2><p style="font-size:13px;line-height:1.5">괜찮아요, 전사는 다시 일어나요!<br>경험치가 조금(${fmt(lose)}) 줄고, 페리온 마을에서 부활해요.<br><small style="color:#cdbbe8">💡 물약을 더 챙기거나 '아이언 바디'를 써 보세요</small></p><button class="btn" data-a="rev" style="width:100%;min-height:50px;font-size:16px">⚔️ 마을에서 부활</button></div>`, (a) => { if (a === 'rev') { E.respawn(G); closeModal(); handleEvents(); doFade(); updateHud(true); save(); } }, true);
  }

  /* ───────── 렌더 ───────── */
  function render(dt) {
    const c = ctx; c.setTransform(view.k, 0, 0, view.k, 0, 0);
    if (!G) { c.fillStyle = '#000'; c.fillRect(0, 0, view.vw, VH); return; }
    const VW = view.vw, m = G.map, p = G.p;
    // 카메라
    const EM = 120; const tx = Math.max(-EM, Math.min(Math.max(-EM, m.w - VW + EM), p.x + p.face * 30 - VW / 2)), ty = Math.max(0, Math.min(Math.max(0, m.h - VH), p.y - VH * 0.6));
    if (!started) { cam.x = (Math.sin(time * 0.06) * 0.5 + 0.5) * Math.max(0, m.w - VW); cam.y = Math.max(0, m.h - VH); }
    else { const k = Math.min(1, dt * 6), ky = Math.min(1, dt * 2.5); cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * ky; }
    const sh = G.shake > 0 && p.settings.shake !== false ? G.shake : 0; const ox = sh ? (Math.random() - 0.5) * sh : 0, oy = sh ? (Math.random() - 0.5) * sh * 0.7 : 0;
    const cx = Math.round(cam.x), cy = Math.round(cam.y);
    Art.drawBg(c, bg, cx, cy, VW, VH, time);
    c.save(); c.translate(-cx + ox, -cy + oy);
    { const sx = Math.max(0, cx), ex = Math.min(m.w, cx + VW), hh = Math.min(VH, fore.height - cy); if (ex > sx) c.drawImage(fore, sx, cy, ex - sx, hh, sx, cy, ex - sx, hh);
      const T = Art.THEMES[m.theme] || Art.THEMES.rock; const wall = (x0, x1) => { const g2 = c.createLinearGradient(x0, 0, x1, 0); g2.addColorStop(0, Art.shade(T.rock, -0.55)); g2.addColorStop(1, Art.shade(T.rock, -0.15)); c.fillStyle = g2; c.fillRect(Math.min(x0, x1), cy, Math.abs(x1 - x0), VH); c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(Math.min(x0, x1), cy, Math.abs(x1 - x0), VH); };
      if (cx < 0) { wall(cx - 2, 0); c.fillStyle = '#1a1210'; c.fillRect(-4, cy, 4, VH); } if (cx + VW > m.w) { wall(m.w + 200, m.w); c.fillStyle = '#1a1210'; c.fillRect(m.w, cy, 4, VH); } }
    const vis = (x, r) => x > cx - r && x < cx + VW + r;
    const nb = started ? E.nearby(G) : null; const gy = m.plats[0].y;
    for (const pt of m.portals) if (vis(pt.x, 80)) Art.drawPortal(c, { x: pt.x, y: gy, label: pt.label, lv: pt.lv, col: pt.col }, time, nb && nb.portal === pt);
    for (const n of m.npcs) if (vis(n.x, 80)) { c.save(); c.translate(n.x, n.y || gy); Art.drawNpc(c, n, time, nb && nb.npc === n); c.restore(); }
    for (const d of G.drops) if (vis(d.x, 30)) Art.drawDrop(c, d, time);
    for (const z of G.zones) Art.drawZone(c, z, time);
    for (const mm of G.mons) { if (!vis(mm.x, 160)) continue; c.save(); c.translate(mm.x, mm.y); Art.drawMon(c, mm, time); c.restore(); }
    if (p.buffs.def || p.buffs.atk) drawAura(c, p);
    if (p.pet && !p.dead) { const pp = petState; c.save(); c.translate(pp.x, pp.y); Art.drawPet(c, time, pp.face, pp.moving, pp.cheer > 0); c.restore(); if (pp.cheer > 0) { c.font = '14px sans-serif'; c.textAlign = 'center'; c.fillText('💖', pp.x, pp.y - 34 - (0.8 - pp.cheer) * 14); } }
    if (p.dead) Art.drawGrave(c, p.x, p.y, time); else { c.save(); c.translate(p.x, p.y); ellShadow(c, p); Art.drawPlayer(c, G, time); c.restore(); }
    // 떨어지는 불덩이(자쿰)는 떨어질 자리에 붉은 경고 표시
    for (const q of G.proj) if (q.kind === 'fire' && q.warn) { const gy = q.gy; if (q.y < gy) { const k = 0.35 + 0.25 * Math.sin(time * 20); c.save(); c.globalAlpha = k; c.fillStyle = '#ff3a2a'; c.beginPath(); c.ellipse(q.x, gy, 18, 5, 0, 0, TAU); c.fill(); c.globalAlpha = k * 0.8; c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.stroke(); c.restore(); } }
    for (const q of G.proj) if (q.delay === undefined || q.delay <= 0) Art.drawProj(c, q, time);
    // 몬스터 HP바
    for (const mm of G.mons) { if (mm.dead || mm.def.boss || !(mm.hit > 0) || mm.hp >= mm.maxhp || mm.prov <= 0) continue; const w = 38, x = mm.x - w / 2, y = mm.y - mm.def.h - 12; c.fillStyle = 'rgba(0,0,0,.7)'; c.fillRect(x - 1.5, y - 1.5, w + 3, 7); c.fillStyle = '#ff4a5a'; c.fillRect(x, y, w * mm.hp / mm.maxhp, 4); c.font = 'bold 9px sans-serif'; c.textAlign = 'center'; c.fillStyle = '#fff'; c.strokeStyle = '#000'; c.lineWidth = 2.4; const nm = `Lv.${mm.def.lv} ${mm.def.n}`; c.strokeText(nm, mm.x, y - 3); c.fillText(nm, mm.x, y - 3); }
    drawFx(c);
    c.restore();
    // 어둠
    const th = m.theme, dk = ({ cave: 0.5, cave2: 0.6, temple: 0.42, forest: 0.18 })[th];
    if (dk) { const sx = p.x - cx, sy = p.y - 20 - cy; const g = c.createRadialGradient(sx, sy, 40, sx, sy, 270); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(6,2,14,${dk})`); c.fillStyle = g; c.fillRect(0, 0, VW, VH); }
    if (p.hp < G.p.hp * 0 + 1 || (started && p.hp < E.stats(G).maxHp * 0.25 && !p.dead)) { const a = 0.12 + Math.sin(time * 6) * 0.05; const g = c.createRadialGradient(VW / 2, VH / 2, VH * 0.35, VW / 2, VH / 2, VW * 0.6); g.addColorStop(0, 'rgba(255,0,0,0)'); g.addColorStop(1, `rgba(255,20,30,${a * 2.2})`); c.fillStyle = g; c.fillRect(0, 0, VW, VH); }
  }
  function ellShadow(c, p) { c.beginPath(); c.ellipse(0, 0, 12, 3.4, 0, 0, TAU); c.fillStyle = 'rgba(0,0,0,.3)'; c.fill(); }
  function drawAura(c, p) {
    c.save(); c.translate(p.x, p.y - 20);
    if (p.buffs.def) { const g = c.createRadialGradient(0, 0, 6, 0, 0, 36); g.addColorStop(0, 'rgba(120,210,255,0)'); g.addColorStop(0.75, 'rgba(120,210,255,.28)'); g.addColorStop(1, 'rgba(160,230,255,.6)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 36, 0, TAU); c.fill(); }
    if (p.buffs.atk) { c.globalAlpha = 0.6; for (let i = 0; i < 4; i++) { const a = time * 3 + i * 1.57; c.fillStyle = i % 2 ? '#ff9a4a' : '#ff4a3a'; c.beginPath(); c.ellipse(Math.cos(a) * 18, 14 - ((time * 40 + i * 20) % 50), 3, 7, 0, 0, TAU); c.fill(); } }
    c.restore();
  }

  /* ───────── 메인 루프 ───────── */
  let lw = 0, lh = 0;
  if (/[?&]debug/.test(location.search)) window.__pw = { G: () => G, E: E, openMenu: (t) => openMenu(t), onMap: () => onMap(), interact: () => doContext() }; // 점검용 (?debug 주소에서만)
  function frame(now) {
    if (window.innerWidth !== lw || window.innerHeight !== lh || !view.s) { lw = window.innerWidth; lh = window.innerHeight; if (lw > 0 && lh > 0) layout(); else return; }
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now; time += dt;
    if (G) {
      if (started && !paused) {
        E.step(G, dt); handleEvents();
        const p = G.p; if (p.climb) p.tut.ladder = 1; if (!p.tut.move && Math.abs(p.x - 330) > 100 && G.mapId === 'perion') p.tut.move = 1; if (G.mapId !== 'perion') p.tut.move = 1;
        if (p.dead) { deathT -= dt; if (deathT <= 0 && !shownDeath) { shownDeath = true; showDeath(); } }
        hudT -= dt; if (hudT <= 0) { hudT = 0.1; updateHud(); updateSkillBtns(); }
        miniT -= dt; if (miniT <= 0) { miniT = 0.15; drawMini(); }
        saveT += dt; if (saveT > 15) { saveT = 0; save(); }
      } else if (!started) { G.t += dt; }
      updateFx(dt); if (started) updatePet(dt);
      if (G.p.buffs.atk && Math.random() < dt * 14) fx({ type: 'spark', x: G.p.x + (Math.random() - 0.5) * 16, y: G.p.y - 10, vx: 0, vy: -50, life: 0.5, col: '#ff8a4a', size: 2.4 });
    }
    if (!(started && paused) || dirty) { render(dt); dirty = false; }
  }
  let rafOk = false, lastRaf = 0;
  let errRun = 0, errShown = false;
  // 한 프레임에서 예외가 나도 게임이 멈추지 않도록 보호 (예전엔 예외 한 번에 화면이 얼어붙었음)
  function loop(now) { rafOk = true; lastRaf = performance.now(); try { frame(now); errRun = 0; } catch (e) { errRun++; if (window.console) console.error(e); if (errRun === 3 && !errShown) { errShown = true; try { save(); toastBanner('오류가 났어요. 앱을 다시 열어 주세요 (저장은 됐어요)'); } catch (e2) {} } } requestAnimationFrame(loop); }
  setInterval(() => { const n = performance.now(); if (n - lastRaf > 200) { lastRaf = n - 16; frame(n); } }, 33);

  /* ───────── 시작 ───────── */
  function startGame(isNew) {
    const name = ($('nameIn').value || '전사').trim().slice(0, 8) || '전사';
    const sv = isNew ? null : loadSave();
    if (isNew) store.del(SAVE_KEY);
    G = E.newGame(sv ? sv.name : name, undefined, sv); if (sv) E.fixSp(G); started = true; paused = false; Snd.init(); Snd.setSound(G.p.settings.sound); Snd.setMusic(G.p.settings.music); if (G.p.settings.ytbgm === undefined) G.p.settings.ytbgm = true; Snd.setYt(G.p.settings.ytbgm);
    $('title').classList.add('hidden'); $('hud').classList.remove('hidden'); $('ctl').classList.remove('hidden');
    if (!sv) { G.p.name = name; }
    onMap(); buildSkillBtns(); updateHud(true); hc.sk = null;
    if (isNew) { showModal(`<div class="panel" id="dlg"><h3><span>📖 프롤로그</span></h3><div class="body"><div class="txt"><div>바위와 용기의 마을 <b>페리온</b>.\n이곳은 수많은 전사가 첫걸음을 내딛은 곳이에요.\n\n오늘, 새로운 전사 <b>${esc(name)}</b>의 모험이 시작됩니다!\n\n⚔️ 사냥하고, 레벨을 올리고, 장비를 갖춰\n페리온의 위협 <b>고목 대장</b>과 <b>바위왕 골렘</b>을 쓰러뜨리세요.</div><div class="opts"><button class="btn green" data-a="go" style="min-height:52px;font-size:16px">모험 시작!</button></div></div></div></div>`, (a) => { if (a === 'go') closeModal(); }, true); }
    else { logLine(`다시 만나서 반가워요, ${G.p.name}!`, 'i'); showNews(); }
  }
  // 업데이트 소식: 새 소식 번호가 바뀌면 한 번만 보여 준다 (소식을 고칠 땐 NEWS_ID 도 올릴 것)
  const NEWS_ID = 'n2';
  const NEWS = ['🏹 <b>2차 전직</b> 추가 — 파이터(검·양손검) / 페이지(도끼·둔기) / 스피어맨(창). Lv30 + 시련 완료 후 교관 발도에게!', '🔥 <b>불꽃 협곡</b>(Lv29~36)과 보스 <b>자쿰</b>, 전설의 <b>자쿰의 투구</b>. 채석장 오른쪽 주황 포탈로!', '📜 퀘스트 32개로 늘었어요. 둔기·창 무기와 Lv30+ 장비도 얻을 수 있어요.', '💪 장비는 이제 STR/DEX도 필요해요. 오른쪽 위 <b>📊</b>에서 능력치를 확인하세요.', '🧩 스킬 포인트가 딱 맞게 바뀌었어요 (스킬 레벨은 캐릭터 레벨에 따라 열려요). 스킬 초기화는 무료!', '🐾 펫이 있으면 근처 아이템을 대신 주워 줘요.'];
  function showNews() {
    let seen = null; try { seen = localStorage.getItem('pw.news'); } catch (e) {} if (seen === NEWS_ID) return;
    try { localStorage.setItem('pw.news', NEWS_ID); } catch (e) {}
    showModal(`<div class="panel" id="dlg"><h3><span>🆕 업데이트 소식</span><button class="x" data-a="close">✕</button></h3><div class="body"><div class="txt">${NEWS.map((t) => '<div style="margin-bottom:6px">' + t + '</div>').join('')}</div><div class="opts"><button class="btn green" data-a="close">확인</button></div></div></div>`, (a) => { if (a === 'close') closeModal(); });
  }
  function init() {
    layout(); initControls(); setTimeout(layout, 400); setTimeout(layout, 1500);
    G = E.newGame('데모', 7); G.p.x = 700; onMap();
    const sv = loadSave(); $('bCont').style.display = sv ? '' : 'none'; if (sv) $('nameIn').value = sv.name;
    $('bNew').addEventListener('click', () => { if (loadSave() && !confirm('저장된 모험이 지워져요. 새로 시작할까요?')) return; Snd.init(); startGame(true); });
    $('bCont').addEventListener('click', () => { Snd.init(); startGame(false); });
    requestAnimationFrame(loop);
  }
  window.__pw = { get G() { return G; }, E, D, Art, Snd, get started() { return started; }, get paused() { return paused; }, openMenu, openNpc, doContext, start: startGame, cam, view, fx: () => fxs.length, save, KEYS };
  init();
})();
