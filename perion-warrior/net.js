/* 페리온 전사 — 친구와 함께 (베타): 서버 없이 WebRTC(P2P)로 방 코드를 나눠 같은 맵에서 서로 보고 채팅한다.
   - 연결 중개만 공개 PeerJS 서버를 쓰고, 게임 데이터(이름·위치·장비 모양·채팅)는 친구끼리 직접 오간다.
   - 사냥·드랍·경험치는 각자 따로 진행된다(몬스터는 공유하지 않음).
   - PeerJS 라이브러리는 이 기능을 처음 쓸 때만 불러온다. */
(function (root) {
  'use strict';
  const N = { status: 'off', code: null, role: null, peer: null, conns: [], others: {}, myId: null, err: '', onChange: null, onChat: null, bubbles: {}, _acc: 0 };
  const LIB = 'https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js', PFX = 'pwar-', MAXG = 3;
  const rid = () => Math.random().toString(36).slice(2, 8);
  const genCode = () => { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 5; i++) s += A[Math.floor(Math.random() * A.length)]; return s; };
  function change(st, err) { if (st) N.status = st; N.err = err || ''; if (N.onChange) try { N.onChange(); } catch (e) { } }
  function loadLib(cb) {
    if (root.Peer) return cb(); const s = document.createElement('script'); s.src = LIB; s.onload = () => cb(); s.onerror = () => cb(new Error('lib')); document.head.appendChild(s);
  }
  const send = (c, m) => { try { if (c && c.open) c.send(m); } catch (e) { } };
  function bcast(m, except) { for (const c of N.conns) if (c !== except) send(c, m); }
  // 받은 메시지 처리 (테스트에서도 직접 호출)
  N.recv = function (m, from) {
    if (!m || !m.k || (m.id && m.id === N.myId)) return;
    if (m.k === 's') { const o = N.others[m.id] || (N.others[m.id] = { id: m.id, x: m.x, y: m.y }); const keep = { x: o.x, y: o.y }; Object.assign(o, m); o.tx = m.x; o.ty = m.y; if (o.m !== undefined && keep.x !== undefined) { o.x = keep.x; o.y = keep.y; } o.seen = Date.now(); }
    else if (m.k === 'c') { N.bubbles[m.id] = { text: String(m.text).slice(0, 60), until: Date.now() + 5000 }; if (N.onChat) N.onChat(m.n, String(m.text).slice(0, 60), m.id); }
    else if (m.k === 'bye') { delete N.others[m.id]; delete N.bubbles[m.id]; change(); }
    if (N.role === 'host' && from) bcast(m, from);
  };
  function wire(conn) {
    conn.on('data', (m) => { if (m && m.k && m.id && !conn._pid) conn._pid = m.id; N.recv(m, N.role === 'host' ? conn : null); });
    conn.on('close', () => { N.conns = N.conns.filter((c) => c !== conn); if (conn._pid) { delete N.others[conn._pid]; if (N.role === 'host') bcast({ k: 'bye', id: conn._pid }); } if (N.role === 'guest') { N.leave(true); change('off', '방이 닫혔어요'); } else change(); });
  }
  N.host = function (cb) {
    if (N.status !== 'off') return cb && cb(false); change('connecting');
    loadLib((e) => {
      if (e) { change('off', '네트워크 라이브러리를 불러오지 못했어요 (인터넷 연결 확인)'); return cb && cb(false); }
      const code = genCode(); const peer = new root.Peer(PFX + code); N.peer = peer; N.role = 'host'; N.myId = rid(); let done = false;
      peer.on('open', () => { N.code = code; done = true; change('on'); cb && cb(true); });
      peer.on('connection', (conn) => { conn.on('open', () => { if (N.conns.length >= MAXG) { send(conn, { k: 'full' }); setTimeout(() => { try { conn.close(); } catch (x) { } }, 300); return; } N.conns.push(conn); wire(conn); change(); }); });
      peer.on('error', (er) => { if (!done) { N.leave(true); change('off', er && er.type === 'unavailable-id' ? '코드가 겹쳤어요. 다시 시도해 주세요' : '방을 만들지 못했어요'); cb && cb(false); } });
    });
  };
  N.join = function (code, cb) {
    code = String(code || '').trim().toUpperCase(); if (N.status !== 'off') return cb && cb(false); if (code.length < 4) { change('off', '방 코드를 입력해 주세요'); return cb && cb(false); } change('connecting');
    loadLib((e) => {
      if (e) { change('off', '네트워크 라이브러리를 불러오지 못했어요 (인터넷 연결 확인)'); return cb && cb(false); }
      const peer = new root.Peer(); N.peer = peer; N.role = 'guest'; N.myId = rid(); let done = false; const fail = (msg) => { if (done) return; done = true; N.leave(true); change('off', msg); cb && cb(false); };
      const to = setTimeout(() => fail('연결 시간이 지났어요. 코드를 확인해 주세요'), 12000);
      peer.on('open', () => { const conn = peer.connect(PFX + code, { reliable: true }); conn.on('open', () => { if (done) return; done = true; clearTimeout(to); N.code = code; N.conns = [conn]; wire(conn); change('on'); cb && cb(true); }); conn.on('data', (m) => { if (m && m.k === 'full') { fail('방이 가득 찼어요 (최대 4명)'); } }); });
      peer.on('error', () => { clearTimeout(to); fail('방을 찾지 못했어요. 코드를 확인해 주세요'); });
    });
  };
  N.leave = function (silent) {
    try { bcast({ k: 'bye', id: N.myId }); } catch (e) { } try { if (N.peer) N.peer.destroy(); } catch (e) { }
    N.peer = null; N.conns = []; N.others = {}; N.bubbles = {}; N.code = null; N.role = null; N.status = 'off'; if (!silent) change('off');
  };
  N.say = function (G, text) { text = String(text || '').trim().slice(0, 60); if (!text || N.status !== 'on') return; const p = G.p, m = { k: 'c', id: N.myId, n: p.name, text }; N.bubbles[N.myId] = { text, until: Date.now() + 5000 }; bcast(m); };
  // 내 상태를 0.1초마다 보낸다
  N.tick = function (G, dt) {
    if (N.status !== 'on') return; N._acc += dt; const now = Date.now();
    for (const id in N.others) if (now - (N.others[id].seen || 0) > 6000) delete N.others[id];
    if (N._acc < 0.1) return; N._acc = 0; const p = G.p; const eq = p.equip || {};
    bcast({ k: 's', id: N.myId, n: p.name, m: G.mapId, x: Math.round(p.x), y: Math.round(p.y), f: p.face, lv: p.lv, j: (root.Engine && root.Engine.jobName) ? root.Engine.jobName(p) : '', eq: { weapon: eq.weapon, armor: eq.armor, helmet: eq.helmet, gloves: eq.gloves, shoes: eq.shoes }, w: Math.round(p.walkT * 100) / 100, mv: Math.abs(p.vx) > 18 && p.onGround ? 1 : 0, air: !p.onGround && !p.climb ? 1 : 0, cl: p.climb ? 1 : 0, at: p.atk ? { k: p.atk.kind, t: Math.round(p.atk.t * 100) / 100, d: p.atk.dur, c: p.atk.combo || 0, f: p.atk.face } : 0 });
  };
  N.list = function () { return Object.values(N.others); };
  // 같은 맵의 친구를 그린다 (이름표·말풍선 포함)
  N.draw = function (c, G, time, Art) {
    if (N.status !== 'on') return; const now = Date.now();
    for (const id in N.others) { const o = N.others[id]; if (o.m !== G.mapId) continue; o.x += (o.tx - o.x) * 0.35; o.y += (o.ty - o.y) * 0.35;
      const fake = { p: { equip: o.eq || {}, enh: {}, face: o.f || 1, walkT: o.w || 0, vx: o.mv ? 100 : 0, onGround: !o.air, climb: !!o.cl, climbT: 0, atk: o.at ? { kind: o.at.k, t: o.at.t, dur: o.at.d, combo: o.at.c, face: o.at.f } : null, hitFlash: 0, inv_t: 0, dead: false } };
      c.save(); c.translate(o.x, o.y); c.globalAlpha = 0.95; try { Art.drawPlayer(c, fake, time); } catch (e) { }
      c.globalAlpha = 1; c.font = 'bold 10px sans-serif'; c.textAlign = 'center'; const tag = `${o.n || '?'} Lv.${o.lv || '?'}`; c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.75)'; c.strokeText(tag, 0, 12); c.fillStyle = '#b8ffd0'; c.fillText(tag, 0, 12);
      const b = N.bubbles[id]; if (b && b.until > now) { c.font = '11px sans-serif'; const w = Math.min(130, c.measureText(b.text).width + 14); c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); if (c.roundRect) c.roundRect(-w / 2, -76, w, 18, 8); else c.rect(-w / 2, -76, w, 18); c.fill(); c.fillStyle = '#2a1d14'; c.fillText(b.text, 0, -63); }
      c.restore(); }
  };
  root.Net = N;
})(typeof window !== 'undefined' ? window : globalThis);
